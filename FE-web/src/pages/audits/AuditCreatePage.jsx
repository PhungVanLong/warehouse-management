import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import "../receipts/receipts.css";
import "./audits.css";
import { createAudit } from "../../api/auditApi";
import { getAllLocations } from "../../api/locationApi";
import { getAllItems } from "../../api/itemApi";
import { getAvailableLocations } from "../../api/issueApi";

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

    const [form, setForm] = useState({ date: todayStr(), docno: "", locationId: "", description: "" });
    const [rows, setRows] = useState([newRow()]);
    const [locations, setLocations] = useState([]);
    const [items, setItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [lList, iList] = await Promise.all([getAllLocations(), getAllItems()]);
            setLocations(lList);
            setItems(iList);
        } catch { /* non-blocking */ } finally { setLoadingData(false); }
    }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Khi đổi vị trí → reset bookquantity tất cả dòng vì tồn kho thay đổi theo vị trí
        if (field === "locationId") {
            setRows((prev) => prev.map((r) => ({ ...r, bookquantity: null, loadingBook: false })));
            // Nếu đã có itemId thì fetch lại cho từng dòng
            if (value) {
                setRows((prev) => {
                    const next = prev.map((r) => ({ ...r, bookquantity: null, loadingBook: r.itemId ? true : false }));
                    next.forEach((r, idx) => {
                        if (r.itemId) {
                            getAvailableLocations(r.itemId).then((locs) => {
                                const match = locs.find((l) => String(l.locationId) === String(value));
                                const bq = match?.items?.find((it) => String(it.itemId) === String(r.itemId))?.quantity ?? 0;
                                setRows((cur) => {
                                    const upd = [...cur];
                                    const i = upd.findIndex((x) => x._id === r._id);
                                    if (i !== -1) upd[i] = { ...upd[i], bookquantity: bq, loadingBook: false };
                                    return upd;
                                });
                            }).catch(() => {
                                setRows((cur) => {
                                    const upd = [...cur];
                                    const i = upd.findIndex((x) => x._id === r._id);
                                    if (i !== -1) upd[i] = { ...upd[i], bookquantity: 0, loadingBook: false };
                                    return upd;
                                });
                            });
                        }
                    });
                    return next;
                });
            }
        }
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
                next[idx].bookquantity = null;
                // Fetch bookquantity nếu đã có vị trí
                if (value && form.locationId) {
                    next[idx].loadingBook = true;
                    const rowId = next[idx]._id;
                    const locId = form.locationId;
                    getAvailableLocations(value).then((locs) => {
                        const match = locs.find((l) => String(l.locationId) === String(locId));
                        const bq = match?.items?.find((it) => String(it.itemId) === String(value))?.quantity ?? 0;
                        setRows((cur) => {
                            const upd = [...cur];
                            const i = upd.findIndex((x) => x._id === rowId);
                            if (i !== -1) upd[i] = { ...upd[i], bookquantity: bq, loadingBook: false };
                            return upd;
                        });
                    }).catch(() => {
                        setRows((cur) => {
                            const upd = [...cur];
                            const i = upd.findIndex((x) => x._id === rowId);
                            if (i !== -1) upd[i] = { ...upd[i], bookquantity: 0, loadingBook: false };
                            return upd;
                        });
                    });
                }
            }
            return next;
        });
    };

    const handleAddRow = () => setRows((prev) => [...prev, newRow()]);
    const handleRemoveRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (!form.date) { showToast("error", "Vui lòng chọn ngày kiểm kê."); return; }
        if (!form.docno.trim()) { showToast("error", "Vui lòng nhập số chứng từ."); return; }
        if (!form.locationId) { showToast("error", "Vui lòng chọn vị trí kiểm kê."); return; }
        if (rows.length === 0) { showToast("error", "Vui lòng thêm ít nhất một dòng vật tư."); return; }
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r.itemId) { showToast("error", `Dòng ${i + 1}: Vui lòng chọn mặt hàng.`); return; }
            if (r.actualquantity === "" || Number(r.actualquantity) < 0) {
                showToast("error", `Dòng ${i + 1}: Vui lòng nhập số lượng thực tế (≥ 0).`); return;
            }
        }
        // Check duplicate items
        const itemIds = rows.map((r) => r.itemId);
        if (new Set(itemIds).size !== itemIds.length) {
            showToast("error", "Có mặt hàng bị trùng. Mỗi mặt hàng chỉ được nhập một lần."); return;
        }

        const details = rows.map((r) => ({
            itemId: Number(r.itemId),
            actualquantity: Number(r.actualquantity),
        }));

        setSaving(true);
        try {
            const result = await createAudit({
                docno: form.docno.trim(),
                docDate: form.date,
                description: form.description.trim() || null,
                locationId: Number(form.locationId),
                details,
            });
            if (result?.success) {
                showToast("success", "Tạo phiếu kiểm kê thành công!");
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

                        {/* ── Vị trí kiểm kê ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Vị trí kiểm kê</label>
                            <select
                                className="rc-form-select rc-form-full"
                                value={form.locationId}
                                onChange={(e) => handleFormChange("locationId", e.target.value)}
                                disabled={loadingData}
                            >
                                <option value="">Chọn vị trí kiểm kê</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.locationcode}{loc.locationname ? ` — ${loc.locationname}` : ""}
                                    </option>
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
                            Nhập số lượng thực tế đếm được tại vị trí. BE sẽ tự so sánh với sổ sách và tính chênh lệch.
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
                                        <th className="au-th-actual">SL thực tế</th>
                                        <th className="au-th-diff">Chênh lệch</th>
                                        <th style={{ width: "14%" }}>Đề xuất xử lý</th>
                                        <th style={{ width: 32 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => {
                                        const bq = row.bookquantity;
                                        const aq = row.actualquantity !== "" ? Number(row.actualquantity) : null;
                                        const diff = (bq !== null && aq !== null) ? aq - bq : null;
                                        let suggestion = null;
                                        if (diff !== null && diff > 0) {
                                            suggestion = (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f5e9", color: "#1a7f4b", borderRadius: 6, padding: "3px 10px", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                                    Tạo phiếu xuất
                                                </span>
                                            );
                                        } else if (diff !== null && diff < 0) {
                                            suggestion = (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fce4ec", color: "#c62828", borderRadius: 6, padding: "3px 10px", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                                    Tạo phiếu nhập
                                                </span>
                                            );
                                        } else if (diff === 0) {
                                            suggestion = <span style={{ color: "#8ba392", fontSize: "0.82rem" }}>Khớp sổ sách</span>;
                                        }
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
                                                <td>
                                                    <input
                                                        className="rc-td-input rc-td-num"
                                                        style={{ width: 90, textAlign: "right", fontWeight: 600 }}
                                                        type="number"
                                                        min="0"
                                                        value={row.actualquantity}
                                                        onChange={(e) => handleRowChange(idx, "actualquantity", e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="rc-td-num" style={{ textAlign: "right" }}>
                                                    {diff === null
                                                        ? <span style={{ color: "#c5cdc9", fontSize: "0.85rem" }}>—</span>
                                                        : diff > 0
                                                            ? <span className="au-diff-plus">+{diff}</span>
                                                            : diff < 0
                                                                ? <span className="au-diff-minus">{diff}</span>
                                                                : <span className="au-diff-zero">0</span>}
                                                </td>
                                                <td>{suggestion ?? <span style={{ color: "#c5cdc9", fontSize: "0.82rem" }}>—</span>}</td>
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
                                        <td colSpan={9}>
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
