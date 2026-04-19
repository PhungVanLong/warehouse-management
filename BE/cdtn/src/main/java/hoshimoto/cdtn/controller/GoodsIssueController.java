package hoshimoto.cdtn.controller;

import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hoshimoto.cdtn.dto.ApiResponse;
import hoshimoto.cdtn.dto.GoodsIssueResponse;
import hoshimoto.cdtn.dto.LocationSuggestionResponse;
import hoshimoto.cdtn.dto.request.GoodsIssueRequest;
import hoshimoto.cdtn.service.GoodsIssueService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goods-issues")
public class GoodsIssueController {

    @Autowired
    private GoodsIssueService goodsIssueService;

    /** Lấy danh sách tất cả phiếu xuất */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<GoodsIssueResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phiếu xuất thành công",
                goodsIssueService.getAll()));
    }

    /** Lấy chi tiết 1 phiếu xuất */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết phiếu xuất thành công",
                goodsIssueService.getById(id)));
    }

    /**
     * Lấy danh sách vị trí đang chứa hàng đủ số lượng cần xuất.
     * GET /api/goods-issues/available-locations?itemId=1&quantity=20
     */
    @GetMapping("/available-locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<LocationSuggestionResponse>>> availableLocations(
            @RequestParam Long itemId,
            @RequestParam BigDecimal quantity) {
        List<LocationSuggestionResponse> locations = goodsIssueService.availableLocations(itemId, quantity);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách vị trí xuất kho thành công", locations));
    }

    /** Tạo phiếu xuất nháp */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> create(
            @Valid @RequestBody GoodsIssueRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo phiếu xuất thành công",
                goodsIssueService.createDraft(request)));
    }

    /** Cập nhật phiếu xuất nháp */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody GoodsIssueRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật phiếu xuất thành công",
                goodsIssueService.updateDraft(id, request)));
    }

    /** Xác nhận phiếu xuất → trừ tồn kho */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Xác nhận phiếu xuất thành công",
                goodsIssueService.confirm(id)));
    }

    /** Hủy phiếu xuất */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsIssueResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy phiếu xuất thành công",
                goodsIssueService.cancel(id)));
    }
}
