package hoshimoto.cdtn.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hoshimoto.cdtn.dto.ApiResponse;
import hoshimoto.cdtn.dto.ItemResponse;
import hoshimoto.cdtn.entity.Item;
import hoshimoto.cdtn.service.ItemService;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems() {
        List<ItemResponse> items = itemService.getAllItems().stream().map(ItemController::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hàng hóa thành công", items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        return itemService.getItemById(id)
                .map(item -> ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết hàng hóa thành công", toDto(item))))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Không tìm thấy hàng hóa", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Item>> updateItem(@PathVariable Long id, @RequestBody Item updatedItem) {
        try {
            Item item = itemService.updateItem(id, updatedItem);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hàng hóa thành công", item));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(@RequestBody Item item) {
        Item created = itemService.createItem(item);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo mới hàng hóa thành công", toDto(created)));
    }

    private static ItemResponse toDto(Item item) {
        ItemResponse dto = new ItemResponse();
        dto.setId(item.getId());
        dto.setItemcode(item.getItemcode());
        dto.setBarcode(item.getBarcode());
        dto.setItemname(item.getItemname());
        dto.setInvoicename(item.getInvoicename());
        dto.setDescription(item.getDescription());
        dto.setItemtype(item.getItemtype());
        dto.setUnitof(item.getUnitof());
        dto.setItemcatg(item.getItemcatg());
        dto.setMinstocklevel(item.getMinstocklevel());
        dto.setCreatedAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
        dto.setModifiedAt(item.getModifiedAt() != null ? item.getModifiedAt().toString() : null);
        dto.setModifiedBy(item.getModifiedBy());
        return dto;
    }
}
