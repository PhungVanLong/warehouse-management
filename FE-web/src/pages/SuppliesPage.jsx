


import React, { useState, useMemo } from "react";
import "./SuppliesPage.css";

// Dữ liệu mẫu (RAW)
const RAW = [
    ["VT001", "Cảm biến quang Omron E3Z", "Cái", "Vật tư hàng hóa", "Cảm biến quang phát hiện vật, điện áp 12-24VDC"],
    ["TP001", "Máy sấy hạt nhựa Kawata", "Bộ", "Thành phẩm", "Máy sấy công suất 50kg/h"],
    ["TP002", "Máy trộn hạt nhựa Kawata", "Bộ", "Thành phẩm", "Máy trộn công suất 100kg/mẻ"],
    ["TP003", "Máy làm mát khuôn", "Bộ", "Thành phẩm", "Công suất làm lạnh 3HP"],
    ["VT005", "Vòng bi SKF 6205", "Cái", "Vật tư hàng hóa", "Vòng bi cầu rãnh sâu, đường kính trong 25mm"],
    ["VT006", "Thanh trượt tuyến tính Misumi", "Cái", "Vật tư hàng hóa", "Thanh dẫn hướng dài 300mm"],
    ["VT007", "Bộ gia nhiệt khuôn", "Bộ", "Vật tư hàng hóa", "Công suất 2kW, dùng cho máy ép nhựa"],
    ["VT008", "Bộ điều khiển nhiệt độ Omron", "Cái", "Vật tư hàng hóa", "Bộ điều khiển nhiệt độ PID"],
    ["VT009", "Ống dẫn khí PU 8mm", "Mét", "Vật tư hàng hóa", "Ống khí nén polyurethane chịu áp lực"],
    ["VT010", "Bộ lọc khí nén SMC", "Mét", "Vật tư hàng hóa", "Bộ lọc tách nước cho hệ thống khí nén"],
    ["VT011", "Van điện từ Festo 5/2", "Cái", "Vật tư hàng hóa", "Van khí nén 5/2, điện áp 24VDC"],
    ["VT012", "Xy lanh khí nén SMC Ø32", "Cái", "Vật tư hàng hóa", "Xy lanh đơn tác động, hành trình 100mm"],
    ["VT013", "Motor giảm tốc Mitsubishi 0.4kW", "Cái", "Vật tư hàng hóa", "Motor giảm tốc, tỷ số truyền 1:30"],
    ["VT014", "Biến tần Mitsubishi FR-D720", "Cái", "Vật tư hàng hóa", "Biến tần 0.75kW, 3 pha 220V"],
    ["VT015", "PLC Mitsubishi FX3U-32M", "Cái", "Vật tư hàng hóa", "PLC 16 ngõ vào, 16 ngõ ra transistor"],
    ["VT016", "Cảm biến tiệm cận Omron E2E", "Cái", "Vật tư hàng hóa", "Cảm biến kim loại, khoảng cách 5mm"],
    ["VT017", "Relay Omron G2R-2", "Cái", "Vật tư hàng hóa", "Relay 2 tiếp điểm, cuộn 24VDC"],
    ["VT018", "Dây cáp tín hiệu Belden", "Mét", "Vật tư hàng hóa", "Dây cáp 2 lõi, chống nhiễu"],
    ["VT019", "Đầu nối M12 4P", "Cái", "Vật tư hàng hóa", "Đầu nối cảm biến M12, 4 chân"],
    ["VT020", "Nguồn DC 24V Meanwell", "Cái", "Vật tư hàng hóa", "Nguồn DC 24V – 5A"],
    ["TP004", "Máy hút chân không Busch", "Bộ", "Thành phẩm", "Công suất 0.75kW, lưu lượng 40m³/h"],
    ["VT022", "Cụm lọc điều áp SMC", "Cái", "Vật tư hàng hóa", "Bộ điều áp khí nén kèm lọc và bôi trơn"],
    ["VT023", "Khớp nối trục Lovejoy", "Cái", "Vật tư hàng hóa", "Khớp nối mềm Ø20-Ø20"],
    ["VT024", "Dầu bôi trơn Shell Tellus S2", "Kg", "Vật tư hàng hóa", "Dầu thủy lực ISO VG 46"],
    ["VT025", "Gioăng chịu nhiệt Viton", "Cái", "Vật tư hàng hóa", "Gioăng O-ring Ø50 x 3mm, chịu 200°C"],
    ["VT026", "Bộ chuyển đổi RS232/RS485", "Cái", "Vật tư hàng hóa", "Chuyển đổi giao tiếp RS232 sang RS485"],
    ["VT027", "Màn hình HMI Weintek 7\"", "Cái", "Vật tư hàng hóa", "HMI cảm ứng 7 inch, hỗ trợ Modbus"],
    ["VT028", "Động cơ bước Nema 23", "Cái", "Vật tư hàng hóa", "Motor bước 2.8A, moment xoắn 1.8Nm"],
    ["VT029", "Driver động cơ bước DM542", "Cái", "Vật tư hàng hóa", "Driver 2 phase, dòng tối đa 4.2A"],
    ["VT030", "Bộ mã hóa vòng quay encoder", "Cái", "Vật tư hàng hóa", "Encoder tương đối 1000 xung/vòng"],
];
for (let i = 31; i <= 140; i++) {
    const units = ["Cái", "Bộ", "Mét", "Kg", "Lít"];
    const types = ["Vật tư hàng hóa", "Vật tư hàng hóa", "Vật tư hàng hóa", "Thành phẩm"];
    const prefix = types[i % 4] === "Thành phẩm" ? "TP" : "VT";
    RAW.push([
        `${prefix}${String(i).padStart(3, '0')}`,
        `Thiết bị công nghiệp số ${i}`,
        units[i % units.length],
        types[i % 4],
        `Thông số kỹ thuật thiết bị mã ${i}`
    ]);
}

