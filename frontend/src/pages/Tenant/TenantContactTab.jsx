/**
 * TenantContactTab.jsx — Tab Liên hệ dành cho Khách thuê
 * Khách thuê có thể nhắn tin cho Quản trị viên (Admin) hoặc các Chủ trọ họ đã từng làm việc/liên hệ.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

export default function TenantContactTab({ currentUser, hopDongCuaToi, adminContact, onSetChatTarget, unreadSenderIds = [] }) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      const list = [];
      const addedIds = new Set();

      // 1. Thêm Quản trị viên (Admin) vào danh sách liên hệ
      const adminId = adminContact?.id || 3;
      if (!addedIds.has(adminId)) {
        addedIds.add(adminId);
        list.push({
          id: adminId,
          hoTen: adminContact?.hoTen || adminContact?.username || 'Admin',
          username: adminContact?.username || 'admin',
          role: 'ROLE_ADMIN',
          tagKey: 'tag_system'
        });
      }

      // 2. Thêm Chủ trọ hiện tại (từ hợp đồng)
      const landlordId = hopDongCuaToi?.phongTro?.chuTroId || hopDongCuaToi?.phongTro?.chuTro?.id;
      if (landlordId && !addedIds.has(landlordId)) {
        addedIds.add(landlordId);
        let landlordDetail = {
          id: landlordId,
          hoTen: hopDongCuaToi?.phongTro?.chuTro?.hoTen || t('tenant.landlord') || 'Landlord',
          username: hopDongCuaToi?.phongTro?.chuTro?.username || 'landlord',
          role: 'ROLE_LANDLORD',
          tagKey: 'tag_current_landlord'
        };
        // Thử fetch thông tin chi tiết
        try {
          const res = await api.get(`/tai-khoan/chu-tro/${landlordId}/chi-tiet`);
          if (res.data) {
            landlordDetail.hoTen = res.data.hoTen || landlordDetail.hoTen;
            landlordDetail.soDienThoai = res.data.soDienThoai;
          }
        } catch (e) {
          console.warn("Cannot load current landlord details:", e);
        }
        list.push(landlordDetail);
      }

      // 3. Thêm các chủ trọ khác đã liên hệ lưu trong localStorage
      if (currentUser?.id) {
        let savedIds = [];
        try {
          savedIds = JSON.parse(localStorage.getItem(`tenant_chat_contacts_${currentUser.id}`) || '[]');
        } catch (e) {
          savedIds = [];
        }

        // Tự động thêm các ID từ unreadSenderIds vào danh sách liên hệ
        unreadSenderIds.forEach(id => {
          const numId = Number(id);
          if (numId && !addedIds.has(numId) && !savedIds.includes(numId)) {
            savedIds.push(numId);
          }
        });

        // Lưu ngược lại localStorage
        localStorage.setItem(`tenant_chat_contacts_${currentUser.id}`, JSON.stringify(savedIds));

        for (const id of savedIds) {
          if (!addedIds.has(id)) {
            addedIds.add(id);
            let contactDetail = {
              id: id,
              hoTen: `ID ${id}`,
              username: `host_${id}`,
              role: 'ROLE_LANDLORD',
              tagKey: 'tag_old_contact'
            };

            // Thử fetch thông tin chi tiết
            try {
              const res = await api.get(`/tai-khoan/chu-tro/${id}/chi-tiet`);
              if (res.data) {
                contactDetail.hoTen = res.data.hoTen || contactDetail.hoTen;
                contactDetail.soDienThoai = res.data.soDienThoai;
              }
            } catch (e) {
              // Nếu không phải ROLE_LANDLORD, có thể là khách hàng khác (vãng lai)
              try {
                const resCustomer = await api.get(`/khach-hang/chi-tiet/${id}`);
                if (resCustomer.data) {
                  contactDetail.hoTen = resCustomer.data.hoTen || contactDetail.hoTen;
                  contactDetail.role = 'ROLE_USER';
                  contactDetail.tagKey = 'tag_contact';
                }
              } catch (innerE) {
                console.warn(`Cannot load account info for ID ${id}:`, innerE);
              }
            }
            list.push(contactDetail);
          }
        }
      }

      setContacts(list);
      setLoading(false);
    };

    loadContacts();
  }, [currentUser, hopDongCuaToi, adminContact, unreadSenderIds]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: '24px', height: '24px', border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('tenant.loading_contacts')}</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
        💬 {t('tenant.my_contacts_list')}
      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
          <div>{t('tenant.no_contacts')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {contacts.map((contact, i) => {
            const isUnread = unreadSenderIds.some(id => String(id) === String(contact.id));
            const initials = contact.hoTen.charAt(0).toUpperCase();

            return (
              <div
                key={contact.id}
                onClick={() => onSetChatTarget({ id: contact.id, username: contact.hoTen })}
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
                  background: contact.role === 'ROLE_ADMIN' ? 'var(--warning-light)' : 'var(--accent-light)',
                  color: contact.role === 'ROLE_ADMIN' ? 'var(--warning)' : 'var(--accent)',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {contact.hoTen}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: contact.role === 'ROLE_ADMIN' ? 'var(--warning-light)' : 'var(--accent-light)',
                      color: contact.role === 'ROLE_ADMIN' ? 'var(--warning)' : 'var(--accent)',
                      fontWeight: 600
                    }}>
                      {t(`tenant.${contact.tagKey}`)}
                    </span>
                  </div>
                  {contact.soDienThoai && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📞 {contact.soDienThoai}
                    </div>
                  )}
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
