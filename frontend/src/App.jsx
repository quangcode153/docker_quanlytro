import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import api from './api';

import Header from './components/Header/Header';
import Login from './pages/Login/Login';
import HomePage from './pages/Home/HomePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import AdminPage from './pages/Admin/AdminPage';
import LandlordPage from './pages/Landlord/LandlordPage';
import GuestPage from './pages/Guest/GuestPage';
import TenantPage from './pages/Tenant/TenantPage';
import ChatBox from './components/ChatBox';
import Footer from './components/Footer';
import { ROLES } from './constants';

function LoadingScreen({ message }) {
  const { t } = useTranslation();
  const loadingMsg = message || t('app.loading');
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)',
    }}>
      <div style={{
        width: '28px', height: '28px', border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.6s linear infinite', marginBottom: '16px',
      }} />
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{loadingMsg}</div>
    </div>
  );
}

function WaitingScreen({ hopDong, onOpenChat, onCancel, isCanceling }) {
  const { t } = useTranslation();
  return (
    <div style={{
      maxWidth: '440px', margin: '60px auto',
      background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      padding: '40px 32px', textAlign: 'center',
      animation: 'fadeInUp 0.4s ease',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'var(--warning-light)', margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
      }}>⏳</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {t('guest.pending_request')}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
        {t('guest.room')} <strong>{hopDong.phongTro?.tenPhong}</strong>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
        {t('guest.host_reply_soon')}
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onOpenChat}
          style={{
            padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'opacity var(--transition)',
          }}
        >
          {t('guest.btn_chat')}
        </button>
        <button
          onClick={onCancel}
          disabled={isCanceling}
          style={{
            padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'opacity var(--transition)',
          }}
        >
          {isCanceling ? `⏳ ${t('guest.canceling')}` : `🚫 ${t('guest.btn_cancel_request')}`}
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [hopDongCuaToi, setHopDongCuaToi] = useState(null);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [unreadSenderIds, setUnreadSenderIds] = useState([]);
  const isMounted = useRef(true);

  // Auto-clear unread ID when active chat target is selected
  useEffect(() => {
    if (chatTarget?.id) {
      setUnreadSenderIds(prev => prev.filter(id => String(id) !== String(chatTarget.id)));
    }
  }, [chatTarget?.id]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const kiemTraHopDong = async (isBackground = false) => {
    if (user?.role !== ROLES.USER) return;
    if (!isBackground && isMounted.current) setDangKiemTra(true);
    try {
      const res = await api.get(`/hop-dong/khach/${user.id}`);
      if (isMounted.current) {
        // Read locally canceled pending contracts
        const canceledIds = JSON.parse(localStorage.getItem('canceled_pending_contracts') || '[]');
        
        const hd = (res.data || []).find(
          h => (h.trangThai === 'DA_DUYET' || h.trangThai === 'CHO_DUYET' || h.trangThai === 'YEU_CAU_HUY')
               && !canceledIds.includes(h.id)
        );
        setHopDongCuaToi(hd || null);
      }
    } catch (err) {
      console.error(t('app.error_check_contract'), err);
    } finally {
      if (!isBackground && isMounted.current) setDangKiemTra(false);
    }
  };

  const handleCancelRequest = async (bypassConfirm = false) => {
    if (!hopDongCuaToi) return;
    if (!bypassConfirm && !window.confirm(t('guest.confirm_cancel_request'))) return;

    setIsCanceling(true);
    const id = hopDongCuaToi.id;
    const landlordId = hopDongCuaToi.phongTro?.chuTroId ?? hopDongCuaToi.phongTro?.chuTro?.id;
    const roomName = hopDongCuaToi.phongTro?.tenPhong || '';

    try {
      if (hopDongCuaToi.trangThai === 'CHO_DUYET') {
        // Hủy phía frontend: Gửi tin nhắn hệ thống qua WebSocket/Chat để lưu vào DB chat log
        if (landlordId) {
          const customEvent = new CustomEvent('send-system-message', {
            detail: {
              nguoiGuiId: user.id,
              nguoiNhanId: landlordId,
              noiDung: `[SYSTEM_CONTRACT_CANCELLED] Khách thuê ${user.username || 'ẩn danh'} đã hủy yêu cầu thuê phòng ${roomName} (ID: ${id})`,
              thoiGian: new Date().toISOString()
            }
          });
          window.dispatchEvent(customEvent);
        }
      } else {
        // Đối với hợp đồng đã duyệt: Gọi API hủy hợp đồng
        await api.put(`/hop-dong/${id}/khach-huy`);
        if (landlordId) {
          const customEvent = new CustomEvent('send-system-message', {
            detail: {
              nguoiGuiId: user.id,
              nguoiNhanId: landlordId,
              noiDung: `[SYSTEM_CONTRACT_CANCELLED] Khách thuê ${user.username || 'ẩn danh'} đã yêu cầu hủy hợp đồng phòng ${roomName} (ID: ${id})`,
              thoiGian: new Date().toISOString()
            }
          });
          window.dispatchEvent(customEvent);
        }
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu hủy hợp đồng lên backend:", err);
    } finally {
      // Store canceled pending contract ID in localStorage so the client filters it out
      const canceledIds = JSON.parse(localStorage.getItem('canceled_pending_contracts') || '[]');
      if (!canceledIds.includes(id)) {
        canceledIds.push(id);
        localStorage.setItem('canceled_pending_contracts', JSON.stringify(canceledIds));
      }
      setHopDongCuaToi(null);
      setIsCanceling(false);
      if (!bypassConfirm) {
        alert(t('guest.cancel_success'));
      }
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    kiemTraHopDong(false);
    const interval = setInterval(() => kiemTraHopDong(true), 10000);

    const handleRefresh = () => {
      kiemTraHopDong(true);
    };
    window.addEventListener('refresh-contract-data', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-contract-data', handleRefresh);
    };
  }, [user?.id]);

  const handleOpenChat = () => {
    const chuTroId = hopDongCuaToi?.phongTro?.chuTroId ?? hopDongCuaToi?.phongTro?.chuTro?.id;
    if (!chuTroId) { alert(t('app.error_no_landlord')); return; }
    setChatTarget({ id: chuTroId, username: t('app.landlord_of_room', { room: hopDongCuaToi.phongTro?.tenPhong }) });
  };

  const [tenantView, setTenantView] = useState('DASHBOARD'); // 'DASHBOARD' or 'MARKET'

  const tenantViewVal = tenantView;
  const rawRole = user?.role || '';
  const normalizedRole = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole}`;

  const isDashboard = user && (
    normalizedRole === ROLES.ADMIN || 
    normalizedRole === ROLES.LANDLORD || 
    (normalizedRole === ROLES.USER && tenantViewVal !== 'MARKET' && hopDongCuaToi && (hopDongCuaToi.trangThai === 'DA_DUYET' || hopDongCuaToi.trangThai === 'YEU_CAU_HUY'))
  );

  const renderContent = () => {
    if (normalizedRole === ROLES.ADMIN) {
      return (
        <AdminPage 
          currentUser={user} 
          unreadSenderIds={unreadSenderIds} 
          setUnreadSenderIds={setUnreadSenderIds} 
          onSetChatTarget={setChatTarget}
          onLogout={logout}
        />
      );
    }
    if (normalizedRole === ROLES.LANDLORD) {
      return (
        <LandlordPage 
          currentUser={user} 
          unreadSenderIds={unreadSenderIds} 
          setUnreadSenderIds={setUnreadSenderIds} 
          onSetChatTarget={setChatTarget}
          onLogout={logout}
        />
      );
    }

    if (normalizedRole === ROLES.USER) {
      if (dangKiemTra && !hopDongCuaToi) {
        return (
          <div style={{ textAlign: 'center', padding: '60px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              width: '24px', height: '24px', border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
            }} />
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('app.syncing_data')}</div>
          </div>
        );
      }

      const tt = hopDongCuaToi?.trangThai;
      if (tt === 'DA_DUYET' || tt === 'YEU_CAU_HUY') {
        if (tenantViewVal === 'MARKET') {
          return (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setTenantView('DASHBOARD')}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {t('tenant.back_to_dashboard')}
                </button>
              </div>
              <GuestPage 
                currentUser={user} 
                onRentSuccess={() => { setTenantView('DASHBOARD'); kiemTraHopDong(false); }} 
              />
            </div>
          );
        }
        return (
          <TenantPage 
            currentUser={user} 
            hopDongCuaToi={hopDongCuaToi} 
            onBrowseRooms={() => setTenantView('MARKET')} 
            unreadSenderIds={unreadSenderIds} 
            setUnreadSenderIds={setUnreadSenderIds} 
            onSetChatTarget={setChatTarget} 
            onLogout={logout}
          />
        );
      }
      
      // Instead of blocking, render GuestPage directly with pending information props
      return (
        <GuestPage 
          currentUser={user} 
          onRentSuccess={() => kiemTraHopDong(false)} 
          pendingHopDong={tt === 'CHO_DUYET' ? hopDongCuaToi : null}
          onCancelPending={handleCancelRequest}
          isCancelingPending={isCanceling}
          onOpenChatPending={handleOpenChat}
          unreadSenderIds={unreadSenderIds}
          setUnreadSenderIds={setUnreadSenderIds}
          onSetChatTarget={setChatTarget}
        />
      );
    }

    return (
      <div style={{
        textAlign: 'center', marginTop: '60px', padding: '20px 24px',
        background: 'var(--danger-light)', border: '1px solid #FECACA',
        borderRadius: 'var(--radius-lg)', color: 'var(--danger)', fontWeight: 600,
        maxWidth: '480px', margin: '60px auto',
      }}>
        {t('app.access_error', { role: rawRole })}
      </div>
    );
  };

  if (isDashboard) {
    return (
      <div className="dashboard-app-container">
        {dangKiemTra && (
          <div style={{
            position: 'fixed', top: '16px', right: '20px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '6px 14px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)',
            zIndex: 999, animation: 'fadeIn 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{
              width: '12px', height: '12px', border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
            {t('app.syncing')}
          </div>
        )}
        {renderContent()}
        <ChatBox 
          currentUser={user} 
          targetUser={chatTarget} 
          isOpen={!!chatTarget} 
          onClose={() => setChatTarget(null)} 
          onOpenChat={setChatTarget} 
          unreadSenderIds={unreadSenderIds}
          setUnreadSenderIds={setUnreadSenderIds}
        />
      </div>
    );
  }

  return (
    <div className="container app-layout">
      <Header user={user} onLogout={logout} />
      {dangKiemTra && (
        <div style={{
          position: 'fixed', top: '16px', right: '20px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '6px 14px', borderRadius: '999px',
          fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)',
          zIndex: 999, animation: 'fadeIn 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <div style={{
            width: '12px', height: '12px', border: '2px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
          {t('app.syncing')}
        </div>
      )}
      {renderContent()}
      <ChatBox 
        currentUser={user} 
        targetUser={chatTarget} 
        isOpen={!!chatTarget} 
        onClose={() => setChatTarget(null)} 
        onOpenChat={setChatTarget} 
        unreadSenderIds={unreadSenderIds}
        setUnreadSenderIds={setUnreadSenderIds}
      />
      <Footer />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <LoadingScreen message="Đang xác thực..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <LoadingScreen message="Đang xác thực phiên đăng nhập..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SmartRedirect() {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <NotFoundPage />;
}

function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.get('/tai-khoan/me')
        .then(userRes => {
          loginSuccess(token, userRes.data);
          navigate('/dashboard', { replace: true });
        })
        .catch(err => {
          console.error("OAuth2 login failed:", err);
          localStorage.removeItem('token');
          navigate('/login?error=oauth2_failed', { replace: true });
        });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [token, loginSuccess, navigate]);

  return <LoadingScreen message="Đang đăng nhập bằng tài khoản Google..." />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><HomePage /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
      <Route path="/app" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
}