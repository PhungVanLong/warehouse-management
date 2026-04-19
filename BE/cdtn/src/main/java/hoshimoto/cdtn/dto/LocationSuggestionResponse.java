package hoshimoto.cdtn.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Gợi ý vị trí phù hợp khi nhập kho.
 * - type = "EXISTING" → vị trí đã có cùng sản phẩm, còn chỗ trống
 * - type = "EMPTY"    → vị trí hoàn toàn trống
 */
@Data
@AllArgsConstructor
public class LocationSuggestionResponse {
    private Long locationId;
    private String locationcode;
    private String locationname;
    private Integer capacity;
    private BigDecimal currentQuantity; // số lượng đang chứa (0 nếu trống)
    private BigDecimal availableSpace;  // capacity - currentQuantity
    private String type;                // "EXISTING" hoặc "EMPTY"
}
