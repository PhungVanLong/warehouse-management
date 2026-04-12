import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/SuppliesPage.css";

export default function SidebarLayout({ children }) {
    const [openGroups, setOpenGroups] = useState({ danhmuc: true, chungtu: true, baocao: true });
    const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    const navigate = useNavigate();

    return (
        <div className="sp-layout">
            <aside className="sp-sidebar">
                <div className="sp-sidebar-logo">
                    <div className="sp-logo-icon">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2DBE60" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <div className="sp-logo-name">Hoshimoto</div>
                        <div className="sp-logo-sub">VIETNAM</div>
                    </div>
                </div>

                <nav className="sp-nav">
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </span>
                        <span>Tổng quan</span>
                    </div>

                    {/* Danh mục */}
                    <div className="sp-nav-group-hd sp-group-active" onClick={() => toggleGroup("danhmuc")}>
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </span>
                        <span>Danh mục</span>
                        <span className={`sp-chevron${openGroups.danhmuc ? " open" : ""}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                    </div>
                    {openGroups.danhmuc && (
                        <div className="sp-nav-children">
                            <div className="sp-nav-child sp-child-active" onClick={() => navigate("/supplies")}>Danh mục vật tư hàng hóa</div>
                            <div className="sp-nav-child">Danh mục nhân viên</div>
                            <div className="sp-nav-child">Danh mục vị trí</div>
                            <div className="sp-nav-child">Danh mục đối tượng</div>
                        </div>
                    )}

                    {/* Chứng từ */}
                    <div className="sp-nav-group-hd" onClick={() => toggleGroup("chungtu")}>
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                        </span>
                        <span>Chứng từ</span>
                        <span className={`sp-chevron${openGroups.chungtu ? " open" : ""}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                    </div>
                    {openGroups.chungtu && (
                        <div className="sp-nav-children">
                            <div className="sp-nav-child">Phiếu nhập kho</div>
                            <div className="sp-nav-child">Phiếu xuất kho</div>
                            <div className="sp-nav-child">Kiểm kê hàng tồn kho</div>
                            <div className="sp-nav-child">Phiếu xuất/ nhập điều chỉnh</div>
                        </div>
                    )}

                    {/* Báo cáo */}
                    <div className="sp-nav-group-hd" onClick={() => toggleGroup("baocao")}>
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        </span>
                        <span>Báo cáo</span>
                        <span className={`sp-chevron${openGroups.baocao ? " open" : ""}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                    </div>
                    {openGroups.baocao && (
                        <div className="sp-nav-children">
                            <div className="sp-nav-child">Bảng kê chứng từ Phiếu nhập</div>
                            <div className="sp-nav-child">Bảng kê chứng từ Phiếu xuất</div>
                            <div className="sp-nav-child">Báo cáo Nhập - Xuất - Tồn</div>
                            <div className="sp-nav-child">Thẻ kho</div>
                            <div className="sp-nav-child">Báo cáo Cảnh báo Tồn kho an toàn</div>
                        </div>
                    )}
                </nav>

                <div className="sp-sidebar-bottom">
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </span>
                        <span>Tài khoản</span>
                    </div>
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        <span>Đăng xuất</span>
                    </div>
                </div>
            </aside>

            {children}
        </div>
    );
}
