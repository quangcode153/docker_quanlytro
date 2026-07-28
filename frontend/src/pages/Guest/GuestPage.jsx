import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import ChatBox from '../../components/ChatBox';
import KhieuNaiForm from '../../components/KhieuNaiForm';
import HoSoForm from '../../components/HoSoForm';
import ContractModal from '../../components/ContractModal';
import ConfirmModal from '../../components/ConfirmModal';
import useAdminContact from '../../hooks/useAdminContact';
import ImageSlider from '../../components/ImageSlider';
import TenantContactTab from '../Tenant/TenantContactTab';
import './GuestPage.css';
import RoomDetailModalForGuest from '../../components/RoomDetailModalForGuest';

const ROLES = { USER: 'ROLE_USER' };
const ROOM_STATUS = { EMPTY: 'TRONG', RENTED: 'DA_THUE', MAINTENANCE: 'BAO_TRI' };

const validateHoSo = (hoSo) => hoSo && hoSo.soCccd && hoSo.soDienThoai;

const S = {
  navBar: {
    display: 'flex', gap: '2px', background: 'var(--border-light)',
    padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    marginBottom: '20px', width: 'fit-content',
  },

  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', padding: '20px',
  },
  tag: (color) => {
    const map = {
      green: { bg: 'var(--success-light)', text: 'var(--success)' },
      red: { bg: 'var(--danger-light)', text: 'var(--danger)' },
    };
    return {
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      background: map[color].bg, color: map[color].text,
    };
  },
  btn: {
    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, transition: 'all var(--transition)',
  },
  btnPrimary: {
    padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none',
    background: 'var(--accent)', color: '#fff', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'opacity var(--transition)',
  },
  btnSuccess: {
    padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
    background: 'var(--text-primary)', color: '#fff', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, width: '100%',
    transition: 'opacity var(--transition)',
  },
  btnContact: (disabled) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px', fontWeight: 500, border: '1px solid var(--border)',
    background: 'var(--surface)', color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    opacity: disabled ? 0.6 : 1, transition: 'all var(--transition)', whiteSpace: 'nowrap',
  }),
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color var(--transition)',
  },
};

const Spinner = ({ text }) => {
  const { t } = useTranslation();
  const loadingText = text || t('landlord.loading');
  return (
    <div className="l-spinner">
      <div className="l-spinner__circle" />
      <div className="l-spinner__text">{loadingText}</div>
    </div>
  );
};

