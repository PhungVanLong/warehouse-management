import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import "./batches.css";
import { createBatch } from "../../api/batchApi";
import { getAllItems } from "../../api/itemApi";
import TopbarRight from "../../components/TopbarRight";

const EMPTY_FORM = {
    itemId: "",
    receiptDetailId: "",
    manufactureDate: "",
    expiryDate: "",
    unitCost: "",
    quantity: "",
};

export default function BatchCreatePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        getAllItems().then(setItems).catch(() => { });
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validate = () => {
        const errs = {};
        if (!form.itemId) errs.itemId = "Bắt buộc";
        if (!form.receiptDetailId) errs.receiptDetailId = "Bắt buộc";
        if (!form.unitCost || Number(form.unitCost) <= 0) errs.unitCost = "Phải lớn hơn 0";
        if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = "Phải lớn hơn 0";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
        setSaving(true);
        setError(null);
        try {
            await createBatch({
                itemId: Number(form.itemId),
                receiptDetailId: Number(form.receiptDetailId),
                manufactureDate: form.manufactureDate || undefined,
                expiryDate: form.expiryDate || undefined,
                unitCost: Number(form.unitCost),
                quantity: Number(form.quantity),
            });
            setSuccess(true);
            setTimeout(() => navigate("/batches"), 2000);
        } catch {
            setError("Tạo mới thất bại. Vui lòng thử lại.");
            setSaving(false);
        }
    };

    return (
        <>
            {success && (
                <div className="sp-toast sp-toast-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                    Bạn đã thêm mới lô hàng thành công
                </div>
            )}
            <div className="sp-main">
                {/* Topbar */}
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo;{" "}
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/batches")}>
                                Danh mục lô vật tư hàng hóa
                            </span>{" "}
                            &rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Thêm mới lô hàng</span>
                        </div>
                    </div>
                    <TopbarRight />
                </div>

                {/* Content */}
                <div className="sp-content">
                    <h1 className="sp-title">Thêm mới lô hàng</h1>

                    <div className="sd-card">
                        {/* Section header */}
                        <div className="sd-section-hd">
                            <span className="sd-section-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DBE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 11 14 15 10" />
                                </svg>
                            </span>
                            Thông tin lô hàng
                        </div>

                        {/* Form */}
                        <div className="sd-form">
                            {error && <div className="sd-error-banner">{error}</div>}

                            <div className="sd-field">
                                <label className="sd-label">Vật tư hàng hóa <span className="sd-required">*</span></label>
                                <div className="sd-input-wrap">
                                    <select
                                        className={`sd-select${fieldErrors.itemId ? " sd-input-error" : ""}`}
                                        value={form.itemId}
                                        onChange={(e) => handleChange("itemId", e.target.value)}
                                    >
                                        <option value="">-- Chọn vật tư --</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.itemcode} – {item.itemname}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.itemId && <span className="sd-error-msg">{fieldErrors.itemId}</span>}
                                </div>
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">ID dòng phiếu nhập <span className="sd-required">*</span></label>
                                <div className="sd-input-wrap">
                                    <input
                                        className={`sd-input${fieldErrors.receiptDetailId ? " sd-input-error" : ""}`}
                                        type="number"
                                        min="1"
                                        placeholder="Nhập ID dòng phiếu nhập"
                                        value={form.receiptDetailId}
                                        onChange={(e) => handleChange("receiptDetailId", e.target.value)}
                                    />
                                    {fieldErrors.receiptDetailId && <span className="sd-error-msg">{fieldErrors.receiptDetailId}</span>}
                                </div>
                            </div>

                            <div className="sd-field sd-field-row">
                                <div className="sd-field-half">
                                    <label className="sd-label">Số lượng <span className="sd-required">*</span></label>
                                    <div className="sd-input-wrap">
                                        <input
                                            className={`sd-input${fieldErrors.quantity ? " sd-input-error" : ""}`}
                                            type="number"
                                            min="0.00001"
                                            step="any"
                                            placeholder="Nhập số lượng"
                                            value={form.quantity}
                                            onChange={(e) => handleChange("quantity", e.target.value)}
                                        />
                                        {fieldErrors.quantity && <span className="sd-error-msg">{fieldErrors.quantity}</span>}
                                    </div>
                                </div>
                                <div className="sd-field-half">
                                    <label className="sd-label">Đơn giá nhập <span className="sd-required">*</span></label>
                                    <div className="sd-input-wrap">
                                        <input
                                            className={`sd-input${fieldErrors.unitCost ? " sd-input-error" : ""}`}
                                            type="number"
                                            min="0.00001"
                                            step="any"
                                            placeholder="Nhập đơn giá nhập"
                                            value={form.unitCost}
                                            onChange={(e) => handleChange("unitCost", e.target.value)}
                                        />
                                        {fieldErrors.unitCost && <span className="sd-error-msg">{fieldErrors.unitCost}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">Ngày sản xuất</label>
                                <input
                                    className="sd-input"
                                    type="date"
                                    value={form.manufactureDate}
                                    onChange={(e) => handleChange("manufactureDate", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sd-footer">
                            <button className="sd-btn-back" onClick={() => navigate("/batches")}>Hủy</button>
                            <button className="sd-btn-edit" onClick={handleSave} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
