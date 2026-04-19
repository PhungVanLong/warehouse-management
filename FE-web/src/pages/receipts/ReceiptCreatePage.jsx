import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import "./receipts.css";
import { createReceipt, suggestLocations } from "../../api/receiptApi";
import { getAllCustomers } from "../../api/customerApi";
import { getAllItems } from "../../api/itemApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _rowKey = 0;
const newRow = () => ({
    _id: ++_rowKey,
    itemId: "",
    itemcode: "",
    itemname: "",
    unitof: "",
    quantity: "",
    price: "",
    selectedLocations: [], // [{locationId, locationcode, allocQty}]
});

function formatMoney(n) {
    if (!n && n !== 0) return "";
    return Number(n).toLocaleString("vi-VN");
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
function IconClose() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
function IconChevron() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
function IconCheck() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
function IconWarn() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

// ─── Location Picker Modal ────────────────────────────────────────────────────
function LocationModal({ open, onClose, onConfirm, loading, suggestions, quantity, rowName }) {
    const [search, setSearch] = useState("");
    const [rackFilter, setRackFilter] = useState("Tất cả dãy");
    const [selected, setSelected] = useState(new Map()); // Map<locationId, allocQty>

    useEffect(() => {
        if (open) { setSearch(""); setRackFilter("Tất cả dãy"); setSelected(new Map()); }
    }, [open]);

    if (!open) return null;

    const existingLocs = suggestions.filter((s) => s.type === "EXISTING");
    const emptyLocs = suggestions.filter((s) => s.type === "EMPTY");
    const totalAllocated = Array.from(selected.values()).reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, Number(quantity) - totalAllocated);

    const racks = ["Tất cả dãy", ...Array.from(new Set(
        suggestions.map((s) => (s.locationcode || "").split("-")[0]).filter(Boolean)
    ))];

    const filterLoc = (list) => list.filter((loc) => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || (loc.locationcode || "").toLowerCase().includes(q) || (loc.locationname || "").toLowerCase().includes(q);
        const matchRack = rackFilter === "Tất cả dãy" || (loc.locationcode || "").startsWith(rackFilter);
        return matchSearch && matchRack;
    });

    const handleToggle = (loc) => {
        const next = new Map(selected);
        if (next.has(loc.locationId)) {
            next.delete(loc.locationId);
        } else {
            const rem = Math.max(0, Number(quantity) - Array.from(next.values()).reduce((a, b) => a + b, 0));
            const alloc = Math.min(rem, loc.availableSpace);
            if (alloc > 0) next.set(loc.locationId, alloc);
        }
        setSelected(next);
    };

    const selectedEntries = Array.from(selected.entries());
    const selectedCodes = selectedEntries.map(([locId]) => {
        const found = suggestions.find((s) => s.locationId === locId);
        return found ? found.locationcode : locId;
    });
    const canConfirm = remaining === 0 && selected.size > 0;

    const handleConfirm = () => {
        const locs = selectedEntries.map(([locationId, allocQty]) => {
            const found = suggestions.find((s) => s.locationId === locationId);
            return { locationId, locationcode: found?.locationcode || "", allocQty };
        });
        onConfirm(locs);
    };

    return (
        <div className="rc-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rc-modal">
                <div className="rc-modal-header">
                    <span className="rc-modal-title">Chọn vị trí lưu trữ</span>
                    <button className="rc-modal-close" onClick={onClose}><IconClose /></button>
                </div>
                <div className="rc-modal-body">
                    <div className="rc-modal-search-row">
                        <input className="rc-modal-search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <select className="rc-modal-row-select" value={rackFilter} onChange={(e) => setRackFilter(e.target.value)}>
                            {racks.map((r) => <option key={r}>{r}</option>)}
                        </select>
                    </div>

                    {loading && <div style={{ textAlign: "center", color: "#8ba392", padding: "20px 0" }}>Đang tải gợi ý vị trí...</div>}
                    {!loading && suggestions.length === 0 && (
                        <div style={{ textAlign: "center", color: "#e57373", padding: "16px 0" }}>Không có vị trí phù hợp.</div>
                    )}

                    {/* EXISTING locations */}
                    {!loading && filterLoc(existingLocs).length > 0 && (
                        <>
                            <div className="rc-modal-section-hd">Vị trí hiện tại của vật tư</div>
                            <table className="rc-modal-table">
                                <thead><tr>
                                    <th style={{ width: 36 }} />
                                    <th>Mã vật tư</th><th>Vị trí</th><th>Sức chứa</th><th>Còn trống</th>
                                </tr></thead>
                                <tbody>
                                    {filterLoc(existingLocs).map((loc) => (
                                        <tr key={loc.locationId} className={selected.has(loc.locationId) ? "rc-row-selected" : ""} onClick={() => handleToggle(loc)} style={{ cursor: "pointer" }}>
                                            <td><input type="checkbox" checked={selected.has(loc.locationId)} onChange={() => { }} onClick={(e) => e.stopPropagation()} /></td>
                                            <td style={{ fontWeight: 600, color: "#1E854A" }}>{rowName}</td>
                                            <td>{loc.locationcode}</td>
                                            <td>{loc.capacity}</td>
                                            <td>{loc.availableSpace}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* EMPTY locations */}
                    {!loading && filterLoc(emptyLocs).length > 0 && (
                        <>
                            <div className="rc-modal-section-hd">Các vị trí trống khác</div>
                            <table className="rc-modal-table">
                                <thead><tr>
                                    <th style={{ width: 36 }} />
                                    <th>Vị trí</th><th>Sức chứa</th><th>Còn trống</th>
                                </tr></thead>
                                <tbody>
                                    {filterLoc(emptyLocs).map((loc) => (
                                        <tr key={loc.locationId} className={selected.has(loc.locationId) ? "rc-row-selected" : ""} onClick={() => handleToggle(loc)} style={{ cursor: "pointer" }}>
                                            <td><input type="checkbox" checked={selected.has(loc.locationId)} onChange={() => { }} onClick={(e) => e.stopPropagation()} /></td>
                                            <td>{loc.locationcode}</td>
                                            <td>{loc.capacity}</td>
                                            <td>{loc.availableSpace}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Status message */}
                    {!loading && selected.size > 0 && (
                        <div className={`rc-modal-msg ${remaining === 0 ? "rc-modal-msg-ok" : "rc-modal-msg-warn"}`}>
                            {remaining === 0
                                ? <><IconCheck /> Đã đủ số lượng nhập. Nhấn Xác nhận để hoàn tất.</>
                                : <><IconWarn /> Còn thiếu {remaining} cái, vui lòng chọn thêm vị trí khác.</>}
                        </div>
                    )}
                </div>
                <div className="rc-modal-footer">
                    <span className="rc-modal-selected-info">
                        {selected.size > 0 ? `Đã chọn: ${selectedCodes.join(" / ")} (${totalAllocated} cái)` : "Chưa chọn vị trí nào"}
                    </span>
                    <button className="sp-btn-outline" onClick={onClose}>Hủy bỏ</button>
                    <button className="sp-btn-primary" onClick={handleConfirm} disabled={!canConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReceiptCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ date: todayStr(), docno: "", customerId: "", address: "", description: "" });
    const [rows, setRows] = useState([newRow()]);
    const [invoice, setInvoice] = useState({ date: "", taxcode: "", number: "", supplierId: "" });
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [lapPhieuOpen, setLapPhieuOpen] = useState(false);
    const [locModal, setLocModal] = useState({ open: false, rowIdx: null, suggestions: [], loading: false });

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [cList, iList] = await Promise.all([getAllCustomers(), getAllItems()]);
            setCustomers(cList);
            setItems(iList);
        } catch { /* non-blocking */ } finally { setLoadingData(false); }
    }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

    const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleCustomerChange = (customerId) => {
        const found = customers.find((c) => String(c.id) === String(customerId));
        setForm((prev) => ({ ...prev, customerId, address: found?.address || "" }));
        if (found) setInvoice((prev) => ({ ...prev, taxcode: found.taxcode || "", supplierId: customerId }));
    };

    const handleInvoiceChange = (field, value) => setInvoice((prev) => ({ ...prev, [field]: value }));

    const handleRowChange = (idx, field, value) => {
        setRows((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            if (field === "itemId") {
                const found = items.find((it) => String(it.id) === String(value));
                next[idx].itemcode = found?.itemcode || "";
                next[idx].itemname = found?.itemname || "";
                next[idx].unitof = found?.unitof || "";
                next[idx].selectedLocations = [];
            }
            return next;
        });
    };

    const handleAddRow = () => setRows((prev) => [...prev, newRow()]);
    const handleRemoveRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const openLocationModal = async (idx) => {
        const row = rows[idx];
        if (!row.itemId) { showToast("error", "Vui lòng chọn mặt hàng trước."); return; }
        if (!row.quantity || Number(row.quantity) <= 0) { showToast("error", "Vui lòng nhập số lượng trước."); return; }
        setLocModal({ open: true, rowIdx: idx, suggestions: [], loading: true });
        try {
            const data = await suggestLocations(row.itemId, row.quantity);
            setLocModal((prev) => ({ ...prev, suggestions: data, loading: false }));
        } catch {
            setLocModal((prev) => ({ ...prev, suggestions: [], loading: false }));
            showToast("error", "Không thể tải gợi ý vị trí.");
        }
    };

    const handleLocConfirm = (locs) => {
        const idx = locModal.rowIdx;
        setRows((prev) => { const next = [...prev]; next[idx] = { ...next[idx], selectedLocations: locs }; return next; });
        setLocModal({ open: false, rowIdx: null, suggestions: [], loading: false });
    };

    const totalAmount = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0), 0);

    const handleSave = async () => {
        if (!form.date) { showToast("error", "Vui lòng chọn ngày."); return; }
        if (!form.docno.trim()) { showToast("error", "Vui lòng nhập số chứng từ."); return; }
        if (!form.customerId) { showToast("error", "Vui lòng chọn đối tượng."); return; }
        if (rows.length === 0) { showToast("error", "Vui lòng thêm ít nhất một dòng vật tư."); return; }
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r.itemId) { showToast("error", `Dòng ${i + 1}: Vui lòng chọn mặt hàng.`); return; }
            if (!r.quantity || Number(r.quantity) <= 0) { showToast("error", `Dòng ${i + 1}: Số lượng không hợp lệ.`); return; }
            if (r.selectedLocations.length === 0) { showToast("error", `Dòng ${i + 1}: Vui lòng chọn vị trí lưu trữ.`); return; }
        }
        const details = rows.flatMap((r) =>
            r.selectedLocations.map((loc) => ({
                itemId: Number(r.itemId),
                locationId: Number(loc.locationId),
                quantity: Number(loc.allocQty),
                unitprice: Number(r.price) || 0,
            }))
        );
        setSaving(true);
        try {
            const result = await createReceipt({ docno: form.docno.trim(), docDate: form.date, description: form.description.trim(), customerId: Number(form.customerId), details });
            if (result?.success) {
                showToast("success", "Tạo phiếu nhập kho thành công!");
                setTimeout(() => navigate("/receipts"), 1200);
            } else {
                showToast("error", result?.message || "Tạo phiếu thất bại.");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu nhập kho.");
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
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/receipts")}>Phiếu nhập kho</span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Thêm mới phiếu nhập kho</span>
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
                    <h1 className="sp-title">Phiếu nhập kho</h1>
                    <div className="rc-form-card">

                        {/* ── Header row ── */}
                        <div className="rc-header-row">
                            <label className="rc-form-label">Ngày</label>
                            <input type="date" className="rc-form-input" style={{ minWidth: 150 }} value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} />
                            <label className="rc-form-label" style={{ marginLeft: 16 }}>Số</label>
                            <input className="rc-form-input" style={{ minWidth: 200 }} placeholder="Nhập số chứng từ" value={form.docno} onChange={(e) => handleFormChange("docno", e.target.value)} />
                            <div style={{ position: "relative", marginLeft: "auto" }}>
                                <button className="rc-lapphieu-btn" onClick={() => setLapPhieuOpen((v) => !v)}>
                                    Lập phiếu <IconChevron />
                                </button>
                                {lapPhieuOpen && (
                                    <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1.5px solid #c6dfd0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 160, padding: "4px 0" }}
                                        onBlur={() => setLapPhieuOpen(false)}>
                                        {["Tạo mới", "Từ đơn hàng"].map((opt) => (
                                            <div key={opt} style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.88rem", color: "#243427" }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#f3faf6"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = ""}
                                                onClick={() => setLapPhieuOpen(false)}>{opt}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Đối tượng ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Đối tượng</label>
                            <select className="rc-form-select rc-form-full" value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)} disabled={loadingData}>
                                <option value="">Chọn đối tượng</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.customercode ? `${c.customercode}: ` : ""}{c.customername}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Địa chỉ ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Địa chỉ</label>
                            <input className="rc-form-input rc-form-full" placeholder="Nhập địa chỉ" value={form.address} onChange={(e) => handleFormChange("address", e.target.value)} />
                        </div>

                        {/* ── Diễn giải ── */}
                        <div className="rc-form-row">
                            <label className="rc-form-label">Diễn giải</label>
                            <input className="rc-form-input rc-form-full" placeholder="Nhập diễn giải" value={form.description} onChange={(e) => handleFormChange("description", e.target.value)} />
                        </div>

                        {/* ── Detail table ── */}
                        <div className="rc-detail-table-wrap">
                            <table className="rc-detail-table">
                                <thead>
                                    <tr>
                                        <th className="rc-td-stt">STT</th>
                                        <th style={{ minWidth: 100 }}>Mã hàng</th>
                                        <th style={{ minWidth: 180 }}>Tên vật tư hàng hóa</th>
                                        <th style={{ minWidth: 90 }}>Đơn vị tính</th>
                                        <th style={{ minWidth: 80 }}>Số lượng</th>
                                        <th style={{ minWidth: 70 }}>Chênh lệch</th>
                                        <th style={{ minWidth: 140 }}>Vị trí</th>
                                        <th style={{ minWidth: 100 }}>Đơn giá</th>
                                        <th style={{ minWidth: 110 }}>Thành tiền</th>
                                        <th style={{ width: 36 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => {
                                        const amount = (Number(row.quantity) || 0) * (Number(row.price) || 0);
                                        const locLabel = row.selectedLocations.map((l) => l.locationcode).join(" / ");
                                        return (
                                            <tr key={row._id}>
                                                <td className="rc-td-stt">{idx + 1}</td>
                                                <td>
                                                    <select className="rc-td-select" value={row.itemId} onChange={(e) => handleRowChange(idx, "itemId", e.target.value)}>
                                                        <option value="">--</option>
                                                        {items.map((it) => <option key={it.id} value={it.id}>{it.itemcode}</option>)}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input className="rc-td-input" value={row.itemname} readOnly style={{ background: "#f6fbf8", color: "#4c6152" }} placeholder="Tên vật tư" />
                                                </td>
                                                <td>
                                                    <input className="rc-td-input" value={row.unitof} readOnly style={{ background: "#f6fbf8", color: "#4c6152", maxWidth: 80 }} />
                                                </td>
                                                <td>
                                                    <input type="number" className="rc-td-input" min="1" style={{ maxWidth: 80 }} value={row.quantity}
                                                        onChange={(e) => {
                                                            setRows((prev) => {
                                                                const next = [...prev];
                                                                next[idx] = { ...next[idx], quantity: e.target.value, selectedLocations: [] };
                                                                return next;
                                                            });
                                                        }} placeholder="0" />
                                                </td>
                                                <td className="rc-td-num"><span style={{ color: "#8ba392" }}>0</span></td>
                                                <td>
                                                    <button type="button" className={`rc-loc-btn${row.selectedLocations.length > 0 ? " rc-loc-btn-set" : ""}`} onClick={() => openLocationModal(idx)}>
                                                        {row.selectedLocations.length > 0 ? locLabel : "Chọn vị trí"} <IconChevron />
                                                    </button>
                                                </td>
                                                <td>
                                                    <input type="number" className="rc-td-input" min="0" style={{ maxWidth: 100 }} value={row.price} onChange={(e) => handleRowChange(idx, "price", e.target.value)} placeholder="0" />
                                                </td>
                                                <td className="rc-td-num" style={{ textAlign: "right", fontWeight: 500 }}>
                                                    {amount > 0 ? formatMoney(amount) : ""}
                                                </td>
                                                <td>
                                                    {rows.length > 1 && (
                                                        <button className="rc-del-btn" onClick={() => handleRemoveRow(idx)} title="Xóa dòng"><IconTrash /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="rc-add-row" onClick={handleAddRow}>
                                        <td colSpan={10}>
                                            <button className="rc-add-row-btn" type="button">
                                                <IconPlus size={13} /> Thêm mới dữ liệu
                                            </button>
                                        </td>
                                    </tr>
                                    {totalAmount > 0 && (
                                        <tr className="rc-total-row">
                                            <td colSpan={8} style={{ textAlign: "right", paddingRight: 12 }}>Tổng cộng</td>
                                            <td className="rc-td-num" style={{ textAlign: "right" }}>{formatMoney(totalAmount)}</td>
                                            <td />
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Invoice section ── */}
                        <div className="rc-section-hd">Chi tiết</div>
                        <div className="rc-section-sub">Thông tin hóa đơn</div>
                        <div className="rc-form-2col">
                            <div className="rc-form-field">
                                <label className="rc-form-label">Ngày HD</label>
                                <input type="date" className="rc-form-input" value={invoice.date} onChange={(e) => handleInvoiceChange("date", e.target.value)} />
                            </div>
                            <div className="rc-form-field">
                                <label className="rc-form-label">MST</label>
                                <input className="rc-form-input" placeholder="Nhập mã số thuế" value={invoice.taxcode} onChange={(e) => handleInvoiceChange("taxcode", e.target.value)} />
                            </div>
                        </div>
                        <div className="rc-form-2col">
                            <div className="rc-form-field">
                                <label className="rc-form-label">Số</label>
                                <input className="rc-form-input" placeholder="Nhập số chứng từ" value={invoice.number} onChange={(e) => handleInvoiceChange("number", e.target.value)} />
                            </div>
                            <div className="rc-form-field">
                                <label className="rc-form-label">Tên NCC</label>
                                <select className="rc-form-select" value={invoice.supplierId} onChange={(e) => handleInvoiceChange("supplierId", e.target.value)}>
                                    <option value="">Chọn tên nhà cung cấp</option>
                                    {customers.filter((c) => c.issupplier).map((c) => (
                                        <option key={c.id} value={c.id}>{c.customername}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ── Actions ── */}
                        <div className="rc-form-actions">
                            <button className="sp-btn-outline" onClick={() => navigate("/receipts")} disabled={saving}>Hủy bỏ</button>
                            <button className="sp-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <LocationModal
                open={locModal.open}
                onClose={() => setLocModal({ open: false, rowIdx: null, suggestions: [], loading: false })}
                onConfirm={handleLocConfirm}
                loading={locModal.loading}
                suggestions={locModal.suggestions}
                quantity={locModal.rowIdx !== null ? rows[locModal.rowIdx]?.quantity || 0 : 0}
                rowName={locModal.rowIdx !== null ? rows[locModal.rowIdx]?.itemcode || "" : ""}
            />
        </>
    );
}
