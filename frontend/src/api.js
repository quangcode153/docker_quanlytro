import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const cleanToken = token.replace(/"/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
    console.log('[Interceptor] Authorization header set:', config.headers.Authorization);
  } else {
    console.warn('[Interceptor] No token found in localStorage');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || ''; 
    const isAuthRoute = window.location.pathname.includes('/login');

    if (!isAuthRoute) {
      if (status === 401) {
        window.dispatchEvent(new Event('auth-error'));
      }
      
      if (status === 403) {
        if (message.toLowerCase().includes('khóa')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert("🚫 Phiên làm việc bị hủy do tài khoản đã bị khóa bởi Quản trị viên!");
          window.location.href = '/login';
        } else {
          console.warn("⚠️ Bị từ chối truy cập (403):", message);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;