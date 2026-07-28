import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Store token first so api.get('/tai-khoan/me') interceptor will include it
      localStorage.setItem('token', token);

      api.get('/tai-khoan/me')
        .then(res => {
          loginSuccess(token, res.data);
          // Redirect to dashboard on success
          navigate('/dashboard', { replace: true });
        })
        .catch(err => {
          console.error("Lỗi lấy thông tin người dùng từ OAuth2:", err);
          localStorage.removeItem('token');
          setErrorMsg('Không thể khôi phục phiên đăng nhập Google!');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        });
    } else {
      setErrorMsg(error || 'Đăng nhập Google thất bại!');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [location, navigate, loginSuccess]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font)',
    }}>
      {errorMsg ? (
        <div style={{ textAlign: 'center', color: 'var(--danger)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>{errorMsg}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Đang chuyển hướng về trang đăng nhập...
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Đang đồng bộ phiên đăng nhập Google...
          </div>
        </div>
      )}
    </div>
  );
}
