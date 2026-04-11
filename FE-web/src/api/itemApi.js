// src/api/itemApi.js
import axiosInstance from './axiosInstance';

const API_URL = '/api/items';

// Lấy danh sách hàng hóa, hỗ trợ phân trang
export const getAllItems = async (page, size) => {
    try {
        let url = API_URL;
        if (page && size) url += `?page=${page}&size=${size}`;
        const res = await axiosInstance.get(url);
        console.log('getAllItems response:', res.data);
        // Chuẩn API: trả về res.data.data (mảng vật tư)
        return res.data.data || [];
    } catch (err) {
        console.error('getAllItems error:', err);
        throw err;
    }
};

// Lấy chi tiết hàng hóa
export const getItemById = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        console.log('getItemById response:', res.data);
        return res.data;
    } catch (err) {
        console.error('getItemById error:', err);
        throw err;
    }
};

// Cập nhật hàng hóa
export const updateItem = async (id, data) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, data);
        console.log('updateItem response:', res.data);
        return res.data;
    } catch (err) {
        console.error('updateItem error:', err);
        throw err;
    }
};

// (Có thể bổ sung thêm createItem, deleteItem nếu backend hỗ trợ)
