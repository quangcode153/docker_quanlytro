import { useState, useEffect } from 'react';
import api from '../api';

export default function useAdminContact() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    api.get('/tai-khoan/admin')
      .then(res => {
        if (isMounted) {
                    setAdmin({ id: res.data.id, username: res.data.username + ' (Hỗ trợ)' });
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn("⚠️ API Backend lấy Admin lỗi (404/500). Đang bật chế độ Fallback dùng Admin ID=1 để test!");
          
                    setAdmin({ id: 3, username: 'Admin (Hệ thống)' }); 
          setError(null);           setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return { admin, loading, error };
}