import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import SidebarLayout from "../../components/SidebarLayout";
import DatePicker from "../../components/DatePicker";
import { createEmployee } from "../../api/employeeApi";

const EMPTY_FORM = {
    usercode: "", fullname: "", username: "", email: "",
    department: "", phoneNumber: "", address: "",
    birthdate: "", gender: "", firstworkingdate: "",
    bankaccount: "", bankname: "", isActive: true, role: "STAFF",
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

export default function EmployeesCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [openSection, setOpenSection] = useState(true);

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validate = () => {
        const errs = {};
        if (!form.usercode?.trim()) errs.usercode = "Bắt buộc";
        if (!form.fullname?.trim()) errs.fullname = "Bắt buộc";
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
        setSaving(true);
        setError(null);
        try {
            await createEmployee({
                usercode: form.usercode,
                fullname: form.fullname,
                username: form.username,
                email: form.email,
                department: form.department,
                phoneNumber: form.phoneNumber,
                address: form.address,
                birthdate: form.birthdate || null,
                gender: form.gender,
                firstworkingdate: form.firstworkingdate || null,
                bankaccount: form.bankaccount,
                bankname: form.bankname,
                isActive: true,
                role: form.role || "STAFF",
            });
            setShowToast(true);
            setTimeout(() => navigate("/employees"), 2000);
        } catch {
            setError("Thêm mới thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SidebarLayout activeKey="employees">
            <div className="sp-main">
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo;{" "}
                            <span className="sp-breadcrumb-link" onClick={() => navigate("/employees")}>
                                Danh mục nhân viên
                            </span>
                            {" "}&rsaquo;{" "}
                            <span className="sp-breadcrumb-active">Thêm mới nhân viên</span>
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

                {showToast && (
                    <div className="sp-toast sp-toast-success">
                        Bạn đã thêm mới nhân viên thành công
                    </div>
                )}

                <div className="sp-content">
                    <h1 className="sp-title">Thêm mới nhân viên</h1>

                    <div className="sd-two-sections">
                        <div className="sd-card">
                            <div className="sd-section-hd" style={{ cursor: "pointer" }} onClick={() => setOpenSection((v) => !v)}>
                                <span className="sd-section-icon"><IconCheck /></span>
                                Thông tin nhân viên
                                <span className="sd-section-hd-chevron"><IconChevron open={openSection} /></span>
                            </div>

                            {openSection && (
                                <div className="sd-form">
                                    {error && <div className="sd-error-banner">{error}</div>}

                                    {/* Row 1: Mã | Tên đăng nhập */}
                                    <div className="sd-field sd-field-row">
                                        <div className="sd-field-half">
                                            <label className="sd-label">Mã <span className="sd-required">*</span></label>
                                            <div className="sd-input-wrap">
                                                <input
                                                    className={`sd-input${fieldErrors.usercode ? " sd-input-error" : ""}`}
                                                    placeholder="Nhập mã"
                                                    value={form.usercode}
                                                    onChange={(e) => set("usercode", e.target.value)}
                                                />
                                                {fieldErrors.usercode && <span className="sd-error-msg">{fieldErrors.usercode}</span>}
                                            </div>
                                        </div>
                                        <div className="sd-field-half">
                                            <label className="sd-label">Tên đăng nhập</label>
                                            <input
                                                className="sd-input"
                                                placeholder="Nhập tên đăng nhập"
                                                value={form.username}
                                                onChange={(e) => set("username", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Họ và Tên | Email */}
                                    <div className="sd-field sd-field-row">
                                        <div className="sd-field-half">
                                            <label className="sd-label">Họ và Tên <span className="sd-required">*</span></label>
                                            <div className="sd-input-wrap">
                                                <input
                                                    className={`sd-input${fieldErrors.fullname ? " sd-input-error" : ""}`}
                                                    placeholder="Nhập họ và tên"
                                                    value={form.fullname}
                                                    onChange={(e) => set("fullname", e.target.value)}
                                                />
                                                {fieldErrors.fullname && <span className="sd-error-msg">{fieldErrors.fullname}</span>}
                                            </div>
                                        </div>
                                        <div className="sd-field-half">
                                            <label className="sd-label">Email</label>
                                            <input
                                                className="sd-input"
                                                placeholder="Nhập email"
                                                value={form.email}
                                                onChange={(e) => set("email", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Bộ phận | Số điện thoại */}
                                    <div className="sd-field sd-field-row">
                                        <div className="sd-field-half">
                                            <label className="sd-label">Bộ phận</label>
                                            <input
                                                className="sd-input"
                                                placeholder="Nhập tên bộ phận"
                                                value={form.department}
                                                onChange={(e) => set("department", e.target.value)}
                                            />
                                        </div>
                                        <div className="sd-field-half">
                                            <label className="sd-label">Số điện thoại</label>
                                            <input
                                                className="sd-input"
                                                placeholder="Nhập SDT"
                                                value={form.phoneNumber}
                                                onChange={(e) => set("phoneNumber", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 4: Địa chỉ */}
                                    <div className="sd-field">
                                        <label className="sd-label">Địa chỉ</label>
                                        <input
                                            className="sd-input"
                                            placeholder="Nhập địa chỉ"
                                            value={form.address}
                                            onChange={(e) => set("address", e.target.value)}
                                        />
                                    </div>

                                    {/* Row 5: Ngày sinh | Giới tính */}
                                    <div className="sd-field sd-field-row">
                                        <div className="sd-field-half">
                                            <label className="sd-label">Ngày sinh</label>
                                            <DatePicker
                                                value={form.birthdate}
                                                onChange={(v) => set("birthdate", v)}
                                            />
                                        </div>
                                        <div className="sd-field-half">
                                            <label className="sd-label">Giới tính</label>
                                            <select
                                                className="sd-input sd-select"
                                                value={form.gender}
                                                onChange={(e) => set("gender", e.target.value)}
                                            >
                                                <option value="">Chọn giới tính</option>
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 6: Ngày vào làm | Tài khoản NH */}
                                    <div className="sd-field sd-field-row">
                                        <div className="sd-field-half">
                                            <label className="sd-label">Ngày vào làm</label>
                                            <DatePicker
                                                value={form.firstworkingdate}
                                                onChange={(v) => set("firstworkingdate", v)}
                                            />
                                        </div>
                                        <div className="sd-field-half">
                                            <label className="sd-label">Tài khoản NH</label>
                                            <input
                                                className="sd-input"
                                                placeholder="Nhập số tài khoản ngân hàng"
                                                value={form.bankaccount}
                                                onChange={(e) => set("bankaccount", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 7: Tên ngân hàng */}
                                    <div className="sd-field">
                                        <label className="sd-label">Tên ngân hàng</label>
                                        <input
                                            className="sd-input"
                                            style={{ maxWidth: 320 }}
                                            placeholder="Nhập tên ngân hàng"
                                            value={form.bankname}
                                            onChange={(e) => set("bankname", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer actions ── */}
                        <div className="sd-footer-actions">
                            <button className="sp-btn-outline" onClick={() => navigate("/employees")} disabled={saving}>Hủy bỏ</button>
                            <button className="sp-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
