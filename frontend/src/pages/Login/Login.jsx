import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import loginBg from '../../assets/login-bg.png';
import './Login.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();

  // Mode states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request, 2 = Verify & Reset

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');

  // Social token registration info
  const [socialToken, setSocialToken] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  // Forgot password inputs
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);

  // Status & validation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (forgotCountdown > 0) {
      timer = setInterval(() => {
        setForgotCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCountdown]);

  // Parse query parameters for routing back from social logins or displaying errors
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const emailParam = params.get('email');
    const nameParam = params.get('name');
    const socialTokenParam = params.get('socialToken');
    const errParam = params.get('error');

    if (errParam) {
      if (errParam === 'oauth2_failed') {
        setError(t('login.error_google_failed') || 'Đăng nhập Google thất bại. Vui lòng thử lại!');
      } else if (errParam === 'email_already_registered') {
        setError(t('login.error_email_used') || 'Email này đã được sử dụng bởi một tài khoản khác!');
      } else if (errParam === 'unauthorized_link_request') {
        setError(t('login.error_invalid_link') || 'Yêu cầu liên kết không hợp lệ.');
      } else if (errParam === 'email_already_linked') {
        setError(t('login.error_email_linked') || 'Email này đã được liên kết với một tài khoản khác.');
      } else {
        setError(t('login.error_social_login') || 'Lỗi đăng nhập mạng xã hội.');
      }
    }

    if (mode === 'register') {
      setIsRegistering(true);
      const roleParam = params.get('role');
      if (roleParam === 'LANDLORD' || roleParam === 'USER') {
        setRole(roleParam);
      }
      if (socialTokenParam) {
        setSocialToken(socialTokenParam);
        setSocialEmail(emailParam || '');
        setSocialName(nameParam || '');
        if (emailParam) {
          // Prefill username with email prefix
          setUsername(emailParam.split('@')[0]);
        }
      }
    } else {
      setIsRegistering(false);
    }
  }, [location.search]);

  // Set cookies and trigger Google OAuth2 flow on the backend
  const handleGoogleLogin = () => {
    const action = isRegistering ? 'register' : 'login';
    document.cookie = `oauth2_action=${action}; path=/; max-age=3600`;
    
    // Extract base URL from VITE_API_URL
    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  // Submit main form (Login / Standard Registration / Social Token Registration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    const tempErrors = {};
    if (isRegistering) {
      // Inline validation
      if (username.trim().length < 3 || username.trim().length > 50) {
        tempErrors.username = t('login.error_username_length') || "Tên đăng nhập phải từ 3 đến 50 ký tự!";
      }
      if (password.length < 3) {
        tempErrors.password = t('login.error_password_length') || "Mật khẩu phải chứa ít nhất 3 ký tự!";
      }
      if (password !== confirmPassword) {
        tempErrors.confirmPassword = t('login.error_password_match') || "Mật khẩu xác nhận không khớp!";
      }

      if (!socialToken) {
        const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơẤẦẨẪẬẮẰẲẴẶÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổổỗộớờởỡợúùủũụứừửữựýỳỷỹỵđĐ\s]+$/;
        if (!hoTen.trim()) {
          tempErrors.hoTen = t('login.error_fullname_empty') || "Họ tên không được để trống!";
        } else if (hoTen.trim().length < 2 || hoTen.trim().length > 50) {
          tempErrors.hoTen = t('login.error_fullname_length') || "Họ tên phải từ 2 đến 50 ký tự!";
        } else if (!nameRegex.test(hoTen)) {
          tempErrors.hoTen = t('login.error_fullname_invalid') || "Họ tên không được chứa số hoặc ký tự đặc biệt!";
        }
      }

      if (Object.keys(tempErrors).length > 0) {
        setErrors(tempErrors);
        setLoading(false);
        return;
      }

      try {
        if (socialToken) {
          // Social complete registration
          await api.post('/tai-khoan/register/social', {
            socialToken,
            username,
            password,
            role
          });
          alert(t('login.alert_google_success') || 'Đăng ký tài khoản liên kết Google thành công! Vui lòng đăng nhập.');
          setIsRegistering(false);
          setSocialToken('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
        } else {
          // Normal registration
          await api.post('/tai-khoan/register', {
            username,
            password,
            role,
            hoTen
          });
          alert(t('login.success_register') || 'Đăng ký thành công! Vui lòng đăng nhập.');
          setIsRegistering(false);
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setEmail('');
          setHoTen('');
        }
      } catch (err) {
        console.error('Registration error:', err);
        const errMsg = err.response?.data?.message || err.message || t('login.error_server');
        if (err.response?.data && typeof err.response.data === 'object') {
          // Extract specific field errors returned by GlobalExceptionHandler
          setErrors(err.response.data);
        } else {
          setError(errMsg);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Normal Login
      try {
        const loginRes = await api.post('/tai-khoan/login', { username, password });
        const { token } = loginRes.data;
        if (!token) throw new Error(t('login.error_no_token'));

        localStorage.setItem('token', token);
        const userRes = await api.get('/tai-khoan/me');
        loginSuccess(token, userRes.data);
        setTimeout(() => navigate('/', { replace: true }), 0);
      } catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || err.message || t('login.error_server'));
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
  };

  // Switch tabs / modes cleanly, resetting errors and counts
  const switchMode = () => {
    setIsRegistering(v => !v);
    setIsForgotPassword(false);
    setSocialToken('');
    setForgotCountdown(0);
    setForgotStep(1);
    setError('');
    setErrors({});
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setHoTen('');
    setEmail('');
  };

  // Switch to Forgot Password panel
  const triggerForgotPassword = () => {
    setIsForgotPassword(true);
    setForgotStep(1);
    setForgotCountdown(0);
    setErrors({});
    setError('');
    setForgotUsername('');
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  // Send Forgot Password OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    const tempErrors = {};
    if (!forgotUsername.trim()) tempErrors.username = t('login.error_username_empty') || "Tên đăng nhập không được để trống!";
    if (!forgotEmail.trim()) {
      tempErrors.email = t('login.error_email_empty') || "Email không được để trống!";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(forgotEmail)) {
        tempErrors.email = t('login.error_email_gmail') || "Email phải là địa chỉ Gmail hợp lệ (@gmail.com)";
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/tai-khoan/forgot-password', {
        username: forgotUsername,
        email: forgotEmail
      });
      alert(res.data.message || t('login.alert_otp_sent') || "Mã xác thực OTP khôi phục mật khẩu đã được gửi đến Gmail của bạn.");
      setForgotStep(2);
      setForgotCountdown(300); // 5 minutes timer
    } catch (err) {
      console.error("Forgot OTP send error:", err);
      const errMsg = err.response?.data?.message || err.message || t('login.error_send_otp_failed') || "Không thể gửi OTP!";
      alert('⚠️ ' + t('common.error') + ': ' + errMsg + '\n' + t('login.otp_spam_tip'));
      if (err.response?.data && typeof err.response.data === 'object') {
        setErrors(err.response.data);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    const tempErrors = {};
    if (!forgotOtp.trim()) tempErrors.otp = t('login.error_otp_empty') || "Vui lòng nhập mã OTP!";
    if (forgotNewPassword.length < 3) {
      tempErrors.newPassword = t('login.error_new_password_length') || "Mật khẩu mới phải từ 3 ký tự trở lên!";
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      tempErrors.confirmPassword = t('login.error_confirm_password_match') || "Mật khẩu xác nhận không khớp!";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/tai-khoan/reset-password', {
        username: forgotUsername,
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      });
      alert(res.data.message || t('login.alert_reset_success') || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
      setIsForgotPassword(false);
      setForgotCountdown(0);
      setUsername(forgotUsername);
      setPassword('');
    } catch (err) {
      console.error("Reset password error:", err);
      const errMsg = err.response?.data?.message || err.message || t('login.error_reset_failed') || "Đặt lại mật khẩu thất bại!";
      alert('⚠️ ' + t('common.error') + ': ' + errMsg);
      if (err.response?.data && typeof err.response.data === 'object') {
        setErrors(err.response.data);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand" onClick={() => navigate('/')} title={t('login.back_to_home') || 'Quay về trang chủ'}>
        <span className="auth-brand__logo">🏠</span>
        <span className="auth-brand__title">{t('home.brand')}</span>
      </div>

      <div className="auth-lang-switcher" style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
        <LanguageSwitcher />
      </div>

      <div className="auth-hero">
        <img src={loginBg} alt="Luxury Apartment" className="auth-hero__img" />
        <div className="auth-hero__content">
          <div className="auth-hero__logo"></div>
          <h1 className="auth-hero__title">{t('login.hero_title')}</h1>
          <p className="auth-hero__subtitle">{t('login.hero_subtitle')}</p>
        </div>
        <div className="auth-hero__footer">{t('login.footer_copy')}</div>
      </div>

      <div className="auth-content">
        {isForgotPassword ? (
          /* =========================================
             FORGOT PASSWORD VIEWS
             ========================================= */
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-header__title">{t('login.forgot_password_title')}</h2>
              <p className="auth-header__subtitle">
                {forgotStep === 1 
                  ? t('login.forgot_step1_subtitle')
                  : t('login.forgot_step2_subtitle')}
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">{t('login.username')}</label>
                  <input
                    className="form-input"
                    type="text"
                    value={forgotUsername}
                    onChange={e => setForgotUsername(e.target.value)}
                    placeholder={t('login.username_ph')}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  {errors.username && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('login.email_linked')}</label>
                  <input
                    className="form-input"
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  {errors.email && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={loading}
                  style={{ marginTop: '12px' }}
                >
                  {loading ? t('login.btn_processing') : t('login.btn_send_otp')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">{t('login.otp_code')}</label>
                  <input
                    className="form-input"
                    type="text"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    placeholder={t('login.otp_code_ph')}
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  {errors.otp && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.otp}</span>}
                  {forgotCountdown > 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      {t('login.otp_expiry', { minutes: Math.floor(forgotCountdown / 60), seconds: String(forgotCountdown % 60).padStart(2, '0') })}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#F87171', marginTop: '4px', display: 'block' }}>
                      {t('login.otp_expired')}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {t('login.otp_spam_tip')}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('login.new_password')}</label>
                  <input
                    className="form-input"
                    type="password"
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  {errors.newPassword && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('login.confirm_new_password')}</label>
                  <input
                    className="form-input"
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={e => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  {errors.confirmPassword && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={loading}
                  style={{ marginTop: '12px' }}
                >
                  {loading ? t('login.btn_processing') : t('login.btn_reset_password')}
                </button>

                <button
                  type="button"
                  className="btn btn--outline btn--full"
                  style={{ marginTop: '8px' }}
                  onClick={handleRequestOtp}
                >
                  {t('login.btn_resend_otp')}
                </button>
              </form>
            )}

            {error && (
              <div className="alert alert--error" style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span> {error}
              </div>
            )}

            <div className="auth-footer" style={{ marginTop: '20px' }}>
              {t('login.btn_back_to_login')}
              <span className="auth-footer__link" onClick={switchMode}>
                {" " + t('login.btn_login')}
              </span>
            </div>
          </div>
        ) : (
          /* =========================================
             LOGIN & REGISTRATION VIEWS
             ========================================= */
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-header__title">
                {socialToken 
                  ? t('login.google_link_title') 
                  : isRegistering 
                    ? t('login.title_register') 
                    : t('login.title_login')}
              </h2>
              <p className="auth-header__subtitle">
                {socialToken 
                  ? t('login.google_link_subtitle', { email: socialEmail }) 
                  : isRegistering 
                    ? t('login.subtitle_register') 
                    : t('login.subtitle_login')}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {isRegistering && !socialToken && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('login.fullname')}</label>
                    <input
                      className="form-input"
                      type="text"
                      value={hoTen}
                      onChange={e => setHoTen(e.target.value)}
                      placeholder={t('guest_profile.fullname_ph') || 'Nguyễn Văn A'}
                      required
                      onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                      onInput={e => e.target.setCustomValidity('')}
                    />
                    {errors.hoTen && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.hoTen}</span>}
                  </div>
                </>
              )}

              {socialToken && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('login.google_email_linked')}</label>
                    <input
                      className="form-input"
                      type="email"
                      value={socialEmail}
                      disabled
                      readOnly
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('login.google_name')}</label>
                    <input
                      className="form-input"
                      type="text"
                      value={socialName}
                      disabled
                      readOnly
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">{t('login.username')}</label>
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={t('login.username_ph')}
                  required
                  autoFocus
                  onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                  onInput={e => e.target.setCustomValidity('')}
                />
                {errors.username && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.username}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>{t('login.password')}</label>
                  {!isRegistering && (
                    <span 
                      onClick={triggerForgotPassword}
                      style={{ fontSize: '12.5px', color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {t('login.forgot_password_link')}
                    </span>
                  )}
                </div>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                  onInput={e => e.target.setCustomValidity('')}
                />
                {errors.password && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
              </div>

              {isRegistering && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('login.confirm_password')}</label>
                    <input
                      className="form-input"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      onInvalid={e => e.target.setCustomValidity(t('common.validation_required'))}
                      onInput={e => e.target.setCustomValidity('')}
                    />
                    {errors.confirmPassword && <span className="error-message" style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('login.who_are_you')}</label>
                    <select
                      className="form-input"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    >
                      <option value="USER">{t('login.role_user')}</option>
                      <option value="LANDLORD">{t('login.role_landlord')}</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
                style={{ marginTop: '12px' }}
              >
                {loading ? t('login.btn_processing') : isRegistering ? t('login.btn_register') : t('login.btn_login')}
              </button>

              {error && (
                <div className="alert alert--error" style={{ marginTop: '20px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span> {error}
                </div>
              )}
            </form>

            {/* Google Authentication Section */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              <span style={{ margin: '0 10px', fontSize: '11px', color: 'var(--text-muted)' }}>{t('common.or') || 'HOẶC'}</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn--outline btn--full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {isRegistering ? t('login.btn_google_register') : t('login.btn_google_login')}
            </button>

            <div className="auth-footer" style={{ marginTop: '20px' }}>
              {isRegistering ? t('login.have_account') : t('login.no_account')}
              <span className="auth-footer__link" onClick={switchMode}>
                {isRegistering ? t('login.btn_login') : t('login.btn_register')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}