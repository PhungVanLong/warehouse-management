// src/api/locationApi.js
import axiosInstance from './axiosInstance';
import { getAllBatches } from './batchApi';
import { getAllReceipts } from './receiptApi';

const API_URL = '/api/locations';

export const getAllLocations = async () => {
    const res = await axiosInstance.get(API_URL);
    return res.data.data || [];
};

export const getLocationById = async (id) => {
    const res = await axiosInstance.get(`${API_URL}/${id}`);
    return res.data.data;
};

export const createLocation = async (body) => {
    const res = await axiosInstance.post(API_URL, body);
    return res.data.data;
};

export const updateLocation = async (id, body) => {
    const res = await axiosInstance.put(`${API_URL}/${id}`, body);
    return res.data.data;
};

/** GET /api/locations/{id}/items — Danh sách vật tư đang chứa tại vị trí */
export const getItemsAtLocation = async (id) => {
    const res = await axiosInstance.get(`${API_URL}/${id}/items`);
    const data = res.data.data || null;
    if (!data) return null;

    // If response includes batch codes, filter out batches that are not from CONFIRMED receipts.
    // Per API docs: batchCode/batchId are only guaranteed to appear for batches whose parent
    // goods receipt is CONFIRMED. Some backends may still return unconfirmed batches; FE
    // will proactively filter them here by loading batches and receipts and keeping only
    // batchCodes whose receipt detail's parent receipt has docstatus === 'CONFIRMED'.
    try {
        const [allBatches, allReceipts] = await Promise.all([getAllBatches(), getAllReceipts()]);
        const statusByDetailId = {};
        (allReceipts || []).forEach((receipt) => {
            (receipt.details || []).forEach((detail) => {
                if (detail?.id) statusByDetailId[detail.id] = receipt.docstatus;
            });
        });

        const confirmedCodes = new Set();
        (allBatches || []).forEach((b) => {
            if (!b) return;
            const code = b.batchCode || b.batchcode || "";
            const detailId = b.receiptDetailId;
            if (code && detailId && statusByDetailId[detailId] === 'CONFIRMED') confirmedCodes.add(code);
        });

        if (data.items && Array.isArray(data.items)) {
            data.items = data.items.map((it) => {
                if (!it) return it;
                if (Array.isArray(it.batchCodes) && it.batchCodes.length > 0) {
                    const filtered = it.batchCodes.filter((c) => !c || confirmedCodes.has(c));
                    return { ...it, batchCodes: filtered };
                }
                return it;
            });
        }
    } catch (err) {
        // If anything fails, return original data (best-effort filtering only)
        return data;
    }

    return data;
};
