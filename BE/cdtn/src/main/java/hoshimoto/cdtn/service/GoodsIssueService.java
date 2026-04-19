package hoshimoto.cdtn.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hoshimoto.cdtn.dto.GoodsIssueDetailResponse;
import hoshimoto.cdtn.dto.GoodsIssueResponse;
import hoshimoto.cdtn.dto.LocationSuggestionResponse;
import hoshimoto.cdtn.dto.request.GoodsIssueDetailRequest;
import hoshimoto.cdtn.dto.request.GoodsIssueRequest;
import hoshimoto.cdtn.entity.Customer;
import hoshimoto.cdtn.entity.Enum.DocStatus;
import hoshimoto.cdtn.entity.GoodsIssue;
import hoshimoto.cdtn.entity.GoodsIssueDetail;
import hoshimoto.cdtn.entity.InventoryBalance;
import hoshimoto.cdtn.entity.Item;
import hoshimoto.cdtn.entity.ItemLocation;
import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.repository.CustomerRepository;
import hoshimoto.cdtn.repository.GoodsIssueDetailRepository;
import hoshimoto.cdtn.repository.GoodsIssueRepository;
import hoshimoto.cdtn.repository.InventoryBalanceRepository;
import hoshimoto.cdtn.repository.ItemLocationRepository;
import hoshimoto.cdtn.repository.ItemRepository;
import hoshimoto.cdtn.repository.LocationRepository;

@Service
public class GoodsIssueService {

    @Autowired private GoodsIssueRepository issueRepository;
    @Autowired private GoodsIssueDetailRepository detailRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private ItemLocationRepository itemLocationRepository;
    @Autowired private InventoryBalanceRepository inventoryBalanceRepository;
    @Autowired private CustomerRepository customerRepository;

    // ───────────────────────── CRUD ─────────────────────────

