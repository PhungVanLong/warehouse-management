import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import "../receipts/receipts.css";
import "./audits.css";
import { createAudit, getAllAudits } from "../../api/auditApi";
import { getAllItems } from "../../api/itemApi";
import { getAllBatches } from "../../api/batchApi";
import { getAllEmployees } from "../../api/employeeApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _rowKey = 0;
const newRow = () => ({
    _id: ++_rowKey,
    itemId: "",
    itemcode: "",
    itemname: "",
    unitof: "",
    actualquantity: "",
    bookquantity: null,   // null = chưa load
    loadingBook: false,
});

function buildNextDocno(prefix, list) {
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    const maxNum = (list || []).reduce((max, r) => {
        const m = String(r.docno || "").match(regex);
        if (!m) return max;
        const n = Number(m[1]);
        return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const next = String(maxNum + 1).padStart(2, "0");
    return `${prefix}-${next}`;
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconPlus({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
function IconTrash() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditCreatePage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user?.role === "STAFF";

    const [form, setForm] = useState({ date: todayStr(), docno: "", description: "", assigneeId: "" });
    const [rows, setRows] = useState([newRow()]);
    const [items, setItems] = useState([]);
    const [stockByItem, setStockByItem] = useState({});
    const [employees, setEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const showActual = !form.assigneeId;

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [iList, eList, bList, aList] = await Promise.all([getAllItems(), getAllEmployees(), getAllBatches(), getAllAudits()]);
            setItems(iList);
            setEmployees(eList);
            const stockMap = (bList || []).reduce((acc, batch) => {
                const key = String(batch.itemId ?? "");
                if (!key) return acc;
                const qty = Number(batch.quantityRemaining ?? 0);
                acc[key] = (acc[key] || 0) + qty;
                return acc;
            }, {});
            setStockByItem(stockMap);
            setForm((prev) => ({
                ...prev,
                docno: prev.docno || buildNextDocno("PKK", aList),
            }));
        } catch { /* non-blocking */ } finally { setLoadingData(false); }
    }, []);
    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        setRows((prev) => prev.map((row) => {
            if (!row.itemId) return row;
            return {
                ...row,
                bookquantity: stockByItem[String(row.itemId)] ?? 0,
                loadingBook: false,
            };
        }));
    }, [stockByItem]);

    useEffect(() => {
        // Prevent staff from accessing manager create page
        if (isStaff) navigate("/audits/requests");
    }, [isStaff, navigate]);

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleRowChange = (idx, field, value) => {
        setRows((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            if (field === "itemId") {
                const found = items.find((it) => String(it.id) === String(value));
                next[idx].itemcode = found?.itemcode || "";
                next[idx].itemname = found?.itemname || "";
                next[idx].unitof = found?.unitof || "";
                next[idx].bookquantity = value ? (stockByItem[String(value)] ?? 0) : null;
                next[idx].loadingBook = false;
            }
            return next;
        });
    };

    const handleAddRow = () => setRows((prev) => [...prev, newRow()]);
    const handleRemoveRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (!form.date) { showToast("error", "Vui lòng chọn ngày kiểm kê."); return; }
        if (!form.docno.trim()) { showToast("error", "Vui lòng nhập số chứng từ."); return; }
        if (rows.length === 0) { showToast("error", "Vui lòng thêm ít nhất một dòng vật tư."); return; }
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r.itemId) { showToast("error", `Dòng ${i + 1}: Vui lòng chọn mặt hàng.`); return; }
            if (!form.assigneeId) {
                const missingQty = r.actualquantity === "" || r.actualquantity === null || r.actualquantity === undefined;
                if (missingQty) { showToast("error", `Dòng ${i + 1}: Vui lòng nhập số lượng thực tế.`); return; }
            }
        }
        // Check duplicate items
        const itemIds = rows.map((r) => r.itemId);
        if (new Set(itemIds).size !== itemIds.length) {
            showToast("error", "Có mặt hàng bị trùng. Mỗi mặt hàng chỉ được nhập một lần."); return;
        }

        const details = rows.map((r) => ({
            itemId: Number(r.itemId),
            actualquantity: r.actualquantity === "" || r.actualquantity === null || r.actualquantity === undefined ? null : Number(r.actualquantity),
        }));

        setSaving(true);
        try {
            // Build payload according to API: include assignedUserId + sendToStaff when assigning
            const payload = {
                docno: form.docno.trim(),
                docDate: form.date,
                description: form.description.trim() || null,
                details,
            };
            if (form.assigneeId) {
                payload.assignedUserId = Number(form.assigneeId);
                payload.sendToStaff = true;
            }
            const result = await createAudit(payload);
            if (result?.success) {
                showToast("success", form.assigneeId ? "Đã gửi yêu cầu kiểm kê cho nhân viên." : "Tạo phiếu kiểm kê thành công.");
                const newId = result?.data?.id;
                setTimeout(() => navigate(newId ? `/audits/${newId}` : "/audits"), 1200);
            } else {
                showToast("error", result?.message || "Tạo phiếu thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu kiểm kê.");
        } finally { setSaving(false); }
    };

    return (
        <>
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
                            <span className="sp-breadcrumb-active">Thêm mới phiếu kiểm kê</span>
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
                    <h1 className="sp-title">Phiếu kiểm kê hàng tồn kho</h1>

                    <div className="rc-form-card">
                        {/* ── Header row ── */}
                        <div className="rc-header-row">
                            <label className="rc-form-label">Ngày</label>
                            <input
                                type="date"
                                className="rc-form-input"
                                style={{ minWidth: 150 }}
                                value={form.date}
                                onChange={(e) => handleFormChange("date", e.target.value)}
                            />
                            <label className="rc-form-label" style={{ marginLeft: 16 }}>Số</label>
                            <input
                                className="rc-form-input"
                                style={{ minWidth: 200 }}
                                placeholder="Nhập số chứng từ (VD: KK-2026-001)"
                                value={form.docno}
                                onChange={(e) => handleFormChange("docno", e.target.value)}
                            />
                        </div>

                        {/* ── Nhân viên kiểm kê ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Nhân viên kiểm kê</label>
                            <select
                                className="rc-form-select rc-form-full"
                                value={form.assigneeId}
                                onChange={(e) => handleFormChange("assigneeId", e.target.value)}
                                disabled={loadingData}
                            >
                                <option value="">(Không giao, tự kiểm kê)</option>
                                {employees.filter((e) => e.role === "STAFF").map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.usercode ? `${emp.usercode}: ` : ""}{emp.fullname}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Diễn giải ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Diễn giải</label>
                            <input
                                className="rc-form-input rc-form-full"
                                placeholder="Nhập diễn giải (VD: Kiểm kê tháng 5)"
                                value={form.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                            />
                        </div>

                        {/* ── Detail table ── */}
                        <div style={{ marginTop: 8, marginBottom: 4, color: "#4c6152", fontSize: "0.84rem" }}>
                            Chọn danh sách hàng hóa cần kiểm kê. Nếu không giao cho nhân viên, vui lòng nhập số lượng thực tế.
                        </div>
                        <div className="rc-detail-table-wrap">
                            <table className="rc-detail-table">
                                <thead>
                                    <tr>
                                        <th className="rc-td-stt" style={{ width: 36 }}>STT</th>
                                        <th style={{ width: "9%" }}>Mã hàng</th>
                                        <th style={{ width: "18%" }}>Tên vật tư hàng hóa</th>
                                        <th style={{ width: "7%" }}>ĐVT</th>
                                        <th className="au-th-book">SL hệ thống</th>
                                        {showActual && <th className="au-th-actual">SL thực tế</th>}
                                        <th style={{ width: 32 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => {
                                        const bq = row.bookquantity;
                                        return (
                                            <tr key={row._id}>
                                                <td className="rc-td-stt">{idx + 1}</td>
                                                <td>
                                                    <select
                                                        className="rc-td-select"
                                                        value={row.itemId}
                                                        onChange={(e) => handleRowChange(idx, "itemId", e.target.value)}
                                                        disabled={loadingData}
                                                    >
                                                        <option value="">--</option>
                                                        {items.map((it) => (
                                                            <option key={it.id} value={it.id}>{it.itemcode}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        className="rc-td-input"
                                                        value={row.itemname}
                                                        readOnly
                                                        placeholder="Tên vật tư"
                                                        style={{ background: "#f6fbf8", color: "#4c6152" }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="rc-td-input"
                                                        style={{ background: "#f6fbf8", color: "#4c6152" }}
                                                        value={row.unitof}
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="rc-td-num au-book-qty" style={{ textAlign: "right" }}>
                                                    {row.loadingBook
                                                        ? <span style={{ color: "#8ba392", fontSize: "0.8rem" }}>...</span>
                                                        : bq !== null
                                                            ? <span style={{ fontWeight: 600, color: "#4c6152" }}>{bq}</span>
                                                            : <span style={{ color: "#c5cdc9", fontSize: "0.85rem" }}>—</span>}
                                                </td>
                                                {showActual && (
                                                    <td>
                                                        <input
                                                            className="rc-td-input rc-td-num"
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={row.actualquantity}
                                                            onChange={(e) => handleRowChange(idx, "actualquantity", e.target.value)}
                                                            disabled={loadingData}
                                                            style={{ width: "90%" }}
                                                        />
                                                    </td>
                                                )}
                                                <td>
                                                    <button
                                                        className="rc-row-del-btn"
                                                        onClick={() => handleRemoveRow(idx)}
                                                        type="button"
                                                        title="Xóa dòng"
                                                    >
                                                        <IconTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="rc-add-row" onClick={handleAddRow}>
                                        <td colSpan={showActual ? 7 : 6}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#2DBE60", fontWeight: 500, fontSize: "0.87rem" }}>
                                                <IconPlus /> Thêm dòng vật tư
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ── Actions ── */}
                        <div className="rc-form-actions">
                            <button className="sp-btn-outline" onClick={() => navigate("/audits")}>Hủy bỏ</button>
                            <button className="sp-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu phiếu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
