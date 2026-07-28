import { useState, useEffect } from 'react';
import api from '../api';

export const usePhongTro = () => {
  const [phongTros, setPhongTros] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPhongTros = async () => {
    try {
      const res = await api.get('/phong-tro');
      setPhongTros(res.data);
    } catch (err) {
            if (err.response?.status !== 401) {
        setErrorMsg("Lỗi lấy dữ liệu phòng trọ!");
      }
    }
  };

  useEffect(() => {
    fetchPhongTros();
  }, []);

  const addPhongTro = async (phongTroMoi) => {
    try {
      const res = await api.post('/phong-tro', phongTroMoi);
      setPhongTros([...phongTros, res.data]);
      alert("Thêm phòng thành công!");
      return true;
    } catch (err) {
      alert("Lỗi: Không có quyền hoặc dữ liệu sai!");
      return false;
    }
  };

  const deletePhongTro = async (id, tenPhong) => {
    if (window.confirm(`Xóa ${tenPhong}?`)) {
      try {
        await api.delete(`/phong-tro/${id}`);
        setPhongTros(phongTros.filter(p => p.id !== id));
        alert("Đã xóa!");
      } catch (err) {
        alert("Lỗi: Không có quyền xóa phòng này!");
      }
    }
  };

  return { phongTros, errorMsg, addPhongTro, deletePhongTro };
};