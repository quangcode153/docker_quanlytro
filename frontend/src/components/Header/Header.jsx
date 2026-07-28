import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

function Header({ user, onLogout }) {
  const { t, i18n } = useTranslation();

  // Clean up role string (e.g., 'ROLE_USER' -> 'USER')
  const role = (user?.role || '').replace('ROLE_', '');
  
  // Mapping roles to localized text
  const roleMap = { 
    ADMIN: t('header.role_ADMIN'), 
    LANDLORD: t('header.role_LANDLORD'), 
    USER: t('header.role_USER') 
  };

  // Toggle between Vietnamese and English (Migrated to LanguageSwitcher)

  const firstLetter = (user?.username || 'G').charAt(0).toUpperCase();

  return (
    <header className="header">
      {/* Brand & Logo */}
      <div className="header__brand" style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
        <span className="header__logo">🏠</span>
        <span className="header__title">
          {t('header.app_name')}
        </span>
      </div>

      {/* Action Buttons & User Info */}
      <div className="header__actions">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Profile Info with Avatar */}
        <div className="header__profile">
          <div className="header__avatar">
            {firstLetter}
          </div>
          <div className="header__user-info">
            <div className="header__username">
              {user?.username || 'Guest'}
            </div>
            <div className="header__role">
              {roleMap[role] || role}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="btn btn--outline header__btn-logout"
        >
          🚪 {t('header.logout') || 'Đăng xuất'}
        </button>
      </div>
    </header>
  );
}

export default Header;