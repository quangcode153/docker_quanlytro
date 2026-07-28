import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-code">{t('notfound.title')}</div>
        <div className="notfound-emoji">🏚️</div>
        <h1 className="notfound-title">{t('notfound.subtitle')}</h1>
        <p className="notfound-desc">
          {t('notfound.desc')}
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn--primary">
            🏠 {t('notfound.btn_back')}
          </Link>
          <Link to="/login" className="notfound-btn notfound-btn--secondary">
            {t('home.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
