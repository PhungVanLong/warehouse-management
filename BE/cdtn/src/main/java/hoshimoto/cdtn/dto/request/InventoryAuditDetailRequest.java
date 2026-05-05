package hoshimoto.cdtn.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAuditDetailRequest {

    @NotNull(message = "itemId không được để trống")
    private Long itemId;

    @NotNull(message = "Số lượng thực tế không được để trống")
    @DecimalMin(value = "0", inclusive = true, message = "Số lượng thực tế không được âm")
    private BigDecimal actualquantity;

    private String description;
}
