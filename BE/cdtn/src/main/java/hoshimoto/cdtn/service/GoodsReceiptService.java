package hoshimoto.cdtn.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hoshimoto.cdtn.dto.GoodsReceiptDetailResponse;
import hoshimoto.cdtn.dto.GoodsReceiptResponse;
import hoshimoto.cdtn.dto.LocationDetailResponse;
import hoshimoto.cdtn.dto.LocationDetailResponse.LocationItemStock;
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
import hoshimoto.cdtn.entity.User;
import hoshimoto.cdtn.repository.CustomerRepository;
import hoshimoto.cdtn.repository.GoodsReceiptDetailRepository;
import hoshimoto.cdtn.repository.GoodsReceiptRepository;
import hoshimoto.cdtn.repository.InventoryBalanceRepository;
import hoshimoto.cdtn.repository.ItemLocationRepository;
import hoshimoto.cdtn.repository.ItemRepository;
import hoshimoto.cdtn.repository.LocationRepository;
import hoshimoto.cdtn.repository.UserRepository;

@Service
public class GoodsReceiptService {

    @Autowired private GoodsReceiptRepository receiptRepository;
    @Autowired private GoodsReceiptDetailRepository detailRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private ItemLocationRepository itemLocationRepository;
    @Autowired private InventoryBalanceRepository inventoryBalanceRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private UserRepository userRepository;

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

