/**
 * UtilityTab.jsx — Tab Chốt Điện Nước
 * Component con của LandlordPage
 * Hiển thị danh sách phòng đã có hợp đồng + mở modal chốt số
 */
import { useTranslation } from 'react-i18next';

const CONTRACT_STATUS = { APPROVED: 'DA_DUYET' };

export default function UtilityTab({ hopDongs, onMoChotSo }) {
  const { t } = useTranslation();

  const approvedContracts = hopDongs.filter(hd => hd.trangThai === CONTRACT_STATUS.APPROVED);

  return (
    <div className="l-card" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="l-section-title">⚡ {t('landlord.bill_record_title')}</div>

      {approvedContracts.length === 0 ? (
        <div className="l-empty">
          <div className="l-empty__icon">🏘️</div>
          <div className="l-empty__text">{t('landlord.no_rented_rooms')}</div>
        </div>
      ) : (
        <div className="l-room-grid">
          {approvedContracts.map((hd, i) => (
            <div
              key={hd.id}
              className="l-invoice-card"
              style={{
                animationDelay: `${i * 0.05}s`,
                animation: 'fadeIn 0.35s ease both',
                borderTop: '3px solid var(--accent)',
              }}
            >
              {/* Header phòng */}
              <div className="l-invoice-card__header">
                <div>
                  <div className="l-invoice-card__room">🏠 {hd.phongTro?.tenPhong}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('landlord.guest_label')} {hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || t('landlord.not_updated')}
                  </div>
                </div>
                <span className="l-tag l-tag--blue">
                   {hd.phongTro?.giaPhong?.toLocaleString()} {t('landlord.currency')}
                </span>
              </div>

              <button
                className="l-btn l-btn--primary l-btn--full"
                onClick={() => onMoChotSo(hd)}
              >
                📊 {t('landlord.btn_record_bill')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
