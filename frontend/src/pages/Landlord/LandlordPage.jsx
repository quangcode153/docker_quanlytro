/**
 * LandlordPage.jsx — Trang chính dành cho Chủ Trọ
 * Phase 3: Đã tách toàn bộ UI thành các component con trong ./components/
 * File này chỉ xử lý: State management, API calls, và định tuyến Tab.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import api from '../../api';
import ChatBox from '../../components/ChatBox';
import HoSoForm from '../../components/HoSoForm';
import ContractModal from '../../components/ContractModal';
import ConfirmModal from '../../components/ConfirmModal';
import useAdminContact from '../../hooks/useAdminContact';
import Footer from '../../components/Footer';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/* --- Component con theo từng Tab --- */
import DashboardTab from './components/DashboardTab';
import RoomTab from './components/RoomTab';
import ContractTab from './components/ContractTab';
import InvoiceTab from './components/InvoiceTab';
import UtilityTab from './components/UtilityTab';
import NoticeTab from './components/NoticeTab';
import RoomDetailModal from './components/RoomDetailModal';
import UtilityModal from './components/UtilityModal';
import TenantListTab from './components/TenantListTab';

import './LandlordPage.css';

/* --- Hằng số --- */
const ROLES = { LANDLORD: 'ROLE_LANDLORD' };
const ROOM_STATUS = { EMPTY: 'TRONG', RENTED: 'DA_THUE', MAINTENANCE: 'BAO_TRI' };
const CONTRACT_STATUS = {
  PENDING: 'CHO_DUYET',
  APPROVED: 'DA_DUYET',
  REJECTED: 'TU_CHOI',
  CANCELLING: 'YEU_CAU_HUY',
  CANCELLED: 'HUY'
};

/* --- Spinner dùng nội bộ --- */
function Spinner({ text }) {
  const { t } = useTranslation();
  const loadingText = text || t('landlord.loading');
  return (
    <div className="l-spinner">
      <div className="l-spinner__circle" />
      <div className="l-spinner__text">{loadingText}</div>
    </div>
  );
}

/* =========================================
   COMPONENT CHÍNH
   ========================================= */
