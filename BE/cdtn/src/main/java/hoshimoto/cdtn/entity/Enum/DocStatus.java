package hoshimoto.cdtn.entity.Enum;

public enum DocStatus {
    DRAFT,       // Phiếu nháp
    REQUESTED,   // Đã gửi yêu cầu xuống nhân viên
    SUBMITTED,   // Nhân viên đã gửi lại kết quả để xác nhận
    CONFIRMED,   // Đã xác nhận
    CANCELLED    // Đã hủy
}
