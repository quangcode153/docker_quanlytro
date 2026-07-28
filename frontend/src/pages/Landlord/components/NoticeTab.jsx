/**
 * NoticeTab.jsx — Tab Thông Báo
 * Component con của LandlordPage
 * Đăng thông báo mới + xem lịch sử thông báo
 */
import { useTranslation } from 'react-i18next';

export default function NoticeTab({
  thongBaos,
  tieuDeTB, setTieuDeTB,
  noiDungTB, setNoiDungTB,
  isSubmitting,
  onDangThongBao,
}) {
  const { t } = useTranslation();

  return (
    <div className="l-card" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* === Form đăng thông báo mới === */}
      <div className="l-section-title">📣 {t('landlord.post_new_notice')}</div>
      <form onSubmit={onDangThongBao} className="l-notice-form">
        <input
          className="l-form-input"
          placeholder={t('landlord.notice_title_ph')}
          value={tieuDeTB}
          onChange={e => setTieuDeTB(e.target.value)}
          required
          onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
          onInput={e => e.target.setCustomValidity('')}
          disabled={isSubmitting}
        />
        <textarea
          className="l-form-input"
          placeholder={t('landlord.notice_content_ph')}
          value={noiDungTB}
          onChange={e => setNoiDungTB(e.target.value)}
          required
          onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
          onInput={e => e.target.setCustomValidity('')}
          disabled={isSubmitting}
          style={{ minHeight: '100px', resize: 'vertical' }}
        />
        <div style={{ textAlign: 'right' }}>
          <button
            type="submit"
            className="l-btn l-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('landlord.btn_sending') : '📤 ' + t('landlord.btn_post_notice')}
          </button>
        </div>
      </form>

      {/* === Lịch sử thông báo === */}
      <div className="l-section-title">📜 {t('landlord.notice_history')}</div>
      {thongBaos.length === 0 ? (
        <div className="l-empty">
          <div className="l-empty__icon">📭</div>
          <div className="l-empty__text">{t('landlord.no_notices')}</div>
        </div>
      ) : (
        <div className="l-notice-list">
          {thongBaos.map((tb, i) => (
            <div
              key={tb.id}
              className="l-notice-item"
              style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeIn 0.35s ease both' }}
            >
              <div className="l-notice-item__title">{tb.tieuDe}</div>
              <div className="l-notice-item__content">{tb.noiDung}</div>
              <div className="l-notice-item__date">
                🕐 {tb.ngayDang ? new Date(tb.ngayDang).toLocaleString(t('landlord.date_locale') || 'vi-VN') : t('landlord.recently')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
