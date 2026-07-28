import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import ChatBox from '../../components/ChatBox';
import QuanLyNguoiDung from '../../components/QuanLyNguoiDung';
import DashboardTab from '../Landlord/components/DashboardTab';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../components/Footer';
import AdminContactTab from './AdminContactTab';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './AdminPage.css';

const ROLES = { ADMIN: 'ROLE_ADMIN' };
const ROOM_STATUS = { EMPTY: 'TRONG', RENTED: 'DA_THUE', MAINTENANCE: 'BAO_TRI' };

const S = {
  navBar: {
    display: 'flex', gap: '2px', background: 'var(--border-light)',
    padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    marginBottom: '24px', width: 'fit-content',
  },
  navItem: (active) => ({
    padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, transition: 'all var(--transition)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
  }),
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', padding: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  tag: (color) => {
    const map = {
      green: { bg: 'var(--success-light)', text: 'var(--success)' },
      red: { bg: 'var(--danger-light)', text: 'var(--danger)' },
      amber: { bg: 'var(--warning-light)', text: 'var(--warning)' },
      blue: { bg: 'var(--accent-light)', text: 'var(--accent)' },
    };
    return {
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      background: map[color]?.bg || 'var(--border-light)', color: map[color]?.text || 'var(--text-secondary)',
    };
  },
  btn: {
    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, transition: 'all var(--transition)',
  },
  btnPrimary: {
    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
    background: 'var(--accent)', color: '#fff', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, transition: 'opacity var(--transition)',
  },
  btnSuccess: {
    padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--text-primary)', color: '#fff', cursor: 'pointer',
    fontSize: '12px', fontWeight: 500, transition: 'opacity var(--transition)',
  },
  input: {
    padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text-primary)', fontSize: '14px', width: '100%',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color var(--transition)',
  },
  avatar: (i) => {
    const colors = [
      ['var(--accent-light)', 'var(--accent)'],
      ['var(--success-light)', 'var(--success)'],
      ['var(--danger-light)', 'var(--danger)'],
      ['#F3E8FF', '#7C3AED'],
      ['var(--warning-light)', 'var(--warning)'],
    ];
    const [bg, text] = colors[i % colors.length];
    return {
      width: '38px', height: '38px', borderRadius: '50%',
      background: bg, color: text, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 600,
    };
  },
};

const Spinner = ({ text }) => {
  const { t } = useTranslation();
  const loadingMsg = text || t('common.loading');
  return (
    <div style={{ textAlign: 'center', padding: '40px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{
        width: '24px', height: '24px', border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
      }} />
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{loadingMsg}</div>
    </div>
  );
};

