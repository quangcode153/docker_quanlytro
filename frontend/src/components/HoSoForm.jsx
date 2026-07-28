import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color var(--transition)',
  fontFamily: 'var(--font)',
};

const labelStyle = {
  display: 'block', marginBottom: '6px', fontWeight: 500,
  color: 'var(--text-secondary)', fontSize: '12px',
  textTransform: 'uppercase', letterSpacing: '0.03em',
};

const VIETNAMESE_BANKS = [
  { code: 'Vietcombank', name: 'Ngoại thương Việt Nam (Vietcombank)' },
  { code: 'Techcombank', name: 'Kỹ thương Việt Nam (Techcombank)' },
  { code: 'MB Bank', name: 'Quân đội (MB Bank)' },
  { code: 'BIDV', name: 'Đầu tư và Phát triển Việt Nam (BIDV)' },
  { code: 'Agribank', name: 'Nông nghiệp và Phát triển Nông thôn (Agribank)' },
  { code: 'VietinBank', name: 'Công thương Việt Nam (VietinBank)' },
  { code: 'Sacombank', name: 'Sài Gòn Thương Tín (Sacombank)' },
  { code: 'ACB', name: 'Á Châu (ACB)' },
  { code: 'TPBank', name: 'Tiên Phong (TPBank)' },
  { code: 'VPBank', name: 'Việt Nam Thịnh Vượng (VPBank)' },
  { code: 'VIB', name: 'Quốc tế (VIB)' },
  { code: 'SHB', name: 'Sài Gòn - Hà Nội (SHB)' },
  { code: 'HDBank', name: 'Phát triển TP.HCM (HDBank)' },
];

