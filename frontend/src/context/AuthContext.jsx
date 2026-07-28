import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const res = await api.get('/tai-khoan/me');
      setUser(res.data);
    } catch (err) {
      console.error('Lỗi phục hồi phiên đăng nhập:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();

    const handleAuthError = () => {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';     };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [fetchMe]);

  const loginSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';   };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, loginSuccess, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};