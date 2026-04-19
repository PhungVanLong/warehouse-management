package hoshimoto.cdtn.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoodsIssueRequest {

    @NotBlank(message = "Mã phiếu không được để trống")
    private String docno;

    private LocalDate docDate;

    private String description;

    private Long customerId;

    @Valid
    private List<GoodsIssueDetailRequest> details;
}
