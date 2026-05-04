package hoshimoto.cdtn.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAuditRequest {

    @NotBlank(message = "Mã phiếu không được để trống")
    private String docno;

    private LocalDate docDate;

    private String description;

    @NotNull(message = "Vị trí kiểm kê không được để trống")
    private Long locationId;

    @Valid
    private List<InventoryAuditDetailRequest> details;
}
