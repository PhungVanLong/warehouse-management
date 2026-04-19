package hoshimoto.cdtn.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hoshimoto.cdtn.dto.GoodsReceiptDetailResponse;
import hoshimoto.cdtn.dto.GoodsReceiptResponse;
import hoshimoto.cdtn.dto.LocationSuggestionResponse;
import hoshimoto.cdtn.dto.request.GoodsReceiptDetailRequest;
import hoshimoto.cdtn.dto.request.GoodsReceiptRequest;
import hoshimoto.cdtn.entity.Customer;
import hoshimoto.cdtn.entity.Enum.DocStatus;
import hoshimoto.cdtn.entity.GoodsReceipt;
import hoshimoto.cdtn.entity.GoodsReceiptDetail;
import hoshimoto.cdtn.entity.InventoryBalance;
import hoshimoto.cdtn.entity.Item;
import hoshimoto.cdtn.entity.ItemLocation;
import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.repository.CustomerRepository;
import hoshimoto.cdtn.repository.GoodsReceiptDetailRepository;
import hoshimoto.cdtn.repository.GoodsReceiptRepository;
import hoshimoto.cdtn.repository.InventoryBalanceRepository;
import hoshimoto.cdtn.repository.ItemLocationRepository;
import hoshimoto.cdtn.repository.ItemRepository;
import hoshimoto.cdtn.repository.LocationRepository;

@Service
public class GoodsReceiptService {

    @Autowired private GoodsReceiptRepository receiptRepository;
    @Autowired private GoodsReceiptDetailRepository detailRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private ItemLocationRepository itemLocationRepository;
    @Autowired private InventoryBalanceRepository inventoryBalanceRepository;
    @Autowired private CustomerRepository customerRepository;

    // ───────────────────────── CRUD ─────────────────────────

    public List<GoodsReceiptResponse> getAll() {
        return receiptRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GoodsReceiptResponse getById(Long id) {
        GoodsReceipt receipt = findOrThrow(id);
        return toResponse(receipt);
    }

    /**
     * Tạo phiếu nhập nháp (DRAFT).
     * FE gửi danh sách chi tiết kèm locationId đã chọn từ gợi ý.
     */
    @Transactional
    public GoodsReceiptResponse createDraft(GoodsReceiptRequest request) {
        if (receiptRepository.findByDocno(request.getDocno()).isPresent()) {
            throw new RuntimeException("Mã phiếu '" + request.getDocno() + "' đã tồn tại");
        }

        GoodsReceipt receipt = new GoodsReceipt();
        applyHeader(receipt, request);
        receipt.setDocstatus(DocStatus.DRAFT);
        receipt = receiptRepository.save(receipt);

        saveDetails(receipt, request.getDetails());
        return toResponse(receipt);
    }

    /**
     * Cập nhật phiếu nháp (chỉ được sửa khi trạng thái DRAFT).
     */
    @Transactional
    public GoodsReceiptResponse updateDraft(Long id, GoodsReceiptRequest request) {
        GoodsReceipt receipt = findOrThrow(id);
        requireStatus(receipt, DocStatus.DRAFT, "Chỉ có thể sửa phiếu ở trạng thái DRAFT");

        applyHeader(receipt, request);
        receipt.setModifiedAt(LocalDateTime.now());
        receipt = receiptRepository.save(receipt);

        detailRepository.deleteByGoodsReceiptId(id);
        saveDetails(receipt, request.getDetails());
        return toResponse(receipt);
    }

    /**
     * Xác nhận phiếu nhập kho.
     * Cập nhật ItemLocation và InventoryBalance theo từng dòng chi tiết.
     */
    @Transactional
    public GoodsReceiptResponse confirm(Long id) {
        GoodsReceipt receipt = findOrThrow(id);
        requireStatus(receipt, DocStatus.DRAFT, "Chỉ có thể xác nhận phiếu ở trạng thái DRAFT");

        List<GoodsReceiptDetail> details = detailRepository.findByGoodsReceiptId(id);

        for (GoodsReceiptDetail detail : details) {
            if (detail.getLocation() == null) {
                throw new RuntimeException(
                        "Dòng chi tiết với mã hàng '" + detail.getItemcode() + "' chưa được gán vị trí");
            }

            Item item = detail.getItem();
            Location location = detail.getLocation();
            BigDecimal qty = detail.getQuantity();

            // Cập nhật ItemLocation
            ItemLocation il = itemLocationRepository
                    .findByItemIdAndLocationId(item.getId(), location.getId())
                    .orElseGet(() -> {
                        ItemLocation newIl = new ItemLocation();
                        newIl.setItem(item);
                        newIl.setLocation(location);
                        newIl.setQuantity(BigDecimal.ZERO);
                        newIl.setIsActive(true);
                        return newIl;
                    });

            il.setQuantity(il.getQuantity().add(qty));
            il.setIsActive(true);
            itemLocationRepository.save(il);

            // Cập nhật InventoryBalance
            InventoryBalance balance = inventoryBalanceRepository
                    .findByItemId(item.getId())
                    .orElseGet(() -> {
                        InventoryBalance b = new InventoryBalance();
                        b.setItemId(item.getId());
                        b.setQuantity(BigDecimal.ZERO);
                        return b;
                    });

            balance.setQuantity(balance.getQuantity().add(qty));
            balance.setLastUpdated(LocalDateTime.now());
            inventoryBalanceRepository.save(balance);
        }

        receipt.setDocstatus(DocStatus.CONFIRMED);
        receipt.setModifiedAt(LocalDateTime.now());
        receiptRepository.save(receipt);
        return toResponse(receipt);
    }

    /**
     * Hủy phiếu nhập (chỉ DRAFT mới hủy được).
     */
    @Transactional
    public GoodsReceiptResponse cancel(Long id) {
        GoodsReceipt receipt = findOrThrow(id);
        requireStatus(receipt, DocStatus.DRAFT, "Chỉ có thể hủy phiếu ở trạng thái DRAFT");
        receipt.setDocstatus(DocStatus.CANCELLED);
        receipt.setModifiedAt(LocalDateTime.now());
        receiptRepository.save(receipt);
        return toResponse(receipt);
    }

    // ───────────────────────── LOCATION SUGGESTION ─────────────────────────

    /**
     * Gợi ý vị trí phù hợp khi nhập hàng.
     * 1. Ưu tiên vị trí đã chứa cùng item và còn chỗ (type = EXISTING)
     * 2. Sau đó đến vị trí hoàn toàn trống (type = EMPTY)
     */
    public List<LocationSuggestionResponse> suggestLocations(Long itemId, BigDecimal quantity) {
        List<LocationSuggestionResponse> result = new ArrayList<>();

        // Vị trí đang chứa item, còn chỗ
        List<ItemLocation> existing = itemLocationRepository.findLocationsWithSpaceForItem(itemId);
        for (ItemLocation il : existing) {
            Location loc = il.getLocation();
            BigDecimal currentQty = il.getQuantity();
            BigDecimal available = BigDecimal.valueOf(loc.getCapacity()).subtract(currentQty);
            result.add(new LocationSuggestionResponse(
                    loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                    loc.getCapacity(), currentQty, available, "EXISTING"));
        }

        // Vị trí trống hoàn toàn
        List<Location> emptyLocs = locationRepository.findEmptyLocationsWithCapacity(quantity);
        for (Location loc : emptyLocs) {
            BigDecimal available = BigDecimal.valueOf(loc.getCapacity());
            result.add(new LocationSuggestionResponse(
                    loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                    loc.getCapacity(), BigDecimal.ZERO, available, "EMPTY"));
        }

        return result;
    }

    // ───────────────────────── PRIVATE HELPERS ─────────────────────────

    private void applyHeader(GoodsReceipt receipt, GoodsReceiptRequest request) {
        receipt.setDocno(request.getDocno());
        receipt.setDocDate(request.getDocDate());
        receipt.setDescription(request.getDescription());
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng id: " + request.getCustomerId()));
            receipt.setCustomer(customer);
        }
    }

