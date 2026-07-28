/**
 * ContractTab.jsx — Tab Quản lý Hợp đồng (Duyệt & Xem lịch sử)
 * Component con của LandlordPage
 */
import { useTranslation } from 'react-i18next';

const CONTRACT_STATUS = {
  PENDING: 'CHO_DUYET',
  APPROVED: 'DA_DUYET',
  REJECTED: 'TU_CHOI',
  CANCELLING: 'YEU_CAU_HUY',
  CANCELLED: 'HUY'
};

export default function ContractTab({
  hopDongs,
  onDuyetHopDong,
  onXemHopDong,
  onSetChatTarget,
  onXemHoSo,
  onRefresh,
}) {
  const { t } = useTranslation();

  const pendingList = hopDongs.filter(hd => hd.trangThai === CONTRACT_STATUS.PENDING);
  const cancellingList = hopDongs.filter(hd => hd.trangThai === CONTRACT_STATUS.CANCELLING);
  const activeList = hopDongs.filter(hd => hd.trangThai === CONTRACT_STATUS.APPROVED);

  const renderContractItem = (hd, i, mode = 'NORMAL') => {
    const isPending = mode === 'PENDING';
    const isCancelling = mode === 'CANCELLING';
    const tenKhach = hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || t('landlord.not_updated');
    const sdt = hd.khachHang?.khachHang?.soDienThoai || t('landlord.no_phone');
    const initials = tenKhach.charAt(0).toUpperCase();

    return (
      <div
        key={hd.id}
        className="l-request-item"
        style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeIn 0.35s ease both' }}
      >
        <div className="l-request-item__avatar">{initials}</div>

        <div className="l-request-item__info">
          <div className="l-request-item__name">{tenKhach}</div>
          <div className="l-request-item__phone">{sdt}</div>
        </div>

        <div className="l-request-item__room">
          <div className="l-request-item__room-name">{hd.phongTro?.tenPhong}</div>
          <div className="l-request-item__date">{t('landlord.start_label')}: {hd.ngayBatDau}</div>
          {hd.tienCoc != null && (
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
              {t('landlord.deposit_label')}: {hd.tienCoc.toLocaleString()} {t('landlord.currency')}
            </div>
          )}
        </div>

        <div className="l-request-item__actions">
          <button
            className="l-btn"
            onClick={() => onXemHoSo(hd)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            👤 {t('landlord.btn_profile')}
          </button>

          {isPending && (
            <>
              <button
                className="l-btn l-btn--success"
                onClick={() => onXemHopDong && onXemHopDong(hd)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📄 {t('landlord.view_approve')}
              </button>
              <button
                className="l-btn l-btn--danger"
                onClick={() => onDuyetHopDong(hd.id, CONTRACT_STATUS.REJECTED)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                ✕ {t('landlord.btn_reject')}
              </button>
            </>
          )}

          {isCancelling && (
            <>
              <button
                className="l-btn l-btn--danger"
                onClick={() => onDuyetHopDong(hd.id, CONTRACT_STATUS.CANCELLED)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                ✅ {t('landlord.btn_accept_cancel') || 'Đồng ý hủy'}
              </button>
              <button
                className="l-btn l-btn--primary"
                onClick={() => onDuyetHopDong(hd.id, CONTRACT_STATUS.APPROVED)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                ✕ {t('landlord.btn_keep_contract') || 'Giữ lại HĐ'}
              </button>
            </>
          )}

          {mode === 'NORMAL' && (
            <>
              <button
                className="l-btn l-btn--primary"
                onClick={() => onSetChatTarget({ id: hd.khachHang.id, username: tenKhach })}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {t('landlord.btn_chat')}
              </button>
              <button
                className="l-btn l-btn--success"
                onClick={() => onXemHopDong && onXemHopDong(hd)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📄 {t('tenant.btn_view_contract')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>

      {/* SECTION: Yêu cầu thuê phòng */}
      <div className="l-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <div className="l-section-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            📋 {t('landlord.request_title')}
            {pendingList.length > 0 && (
              <span className="landlord-nav-bar__badge" style={{ marginLeft: '8px' }}>
                {pendingList.length}
              </span>
            )}
          </div>
          <button className="l-btn" onClick={onRefresh}>🔄 {t('landlord.btn_refresh')}</button>
        </div>

        {pendingList.length === 0 ? (
          <div className="l-empty" style={{ padding: '24px 0' }}>
            <div className="l-empty__icon">✅</div>
            <div className="l-empty__text">{t('landlord.no_requests')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingList.map((hd, i) => renderContractItem(hd, i, 'PENDING'))}
          </div>
        )}
      </div>

      {/* SECTION: Yêu cầu hủy hợp đồng */}
      <div className="l-card" style={{ marginBottom: 0, borderColor: 'var(--danger-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <div className="l-section-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none', color: 'var(--danger)' }}>
            🚫 {t('tenant.status_cancelling')}
            {cancellingList.length > 0 && (
              <span className="landlord-nav-bar__badge" style={{ marginLeft: '8px', background: 'var(--danger)' }}>
                {cancellingList.length}
              </span>
            )}
          </div>
        </div>

        {cancellingList.length === 0 ? (
          <div className="l-empty" style={{ padding: '24px 0' }}>
            <div className="l-empty__icon">🛡️</div>
            <div className="l-empty__text">{t('landlord.no_requests')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cancellingList.map((hd, i) => renderContractItem(hd, i, 'CANCELLING'))}
          </div>
        )}
      </div>

      {/* SECTION: Hợp đồng đang hiệu lực */}
      <div className="l-card">
        <div className="l-section-title">✍️ {t('tenant.tab_contract')} ({activeList.length})</div>

        {activeList.length === 0 ? (
          <div className="l-empty" style={{ padding: '24px 0' }}>
            <div className="l-empty__icon">📑</div>
            <div className="l-empty__text">{t('landlord.no_tenants')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeList.map((hd, i) => renderContractItem(hd, i, 'NORMAL'))}
          </div>
        )}
      </div>

    </div>
  );
}
