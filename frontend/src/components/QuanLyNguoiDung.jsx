import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api'; 
function QuanLyNguoiDung() {
  const { t } = useTranslation();
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);   const [tabHienTai, setTabHienTai] = useState('ALL');

    const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tai-khoan/admin/danh-sach-tai-khoan');
            const usersData = res.data?.data || res.data || [];
      setDanhSachUser(usersData);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
      setError(t('admin_users.error_fetch'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

    const handleToggleLock = async (user) => {
    const confirmMsg = user.locked ? t('admin_users.confirm_unlock') : t('admin_users.confirm_lock');
    if (!window.confirm(`${confirmMsg} ${user.username}?`)) return;
    
    try {
            await api.put(`/tai-khoan/admin/${user.id}/toggle-lock`);
      
      const successMsg = user.locked ? t('admin_users.success_unlock') : t('admin_users.success_lock');
      alert(successMsg);
      
            setDanhSachUser(prev => prev.map(u => 
        u.id === user.id ? { ...u, locked: !u.locked } : u
      ));
    } catch (err) {
      const errorMsg = user.locked ? t('admin_users.error_unlock') : t('admin_users.error_lock');
      alert(errorMsg + (err.response?.data?.message || ""));
    }
  };

    const handleDeleteUser = async (user) => {
    const confirmMsg = t('admin_users.confirm_delete') || "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản";
    if (!window.confirm(`${confirmMsg} ${user.username}?`)) return;

    try {
      await api.delete(`/tai-khoan/admin/${user.id}`);
      alert(t('admin_users.success_delete') || "Đã xóa tài khoản thành công!");
      setDanhSachUser(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      const errorMsg = t('admin_users.error_delete') || "Lỗi khi xóa tài khoản: ";
      alert(errorMsg + (err.response?.data?.message || ""));
    }
  };

  const usersHienThi = danhSachUser.filter(user => {
    if (tabHienTai === 'ALL') return true;
    return user.role === tabHienTai;
  });

  const formatRoleText = (role) => {
    const roles = {
      'ROLE_ADMIN': t('admin_users.role_admin'),
      'ROLE_LANDLORD': t('admin_users.role_landlord'),
      'ROLE_USER': t('admin_users.role_user')
    };
    return roles[role] || role;
  };

    if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ color: '#7f8c8d', marginTop: '10px', fontWeight: 'bold' }}>{t('admin_users.syncing')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
        <p style={{ fontWeight: 'bold' }}>❌ {error}</p>
        <button onClick={fetchUsers} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px' }}>{t('admin_users.retry')}</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>{t('admin_users.title')}</h2>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
        {['ALL', 'ROLE_LANDLORD', 'ROLE_USER'].map(tab => (
          <button 
            key={tab}
            onClick={() => setTabHienTai(tab)}
            style={{ 
              padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: tabHienTai === tab ? (tab === 'ALL' ? '#34495e' : (tab === 'ROLE_LANDLORD' ? '#e67e22' : '#3498db')) : '#ecf0f1',
              color: tabHienTai === tab ? 'white' : '#7f8c8d',
              transition: 'all 0.3s'
            }}>
            {tab === 'ALL' ? t('admin_users.tab_all') : formatRoleText(tab)} ({tab === 'ALL' ? danhSachUser.length : danhSachUser.filter(u => u.role === tab).length})
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #bdc3c7' }}>
              <th style={{ padding: '12px' }}>{t('admin_users.col_id')}</th>
              <th style={{ padding: '12px' }}>{t('admin_users.col_username')}</th>
              <th style={{ padding: '12px' }}>{t('admin_users.col_fullname')}</th>
              <th style={{ padding: '12px' }}>{t('admin_users.col_role')}</th>
              <th style={{ padding: '12px' }}>{t('admin_users.col_action')}</th>
            </tr>
          </thead>
          <tbody>
            {usersHienThi.map((user, index) => (
                            <tr key={user.id} style={{ 
                borderBottom: '1px solid #ecf0f1', 
                backgroundColor: user.locked ? '#f1f2f6' : (index % 2 === 0 ? '#fff' : '#f9fbfc'),
                opacity: user.locked ? 0.6 : 1,
                transition: 'all 0.2s'
              }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>#{user.id}</td>
                <td style={{ padding: '12px' }}>
                  {user.username} {user.locked && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{t('admin_users.locked_status')}</span>}
                </td>
                <td style={{ padding: '12px' }}>{user.hoTen || <span style={{color: '#bdc3c7', fontStyle: 'italic'}}>{t('admin_users.not_updated')}</span>}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: user.role === 'ROLE_ADMIN' ? '#e74c3c' : user.role === 'ROLE_LANDLORD' ? '#e67e22' : '#3498db',
                    color: 'white'
                  }}>
                    {formatRoleText(user.role)}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {user.role !== 'ROLE_ADMIN' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleLock(user)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: user.locked ? '#2ecc71' : '#e67e22', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          fontWeight: 'bold',
                          transition: 'background-color 0.2s'
                        }}>
                        {user.locked ? t('admin_users.btn_unlock') : t('admin_users.btn_lock')}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          fontWeight: 'bold',
                          transition: 'background-color 0.2s'
                        }}>
                        🗑️ {t('admin_users.btn_delete') || 'Xóa'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {usersHienThi.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#95a5a6' }}>{t('admin_users.no_users')}</div>
      )}
    </div>
  );
}

export default QuanLyNguoiDung;