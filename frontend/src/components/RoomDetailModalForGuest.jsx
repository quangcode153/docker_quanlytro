import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ImageSlider from './ImageSlider';

const ROOM_STATUS = { EMPTY: 'TRONG', RENTED: 'DA_THUE', MAINTENANCE: 'BAO_TRI' };

export default function RoomDetailModalForGuest({
  phong,
  isOpen,
  onClose,
  onRent,
  onChat,
  isSubmitting = false,
}) {
  const { t } = useTranslation();
  const [hostInfo, setHostInfo] = useState(null);
  const [loadingHost, setLoadingHost] = useState(false);

  useEffect(() => {
    if (!phong || !phong.chuTroId || !isOpen) return;

    let isMounted = true;
    setLoadingHost(true);
    setHostInfo(null);

    api.get(`/tai-khoan/chu-tro/${phong.chuTroId}/chi-tiet`)
      .then(res => {
        if (isMounted) {
          setHostInfo(res.data);
        }
      })
      .catch(err => {
        console.error("Error fetching host details in guest modal:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingHost(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [phong?.chuTroId, isOpen]);

  if (!isOpen || !phong) return null;

  const displayName = hostInfo?.hoTen || hostInfo?.username || `${t('guest.host_name')} ID ${phong.chuTroId}`;

  return (
    <div className="guest-modal-overlay" onClick={onClose}>
      <div className="guest-modal guest-modal--md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="guest-modal__header">
          <div>
            <div className="guest-modal__title">🏠 {phong.tenPhong}</div>
            <div className="guest-modal__subtitle">{t('guest.host_label')} ID {phong.chuTroId}</div>
          </div>
          <button className="guest-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="guest-modal__body">
          {/* Images Slider */}
          <div style={{ marginBottom: '20px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <ImageSlider hinhAnh={phong.hinhAnh} alt={phong.tenPhong} height="220px" />
          </div>

          {/* Details Grid */}
          <div className="guest-room-detail-grid">
            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('guest.rent_price')}</div>
              <div className="guest-room-detail-cell__value" style={{ color: 'var(--success)' }}>
                {phong.giaPhong?.toLocaleString()} {t('guest.currency_month')}
              </div>
            </div>

            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('guest.room_status')}</div>
              <div className="guest-room-detail-cell__value">
                <span className={`guest-tag guest-tag--${phong.trangThai === ROOM_STATUS.EMPTY ? 'empty' : 'rented'}`}>
                  {phong.trangThai === ROOM_STATUS.EMPTY
                    ? t('guest.status_empty')
                    : phong.trangThai === ROOM_STATUS.RENTED
                      ? t('guest.status_rented')
                      : t('guest.status_maintenance')
                  }
                </span>
              </div>
            </div>

            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('guest.deposit')}</div>
              <div className="guest-room-detail-cell__value">
                {phong.tienCoc ? `${phong.tienCoc.toLocaleString()} Đ` : '—'}
              </div>
            </div>

            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('guest.area')}</div>
              <div className="guest-room-detail-cell__value">
                {phong.dienTich ? `${phong.dienTich} m²` : '—'}
              </div>
            </div>

            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('landlord.electric_price') || 'Tiền điện'}</div>
              <div className="guest-room-detail-cell__value">
                {phong.giaDien ? `${phong.giaDien.toLocaleString()} Đ` : '—'}
              </div>
            </div>

            <div className="guest-room-detail-cell">
              <div className="guest-room-detail-cell__label">{t('landlord.water_price') || 'Tiền nước'}</div>
              <div className="guest-room-detail-cell__value">
                {phong.giaNuoc ? `${phong.giaNuoc.toLocaleString()} Đ` : '—'}
              </div>
            </div>

            {phong.diaChi && (
              <div className="guest-room-detail-cell" style={{ gridColumn: '1 / -1' }}>
                <div className="guest-room-detail-cell__label">{t('guest.address')}</div>
                <div className="guest-room-detail-cell__value" style={{ fontWeight: 'normal', fontSize: '13px' }}>
                  📍 {phong.diaChi}
                </div>
              </div>
            )}

            {phong.moTa && (
              <div className="guest-room-detail-cell" style={{ gridColumn: '1 / -1', background: 'var(--bg)', border: '1px solid var(--border-light)' }}>
                <div className="guest-room-detail-cell__label">{t('guest.description')}</div>
                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {phong.moTa}
                </div>
              </div>
            )}
          </div>

          {/* Landlord Card */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '15px',
              }}>
                🏠
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('guest.host_info')}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {loadingHost ? t('common.loading') : displayName}
                </div>
                {!loadingHost && hostInfo && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    📞 {hostInfo.soDienThoai || t('guest.not_updated')}
                  </div>
                )}
              </div>
            </div>
            <button
              className="btn btn--outline"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => onChat({ id: phong.chuTroId, username: displayName })}
            >
              {t('guest.btn_chat')}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="guest-modal__footer">
          <button className="btn" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={onClose}>
            {t('landlord.btn_close')}
          </button>
          {phong.trangThai === ROOM_STATUS.EMPTY && (
            <button
              className="btn btn--primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
              onClick={() => onRent(phong)}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('guest.btn_processing') : t('guest.btn_rent')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