            // Kiểm tra capacity của vị trí trước khi nhập
            if (location.getCapacity() != null) {
                BigDecimal usedCapacity = itemLocationRepository.getTotalUsedCapacity(location.getId());
                BigDecimal remaining = BigDecimal.valueOf(location.getCapacity()).subtract(usedCapacity);
                if (qty.compareTo(remaining) > 0) {
                    throw new RuntimeException(
                            "Vị trí '" + location.getLocationcode() + "' không đủ sức chứa. " +
                            "Còn trống: " + remaining + ", cần nhập: " + qty);
                }
            }

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
        getCurrentUser().ifPresent(u -> {
            receipt.setApprover(u);
            receipt.setModifiedBy(u.getUsername());
        });
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
        getCurrentUser().ifPresent(u -> {
            receipt.setApprover(u);
            receipt.setModifiedBy(u.getUsername());
        });
        receiptRepository.save(receipt);
        return toResponse(receipt);
    }

    // ───────────────────────── AVAILABLE LOCATIONS (NHẬP KHO) ─────────────────────────

    /**
     * Liệt kê TẤT CẢ vị trí còn chỗ trống (kể cả < quantity cần nhập).
     * Mỗi vị trí kèm danh sách sản phẩm đang chứa tại đó.
     * FE dùng để hiển thị danh sách tất cả vị trí còn chỗ (không so sánh với quantity cần nhập).
     * Ưu tiên vị trí đã chứa cùng itemId (EXISTING) → trống hoàn toàn (EMPTY) → chứa hàng khác (PARTIAL).
     */
    public List<LocationDetailResponse> listAvailableForReceipt(Long itemId) {
        List<Location> locations = locationRepository.findAllLocationsWithAnySpace();
        List<LocationDetailResponse> result = new ArrayList<>();

        for (Location loc : locations) {
            BigDecimal used = itemLocationRepository.getTotalUsedCapacity(loc.getId());
            BigDecimal cap = loc.getCapacity() != null ? BigDecimal.valueOf(loc.getCapacity()) : null;
            BigDecimal remaining = cap != null ? cap.subtract(used) : null;

            // Lấy danh sách hàng đang chứa tại vị trí này
            List<ItemLocation> itemsAtLoc = itemLocationRepository.findByLocationIdAndIsActiveTrue(loc.getId());
            List<LocationItemStock> stockList = itemsAtLoc.stream().map(il -> new LocationItemStock(
                    il.getItem().getId(),
                    il.getItem().getItemcode(),
                    il.getItem().getItemname(),
                    il.getItem().getUnitof(),
                    il.getQuantity()
            )).collect(Collectors.toList());

            // Phân loại vị trí
            boolean hasThisItem = itemsAtLoc.stream().anyMatch(il -> il.getItem().getId().equals(itemId));
            boolean isEmpty = itemsAtLoc.isEmpty();
            String type = hasThisItem ? "EXISTING" : (isEmpty ? "EMPTY" : "PARTIAL");

            result.add(new LocationDetailResponse(
                    loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                    loc.getRackno(), loc.getFloorno(), loc.getColumnno(),
                    loc.getCapacity(), used, remaining, type, stockList));
        }

        // Sắp xếp: EXISTING trước → EMPTY → PARTIAL
        result.sort((a, b) -> {
            int order = typeOrder(a.getType()) - typeOrder(b.getType());
            if (order != 0) return order;
            // Cùng loại: ưu tiên vị trí còn nhiều chỗ hơn (null = unlimited → để đầu)
            if (a.getRemainingCapacity() == null) return -1;
            if (b.getRemainingCapacity() == null) return 1;
            return b.getRemainingCapacity().compareTo(a.getRemainingCapacity());
        });

        return result;
    }

    private int typeOrder(String type) {
        return switch (type) {
            case "EXISTING" -> 0;
            case "EMPTY"    -> 1;
            default         -> 2; // PARTIAL
        };
    }

    // ───────────────────────── LOCATION SUGGESTION ─────────────────────────

    /**
     * Gợi ý vị trí phù hợp khi nhập hàng.
     * 1. Ưu tiên vị trí đã chứa cùng item và còn chỗ (type = EXISTING)
     * 2. Sau đó đến vị trí hoàn toàn trống (type = EMPTY)
     */
    public List<LocationSuggestionResponse> suggestLocations(Long itemId, BigDecimal quantity) {
        List<LocationSuggestionResponse> result = new ArrayList<>();

        // Vị trí đang chứa item, tổng dùng tại vị trí < capacity → còn chỗ
        List<ItemLocation> existing = itemLocationRepository.findLocationsWithSpaceForItem(itemId);
        for (ItemLocation il : existing) {
            Location loc = il.getLocation();
            // Tổng tất cả items đang chiếm tại vị trí này
            BigDecimal usedCapacity = itemLocationRepository.getTotalUsedCapacity(loc.getId());
            BigDecimal totalCap = loc.getCapacity() != null ? BigDecimal.valueOf(loc.getCapacity()) : BigDecimal.ZERO;
            BigDecimal available = totalCap.subtract(usedCapacity);
            result.add(new LocationSuggestionResponse(
                    loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                    loc.getCapacity(), usedCapacity, available, "EXISTING", null));
        }

        // Vị trí trống hoàn toàn còn đủ sức chứa số lượng cần nhập
        List<Location> emptyLocs = locationRepository.findEmptyLocationsWithCapacity(quantity);
        for (Location loc : emptyLocs) {
            BigDecimal available = loc.getCapacity() != null ? BigDecimal.valueOf(loc.getCapacity()) : BigDecimal.ZERO;
            result.add(new LocationSuggestionResponse(
                    loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                    loc.getCapacity(), BigDecimal.ZERO, available, "EMPTY", null));
        }

        return result;
    }

    // ───────────────────────── PRIVATE HELPERS ─────────────────────────

    /**
     * Gợi ý phân bổ số lượng cần nhập qua nhiều vị trí (khi quantity > capacity một vị trí).
     * Thứ tự ưu tiên: EXISTING → EMPTY. Tự động tính suggestedQuantity cho mỗi vị trí.
     */
    public List<LocationSuggestionResponse> suggestSplit(Long itemId, BigDecimal quantity) {
        List<LocationSuggestionResponse> all = suggestLocations(itemId, quantity);
        List<LocationSuggestionResponse> result = new ArrayList<>();
        BigDecimal remaining = quantity;

        for (LocationSuggestionResponse loc : all) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal space = loc.getAvailableSpace() != null ? loc.getAvailableSpace() : BigDecimal.ZERO;
            if (space.compareTo(BigDecimal.ZERO) <= 0) continue;
            BigDecimal take = remaining.min(space);
            loc.setSuggestedQuantity(take);
            result.add(loc);
            remaining = remaining.subtract(take);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException(
                "Không đủ vị trí trống để chứa " + quantity + " (còn thiếu " + remaining + ")");
        }
        return result;
    }

    private void applyHeader(GoodsReceipt receipt, GoodsReceiptRequest request) {
        receipt.setDocno(request.getDocno());
        receipt.setDocDate(request.getDocDate());
        receipt.setDescription(request.getDescription());
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng id: " + request.getCustomerId()));
            receipt.setCustomer(customer);
        }
        // Gán người tạo từ JWT token (chỉ set khi tạo mới, không ghi đè khi update)
        if (receipt.getUser() == null) {
            getCurrentUser().ifPresent(receipt::setUser);
        }
    }

    private java.util.Optional<User> getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return java.util.Optional.empty();
        String username = auth.getName();
        return userRepository.findByUsername(username);
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
            res.setCustomerTaxcode(receipt.getCustomer().getTaxcode());
        }
        if (receipt.getUser() != null) {
            res.setCreatedByUsername(receipt.getUser().getUsername());
            res.setCreatedByFullname(receipt.getUser().getFullname());
        } else {
            res.setCreatedByUsername(null);
            res.setCreatedByFullname(null);
        }
        if (receipt.getApprover() != null) {
            res.setActionByUsername(receipt.getApprover().getUsername());
            res.setActionByFullname(receipt.getApprover().getFullname());
            res.setApprovedAt(receipt.getModifiedAt());
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
