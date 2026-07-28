/**
 * RoomTab.jsx — Tab Quản lý Phòng Trọ
 * Component con của LandlordPage
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import emptyRoomsImg from '../../../assets/empty_rooms.png';
import roomPlaceholderImg from '../../../assets/room_placeholder.png';
import ImageSlider from '../../../components/ImageSlider';

const ROOM_STATUS = { EMPTY: 'TRONG', RENTED: 'DA_THUE', MAINTENANCE: 'BAO_TRI' };
const CONTRACT_STATUS = { APPROVED: 'DA_DU_YET', PENDING: 'CHO_DUYET' };

const toCleanDigits = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\D/g, '');
};

const formatThousand = (val) => {
  const digits = toCleanDigits(val);
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('en-US');
};

const toCleanFloat = (val) => {
  if (val === null || val === undefined) return '';
  const clean = String(val).replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return clean;
};

export default function RoomTab({
  phongTros,
  hopDongs,
  tenPhong, setTenPhong,
  giaPhong, setGiaPhong,
  trangThai, setTrangThai,
  giaDien, setGiaDien,
  giaNuoc, setGiaNuoc,
  tienCoc, setTienCoc,
  diaChi, setDiaChi,
  dienTich, setDienTich,
  hinhAnh, setHinhAnh,
  moTa, setMoTa,
  isSubmitting,
  onThemPhong,
  onXoaPhong,
  onXemChiTiet,
}) {
  const { t } = useTranslation();
  const [isCompressing, setIsCompressing] = useState(false);

  const tagColor = (tt) => {
    if (tt === ROOM_STATUS.EMPTY) return 'green';
    if (tt === ROOM_STATUS.RENTED) return 'red';
    return 'amber';
  };

  const tagLabel = (tt) => {
    return t(`landlord.room_status_${tt}`);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const base64Promises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 600;
              const MAX_HEIGHT = 600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              // Nén ảnh chất lượng nhẹ 0.5 để lưu nhiều ảnh an toàn (tránh lỗi 413 Payload Too Large)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
              resolve(dataUrl);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      });

      const base64Results = await Promise.all(base64Promises);
      setHinhAnh(base64Results.join('|||'));
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* === Form thêm phòng mới === */}
      <div className="l-card" style={{ marginBottom: '20px' }}>
        <div className="l-section-title">➕ {t('landlord.add_new_room')}</div>
        <form onSubmit={onThemPhong} className="l-add-room-form">
          <div className="l-add-room-form__field" style={{ flex: 2 }}>
            <label className="l-form-label">{t('landlord.room_name')}</label>
            <input
              className="l-form-input"
              type="text"
              value={tenPhong}
              onChange={e => setTenPhong(e.target.value)}
              placeholder={t('landlord.room_name_ph')}
              required
              onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
              onInput={e => e.target.setCustomValidity('')}
              disabled={isSubmitting}
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.price_vnd')}</label>
            <input
              className="l-form-input"
              type="number"
              min="0"
              value={giaPhong}
              onChange={e => setGiaPhong(e.target.value)}
              placeholder={t('landlord.room_price_ph')}
              required
              onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
              onInput={e => e.target.setCustomValidity('')}
              disabled={isSubmitting}
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.status')}</label>
            <select
              className="l-form-input"
              value={trangThai}
              onChange={e => setTrangThai(e.target.value)}
              disabled={isSubmitting}
            >
              <option value={ROOM_STATUS.EMPTY}>{t('landlord.room_status_TRONG')}</option>
              <option value={ROOM_STATUS.RENTED}>{t('landlord.room_status_DA_THUE')}</option>
              <option value={ROOM_STATUS.MAINTENANCE}>{t('landlord.room_status_BAO_TRI')}</option>
            </select>
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.electric_price')}</label>
            <input 
              className="l-form-input" 
              type="number" 
              min="0"
              value={giaDien} 
              onChange={e => setGiaDien(e.target.value)} 
              placeholder="3500" 
              disabled={isSubmitting} 
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.water_price')}</label>
            <input 
              className="l-form-input" 
              type="number" 
              min="0"
              value={giaNuoc} 
              onChange={e => setGiaNuoc(e.target.value)} 
              placeholder="100000" 
              disabled={isSubmitting} 
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.deposit')}</label>
            <input 
              className="l-form-input" 
              type="number" 
              min="0"
              value={tienCoc} 
              onChange={e => setTienCoc(e.target.value)} 
              placeholder="1000000" 
              disabled={isSubmitting} 
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 1 }}>
            <label className="l-form-label">{t('landlord.area')} (m²)</label>
            <input 
              className="l-form-input" 
              type="number" 
              step="any"
              min="0"
              value={dienTich} 
              onChange={e => setDienTich(e.target.value)} 
              placeholder="20" 
              disabled={isSubmitting} 
            />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 2 }}>
            <label className="l-form-label">{t('landlord.address')}</label>
            <input className="l-form-input" type="text" value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder={t('landlord.placeholder_address')} disabled={isSubmitting} />
          </div>
          <div className="l-add-room-form__field" style={{ flex: 2 }}>
            <label className="l-form-label">{t('landlord.image')} ({t('common.multiple') || 'nhiều ảnh'})</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', position: 'relative' }}>
              <label
                className="btn btn--outline"
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  margin: 0,
                  width: 'fit-content',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)'
                }}
              >
                📁 {t('landlord.btn_choose_files') || 'Chọn tệp'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 140px)' }}>
                {hinhAnh
                  ? t('landlord.files_selected', { count: hinhAnh.split('|||').length })
                  : t('landlord.no_file_selected') || 'Không có tệp nào được chọn'}
              </span>
            </div>
            {hinhAnh && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', width: '100%' }}>
                {hinhAnh.split('|||').map((imgSrc, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={imgSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => {
                        const arr = hinhAnh.split('|||');
                        arr.splice(idx, 1);
                        setHinhAnh(arr.join('|||'));
                      }}
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.85)', color: '#fff',
                        border: 'none', fontSize: '10px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        fontWeight: 'bold', zIndex: 10
                      }}
                      title="Xoá ảnh này"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="l-add-room-form__field" style={{ flexBasis: '100%' }}>
            <label className="l-form-label">{t('landlord.more_description')}</label>
            <textarea className="l-form-input" value={moTa} onChange={e => setMoTa(e.target.value)} placeholder={t('landlord.placeholder_room_desc')} rows={3} disabled={isSubmitting} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              className="l-btn l-btn--primary"
              disabled={isSubmitting || isCompressing}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isCompressing 
                ? `⏳ ${t('common.loading') || 'Đang xử lý ảnh...'}` 
                : isSubmitting 
                  ? t('landlord.btn_saving') 
                  : `💾 ${t('landlord.btn_save_room')}`}
            </button>
          </div>
        </form>
      </div>

      {/* === Danh sách phòng === */}
      {phongTros.length === 0 ? (
        <div className="l-empty" style={{ padding: '48px 0' }}>
          <img src={emptyRoomsImg} alt="No rooms" style={{ width: '160px', marginBottom: '16px', opacity: 0.8 }} />
          <div className="l-empty__text">{t('landlord.no_rooms_created')}</div>
        </div>
      ) : (
        <div className="l-room-grid">
          {phongTros.map((phong, i) => {
            // Tìm hợp đồng đã duyệt của phòng này để lấy tên khách
            const hopDongHienTai = hopDongs.find(
              hd => hd.phongTro?.id === phong.id && (hd.trangThai === 'DA_DUYET' || hd.trangThai === 'DA_DU_YET')
            );

            return (
              <div
                key={phong.id}
                className={`l-room-card l-room-card--${tagColor(phong.trangThai)}`}
                style={{ animationDelay: `${i * 0.04}s`, animation: 'fadeIn 0.35s ease both' }}
              >
                {/* Ảnh placeholder cho phòng */}
                <div style={{ height: '120px', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', margin: '-20px -20px 16px -20px', position: 'relative' }}>
                  <ImageSlider hinhAnh={phong.hinhAnh} alt={phong.tenPhong} height="100%" />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                    <span className={`l-tag l-tag--${tagColor(phong.trangThai)}`}>
                      {tagLabel(phong.trangThai)}
                    </span>
                  </div>
                </div>

                {/* Nút xoá */}
                <button
                  className="l-room-card__delete-btn"
                  onClick={() => onXoaPhong(phong.id, phong.tenPhong)}
                  title={t('landlord.delete_room')}
                >
                  ✕
                </button>

                <div className="l-room-card__name">{phong.tenPhong}</div>

                <div className="l-info-row">
                  <span className="l-info-row__label">{t('landlord.rent_price')}:</span>
                  <span className="l-info-row__value" style={{ color: 'var(--accent)' }}>
                    {phong.giaPhong?.toLocaleString()} {t('landlord.currency')}
                  </span>
                </div>

                <div className="l-info-row">
                  <span className="l-info-row__label">{t('landlord.guest')}:</span>
                  <span className="l-info-row__value" style={{ fontSize: '12px' }}>
                    {hopDongHienTai
                      ? (hopDongHienTai.khachHang?.hoTen || hopDongHienTai.khachHang?.username || t('landlord.guest'))
                      : '—'}
                  </span>
                </div>

                <div className="l-info-row" style={{ borderBottom: 'none' }}>
                  <span className="l-info-row__label">{t('landlord.status')}:</span>
                  <span className={`l-tag l-tag--${tagColor(phong.trangThai)}`}>
                    {tagLabel(phong.trangThai)}
                  </span>
                </div>

                <button
                  className="l-btn l-btn--full"
                  style={{ marginTop: '16px' }}
                  onClick={() => onXemChiTiet(phong, hopDongHienTai)}
                >
                  {t('landlord.btn_details')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
