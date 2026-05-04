package hoshimoto.cdtn.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hoshimoto.cdtn.dto.InventoryAuditDetailResponse;
import hoshimoto.cdtn.dto.InventoryAuditResponse;
import hoshimoto.cdtn.dto.request.InventoryAuditDetailRequest;
import hoshimoto.cdtn.dto.request.InventoryAuditRequest;
import hoshimoto.cdtn.entity.Enum.DocStatus;
import hoshimoto.cdtn.entity.InventoryAudit;
import hoshimoto.cdtn.entity.InventoryAuditDetail;
import hoshimoto.cdtn.entity.InventoryBalance;
import hoshimoto.cdtn.entity.Item;
import hoshimoto.cdtn.entity.ItemLocation;
import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.entity.User;
import hoshimoto.cdtn.repository.InventoryAuditDetailRepository;
import hoshimoto.cdtn.repository.InventoryAuditRepository;
import hoshimoto.cdtn.repository.InventoryBalanceRepository;
import hoshimoto.cdtn.repository.ItemLocationRepository;
import hoshimoto.cdtn.repository.ItemRepository;
import hoshimoto.cdtn.repository.LocationRepository;
import hoshimoto.cdtn.repository.UserRepository;

@Service
public class InventoryAuditService {

    @Autowired private InventoryAuditRepository auditRepository;
    @Autowired private InventoryAuditDetailRepository detailRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private ItemLocationRepository itemLocationRepository;
    @Autowired private InventoryBalanceRepository inventoryBalanceRepository;
    @Autowired private UserRepository userRepository;

    // ───────────────────────── CRUD ─────────────────────────

