import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';
import heroImg from '../../assets/hero_apartment.png';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './HomePage.css';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    api.get('/phong-tro/search', { params: { trangThai: 'TRONG' } })
      .then(res => {
        setRooms((res.data || []).slice(0, 3));
      })
      .catch(err => {
        console.warn("Public fetch failed. Using premium mock rooms:", err);
        setRooms([
          { id: 1, tenPhong: "Căn Hộ View Ban Công Full Nội Thất Giá Rẻ Ngay Âu Cơ", giaPhong: 4000000, dienTich: 25, diaChi: "Tân Phú, Hồ Chí Minh", moTa: "Căn hộ dịch vụ tiện nghi, giờ giấc tự do, bảo vệ 24/7. Đầy đủ máy lạnh, giường nệm, tủ quần áo, tủ lạnh.", hinhAnh: "" },
          { id: 2, tenPhong: "Phòng Có Ban Công Đẹp Mới Xây Gần Công Viên Gia Định", giaPhong: 5700000, dienTich: 34, diaChi: "Phú Nhuận, Hồ Chí Minh", moTa: "Phòng trọ cao cấp, thiết kế hiện đại có gác lửng, cửa sổ thoáng mát, toilet riêng biệt sạch sẽ.", hinhAnh: "" },
          { id: 3, tenPhong: "Phòng Trọ Khép Kín Vị Trí Trung Tâm Quận 3 Tiện Di Chuyển", giaPhong: 3500000, dienTich: 20, diaChi: "Quận 3, Hồ Chí Minh", moTa: "Vị trí đắc địa, gần chợ, trường học, trạm xe buýt. An ninh đảm bảo, camera giám sát.", hinhAnh: "" }
        ]);
      })
      .finally(() => setLoadingRooms(false));
  }, []);

  // LanguageSwitcher handles toggle now

  const FEATURES = [
    { icon: '🏠', color: 'purple', title: t('home.feature_rooms_title'), desc: t('home.feature_rooms_desc') },
    { icon: '📄', color: 'blue', title: t('home.feature_contract_title'), desc: t('home.feature_contract_desc') },
    { icon: '⚡', color: 'amber', title: t('home.feature_bill_title'), desc: t('home.feature_bill_desc') },
    { icon: '💬', color: 'green', title: t('home.feature_chat_title'), desc: t('home.feature_chat_desc') },
    { icon: '📊', color: 'cyan', title: t('home.feature_stats_title'), desc: t('home.feature_stats_desc') },
    { icon: '🔔', color: 'pink', title: t('home.feature_notice_title'), desc: t('home.feature_notice_desc') },
  ];

  const ROLES_LIST = [
    {
      role: 'LANDLORD', emoji: '🏢', title: t('home.role_landlord'),
      desc: t('home.role_landlord_desc'),
      perks: [
        t('landlord.tab_room'), t('landlord.tab_bill'),
        t('landlord.tab_report'), t('landlord.tab_notice')
      ],
    },
    {
      role: 'USER', emoji: '🧑‍💼', title: t('home.role_user'),
      desc: t('home.role_user_desc'),
      perks: [
        t('guest.btn_rent'), t('tenant.tab_invoice'),
        t('tenant.tab_contract'), t('tenant.btn_chat_admin')
      ],
    },
  ];

  return (
    <div style={{ fontFamily: 'var(--font)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container">
        <nav className="home-nav">
          <div className="home-nav__brand">
            <span className="home-nav__logo">🏠</span>
            <span className="home-nav__title">{t('home.brand')}</span>
          </div>
          <div className="home-nav__actions">
            <LanguageSwitcher />
            <Link to="/login" className="home-nav__btn-login">{t('home.login')}</Link>
            <Link to="/login?mode=register&role=USER" className="home-nav__btn-register">{t('home.register_free')}</Link>
          </div>
        </nav>

        <section className="hero">
          <div className="hero__content">
            <div className="hero__badge">{t('home.hero_badge')}</div>
            <h1 className="hero__title" dangerouslySetInnerHTML={{ __html: t('home.hero_title') }} />
            <p className="hero__desc">{t('home.hero_desc')}</p>
            <div className="hero__cta-group">
              <Link to="/login?mode=register&role=USER" className="hero__btn-primary">{t('home.hero_btn_start')}</Link>
              <Link to="/login" className="hero__btn-secondary">{t('home.hero_btn_login')}</Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat-item">
                <div className="hero__stat-value">500+</div>
                <div className="hero__stat-label">{t('home.stat_users')}</div>
              </div>
              <div className="hero__stat-item">
                <div className="hero__stat-value">3,200+</div>
                <div className="hero__stat-label">{t('home.stat_rooms')}</div>
              </div>
              <div className="hero__stat-item">
                <div className="hero__stat-value">98%</div>
                <div className="hero__stat-label">{t('home.stat_satisfaction')}</div>
              </div>
            </div>
          </div>

          <div className="hero__image-wrap">
            <img src={heroImg} alt="Apartment illustration" className="hero__image" />
          </div>
        </section>
      </div>

      {/* === PHÒNG TRỌ MỚI ĐĂNG SECTION === */}
      <section className="home-rooms" style={{ padding: '60px 0', background: 'var(--surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="features__label" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700 }}>{t('home.rooms_label') || 'TIN NỔI BẬT'}</div>
          <h2 className="features__title" style={{ marginBottom: '12px' }}>{t('home.rooms_title') || 'Phòng Trọ Mới Đăng'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '15px' }}>{t('home.rooms_subtitle') || 'Tìm kiếm nhanh các phòng trọ trống đang cho thuê tại các khu vực trung tâm'}</p>

          <div className="home-rooms__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', textAlign: 'left' }}>
            {rooms.map((p, idx) => (
              <div
                key={p.id}
                className="home-room-card"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/login')}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#FBBF24', marginBottom: '8px' }}>⭐⭐⭐⭐⭐</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px', lineHeight: 1.4 }}>{p.tenPhong}</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>{p.giaPhong?.toLocaleString()} đ/tháng</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.dienTich} m²</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineLine: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', marginBottom: '12px' }}>{p.moTa}</p>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>📍 {p.diaChi}</div>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ID {p.id}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 700 }}>Xem chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features__label">{t('home.features_label')}</div>
          <h2 className="features__title">{t('home.features_title')}</h2>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s`, animation: 'fadeIn 0.4s ease both' }}>
                <div className={`feature-card__icon feature-card__icon--${f.color}`}>{f.icon}</div>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="roles">
          <div className="roles__inner">
            <h2 className="roles__title">{t('home.roles_title')}</h2>
            <div className="roles__grid">
              {ROLES_LIST.map((r, i) => (
                <div key={i} className="role-card" onClick={() => navigate(`/login?mode=register&role=${r.role}`)} style={{ animationDelay: `${i * 0.1}s`, animation: 'fadeIn 0.4s ease both' }}>
                  <span className="role-card__emoji">{r.emoji}</span>
                  <div className="role-card__title">{r.title}</div>
                  <div className="role-card__desc">{r.desc}</div>
                  <ul className="role-card__perks">
                    {r.perks.map((p, j) => (<li key={j} className="role-card__perk">{p}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="cta-section__title">{t('home.cta_ready')}</h2>
          <Link to="/login?mode=register" className="cta-section__btn">{t('home.cta_btn')}</Link>
        </section>

        <footer className="home-footer">
          <div className="home-footer__grid">
            {/* Column 1: Brand Info */}
            <div className="home-footer__col">
              <div className="home-footer__brand">
                <span className="home-footer__logo">🏠</span>
                <span className="home-footer__title">{t('home.brand')}</span>
              </div>
              <p className="home-footer__desc">
                {t('footer.desc_home')}
              </p>
              <div className="home-footer__socials">
                <a href="#facebook" className="home-footer__social-btn" title="Facebook">📘</a>
                <a href="#instagram" className="home-footer__social-btn" title="Instagram">📷</a>
                <a href="#twitter" className="home-footer__social-btn" title="Twitter">🐦</a>
                <a href="#linkedin" className="home-footer__social-btn" title="LinkedIn">💼</a>
              </div>
            </div>

            {/* Column 2: Features */}
            <div className="home-footer__col">
              <h3 className="home-footer__col-title">{t('footer.col_features')}</h3>
              <ul className="home-footer__list">
                <li><a href="#features" className="home-footer__list-link">{t('footer.feature_rooms')}</a></li>
                <li><a href="#features" className="home-footer__list-link">{t('footer.feature_contract')}</a></li>
                <li><a href="#features" className="home-footer__list-link">{t('footer.feature_utility')}</a></li>
                <li><a href="#features" className="home-footer__list-link">{t('footer.feature_stats')}</a></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="home-footer__col">
              <h3 className="home-footer__col-title">{t('footer.col_care')}</h3>
              <ul className="home-footer__list">
                <li><a href="#faq" className="home-footer__list-link">{t('footer.care_faq')}</a></li>
                <li><a href="#guide" className="home-footer__list-link">{t('footer.care_guide')}</a></li>
                <li><a href="#terms" className="home-footer__list-link">{t('footer.care_terms')}</a></li>
                <li><a href="#privacy" className="home-footer__list-link">{t('footer.care_privacy')}</a></li>
              </ul>
            </div>

            {/* Column 4: Contact info */}
            <div className="home-footer__col">
              <h3 className="home-footer__col-title">{t('footer.col_contact')}</h3>
              <ul className="home-footer__list">
                <li className="home-footer__contact-item">{t('footer.contact_address')}</li>
                <li className="home-footer__contact-item">{t('footer.contact_hotline')}</li>
                <li className="home-footer__contact-item">✉️ Email: quang1532006@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="home-footer__bottom" style={{ display: 'flex', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
            <div className="home-footer__copy" style={{ textAlign: 'center', width: '100%' }}>{t('home.footer_copy') || '© 2026 Quản Lý Trọ. Made with ❤️ in Vietnam.'}</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
