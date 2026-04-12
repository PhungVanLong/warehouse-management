import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SuppliesPage.css";
import SidebarLayout from "../components/SidebarLayout";
import { getItemById, updateItem } from "../api/itemApi";

const EMPTY_FORM = {
    itemcode: "", itemname: "", invoicename: "",
    itemcatg: "", description: "", unitof: "", itemtype: "",
};

export default function SuppliesDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [original, setOriginal] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getItemById(id)
            .then((data) => {
                setForm({ ...EMPTY_FORM, ...data });
                setOriginal({ ...EMPTY_FORM, ...data });
            })
            .catch(() => setError("Không thể tải thông tin vật tư."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await updateItem(id, {
                itemcode: form.itemcode,
                itemname: form.itemname,
                invoicename: form.invoicename,
                itemcatg: form.itemcatg,
                description: form.description,
                unitof: form.unitof,
                itemtype: form.itemtype,
                modifiedBy: "user",
            });
            setOriginal({ ...EMPTY_FORM, ...updated });
            setForm({ ...EMPTY_FORM, ...updated });
            setIsEditing(false);
        } catch {
            setError("Lưu thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="sp-main">
                {/* Topbar */}
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo; <span
                                className="sp-breadcrumb-link"
                                onClick={() => navigate("/supplies")}
                            >Danh mục vật tư hàng hóa</span>
                            {" "}&rsaquo; <span className="sp-breadcrumb-active">Chi tiết vật tư hàng hóa</span>
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
                    <h1 className="sp-title">Chi tiết vật tư hàng hóa</h1>

                    {loading ? (
                        <div className="sp-status-row">Đang tải...</div>
                    ) : error ? (
                        <div className="sp-status-row sp-status-error">{error}</div>
                    ) : (
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
                                        value={form.itemcode}
                                        disabled={!isEditing}
                                        onChange={(e) => handleChange("itemcode", e.target.value)}
                                    />
                                </div>

                                <div className="sd-field">
                                    <label className="sd-label">Tên vật tư hàng hóa</label>
                                    <input
                                        className="sd-input"
                                        value={form.itemname}
                                        disabled={!isEditing}
                                        onChange={(e) => handleChange("itemname", e.target.value)}
                                    />
                                </div>

                                <div className="sd-field">
                                    <label className="sd-label">Tên trên hóa đơn</label>
                                    <input
                                        className="sd-input"
                                        value={form.invoicename}
                                        disabled={!isEditing}
                                        onChange={(e) => handleChange("invoicename", e.target.value)}
                                    />
                                </div>

                                <div className="sd-field">
                                    <label className="sd-label">Ngành hàng</label>
                                    <input
                                        className="sd-input"
                                        value={form.itemcatg}
                                        disabled={!isEditing}
                                        onChange={(e) => handleChange("itemcatg", e.target.value)}
                                    />
                                </div>

                                <div className="sd-field">
                                    <label className="sd-label">Mô tả / Thông số kỹ thuật</label>
                                    <input
                                        className="sd-input"
                                        value={form.description}
                                        disabled={!isEditing}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                    />
                                </div>

                                <div className="sd-field sd-field-row">
                                    <div className="sd-field-half">
                                        <label className="sd-label">Đơn vị tính</label>
                                        <input
                                            className="sd-input"
                                            value={form.unitof}
                                            disabled={!isEditing}
                                            onChange={(e) => handleChange("unitof", e.target.value)}
                                        />
                                    </div>
                                    <div className="sd-field-half">
                                        <label className="sd-label">Loại vật tư</label>
                                        <input
                                            className="sd-input"
                                            value={form.itemtype}
                                            disabled={!isEditing}
                                            onChange={(e) => handleChange("itemtype", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="sd-footer">
                                {isEditing ? (
                                    <>
                                        <button className="sd-btn-back" disabled={saving} onClick={() => { setForm({ ...original }); setIsEditing(false); }}>
                                            Hủy
                                        </button>
                                        <button className="sd-btn-edit" disabled={saving} onClick={handleSave}>
                                            {saving ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="sd-btn-back" onClick={() => navigate("/supplies")}>
                                            Quay lại
                                        </button>
                                        <button className="sd-btn-edit" onClick={() => setIsEditing(true)}>
                                            Sửa
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
