package hoshimoto.cdtn.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hoshimoto.cdtn.dto.ApiResponse;
import hoshimoto.cdtn.dto.InventoryAuditResponse;
import hoshimoto.cdtn.dto.request.InventoryAuditRequest;
import hoshimoto.cdtn.service.InventoryAuditService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventory-audits")
public class InventoryAuditController {

    @Autowired
    private InventoryAuditService inventoryAuditService;

    /** Lấy danh sách tất cả phiếu kiểm kê */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<InventoryAuditResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phiếu kiểm kê thành công",
                inventoryAuditService.getAll()));
    }

    /** Lấy chi tiết 1 phiếu kiểm kê */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết phiếu kiểm kê thành công",
                inventoryAuditService.getById(id)));
    }

    /** Tạo phiếu kiểm kê nháp */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> create(
            @Valid @RequestBody InventoryAuditRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo phiếu kiểm kê thành công",
                inventoryAuditService.createDraft(request)));
    }

    /** Cập nhật phiếu kiểm kê nháp */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryAuditRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật phiếu kiểm kê thành công",
                inventoryAuditService.updateDraft(id, request)));
    }

    /** Xác nhận phiếu kiểm kê → điều chỉnh tồn kho */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> confirm(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Xác nhận phiếu kiểm kê thành công",
                    inventoryAuditService.confirm(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Hủy phiếu kiểm kê */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<InventoryAuditResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy phiếu kiểm kê thành công",
                inventoryAuditService.cancel(id)));
    }
}
