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
import hoshimoto.cdtn.dto.GoodsReceiptResponse;
import hoshimoto.cdtn.dto.LocationSuggestionResponse;
import hoshimoto.cdtn.dto.request.GoodsReceiptRequest;
import hoshimoto.cdtn.service.GoodsReceiptService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goods-receipts")
public class GoodsReceiptController {

    @Autowired
    private GoodsReceiptService goodsReceiptService;

    /** Lấy danh sách tất cả phiếu nhập */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<GoodsReceiptResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phiếu nhập thành công",
                goodsReceiptService.getAll()));
    }

    /** Lấy chi tiết 1 phiếu nhập */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết phiếu nhập thành công",
                goodsReceiptService.getById(id)));
    }

    /**
     * Gợi ý vị trí khi nhập hàng.
     * GET /api/goods-receipts/suggest-locations?itemId=1&quantity=50
     */
    @GetMapping("/suggest-locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<LocationSuggestionResponse>>> suggestLocations(
            @RequestParam Long itemId,
            @RequestParam BigDecimal quantity) {
        List<LocationSuggestionResponse> suggestions = goodsReceiptService.suggestLocations(itemId, quantity);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gợi ý vị trí nhập kho thành công", suggestions));
    }

    /** Tạo phiếu nhập nháp */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> create(
            @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo phiếu nhập thành công",
                goodsReceiptService.createDraft(request)));
    }

    /** Cập nhật phiếu nhập nháp */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật phiếu nhập thành công",
                goodsReceiptService.updateDraft(id, request)));
    }

    /** Xác nhận phiếu nhập → cập nhật tồn kho */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Xác nhận phiếu nhập thành công",
                goodsReceiptService.confirm(id)));
    }

    /** Hủy phiếu nhập */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy phiếu nhập thành công",
                goodsReceiptService.cancel(id)));
    }
}
