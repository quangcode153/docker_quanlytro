/**
 * AdminContactTab.jsx — Tab Liên hệ dành cho Admin
 * Admin có thể xem danh sách tất cả Chủ trọ và Khách thuê trong hệ thống để nhắn tin trao đổi trực tiếp.
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

export default function AdminContactTab({ onSetChatTarget, unreadSenderIds = [] }) {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('LANDLORD'); // 'LANDLORD' or 'TENANT'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Tải tối đa 1000 người dùng để đảm bảo không bị sót do phân trang mặc định
      const res = await api.get('/tai-khoan/admin/danh-sach-tai-khoan?size=1000');
      const usersData = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setUsers(usersData);
    } catch (err) {
      console.error("Lỗi fetch users cho Admin chat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Phân loại người dùng
  const landlords = users.filter(u => u.role === 'ROLE_LANDLORD');
  const tenants = users.filter(u => u.role === 'ROLE_USER');

  // Lọc theo từ khóa tìm kiếm
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(u => 
      (u.username || '').toLowerCase().includes(query) || 
      (u.hoTen || '').toLowerCase().includes(query)
    );
  };

  const currentList = activeSubTab === 'LANDLORD' ? filterList(landlords) : filterList(tenants);

  // Kiểm tra tin nhắn chưa đọc
  const hasLandlordUnread = landlords.some(u => unreadSenderIds.some(id => String(id) === String(u.id)));
  const hasTenantUnread = tenants.some(u => unreadSenderIds.some(id => String(id) === String(u.id)));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: '24px', height: '24px', border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '24px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>💬 {t('admin.contact_system_list')}</span>
      </div>

      {/* Sub tabs switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveSubTab('LANDLORD')}
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'LANDLORD' ? 'var(--text-primary)' : 'transparent',
            color: activeSubTab === 'LANDLORD' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          💼 {t('admin.contact_landlords')} ({landlords.length})
          {hasLandlordUnread && (
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulseDot 1.2s infinite'
            }} />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('TENANT')}
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'TENANT' ? 'var(--text-primary)' : 'transparent',
            color: activeSubTab === 'TENANT' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          👤 {t('admin.contact_tenants_label')} ({tenants.length})
          {hasTenantUnread && (
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulseDot 1.2s infinite'
            }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {/* Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={activeSubTab === 'LANDLORD' ? t('admin.search_landlord') : t('admin.search_tenant')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color var(--transition)'
          }}
        />
      </div>

      {currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
          <div>{t('admin.no_user_found')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {currentList.map((user, i) => {
            const isUnread = unreadSenderIds.some(id => String(id) === String(user.id));
            const displayName = user.hoTen || user.username;
            const initials = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={user.id}
                onClick={() => onSetChatTarget({ id: user.id, username: displayName })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  background: 'var(--bg)',
                  border: isUnread ? '2px solid var(--danger)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  animation: `fadeIn 0.25s ease ${i * 0.03}s both`,
                  boxShadow: isUnread ? '0 0 12px rgba(239, 68, 68, 0.12)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isUnread ? 'var(--danger)' : 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isUnread ? 'var(--danger)' : 'var(--border-light)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  flexShrink: 0
                }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    @{user.username}
                  </div>
                </div>

                {/* Chat Button / Unread Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {isUnread && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--danger)',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'pulseDot 1.2s infinite'
                    }} />
                  )}
                  <span style={{ fontSize: '16px' }}>💬</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
