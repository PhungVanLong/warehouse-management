package hoshimoto.cdtn.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class GoodsReceiptRequest {

    private String docno;

    private LocalDate docDate;

    private String description;

    /** ID nhà cung cấp / khách hàng */
    private Long customerId;

    @Valid
    private List<GoodsReceiptDetailRequest> details;
}
