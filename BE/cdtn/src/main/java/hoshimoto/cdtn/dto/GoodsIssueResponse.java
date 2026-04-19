package hoshimoto.cdtn.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import hoshimoto.cdtn.entity.Enum.DocStatus;
import lombok.Data;

@Data
public class GoodsIssueResponse {
    private Long id;
    private String docno;
    private LocalDate docDate;
    private String description;
    private DocStatus docstatus;
    private Long customerId;
    private String customerName;
    private LocalDateTime createdAt;
    private List<GoodsIssueDetailResponse> details;
}
