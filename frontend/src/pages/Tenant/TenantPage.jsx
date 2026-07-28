import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import ChatBox from '../../components/ChatBox';
import KhieuNaiForm from '../../components/KhieuNaiForm';
import HoSoForm from '../../components/HoSoForm';
import ContractModal from '../../components/ContractModal';
import ConfirmModal from '../../components/ConfirmModal';
import useAdminContact from '../../hooks/useAdminContact';
import Footer from '../../components/Footer';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './TenantPage.css';

const ROLES = { USER: 'ROLE_USER' };

const S = {
  navBar: {
    display: 'flex', gap: '2px', background: 'var(--border-light)',
    padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    width: 'fit-content',
  },

  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)', padding: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
  },
  sectionTitle: {
    fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
    marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)',
  },
  tag: (color) => {
    const map = {
      green: { bg: 'var(--success-light)', text: 'var(--success)' },
      amber: { bg: 'var(--warning-light)', text: 'var(--warning)' },
      orange: { bg: 'var(--warning-light)', text: 'var(--warning)' },
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
    fontSize: '13px', fontWeight: 500, transition: 'all var(--transition)',
  },
  btnContact: (disabled) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px', fontWeight: 500, border: '1px solid var(--border)',
    background: 'var(--surface)', color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    opacity: disabled ? 0.6 : 1, transition: 'all var(--transition)', whiteSpace: 'nowrap',
  }),
  emptyState: {
    textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)',
    animation: 'fadeIn 0.3s ease',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: 'var(--surface)', borderRadius: 'var(--radius-xl)', width: '90%', maxWidth: '400px',
    padding: '32px', textAlign: 'center', position: 'relative',
    animation: 'modalIn 0.25s ease',
  },
};

