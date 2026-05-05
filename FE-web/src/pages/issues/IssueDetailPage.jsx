import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/shared.css";
import "../receipts/receipts.css";
import "./issues.css";
import { getIssueById, confirmIssue, cancelIssue } from "../../api/issueApi";

const STATUS_LABELS = { DRAFT: "Chờ duyệt", CONFIRMED: "Đã duyệt", CANCELLED: "Hủy" };
const STATUS_CLASS = {
    DRAFT: "rc-status-pill rc-status-pill-draft",
    CONFIRMED: "rc-status-pill rc-status-pill-confirmed",
    CANCELLED: "rc-status-pill rc-status-pill-cancelled",
};

function formatDate(str) {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function formatDateInput(str) {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatMoney(n) {
    if (!n && n !== 0) return "";
    return Number(n).toLocaleString("vi-VN");
}

function IconChevron() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

    const fetchIssue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getIssueById(id);
            setIssue(data);
        } catch {
            setError("Không thể tải chi tiết phiếu xuất kho.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchIssue(); }, [fetchIssue]);

    const handleConfirm = async () => {
        setConfirmModal(false);
        setActionLoading(true);
        try {
            const res = await confirmIssue(id);
            if (res?.success) {
                showToast("success", "Xác nhận phiếu xuất kho thành công!");
                await fetchIssue();
            } else {
                showToast("error", res?.message || "Xác nhận thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra.");
        } finally { setActionLoading(false); setStatusMenuOpen(false); }
    };

    const handleCancel = async () => {
        setActionLoading(true);
        try {
            const res = await cancelIssue(id);
            if (res?.success) {
                showToast("success", "Đã hủy phiếu xuất kho.");
                await fetchIssue();
            } else {
                showToast("error", res?.message || "Hủy thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra.");
        } finally { setActionLoading(false); setStatusMenuOpen(false); }
    };

    const totalAmount = issue?.details
        ? issue.details.reduce((s, d) => s + (d.amount || (d.quantity || 0) * (d.unitprice || 0)), 0)
        : 0;

    // Group details by itemId
    const groupedDetails = issue?.details
        ? Object.values(
            issue.details.reduce((acc, d) => {
                const key = d.itemId;
                if (!acc[key]) {
                    acc[key] = { ...d, locations: [d.locationcode || d.locationId], amounts: d.amount || (d.quantity || 0) * (d.unitprice || 0), quantities: d.quantity };
                } else {
                    acc[key].locations.push(d.locationcode || d.locationId);
                    acc[key].amounts += (d.amount || (d.quantity || 0) * (d.unitprice || 0));
                    acc[key].quantities += (d.quantity || 0);
                }
                return acc;
            }, {})
        )
        : [];

    return (
        <>
            {confirmModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: "32px 36px", minWidth: 340, boxShadow: "0 8px 32px rgba(30,133,74,0.15)", border: "1.5px solid #c6dfd0", textAlign: "center" }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E854A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <h3 style={{ margin: "0 0 8px", color: "#1E3A2F", fontSize: "1.1rem", fontWeight: 700 }}>Xác nhận phiếu xuất kho</h3>
                        <p style={{ margin: "0 0 24px", color: "#4c6152", fontSize: "0.92rem" }}>Tồn kho sẽ bị trừ sau khi xác nhận. Bạn có chắc chắn muốn tiếp tục không?</p>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                            <button className="sp-btn-outline" onClick={() => setConfirmModal(false)} disabled={actionLoading} style={{ minWidth: 100 }}>Hủy bỏ</button>
                            <button className="sp-btn-primary" onClick={handleConfirm} disabled={actionLoading} style={{ minWidth: 120 }}>
                                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {toast && (
                <div className={`sp-toast ${toast.type === "success" ? "sp-toast-success" : "sp-toast-error"}`}>{toast.msg}</div>
            )}
            <div className="sp-main">
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Chứng từ &rsaquo;{" "}
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/issues")}>Phiếu xuất kho</span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Chi tiết phiếu xuất kho</span>
                        </div>
                    </div>
                    <div className="sp-topbar-right">
                        <button className="sp-icon-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="sp-notif-dot" />
                        </button>
                        <div className="sp-avatar" />
                    </div>
                </div>

                <div className="sp-content">
                    <h1 className="sp-title">Phiếu xuất kho</h1>

                    {loading && <div style={{ textAlign: "center", color: "#4c6152", padding: "40px 0" }}>Đang tải...</div>}
                    {!loading && error && <div style={{ textAlign: "center", color: "#b71c1c", padding: "40px 0" }}>{error}</div>}

                    {!loading && !error && issue && (
                        <div className="rc-form-card">
                            {/* ── Header ── */}
                            <div className="rc-header-row">
                                <label className="rc-form-label">Ngày</label>
                                <input type="date" className="rc-form-input" style={{ minWidth: 150 }} value={formatDateInput(issue.docDate)} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Số</label>
                                <input className="rc-form-input" style={{ minWidth: 200 }} value={issue.docno || ""} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Người lập</label>
                                <input className="rc-form-input" style={{ minWidth: 200 }} value={issue.createdByFullname || issue.createdByName || ""} readOnly />

                                {/* Status pill with dropdown */}
                                <div style={{ position: "relative", marginLeft: "auto" }}>
                                    <button
                                        className={STATUS_CLASS[issue.docstatus] || "rc-status-pill"}
                                        onClick={() => issue.docstatus === "DRAFT" && setStatusMenuOpen((v) => !v)}
                                        style={{ cursor: issue.docstatus === "DRAFT" ? "pointer" : "default" }}
                                        disabled={actionLoading}
                                    >
                                        {STATUS_LABELS[issue.docstatus] || issue.docstatus}
                                        {issue.docstatus === "DRAFT" && <IconChevron />}
                                    </button>
                                    {statusMenuOpen && issue.docstatus === "DRAFT" && (
                                        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1.5px solid #c6dfd0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 160, padding: "4px 0" }}>
                                            <div style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#1a7f4b", fontWeight: 600 }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#f3faf6"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = ""}
                                                onClick={() => { setStatusMenuOpen(false); setConfirmModal(true); }}>
                                                ✓ Xác nhận phiếu
                                            </div>
                                            <div style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#b71c1c" }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#fce4ec"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = ""}
                                                onClick={handleCancel}>
                                                ✕ Hủy phiếu
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Đối tượng ── */}
                            <div className="rc-form-row">
                                <label className="rc-form-label">Đối tượng</label>
                                <input className="rc-form-input rc-form-full" value={issue.customerName || ""} readOnly />
                            </div>

                            {/* ── Diễn giải ── */}
                            <div className="rc-form-row">
                                <label className="rc-form-label">Diễn giải</label>
                                <input className="rc-form-input rc-form-full" value={issue.description || ""} readOnly />
                            </div>

                            {/* ── Địa chỉ ── */}
                            {issue.address && (
                                <div className="rc-form-row">
                                    <label className="rc-form-label">Địa chỉ</label>
                                    <input className="rc-form-input rc-form-full" value={issue.address} readOnly />
                                </div>
                            )}

                            {/* ── Detail table ── */}
                            <div className="rc-detail-table-wrap">
                                <table className="rc-detail-table">
                                    <thead>
                                        <tr>
                                            <th className="rc-td-stt">STT</th>
                                            <th>Mã hàng</th>
                                            <th>Tên hàng hóa</th>
                                            <th>Đơn vị</th>
                                            <th>Số lượng</th>
                                            <th>Vị trí</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedDetails.map((d, idx) => (
                                            <tr key={idx}>
                                                <td className="rc-td-stt">{idx + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#1E854A" }}>{d.itemcode}</td>
                                                <td>{d.itemname}</td>
                                                <td>{d.unitof}</td>
                                                <td className="rc-td-num">{d.quantities}</td>
                                                <td style={{ color: "#1E854A", fontWeight: 500 }}>
                                                    {Array.isArray(d.locations) ? d.locations.join(" / ") : d.locations}
                                                </td>
                                                <td className="rc-td-num">{formatMoney(d.unitprice)}</td>
                                                <td className="rc-td-num" style={{ fontWeight: 500 }}>{formatMoney(d.amounts)}</td>
                                            </tr>
                                        ))}
                                        {groupedDetails.length === 0 && (
                                            <tr><td colSpan={8} style={{ textAlign: "center", color: "#8ba392", padding: 16 }}>Không có dữ liệu chi tiết.</td></tr>
                                        )}
                                        {totalAmount > 0 && (
                                            <tr className="rc-total-row">
                                                <td colSpan={7} style={{ textAlign: "right", paddingRight: 12 }}>Tổng cộng</td>
                                                <td className="rc-td-num" style={{ textAlign: "right" }}>{formatMoney(totalAmount)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Actions ── */}
                            <div className="rc-form-actions">
                                <button className="sp-btn-outline" onClick={() => navigate("/issues")}>Hủy bỏ</button>
                                {issue.docstatus === "DRAFT" && (
                                    <button className="sp-btn-primary" onClick={() => setConfirmModal(true)} disabled={actionLoading}>
                                        {actionLoading ? "Đang xử lý..." : "Xác nhận"}
                                    </button>
                                )}
                                {issue.docstatus !== "DRAFT" && (
                                    <button className="sp-btn-primary" onClick={() => navigate("/issues")}>Lưu</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
