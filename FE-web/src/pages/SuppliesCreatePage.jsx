import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuppliesPage.css";
import SidebarLayout from "../components/SidebarLayout";
import { createItem } from "../api/itemApi";

const EMPTY_FORM = {
    itemcode: "",
    itemname: "",
    invoicename: "",
    itemcatg: "",
    description: "",
    unitof: "",
    itemtype: "",
};

export default function SuppliesCreatePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await createItem({
                itemcode: form.itemcode,
                itemname: form.itemname,
                invoicename: form.invoicename,
                itemcatg: form.itemcatg,
                description: form.description,
                unitof: form.unitof,
                itemtype: form.itemtype,
                modifiedBy: "user",
            });
            setSuccess(true);
            setTimeout(() => navigate("/supplies"), 2000);
        } catch {
            setError("Tạo mới thất bại. Vui lòng thử lại.");
            setSaving(false);
        }
    };

    return (
        <SidebarLayout>
            {success && (
                <div className="sp-toast sp-toast-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                    Bạn đã thêm mới thành công vật tư hàng hóa
                </div>
            )}
            <div className="sp-main">
                {/* Topbar */}
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo;{" "}
                            <span
                                className="sp-breadcrumb-link"
                                onClick={() => navigate("/supplies")}
                            >
                                Danh mục vật tư hàng hóa
                            </span>{" "}
                            &rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Thêm mới vật tư hàng hóa</span>
                        </div>
                    </div>
                    <div className="sp-topbar-right">
                        <button className="sp-icon-btn">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c6152" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="sp-notif-dot" />
                        </button>
                        <div className="sp-avatar" />
                    </div>
                </div>

                {/* Content */}
                <div className="sp-content">
                    <h1 className="sp-title">Thêm mới vật tư hàng hóa</h1>

                    <div className="sd-card">
                        {/* Section header */}
                        <div className="sd-section-hd">
                            <span className="sd-section-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DBE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 11 14 15 10" />
                                </svg>
                            </span>
                            Thông tin vật tư hàng hóa
                        </div>

                        {/* Form */}
                        <div className="sd-form">
                            <div className="sd-field">
                                <label className="sd-label">Mã vật tư</label>
                                <input
                                    className="sd-input"
                                    placeholder="Nhập mã vật tư"
                                    value={form.itemcode}
                                    onChange={(e) => handleChange("itemcode", e.target.value)}
                                />
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">Tên vật tư hàng hóa</label>
                                <input
                                    className="sd-input"
                                    placeholder="Nhập tên vật tư hàng hóa"
                                    value={form.itemname}
                                    onChange={(e) => handleChange("itemname", e.target.value)}
                                />
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">Tên trên hóa đơn</label>
                                <input
                                    className="sd-input"
                                    placeholder="Nhập tên trên hóa đơn"
                                    value={form.invoicename}
                                    onChange={(e) => handleChange("invoicename", e.target.value)}
                                />
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">Ngành hàng</label>
                                <input
                                    className="sd-input"
                                    placeholder="Nhập ngành hàng"
                                    value={form.itemcatg}
                                    onChange={(e) => handleChange("itemcatg", e.target.value)}
                                />
                            </div>

                            <div className="sd-field">
                                <label className="sd-label">Mô tả / Thông số kỹ thuật</label>
                                <input
                                    className="sd-input"
                                    placeholder="Nhập mô tả / thông số kỹ thuật"
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                />
                            </div>

                            <div className="sd-field sd-field-row">
                                <div className="sd-field-half">
                                    <label className="sd-label">Đơn vị tính</label>
                                    <input
                                        className="sd-input"
                                        placeholder="Nhập đơn vị tính"
                                        value={form.unitof}
                                        onChange={(e) => handleChange("unitof", e.target.value)}
                                    />
                                </div>
                                <div className="sd-field-half">
                                    <label className="sd-label">Loại vật tư</label>
                                    <input
                                        className="sd-input"
                                        placeholder="Nhập loại vật tư"
                                        value={form.itemtype}
                                        onChange={(e) => handleChange("itemtype", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="sp-status-error" style={{ padding: "0 24px 12px" }}>{error}</div>}

                        {/* Footer */}
                        <div className="sd-footer">
                            <button className="sd-btn-back" disabled={saving} onClick={() => navigate("/supplies")}>
                                Hủy bỏ
                            </button>
                            <button className="sd-btn-edit" disabled={saving} onClick={handleSave}>
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