function GuestPage({
  currentUser,
  onRentSuccess,
  pendingHopDong,
  onCancelPending,
  isCancelingPending,
  onOpenChatPending,
  unreadSenderIds = [],
  setUnreadSenderIds,
  onSetChatTarget
}) {
  const { t } = useTranslation();
  if (currentUser?.role !== ROLES.USER) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>{t('guest.access_denied')}</div>;
  }

  const [activeTab, setActiveTab] = useState('TIM_TRO');
  const [searchMode, setSearchMode] = useState('ROOM'); // 'ROOM' (Tìm phòng trực tiếp) hoặc 'HOST' (Tìm theo chủ nhà)

  // States cho tìm kiếm chủ nhà (Host browsing)
  const [chuTros, setChuTros] = useState([]);
  const [chuTroDangChon, setChuTroDangChon] = useState(null);
  const [phongTros, setPhongTros] = useState([]);
  const [hoSoChuTro, setHoSoChuTro] = useState(null);
  const [tuKhoa, setTuKhoa] = useState('');

  // States cho bộ lọc tìm kiếm phòng trực tiếp (Room search)
  const [searchTenPhong, setSearchTenPhong] = useState('');
  const [searchDiaChi, setSearchDiaChi] = useState('');
  const [searchGiaMin, setSearchGiaMin] = useState('');
  const [searchGiaMax, setSearchGiaMax] = useState('');
  const [searchTrangThai, setSearchTrangThai] = useState('TRONG');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [chatTarget, setChatTarget] = useState(null);
  const [phongDangCho, setPhongDangCho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewContract, setPreviewContract] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);

  const { admin: adminContact, loading: loadingAdmin, error: adminError } = useAdminContact();
  const latestClickId = useRef(null);

  // Fetch danh sách chủ trọ cho tab 'Tìm theo chủ nhà'
  useEffect(() => {
    const fetchDanhSachChuTro = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tai-khoan/chu-tro');
        setChuTros(res.data || []);
      } catch (err) {
        setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('guest.error_system'), onConfirm: null });
      } finally {
        setLoading(false);
      }
    };
    fetchDanhSachChuTro();
  }, [t]);

  // Gọi API tìm kiếm phòng trực tiếp
  const handleSearchRooms = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const params = {
        tenPhong: searchTenPhong.trim() || '',
        diaChi: searchDiaChi.trim() || '',
        giaToiThieu: searchGiaMin.trim() ? Number(searchGiaMin) : 0,
        giaToiDa: searchGiaMax.trim() ? Number(searchGiaMax) : 999999999,
        trangThai: (searchTrangThai && searchTrangThai !== 'ALL') ? searchTrangThai : ''
      };

      const res = await api.get('/phong-tro/search', { params });
      setSearchResults(res.data || []);
    } catch (err) {
      setConfirmState({
        isOpen: true,
        type: 'danger',
        title: t('common.error'),
        message: err.response?.data?.message || err.message,
        onConfirm: null
      });
    } finally {
      setSearching(false);
    }
  };

  // Tự động tìm kiếm phòng khi chuyển sang tab tìm phòng hoặc khi đổi bộ lọc nhanh
  useEffect(() => {
    if (searchMode === 'ROOM') {
      handleSearchRooms();
    }
  }, [searchMode]);

  // Đặt lại các bộ lọc tìm phòng về mặc định
  const handleResetFilters = () => {
    setSearchTenPhong('');
    setSearchDiaChi('');
    setSearchGiaMin('');
    setSearchGiaMax('');
    setSearchTrangThai('TRONG');
    setTimeout(() => {
      api.get('/phong-tro/search', { params: { trangThai: 'TRONG' } })
        .then(res => setSearchResults(res.data || []))
        .catch(console.error);
    }, 0);
  };

  const handleChonChuTro = async (ct) => {
    latestClickId.current = ct.id;
    setChuTroDangChon(ct);
    setHoSoChuTro(null);
    setLoading(true);

    try {
      const [phongRes, chiTietRes] = await Promise.all([
        api.get(`/phong-tro/chu-tro/${ct.id}`),
        api.get(`/tai-khoan/chu-tro/${ct.id}/chi-tiet`)
      ]);
      if (latestClickId.current !== ct.id) return;
      setPhongTros(phongRes.data || []);
      setHoSoChuTro(chiTietRes.data || null);
    } catch (err) {
      if (latestClickId.current === ct.id) {
        setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('guest.error_room_info'), onConfirm: null });
      }
    } finally {
      if (latestClickId.current === ct.id) setLoading(false);
    }
  };

  const openContractPreview = async (phong) => {
    if (pendingHopDong) {
      const confirmCancel = window.confirm(
        t('guest.alert_cancel_existing_request', {
          oldRoom: pendingHopDong.phongTro?.tenPhong || '',
          newRoom: phong.tenPhong || ''
        })
      );
      if (confirmCancel) {
        setIsSubmitting(true);
        try {
          await onCancelPending(true); // bypass default confirmation
        } catch (err) {
          console.error("Lỗi tự động hủy:", err);
          setIsSubmitting(false);
          return;
        } finally {
          setIsSubmitting(false);
        }
      } else {
        return;
      }
    }

    try {
      let hoSo;
      try {
        const hoSoRes = await api.get('/khach-hang/ho-so/me');
        hoSo = hoSoRes.data;
      } catch (err) {
        if (err.response?.status === 404) {
          alert(t('guest.profile_missing'));
          setActiveTab('HO_SO');
          return;
        }
        throw err;
      }
      if (!validateHoSo(hoSo)) {
        setConfirmState({
          isOpen: true, type: 'warning', title: t('common.confirm'),
          message: t('guest.profile_incomplete'),
          onConfirm: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            setActiveTab('HO_SO');
          }
        });
        return;
      }

      // Nếu đang tìm trực tiếp ngoài màn hình search, ta cần lấy thông tin chi tiết của chủ trọ phòng đó
      let chuTroInfoObj = hoSoChuTro || chuTroDangChon;
      if (!chuTroInfoObj || chuTroInfoObj.id !== phong.chuTroId) {
        setLoading(true);
        try {
          const detailRes = await api.get(`/tai-khoan/chu-tro/${phong.chuTroId}/chi-tiet`);
          chuTroInfoObj = detailRes.data;
          setHoSoChuTro(chuTroInfoObj);
        } catch (err) {
          console.error("Không lấy được thông tin chi tiết chủ trọ", err);
          chuTroInfoObj = { id: phong.chuTroId, username: t('guest.host_name') };
          setHoSoChuTro(chuTroInfoObj);
        } finally {
          setLoading(false);
        }
      }

      setPreviewContract({ ...phong, hoSoKhachHang: hoSo });
    } catch (err) {
      setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('guest.error') + (err.response?.data?.message || err.message), onConfirm: null });
    }
  };

  const handleDangKyThue = async (contractData) => {
    const phong = previewContract;
    if (!phong) return;
    setIsSubmitting(true);
    try {
      await api.post('/hop-dong', {
        phongTroId: phong.id,
        ngayBatDau: contractData?.ngayBatDau || new Date().toISOString().split('T')[0],
        ngayKetThuc: contractData?.ngayKetThuc || null,
        tienCoc: phong.tienCoc || 0,
      });

      // Đảm bảo có thông tin chủ trọ để chat và gửi thông báo
      let activeHost = chuTroDangChon;
      if (!activeHost) {
        try {
          const ctListRes = await api.get('/tai-khoan/chu-tro');
          const found = (ctListRes.data || []).find(ct => ct.id === phong.chuTroId);
          if (found) {
            activeHost = found;
            setChuTroDangChon(found);
          }
        } catch (e) {
          console.error(e);
        }
      }

      setPhongDangCho({ ...phong, chuTroId: phong.chuTroId });
      setConfirmState({
        isOpen: true, type: 'success', title: t('common.success'),
        message: t('guest.rent_success'),
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          onRentSuccess?.();
        }
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || err.message || "";
      if (typeof errMsg === 'string' && errMsg.includes("Bạn đã gửi yêu cầu thuê phòng này rồi")) {
        try {
          const canceledIds = JSON.parse(localStorage.getItem('canceled_pending_contracts') || '[]');
          const res = await api.get(`/hop-dong/khach/${currentUser.id}`);
          const matchingContracts = (res.data || []).filter(h => h.phongTro?.id === phong.id && h.trangThai === 'CHO_DUYET');
          
          if (matchingContracts.length > 0) {
            const matchingIds = matchingContracts.map(h => h.id);
            const newCanceledIds = canceledIds.filter(id => !matchingIds.includes(id));
            localStorage.setItem('canceled_pending_contracts', JSON.stringify(newCanceledIds));

            // Gửi tin nhắn hệ thống qua WebSocket/Chat để mở lại yêu cầu
            const primaryContract = matchingContracts[0];
            const landlordId = primaryContract.phongTro?.chuTroId ?? primaryContract.phongTro?.chuTro?.id;
            const roomName = primaryContract.phongTro?.tenPhong || '';
            const id = primaryContract.id;

            if (landlordId) {
              const customEvent = new CustomEvent('send-system-message', {
                detail: {
                  nguoiGuiId: currentUser.id,
                  nguoiNhanId: landlordId,
                  noiDung: `[SYSTEM_CONTRACT_REOPENED] Khách thuê ${currentUser.username || 'ẩn danh'} đã mở lại yêu cầu thuê phòng ${roomName} (ID: ${id})`,
                  thoiGian: new Date().toISOString()
                }
              });
              window.dispatchEvent(customEvent);
            }
          }
        } catch (e) {
          console.error("Lỗi khi đồng bộ lại local storage:", e);
        }

        setPhongDangCho({ ...phong, chuTroId: phong.chuTroId });
        setConfirmState({
          isOpen: true, type: 'success', title: t('common.success'),
          message: t('guest.rent_success'),
          onConfirm: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            onRentSuccess?.();
          }
        });
      } else {
        setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('guest.error') + errMsg, onConfirm: null });
      }
    } finally {
      setIsSubmitting(false);
      setPreviewContract(null);
    }
  };

  const displayName = hoSoChuTro?.hoTen || chuTroDangChon?.username || "?";
  const avatarChar = displayName.charAt(0).toUpperCase();

  const handleQuickPriceFilter = (min, max) => {
    setSearchGiaMin(min ? String(min) : '');
    setSearchGiaMax(max ? String(max) : '');
    setSearching(true);
    const params = {
      tenPhong: searchTenPhong.trim() || '',
      diaChi: searchDiaChi.trim() || '',
      giaToiThieu: min || 0,
      giaToiDa: max || 999999999,
      trangThai: (searchTrangThai && searchTrangThai !== 'ALL') ? searchTrangThai : ''
    };
    api.get('/phong-tro/search', { params })
      .then(res => setSearchResults(res.data || []))
      .catch(console.error)
      .finally(() => setSearching(false));
  };

  const handleQuickAreaFilter = (min, max) => {
    setSearching(true);
    const params = {
      tenPhong: searchTenPhong.trim() || '',
      diaChi: searchDiaChi.trim() || '',
      giaToiThieu: searchGiaMin.trim() ? Number(searchGiaMin) : 0,
      giaToiDa: searchGiaMax.trim() ? Number(searchGiaMax) : 999999999,
      trangThai: (searchTrangThai && searchTrangThai !== 'ALL') ? searchTrangThai : ''
    };
    api.get('/phong-tro/search', { params })
      .then(res => {
        let rooms = res.data || [];
        if (min !== undefined || max !== undefined) {
          rooms = rooms.filter(phong => {
            const dt = phong.dienTich || 0;
            if (min !== undefined && dt < min) return false;
            if (max !== undefined && dt > max) return false;
            return true;
          });
        }
        setSearchResults(rooms);
      })
      .catch(console.error)
      .finally(() => setSearching(false));
  };

  const renderRoomCardHorizontal = (phong, i) => (
    <div
      key={phong.id}
      className={`room-card-horizontal room-card-horizontal--${phong.trangThai === ROOM_STATUS.EMPTY
          ? 'empty'
          : phong.trangThai === ROOM_STATUS.RENTED
            ? 'rented'
            : 'maintenance'
        }`}
      style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}
    >
      {phong.hinhAnh && (
        <div className="room-card-horizontal__img-wrap">
          <ImageSlider hinhAnh={phong.hinhAnh} alt={phong.tenPhong} height="100%" />
        </div>
      )}
      <div className="room-card-horizontal__content">
        <div className="room-card-horizontal__header">
          <div className="room-card-horizontal__title" onClick={() => setSelectedRoomDetail(phong)}>
            {phong.tenPhong}
          </div>
          <span className={`guest-tag guest-tag--${phong.trangThai === ROOM_STATUS.EMPTY ? 'empty' : 'rented'}`}>
            {phong.trangThai === ROOM_STATUS.EMPTY
              ? t('guest.status_empty')
              : phong.trangThai === ROOM_STATUS.RENTED
                ? t('guest.status_rented')
                : t('guest.status_maintenance')
            }
          </span>
        </div>

        <div className="room-card-horizontal__meta-row">
          <span className="room-card-horizontal__price">
            {phong.giaPhong?.toLocaleString()} {t('guest.currency_month')}
          </span>
          <span className="room-card-horizontal__dot">•</span>
          <span className="room-card-horizontal__area">
            {phong.dienTich || 0} m²
          </span>
        </div>

        {phong.diaChi && (
          <div className="room-card-horizontal__address">
            📍 {phong.diaChi}
          </div>
        )}

        {phong.moTa && (
          <div className="room-card-horizontal__desc">
            {phong.moTa}
          </div>
        )}

        <div className="room-card-horizontal__details">
          {phong.tienCoc != null && (
            <div className="room-card-horizontal__detail-item">
              <span>{t('guest.deposit')}:</span>
              <span className="room-card-horizontal__detail-value">{phong.tienCoc?.toLocaleString()} {t('landlord.currency')}</span>
            </div>
          )}
          {(phong.giaDien != null || phong.giaNuoc != null) && (
            <div className="room-card-horizontal__detail-item">
              <span>{t('guest.utility')}:</span>
              <span className="room-card-horizontal__detail-value">
                {phong.giaDien ? `${phong.giaDien.toLocaleString()} Đ` : '—'} / {phong.giaNuoc ? `${phong.giaNuoc.toLocaleString()} Đ` : '—'}
              </span>
            </div>
          )}
        </div>

        <div className="room-card-horizontal__footer">
          <div className="room-card__host-info" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="room-card__host-avatar">🏠</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div className="room-card__host-name" style={{ fontSize: '12px', fontWeight: 600 }}>
                {(() => {
                  const host = chuTros.find(ct => ct.id === phong.chuTroId);
                  return host
                    ? (host.hoTen ? `${host.hoTen} (@${host.username})` : `@${host.username}`)
                    : `${t('guest.host_name')} ID ${phong.chuTroId}`;
                })()}
              </div>
              <span 
                className="room-card__host-chat-link"
                style={{
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const host = chuTros.find(ct => ct.id === phong.chuTroId);
                  const hostName = host ? (host.hoTen || host.username) : `${t('guest.host_name')} ID ${phong.chuTroId}`;
                  setChatTarget({ id: phong.chuTroId, username: hostName });
                }}
              >
                {t('guest.btn_chat') || 'Nhắn tin'}
              </span>
            </div>
          </div>
          {phong.trangThai === ROOM_STATUS.EMPTY && (
            <button
              className="btn btn--primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => openContractPreview(phong)}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('guest.btn_processing') : t('guest.btn_rent')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (phongDangCho) {
    return (
      <div style={{ fontFamily: 'var(--font)' }}>
        <div style={{
          maxWidth: '440px', margin: '40px auto', background: 'var(--surface)',
          borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
          padding: '40px 32px', textAlign: 'center', animation: 'fadeInUp 0.4s ease',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--warning-light)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t('guest.pending_request')}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('guest.room')} <strong>{phongDangCho.tenPhong}</strong></div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>{t('guest.host_reply_soon')}</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button style={S.btnPrimary} onClick={() => setChatTarget({ id: phongDangCho.chuTroId, username: displayName })}>{t('guest.btn_chat')}</button>
            <button style={S.btn} onClick={() => setPhongDangCho(null)}>{t('guest.btn_back')}</button>
          </div>
        </div>
        {chatTarget && <ChatBox currentUser={currentUser} targetUser={chatTarget} isOpen={true} onClose={() => setChatTarget(null)} />}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      {/* Banner cho yêu cầu chờ duyệt */}
      {pendingHopDong && (
        <div style={{
          background: 'var(--warning-light)',
          border: '1px solid #FDE047',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          animation: 'fadeInDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div
              style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{
                __html: t('guest.pending_banner_text', { room: pendingHopDong.phongTro?.tenPhong || t('guest.pending_room_fallback') })
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onOpenChatPending}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, transition: 'opacity 0.2s'
              }}
            >
              💬 {t('guest.btn_chat_host')}
            </button>
            <button
              onClick={() => onCancelPending(false)}
              disabled={isCancelingPending}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #EF4444',
                background: 'transparent', color: '#EF4444', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              {isCancelingPending ? t('guest.canceling') : `🚫 ${t('guest.btn_cancel_request')}`}
            </button>
          </div>
        </div>
      )}
      {/* Header Navigation tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
        <div style={S.navBar}>
          <button className={`nav-btn ${activeTab === 'TIM_TRO' ? 'nav-btn--active' : ''}`} onClick={() => setActiveTab('TIM_TRO')}>{t('guest.tab_market')}</button>
          <button className={`nav-btn ${activeTab === 'HO_SO' ? 'nav-btn--active' : ''}`} onClick={() => setActiveTab('HO_SO')}>{t('guest.tab_profile')}</button>
          <button className={`nav-btn ${activeTab === 'LIEN_HE' ? 'nav-btn--active' : ''}`} onClick={() => setActiveTab('LIEN_HE')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {t('landlord.tab_contact') || 'Liên hệ'}
            {unreadSenderIds.length > 0 && (
              <span className="tenant-nav__badge" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'var(--danger)', color: '#fff', fontSize: '10px',
                fontWeight: 700
              }}>{unreadSenderIds.length}</span>
            )}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KhieuNaiForm />
          <button
            style={S.btnContact(loadingAdmin || !!adminError)}
            onClick={() => adminContact && (onSetChatTarget ? onSetChatTarget(adminContact) : setChatTarget(adminContact))}
            disabled={loadingAdmin || !!adminError}
          >
            🎧 {loadingAdmin ? t('guest.btn_connecting') : adminError ? t('guest.btn_offline') : t('guest.btn_chat_admin')}
          </button>
        </div>
      </div>

      {activeTab === 'HO_SO' && <HoSoForm user={currentUser} />}

      {activeTab === 'LIEN_HE' && (
        <div className="premium-card" style={{ animation: 'fadeIn 0.3s ease' }}>
          <TenantContactTab
            currentUser={currentUser}
            hopDongCuaToi={pendingHopDong}
            adminContact={adminContact}
            onSetChatTarget={onSetChatTarget || setChatTarget}
            unreadSenderIds={unreadSenderIds}
          />
        </div>
      )}

      {activeTab === 'TIM_TRO' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Sub-selector for Search Mode (ROOM or HOST) */}
          {!chuTroDangChon && (
            <div className="search-mode-selector">
              <button
                className={`search-mode-btn ${searchMode === 'ROOM' ? 'search-mode-btn--active' : ''}`}
                onClick={() => setSearchMode('ROOM')}
              >
                🔍 {t('guest.search_room_directly')}
              </button>
              <button
                className={`search-mode-btn ${searchMode === 'HOST' ? 'search-mode-btn--active' : ''}`}
                onClick={() => setSearchMode('HOST')}
              >
                🏢 {t('guest.search_by_host')}
              </button>
            </div>
          )}

          {/* MODE 1: SEARCH ROOM DIRECTLY */}
          {searchMode === 'ROOM' && !chuTroDangChon && (
            <div className="guest-layout-wrapper">
              {/* Cột trái: Form tìm kiếm & Danh sách phòng dạng thẻ ngang */}
              <div className="guest-main-column">
                <form onSubmit={handleSearchRooms} className="search-engine">
                  <div className="search-engine__title">
                    ⚡ {t('guest.search_room_title')}
                  </div>

                  <div className="search-engine__grid">
                    {/* Field 1: Room name keyword */}
                    <div className="search-engine__field">
                      <label className="search-engine__label">{t('guest.room_name_keyword')}</label>
                      <input
                        type="text"
                        placeholder={t('guest.room_name_ph')}
                        value={searchTenPhong}
                        onChange={e => setSearchTenPhong(e.target.value)}
                        className="search-engine__input"
                      />
                    </div>

                    {/* Field 2: Address */}
                    <div className="search-engine__field">
                      <label className="search-engine__label">{t('guest.address_keyword')}</label>
                      <input
                        type="text"
                        placeholder={t('guest.address_ph')}
                        value={searchDiaChi}
                        onChange={e => setSearchDiaChi(e.target.value)}
                        className="search-engine__input"
                      />
                    </div>

                    {/* Field 3: Price range */}
                    <div className="search-engine__field">
                      <label className="search-engine__label">{t('guest.price_range')} (VNĐ)</label>
                      <div className="search-engine__range">
                        <input
                          type="number"
                          min="0"
                          placeholder={t('guest.price_min')}
                          value={searchGiaMin}
                          onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setSearchGiaMin(v); }}
                          className="search-engine__input"
                        />
                        <span className="search-engine__separator">-</span>
                        <input
                          type="number"
                          min="0"
                          placeholder={t('guest.price_max')}
                          value={searchGiaMax}
                          onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setSearchGiaMax(v); }}
                          className="search-engine__input"
                        />
                      </div>
                    </div>

                    {/* Field 4: Status */}
                    <div className="search-engine__field">
                      <label className="search-engine__label">{t('guest.room_status')}</label>
                      <select
                        value={searchTrangThai}
                        onChange={e => setSearchTrangThai(e.target.value)}
                        className="search-engine__select"
                      >
                        <option value="ALL">{t('guest.all_status')}</option>
                        <option value="TRONG">{t('guest.status_empty')}</option>
                        <option value="DA_THUE">{t('guest.status_rented')}</option>
                        <option value="BAO_TRI">{t('guest.status_maintenance')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="search-engine__actions">
                    <button type="button" onClick={handleResetFilters} className="btn-search-secondary">
                      {t('guest.btn_reset')}
                    </button>
                    <button type="submit" className="btn-search-primary" disabled={searching}>
                      {searching ? t('guest.btn_processing') : t('guest.btn_search')}
                    </button>
                  </div>
                </form>

                {searching ? (
                  <Spinner text={t('common.loading')} />
                ) : searchResults.length === 0 ? (
                  <div className="card">
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
                      {t('guest.no_rooms_found')}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {searchResults.map((phong, i) => renderRoomCardHorizontal(phong, i))}
                  </div>
                )}
              </div>

              {/* Cột phải: Lọc nhanh và Tin tức mới */}
              <div className="guest-sidebar-column">
                {/* Lọc nhanh theo giá */}
                <div className="sidebar-box">
                  <h3 className="sidebar-box__title">⚡ {t('guest.quick_filter_price') || 'Lọc nhanh theo giá'}</h3>
                  <div className="sidebar-box__grid">
                    <span className="sidebar-link" onClick={() => handleQuickPriceFilter(0, 1500000)}>{t('guest.price_under_1_5m') || 'Dưới 1.5 triệu'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickPriceFilter(1500000, 3000000)}>{t('guest.price_1_5m_3m') || '1.5 - 3 triệu'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickPriceFilter(3000000, 5000000)}>{t('guest.price_3m_5m') || '3 - 5 triệu'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickPriceFilter(5000000, 10000000)}>{t('guest.price_5m_10m') || '5 - 10 triệu'}</span>
                  </div>
                </div>

                {/* Lọc nhanh theo diện tích */}
                <div className="sidebar-box">
                  <h3 className="sidebar-box__title">📐 {t('guest.quick_filter_area') || 'Lọc nhanh theo diện tích'}</h3>
                  <div className="sidebar-box__grid">
                    <span className="sidebar-link" onClick={() => handleQuickAreaFilter(0, 20)}>{t('guest.area_under_20') || 'Dưới 20 m²'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickAreaFilter(20, 30)}>{t('guest.area_20_30') || '20 - 30 m²'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickAreaFilter(30, 50)}>{t('guest.area_30_50') || '30 - 50 m²'}</span>
                    <span className="sidebar-link" onClick={() => handleQuickAreaFilter(50, 999999)}>{t('guest.area_over_50') || 'Trên 50 m²'}</span>
                  </div>
                </div>

                {/* Tin mới nhất */}
                <div className="sidebar-box">
                  <h3 className="sidebar-box__title">📌 {t('guest.recent_rooms') || 'Tin phòng mới đăng'}</h3>
                  <div className="sidebar-recent-list">
                    {searchResults.slice(0, 4).map(phong => (
                      <div key={phong.id} className="sidebar-recent-item" onClick={() => setSelectedRoomDetail(phong)}>
                        <div className="sidebar-recent-item__img-wrap">
                          {phong.hinhAnh ? (
                            <ImageSlider hinhAnh={phong.hinhAnh} alt={phong.tenPhong} height="100%" />
                          ) : (
                            <div className="sidebar-recent-item__avatar">🏠</div>
                          )}
                        </div>
                        <div className="sidebar-recent-item__info">
                          <h4 className="sidebar-recent-item__title">{phong.tenPhong}</h4>
                          <p className="sidebar-recent-item__price">{phong.giaPhong?.toLocaleString()} Đ</p>
                        </div>
                      </div>
                    ))}
                    {searchResults.length === 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('guest.no_recent_rooms') || 'Không có tin mới'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: BROWSE BY HOST */}
          {searchMode === 'HOST' && !chuTroDangChon && (
            <div>
              {loading && <Spinner text={t('guest.loading_host_list')} />}

              {!loading && (
                <div className="card">
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>{t('guest.search_host')}</div>
                  <input type="text" placeholder={t('guest.search_placeholder')} value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} className="form-input" style={{ marginBottom: '20px' }} />
                  {chuTros.filter(ct =>
                    ct.username.toLowerCase().includes(tuKhoa.toLowerCase()) ||
                    (ct.hoTen && ct.hoTen.toLowerCase().includes(tuKhoa.toLowerCase()))
                  ).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
                      {t('guest.no_host_found')}
                    </div>
                  ) : (
                    <div className="grid-cards">
                      {chuTros.filter(ct =>
                        ct.username.toLowerCase().includes(tuKhoa.toLowerCase()) ||
                        (ct.hoTen && ct.hoTen.toLowerCase().includes(tuKhoa.toLowerCase()))
                      ).map((ct, i) => (
                        <div key={ct.id} className="host-card" onClick={() => handleChonChuTro(ct)} style={{
                          animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                        }}>
                          <div className="host-card__avatar">
                            {(ct.hoTen || ct.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="host-card__name">
                            {ct.hoTen ? `${ct.hoTen} (${ct.username})` : `${t('guest.host_name')} ${ct.username}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: DETAILED ROOMS OF SELECTED HOST */}
          {chuTroDangChon && (
            <div className="guest-layout-wrapper">
              {/* Cột trái: Thông tin chủ nhà chi tiết + Danh sách phòng dạng thẻ ngang */}
              <div className="guest-main-column">
                <div className="premium-card" style={{ background: 'var(--accent-light)', borderColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between', flexWrap: 'wrap', gap: '15px', width: '100%' }}>
                    <div className="host-profile__info" style={{ flex: 1 }}>
                      <div className="host-profile__avatar">{avatarChar}</div>
                      <div>
                        <div className="host-profile__name">{displayName}</div>
                        <div className="host-profile__contacts">
                          <span>📞 {hoSoChuTro?.soDienThoai || t('guest.not_updated')}</span>
                          <span>✉️ {hoSoChuTro?.email || t('guest.not_updated')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn btn--outline" onClick={() => setChuTroDangChon(null)}>{t('guest.btn_back')}</button>
                      <button className="btn btn--primary" onClick={() => setChatTarget({ id: chuTroDangChon.id, username: displayName })}>
                        {t('guest.btn_chat')}
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? <Spinner text={t('guest.loading_host_data')} /> : phongTros.length === 0 ? (
                  <div className="card" style={{ marginTop: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      {t('guest.no_rooms_found')}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {phongTros.map((phong, i) => renderRoomCardHorizontal(phong, i))}
                  </div>
                )}
              </div>

              {/* Cột phải: Các chủ trọ khác */}
              <div className="guest-sidebar-column">
                <div className="sidebar-box">
                  <h3 className="sidebar-box__title">🏢 {t('guest.other_hosts') || 'Chủ trọ khác'}</h3>
                  <div className="sidebar-recent-list">
                    {chuTros.filter(ct => ct.id !== chuTroDangChon.id).slice(0, 5).map(ct => (
                      <div key={ct.id} className="sidebar-recent-item" onClick={() => handleChonChuTro(ct)}>
                        <div className="sidebar-recent-item__avatar">
                          {(ct.hoTen || ct.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-recent-item__info">
                          <h4 className="sidebar-recent-item__title">{ct.hoTen || ct.username}</h4>
                          <p className="sidebar-recent-item__price" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>@{ct.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {chatTarget && <ChatBox currentUser={currentUser} targetUser={chatTarget} isOpen={true} onClose={() => setChatTarget(null)} />}

      <ContractModal
        isOpen={!!previewContract}
        onClose={() => setPreviewContract(null)}
        phong={previewContract}
        chuTroInfo={hoSoChuTro || chuTroDangChon}
        khachThueInfo={previewContract?.hoSoKhachHang}
        onConfirm={handleDangKyThue}
        confirmText={t('guest.confirm_rent_contract')}
        isProcessing={isSubmitting}
        role="TENANT"
      />

      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      <RoomDetailModalForGuest
        isOpen={!!selectedRoomDetail}
        onClose={() => setSelectedRoomDetail(null)}
        phong={selectedRoomDetail}
        onRent={(phong) => {
          setSelectedRoomDetail(null);
          openContractPreview(phong);
        }}
        onChat={(target) => {
          setSelectedRoomDetail(null);
          setChatTarget(target);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default GuestPage;