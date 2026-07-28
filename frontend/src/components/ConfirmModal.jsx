import React from 'react';
import { useTranslation } from 'react-i18next';

const S = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
  content: {
    background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
    width: '90%', maxWidth: '400px', padding: '32px',
    textAlign: 'center', boxShadow: 'var(--shadow-lg)',
    animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative', border: '1px solid var(--border)',
  },
  iconBox: (type) => {
    const colors = {
      danger: 'var(--danger)',
      success: 'var(--success)',
      warning: 'var(--warning)',
      info: 'var(--accent)',
    };
    return {
      width: '56px', height: '56px', borderRadius: '50%',
      background: `${colors[type]}15`, color: colors[type],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '24px', margin: '0 auto 20px',
    };
  },
  title: {
    fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  message: {
    fontSize: '14px', color: 'var(--text-secondary)',
    lineHeight: 1.6, marginBottom: '24px', whiteSpace: 'pre-line',
  },
  actions: {
    display: 'flex', gap: '12px', justifyContent: 'center',
  },
  btn: (primary, type) => {
    const colors = {
      danger: 'var(--danger)',
      success: 'var(--success)',
      warning: 'var(--warning)',
      info: 'var(--accent)',
    };
    return {
      padding: '10px 24px', borderRadius: 'var(--radius-md)',
      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.2s ease', border: primary ? 'none' : '1px solid var(--border)',
      background: primary ? colors[type] : 'var(--surface)',
      color: primary ? '#fff' : 'var(--text-secondary)',
      flex: 1,
    };
  },
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', 
  confirmText, 
  cancelText 
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return '⚠️';
      case 'success': return '✅';
      case 'warning': return '🔔';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.content} onClick={e => e.stopPropagation()}>
        <div style={S.iconBox(type)}>{getIcon()}</div>
        {title && <div style={S.title}>{title}</div>}
        <div style={S.message}>{message}</div>
        
        <div style={S.actions}>
          {onConfirm && type !== 'success' && type !== 'info' && (
            <button style={S.btn(false, type)} onClick={onClose}>
              {cancelText || t('common.cancel')}
            </button>
          )}
          <button 
            style={S.btn(true, type)} 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText || (onConfirm ? t('common.confirm') : 'OK')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
