/**
 * UtilityModal.jsx — Modal Chốt Chỉ Số Điện Nước
 * Component con của LandlordPage
 * Xử lý form nhập chỉ số và hiển thị lịch sử
 */
import { useTranslation } from 'react-i18next';

export default function UtilityModal({
  dienNuocForm,
  formDN,
  setFormDN,
  lichSuChiSo,
  isSubmitting,
  onSubmit,
  onClose,
}) {
  const { t } = useTranslation();
  if (!dienNuocForm) return null;

  return (
    <div className="l-modal-overlay">
      <div className="l-modal l-modal--sm">
        {/* Header */}
        <div className="l-modal__header">
          <div>
            <div className="l-modal__title">
              ⚡ {dienNuocForm.isUpdate ? t('landlord.btn_update_number') : t('landlord.bill_modal_title')}
            </div>
            <div className="l-modal__subtitle">🏠 {dienNuocForm.tenPhong}</div>
          </div>
          <button className="l-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Body / Form */}
        <form onSubmit={onSubmit}>
          <div className="l-modal__body">
            {/* Tháng / Năm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className="l-form-label">{t('landlord.month')}</label>
                <input
                  type="number"
                  className="l-form-input"
                  value={formDN.thang}
                  onChange={e => setFormDN({ ...formDN, thang: e.target.value })}
                  required min="1" max="12"
                  onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                  onInput={e => e.target.setCustomValidity('')}
                  disabled={dienNuocForm.isUpdate}
                />
              </div>
              <div>
                <label className="l-form-label">{t('landlord.year')}</label>
                <input
                  type="number"
                  className="l-form-input"
                  value={formDN.nam}
                  onChange={e => setFormDN({ ...formDN, nam: e.target.value })}
                  required min="2000"
                  onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                  onInput={e => e.target.setCustomValidity('')}
                  disabled={dienNuocForm.isUpdate}
                />
              </div>
            </div>

            {/* Chỉ số Điện */}
            <div className="l-meter-group">
              <div className="l-meter-group__title">⚡ {t('landlord.electric_index')}</div>
              <div className="l-meter-group__inputs">
                <div>
                  <label className="l-form-label">{t('landlord.old_index')}</label>
                  <input
                    type="text"
                    className="l-form-input"
                    value={formDN.chiSoDauDien}
                    onChange={e => setFormDN({ ...formDN, chiSoDauDien: e.target.value.replace(/\D/g, '') })}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                </div>
                <div>
                  <label className="l-form-label">{t('landlord.new_index')}</label>
                  <input
                    type="text"
                    className="l-form-input"
                    value={formDN.chiSoCuoiDien}
                    onChange={e => setFormDN({ ...formDN, chiSoCuoiDien: e.target.value.replace(/\D/g, '') })}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                </div>
              </div>
            </div>

            {/* Chỉ số Nước */}
            <div className="l-meter-group">
              <div className="l-meter-group__title">💧 {t('landlord.water_index')}</div>
              <div className="l-meter-group__inputs">
                <div>
                  <label className="l-form-label">{t('landlord.old_index')}</label>
                  <input
                    type="text"
                    className="l-form-input"
                    value={formDN.chiSoDauNuoc}
                    onChange={e => setFormDN({ ...formDN, chiSoDauNuoc: e.target.value.replace(/\D/g, '') })}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                </div>
                <div>
                  <label className="l-form-label">{t('landlord.new_index')}</label>
                  <input
                    type="text"
                    className="l-form-input"
                    value={formDN.chiSoCuoiNuoc}
                    onChange={e => setFormDN({ ...formDN, chiSoCuoiNuoc: e.target.value.replace(/\D/g, '') })}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                </div>
              </div>
            </div>

            {/* Lịch sử chỉ số */}
            {lichSuChiSo.length > 0 && (
              <div>
                <div className="l-section-title" style={{ fontSize: '13px', marginBottom: '10px' }}>
                  📋 {t('landlord.recent_bill_history')}
                </div>
                <div className="l-history-table-wrap">
                  <table className="l-history-table">
                    <thead>
                      <tr>
                        <th>{t('landlord.month')}</th>
                        <th>{t('landlord.electric_cm')}</th>
                        <th>{t('landlord.water_cm')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lichSuChiSo.map(ls => (
                        <tr key={`${ls.thang}-${ls.nam}`}>
                          <td>{ls.thang}/{ls.nam}</td>
                          <td style={{ textAlign: 'right' }}>{ls.soDienCu} → {ls.soDienMoi}</td>
                          <td style={{ textAlign: 'right' }}>{ls.soNuocCu} → {ls.soNuocMoi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="l-modal__footer">
            <button
              type="submit"
              className="l-btn l-btn--primary l-btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('landlord.btn_saving_bill')
                : (dienNuocForm.isUpdate ? '💾 ' + t('landlord.btn_update_export') : '💾 ' + t('landlord.btn_save_export_bill'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
