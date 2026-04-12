import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import SidebarLayout from "../../components/SidebarLayout";
import { getLocationById, updateLocation } from "../../api/locationApi";

const EMPTY_FORM = {
    locationcode: "", locationname: "", rackno: "", floorno: "",
    columnno: "", capacity: "", description: "", isActive: true,
};

function IconCheck() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DBE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

export default function LocationsDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [original, setOriginal] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        setLoading(true);
        setError(null);
        getLocationById(id)
            .then((data) => {
                const f = { ...EMPTY_FORM, ...data };
                setForm(f);
                setOriginal(f);
            })
            .catch(() => setError("Không thể tải thông tin vị trí."))
            .finally(() => setLoading(false));
    }, [id]);

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validate = () => {
        const errs = {};
        if (!form.locationcode?.trim()) errs.locationcode = "Bắt buộc";
        if (!form.locationname?.trim()) errs.locationname = "Bắt buộc";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
        setSaving(true);
        setError(null);
        try {
            const now = new Date().toISOString();
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const updated = await updateLocation(id, {
                locationcode: form.locationcode,
                locationname: form.locationname,
                rackno: form.rackno,
                floorno: form.floorno,
                columnno: form.columnno,
                capacity: form.capacity ? Number(form.capacity) : null,
                description: form.description,
                isActive: form.isActive,
                modifiedAt: now,
                modifiedBy: user.username || "",
            });
            const f = { ...EMPTY_FORM, ...updated };
            setOriginal(f);
            setForm(f);
            setIsEditing(false);
        } catch {
            setError("Lưu thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({ ...original });
        setFieldErrors({});
        setIsEditing(false);
    };

    return (
        <SidebarLayout activeKey="locations">
            <div className="sp-main">
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo;{" "}
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/locations")}>
                                Danh mục vị trí
                            </span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Chi tiết vị trí</span>
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

                <div className="sp-content">
                    <h1 className="sp-title">Chi tiết vị trí</h1>

                    {loading ? (
                        <div className="sp-status-row">Đang tải...</div>
                    ) : (
                        <div className="sd-two-sections">
                            {error && <div className="sd-error-banner" style={{ marginBottom: 12 }}>{error}</div>}

                            <div className="sd-card">
                                <div className="sd-section-hd">
                                    <span className="sd-section-icon"><IconCheck /></span>
                                    Thông tin chung
                                </div>

                                <div className="sd-form">
                                    <div className="sd-field">
                                        <label className="sd-label">Mã vị trí <span className="sd-required">*</span></label>
                                        <div className="sd-input-wrap">
                                            <input
                                                className={`sd-input${fieldErrors.locationcode ? " sd-input-error" : ""}`}
                                                value={form.locationcode}
                                                disabled={!isEditing}
                                                onChange={(e) => set("locationcode", e.target.value)}
                                            />
                                            {fieldErrors.locationcode && <span className="sd-error-msg">{fieldErrors.locationcode}</span>}
                                        </div>
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Tên vị trí <span className="sd-required">*</span></label>
                                        <div className="sd-input-wrap">
                                            <input
                                                className={`sd-input${fieldErrors.locationname ? " sd-input-error" : ""}`}
                                                value={form.locationname}
                                                disabled={!isEditing}
                                                onChange={(e) => set("locationname", e.target.value)}
                                            />
                                            {fieldErrors.locationname && <span className="sd-error-msg">{fieldErrors.locationname}</span>}
                                        </div>
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Dãy</label>
                                        <input
                                            className="sd-input"
                                            value={form.rackno}
                                            disabled={!isEditing}
                                            onChange={(e) => set("rackno", e.target.value)}
                                        />
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Kệ</label>
                                        <input
                                            className="sd-input"
                                            value={form.floorno}
                                            disabled={!isEditing}
                                            onChange={(e) => set("floorno", e.target.value)}
                                        />
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Tầng</label>
                                        <input
                                            className="sd-input"
                                            value={form.columnno}
                                            disabled={!isEditing}
                                            onChange={(e) => set("columnno", e.target.value)}
                                        />
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Sức chứa</label>
                                        <input
                                            className="sd-input"
                                            type="number"
                                            value={form.capacity}
                                            disabled={!isEditing}
                                            onChange={(e) => set("capacity", e.target.value)}
                                        />
                                    </div>

                                    <div className="sd-field">
                                        <label className="sd-label">Diễn giải</label>
                                        <input
                                            className="sd-input"
                                            value={form.description}
                                            disabled={!isEditing}
                                            onChange={(e) => set("description", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="sd-footer-actions">
                                {isEditing ? (
                                    <>
                                        <button className="sp-btn-outline" onClick={handleCancel} disabled={saving}>Hủy bỏ</button>
                                        <button className="sp-btn-primary" onClick={handleSave} disabled={saving}>
                                            {saving ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="sp-btn-outline" onClick={() => navigate("/locations")}>Quay lại</button>
                                        <button className="sp-btn-primary" onClick={() => setIsEditing(true)}>Sửa</button>
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
