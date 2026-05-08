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

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canConfirmCancel = user?.role === "ADMIN" || user?.role === "MANAGER";

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
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
                localStorage.setItem("batchesNeedsRefresh", String(Date.now()));
                window.dispatchEvent(new Event("batches:refresh"));
            } else {
                showToast("error", res?.message || "Xác nhận thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra.");
        } finally { setActionLoading(false); }
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
        } finally { setActionLoading(false); }
    };

    const totalAmount = issue?.details
        ? issue.details.reduce((s, d) => s + (d.amount || (d.quantity || 0) * (d.unitprice || 0)), 0)
        : 0;

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
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Đối tượng</label>
                                <input className="rc-form-input" style={{ minWidth: 200 }} value={issue.customerName || ""} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Số</label>
                                <input className="rc-form-input" style={{ minWidth: 150 }} value={issue.docno || ""} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Loại</label>
                                <input className="rc-form-input" style={{ minWidth: 150 }} value={issue.docType || issue.doctype || "NORMAL"} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Người lập</label>
                                <input className="rc-form-input" style={{ minWidth: 160 }} value={issue.createdByFullname || issue.createdByName || ""} readOnly />
                                {/* Status pill – static badge, no dropdown */}
                                <span className={`${STATUS_CLASS[issue.docstatus] || "rc-status-pill"} rc-status-inline`} style={{ marginLeft: "auto", cursor: "default", pointerEvents: "none" }}>
                                    {STATUS_LABELS[issue.docstatus] || issue.docstatus}
                                </span>
                            </div>

                            {/* ── Approver / Canceller info row ── */}
                            {issue.docstatus === "CANCELLED" ? (
                                <div className="rc-header-row" style={{ marginTop: -6 }}>
                                    <label className="rc-form-label">Người hủy</label>
                                    <input className="rc-form-input" style={{ minWidth: 200 }} value={issue.cancelledByFullname || issue.cancelledByUsername || ""} readOnly />
                                    {issue.cancelledAt && (
                                        <>
                                            <label className="rc-form-label" style={{ marginLeft: 16 }}>Ngày hủy</label>
                                            <input className="rc-form-input" style={{ minWidth: 170 }} value={formatDate(issue.cancelledAt)} readOnly />
                                        </>
                                    )}
                                </div>
                            ) : issue.approvedByFullname || issue.approvedByUsername ? (
                                <div className="rc-header-row" style={{ marginTop: -6 }}>
                                    <label className="rc-form-label">Người kiểm kê</label>
                                    <input className="rc-form-input" style={{ minWidth: 200 }} value={issue.approvedByFullname || issue.approvedByUsername || ""} readOnly />
                                    {issue.approvedAt && (
                                        <>
                                            <label className="rc-form-label" style={{ marginLeft: 16 }}>Ngày duyệt</label>
                                            <input className="rc-form-input" style={{ minWidth: 170 }} value={formatDate(issue.approvedAt)} readOnly />
                                        </>
                                    )}
                                </div>
                            ) : null}

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

                            <div className="rc-detail-table-wrap">
                                <table className="rc-detail-table" style={{ tableLayout: "auto" }}>
                                    <thead>
                                        <tr>
                                            <th className="rc-td-stt">STT</th>
                                            <th style={{ width: "11%" }}>Mã hàng</th>
                                            <th style={{ width: "22%" }}>Tên hàng hóa</th>
                                            <th style={{ width: "12%" }}>Mã lô</th>
                                            <th style={{ width: "8%" }}>Đơn vị</th>
                                            <th style={{ width: "9%", textAlign: "right" }}>Số lượng</th>
                                            <th style={{ width: "16%" }}>Vị trí</th>
                                            <th style={{ width: "13%", textAlign: "right" }}>Đơn giá</th>
                                            <th style={{ width: "14%", textAlign: "right" }}>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(issue.details || []).map((d, idx) => (
                                            <tr key={d.id || idx}>
                                                <td className="rc-td-stt">{idx + 1}</td>
                                                <td style={{ fontWeight: 600, color: "#1E854A" }}>{d.itemcode}</td>
                                                <td>{d.itemname}</td>
                                                <td>{d.batchCode || d.batchcode || d.batchId || "—"}</td>
                                                <td>{d.unitof}</td>
                                                <td className="rc-td-num">{d.quantity}</td>
                                                <td style={{ color: "#1E854A", fontWeight: 500 }}>{d.locationcode || d.locationId}</td>
                                                <td className="rc-td-num">{formatMoney(d.unitprice)}</td>
                                                <td className="rc-td-num" style={{ fontWeight: 500 }}>{formatMoney(d.amount || (d.quantity || 0) * (d.unitprice || 0))}</td>
                                            </tr>
                                        ))}
                                        {(!issue.details || issue.details.length === 0) && (
                                            <tr><td colSpan={9} style={{ textAlign: "center", color: "#8ba392", padding: 16 }}>Không có dữ liệu chi tiết.</td></tr>
                                        )}
                                        {totalAmount > 0 && (
                                            <tr className="rc-total-row">
                                                <td colSpan={8} style={{ textAlign: "right", paddingRight: 12 }}>Tổng cộng</td>
                                                <td className="rc-td-num" style={{ textAlign: "right" }}>{formatMoney(totalAmount)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* ── Actions ── */}
                            <div className="rc-form-actions">
                                <button className="sp-btn-outline" onClick={() => navigate("/issues")}>Quay lại</button>
                                {issue.docstatus === "DRAFT" && canConfirmCancel && (
                                    <>
                                        <button className="sp-btn-danger-outline" onClick={handleCancel} disabled={actionLoading}>
                                            {actionLoading ? "Đang xử lý..." : "Từ chối"}
                                        </button>
                                        <button className="sp-btn-primary" onClick={() => setConfirmModal(true)} disabled={actionLoading}>
                                            Xác nhận
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
