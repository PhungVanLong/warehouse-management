import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/shared.css";
import "./batches.css";
import { getBatchById } from "../../api/batchApi";

function formatDate(str) {
    if (!str) return "—";
    return str.slice(0, 10);
}

function formatDateTime(str) {
    if (!str) return "—";
    return str.replace("T", " ").slice(0, 16);
}

function formatNumber(val) {
    if (val === null || val === undefined || val === "") return "—";
    return Number(val).toLocaleString("vi-VN");
}

function ReadField({ label, value, highlight }) {
    return (
        <div className="sd-field">
            <label className="sd-label">{label}</label>
            <div className={`bt-read-value${highlight ? " bt-read-value-highlight" : ""}`}>{value}</div>
        </div>
    );
}

export default function BatchDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getBatchById(id)
            .then(setBatch)
            .catch(() => setError("Không thể tải thông tin lô hàng."))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="sp-main">
            {/* Topbar */}
            <div className="sp-topbar">
                <div>
                    <div className="sp-breadcrumb">
                        Danh mục &rsaquo;{" "}
                        <span className="sp-breadcrumb-link" onClick={() => navigate("/batches")}>
                            Danh mục lô vật tư hàng hóa
                        </span>{" "}
                        &rsaquo; <span className="sp-breadcrumb-active">Chi tiết lô hàng</span>
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
                <h1 className="sp-title">Chi tiết lô hàng</h1>

                {loading ? (
                    <div className="sp-status-row">Đang tải...</div>
                ) : error ? (
                    <div className="sp-status-row sp-status-error">{error}</div>
                ) : batch && (
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

                        {/* Detail fields */}
                        <div className="sd-form">
                            <ReadField label="Mã lô" value={batch.batchCode} />
                            <ReadField label="Tên lô" value={batch.nameBatch || "—"} />
                            <ReadField label="Mã vật tư" value={batch.itemcode || "—"} />
                            <ReadField label="Tên vật tư / hàng hóa" value={batch.itemname || "—"} />


                            <div className="sd-field sd-field-row">
                                <div className="sd-field-half">
                                    <label className="sd-label">Số lượng ban đầu</label>
                                    <div className="bt-read-value">{formatNumber(batch.quantity)}</div>
                                </div>
                                <div className="sd-field-half">
                                    <label className="sd-label">Số lượng còn lại</label>
                                    <div className={`bt-read-value${batch.quantityRemaining === 0 ? " bt-qty-zero-text" : " bt-read-value-highlight"}`}>
                                        {formatNumber(batch.quantityRemaining)}
                                    </div>
                                </div>
                            </div>

                            <ReadField label="Đơn giá nhập" value={formatNumber(batch.unitCost)} />

                            <ReadField label="Ngày sản xuất" value={formatDate(batch.manufactureDate)} />

                            <ReadField label="Ngày tạo" value={formatDateTime(batch.createdAt)} />
                        </div>

                        {/* Footer */}
                        <div className="sd-footer">
                            <button className="sd-btn-back" onClick={() => navigate("/batches")}>
                                ← Quay lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