const getMaxDate18YearsAgo = () => {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function HoSoForm({ user }) {
  const { t } = useTranslation();
  const [hoSo, setHoSo] = useState({
    hoTen: '', ngaySinh: '', gioiTinh: 'Nam',
    soCccd: '', soDienThoai: '', email: '', diaChiThuongTru: '',
    tenNganHang: '', soTaiKhoan: '', chuTaiKhoan: ''
  });
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    const fetchHoSo = async () => {
      try {
        const res = await api.get('/khach-hang/ho-so/me');
        if (res.data) {
          const backendData = {
            hoTen: res.data.hoTen || user?.username || '',
            ngaySinh: res.data.ngaySinh || '',
            gioiTinh: res.data.gioiTinh || 'Nam',
            soCccd: res.data.soCccd || '',
            soDienThoai: res.data.soDienThoai || '',
            email: res.data.email || '',
            diaChiThuongTru: res.data.diaChiThuongTru || '',
            tenNganHang: res.data.tenNganHang || '',
            soTaiKhoan: res.data.soTaiKhoan || '',
            chuTaiKhoan: res.data.chuTaiKhoan || ''
          };

          // Check if we have a draft in sessionStorage
          const draftStr = sessionStorage.getItem('hoso_draft');
          if (draftStr) {
            try {
              const draft = JSON.parse(draftStr);
              // Merge: prioritize draft inputs
              setHoSo({ ...backendData, ...draft });
            } catch (e) {
              console.error("Lỗi parse dữ liệu nháp:", e);
              setHoSo(backendData);
            }
          } else {
            setHoSo(backendData);
          }
        }
      } catch (err) {
        console.error(t('guest_profile.error_load'), err);
      } finally {
        setDangTai(false);
      }
    };
    fetchHoSo();
  }, [user]);

  const handleChange = (e) => {
    const updated = { ...hoSo, [e.target.name]: e.target.value };
    setHoSo(updated);
    // Persist changes in sessionStorage temporarily
    sessionStorage.setItem('hoso_draft', JSON.stringify(updated));
  };

  const handleLuuHoSo = async (e) => {
    e.preventDefault();
    try {
      await api.put('/khach-hang/ho-so/me', hoSo);
      alert(t('guest_profile.success_update') || 'Cập nhật hồ sơ thành công!');
      // Clear draft upon successful API save
      sessionStorage.removeItem('hoso_draft');
    } catch (err) {
      let errorMsg = err.response?.data?.message;
      if (!errorMsg && err.response?.data) {
        const errors = err.response.data;
        errorMsg = Object.values(errors)[0];
      }
      alert(errorMsg || t('guest_profile.error_update') || 'Cập nhật hồ sơ thất bại!');
    }
  };

  if (dangTai) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
        <div style={{
          width: '28px', height: '28px', border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('guest_profile.loading')}</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeInUp 0.3s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {t('guest_profile.title')}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('guest_profile.subtitle')}
        </div>
      </div>

      <form onSubmit={handleLuuHoSo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('guest_profile.fullname')}</label>
          <input type="text" name="hoTen" value={hoSo.hoTen} onChange={handleChange} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} style={inputStyle} placeholder={t('guest_profile.fullname_ph')} />
        </div>

        <div>
          <label style={labelStyle}>{t('guest_profile.dob')}</label>
          <input
            type="date"
            name="ngaySinh"
            value={hoSo.ngaySinh}
            onChange={handleChange}
            required
            onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
            onInput={e => e.target.setCustomValidity('')}
            style={inputStyle}
            max={getMaxDate18YearsAgo()}
            min="1900-01-01"
          />
        </div>

        <div>
          <label style={labelStyle}>{t('guest_profile.gender')}</label>
          <select name="gioiTinh" value={hoSo.gioiTinh} onChange={handleChange} style={inputStyle}>
            <option value="Nam">{t('guest_profile.gender_male')}</option>
            <option value="Nữ">{t('guest_profile.gender_female')}</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>{t('guest_profile.id_card')}</label>
          <input type="text" name="soCccd" value={hoSo.soCccd} onChange={handleChange} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} style={inputStyle} placeholder={t('guest_profile.id_card_ph')} />
        </div>

        <div>
          <label style={labelStyle}>{t('guest_profile.phone')}</label>
          <input type="tel" name="soDienThoai" value={hoSo.soDienThoai} onChange={handleChange} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} style={inputStyle} placeholder={t('guest_profile.phone_ph')} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('guest_profile.email')}</label>
          <input type="email" name="email" value={hoSo.email} onChange={handleChange} style={inputStyle} placeholder={t('guest_profile.email_ph')} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('guest_profile.address')}</label>
          <textarea name="diaChiThuongTru" value={hoSo.diaChiThuongTru} onChange={handleChange} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder={t('guest_profile.address_ph')} />
        </div>

        {/* Bank Information section (rendered for both Tenant & Landlord) */}
        <div style={{ gridColumn: 'span 2', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            🏦 {t('guest_profile.bank_section_title') || 'Thông tin tài khoản ngân hàng'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t('guest_profile.bank_section_desc') || 'Cung cấp tài khoản để giao dịch thanh toán hoặc nhận tiền cọc/hoàn trả cọc.'}
          </div>
        </div>
        <div>
          <label style={labelStyle}>{t('guest_profile.bank_name') || 'Tên ngân hàng'}</label>
          <select
            name="tenNganHang"
            value={hoSo.tenNganHang}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">-- {t('guest_profile.bank_name_ph') || 'Chọn ngân hàng'} --</option>
            {VIETNAMESE_BANKS.map(bank => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>{t('guest_profile.bank_account') || 'Số tài khoản'}</label>
          <input type="text" name="soTaiKhoan" value={hoSo.soTaiKhoan} onChange={handleChange} style={inputStyle} placeholder={t('guest_profile.bank_account_ph') || 'Nhập số tài khoản'} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('guest_profile.bank_owner') || 'Chủ tài khoản'}</label>
          <input type="text" name="chuTaiKhoan" value={hoSo.chuTaiKhoan} onChange={handleChange} style={inputStyle} placeholder={t('guest_profile.bank_owner_ph') || 'Tên trên thẻ (không dấu)'} />
        </div>

        <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '4px' }}>
          <button type="submit" style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--text-primary)', color: '#fff',
            cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            transition: 'opacity var(--transition)',
          }}>
            {t('guest_profile.btn_save')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HoSoForm;