import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function KhieuNaiForm() {
  const { t } = useTranslation();
  const [hienForm, setHienForm] = useState(false);
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/khieu-nai', { tieuDe, noiDung });
      alert(t('guest_complaint.success_send'));
      setHienForm(false); setTieuDe(''); setNoiDung('');
    } catch (err) {
      alert(t('guest_complaint.error_send'));
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
    fontFamily: 'var(--font)', boxSizing: 'border-box',
    transition: 'border-color var(--transition)',
  };

  return (
    <div>
      <button onClick={() => setHienForm(!hienForm)} style={{
        padding: '7px 14px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text-secondary)', cursor: 'pointer',
        fontSize: '12px', fontWeight: 500,
        transition: 'all var(--transition)',
      }}>
        {hienForm ? t('guest_complaint.btn_close') : t('guest_complaint.btn_open')}
      </button>

      {hienForm && (
        <div style={{
          background: 'var(--surface)', padding: '20px',
          borderRadius: 'var(--radius-lg)', marginTop: '10px',
          border: '1px solid var(--border)', textAlign: 'left',
          animation: 'fadeInUp 0.2s ease',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            {t('guest_complaint.title')}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder={t('guest_complaint.title_ph')} value={tieuDe} onChange={e => setTieuDe(e.target.value)} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} style={inputStyle} />
            <textarea placeholder={t('guest_complaint.content_ph')} value={noiDung} onChange={e => setNoiDung(e.target.value)} required onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))} onInput={e => e.target.setCustomValidity('')} rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
            <button type="submit" style={{
              padding: '9px 18px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--text-primary)', color: '#fff',
              cursor: 'pointer', fontWeight: 500, fontSize: '13px',
              width: 'fit-content', transition: 'opacity var(--transition)',
            }}>
              {t('guest_complaint.btn_send')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default KhieuNaiForm;