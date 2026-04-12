


import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SuppliesPage.css";
import { getAllItems } from "../api/itemApi";

const ROWS_OPTIONS = [10, 15, 20, 50];

function SortIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 12 14" fill="none" style={{ marginLeft: 4, verticalAlign: "middle", opacity: 0.75 }}>
            <path d="M4 5.5L6 3L8 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 8.5L6 11L8 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconGrid() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}
function IconList() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}
function IconDoc() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
    );
}
function IconChart() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}
function IconUser() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}
function IconLogout() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}
function IconChevronDown() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export default function SuppliesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selected, setSelected] = useState(new Set());
    const [openGroups, setOpenGroups] = useState({ danhmuc: true, chungtu: true, baocao: true });
    const navigate = useNavigate();

    const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllItems();
            setItems(data);
        } catch (err) {
            setError("Không thể tải danh sách vật tư. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const filtered = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((r) =>
            r.itemcode?.toLowerCase().includes(q) ||
            r.itemname?.toLowerCase().includes(q)
        );
    }, [search, items]);

    const totalRows = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const start = (page - 1) * rowsPerPage;
    const rows = filtered.slice(start, start + rowsPerPage);

    const allIds = rows.map((r) => r.id);
    const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
    const someChecked = allIds.some((id) => selected.has(id)) && !allChecked;

    const toggleRow = (id) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = (checked) =>
        setSelected((prev) => {
            const next = new Set(prev);
            rows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
            return next;
        });

    function getPages() {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        let arr = [1];
        if (page > 3) arr.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
        if (page < totalPages - 2) arr.push("…");
        arr.push(totalPages);
        return arr;
    }

    return (
        <div className="sp-layout">
            {/* ── SIDEBAR ── */}
            <aside className="sp-sidebar">
                {/* Logo */}
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

                {/* Nav */}
                <nav className="sp-nav">
                    {/* Tổng quan */}
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon"><IconGrid /></span>
                        <span>Tổng quan</span>
                    </div>

                    {/* Danh mục */}
                    <div
                        className={`sp-nav-group-hd${openGroups.danhmuc ? " sp-group-active" : ""}`}
                        onClick={() => toggleGroup("danhmuc")}
                    >
                        <span className="sp-nav-icon"><IconList /></span>
                        <span>Danh mục</span>
                        <span className={`sp-chevron${openGroups.danhmuc ? " open" : ""}`}><IconChevronDown /></span>
                    </div>
                    {openGroups.danhmuc && (
                        <div className="sp-nav-children">
                            <div className="sp-nav-child sp-child-active">Danh mục vật tư hàng hóa</div>
                            <div className="sp-nav-child">Danh mục nhân viên</div>
                            <div className="sp-nav-child">Danh mục vị trí</div>
                            <div className="sp-nav-child">Danh mục đối tượng</div>
                        </div>
                    )}

                    {/* Chứng từ */}
                    <div
                        className={`sp-nav-group-hd${openGroups.chungtu ? " sp-group-active" : ""}`}
                        onClick={() => toggleGroup("chungtu")}
                    >
                        <span className="sp-nav-icon"><IconDoc /></span>
                        <span>Chứng từ</span>
                        <span className={`sp-chevron${openGroups.chungtu ? " open" : ""}`}><IconChevronDown /></span>
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
                    <div
                        className={`sp-nav-group-hd${openGroups.baocao ? " sp-group-active" : ""}`}
                        onClick={() => toggleGroup("baocao")}
                    >
                        <span className="sp-nav-icon"><IconChart /></span>
                        <span>Báo cáo</span>
                        <span className={`sp-chevron${openGroups.baocao ? " open" : ""}`}><IconChevronDown /></span>
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

                {/* Bottom */}
                <div className="sp-sidebar-bottom">
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon"><IconUser /></span>
                        <span>Tài khoản</span>
                    </div>
                    <div className="sp-nav-standalone">
                        <span className="sp-nav-icon"><IconLogout /></span>
                        <span>Đăng xuất</span>
                    </div>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div className="sp-main">
                {/* Topbar */}
                <div className="sp-topbar">
                    <div>
                        <div className="sp-breadcrumb">
                            Danh mục &rsaquo; <span className="sp-breadcrumb-active">Danh mục vật tư hàng hóa</span>
                        </div>
                        <div className="sp-breadcrumb-sub">Supplies</div>
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
                    <h1 className="sp-title">Vật tư hàng hóa</h1>

                    {/* Toolbar */}
                    <div className="sp-toolbar">
                        <div className="sp-search-wrap">
                            <svg className="sp-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                className="sp-search"
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="sp-toolbar-spacer" />
                        <button className="sp-btn-primary" onClick={() => navigate("/supplies/create")}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Thêm mới
                        </button>
                        <button className="sp-btn-outline">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Thêm bản sao mới
                        </button>
                        <button className="sp-btn-outline">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export
                        </button>
                    </div>

                    {/* Table */}
                    <div className="sp-table-wrap">
                        <table className="sp-table">
                            <thead>
                                <tr>
                                    <th className="sp-th-cb">
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                        />
                                    </th>
                                    <th>Mã VT <SortIcon /></th>
                                    <th>Tên vật tư / hàng hóa <SortIcon /></th>
                                    <th>Đơn vị tính <SortIcon /></th>
                                    <th>Loại vật tư <SortIcon /></th>
                                    <th>Mô tả / Thông số kỹ thuật <SortIcon /></th>
                                    <th className="sp-th-action">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="sp-status-row">Đang tải...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan={7} className="sp-status-row sp-status-error">{error}</td></tr>
                                ) : rows.length === 0 ? (
                                    <tr><td colSpan={7} className="sp-status-row">Không có dữ liệu</td></tr>
                                ) : rows.map((r) => (
                                    <tr
                                        key={r.id}
                                        className={`sp-row-clickable${selected.has(r.id) ? " sp-row-selected" : ""}`}
                                        onClick={() => navigate(`/supplies/${r.id}`)}
                                    >
                                        <td className="sp-td-cb" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected.has(r.id)}
                                                onChange={() => toggleRow(r.id)}
                                            />
                                        </td>
                                        <td className="sp-td-id">{r.itemcode}</td>
                                        <td>{r.itemname}</td>
                                        <td>{r.unitof}</td>
                                        <td>
                                            <span className={r.itemtype === "Thành phẩm" ? "sp-badge-tp" : "sp-badge-vt"}>
                                                {r.itemtype}
                                            </span>
                                        </td>
                                        <td className="sp-td-desc">{r.description}</td>
                                        <td className="sp-td-action" onClick={(e) => e.stopPropagation()}>
                                            <button className="sp-edit-btn" title="Chỉnh sửa" onClick={() => navigate(`/supplies/${r.id}`)}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="sp-pagination">
                            <span className="sp-rows-info">
                                Rows per page
                                <select
                                    className="sp-rows-select"
                                    value={rowsPerPage}
                                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                >
                                    {ROWS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <span className="sp-total-label">of {totalRows} rows</span>
                            </span>
                            <button className="sp-page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                            <button className="sp-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                            {getPages().map((p, idx) =>
                                p === "…"
                                    ? <span key={`e${idx}`} className="sp-page-ellipsis">…</span>
                                    : <button
                                        key={p}
                                        className={`sp-page-btn${p === page ? " sp-page-active" : ""}`}
                                        onClick={() => setPage(p)}
                                    >{p}</button>
                            )}
                            <button className="sp-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                            <button className="sp-page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

