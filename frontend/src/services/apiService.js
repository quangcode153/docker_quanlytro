import api from '../api';

export const taiKhoanApi = {
  getChuTros: () => api.get('/tai-khoan/chu-tro'),
  getAllUsers: () => api.get('/tai-khoan/admin/danh-sach-tai-khoan'),
  getMe: () => api.get('/tai-khoan/me'),
};

export const phongTroApi = {
  getByChuTro: (id) => api.get(`/phong-tro/chu-tro/${id}`),
  create: (data) => api.post('/phong-tro', data),
  delete: (id) => api.delete(`/phong-tro/${id}`),
  updateStatus: (id, status) => api.put(`/phong-tro/${id}/trang-thai`, null, { params: { trangThai: status } }),
};

export const hopDongApi = {
  getByChuTro: (id) => api.get(`/hop-dong/chu-tro/${id}`),
  create: (data) => api.post('/hop-dong', data),
  updateStatus: (id, status) => api.put(`/hop-dong/${id}/trang-thai`, null, { params: { trangThai: status } }),
};