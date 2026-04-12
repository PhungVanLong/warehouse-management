import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SuppliesPage.css";
import SidebarLayout from "../components/SidebarLayout";
import { getCustomerById, updateCustomer } from "../api/customerApi";

const EMPTY_FORM = {
    customercode: "", customername: "", address: "",
    email: "", mobile: "", partnername: "", partnermobile: "",
    ownername: "", taxcode: "", itemcatg: "",
    bankaccount: "", bankname: "",
    iscustomer: false, issupplier: false,
};

function IconCheck() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DBE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

function IconChevron({ open }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export default function PartnersDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [original, setOriginal] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [openBasic, setOpenBasic] = useState(true);
    const [openDetail, setOpenDetail] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getCustomerById(id)
            .then((data) => {
                const f = { ...EMPTY_FORM, ...data, iscustomer: !!data.iscustomer, issupplier: !!data.issupplier };
                setForm(f);
                setOriginal(f);
            })
            .catch(() => setError("Không thể tải thông tin đối tượng."))
            .finally(() => setLoading(false));
    }, [id]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await updateCustomer(id, {
                customercode: form.customercode,
                customername: form.customername,
                address: form.address,
                email: form.email,
                mobile: form.mobile,
                partnername: form.partnername,
                partnermobile: form.partnermobile,
                ownername: form.ownername,
                taxcode: form.taxcode,
                itemcatg: form.itemcatg,
                bankaccount: form.bankaccount,
                bankname: form.bankname,
                iscustomer: form.iscustomer,
                issupplier: form.issupplier,
                modifiedBy: "user",
            });
            const f = { ...EMPTY_FORM, ...updated, iscustomer: !!updated.iscustomer, issupplier: !!updated.issupplier };
            setOriginal(f);
            setForm(f);
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
                            Danh mục &rsaquo;{" "}
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/partners")}>
                                Danh mục đối tượng
                            </span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Chi tiết đối tượng</span>
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
                    <h1 className="sp-title">Chi tiết đối tượng</h1>

                    {loading ? (
                        <div className="sp-status-row">Đang tải...</div>
                    ) : error && !saving ? (
                        <div className="sp-status-row sp-status-error">{error}</div>
                    ) : (
                        <div className="sd-two-sections">
                            {/* ── Thông tin chung ── */}
                            <div className="sd-card">
                                <div className="sd-section-hd" style={{ cursor: "pointer" }} onClick={() => setOpenBasic((v) => !v)}>
                                    <span className="sd-section-icon"><IconCheck /></span>
                                    Thông tin chung
                                    <span className="sd-section-hd-chevron"><IconChevron open={openBasic} /></span>
                                </div>
                                {openBasic && (
                                    <div className="sd-form">
                                        <div className="sd-field">
                                            <label className="sd-label">Mã đối tượng</label>
                                            <input
                                                className="sd-input sd-input-sm"
                                                value={form.customercode}
                                                disabled={!isEditing}
                                                onChange={(e) => set("customercode", e.target.value)}
                                            />
                                        </div>

                                        <div className="sd-field">
                                            <label className="sd-label">Tên doanh nghiệp</label>
                                            <input
                                                className="sd-input sd-input-name"
                                                value={form.customername}
                                                disabled={!isEditing}
                                                onChange={(e) => set("customername", e.target.value)}
                                            />
                                            <div className="sd-checkboxes">
                                                <label className="sd-check-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.iscustomer}
                                                        disabled={!isEditing}
                                                        onChange={(e) => set("iscustomer", e.target.checked)}
                                                    />
                                                    Là khách hàng
                                                </label>
                                                <label className="sd-check-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.issupplier}
                                                        disabled={!isEditing}
                                                        onChange={(e) => set("issupplier", e.target.checked)}
                                                    />
                                                    Là nhà cung cấp
                                                </label>
                                            </div>
                                        </div>

                                        <div className="sd-field">
                                            <label className="sd-label">Địa chỉ liên hệ</label>
                                            <input
                                                className="sd-input"
                                                value={form.address}
                                                disabled={!isEditing}
                                                onChange={(e) => set("address", e.target.value)}
                                            />
                                        </div>

                                        <div className="sd-field sd-field-row">
                                            <div className="sd-field-half">
                                                <label className="sd-label">Email</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.email}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("email", e.target.value)}
                                                />
                                            </div>
                                            <div className="sd-field-half">
                                                <label className="sd-label">Số điện thoại</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.mobile}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("mobile", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sd-field sd-field-row">
                                            <div className="sd-field-half">
                                                <label className="sd-label">Đối tác liên hệ</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.partnername}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("partnername", e.target.value)}
                                                />
                                            </div>
                                            <div className="sd-field-half">
                                                <label className="sd-label">SDT đối tác</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.partnermobile}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("partnermobile", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sd-field sd-field-row">
                                            <div className="sd-field-half">
                                                <label className="sd-label">Đại diện pháp luật</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.ownername}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("ownername", e.target.value)}
                                                />
                                            </div>
                                            <div className="sd-field-half">
                                                <label className="sd-label">Mã số thuế</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.taxcode}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("taxcode", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Thông tin chi tiết ── */}
                            <div className="sd-card">
                                <div className="sd-section-hd" style={{ cursor: "pointer" }} onClick={() => setOpenDetail((v) => !v)}>
                                    <span className="sd-section-icon"><IconCheck /></span>
                                    Thông tin chi tiết
                                    <span className="sd-section-hd-chevron"><IconChevron open={openDetail} /></span>
                                </div>
                                {openDetail && (
                                    <div className="sd-form">
                                        <div className="sd-field">
                                            <label className="sd-label">Ngành hàng</label>
                                            <input
                                                className="sd-input"
                                                value={form.itemcatg}
                                                disabled={!isEditing}
                                                onChange={(e) => set("itemcatg", e.target.value)}
                                            />
                                        </div>

                                        <div className="sd-field sd-field-row">
                                            <div className="sd-field-half">
                                                <label className="sd-label">Tài khoản NH</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.bankaccount}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("bankaccount", e.target.value)}
                                                />
                                            </div>
                                            <div className="sd-field-half">
                                                <label className="sd-label">Tên ngân hàng</label>
                                                <input
                                                    className="sd-input"
                                                    value={form.bankname}
                                                    disabled={!isEditing}
                                                    onChange={(e) => set("bankname", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {error && saving && (
                                <div className="sp-status-row sp-status-error">{error}</div>
                            )}
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
                                        <button className="sd-btn-back" onClick={() => navigate("/partners")}>
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
