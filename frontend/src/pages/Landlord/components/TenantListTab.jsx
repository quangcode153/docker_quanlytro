/**
 * TenantListTab.jsx — Danh sách khách thuê chia làm 2 phần:
 * 1. Khách đã thuê trọ (đang hoạt động)
 * 2. Khách chưa thuê trọ (đang chờ duyệt, từ chối, hủy, hoặc liên hệ vãng lai)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api';

const CONTRACT_STATUS = {
  APPROVED: 'DA_DUYET',
  PENDING: 'CHO_DUYET',
  REJECTED: 'TU_CHOI',
  CANCELLING: 'YEU_CAU_HUY',
  CANCELLED: 'HUY'
};

export default function TenantListTab({ currentUser, hopDongs = [], onSetChatTarget, unreadSenderIds = [] }) {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('RENTED'); // 'RENTED' or 'PROSPECTIVE'
  const [fetchedProfiles, setFetchedProfiles] = useState({});
  const [contactList, setContactList] = useState([]);

  // 1. Phân loại khách đã thuê trọ (có hợp đồng đang hoạt động DA_DUYET)
  const rentedTenants = [];
  const rentedUserIds = new Set();

  hopDongs.forEach(hd => {
    if (hd.trangThai === CONTRACT_STATUS.APPROVED && hd.khachHang?.id) {
      const uId = hd.khachHang.id;
      if (!rentedUserIds.has(uId)) {
        rentedUserIds.add(uId);
        rentedTenants.push({
          userId: uId,
          hoTen: hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || t('landlord.not_updated'),
          username: hd.khachHang?.username,
          sdt: hd.khachHang?.khachHang?.soDienThoai || '',
          phongTen: hd.phongTro?.tenPhong || '—',
          ngayBatDau: hd.ngayBatDau,
          trangThaiHopDong: hd.trangThai,
          hopDongId: hd.id
        });
      }
    }
  });

  // 2. Lưu trữ các liên hệ vãng lai từ unreadSenderIds vào localStorage để không bị mất khi F5
  useEffect(() => {
    if (!currentUser?.id) return;
    const key = `landlord_chat_contacts_${currentUser.id}`;
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      saved = [];
    }
    
    let updated = [...saved];
    let changed = false;
    unreadSenderIds.forEach(id => {
      const numId = Number(id);
      if (numId && !updated.includes(numId)) {
        updated.push(numId);
        changed = true;
      }
    });
    
    if (changed) {
      localStorage.setItem(key, JSON.stringify(updated));
    }
    setContactList(updated);
  }, [unreadSenderIds, currentUser?.id]);

  // Tải thông tin hồ sơ cho các ID liên hệ vãng lai hoặc chưa có trong danh sách hợp đồng
  useEffect(() => {
    const fetchUnknownProfiles = async () => {
      const neededIds = new Set();
      
      // Thu thập tất cả các ID từ liên hệ trong localStorage
      contactList.forEach(id => {
        if (!rentedUserIds.has(id) && !fetchedProfiles[id]) {
          neededIds.add(id);
        }
      });

      // Thu thập các ID từ unreadSenderIds
      unreadSenderIds.forEach(id => {
        const numId = Number(id);
        if (numId && !rentedUserIds.has(numId) && !fetchedProfiles[numId]) {
          neededIds.add(numId);
        }
      });

      if (neededIds.size === 0) return;

      const updated = { ...fetchedProfiles };
      let hasChange = false;

      for (const id of neededIds) {
        try {
          const res = await api.get(`/khach-hang/chi-tiet/${id}`);
          if (res.data) {
            updated[id] = {
              hoTen: res.data.hoTen || res.data.username || `ID ${id}`,
              sdt: res.data.soDienThoai || '',
              email: res.data.email || ''
            };
            hasChange = true;
          }
        } catch (err) {
          // Thất bại do phân quyền hoặc lỗi mạng -> dùng fallback
          updated[id] = {
            hoTen: `ID ${id}`,
            sdt: '',
            email: ''
          };
          hasChange = true;
        }
      }

      if (hasChange) {
        setFetchedProfiles(updated);
      }
    };

    fetchUnknownProfiles();
  }, [contactList, unreadSenderIds, rentedUserIds, fetchedProfiles]);

  // 3. Phân loại khách chưa thuê trọ (không có hợp đồng DA_DUYET, nhưng có hợp đồng khác HOẶC nhắn tin)
  const prospectiveTenants = [];
  const prospectiveUserIds = new Set();

  // Thêm từ danh sách hợp đồng (các trạng thái khác DA_DUYET)
  hopDongs.forEach(hd => {
    if (hd.trangThai !== CONTRACT_STATUS.APPROVED && hd.khachHang?.id) {
      const uId = hd.khachHang.id;
      if (!rentedUserIds.has(uId) && !prospectiveUserIds.has(uId)) {
        prospectiveUserIds.add(uId);
        prospectiveTenants.push({
          userId: uId,
          hoTen: hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || t('landlord.not_updated'),
          username: hd.khachHang?.username,
          sdt: hd.khachHang?.khachHang?.soDienThoai || '',
          phongTen: hd.phongTro?.tenPhong || '—',
          ngayBatDau: hd.ngayBatDau,
          trangThaiHopDong: hd.trangThai,
          hopDongId: hd.id
        });
      }
    }
  });

  // Thêm từ danh sách tin nhắn vãng lai (trong localStorage hoặc unreadSenderIds)
  const allMessageIds = Array.from(new Set([...contactList, ...unreadSenderIds.map(Number)]));
  allMessageIds.forEach(id => {
    if (id && !rentedUserIds.has(id) && !prospectiveUserIds.has(id)) {
      prospectiveUserIds.add(id);
      const profile = fetchedProfiles[id] || {};
      prospectiveTenants.push({
        userId: id,
        hoTen: profile.hoTen || `ID ${id}`,
        username: `user_${id}`,
        sdt: profile.sdt || '',
        phongTen: '—',
        ngayBatDau: null,
        trangThaiHopDong: null,
        hopDongId: null
      });
    }
  });

  // Xác định xem tab nào có tin nhắn chưa đọc
  const hasRentedUnread = rentedTenants.some(t => unreadSenderIds.some(id => String(id) === String(t.userId)));
  const hasProspectiveUnread = prospectiveTenants.some(t => unreadSenderIds.some(id => String(id) === String(t.userId)));

  const currentDisplayList = activeSubTab === 'RENTED' ? rentedTenants : prospectiveTenants;

  const getStatusBadge = (status) => {
    if (!status) return <span style={{ color: 'var(--text-muted)' }}>💬 {t('landlord.contact_label')}</span>;
    switch (status) {
      case CONTRACT_STATUS.PENDING:
        return <span style={{ color: 'var(--warning)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>⏳ {t('landlord.status_pending_contract')}</span>;
      case CONTRACT_STATUS.REJECTED:
        return <span style={{ color: 'var(--danger)', background: 'var(--danger-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>❌ {t('landlord.status_rejected_contract')}</span>;
      case CONTRACT_STATUS.CANCELLING:
        return <span style={{ color: 'var(--warning)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>⏳ {t('landlord.status_cancelling_contract')}</span>;
      case CONTRACT_STATUS.CANCELLED:
        return <span style={{ color: 'var(--text-muted)', background: 'var(--border-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🚪 {t('landlord.status_ended_contract')}</span>;
      default:
        return <span style={{ color: 'var(--text-muted)' }}>💬 {t('landlord.contact_label')}</span>;
    }
  };

  return (
    <div className="l-card" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="l-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span>💬 {t('landlord.contact_tenant_title')}</span>
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
          onClick={() => setActiveSubTab('RENTED')}
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'RENTED' ? 'var(--text-primary)' : 'transparent',
            color: activeSubTab === 'RENTED' ? '#fff' : 'var(--text-muted)',
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
          🏘️ {t('landlord.rented_tenants')} ({rentedTenants.length})
          {hasRentedUnread && (
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
          onClick={() => setActiveSubTab('PROSPECTIVE')}
          style={{
            padding: '8px 16px',
            background: activeSubTab === 'PROSPECTIVE' ? 'var(--text-primary)' : 'transparent',
            color: activeSubTab === 'PROSPECTIVE' ? '#fff' : 'var(--text-muted)',
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
          💬 {t('landlord.prospective_tenants')} ({prospectiveTenants.length})
          {hasProspectiveUnread && (
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

      {currentDisplayList.length === 0 ? (
        <div className="l-empty">
          <div className="l-empty__icon">👤</div>
          <div className="l-empty__text">
            {activeSubTab === 'RENTED' ? t('landlord.no_rented_tenants') : t('landlord.no_prospective_tenants')}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentDisplayList.map((tenant, i) => {
            const initials = tenant.hoTen.charAt(0).toUpperCase();
            const isUnread = unreadSenderIds.some(id => String(id) === String(tenant.userId));
            return (
              <div
                key={tenant.userId + '-' + i}
                onClick={() => onSetChatTarget({ id: tenant.userId, username: tenant.hoTen })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px',
                  background: 'var(--bg)', 
                  border: isUnread ? '2px solid var(--danger)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  boxShadow: isUnread ? '0 0 12px rgba(239, 68, 68, 0.12)' : 'none',
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
                  width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px',
                }}>
                  {initials}
                </div>

                {/* Thông tin */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tenant.hoTen}
                    </span>
                    {activeSubTab === 'PROSPECTIVE' && getStatusBadge(tenant.trangThaiHopDong)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {tenant.phongTen !== '—' && <span>🏠 {tenant.phongTen}</span>}
                    {tenant.sdt && <span>📞 {tenant.sdt}</span>}
                    {tenant.ngayBatDau && <span>📅 {t('landlord.since')} {tenant.ngayBatDau}</span>}
                  </div>
                </div>

                {/* Nút chat */}
                <button
                  className="l-btn l-btn--primary"
                  style={{ 
                    fontSize: '12px', 
                    padding: '7px 14px', 
                    flexShrink: 0,
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid double trigger
                    onSetChatTarget({ id: tenant.userId, username: tenant.hoTen });
                  }}
                >
                  💬 {t('landlord.btn_message')}
                  {isUnread && (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