export default function TenantPage({ currentUser, hopDongCuaToi, onBrowseRooms, unreadSenderIds = [], setUnreadSenderIds, onSetChatTarget, onLogout }) {
  const { t, i18n } = useTranslation();

  const userRole = (currentUser?.role || '').startsWith('ROLE_') ? currentUser.role : `ROLE_${currentUser.role}`;

  if (userRole !== ROLES.USER) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>
        {t('tenant.access_denied')}
      </div>
    );
  }

  const [cuDanTab, setCuDanTab] = useState('TONG_QUAN');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dsThongBao, setDsThongBao] = useState([]);
  const [dsHoaDon, setDsHoaDon] = useState([]);
  const [payingHD, setPayingHD] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [landlordBank, setLandlordBank] = useState(null);
  const [showContract, setShowContract] = useState(false);
  const [hoSoMe, setHoSoMe] = useState(null);
  const [confirmState, setConfirmState] = useState({ 
    isOpen: false, 
    type: 'info', 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  const handleInHoaDon = (hd) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert(t('common.popup_blocked') || 'Vui lòng cho phép trình duyệt mở popup để in hóa đơn!');
      return;
    }
    
    const daTT = hd.trangThai === 'DA_THANH_TOAN';
    const currency = t('landlord.currency') || 'đ';
    const totalText = t('tenant.total') || 'Tổng thanh toán';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('tenant.invoice_title') || 'Hóa đơn'} - ${hd.phongTro?.tenPhong || ''}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }
            .info-item span {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              padding: 12px 15px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
              color: #475569;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              background-color: #f1f5f9;
            }
            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 10px;
            }
            .status--paid {
              background-color: #dcfce7;
              color: #15803d;
            }
            .status--unpaid {
              background-color: #fef3c7;
              color: #b45309;
            }
            .footer {
              text-align: center;
              margin-top: 60px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HÓA ĐƠN TIỀN PHÒNG / RENTAL INVOICE</div>
            <div class="subtitle">${t('landlord.month') || 'Tháng'} ${hd.thang}/${hd.nam}</div>
            <div class="status ${daTT ? 'status--paid' : 'status--unpaid'}">
              ${daTT ? 'ĐÃ THANH TOÁN / PAID' : 'CHƯA THANH TOÁN / UNPAID'}
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item"><span>Phòng / Room:</span> ${hd.phongTro?.tenPhong || '—'}</div>
            <div class="info-item"><span>Khách thuê / Tenant:</span> ${hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || '—'}</div>
            <div class="info-item"><span>Mã hóa đơn / Invoice ID:</span> #${hd.id}</div>
            <div class="info-item"><span>Ngày tạo / Created Date:</span> ${new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Khoản mục / Description</th>
                <th class="text-right">Thành tiền / Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tiền phòng / Room Rent</td>
                <td class="text-right">${hd.tienPhong?.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td>Tiền điện / Electricity</td>
                <td class="text-right">${hd.tienDien?.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td>Tiền nước / Water</td>
                <td class="text-right">${hd.tienNuoc?.toLocaleString()} ${currency}</td>
              </tr>
              <tr class="total-row">
                <td>${totalText} / Total</td>
                <td class="text-right">${hd.tongTien?.toLocaleString()} ${currency}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: space-between; margin-top: 80px;">
            <div style="text-align: center; width: 45%;">
              <p style="margin-bottom: 60px;"><strong>Người lập hóa đơn / Prepared By</strong><br/>(Ký, ghi rõ họ tên / Sign & Write Name)</p>
              <p style="color: #cbd5e1;">................................................</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <p style="margin-bottom: 60px;"><strong>Khách thuê phòng / Tenant</strong><br/>(Ký, ghi rõ họ tên / Sign & Write Name)</p>
              <p style="color: #cbd5e1;">................................................</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của Smart Room Rental! / Thank you for choosing Smart Room Rental!</p>
            <p>© 2026 Smart Room Rental.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fetchHoaDon = () => {
    setLoadingTab(true);
    api.get('/hoa-don/me')
      .then(res => setDsHoaDon(res.data || []))
      .catch(err => console.error(t('tenant.error_fetch_invoice'), err))
      .finally(() => setLoadingTab(false));
  };

  const handleHuyHopDong = () => {
    const message = t('tenant.confirm_cancel_contract') || "Bạn có chắc chắn muốn hủy hợp đồng ngay lập tức? Tiền cọc sẽ bị khấu trừ theo quy định.";
    
    setConfirmState({
      isOpen: true,
      type: 'danger',
      title: t('tenant.cancel_contract_now') || 'Xác nhận hủy hợp đồng',
      message,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        setIsProcessing(true);
        try {
          await api.put(`/hop-dong/${hopDongCuaToi.id}/khach-huy`);
          alert(t('tenant.cancel_success') || "Hợp đồng đã được hủy thành công!");
          window.location.reload();
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
          alert(t('common.error') + ": " + errMsg);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const { admin: adminContact, loading: loadingAdmin, error: adminError } = useAdminContact();
  const landlordId = hopDongCuaToi?.phongTro?.chuTroId ?? hopDongCuaToi?.phongTro?.chuTro?.id;
  const hasUnreadLandlordMsg = landlordId && unreadSenderIds.some(id => String(id) === String(landlordId));
  const hasAdminUnread = adminContact?.id && unreadSenderIds.some(id => String(id) === String(adminContact.id));
  const noContract = !hopDongCuaToi || Object.keys(hopDongCuaToi).length === 0;

  useEffect(() => {
    if (cuDanTab === 'THONG_BAO' && hopDongCuaToi?.phongTro?.chuTroId) {
      setLoadingTab(true);
      api.get(`/thong-bao/chu-tro/${hopDongCuaToi.phongTro.chuTroId}`)
        .then(res => setDsThongBao(res.data || []))
        .catch(err => console.error(t('tenant.error_fetch_notice'), err))
        .finally(() => setLoadingTab(false));
    }
    if (cuDanTab === 'HOA_DON') {
      fetchHoaDon();
    }
  }, [cuDanTab, hopDongCuaToi]);

  useEffect(() => {
    if (hopDongCuaToi?.phongTro?.chuTroId) {
      api.get(`/tai-khoan/chu-tro/${hopDongCuaToi.phongTro.chuTroId}/chi-tiet`)
        .then(res => {
          if (res.data?.soTaiKhoan) {
            setLandlordBank({
              tenNganHang: res.data.tenNganHang || 'mb',
              soTaiKhoan: res.data.soTaiKhoan || '',
              chuTaiKhoan: res.data.chuTaiKhoan || '',
            });
          }
        })
        .catch(err => console.error(t('tenant.error_fetch_bank'), err));
    }
    api.get('/khach-hang/ho-so/me')
      .then(res => setHoSoMe(res.data))
      .catch(err => console.error('Error loading profile:', err));
  }, [hopDongCuaToi]);

  const handleThanhToan = async () => {
    if (!payingHD) return;
    setIsProcessing(true);
    try {
      await api.post(`/hoa-don/${payingHD.id}/thanh-toan`);
      setPayingHD(null);
      alert(t('tenant.payment_success'));
      fetchHoaDon();
    } catch (err) {
      console.error(err);
      alert(t('tenant.payment_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const TENANT_TABS = [
    { key: 'TONG_QUAN', label: t('tenant.tab_overview'), icon: '📊 ' },
    { key: 'THONG_TIN', label: t('tenant.tab_contract'), icon: '📄 ' },
    { key: 'HO_SO', label: t('tenant.tab_profile'), icon: '👤 ' },
    { key: 'HOA_DON', label: t('tenant.tab_invoice'), icon: '🧾 ' },
    { key: 'THONG_BAO', label: t('tenant.tab_notice'), icon: '🔔 ' },
  ];

  const Spinner = () => (
    <div style={{ textAlign: 'center', padding: '40px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{
        width: '24px', height: '24px', border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
      }} />
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('tenant.loading')}</div>
    </div>
  );

  const fmt = (v) => v != null ? Number(v).toLocaleString(t('landlord.date_locale') || 'vi-VN') : '0';

  const getVietQRUrl = (amount, month, year) => {
    const bankId = landlordBank?.tenNganHang?.toLowerCase() || 'mb';
    const accNum = landlordBank?.soTaiKhoan || '0000000000';
    const accName = landlordBank?.chuTaiKhoan || 'LANDLORD';
    const desc = t('tenant.qr_desc', { month, year });
    return `https://img.vietqr.io/image/${bankId}-${accNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(accName)}`;
  };

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
                <div className="dashboard-sidebar__logo-subtitle">{t('header.portal_tenant')}</div>
              </div>
            </div>
            <div className="dashboard-sidebar__menu">
              {TENANT_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`dashboard-sidebar__item ${cuDanTab === tab.key ? 'dashboard-sidebar__item--active' : ''}`}
                  onClick={() => {
                    setCuDanTab(tab.key);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-light)', opacity: 0.6 }} />

              <button
                className="dashboard-sidebar__item"
                style={{ color: 'var(--accent)', fontWeight: 600 }}
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onBrowseRooms();
                }}
              >
                {t('tenant.browse_more_rooms') || '🔍 Tìm phòng khác'}
              </button>
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
            {TENANT_TABS.find(t => t.key === cuDanTab)?.label}
          </h2>
          <div className="dashboard-content__actions">
            {/* Khieu Nai Form */}
            <KhieuNaiForm />

            {/* Chat Admin button */}
            <button
              style={{
                ...S.btnContact(loadingAdmin || !!adminError),
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => adminContact && onSetChatTarget(adminContact)}
              disabled={loadingAdmin || !!adminError}
            >
              🎧 {loadingAdmin ? t('tenant.btn_connecting') : adminError ? t('tenant.btn_offline') : t('tenant.btn_chat_admin')}
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
                {(currentUser?.username || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="dashboard-header-userinfo">
                <div className="dashboard-header-username">
                  {currentUser?.username}
                </div>
                <div className="dashboard-header-role">
                  {t('header.role_USER') || 'Tenant'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {cuDanTab === 'TONG_QUAN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            {/* Welcome banner */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              padding: '28px 32px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)',
              color: '#fff',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
                  {t('tenant.welcome_back', { name: currentUser?.hoTen || currentUser?.username })}
                </h3>
                <p style={{ fontSize: '13.5px', opacity: 0.9 }}>
                  {t('tenant.today_good_day')}
                </p>
                {hopDongCuaToi?.phongTro && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '20px', marginTop: '16px', fontSize: '12px', fontWeight: 600 }}>
                    🏠 {t('tenant.room')}: {hopDongCuaToi.phongTro.tenPhong}
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', right: '-20px', bottom: '-20px',
                fontSize: '120px', opacity: 0.1, pointerEvents: 'none'
              }}>🏠</div>
            </div>

            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              
              {/* Card 1: Hóa đơn chưa thanh toán */}
              <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                    🧾 {t('tenant.latest_unpaid_bill')}
                  </div>
                  {(() => {
                    const unpaid = dsHoaDon.find(hd => hd.trangThai === 'CHUA_THANH_TOAN');
                    if (unpaid) {
                      return (
                        <>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
                            {unpaid.tongTien?.toLocaleString()} {t('landlord.currency')}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {t('tenant.month_year', { thang: unpaid.thang, nam: unpaid.nam })}
                          </div>
                        </>
                      );
                    }
                    return (
                      <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500, marginTop: '8px' }}>
                        {t('tenant.no_unpaid_bill')}
                      </div>
                    );
                  })()}
                </div>
                {dsHoaDon.some(hd => hd.trangThai === 'CHUA_THANH_TOAN') && (
                  <button
                    className="btn btn--primary"
                    style={{ padding: '8px 12px', fontSize: '12px', marginTop: '16px', width: 'fit-content' }}
                    onClick={() => setCuDanTab('HOA_DON')}
                  >
                    💳 {t('tenant.btn_pay')}
                  </button>
                )}
              </div>

              {/* Card 2: Giá điện nước */}
              <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                    ⚡ {t('tenant.recent_utility')}
                  </div>
                  {hopDongCuaToi?.phongTro ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>🔌 {t('landlord.electric_price')}</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{hopDongCuaToi.phongTro.giaDien?.toLocaleString()} {t('landlord.currency')}/kWh</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>💧 {t('landlord.water_price')}</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{hopDongCuaToi.phongTro.giaNuoc?.toLocaleString()} {t('landlord.currency')}/m³</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {t('tenant.no_contract')}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Thông báo từ chủ trọ */}
              <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
                    🔔 {t('tenant.latest_notice_from_host')}
                  </div>
                  {dsThongBao.length > 0 ? (
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dsThongBao[0].tieuDe}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {dsThongBao[0].noiDung}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {t('tenant.no_notice')}
                    </div>
                  )}
                </div>
                {dsThongBao.length > 0 && (
                  <button
                    className="btn btn--outline"
                    style={{ padding: '6px 12px', fontSize: '12px', marginTop: '16px', width: 'fit-content' }}
                    onClick={() => setCuDanTab('THONG_BAO')}
                  >
                    👉 {t('tenant.tab_notice')}
                  </button>
                )}
              </div>

            </div>

            {/* Quick Actions Grid for Help/Support */}
            <div className="premium-card">
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                🛠️ {t('tenant.quick_help_contact')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <button
                  className="btn btn--outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', justifyContent: 'center' }}
                  onClick={() => {
                    const landlordId = hopDongCuaToi?.phongTro?.chuTroId;
                    if (landlordId) {
                      onSetChatTarget({ id: landlordId, username: t('tenant.landlord') });
                    } else {
                      alert(t('app.error_no_landlord'));
                    }
                  }}
                  disabled={!hopDongCuaToi?.phongTro}
                >
                  💬 {t('tenant.contact_landlord_chat')}
                </button>
                <button
                  className="btn btn--outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', justifyContent: 'center' }}
                  onClick={() => adminContact && onSetChatTarget(adminContact)}
                  disabled={loadingAdmin || !!adminError}
                >
                  🎧 {t('tenant.contact_admin_chat')}
                </button>
                <button
                  className="btn btn--outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', justifyContent: 'center' }}
                  onClick={() => setCuDanTab('THONG_TIN')}
                  disabled={!hopDongCuaToi}
                >
                  📄 {t('tenant.view_my_contract')}
                </button>
              </div>
            </div>

          </div>
        )}

        {cuDanTab === 'HO_SO' && <div className="premium-card"><HoSoForm user={currentUser} /></div>}

        {cuDanTab === 'THONG_TIN' && (
          <div className="premium-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={S.sectionTitle}>{t('tenant.contract_info_title')}</div>

            {noContract ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.6 }}>📭</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('tenant.no_contract')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('tenant.no_contract_desc')}</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('tenant.room')}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)' }}>{hopDongCuaToi.phongTro?.tenPhong}</div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('tenant.status')}</div>
                    <div style={{ marginTop: '2px' }}>
                      {hopDongCuaToi.trangThai === 'YEU_CAU_HUY' ? (
                        <span style={S.tag('orange')}>
                          {t('tenant.status_cancelling') || 'Đang yêu cầu hủy'}
                        </span>
                      ) : (
                        <span style={S.tag('green')}>
                          {t('tenant.status_active')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)', padding: '4px 16px', marginBottom: '16px',
                }}>
                  <div style={S.infoRow}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('tenant.rent_price')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{hopDongCuaToi.phongTro?.giaPhong?.toLocaleString()} {t('landlord.currency')}/{t('landlord.month').toLowerCase()}</span>
                  </div>
                  <div style={S.infoRow}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('tenant.representative')}</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{currentUser.username}</span>
                  </div>
                  <div style={{ ...S.infoRow, borderBottom: 'none' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('tenant.start_date')}</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{hopDongCuaToi.ngayBatDau}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button 
                    style={{ 
                      ...S.btnPrimary, 
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }} 
                    onClick={() => onSetChatTarget({ id: hopDongCuaToi.phongTro?.chuTroId, username: t('tenant.landlord') })}
                  >
                    <style>{`
                      @keyframes pulseDot {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                        70% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                      }
                    `}</style>
                    {t('tenant.contact_landlord')}
                    {hasUnreadLandlordMsg && (
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
                  <button style={S.btn} onClick={() => setShowContract(true)}>
                    📜 {t('tenant.btn_view_contract')}
                  </button>
                  
                  {hopDongCuaToi.trangThai !== 'YEU_CAU_HUY' ? (
                    <button 
                      style={{ ...S.btn, borderColor: 'var(--danger)', color: 'var(--danger)', marginLeft: 'auto' }} 
                      onClick={handleHuyHopDong}
                      disabled={isProcessing}
                    >
                      {t('tenant.cancel_contract_now')}
                    </button>
                  ) : (
                    <div style={{
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', color: 'var(--warning)', fontWeight: 500,
                      background: 'var(--warning-light)', padding: '6px 12px', borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      ⏳ {t('tenant.status_cancelling') || 'Đang chờ duyệt hủy...'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {cuDanTab === 'HOA_DON' && (
          <div className="premium-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={S.sectionTitle}>{t('tenant.invoice_title')}</div>
            {loadingTab ? <Spinner /> : dsHoaDon.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.6 }}>🎉</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('tenant.no_invoice')}
                </div>
                <div style={{ fontSize: '13px' }}>{t('tenant.no_invoice_desc')}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dsHoaDon.map((hd, i) => {
                  const daTT = hd.trangThai === 'DA_THANH_TOAN';
                  return (
                    <div key={hd.id} style={{
                      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      border: `1px solid ${daTT ? '#D1FAE5' : 'var(--border)'}`,
                      background: 'var(--surface)', opacity: daTT ? 0.75 : 1,
                      transition: 'all var(--transition)',
                      animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 20px', borderBottom: '1px solid var(--border-light)',
                        background: daTT ? '#F0FDF4' : 'var(--bg)',
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                            {t('tenant.payment_period')}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                            {t('tenant.month_year', { thang: hd.thang, nam: hd.nam })}
                          </div>
                        </div>
                        <span style={S.tag(daTT ? 'green' : 'red')}>
                          {daTT ? t('tenant.paid') : t('tenant.unpaid')}
                        </span>
                      </div>

                      <div style={{ padding: '16px 20px' }}>
                        {[
                          { icon: '🏠', label: t('tenant.room_fee'), value: hd.tienPhong, bg: '#EFF6FF' },
                          { icon: '⚡', label: t('tenant.electric_fee'), value: hd.tienDien, bg: '#FEF9C3' },
                          { icon: '💧', label: t('tenant.water_fee'), value: hd.tienNuoc, bg: '#E0F2FE' },
                        ].map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: idx < 2 ? '1px solid var(--border-light)' : 'none',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                                background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px',
                              }}>{item.icon}</div>
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(item.value)} {t('landlord.currency')}</span>
                          </div>
                        ))}

                        <div style={{
                          marginTop: '12px', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                          background: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span style={{ fontWeight: 500, color: '#A1A1AA', fontSize: '12px' }}>{t('tenant.total')}</span>
                          <span style={{ fontWeight: 700, color: '#FDE68A', fontSize: '16px' }}>{fmt(hd.tongTien)} {t('landlord.currency')}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            style={{
                              flex: 1, padding: '10px',
                              borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer',
                              background: 'var(--surface)', color: 'var(--text-secondary)',
                              fontSize: '13px', fontWeight: 600, transition: 'all var(--transition)',
                            }}
                            className="btn"
                            onClick={() => handleInHoaDon(hd)}
                          >
                            🖨️ {t('landlord.btn_print') || 'In hóa đơn'}
                          </button>
                          {!daTT && (
                            <button
                              style={{
                                flex: 1, padding: '10px',
                                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                                background: 'var(--success)', color: '#fff',
                                fontSize: '13px', fontWeight: 600, transition: 'opacity var(--transition)',
                              }}
                              className="btn btn--primary"
                              onClick={() => setPayingHD(hd)}
                            >
                              {t('tenant.btn_pay')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {cuDanTab === 'THONG_BAO' && (
          <div className="premium-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={S.sectionTitle}>{t('tenant.notice_title')}</div>
            {loadingTab ? <Spinner /> : dsThongBao.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.6 }}>📢</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('tenant.no_notice')}
                </div>
                <div style={{ fontSize: '13px' }}>{t('tenant.no_notice_desc')}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dsThongBao.map((tb, i) => (
                  <div key={tb.id} style={{
                    padding: '16px', background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                    borderLeft: '3px solid var(--accent)',
                    animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {tb.tieuDe}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {tb.noiDung}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                      {tb.ngayDang ? new Date(tb.ngayDang).toLocaleString(t('landlord.date_locale') || 'vi-VN') : t('tenant.recently')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {cuDanTab === 'LIEN_HE' && (
          <div className="premium-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <TenantContactTab
              currentUser={currentUser}
              hopDongCuaToi={hopDongCuaToi}
              adminContact={adminContact}
              onSetChatTarget={onSetChatTarget}
              unreadSenderIds={unreadSenderIds}
            />
          </div>
        )}

        <Footer />
      </div>



      {payingHD && (
        <div style={S.modalOverlay}>
          <div style={S.modalContent}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t('tenant.confirm_payment')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              {t('tenant.invoice_month', { thang: payingHD.thang, nam: payingHD.nam })} <strong style={{ color: 'var(--accent)' }}>{payingHD.tongTien?.toLocaleString()} {t('landlord.currency')}</strong>
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '16px', display: 'inline-block' }}>
              <img
                src={getVietQRUrl(payingHD.tongTien, payingHD.thang, payingHD.nam)}
                alt="VietQR"
                style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '0 auto' }}
              />
              <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('tenant.qr_scan_instruction')}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('tenant.qr_scan_note')}</div>
            </div>

            <div style={{
              background: 'var(--warning-light)', padding: '12px', borderRadius: 'var(--radius-md)',
              marginBottom: '20px', textAlign: 'center', fontSize: '12px',
              color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)',
            }}>
              {t('tenant.payment_test_msg')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button style={S.btn} onClick={() => setPayingHD(null)} disabled={isProcessing}>{t('tenant.btn_cancel')}</button>
              <button
                style={{ ...S.btnPrimary, padding: '11px', justifyContent: 'center' }}
                onClick={handleThanhToan}
                disabled={isProcessing}
              >
                {isProcessing ? t('tenant.btn_processing') : t('tenant.btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ContractModal
        isOpen={showContract}
        onClose={() => setShowContract(false)}
        phong={hopDongCuaToi?.phongTro}
        chuTroInfo={hopDongCuaToi?.phongTro?.chuTro || { hoTen: t('tenant.landlord') }}
        khachThueInfo={hoSoMe || currentUser}
        onConfirm={null}
        confirmText={t('tenant.contract_active')}
        isProcessing={false}
        role="TENANT"
        hopDong={hopDongCuaToi}
      />

      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
    </>
  );
}