    private void saveDetails(GoodsReceipt receipt, List<GoodsReceiptDetailRequest> detailRequests) {
        if (detailRequests == null) return;
        for (GoodsReceiptDetailRequest req : detailRequests) {
            Item item = itemRepository.findById(req.getItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa id: " + req.getItemId()));

            GoodsReceiptDetail detail = new GoodsReceiptDetail();
            detail.setGoodsReceipt(receipt);
            detail.setItem(item);
            detail.setItemcode(item.getItemcode());
            detail.setItemname(item.getItemname());
            detail.setUnitof(item.getUnitof());
            detail.setQuantity(req.getQuantity());
            detail.setUnitprice(req.getUnitprice() != null ? req.getUnitprice() : BigDecimal.ZERO);
            detail.setAmount(detail.getQuantity().multiply(detail.getUnitprice()));

            if (req.getLocationId() != null) {
                Location location = locationRepository.findById(req.getLocationId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy vị trí id: " + req.getLocationId()));
                detail.setLocation(location);
            }

            detailRepository.save(detail);
        }
    }

    private GoodsReceipt findOrThrow(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập id: " + id));
    }

    private void requireStatus(GoodsReceipt receipt, DocStatus required, String message) {
        if (receipt.getDocstatus() != required) {
            throw new RuntimeException(message);
        }
    }

    public GoodsReceiptResponse toResponse(GoodsReceipt receipt) {
        GoodsReceiptResponse res = new GoodsReceiptResponse();
        res.setId(receipt.getId());
        res.setDocno(receipt.getDocno());
        res.setDocDate(receipt.getDocDate());
        res.setDescription(receipt.getDescription());
        res.setDocstatus(receipt.getDocstatus());
        res.setCreatedAt(receipt.getCreatedAt());
        if (receipt.getCustomer() != null) {
            res.setCustomerId(receipt.getCustomer().getId());
            res.setCustomerName(receipt.getCustomer().getCustomername());
        }

        List<GoodsReceiptDetail> details = detailRepository.findByGoodsReceiptId(receipt.getId());
        res.setDetails(details.stream().map(d -> {
            GoodsReceiptDetailResponse dr = new GoodsReceiptDetailResponse();
            dr.setId(d.getId());
            if (d.getItem() != null) {
                dr.setItemId(d.getItem().getId());
                dr.setItemcode(d.getItem().getItemcode());
                dr.setItemname(d.getItem().getItemname());
                dr.setUnitof(d.getItem().getUnitof());
            }
            dr.setQuantity(d.getQuantity());
            dr.setUnitprice(d.getUnitprice());
            dr.setAmount(d.getAmount());
            if (d.getLocation() != null) {
                dr.setLocationId(d.getLocation().getId());
                dr.setLocationcode(d.getLocation().getLocationcode());
                dr.setLocationname(d.getLocation().getLocationname());
            }
            return dr;
        }).collect(Collectors.toList()));

        return res;
    }
}
