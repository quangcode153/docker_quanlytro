import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer" style={{ marginTop: '40px' }}>
      <div className="app-footer__grid">
        {/* Column 1: Introduction */}
        <div className="app-footer__col">
          <div className="app-footer__title">🏠 Smart Room Rental</div>
          <div className="app-footer__desc">
            {t('footer.desc_app')}
          </div>
        </div>

        {/* Column 2: VIP Support */}
        <div className="app-footer__col">
          <div className="app-footer__title">{t('footer.col_vip')}</div>
          <div className="app-footer__desc">
            {t('footer.contact_hotline_fast')}<br/>
            ✉️ Email: quang1532006@gmail.com
          </div>
        </div>
      </div>

      <div className="app-footer__bottom" style={{ display: 'flex', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
        <span className="app-footer__copy" style={{ textAlign: 'center', width: '100%' }}>
          {t('home.footer_copy') || '© 2026 Quản Lý Trọ. Made with ❤️ in Vietnam.'}
        </span>
      </div>
    </footer>
  );
}