export default function AdminPage({ currentUser, unreadSenderIds = [], setUnreadSenderIds, onSetChatTarget, onLogout }) {
  const { t, i18n } = useTranslation();
  const userRole = (currentUser?.role || '').startsWith('ROLE_') ? currentUser.role : `ROLE_${currentUser.role}`;
  if (userRole !== ROLES.ADMIN) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>{t('admin.access_denied')}</div>;
  }

  const [adminTab, setAdminTab] = useState('USERS');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [thongKeData, setThongKeData] = useState(null);
  const [chuTros, setChuTros] = useState([]);
  const [tuKhoa, setTuKhoa] = useState('');
  const [chuTroDangChon, setChuTroDangChon] = useState(null);
  const [phongTros, setPhongTros] = useState([]);
  const [phongDangXem, setPhongDangXem] = useState(null);
  const [hopDongs, setHopDongs] = useState([]);
  const [hoaDons, setHoaDons] = useState([]);
  const [khieuNais, setKhieuNais] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const pendingCount = khieuNais.filter(kn => kn.trangThai === 'CHO_XU_LY').length;


  useEffect(() => {
    if (khieuNais.length > 0 && !selectedComplaint) {
      setSelectedComplaint(khieuNais[0]);
    }
  }, [khieuNais, selectedComplaint]);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    setLoadingInit(true);
    try {
      // Gọi hai API chính phục vụ các tab quản trị
      const [chuTroRes, khieuNaiRes] = await Promise.all([
        api.get('/tai-khoan/chu-tro'),
        api.get('/khieu-nai')
      ]);
      const listChuTro = chuTroRes.data || [];
      setChuTros(listChuTro);
      setKhieuNais(khieuNaiRes.data || []);

      // Tính toán dữ liệu thống kê hệ thống ngay tại Client-side mà không cần thay đổi Java backend
      let allRooms = [];
      let allInvoices = [];

      try {
        const detailPromises = listChuTro.map(async (ct) => {
          try {
            const [phongRes, hoaDonRes] = await Promise.all([
              api.get(`/phong-tro/chu-tro/${ct.id}`),
              api.get(`/hoa-don/chu-tro/${ct.id}`)
            ]);
            return {
              rooms: phongRes.data || [],
              invoices: hoaDonRes.data || []
            };
          } catch (e) {
            console.warn(`Không tải được chi tiết hóa đơn/phòng cho chủ trọ ${ct.id}, thử tải lại phòng:`, e);
            try {
              const phongRes = await api.get(`/phong-tro/chu-tro/${ct.id}`);
              return { rooms: phongRes.data || [], invoices: [] };
            } catch (innerE) {
              return { rooms: [], invoices: [] };
            }
          }
        });

        const results = await Promise.all(detailPromises);
        results.forEach(res => {
          allRooms = [...allRooms, ...res.rooms];
          allInvoices = [...allInvoices, ...res.invoices];
        });
      } catch (err) {
        console.error("Lỗi khi gom dữ liệu thống kê:", err);
      }

      // Xử lý tính toán thông số thống kê
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const tongSoPhong = allRooms.length;
      const soPhongDaThue = allRooms.filter(r => r.trangThai === 'DA_THUE').length;
      const soPhongTrong = allRooms.filter(r => r.trangThai === 'TRONG').length;

      const invoicesChuaThanhToan = allInvoices.filter(inv => inv.trangThai === 'CHUA_THANH_TOAN');
      const soHoaDonChuaThanhToan = invoicesChuaThanhToan.length;
      const tongTienChuaThanhToan = invoicesChuaThanhToan.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);

      const tongDoanhThuThangNay = allInvoices
        .filter(inv => inv.trangThai === 'DA_THANH_TOAN' && inv.thang === currentMonth && inv.nam === currentYear)
        .reduce((sum, inv) => sum + (inv.tongTien || 0), 0);

      const tongDoanhThuThangTruoc = allInvoices
        .filter(inv => inv.trangThai === 'DA_THANH_TOAN' && inv.thang === lastMonth && inv.nam === lastMonthYear)
        .reduce((sum, inv) => sum + (inv.tongTien || 0), 0);

      let tyLeTangTruong = 0;
      if (tongDoanhThuThangTruoc === 0) {
        tyLeTangTruong = tongDoanhThuThangNay > 0 ? 100 : 0;
      } else {
        tyLeTangTruong = Math.round(((tongDoanhThuThangNay - tongDoanhThuThangTruoc) / tongDoanhThuThangTruoc) * 100 * 100) / 100;
      }

      // Tính toán dữ liệu biểu đồ doanh thu 6 tháng qua
      const bieuDoDoanhThu = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();

        const dt = allInvoices
          .filter(inv => inv.trangThai === 'DA_THANH_TOAN' && inv.thang === m && inv.nam === y)
          .reduce((sum, inv) => sum + (inv.tongTien || 0), 0);

        bieuDoDoanhThu.push({ thang: m, nam: y, doanhThu: dt });
      }

      setThongKeData({
        tongSoPhong,
        soPhongDaThue,
        soPhongTrong,
        soHoaDonChuaThanhToan,
        tongTienChuaThanhToan,
        tongDoanhThuThangNay,
        tongDoanhThuThangTruoc,
        tyLeTangTruong,
        bieuDoDoanhThu
      });

    } catch (err) {
      setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('admin.error_init'), onConfirm: null });
    } finally { setLoadingInit(false); }
  };

  const handleXuLyKhieuNai = async (id) => {
    setConfirmState({
      isOpen: true,
      type: 'success',
      title: t('common.confirm'),
      message: t('admin.confirm_resolve'),
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          await api.put(`/khieu-nai/${id}/xu-ly`);
          setKhieuNais(prev => prev.map(kn => kn.id === id ? { ...kn, trangThai: 'DA_GIAI_QUYET' } : kn));
        } catch (err) {
          setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('admin.error_general') + (err.response?.data?.message || ""), onConfirm: null });
        }
      }
    });
  };

  const handleChonChuTro = async (ct) => {
    setChuTroDangChon(ct);
    setLoadingRooms(true);
    try {
      const [phongRes, hopDongRes, hoaDonRes] = await Promise.all([
        api.get(`/phong-tro/chu-tro/${ct.id}`),
        api.get(`/hop-dong/chu-tro/${ct.id}`),
        api.get(`/hoa-don/chu-tro/${ct.id}`)
      ]);
      setPhongTros(phongRes.data || []);
      setHopDongs(hopDongRes.data || []);
      setHoaDons(hoaDonRes.data || []);
    } catch (err) {
      console.warn("Backend might not support hop-dong or hoa-don for landlord yet, falling back to rooms:", err);
      try {
        const res = await api.get(`/phong-tro/chu-tro/${ct.id}`);
        setPhongTros(res.data || []);
      } catch (innerErr) {
        setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('admin.error_load_rooms'), onConfirm: null });
      }
    }
    finally { setLoadingRooms(false); }
  };

  const tagColorPhong = (tt) => {
    if (tt === ROOM_STATUS.EMPTY) return 'green';
    if (tt === ROOM_STATUS.RENTED) return 'red';
    return 'amber';
  };  
  
  const ADMIN_TABS = [
    { key: 'USERS', label: t('admin.tab_users'), icon: '👥 ' },
    { key: 'BAO_CAO', label: t('landlord.tab_report'), icon: '📊 ' },
    { key: 'PHONG', label: t('admin.tab_rooms'), icon: '🏨 ' },
    { key: 'KHIEU_NAI', label: t('admin.tab_complaints'), icon: '⚠️ ' },
    { key: 'LIEN_HE', label: t('landlord.tab_contact') || 'Liên hệ', icon: '💬 ' },
  ];

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
                <div className="dashboard-sidebar__logo-subtitle">{t('header.portal_admin')}</div>
              </div>
            </div>
            <div className="dashboard-sidebar__menu">
              {ADMIN_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`dashboard-sidebar__item ${adminTab === tab.key ? 'dashboard-sidebar__item--active' : ''}`}
                  onClick={() => {
                    setAdminTab(tab.key);
                    if (tab.key === 'PHONG') setChuTroDangChon(null);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === 'KHIEU_NAI' && pendingCount > 0 && (
                    <span className="admin-nav__badge">{pendingCount}</span>
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
              🚪 {t('header.logout') || 'Đăng xuất'}
            </button>
          </div>
        </div>

      {/* Khu vực nội dung chính bên phải */}
      <div className="dashboard-content">
        {/* Top Header cho dashboard */}
        <div className="dashboard-content__header">
          <h2 className="dashboard-content__title">
            {ADMIN_TABS.find(t => t.key === adminTab)?.label}
          </h2>
          <div className="dashboard-content__actions">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Profile Info */}
            <div className="dashboard-header-profile">
              <div className="dashboard-header-avatar">
                {(currentUser?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="dashboard-header-userinfo">
                <div className="dashboard-header-username">
                  {currentUser?.username}
                </div>
                <div className="dashboard-header-role">
                  {t('header.role_ADMIN') || 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>


        {loadingInit ? <Spinner text={t('admin.init_loading')} /> : (
          <>
            {adminTab === 'USERS' && <QuanLyNguoiDung />}

            {adminTab === 'LIEN_HE' && (
              <AdminContactTab
                onSetChatTarget={onSetChatTarget}
                unreadSenderIds={unreadSenderIds}
              />
            )}

            {adminTab === 'BAO_CAO' && (
              <DashboardTab 
                thongKeData={thongKeData} 
                isAdmin={true} 
                chuTros={chuTros} 
                khieuNais={khieuNais} 
              />
            )}

            {adminTab === 'PHONG' && (
              !chuTroDangChon ? (
                <div className="premium-card">
                  {thongKeData && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div style={{
                        padding: '16px 20px',
                        background: 'var(--accent-light)',
                        border: '1px solid var(--accent)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 2px 8px var(--accent-glow)'
                      }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.5px' }}>
                          🏨 {t('admin.stats_total_rooms')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', marginTop: '6px' }}>
                          {thongKeData.tongSoPhong} <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('admin.stats_rooms_unit')}</span>
                        </div>
                      </div>

                      <div style={{
                        padding: '16px 20px',
                        background: 'var(--danger-light)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
                      }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--danger)', fontWeight: 600, letterSpacing: '0.5px' }}>
                          🔴 {t('admin.stats_rented_rooms')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)', marginTop: '6px' }}>
                          {thongKeData.soPhongDaThue} <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('admin.stats_rooms_unit')}</span>
                        </div>
                      </div>

                      <div style={{
                        padding: '16px 20px',
                        background: 'var(--success-light)',
                        border: '1px solid var(--success)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                      }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 600, letterSpacing: '0.5px' }}>
                          🟢 {t('admin.stats_empty_rooms')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '6px' }}>
                          {thongKeData.soPhongTrong} <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('admin.stats_rooms_unit')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>{t('admin.search_rooms')}</div>
                  <input type="text" placeholder={t('admin.search_placeholder')} value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} className="form-input" style={{ marginBottom: '20px' }} />
                  {chuTros.filter(ct =>
                    ct.username.toLowerCase().includes(tuKhoa.toLowerCase()) ||
                    (ct.hoTen && ct.hoTen.toLowerCase().includes(tuKhoa.toLowerCase()))
                  ).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
                      {t('admin.no_rooms_found')}
                    </div>
                  ) : (
                    <div className="grid-cards">
                      {chuTros.filter(ct =>
                        ct.username.toLowerCase().includes(tuKhoa.toLowerCase()) ||
                        (ct.hoTen && ct.hoTen.toLowerCase().includes(tuKhoa.toLowerCase()))
                      ).map((ct, i) => {
                        const isUnread = unreadSenderIds.some(id => String(id) === String(ct.id));
                        return (
                          <div key={ct.id}
                            className="admin-host-card"
                            onClick={() => { if (!ct.locked) handleChonChuTro(ct); }}
                            style={{
                              position: 'relative',
                              border: isUnread ? '1px solid var(--danger)' : '1px solid var(--border-light)',
                              opacity: ct.locked ? 0.5 : 1, cursor: ct.locked ? 'not-allowed' : 'pointer',
                              animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                              boxShadow: isUnread ? '0 0 12px rgba(239, 68, 68, 0.15)' : 'none',
                            }}>
                            <style>{`
                              @keyframes pulseDot {
                                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                                70% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
                                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                              }
                            `}</style>
                            {isUnread && (
                              <span style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'var(--danger)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
                                animation: 'pulseDot 1.2s infinite'
                              }} />
                            )}
                            <div style={{ ...S.avatar(i), margin: '0 auto 10px', width: '44px', height: '44px', fontSize: '15px' }}>
                              {(ct.hoTen || ct.username).charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-host-card__name">
                              {ct.hoTen ? `${ct.hoTen} (${ct.username})` : ct.username}
                            </div>
                            {ct.locked && <div className="admin-host-card__locked-label">🔒 {t('admin.locked')}</div>}
                            <div className="admin-host-card__id">{t('admin.id')}: {ct.id}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }} className="premium-card">
                    <button className="btn btn--outline" onClick={() => setChuTroDangChon(null)}>{t('admin.back')}</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t('admin.room_label')} <span style={{ color: chuTroDangChon.locked ? 'var(--danger)' : 'var(--success)' }}>
                          {chuTroDangChon.hoTen ? `${chuTroDangChon.hoTen} (${chuTroDangChon.username})` : chuTroDangChon.username} {chuTroDangChon.locked && `(${t('admin.locked')})`}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{phongTros.length} {t('admin.room_count')}</div>
                    </div>
                    <button
                      className="btn btn--primary"
                      style={{ 
                        opacity: chuTroDangChon.locked ? 0.4 : 1, 
                        cursor: chuTroDangChon.locked ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        if (chuTroDangChon.locked) {
                          setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('admin.account_locked'), onConfirm: null });
                          return;
                        }
                        onSetChatTarget(chuTroDangChon);
                      }}
                    >
                      {t('admin.btn_chat')}
                      {unreadSenderIds.some(id => String(id) === String(chuTroDangChon.id)) && (
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
                  </div>

                  {loadingRooms ? <Spinner text={t('admin.loading_rooms')} /> : (
                    <div className="grid-cards">
                      {phongTros.map((phong, i) => (
                        <div key={phong.id}
                          onClick={() => setPhongDangXem(phong)}
                          style={{
                            ...S.card, padding: '20px',
                            borderTop: `3px solid ${phong.trangThai === ROOM_STATUS.EMPTY ? 'var(--success)' : phong.trangThai === ROOM_STATUS.RENTED ? 'var(--danger)' : 'var(--warning)'}`,
                            borderRadius: `0 0 var(--radius-lg) var(--radius-lg)`,
                            animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                            cursor: 'pointer',
                            transition: 'all var(--transition)',
                          }}
                          className="admin-room-card"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{phong.tenPhong}</div>
                            <span style={S.tag(tagColorPhong(phong.trangThai))}>{t('admin.room_status_' + phong.trangThai) || phong.trangThai}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('admin.price')}: <strong style={{ color: 'var(--accent)' }}>{phong.giaPhong?.toLocaleString()} {t('landlord.currency')}</strong></div>
                          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {t('admin.view_room_detail') || '🔍 Xem chi tiết phòng →'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {adminTab === 'KHIEU_NAI' && (
              <div className="premium-card">
                {khieuNais.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>📭</div>
                    {t('admin.no_complaints')}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="complaints-split-layout">
                    <style>{`
                      @media (min-width: 768px) {
                        .complaints-split-layout {
                          grid-template-columns: 320px 1fr !important;
                        }
                      }
                    `}</style>
                    
                    {/* Danh sách khiếu nại bên trái */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                      {khieuNais.map((kn, i) => {
                        const isSelected = selectedComplaint?.id === kn.id;
                        return (
                          <div 
                            key={kn.id} 
                            onClick={() => setSelectedComplaint(kn)}
                            style={{
                              border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)', 
                              padding: '12px',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                              opacity: kn.trangThai === 'DA_GIAI_QUYET' ? 0.6 : 1,
                              transition: 'all var(--transition)',
                              animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {kn.tieuDe}
                              </div>
                              <span style={S.tag(kn.trangThai === 'DA_GIAI_QUYET' ? 'blue' : 'amber')}>
                                {kn.trangThai === 'DA_GIAI_QUYET' ? t('admin.status_resolved') : t('admin.status_pending')}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {kn.nguoiGui?.username}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nội dung chi tiết & hành động bên phải */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg)', height: 'fit-content' }}>
                      {selectedComplaint ? (
                        <div style={{ animation: 'fadeIn 0.2s ease' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedComplaint.tieuDe}</h4>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                👤 {selectedComplaint.nguoiGui?.hoTen || selectedComplaint.nguoiGui?.username} (@{selectedComplaint.nguoiGui?.username})
                              </div>
                            </div>
                            <span style={S.tag(selectedComplaint.trangThai === 'DA_GIAI_QUYET' ? 'blue' : 'amber')}>
                              {selectedComplaint.trangThai === 'DA_GIAI_QUYET' ? t('admin.status_resolved') : t('admin.status_pending')}
                            </span>
                          </div>

                          <div className="admin-complaint__content" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                            "{selectedComplaint.noiDung}"
                          </div>

                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                              className="btn btn--outline"
                              style={{ 
                                opacity: selectedComplaint.nguoiGui?.locked ? 0.4 : 1, 
                                cursor: selectedComplaint.nguoiGui?.locked ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px'
                              }}
                              onClick={() => {
                                if (selectedComplaint.nguoiGui?.locked) {
                                  setConfirmState({ isOpen: true, type: 'danger', title: t('common.error'), message: t('admin.account_locked'), onConfirm: null });
                                  return;
                                }
                                onSetChatTarget({ id: selectedComplaint.nguoiGui?.id, username: selectedComplaint.nguoiGui?.username });
                              }}
                            >
                              {t('admin.btn_contact')}
                              {unreadSenderIds.some(id => String(id) === String(selectedComplaint.nguoiGui?.id || selectedComplaint.nguoiGuiId)) && (
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
                            {selectedComplaint.trangThai === 'CHO_XU_LY' && (
                              <button className="btn btn--primary" onClick={() => handleXuLyKhieuNai(selectedComplaint.id)}>
                                {t('admin.btn_resolved')}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          👉 Chọn một khiếu nại để xem chi tiết
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <Footer />
      </div>

      {phongDangXem && (
        <AdminRoomDetailModal
          phong={phongDangXem}
          hopDongs={hopDongs}
          hoaDons={hoaDons}
          onClose={() => setPhongDangXem(null)}
          t={t}
          tagColorPhong={tagColorPhong}
        />
      )}

      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
    </>
  );
}

// ==========================================
// AdminRoomDetailModal component — Hiển thị chi tiết phòng cho Admin
// ==========================================
const AdminRoomDetailModal = ({
  phong,
  hopDongs,
  hoaDons,
  onClose,
  t,
  tagColorPhong,
}) => {
  const [activeModalTab, setActiveModalTab] = useState('INFO');

  const phongHopDongs = hopDongs.filter(hd => hd.phongTro?.id === phong.id);
  const phongHoaDons = hoaDons.filter(hd => hd.phongTro?.id === phong.id);

  const activeContract = phongHopDongs.find(hd => hd.trangThai === 'DA_DUYET' || hd.trangThai === 'YEU_CAU_HUY');
  const pendingContract = phongHopDongs.find(hd => hd.trangThai === 'CHO_DUYET');
  const activeOrPendingContract = activeContract || pendingContract;

  const renderTabContent = () => {
    switch (activeModalTab) {
      case 'INFO':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease' }}>
            {phong.hinhAnh && (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '180px', border: '1px solid var(--border-light)' }}>
                {phong.hinhAnh.includes('|||') ? (
                  <img src={phong.hinhAnh.split('|||')[0]} alt={phong.tenPhong} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                ) : (
                  <img src={phong.hinhAnh} alt={phong.tenPhong} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                )}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.rent_price')}</span>
                <strong style={{ color: 'var(--accent)', fontSize: '14px' }}>{phong.giaPhong?.toLocaleString()} {t('landlord.currency')}</strong>
              </div>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.area')}</span>
                <span style={modalInfoValueStyle}>{phong.dienTich ? `${phong.dienTich} m²` : '—'}</span>
              </div>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.electric_price')}</span>
                <span style={modalInfoValueStyle}>{phong.giaDien?.toLocaleString()} {t('landlord.currency')}/kWh</span>
              </div>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.water_price')}</span>
                <span style={modalInfoValueStyle}>{phong.giaNuoc?.toLocaleString()} {t('landlord.currency')}/m³</span>
              </div>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.deposit')}</span>
                <span style={modalInfoValueStyle}>{phong.tienCoc?.toLocaleString()} {t('landlord.currency')}</span>
              </div>
              <div style={modalInfoRowStyle}>
                <span style={modalInfoLabelStyle}>{t('landlord.status')}</span>
                <span style={modalInfoValueStyle}>{t('admin.room_status_' + phong.trangThai) || phong.trangThai}</span>
              </div>
            </div>
            <div style={{ ...modalInfoRowStyle, gridColumn: '1 / -1', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', borderBottom: 'none' }}>
              <span style={modalInfoLabelStyle}>{t('landlord.address')}</span>
              <span style={{ ...modalInfoValueStyle, lineHeight: '1.4', fontWeight: '500' }}>📍 {phong.diaChi || '—'}</span>
            </div>
            {phong.moTa && (
              <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ ...modalInfoLabelStyle, display: 'block', marginBottom: '6px' }}>{t('landlord.more_description')}</span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{phong.moTa}</div>
              </div>
            )}
          </div>
        );
      case 'CONTRACT':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease' }}>
            {activeOrPendingContract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('admin.contract_current') || 'Hợp đồng hiện tại'}</span>
                    <span style={tagStyle(activeOrPendingContract.trangThai)}>
                      {activeOrPendingContract.trangThai === 'DA_DUYET' ? t('admin.contract_active') || 'Đang hiệu lực' :
                        activeOrPendingContract.trangThai === 'YEU_CAU_HUY' ? t('admin.contract_cancelling') || 'Chờ hủy' : t('admin.contract_pending') || 'Chờ duyệt'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>{t('admin.contract_id') || 'Mã hợp đồng:'}</span> #{activeOrPendingContract.id}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>{t('admin.contract_deposit') || 'Tiền cọc:'}</span> {activeOrPendingContract.tienCoc?.toLocaleString()} {t('landlord.currency') || 'đ'}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>{t('admin.contract_start') || 'Ngày bắt đầu:'}</span> {activeOrPendingContract.ngayBatDau}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>{t('admin.contract_end') || 'Ngày kết thúc:'}</span> {activeOrPendingContract.ngayKetThuc || t('admin.contract_indefinite') || 'Hợp đồng vô thời hạn'}</div>
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                    {t('admin.tenant_title') || '👤 Thông tin khách thuê'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_name') || 'Họ và tên:'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {activeOrPendingContract.khachHang?.khachHang?.hoTen || activeOrPendingContract.khachHang?.username}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_phone') || 'Số điện thoại:'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{activeOrPendingContract.khachHang?.khachHang?.soDienThoai || t('admin.not_updated') || 'Chưa cập nhật'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_cccd') || 'Số CCCD:'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{activeOrPendingContract.khachHang?.khachHang?.soCccd || t('admin.not_updated') || 'Chưa cập nhật'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_email') || 'Email:'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{activeOrPendingContract.khachHang?.khachHang?.email || t('admin.not_updated') || 'Chưa cập nhật'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_address') || 'Địa chỉ thường trú:'}</span>
                      <span style={{ color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'right' }}>
                        {activeOrPendingContract.khachHang?.khachHang?.diaChiThuongTru || t('admin.not_updated') || 'Chưa cập nhật'}
                      </span>
                    </div>
                    {activeOrPendingContract.khachHang?.khachHang?.tenNganHang && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{t('admin.tenant_bank') || 'Tài khoản ngân hàng:'}</span>
                        <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                          {activeOrPendingContract.khachHang.khachHang.tenNganHang} - {activeOrPendingContract.khachHang.khachHang.soTaiKhoan} ({activeOrPendingContract.khachHang.khachHang.chuTaiKhoan})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📭</span>
                <span>{t('admin.no_active_contract') || 'Hiện chưa có hợp đồng nào đang hiệu lực cho phòng này.'}</span>
              </div>
            )}

            {phongHopDongs.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                  {t('admin.contract_history', { count: phongHopDongs.length }) || `Lịch sử hợp đồng (${phongHopDongs.length})`}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {phongHopDongs.map(hd => (
                    <div key={hd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                      <div>
                        <strong>#{hd.id}</strong> — {t('admin.tenant_name').replace(':', '') || 'Khách'}: {hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t('admin.contract_history_term', { start: hd.ngayBatDau, end: hd.ngayKetThuc || t('admin.contract_indefinite') }) || `Kỳ hạn: ${hd.ngayBatDau} đến ${hd.ngayKetThuc || 'Vô thời hạn'}`}
                        </div>
                      </div>
                      <span style={tagStyle(hd.trangThai)}>{t('landlord.contract_status_' + hd.trangThai) || hd.trangThai}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'BILL_HISTORY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease' }}>
            {phongHoaDons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🧾</span>
                <span>{t('admin.no_invoices_for_room') || 'Chưa có hóa đơn nào được xuất cho phòng này.'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {phongHoaDons.map(hd => (
                  <div key={hd.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{t('admin.invoice_month', { month: hd.thang, year: hd.nam }) || `Hóa đơn tháng ${hd.thang}/${hd.nam}`}</strong>
                      <span style={tagStyle(hd.trangThai)}>
                        {hd.trangThai === 'DA_THANH_TOAN' ? t('admin.invoice_paid') || 'Đã thanh toán' : t('admin.invoice_unpaid') || 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>{t('admin.invoice_room_fee') || 'Tiền phòng:'} <strong>{hd.tienPhong?.toLocaleString()}{t('landlord.currency') || 'đ'}</strong></div>
                      <div>{t('admin.invoice_electricity') || 'Tiền điện:'} <strong>{hd.tienDien?.toLocaleString()}{t('landlord.currency') || 'đ'}</strong></div>
                      <div>{t('admin.invoice_water') || 'Tiền nước:'} <strong>{hd.tienNuoc?.toLocaleString()}{t('landlord.currency') || 'đ'}</strong></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dotted var(--border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('admin.invoice_id') || 'Hóa đơn ID:'} #{hd.id}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                        {t('admin.invoice_total') || 'Tổng cộng:'} {hd.tongTien?.toLocaleString()}{t('landlord.currency') || 'đ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const tagStyle = (status) => {
    let colors = { bg: 'var(--border-light)', text: 'var(--text-secondary)' };
    if (status === 'DA_DUYET' || status === 'DA_THANH_TOAN' || status === 'DA_THANH_LY') {
      colors = { bg: 'var(--success-light)', text: 'var(--success)' };
    } else if (status === 'CHUA_THANH_TOAN' || status === 'TU_CHOI' || status === 'HUY') {
      colors = { bg: 'var(--danger-light)', text: 'var(--danger)' };
    } else if (status === 'CHO_DUYET' || status === 'YEU_CAU_HUY') {
      colors = { bg: 'var(--warning-light)', text: 'var(--warning)' };
    }
    return {
      padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
      background: colors.bg, color: colors.text, display: 'inline-block',
    };
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease',
  };

  const modalStyle = {
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--surface)' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏠 {phong.tenPhong}
              <span style={tagColorPhong ? tagStyle(phong.trangThai) : {}}>{t('admin.room_status_' + phong.trangThai) || phong.trangThai}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{t('admin.modal_subtitle') || 'Chi tiết thông tin phòng & tài chính'}</div>
          </div>
          <button style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', outline: 'none' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 20px', background: 'var(--bg)', gap: '16px' }}>
          {[
            ['INFO', t('admin.modal_tab_info') || 'ℹ️ Thông tin phòng'],
            ['CONTRACT', t('admin.modal_tab_contract') || '📄 Hợp đồng & Khách thuê'],
            ['BILL_HISTORY', t('admin.modal_tab_invoices') || '🧾 Lịch sử Hóa đơn'],
          ].map(([tabKey, label]) => {
            const isActive = activeModalTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveModalTab(tabKey)}
                style={{
                  padding: '12px 4px', border: 'none', background: 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all var(--transition)', outline: 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: 'var(--surface)' }}>
          {renderTabContent()}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--text-primary)', color: '#fff', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', transition: 'all var(--transition)',
            }}
          >
            {t('admin.btn_close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

const modalInfoRowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
};
const modalInfoLabelStyle = {
  color: 'var(--text-muted)', fontWeight: 500,
};
const modalInfoValueStyle = {
  color: 'var(--text-primary)', fontWeight: 600,
};
