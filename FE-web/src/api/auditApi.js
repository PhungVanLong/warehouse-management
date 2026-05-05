// src/api/auditApi.js
import axiosInstance from './axiosInstance';

const BASE = '/api/inventory-audits';

/** GET /api/inventory-audits */
export const getAllAudits = async () => {
    const res = await axiosInstance.get(BASE);
    return res.data.data || [];
};

/** GET /api/inventory-audits/{id} */
export const getAuditById = async (id) => {
    const res = await axiosInstance.get(`${BASE}/${id}`);
    return res.data.data;
};

/**
 * POST /api/inventory-audits — Tạo phiếu kiểm kê (DRAFT)
 * body: { docno, docDate, description, locationId, details: [{itemId, actualquantity, description}] }
 */
export const createAudit = async (body) => {
    const res = await axiosInstance.post(BASE, body);
    return res.data;
};

/**
 * PUT /api/inventory-audits/{id} — Cập nhật phiếu DRAFT
 */
export const updateAudit = async (id, body) => {
    const res = await axiosInstance.put(`${BASE}/${id}`, body);
    return res.data;
};

/** POST /api/inventory-audits/{id}/confirm */
export const confirmAudit = async (id) => {
    const res = await axiosInstance.post(`${BASE}/${id}/confirm`);
    return res.data;
};

/** POST /api/inventory-audits/{id}/cancel */
export const cancelAudit = async (id) => {
    const res = await axiosInstance.post(`${BASE}/${id}/cancel`);
    return res.data;
};