    public List<InventoryAuditResponse> getAll() {
        return auditRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InventoryAuditResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /**
     * Tạo phiếu kiểm kê nháp.
     * Hệ thống tự lấy bookquantity từ ItemLocation tại vị trí đó.
     * FE cung cấp actualquantity (số đếm thực tế).
     * diffquantity = actualquantity - bookquantity được tính tự động.
     */
    @Transactional
    public InventoryAuditResponse createDraft(InventoryAuditRequest request) {
        if (auditRepository.findByDocno(request.getDocno()).isPresent()) {
            throw new RuntimeException("Mã phiếu '" + request.getDocno() + "' đã tồn tại");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vị trí id: " + request.getLocationId()));

        InventoryAudit audit = new InventoryAudit();
        applyHeader(audit, request, location);
        audit.setDocstatus(DocStatus.DRAFT);
        audit = auditRepository.save(audit);

        saveDetails(audit, request.getDetails(), location);
        return toResponse(audit);
    }

    /**
     * Cập nhật phiếu kiểm kê nháp (chỉ được sửa khi trạng thái DRAFT).
     */
    @Transactional
    public InventoryAuditResponse updateDraft(Long id, InventoryAuditRequest request) {
        InventoryAudit audit = findOrThrow(id);
        requireStatus(audit, DocStatus.DRAFT, "Chỉ có thể sửa phiếu ở trạng thái DRAFT");

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vị trí id: " + request.getLocationId()));

        applyHeader(audit, request, location);
        audit.setModifiedAt(LocalDateTime.now());
        audit = auditRepository.save(audit);

        detailRepository.deleteByInventoryAuditId(id);
        saveDetails(audit, request.getDetails(), location);
        return toResponse(audit);
    }

    /**
     * Xác nhận phiếu kiểm kê.
     * Áp dụng diffquantity vào ItemLocation và InventoryBalance để điều chỉnh tồn kho.
     * diff > 0: thừa hàng → tăng tồn; diff < 0: thiếu hàng → giảm tồn; diff = 0: không đổi.
     */
    @Transactional
    public InventoryAuditResponse confirm(Long id) {
        InventoryAudit audit = findOrThrow(id);
        requireStatus(audit, DocStatus.DRAFT, "Chỉ có thể xác nhận phiếu ở trạng thái DRAFT");

        List<InventoryAuditDetail> details = detailRepository.findByInventoryAuditId(id);
        if (details == null || details.isEmpty()) {
            throw new RuntimeException("Phiếu kiểm kê không có dòng chi tiết nào");
        }

        Location location = audit.getLocation();

        for (InventoryAuditDetail detail : details) {
            BigDecimal diff = detail.getDiffquantity();
            if (diff == null || diff.compareTo(BigDecimal.ZERO) == 0) continue;

            Item item = detail.getItem();

            // ── Cập nhật ItemLocation ──────────────────────────────────
            ItemLocation il = itemLocationRepository
                    .findByItemIdAndLocationId(item.getId(), location.getId())
                    .orElseGet(() -> {
                        // Vị trí chưa có bản ghi → chỉ hợp lệ khi diff > 0
                        ItemLocation newIl = new ItemLocation();
                        newIl.setItem(item);
                        newIl.setLocation(location);
                        newIl.setQuantity(BigDecimal.ZERO);
                        newIl.setIsActive(true);
                        return newIl;
                    });

            BigDecimal newIlQty = il.getQuantity().add(diff);
            if (newIlQty.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException(
                        "Tồn kho tại vị trí '" + location.getLocationcode()
                        + "' của '" + item.getItemcode() + "' không đủ sau kiểm kê "
                        + "(sổ sách: " + il.getQuantity() + ", chênh lệch: " + diff + ")");
            }
            il.setQuantity(newIlQty);
            il.setIsActive(newIlQty.compareTo(BigDecimal.ZERO) > 0);
            itemLocationRepository.save(il);

            // ── Cập nhật InventoryBalance ──────────────────────────────
            InventoryBalance balance = inventoryBalanceRepository
                    .findByItemId(item.getId())
                    .orElseGet(() -> {
                        InventoryBalance b = new InventoryBalance();
                        b.setItemId(item.getId());
                        b.setQuantity(BigDecimal.ZERO);
                        return b;
                    });

            BigDecimal newBalQty = balance.getQuantity().add(diff);
            if (newBalQty.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException(
                        "Tồn kho tổng của '" + item.getItemcode() + "' không đủ sau kiểm kê "
                        + "(tổng: " + balance.getQuantity() + ", chênh lệch: " + diff + ")");
            }
            balance.setQuantity(newBalQty);
            balance.setLastUpdated(LocalDateTime.now());
            inventoryBalanceRepository.save(balance);
        }

        audit.setDocstatus(DocStatus.CONFIRMED);
        audit.setModifiedAt(LocalDateTime.now());
        getCurrentUser().ifPresent(u -> {
            audit.setModifiedBy(u.getUsername());
        });
        auditRepository.save(audit);
        return toResponse(audit);
    }

    /**
     * Hủy phiếu kiểm kê (chỉ DRAFT mới hủy được).
     */
    @Transactional
    public InventoryAuditResponse cancel(Long id) {
        InventoryAudit audit = findOrThrow(id);
        requireStatus(audit, DocStatus.DRAFT, "Chỉ có thể hủy phiếu ở trạng thái DRAFT");
        audit.setDocstatus(DocStatus.CANCELLED);
        audit.setModifiedAt(LocalDateTime.now());
        getCurrentUser().ifPresent(u -> audit.setModifiedBy(u.getUsername()));
        auditRepository.save(audit);
        return toResponse(audit);
    }

    // ───────────────────────── PRIVATE HELPERS ─────────────────────────

    private void applyHeader(InventoryAudit audit, InventoryAuditRequest request, Location location) {
        audit.setDocno(request.getDocno());
        audit.setDocDate(request.getDocDate());
        audit.setDescription(request.getDescription());
        audit.setLocation(location);
        if (audit.getUser() == null) {
            getCurrentUser().ifPresent(u -> {
                audit.setUser(u);
                audit.setCreatedBy(u.getUsername());
            });
        }
    }

    private void saveDetails(InventoryAudit audit, List<InventoryAuditDetailRequest> detailRequests, Location location) {
        if (detailRequests == null) return;
        for (InventoryAuditDetailRequest req : detailRequests) {
            Item item = itemRepository.findById(req.getItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa id: " + req.getItemId()));

            // Lấy bookquantity từ ItemLocation hiện tại tại vị trí này
            BigDecimal bookQty = itemLocationRepository
                    .findByItemIdAndLocationId(item.getId(), location.getId())
                    .map(ItemLocation::getQuantity)
                    .orElse(BigDecimal.ZERO);

            BigDecimal actualQty = req.getActualquantity();
            BigDecimal diffQty = actualQty.subtract(bookQty);

            InventoryAuditDetail detail = new InventoryAuditDetail();
            detail.setInventoryAudit(audit);
            detail.setItem(item);
            detail.setUnitof(item.getUnitof());
            detail.setBookquantity(bookQty);
            detail.setActualquantity(actualQty);
            detail.setDiffquantity(diffQty);
            detail.setDescription(req.getDescription());
            detailRepository.save(detail);
        }
    }

    private InventoryAudit findOrThrow(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu kiểm kê id: " + id));
    }

    private void requireStatus(InventoryAudit audit, DocStatus required, String message) {
        if (audit.getDocstatus() != required) {
            throw new RuntimeException(message);
        }
    }

    private java.util.Optional<User> getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return java.util.Optional.empty();
        return userRepository.findByUsername(auth.getName());
    }

    public InventoryAuditResponse toResponse(InventoryAudit audit) {
        InventoryAuditResponse res = new InventoryAuditResponse();
        res.setId(audit.getId());
        res.setDocno(audit.getDocno());
        res.setDocDate(audit.getDocDate());
        res.setDescription(audit.getDescription());
        res.setDocstatus(audit.getDocstatus());
        res.setCreatedAt(audit.getCreatedAt());
        res.setModifiedAt(audit.getModifiedAt());
        res.setModifiedBy(audit.getModifiedBy());

        if (audit.getLocation() != null) {
            res.setLocationId(audit.getLocation().getId());
            res.setLocationcode(audit.getLocation().getLocationcode());
            res.setLocationname(audit.getLocation().getLocationname());
        }
        if (audit.getUser() != null) {
            res.setCreatedByUsername(audit.getUser().getUsername());
            res.setCreatedByFullname(audit.getUser().getFullname());
        }

        List<InventoryAuditDetail> details = detailRepository.findByInventoryAuditId(audit.getId());
        res.setDetails(details.stream().map(d -> {
            InventoryAuditDetailResponse dr = new InventoryAuditDetailResponse();
            dr.setId(d.getId());
            if (d.getItem() != null) {
                dr.setItemId(d.getItem().getId());
                dr.setItemcode(d.getItem().getItemcode());
                dr.setItemname(d.getItem().getItemname());
                dr.setUnitof(d.getItem().getUnitof());
            }
            dr.setBookquantity(d.getBookquantity());
            dr.setActualquantity(d.getActualquantity());
            dr.setDiffquantity(d.getDiffquantity());
            dr.setDescription(d.getDescription());
            return dr;
        }).collect(Collectors.toList()));

        return res;
    }
}
