import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/shared.css";
import "../receipts/receipts.css";
import "./audits.css";
import { getAuditById, confirmAudit, cancelAudit } from "../../api/auditApi";
import { getAvailableLocations } from "../../api/issueApi";

const STATUS_LABELS = {
    DRAFT: "Nháp",
    REQUESTED: "Chờ xử lý",
    SUBMITTED: "Chờ duyệt",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
};
const STATUS_CLASS = {
    DRAFT: "rc-status-pill au-status-pill-draft",
    REQUESTED: "rc-status-pill au-status-pill-requested",
    SUBMITTED: "rc-status-pill au-status-pill-submitted",
    CONFIRMED: "rc-status-pill au-status-pill-confirmed",
    CANCELLED: "rc-status-pill au-status-pill-cancelled",
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

function IconChevron() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function DiffCell({ diff }) {
    if (diff === null || diff === undefined) return <td className="rc-td-num">—</td>;
    if (diff > 0) return (
        <td className={`rc-td-num au-td-plus`}>
            <span className="au-diff-plus">+{diff}</span>
        </td>
    );
    if (diff < 0) return (
        <td className={`rc-td-num au-td-minus`}>
            <span className="au-diff-minus">{diff}</span>
        </td>
    );
    return <td className="rc-td-num"><span className="au-diff-zero">0</span></td>;
}

export default function AuditDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [audit, setAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [locationsByItem, setLocationsByItem] = useState({});
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user?.role === "STAFF";
    // Manager can confirm from DRAFT or SUBMITTED
    const canConfirm = !isStaff && (audit?.docstatus === "DRAFT" || audit?.docstatus === "SUBMITTED");
    const canCancel = !isStaff && audit?.docstatus === "DRAFT";
    const canOpenMenu = canConfirm || canCancel;
    const canCreateAdjustment = !isStaff && audit?.docstatus === "CONFIRMED";

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

    const fetchAudit = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAuditById(id);
            setAudit(data);
        } catch {
            setError("Không thể tải chi tiết phiếu kiểm kê.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchAudit(); }, [fetchAudit]);

    useEffect(() => {
        const loadLocations = async () => {
            if (!audit?.details || audit.details.length === 0) {
                setLocationsByItem({});
                return;
            }
            try {
                const itemIds = Array.from(new Set(audit.details.map((d) => d.itemId).filter(Boolean)));
                const results = await Promise.all(itemIds.map((itemId) => getAvailableLocations(itemId)));
                const map = {};
                itemIds.forEach((itemId, idx) => {
                    const locs = results[idx] || [];
                    const codes = locs.map((loc) => loc.locationcode || loc.locationname).filter(Boolean);
                    map[String(itemId)] = Array.from(new Set(codes));
                });
                setLocationsByItem(map);
            } catch {
                setLocationsByItem({});
            }
        };
        loadLocations();
    }, [audit?.details]);

    const handleConfirm = async () => {
        setConfirmModal(false);
        setActionLoading(true);
        try {
            const res = await confirmAudit(id);
            if (res?.success) {
                showToast("success", "Xác nhận kiểm kê thành công! Tồn kho đã được điều chỉnh.");
                await fetchAudit();
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
            const res = await cancelAudit(id);
            if (res?.success) {
                showToast("success", "Đã hủy phiếu kiểm kê.");
                await fetchAudit();
            } else {
                showToast("error", res?.message || "Hủy thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra.");
        } finally { setActionLoading(false); setStatusMenuOpen(false); }
    };

    // Tổng hợp chênh lệch
    const summary = audit?.details ? audit.details.reduce(
        (acc, d) => {
            const diff = d.diffquantity ?? 0;
            if (diff > 0) acc.plus += diff;
            else if (diff < 0) acc.minus += diff;
            return acc;
        },
        { plus: 0, minus: 0 }
    ) : null;

    return (
        <>
            {/* Confirm modal */}
            {confirmModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: "32px 36px", minWidth: 360, maxWidth: 440, boxShadow: "0 8px 32px rgba(30,133,74,0.15)", border: "1.5px solid #c6dfd0", textAlign: "center" }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E854A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <h3 style={{ margin: "0 0 8px", color: "#1E3A2F", fontSize: "1.1rem", fontWeight: 700 }}>Xác nhận phiếu kiểm kê</h3>
                        <p style={{ margin: "0 0 8px", color: "#4c6152", fontSize: "0.92rem" }}>
                            Tồn kho sẽ được điều chỉnh theo chênh lệch thực tế. Hành động này không thể hoàn tác.
                        </p>
                        {summary && (summary.plus !== 0 || summary.minus !== 0) && (
                            <div style={{ margin: "8px 0 20px", display: "flex", justifyContent: "center", gap: 24, fontSize: "0.9rem" }}>
                                {summary.plus > 0 && (
                                    <span style={{ color: "#1b5e20", fontWeight: 700 }}>+{summary.plus} thừa</span>
                                )}
                                {summary.minus < 0 && (
                                    <span style={{ color: "#b71c1c", fontWeight: 700 }}>{summary.minus} thiếu</span>
                                )}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
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
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/audits")}>Kiểm kê hàng tồn kho</span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Chi tiết phiếu kiểm kê</span>
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
                    <h1 className="sp-title">Kiểm kê hàng tồn kho</h1>

                    {loading && <div style={{ textAlign: "center", color: "#4c6152", padding: "40px 0" }}>Đang tải...</div>}
                    {!loading && error && <div style={{ textAlign: "center", color: "#b71c1c", padding: "40px 0" }}>{error}</div>}

                    {!loading && !error && audit && (
                        <div className="rc-form-card">
                            {/* ── Header ── */}
                            <div className="rc-header-row">
                                <label className="rc-form-label">Ngày</label>
                                <input type="date" className="rc-form-input" style={{ minWidth: 150 }} value={formatDateInput(audit.docDate)} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Số</label>
                                <input className="rc-form-input" style={{ minWidth: 200 }} value={audit.docno || ""} readOnly />
                                <label className="rc-form-label" style={{ marginLeft: 16 }}>Người lập</label>
                                <input className="rc-form-input" style={{ minWidth: 180 }} value={audit.createdByFullname || audit.createdByUsername || ""} readOnly />

                                {audit.docstatus !== "DRAFT" && (
                                    <>
                                        <label className="rc-form-label" style={{ marginLeft: 16 }}>
                                            {audit.docstatus === "CANCELLED" ? "Người hủy" : "Người kiểm kê"}
                                        </label>
                                        <input
                                            className="rc-form-input"
                                            style={{ minWidth: 180 }}
                                            value={audit.modifiedBy || ""}
                                            readOnly
                                        />
                                    </>
                                )}

                                {/* Status pill with dropdown – Manager only */}
                                <div style={{ position: "relative", marginLeft: "auto" }}>
                                    <button
                                        className={STATUS_CLASS[audit.docstatus] || "rc-status-pill"}
                                        onClick={() => canOpenMenu && setStatusMenuOpen((v) => !v)}
                                        style={{ cursor: canOpenMenu ? "pointer" : "default" }}
                                        disabled={actionLoading}
                                    >
                                        {STATUS_LABELS[audit.docstatus] || audit.docstatus}
                                        {canOpenMenu && <IconChevron />}
                                    </button>
                                    {statusMenuOpen && canOpenMenu && (
                                        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1.5px solid #c6dfd0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 170, padding: "4px 0" }}>
                                            {canConfirm && (
                                                <div
                                                    style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#1a7f4b", fontWeight: 600 }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3faf6"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = ""}
                                                    onClick={() => { setStatusMenuOpen(false); setConfirmModal(true); }}
                                                >
                                                    ✓ Xác nhận kiểm kê
                                                </div>
                                            )}
                                            {canCancel && (
                                                <div
                                                    style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#b71c1c" }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "#fce4ec"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = ""}
                                                    onClick={handleCancel}
                                                >
                                                    ✕ Hủy phiếu
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Nhân viên được giao ── */}
                            {(audit.assignedUserFullname || audit.assignedUsername) && (
                                <div className="rc-form-row">
                                    <label className="rc-form-label">Nhân viên kiểm kê</label>
                                    <input className="rc-form-input" style={{ minWidth: 200 }} value={audit.assignedUserFullname || audit.assignedUsername || ""} readOnly />
                                    <span style={{ marginLeft: 10, fontSize: "0.82rem", color: "#f57f17", fontWeight: 600 }}>
                                        {audit.docstatus === "REQUESTED" ? "Đang chờ nhân viên xử lý" : audit.docstatus === "SUBMITTED" ? "Nhân viên đã gửi kết quả" : ""}
                                    </span>
                                </div>
                            )}

                            {/* ── Diễn giải ── */}
                            {audit.description && (
                                <div className="rc-form-row">
                                    <label className="rc-form-label">Diễn giải</label>
                                    <input className="rc-form-input rc-form-full" value={audit.description} readOnly />
                                </div>
                            )}

                            {(audit.locationcode || audit.locationname) && (
                                <div className="rc-form-row">
                                    <label className="rc-form-label">Vị trí</label>
                                    <input
                                        className="rc-form-input rc-form-full"
                                        value={audit.locationcode ? `${audit.locationcode} - ${audit.locationname || ""}` : (audit.locationname || "")}
                                        readOnly
                                    />
                                </div>
                            )}

                            {/* ── Summary bar (chỉ show khi có dữ liệu diff) ──
                            {audit.docstatus !== "DRAFT" && summary && (
                                <div className="au-summary-bar">
                                    <div className="au-summary-item">
                                        <span className="au-summary-label">Số mặt hàng kiểm kê</span>
                                        <span className="au-summary-value">{audit.details?.length ?? 0}</span>
                                    </div>
                                    <div className="au-summary-item">
                                        <span className="au-summary-label">Thừa hàng (tổng cộng)</span>
                                        <span className={`au-summary-value ${summary.plus > 0 ? "au-val-plus" : ""}`}>
                                            {summary.plus > 0 ? `+${summary.plus}` : "0"}
                                        </span>
                                    </div>
                                    <div className="au-summary-item">
                                        <span className="au-summary-label">Thiếu hàng (tổng cộng)</span>
                                        <span className={`au-summary-value ${summary.minus < 0 ? "au-val-minus" : ""}`}>
                                            {summary.minus < 0 ? summary.minus : "0"}
                                        </span>
                                    </div>
                                    <div className="au-summary-item">
                                        <span className="au-summary-label">Không chênh lệch</span>
                                        <span className="au-summary-value">
                                            {audit.details?.filter((d) => (d.diffquantity ?? 0) === 0).length ?? 0}
                                        </span>
                                    </div>
                                </div>
                            )} */}

                            {/* ── DRAFT hint ── */}
                            {audit.docstatus === "DRAFT" && audit.details && audit.details.length > 0 && (
                                <div style={{ background: "#eceff1", border: "1px solid #b0bec5", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.85rem", color: "#37474f" }}>
                                    Phiếu đang ở trạng thái <strong>Nháp</strong>. Có thể giao cho nhân viên hoặc xác nhận trực tiếp.
                                </div>
                            )}
                            {audit.docstatus === "REQUESTED" && (
                                <div style={{ background: "#fff9c4", border: "1px solid #ffd54f", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.85rem", color: "#5d4037" }}>
                                    Phiếu đã <strong>giao cho nhân viên</strong>. Đang chờ nhân viên kiểm kê và gửi kết quả.
                                </div>
                            )}
                            {audit.docstatus === "SUBMITTED" && !isStaff && (
                                <div style={{ background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.85rem", color: "#5d4037" }}>
                                    Nhân viên đã <strong>gửi kết quả kiểm kê</strong>. Vui lòng xem xét và xác nhận hoặc hủy.
                                </div>
                            )}

                            {/* ── Detail table ── */}
                            <div className="rc-detail-table-wrap">
                                <table className="rc-detail-table" style={{ width: "100%" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "4%" }}>STT</th>
                                            <th style={{ width: "9%" }}>Mã hàng</th>
                                            <th style={{ width: "18%" }}>Tên vật tư hàng hóa</th>
                                            <th style={{ width: "22%" }}>Vị trí kiểm kê</th>
                                            <th style={{ width: "5%" }}>Đơn vị</th>
                                            <th style={{ width: "9%", textAlign: "right" }}>SL hệ thống</th>
                                            <th style={{ width: "9%", textAlign: "right" }}>SL thực tế</th>
                                            <th style={{ width: "8%", textAlign: "right" }}>Chênh lệch</th>
                                            <th style={{ width: "16%" }}>Đề xuất xử lý</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {audit.details && audit.details.map((d, idx) => {
                                            const diff = d.diffquantity ?? null;
                                            let suggestion = null;
                                            if (diff !== null && diff > 0) {
                                                suggestion = (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f5e9", color: "#1a7f4b", borderRadius: 6, padding: "3px 10px", fontSize: "0.82rem", fontWeight: 600 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                                        Tạo phiếu nhập
                                                    </span>
                                                );
                                            } else if (diff !== null && diff < 0) {
                                                suggestion = (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fce4ec", color: "#c62828", borderRadius: 6, padding: "3px 10px", fontSize: "0.82rem", fontWeight: 600 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                                        Tạo phiếu xuất
                                                    </span>
                                                );
                                            }
                                            return (
                                                <tr key={d.id || idx}>
                                                    <td className="rc-td-stt">{idx + 1}</td>
                                                    <td style={{ fontWeight: 600, color: "#1E854A" }}>{d.itemcode}</td>
                                                    <td>{d.itemname}</td>
                                                    <td>
                                                        {d.locationEntries && d.locationEntries.length > 0 ? (
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.82rem" }}>
                                                                {d.locationEntries.map((e) => (
                                                                    <span key={`${d.itemId}-${e.locationId}`} style={{ color: "#4c6152" }}>
                                                                        {e.locationcode}: <strong>{e.actualQty}</strong> / {e.systemQty}
                                                                        {(e.batchCodes || []).length > 0 && (
                                                                            <span style={{ color: "#8ba392", marginLeft: 4 }}>
                                                                                (Lô: {e.batchCodes.join(", ")})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            (locationsByItem[String(d.itemId)] || []).length > 0
                                                                ? locationsByItem[String(d.itemId)].join(", ")
                                                                : "—"
                                                        )}
                                                    </td>
                                                    <td>{d.unitof}</td>
                                                    <td className="rc-td-num au-book-qty">{d.bookquantity ?? "—"}</td>
                                                    <td className="rc-td-num" style={{ fontWeight: 600, color: "#1E3A2F" }}>{d.actualquantity}</td>
                                                    <DiffCell diff={diff} />
                                                    <td style={{ whiteSpace: "nowrap" }}>{suggestion ?? <span style={{ color: "#8ba392", fontSize: "0.83rem" }}>Khớp sổ sách</span>}</td>
                                                </tr>
                                            );
                                        })}
                                        {(!audit.details || audit.details.length === 0) && (
                                            <tr><td colSpan={9} style={{ textAlign: "center", color: "#8ba392", padding: 16 }}>Không có dữ liệu chi tiết.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Actions ── */}
                            <div className="rc-form-actions">
                                <button className="sp-btn-outline" onClick={() => navigate("/audits")}>Quay lại</button>
                                {canCreateAdjustment && (
                                    <>
                                        <button
                                            className="sp-btn-outline"
                                            onClick={() => navigate(`/receipts/create?docType=ADJUSTMENT&auditId=${audit.id}`)}
                                        >
                                            Tạo phiếu nhập điều chỉnh
                                        </button>
                                        <button
                                            className="sp-btn-outline"
                                            onClick={() => navigate(`/issues/create?docType=ADJUSTMENT&auditId=${audit.id}`)}
                                        >
                                            Tạo phiếu xuất điều chỉnh
                                        </button>
                                    </>
                                )}
                                {canConfirm && (
                                    <button className="sp-btn-primary" onClick={() => setConfirmModal(true)} disabled={actionLoading}>
                                        {actionLoading ? "Đang xử lý..." : "Xác nhận kiểm kê"}
                                    </button>
                                )}
                                {canCancel && (
                                    <button className="sp-btn-danger-outline" onClick={handleCancel} disabled={actionLoading}>
                                        {actionLoading ? "Đang xử lý..." : "Hủy phiếu"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
