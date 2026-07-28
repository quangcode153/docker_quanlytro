import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import AdminPage from '../pages/AdminPage';
import LandlordPage from '../pages/LandlordPage';
import TenantPage from '../pages/TenantPage';
import { ROLES } from '../constants'; 

const AppContent = () => {
  const { user, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>⏳ Đang xác thực quyền truy cập...</div>;
  }

    if (!user) {
    return <Navigate to="/login" replace />;
  }

    const rawRole = user?.role || '';
  const normalizedRole = rawRole.startsWith('ROLE_')
    ? rawRole
    : `ROLE_${rawRole}`;

    if (!user?.id || !rawRole) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
        ⚠️ Lỗi dữ liệu: Tài khoản của bạn chưa được phân quyền hệ thống.
      </div>
    );
  }

    switch (normalizedRole) {
    case ROLES.ADMIN:
      return <AdminPage currentUser={user} />;
    case ROLES.LANDLORD:
      return <LandlordPage currentUser={user} />;
    case ROLES.USER:
      return <TenantPage currentUser={user} />;
    default:
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          ⚠️ Không tìm thấy giao diện phù hợp cho quyền: {rawRole}
        </div>
      );
  }
};

export default AppContent;