const ROWS_OPTIONS = [10, 15, 20, 50];

export default function SuppliesPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selected, setSelected] = useState(new Set());

    // Lọc dữ liệu
    const filtered = useMemo(() => {
        if (!search) return RAW;
        const q = search.toLowerCase();
        return RAW.filter(r => r[0].toLowerCase().includes(q) || r[1].toLowerCase().includes(q));
    }, [search]);

    // Phân trang
    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    const start = (page - 1) * rowsPerPage;
    const rows = filtered.slice(start, start + rowsPerPage);

    // Chọn tất cả
    const allIds = rows.map(r => r[0]);
    const allChecked = allIds.length > 0 && allIds.every(id => selected.has(id));

    // Xử lý chọn dòng
    const toggleRow = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleAll = (checked) => {
        setSelected(prev => {
            const next = new Set(prev);
            rows.forEach(r => checked ? next.add(r[0]) : next.delete(r[0]));
            return next;
        });
    };

    // Phân trang nâng cao
    function getPages() {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        let arr = [1];
        if (page > 3) arr.push('…');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
        if (page < totalPages - 2) arr.push('…');
        arr.push(totalPages);
        return arr;
    }

    // Xử lý toggle group sidebar
    const handleToggleGroup = (e) => {
        const item = e.currentTarget;
        const chevron = item.querySelector('.nav-chevron');
        const children = item.nextElementSibling;
        if (!children || !children.classList.contains('nav-children')) return;
        const open = children.style.display !== 'none';
        children.style.display = open ? 'none' : 'block';
        if (chevron) chevron.classList.toggle('open', !open);
    };

    // Render JSX
    return (
        <div className="app">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <div className="logo-name">Hoshimoto</div>
                        <div className="logo-sub">VIETNAM</div>
                    </div>
                </div>
                <nav className="nav">
                    {/* Tổng quan */}
                    <div className="nav-item" onClick={handleToggleGroup}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                        <span className="nav-label">Tổng quan</span>
                    </div>
                    {/* Danh mục */}
                    <div className="nav-item active-group" onClick={handleToggleGroup}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                        <span className="nav-label">Danh mục</span>
                        <svg className="nav-chevron open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="nav-children" style={{ display: 'block' }}>
                        <div className="nav-sub active">Danh mục vật tư hàng hoá</div>
                        <div className="nav-sub">Danh mục nhân viên</div>
                        <div className="nav-sub">Danh mục vị trí</div>
                        <div className="nav-sub">Danh mục đối tượng</div>
                    </div>
                    {/* Chứng từ */}
                    <div className="nav-item" onClick={handleToggleGroup}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        <span className="nav-label">Chứng từ</span>
                        <svg className="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="nav-children" style={{ display: 'none' }}>
                        <div className="nav-sub">Phiếu nhập kho</div>
                        <div className="nav-sub">Phiếu xuất kho</div>
                        <div className="nav-sub">Kiểm kê hàng tồn kho</div>
                        <div className="nav-sub">Phiếu xuất/ nhập điều chỉnh</div>
                    </div>
                    {/* Báo cáo */}
                    <div className="nav-item" onClick={handleToggleGroup}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                        <span className="nav-label">Báo cáo</span>
                        <svg className="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="nav-children" style={{ display: 'none' }}>
                        <div className="nav-sub">Bảng kê chứng từ Phiếu nhập</div>
                        <div className="nav-sub">Bảng kê chứng từ Phiếu xuất</div>
                        <div className="nav-sub">Báo cáo Nhập - Xuất - Tồn</div>
                        <div className="nav-sub">Thẻ kho</div>
                        <div className="nav-sub">Báo cáo Cảnh báo Tồn kho an toàn</div>
                    </div>
                </nav>
                <div className="nav-bottom">
                    <div className="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span className="nav-label">Tài khoản</span>
                    </div>
                    <div className="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        <span className="nav-label">Đăng xuất</span>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <div className="main">
                {/* Topbar */}
                <div className="topbar">
                    <div className="breadcrumb">
                        <div className="breadcrumb-main">Danh mục &rsaquo; <span>Danh mục vật tư hàng hóa</span></div>
                        <div className="breadcrumb-sub">Supplies</div>
                    </div>
                    <div className="topbar-right">
                        <div className="icon-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            <div className="notif-dot"></div>
                        </div>
                        <div className="avatar"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="content">
                    <div className="page-title">Vật tư hàng hóa</div>
                    {/* Toolbar */}
                    <div className="toolbar">
                        <div className="search-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="spacer"></div>
                        <button className="btn btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Thêm mới
                        </button>
                        <button className="btn btn-outline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                            Thêm bản sao mới
                        </button>
                        <button className="btn btn-outline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export
                        </button>
                    </div>

                    {/* Table */}
                    <div className="table-card">
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                className="cb"
                                                checked={allChecked}
                                                onChange={e => toggleAll(e.target.checked)}
                                            />
                                        </th>
                                        <th><div className="th-inner">Mã VT <span className="th-sort"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg></span></div></th>
                                        <th><div className="th-inner">Tên vật tư / hàng hóa <span className="th-sort"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg></span></div></th>
                                        <th><div className="th-inner">Đơn vị tính <span className="th-sort"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg></span></div></th>
                                        <th><div className="th-inner">Loại vật tư <span className="th-sort"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg></span></div></th>
                                        <th><div className="th-inner">Mô tả / Thông số kỹ thuật <span className="th-sort"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg></span></div></th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(([id, name, unit, type, desc]) => {
                                        const isTP = type === 'Thành phẩm';
                                        return (
                                            <tr key={id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="cb"
                                                        checked={selected.has(id)}
                                                        onChange={() => toggleRow(id)}
                                                    />
                                                </td>
                                                <td className="code">{id}</td>
                                                <td>{name}</td>
                                                <td>{unit}</td>
                                                <td><span className={`badge ${isTP ? 'badge-tp' : 'badge-vt'}`}>{type}</span></td>
                                                <td style={{ color: 'var(--text-muted)' }}>{desc}</td>
                                                <td>
                                                    <button className="edit-btn" title="Chỉnh sửa">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="pagination">
                            <span className="rows-label">
                                Rows per page
                                <select
                                    value={rowsPerPage}
                                    onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                >
                                    {ROWS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </span>
                            <span className="total-info">of {totalRows} rows</span>
                            <div className="pag-spacer"></div>
                            <div className="pag-btns">
                                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                                {getPages().map((p, idx) =>
                                    p === '…'
                                        ? <span className="pag-ellipsis" key={idx}>…</span>
                                        : <button
                                            className={`pag-btn${p === page ? ' active' : ''}`}
                                            key={p}
                                            onClick={() => setPage(p)}
                                        >{p}</button>
                                )}
                                <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
                                <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
