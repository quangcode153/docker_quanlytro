import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="lang-selector" ref={dropdownRef}>
      <button className="lang-selector__btn" onClick={toggleDropdown}>
        <span>{currentLang.flag}</span>
        <span>{currentLang.short}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="lang-selector__dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-selector__item ${i18n.language === lang.code ? 'lang-selector__item--active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