function LandlordPage({ currentUser, unreadSenderIds = [], setUnreadSenderIds, onSetChatTarget, onLogout }) {
  const { t, i18n } = useTranslation();

  /* Kiểm tra quyền truy cập */
  const userRole = (currentUser?.role || '').startsWith('ROLE_') ? currentUser.role : `ROLE_${currentUser.role}`;
  if (userRole !== ROLES.LANDLORD) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>
        {t('landlord.access_denied')}
      </div>
    );
  }

  /* ===== STATE ===== */
  const [landlordTab, setLandlordTab] = useState('PHONG');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /* Dữ liệu chính */
  const [phongTros, setPhongTros] = useState([]);
  const [hopDongs, setHopDongs] = useState([]);
  const [hoaDons, setHoaDons] = useState([]);
  const [thongBaos, setThongBaos] = useState([]);
  const [thongKeData, setThongKeData] = useState(null);
  const [landlordProfile, setLandlordProfile] = useState(null);

  /* Loading states */
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Modal states */
  const [phongChiTiet, setPhongChiTiet] = useState(null);   // Modal chi tiết phòng
  const [hoSoKhachThue, setHoSoKhachThue] = useState(null);
  const [dienNuocForm, setDienNuocForm] = useState(null);   // Modal điện nước
  const [lichSuChiSo, setLichSuChiSo] = useState([]);
  const [previewContract, setPreviewContract] = useState(null); // Modal hợp đồng
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  /* Form thêm phòng */
  const [tenPhong, setTenPhong] = useState('');
  const [giaPhong, setGiaPhong] = useState('');
  const [trangThai, setTrangThai] = useState(ROOM_STATUS.EMPTY);
  const [giaDien, setGiaDien] = useState('');
  const [giaNuoc, setGiaNuoc] = useState('');
  const [tienCoc, setTienCoc] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [dienTich, setDienTich] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [moTa, setMoTa] = useState('');

  /* Form thông báo */
  const [tieuDeTB, setTieuDeTB] = useState('');
  const [noiDungTB, setNoiDungTB] = useState('');

  /* Form điện nước */
  const [formDN, setFormDN] = useState({
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    chiSoDauDien: '', chiSoCuoiDien: '',
    chiSoDauNuoc: '', chiSoCuoiNuoc: '',
  });

  /* Contact admin */
  const { admin: adminContact, loading: loadingAdmin, error: adminError } = useAdminContact();
  const hasAdminUnread = adminContact?.id && unreadSenderIds.some(id => String(id) === String(adminContact.id));
  const tenantUnreadCount = unreadSenderIds.filter(id => !adminContact?.id || String(id) !== String(adminContact.id)).length;

  /* ===== API CALLS ===== */
  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refresh-contract-data', handleRefresh);
    return () => window.removeEventListener('refresh-contract-data', handleRefresh);
  }, []);

  /** Fetch tất cả dữ liệu chính khi load trang */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [phongRes, hdRes, invRes, tkRes, profRes, tbRes] = await Promise.all([
        api.get(`/phong-tro/chu-tro/${currentUser.id}`),
        api.get(`/hop-dong/chu-tro/${currentUser.id}`),
        api.get(`/hoa-don/chu-tro/${currentUser.id}`),
        api.get(`/thong-ke/chu-tro/${currentUser.id}`),
        api.get('/khach-hang/ho-so/me'),
        api.get(`/thong-bao/chu-tro/${currentUser.id}`).catch(() => ({ data: [] })),
      ]);

      const rawHopDongs = hdRes.data || [];

      // Filter out pending contracts that were cancelled by the client using chat history
      const pendingContracts = rawHopDongs.filter(hd => hd.trangThai === 'CHO_DUYET');
      const checkedPending = await Promise.all(
        pendingContracts.map(async (hd) => {
          if (!hd.khachHang?.id) return hd;
          try {
            const chatRes = await api.get(`/tin-nhan/${currentUser.id}/${hd.khachHang.id}`);
            const messages = chatRes.data || [];
            let lastCancelIndex = -1;
            let lastReopenIndex = -1;
            for (let idx = 0; idx < messages.length; idx++) {
              const msg = messages[idx];
              if (msg.noiDung && msg.noiDung.includes(`(ID: ${hd.id})`)) {
                if (msg.noiDung.includes('[SYSTEM_CONTRACT_CANCELLED]')) {
                  lastCancelIndex = idx;
                } else if (msg.noiDung.includes('[SYSTEM_CONTRACT_REOPENED]')) {
                  lastReopenIndex = idx;
                }
              }
            }
            const isCancelled = lastCancelIndex !== -1 && lastCancelIndex > lastReopenIndex;
            return { ...hd, isCancelledByClient: isCancelled };
          } catch {
            return hd;
          }
        })
      );

      const cancelledIds = checkedPending
        .filter(hd => hd.isCancelledByClient)
        .map(hd => hd.id);

      const filteredHopDongs = rawHopDongs.filter(hd => !cancelledIds.includes(hd.id));

      setPhongTros(phongRes.data || []);
      setHopDongs(filteredHopDongs);
      setHoaDons(invRes.data || []);
      setThongKeData(tkRes.data || null);
      setLandlordProfile(profRes.data || null);
      setThongBaos(tbRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch thông báo (chỉ gọi khi chuyển sang tab Thông báo) */
  const fetchThongBao = async () => {
    try {
      const res = await api.get(`/thong-bao/chu-tro/${currentUser.id}`);
      setThongBaos(res.data || []);
    } catch (err) {
      console.error(t('landlord.error_fetch_notice'), err);
    }
  };

  /** Fetch lịch sử chỉ số điện nước của một phòng */
  const fetchLichSuChiSo = async (phongId) => {
    try {
      const res = await api.get(`/dien-nuoc/phong/${phongId}`);
      setLichSuChiSo(res.data || []);
    } catch (err) {
      console.error('Lỗi tải lịch sử điện nước:', err);
    }
  };

  /* ===== HANDLERS ===== */

  /** Thêm phòng mới */
  const handleThemPhong = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/phong-tro', {
        tenPhong,
        giaPhong: parseFloat(String(giaPhong).replace(/,/g, '')),
        trangThai,
        chuTroId: currentUser.id,
        giaDien: giaDien ? parseFloat(String(giaDien).replace(/,/g, '')) : null,
        giaNuoc: giaNuoc ? parseFloat(String(giaNuoc).replace(/,/g, '')) : null,
        tienCoc: tienCoc ? parseFloat(String(tienCoc).replace(/,/g, '')) : null,
        diaChi,
        dienTich: dienTich ? parseFloat(String(dienTich).replace(/,/g, '')) : null,
        hinhAnh,
        moTa
      });

      setConfirmState({
        isOpen: true,
        type: 'success',
        title: t('common.success'),
        message: t('landlord.success_add_room'),
        onConfirm: () => {
          setTenPhong('');
          setGiaPhong('');
          setTrangThai(ROOM_STATUS.EMPTY);
          setGiaDien('');
          setGiaNuoc('');
          setTienCoc('');
          setDiaChi('');
          setDienTich('');
          setHinhAnh('');
          setMoTa('');
          fetchData();
        }
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || t('landlord.error_add_room');
      setConfirmState({
        isOpen: true,
        type: 'danger',
        title: t('common.error'),
        message: msg,
        onConfirm: null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Xoá phòng (với Optimistic UI) */
  const handleXoaPhong = async (id, ten) => {
    setConfirmState({
      isOpen: true,
      type: 'danger',
      title: t('common.confirm'),
      message: t('landlord.confirm_delete_room', { ten }),
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        const prevData = [...phongTros];
        setPhongTros(prev => prev.filter(p => p.id !== id));
        try {
          await api.delete(`/phong-tro/${id}`);
        } catch {
          setConfirmState({
            isOpen: true,
            type: 'danger',
            title: t('common.error'),
            message: t('landlord.error_delete_room'),
            onConfirm: null
          });
          setPhongTros(prevData);
        }
      }
    });
  };

  /** Đổi trạng thái phòng */
  const handleDoiTrangThaiPhong = async (phongId, trangThaiMoi) => {
    const statusText = t(`landlord.room_status_${trangThaiMoi}`);

    setConfirmState({
      isOpen: true,
      type: 'warning',
      title: t('common.confirm'),
      message: t('landlord.confirm_change_status', { trangThaiMoi: statusText }),
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          await api.put(`/phong-tro/${phongId}/trang-thai`, null, {
            params: { trangThai: trangThaiMoi },
          });
          setPhongChiTiet(null);
          fetchData();
        } catch {
          setConfirmState({
            isOpen: true,
            type: 'danger',
            title: t('common.error'),
            message: t('landlord.error_update'),
            onConfirm: null
          });
        }
      }
    });
  };

  /** Xem chi tiết phòng (mở modal) */
  const handleXemChiTiet = async (phong, hopDongHienTai) => {
    setPhongChiTiet({ phong, hopDongHienTai });
    setHoSoKhachThue(null);
    if (hopDongHienTai?.khachHang?.id) {
      try {
        const res = await api.get(`/khach-hang/chi-tiet/${hopDongHienTai.khachHang.id}`);
        setHoSoKhachThue(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  /** Mở form xem hồ sơ khách từ tab Yêu cầu */
  const handleXemHoSoKhach = async (hd) => {
    try {
      const res = await api.get(`/khach-hang/chi-tiet/${hd.khachHang.id}`);
      setHoSoKhachThue(res.data);
      setPhongChiTiet({ phong: hd.phongTro, hopDongHienTai: hd });
    } catch {
      alert(t('landlord.error_load_profile'));
    }
  };

  /** Xem hợp đồng từ tab Yêu cầu */
  const handleXemHopDong = async (hd) => {
    try {
      const res = await api.get(`/khach-hang/chi-tiet/${hd.khachHang.id}`);
      setPreviewContract({ ...hd, hoSoKhachHang: res.data });
    } catch {
      alert(t('landlord.error_load_profile'));
    }
  };

  /** Duyệt hợp đồng từ Modal */
  const handleDuyetTuModal = async (contractData) => {
    if (!previewContract) return;
    setIsSubmitting(true);
    const tenantId = previewContract.khachHang?.id;
    try {
      await api.put(`/hop-dong/${previewContract.id}/trang-thai`, null, {
        params: {
          trangThai: CONTRACT_STATUS.APPROVED,
          ngayKetThuc: contractData?.ngayKetThuc || null
        },
      });

      // Gửi WebSocket thông báo cho khách thuê
      if (tenantId) {
        const customEvent = new CustomEvent('send-system-message', {
          detail: {
            nguoiGuiId: currentUser.id,
            nguoiNhanId: tenantId,
            noiDung: `[SYSTEM_CONTRACT_APPROVED] Chủ trọ đã phê duyệt hợp đồng thuê phòng của bạn!`,
            thoiGian: new Date().toISOString()
          }
        });
        window.dispatchEvent(customEvent);
      }

      setConfirmState({
        isOpen: true,
        type: 'success',
        title: t('common.success'),
        message: t('landlord.success_update'),
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          fetchData();
        }
      });
    } catch {
      setConfirmState({
        isOpen: true,
        type: 'danger',
        title: t('common.error'),
        message: t('landlord.error_approve_contract'),
        onConfirm: null
      });
    } finally {
      setIsSubmitting(false);
      setPreviewContract(null);
    }
  };

  const handleDuyetHopDong = async (hopDongId, trangThaiMoi) => {
    // Tìm hợp đồng hiện tại để lấy thông tin trạng thái cũ
    const hd = hopDongs.find(h => h.id === hopDongId);
    const statusText = t(`landlord.contract_status_${trangThaiMoi}`);

    let message = t('landlord.confirm_contract', { trangThaiMoi: statusText });
    let confirmText = t('common.confirm') || 'Xác nhận';
    let cancelText = t('common.cancel') || 'Hủy';

    // Logic đặc biệt cho phần Hủy hợp đồng
    if (hd?.trangThai === CONTRACT_STATUS.CANCELLING) {
      if (trangThaiMoi === CONTRACT_STATUS.APPROVED) {
        message = t('landlord.confirm_keep_contract') || "Bạn có chắc chắn muốn TỪ CHỐI yêu cầu hủy và tiếp tục duy trì hợp đồng này không?";
        confirmText = t('landlord.btn_keep_contract_short') || "Giữ lại HĐ";
        cancelText = t('landlord.btn_back_short') || "Quay lại";
      } else if (trangThaiMoi === CONTRACT_STATUS.CANCELLED) {
        message = t('landlord.confirm_approve_cancel') || "Xác nhận ĐỒNG Ý hủy hợp đồng này và giải phóng phòng trống?";
        confirmText = t('landlord.btn_approve_cancel_short') || "Đồng ý hủy";
        cancelText = t('landlord.btn_back_short') || "Quay lại";
      }
    } else {
      if (trangThaiMoi === CONTRACT_STATUS.REJECTED) {
        confirmText = t('landlord.btn_reject_req') || "Từ chối yêu cầu";
        cancelText = t('landlord.btn_back_short') || "Quay lại";
      } else if (trangThaiMoi === CONTRACT_STATUS.APPROVED) {
        confirmText = t('landlord.btn_approve_contract') || "Duyệt hợp đồng";
        cancelText = t('landlord.btn_back_short') || "Quay lại";
      }
    }

    setConfirmState({
      isOpen: true,
      type: (trangThaiMoi === CONTRACT_STATUS.REJECTED || trangThaiMoi === CONTRACT_STATUS.CANCELLED) ? 'danger' : 'info',
      title: t('common.confirm') || 'Xác nhận',
      message,
      confirmText,
      cancelText,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        const tenantId = hd?.khachHang?.id;
        try {
          await api.put(`/hop-dong/${hopDongId}/trang-thai`, null, {
            params: { trangThai: trangThaiMoi },
          });

          // Gửi thông báo WebSocket cho khách thuê dựa trên trạng thái mới
          if (tenantId) {
            let sysMsg = '';
            if (trangThaiMoi === CONTRACT_STATUS.APPROVED) {
              if (hd.trangThai === CONTRACT_STATUS.CANCELLING) {
                sysMsg = `[SYSTEM_CONTRACT_APPROVED] Yêu cầu hủy bị từ chối. Hợp đồng tiếp tục được duy trì.`;
              } else {
                sysMsg = `[SYSTEM_CONTRACT_APPROVED] Chủ trọ đã phê duyệt hợp đồng thuê phòng của bạn!`;
              }
            } else if (trangThaiMoi === CONTRACT_STATUS.REJECTED) {
              sysMsg = `[SYSTEM_CONTRACT_REJECTED] Yêu cầu thuê phòng của bạn đã bị từ chối.`;
            } else if (trangThaiMoi === CONTRACT_STATUS.CANCELLED) {
              sysMsg = `[SYSTEM_CONTRACT_CANCELLED] Chủ trọ đã đồng ý hủy hợp đồng của bạn.`;
            }
            
            if (sysMsg) {
              const customEvent = new CustomEvent('send-system-message', {
                detail: {
                  nguoiGuiId: currentUser.id,
                  nguoiNhanId: tenantId,
                  noiDung: sysMsg,
                  thoiGian: new Date().toISOString()
                }
              });
              window.dispatchEvent(customEvent);
            }
          }

          fetchData();
        } catch {
          setConfirmState({
            isOpen: true,
            type: 'danger',
            title: t('common.error'),
            message: t('landlord.error_approve_contract'),
            onConfirm: null
          });
        }
      }
    });
  };

  /** Mở modal chốt chỉ số điện nước (tạo mới) */
  const handleMoChotSo = (hd) => {
    setDienNuocForm({
      hopDongId: hd.id,
      phongId: hd.phongTro?.id,
      tenPhong: hd.phongTro?.tenPhong,
    });
    setFormDN({
      thang: new Date().getMonth() + 1,
      nam: new Date().getFullYear(),
      chiSoDauDien: '', chiSoCuoiDien: '',
      chiSoDauNuoc: '', chiSoCuoiNuoc: '',
    });
    fetchLichSuChiSo(hd.phongTro?.id);
  };

  /** Mở modal chỉnh sửa chỉ số (cập nhật) */
  const handleMoCapNhatSo = async (hd) => {
    try {
      const res = await api.get('/dien-nuoc/chi-so', {
        params: { phongId: hd.phongTro.id, thang: hd.thang, nam: hd.nam },
      });
      const cs = res.data;
      setDienNuocForm({
        isUpdate: true,
        hoaDonId: hd.id,
        phongId: hd.phongTro.id,
        tenPhong: hd.phongTro.tenPhong,
      });
      setFormDN({
        thang: hd.thang, nam: hd.nam,
        chiSoDauDien: cs.soDienCu, chiSoCuoiDien: cs.soDienMoi,
        chiSoDauNuoc: cs.soNuocCu, chiSoCuoiNuoc: cs.soNuocMoi,
      });
      fetchLichSuChiSo(hd.phongTro.id);
    } catch {
      alert(t('landlord.error_fetch_bill'));
    }
  };

  /** Submit form chốt / cập nhật điện nước */
  const handleChotDienNuoc = async (e) => {
    e.preventDefault();

    const soDienCu = parseInt(formDN.chiSoDauDien);
    const soDienMoi = parseInt(formDN.chiSoCuoiDien);
    const soNuocCu = parseInt(formDN.chiSoDauNuoc);
    const soNuocMoi = parseInt(formDN.chiSoCuoiNuoc);

    if (isNaN(soDienCu) || isNaN(soDienMoi) || isNaN(soNuocCu) || isNaN(soNuocMoi)) {
      alert(t('landlord.alert_fill_utility_indexes') || "⚠️ Vui lòng nhập đầy đủ các chỉ số điện và nước!");
      return;
    }

    if (soDienMoi < soDienCu) {
      alert(t('landlord.alert_invalid_electric_index') || "⚠️ Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ!");
      return;
    }

    if (soNuocMoi < soNuocCu) {
      alert(t('landlord.alert_invalid_water_index') || "⚠️ Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phongTro: { id: dienNuocForm.phongId },
        thang: parseInt(formDN.thang),
        nam: parseInt(formDN.nam),
        soDienCu,
        soDienMoi,
        soNuocCu,
        soNuocMoi,
      };

      if (dienNuocForm.isUpdate) {
        await api.put(`/dien-nuoc/cap-nhat/${dienNuocForm.hoaDonId}`, payload);
        setConfirmState({
          isOpen: true,
          type: 'success',
          title: t('common.success'),
          message: t('landlord.success_update_bill'),
          onConfirm: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            fetchData();
          }
        });
      } else {
        await api.post('/dien-nuoc/chot-so', payload);
        setConfirmState({
          isOpen: true,
          type: 'success',
          title: t('common.success'),
          message: t('landlord.success_create_bill'),
          onConfirm: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            fetchData();
          }
        });
      }

      setDienNuocForm(null);
    } catch (err) {
      const msg = err.response?.data?.thongBao || err.response?.data?.message;
      setConfirmState({
        isOpen: true,
        type: 'danger',
        title: t('common.error'),
        message: msg || t('landlord.error_save_bill'),
        onConfirm: null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Đăng thông báo */
  const handleDangThongBao = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/thong-bao', {
        tieuDe: tieuDeTB,
        noiDung: noiDungTB,
        chuTroId: currentUser.id,
      });
      setTieuDeTB('');
      setNoiDungTB('');
      fetchThongBao();
    } catch {
      alert(t('landlord.error_post_notice'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== COMPUTED ===== */
  const pendingCount = hopDongs.filter(
    hd => hd.trangThai === CONTRACT_STATUS.PENDING || hd.trangThai === CONTRACT_STATUS.CANCELLING
  ).length;

  /* ===== TABS CONFIG ===== */
  const TABS = [
    { key: 'BAO_CAO', label: t('landlord.tab_report'), icon: '', onClick: fetchData },
    { key: 'PHONG', label: t('landlord.tab_room'), icon: '' },
    { key: 'YEU_CAU', label: t('landlord.tab_request'), icon: '', badge: pendingCount, onClick: fetchData },
    { key: 'DIEN_NUOC', label: t('landlord.tab_bill'), icon: '', onClick: fetchData },
    { key: 'HOA_DON', label: t('landlord.tab_invoice'), icon: '', onClick: fetchData },
    { key: 'THONG_BAO', label: t('landlord.tab_notice'), icon: '', onClick: fetchThongBao },
    { key: 'LIEN_HE', label: t('landlord.tab_contact'), icon: '', badge: tenantUnreadCount, onClick: fetchData },
    { key: 'HO_SO', label: t('landlord.tab_profile'), icon: '' },
  ];

  /* ===== RENDER ===== */
  return (
    <>
      {/* Mobile Header */}
      <div className="dashboard-mobile-header">
        <div className="dashboard-mobile-header__brand">
          <span className="dashboard-mobile-header__logo-icon">🏠</span>
          <span className="dashboard-mobile-header__logo-title">{t('home.brand')}</span>
        </div>
        <button
          className="dashboard-mobile-header__toggle"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
      </div>

      {/* Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="dashboard-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="dashboard-layout" style={{ fontFamily: 'var(--font)' }}>
        {/* Sidebar dọc cố định / Drawer di động */}
        <div className={`dashboard-sidebar ${isMobileSidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
          <button
            className="dashboard-sidebar__close-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>
          <div className="dashboard-sidebar__top">
            <div className="dashboard-sidebar__logo">
              <span className="dashboard-sidebar__logo-icon">🏠</span>
              <div className="dashboard-sidebar__logo-text">
                <div className="dashboard-sidebar__logo-title">{t('home.brand')}</div>
                <div className="dashboard-sidebar__logo-subtitle">{t('header.portal_landlord')}</div>
              </div>
            </div>
            <div className="dashboard-sidebar__menu">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`dashboard-sidebar__item ${landlordTab === tab.key ? 'dashboard-sidebar__item--active' : ''}`}
                  onClick={() => {
                    setLandlordTab(tab.key);
                    tab.onClick?.();
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.badge > 0 && (
                    <span className="landlord-nav-bar__badge" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--danger)', color: '#fff', fontSize: '10px',
                      marginLeft: '6px', fontWeight: 700
                    }}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-sidebar__footer">
            <button className="dashboard-sidebar__logout-btn" onClick={() => {
              setIsMobileSidebarOpen(false);
              onLogout();
            }}>
              {t('header.logout') || 'Đăng xuất'}
            </button>
          </div>
        </div>

        {/* Khu vực nội dung chính bên phải */}
        <div className="dashboard-content">
          {/* Top Header cho dashboard */}
          <div className="dashboard-content__header">
            <h2 className="dashboard-content__title">
              {TABS.find(t => t.key === landlordTab)?.label}
            </h2>
            <div className="dashboard-content__actions">
              <button
                className="btn btn--outline"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  fontSize: '13px'
                }}
                onClick={() => adminContact && onSetChatTarget(adminContact)}
                disabled={loadingAdmin || !!adminError}
              >
                {loadingAdmin
                  ? t('landlord.btn_connecting')
                  : adminError
                    ? t('landlord.btn_offline')
                    : t('landlord.btn_chat_admin')}
                {hasAdminUnread && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--danger)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
                    animation: 'pulseDot 1.2s infinite'
                  }} />
                )}
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Profile Info */}
              <div className="dashboard-header-profile">
                <div className="dashboard-header-avatar">
                  {(currentUser?.username || 'G').charAt(0).toUpperCase()}
                </div>
                <div className="dashboard-header-userinfo">
                  <div className="dashboard-header-username">
                    {currentUser?.username}
                  </div>
                  <div className="dashboard-header-role">
                    {t('header.role_LANDLORD')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === Spinner khi đang tải lần đầu === */}
          {loading && <Spinner text={t('landlord.syncing')} />}

          {/* === Nội dung từng Tab === */}
          {!loading && landlordTab === 'BAO_CAO' && (
            <DashboardTab
              thongKeData={thongKeData}
              hoaDons={hoaDons}
              hopDongs={hopDongs}
              thongBaos={thongBaos}
              onSetChatTarget={onSetChatTarget}
            />
          )}

          {!loading && landlordTab === 'PHONG' && (
            <RoomTab
              phongTros={phongTros}
              hopDongs={hopDongs}
              tenPhong={tenPhong} setTenPhong={setTenPhong}
              giaPhong={giaPhong} setGiaPhong={setGiaPhong}
              trangThai={trangThai} setTrangThai={setTrangThai}
              giaDien={giaDien} setGiaDien={setGiaDien}
              giaNuoc={giaNuoc} setGiaNuoc={setGiaNuoc}
              tienCoc={tienCoc} setTienCoc={setTienCoc}
              diaChi={diaChi} setDiaChi={setDiaChi}
              dienTich={dienTich} setDienTich={setDienTich}
              hinhAnh={hinhAnh} setHinhAnh={setHinhAnh}
              moTa={moTa} setMoTa={setMoTa}
              isSubmitting={isSubmitting}
              onThemPhong={handleThemPhong}
              onXoaPhong={handleXoaPhong}
              onXemChiTiet={handleXemChiTiet}
            />
          )}

          {!loading && landlordTab === 'YEU_CAU' && (
            <ContractTab
              hopDongs={hopDongs}
              onDuyetHopDong={handleDuyetHopDong}
              onXemHopDong={handleXemHopDong}
              onSetChatTarget={onSetChatTarget}
              onXemHoSo={handleXemHoSoKhach}
              onRefresh={fetchData}
            />
          )}

          {!loading && landlordTab === 'DIEN_NUOC' && (
            <UtilityTab
              hopDongs={hopDongs}
              onMoChotSo={handleMoChotSo}
            />
          )}

          {!loading && landlordTab === 'HOA_DON' && (
            <InvoiceTab
              hoaDons={hoaDons}
              onCapNhatSo={handleMoCapNhatSo}
            />
          )}

          {!loading && landlordTab === 'THONG_BAO' && (
            <NoticeTab
              thongBaos={thongBaos}
              tieuDeTB={tieuDeTB} setTieuDeTB={setTieuDeTB}
              noiDungTB={noiDungTB} setNoiDungTB={setNoiDungTB}
              isSubmitting={isSubmitting}
              onDangThongBao={handleDangThongBao}
            />
          )}

          {!loading && landlordTab === 'LIEN_HE' && (
            <TenantListTab
              currentUser={currentUser}
              hopDongs={hopDongs}
              onSetChatTarget={onSetChatTarget}
              unreadSenderIds={unreadSenderIds}
            />
          )}

          {!loading && landlordTab === 'HO_SO' && (
            <div className="l-card">
              <HoSoForm user={currentUser} />
            </div>
          )}
          <Footer />
        </div> {/* Close dashboard-content */}

        {/* === Modals === */}
        <RoomDetailModal
          phongChiTiet={phongChiTiet}
          hoSoKhachThue={hoSoKhachThue}
          onClose={() => setPhongChiTiet(null)}
          onDoiTrangThai={handleDoiTrangThaiPhong}
          onSetChatTarget={onSetChatTarget}
        />

        <UtilityModal
          dienNuocForm={dienNuocForm}
          formDN={formDN}
          setFormDN={setFormDN}
          lichSuChiSo={lichSuChiSo}
          isSubmitting={isSubmitting}
          onSubmit={handleChotDienNuoc}
          onClose={() => setDienNuocForm(null)}
        />



        <ContractModal
          isOpen={!!previewContract}
          onClose={() => setPreviewContract(null)}
          phong={previewContract?.phongTro}
          chuTroInfo={landlordProfile || { hoTen: currentUser.username }}
          khachThueInfo={previewContract?.hoSoKhachHang}
          onConfirm={previewContract?.trangThai === 'CHO_DUYET' ? handleDuyetTuModal : null}
          confirmText={t('guest.approve_contract')}
          isProcessing={isSubmitting}
          role="LANDLORD"
          hopDong={previewContract}
        />

        <ConfirmModal
          {...confirmState}
          onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </>
  );
}

export default LandlordPage;
