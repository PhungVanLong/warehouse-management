package hoshimoto.cdtn.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import hoshimoto.cdtn.entity.Enum.DocStatus;
import lombok.Data;

@Data
public class InventoryAuditResponse {
    private Long id;
    private String docno;
    private LocalDate docDate;
    private String description;
    private DocStatus docstatus;
    private Long locationId;
    private String locationcode;
    private String locationname;
    private LocalDateTime createdAt;
    private String createdByUsername;
    private String createdByFullname;
    private Long assignedToUserId;
    private String assignedToUsername;
    private String assignedToFullname;
    private LocalDateTime modifiedAt;
    private String modifiedBy;
    private List<InventoryAuditDetailResponse> details;
}