    public List<GoodsIssueResponse> getAll() {
        return issueRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GoodsIssueResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /**
     * Tạo phiếu xuất nháp (DRAFT).
     * FE gửi danh sách chi tiết kèm locationId đã chọn từ danh sách vị trí có hàng.
     */
    @Transactional
    public GoodsIssueResponse createDraft(GoodsIssueRequest request) {
        if (issueRepository.findByDocno(request.getDocno()).isPresent()) {
            throw new RuntimeException("Mã phiếu '" + request.getDocno() + "' đã tồn tại");
        }

        GoodsIssue issue = new GoodsIssue();
        applyHeader(issue, request);
        issue.setDocstatus(DocStatus.DRAFT);
        issue = issueRepository.save(issue);

        saveDetails(issue, request.getDetails());
        return toResponse(issue);
    }

    /**
     * Cập nhật phiếu xuất nháp.
     */
    @Transactional
    public GoodsIssueResponse updateDraft(Long id, GoodsIssueRequest request) {
        GoodsIssue issue = findOrThrow(id);
        requireStatus(issue, DocStatus.DRAFT, "Chỉ có thể sửa phiếu ở trạng thái DRAFT");

        applyHeader(issue, request);
        issue.setModifiedAt(LocalDateTime.now());
        issue = issueRepository.save(issue);

        detailRepository.deleteByGoodsIssueId(id);
        saveDetails(issue, request.getDetails());
        return toResponse(issue);
    }

    /**
     * Xác nhận phiếu xuất kho.
     * Trừ số lượng từ ItemLocation và InventoryBalance.
     */
    @Transactional
    public GoodsIssueResponse confirm(Long id) {
        GoodsIssue issue = findOrThrow(id);
        requireStatus(issue, DocStatus.DRAFT, "Chỉ có thể xác nhận phiếu ở trạng thái DRAFT");

        List<GoodsIssueDetail> details = detailRepository.findByGoodsIssueId(id);

        for (GoodsIssueDetail detail : details) {
            if (detail.getLocation() == null) {
                throw new RuntimeException(
                        "Dòng chi tiết với mã hàng '" + detail.getItemcode() + "' chưa được gán vị trí");
            }

            Item item = detail.getItem();
            Location location = detail.getLocation();
            BigDecimal qty = detail.getQuantity();

            // Kiểm tra & trừ ItemLocation
            ItemLocation il = itemLocationRepository
                    .findByItemIdAndLocationId(item.getId(), location.getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy tồn kho của '" + item.getItemcode()
                            + "' tại vị trí '" + location.getLocationcode() + "'"));

            if (il.getQuantity().compareTo(qty) < 0) {
                throw new RuntimeException(
                        "Tồn kho tại vị trí '" + location.getLocationcode()
                        + "' không đủ số lượng để xuất (cần " + qty + ", hiện có " + il.getQuantity() + ")");
            }

            BigDecimal newQty = il.getQuantity().subtract(qty);
            il.setQuantity(newQty);
            if (newQty.compareTo(BigDecimal.ZERO) == 0) {
                il.setIsActive(false);
            }
            itemLocationRepository.save(il);

            // Cập nhật InventoryBalance
            InventoryBalance balance = inventoryBalanceRepository
                    .findByItemId(item.getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy tồn kho tổng của hàng hóa id: " + item.getId()));

            balance.setQuantity(balance.getQuantity().subtract(qty));
            balance.setLastUpdated(LocalDateTime.now());
            inventoryBalanceRepository.save(balance);
        }

        issue.setDocstatus(DocStatus.CONFIRMED);
        issue.setModifiedAt(LocalDateTime.now());
        issueRepository.save(issue);
        return toResponse(issue);
    }

    /**
     * Hủy phiếu xuất (chỉ DRAFT mới hủy được).
     */
    @Transactional
    public GoodsIssueResponse cancel(Long id) {
        GoodsIssue issue = findOrThrow(id);
        requireStatus(issue, DocStatus.DRAFT, "Chỉ có thể hủy phiếu ở trạng thái DRAFT");
        issue.setDocstatus(DocStatus.CANCELLED);
        issue.setModifiedAt(LocalDateTime.now());
        issueRepository.save(issue);
        return toResponse(issue);
    }

    // ───────────────────────── AVAILABLE LOCATIONS ─────────────────────────

    /**
     * Lấy danh sách vị trí đang chứa item với số lượng đủ để xuất.
     */
    public List<LocationSuggestionResponse> availableLocations(Long itemId, BigDecimal quantity) {
        return itemLocationRepository.findAvailableForIssue(itemId, quantity)
                .stream().map(il -> {
                    Location loc = il.getLocation();
                    return new LocationSuggestionResponse(
                            loc.getId(), loc.getLocationcode(), loc.getLocationname(),
                            loc.getCapacity(), il.getQuantity(),
                            il.getQuantity(), // availableSpace = current stock at this location
                            "HAS_STOCK");
                }).collect(Collectors.toList());
    }

    // ───────────────────────── PRIVATE HELPERS ─────────────────────────

    private void applyHeader(GoodsIssue issue, GoodsIssueRequest request) {
        issue.setDocno(request.getDocno());
        issue.setDocDate(request.getDocDate());
        issue.setDescription(request.getDescription());
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng id: " + request.getCustomerId()));
            issue.setCustomer(customer);
        }
    }

    private void saveDetails(GoodsIssue issue, List<GoodsIssueDetailRequest> detailRequests) {
        if (detailRequests == null) return;
        for (GoodsIssueDetailRequest req : detailRequests) {
            Item item = itemRepository.findById(req.getItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa id: " + req.getItemId()));

            GoodsIssueDetail detail = new GoodsIssueDetail();
            detail.setGoodsIssue(issue);
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

    private GoodsIssue findOrThrow(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất id: " + id));
    }

    private void requireStatus(GoodsIssue issue, DocStatus required, String message) {
        if (issue.getDocstatus() != required) {
            throw new RuntimeException(message);
        }
    }

    public GoodsIssueResponse toResponse(GoodsIssue issue) {
        GoodsIssueResponse res = new GoodsIssueResponse();
        res.setId(issue.getId());
        res.setDocno(issue.getDocno());
        res.setDocDate(issue.getDocDate());
        res.setDescription(issue.getDescription());
        res.setDocstatus(issue.getDocstatus());
        res.setCreatedAt(issue.getCreatedAt());
        if (issue.getCustomer() != null) {
            res.setCustomerId(issue.getCustomer().getId());
            res.setCustomerName(issue.getCustomer().getCustomername());
        }

        List<GoodsIssueDetail> details = detailRepository.findByGoodsIssueId(issue.getId());
        res.setDetails(details.stream().map(d -> {
            GoodsIssueDetailResponse dr = new GoodsIssueDetailResponse();
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
