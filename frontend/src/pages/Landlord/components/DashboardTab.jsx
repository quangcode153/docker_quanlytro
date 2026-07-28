/**
 * DashboardTab.jsx — Tab Báo cáo & Thống kê
 * Component con của LandlordPage và AdminPage
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dashboardBanner from '../../../assets/dashboard_banner.png';

export default function DashboardTab({ 
  thongKeData, 
  isAdmin = false,
  hoaDons = [],
  hopDongs = [],
  thongBaos = [],
  onSetChatTarget,
  chuTros = [],
  khieuNais = []
}) {
  const { t, i18n } = useTranslation();
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const S = {
    th: { padding: '10px', border: '1px solid #ddd', textAlign: 'left', color: '#666', fontWeight: 600 },
    td: { padding: '10px', border: '1px solid #ddd', color: '#333' }
  };
  
  const handlePrintReport = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let csv = "\uFEFF"; // BOM support Vietnamese
    const title = isAdmin ? t('admin.app_name') : t('landlord.tab_report').toUpperCase();
    csv += `${title}\n`;
    csv += `${t('landlord.recently')}: ${new Date().toLocaleDateString('vi-VN')}\n\n`;

    csv += `--- ${t('landlord.overview_this_month').toUpperCase()} ---\n`;
    csv += `${t('landlord.total_rooms')},${thongKeData.tongSoPhong}\n`;
    csv += `${t('landlord.rented')},${thongKeData.soPhongDaThue}\n`;
    csv += `${t('landlord.occupancy_rate')},${Math.round((thongKeData.soPhongDaThue/thongKeData.tongSoPhong)*100)}%\n\n`;

    csv += `--- ${t('landlord.revenue_chart').toUpperCase()} ---\n`;
    csv += `${t('landlord.month')},${t('landlord.revenue_this_month')},${t('landlord.status')}\n`;
    
    thongKeData.bieuDoDoanhThu?.forEach(d => {
      csv += `${getFullMonth(d.thang)}/${d.nam},${d.doanhThu},${t('landlord.status_paid')}\n`;
    });
    csv += "\n";

    csv += `--- ${t('landlord.debt').toUpperCase()} ---\n`;
    csv += `${t('landlord.revenue_this_month')},${thongKeData.tongDoanhThuThangNay},${t('landlord.currency')}\n`;
    csv += `${t('landlord.debt')},${thongKeData.tongTienChuaThanhToan},${t('landlord.currency')}\n`;
    csv += `${t('landlord.unpaid_invoices_count', { count: thongKeData.soHoaDonChuaThanhToan })}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bao_cao_SmartTro_${new Date().getTime()}.csv`;
    link.click();
  };

  const getShortMonth = (month) => {
    if (i18n.language === 'en') {
      const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return enMonths[month - 1] || month;
    }
    return i18n.language === 'vi' ? `T${month}` : `M${month}`;
  };

  const getFullMonth = (month) => {
    if (i18n.language === 'en') {
      const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return enMonths[month - 1] || month;
    }
    return i18n.language === 'vi' ? `Tháng ${month}` : `Month ${month}`;
  };

  if (!thongKeData) {
    return (
      <div className="l-empty" style={{ padding: '60px 0' }}>
        <div className="l-empty__text">{t('landlord.no_stats_data') || 'Chưa có dữ liệu thống kê.'}</div>
      </div>
    );
  }

  const occupancyRate = thongKeData.tongSoPhong > 0
    ? Math.round((thongKeData.soPhongDaThue / thongKeData.tongSoPhong) * 100)
    : 0;

  const maxDT = Math.max(
    ...(thongKeData.bieuDoDoanhThu?.map(d => d.doanhThu) || [1]),
    1
  );

  const qaIconStyle = {
    fontSize: '24px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition)',
  };

  const qaTitleStyle = {
    fontSize: '12.5px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  };

  // Lọc hóa đơn theo tab đã chọn
  const filteredInvoices = () => {
    if (!Array.isArray(hoaDons)) return [];
    // Sắp xếp các hóa đơn mới nhất hiển thị lên đầu
    const sorted = [...hoaDons].sort((a, b) => b.id - a.id);
    if (paymentFilter === 'PAID') {
      return sorted.filter(hd => hd.trangThai === 'DA_THANH_TOAN');
    }
    if (paymentFilter === 'UNPAID') {
      return sorted.filter(hd => hd.trangThai === 'CHUA_THANH_TOAN');
    }
    return sorted;
  };

  // Soạn sẵn tin nhắn nhắc nhở thanh toán và mở Chat
  const handleRemindTenant = (hd) => {
    const tenantUserId = hd.khachHang?.id;
    if (!tenantUserId) {
      alert(t('landlord.no_tenants') || 'Không tìm thấy thông tin khách thuê!');
      return;
    }
    const tenantName = hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || 'Khách thuê';
    const roomName = hd.phongTro?.tenPhong || 'Phòng';

    const msg = t('landlord.payment_reminder_msg', {
      room: roomName,
      month: hd.thang,
      year: hd.nam,
      amount: hd.tongTien?.toLocaleString()
    });

    if (onSetChatTarget) {
      onSetChatTarget({
        id: tenantUserId,
        username: tenantName,
        prefilledMessage: msg
      });
    }
  };

  // Tạo danh sách hoạt động thực tế
  const getActivities = () => {
    const list = [];

    // 1. Hóa đơn (Đã thanh toán / Chốt số)
    if (Array.isArray(hoaDons)) {
      hoaDons.forEach(hd => {
        const roomName = hd.phongTro?.tenPhong || 'Phòng';
        if (hd.trangThai === 'DA_THANH_TOAN' || hd.trangThai === 'DA_THAI_TOAN') {
          list.push({
            id: hd.id * 10 + 1,
            icon: "💰",
            text: t('landlord.log_bill_paid', { room: roomName, month: hd.thang }),
            time: `${t('landlord.month')} ${hd.thang}/${hd.nam}`
          });
        } else {
          list.push({
            id: hd.id * 10 + 2,
            icon: "⚡",
            text: t('landlord.log_utility_recorded', { room: roomName }),
            time: `${t('landlord.month')} ${hd.thang}/${hd.nam}`
          });
        }
      });
    }

    // 2. Hợp đồng
    if (Array.isArray(hopDongs)) {
      hopDongs.forEach(hd => {
        const roomName = hd.phongTro?.tenPhong || 'Phòng';
        if (hd.trangThai === 'CHO_DUYET') {
          list.push({
            id: hd.id * 10 + 3,
            icon: "📋",
            text: t('landlord.log_new_contract', { room: roomName }),
            time: hd.ngayBatDau ? `${t('landlord.since')} ${hd.ngayBatDau}` : ''
          });
        } else if (hd.trangThai === 'DA_DUYET') {
          list.push({
            id: hd.id * 10 + 4,
            icon: "🤝",
            text: t('landlord.log_new_contract_approved', { room: roomName }),
            time: hd.ngayBatDau ? `${t('landlord.since')} ${hd.ngayBatDau}` : ''
          });
        } else if (hd.trangThai === 'YEU_CAU_HUY') {
          list.push({
            id: hd.id * 10 + 5,
            icon: "⚠️",
            text: t('landlord.log_contract_canceling', { room: roomName }),
            time: ''
          });
        }
      });
    }

    // 3. Thông báo
    if (Array.isArray(thongBaos)) {
      thongBaos.forEach(tb => {
        const dateStr = tb.ngayDang ? new Date(tb.ngayDang).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '';
        list.push({
          id: tb.id * 10 + 6,
          icon: "📣",
          text: `${t('landlord.log_new_notice')}: ${tb.tieuDe}`,
          time: dateStr
        });
      });
    }

    // 4. Nếu là Admin, thêm đăng ký tài khoản mới và khiếu nại nhận được
    if (isAdmin) {
      if (Array.isArray(chuTros)) {
        chuTros.forEach(ct => {
          list.push({
            id: ct.id * 10 + 7,
            icon: "👥",
            text: t('landlord.log_user_registered', { username: ct.hoTen || ct.username }),
            time: t('landlord.recently')
          });
        });
      }
      if (Array.isArray(khieuNais)) {
        khieuNais.forEach(kn => {
          const dateStr = kn.thoiGianGui ? new Date(kn.thoiGianGui).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '';
          list.push({
            id: kn.id * 10 + 8,
            icon: "⚠️",
            text: t('landlord.log_complaint_received', { room: kn.phongTro?.tenPhong || kn.tieuDe }),
            time: dateStr
          });
        });
      }
    }

    // Sắp xếp giảm dần theo ID để hiển thị sự kiện mới nhất lên đầu
    list.sort((a, b) => b.id - a.id);
    return list.slice(0, 5);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }} id="report-printable">
      <div style={{ textAlign: 'right', marginBottom: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }} className="no-print">
        <button 
          onClick={handleExportExcel}
          style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #107C41',
            background: '#fff', color: '#107C41', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
          Excel
        </button>
        <button 
          onClick={handlePrintReport}
          style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
          {t('landlord.btn_print')}
        </button>
      </div>

      {/* === Hero Banner === */}
      <div 
        className="hero-banner-print"
        style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: '24px',
        position: 'relative',
        height: '180px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #818CF8 100%)',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
      }}>
        <img
          src={dashboardBanner}
          alt="Dashboard Banner"
          style={{
            position: 'absolute', right: 0, top: 0,
            height: '100%', width: '55%',
            objectFit: 'cover',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 60%, transparent 100%)',
          }}
        />
        <div style={{ padding: '28px 32px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {t('landlord.overview_this_month')}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {isAdmin ? t('admin.app_name') : t('landlord.hello_landlord')}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
            {isAdmin 
              ? t('admin.system_rooms_summary', { total: thongKeData.tongSoPhong || 0, rented: thongKeData.soPhongDaThue || 0 })
              : t('landlord.manage_rooms_summary', { total: thongKeData.tongSoPhong || 0, rented: thongKeData.soPhongDaThue || 0 })}
          </div>
        </div>
      </div>

      {/* === 3 Stat Cards === */}
      <div className="l-stats-grid">
        <div className="l-stat-card l-stat-card--revenue">
          <div className="l-stat-card__label">{t('landlord.revenue_this_month')}</div>
          <div className="l-stat-card__value">
            {(thongKeData.tongDoanhThuThangNay || 0).toLocaleString()}
            <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '4px' }}>{t('landlord.currency')}</span>
          </div>
          <div className={`l-stat-card__trend l-stat-card__trend--${thongKeData.tyLeTangTruong >= 0 ? 'up' : 'down'}`}>
            {thongKeData.tyLeTangTruong >= 0 ? '↗' : '↘'}
            {Math.abs(thongKeData.tyLeTangTruong || 0)}% {t('landlord.compared_last_month')}
          </div>
        </div>

        <div className="l-stat-card l-stat-card--occupancy">
          <div className="l-stat-card__label">{t('landlord.occupancy_rate')}</div>
          <div className="l-stat-card__value">{occupancyRate}%</div>
          <div className="l-stat-card__sub">
            {thongKeData.soPhongDaThue} {t('landlord.rented')} / {thongKeData.tongSoPhong} {t('landlord.total_rooms')}
          </div>
        </div>

        <div className="l-stat-card l-stat-card--debt">
          <div className="l-stat-card__label">{t('landlord.debt')}</div>
          <div className="l-stat-card__value" style={{ color: 'var(--warning)' }}>
            {(thongKeData.tongTienChuaThanhToan || 0).toLocaleString()}
            <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '4px' }}>{t('landlord.currency')}</span>
          </div>
          <div className="l-stat-card__sub">
            {t('landlord.unpaid_invoices_count', { count: thongKeData.soHoaDonChuaThanhToan || 0 })}
          </div>
        </div>
      </div>

      <div className="dashboard-grid-charts" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '24px' }}>
        <style>{`
          @media (min-width: 1024px) {
            .dashboard-grid-charts {
              grid-template-columns: 3fr 2fr !important;
            }
          }
        `}</style>

        {/* === Biểu đồ doanh thu === */}
        <div className="l-chart-card" style={{ height: '100%', marginBottom: 0 }}>
          <div className="l-chart-card__title">{t('landlord.revenue_chart')}</div>
          <div className="l-chart-bars">
            {thongKeData.bieuDoDoanhThu?.map((d, i) => {
              const height = maxDT > 0 ? (d.doanhThu / maxDT) * 100 : 0;
              const isCurrent = i === (thongKeData.bieuDoDoanhThu.length - 1);
              return (
                <div key={i} className="l-chart-col">
                  <div className="l-chart-col__label-top">
                    {d.doanhThu > 0 ? `${Math.round(d.doanhThu / 1000)}k` : ''}
                  </div>
                  <div
                    className={`l-chart-col__bar ${isCurrent ? 'l-chart-col__bar--current' : 'l-chart-col__bar--past'}`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${getFullMonth(d.thang)}: ${d.doanhThu?.toLocaleString()} ${t('landlord.currency')}`}
                  />
                  <div className="l-chart-col__label-bot">{getShortMonth(d.thang)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === Bảng dữ liệu chi tiết === */}
        <div className="l-report-sheet" style={{ height: '100%', marginBottom: 0 }}>
          <div className="l-chart-card__title">{t('landlord.tab_report')} {t('landlord.recently').toLowerCase()}</div>
          <table style={{
            width: '100%', borderCollapse: 'collapse', marginTop: '10px',
            fontSize: '13px', border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={S.th}>{t('landlord.month')}</th>
                <th style={S.th}>{t('landlord.revenue_this_month')}</th>
                <th style={S.th}>{t('landlord.status')}</th>
              </tr>
            </thead>
            <tbody>
              {thongKeData.bieuDoDoanhThu?.map((d, i) => (
                <tr key={i}>
                  <td style={S.td}>{getFullMonth(d.thang)} / {d.nam}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{d.doanhThu?.toLocaleString()} {t('landlord.currency')}</td>
                  <td style={S.td}>{t('landlord.status_paid')}</td>
                </tr>
              ))}
              <tr style={{ background: '#fff9f9' }}>
                <td style={{ ...S.td, fontWeight: 'bold' }}>{t('landlord.debt')}</td>
                <td style={{ ...S.td, fontWeight: 'bold', color: 'var(--danger)' }}>
                  {thongKeData.tongTienChuaThanhToan?.toLocaleString()} {t('landlord.currency')}
                </td>
                <td style={S.td}>{t('landlord.status_unpaid')} ({thongKeData.soHoaDonChuaThanhToan})</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row mới cho Quản lý thanh toán (hoặc Hành động nhanh đối với Admin) và Nhật ký hoạt động */}
      <div className="dashboard-grid-actions-logs" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '24px' }}>
        <style>{`
          @media (min-width: 1024px) {
            .dashboard-grid-actions-logs {
              grid-template-columns: 1fr 1fr !important;
            }
          }
          .quick-action-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: var(--bg);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all var(--transition);
            text-align: center;
            gap: 8px;
          }
          .quick-action-item:hover {
            border-color: var(--accent) !important;
            box-shadow: var(--shadow-sm);
            transform: translateY(-2px);
          }
          .quick-action-item:hover span {
            background: var(--accent) !important;
            color: #fff !important;
          }
          .remind-btn:hover {
            background: var(--danger) !important;
            color: #fff !important;
            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
          }
        `}</style>

        {/* --- CỘT TRÁI: QUẢN LÝ THANH TOÁN --- */}
        <div className="l-report-sheet" style={{ height: '100%', marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div className="l-chart-card__title" style={{ marginBottom: 0 }}>{t('landlord.payment_status_manager')}</div>
            {/* Tabs Lọc */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--border-light)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
              {['ALL', 'UNPAID', 'PAID'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setPaymentFilter(filter)}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: paymentFilter === filter ? 'var(--text-primary)' : 'transparent',
                    color: paymentFilter === filter ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {t(`landlord.filter_${filter.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách phòng/hóa đơn cuộn được */}
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', maxHeight: '280px', paddingRight: '4px' }}>
            {filteredInvoices().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {t('landlord.no_invoices_for_filter')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredInvoices().map((hd) => {
                  const isPaid = hd.trangThai === 'DA_THANH_TOAN';
                  const tenantName = hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || '—';
                  return (
                    <div
                      key={hd.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'var(--bg)',
                        border: `1px solid ${isPaid ? 'var(--border-light)' : 'var(--danger-light)'}`,
                        borderLeft: `3px solid ${isPaid ? 'var(--success)' : 'var(--danger)'}`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {hd.phongTro?.tenPhong}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tenantName} · {t('landlord.month')} {hd.thang}/{hd.nam}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          {hd.tongTien?.toLocaleString()}đ
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {isPaid ? (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              {t('landlord.status_paid')}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemindTenant(hd)}
                              className="remind-btn"
                              style={{
                                padding: '3px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--danger-light)',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              {t('landlord.btn_remind')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- CỘT PHẢI: NHẬT KÝ HOẠT ĐỘNG REAL-TIME --- */}
        <div className="l-report-sheet" style={{ height: '100%', marginBottom: 0 }}>
          <div className="l-chart-card__title">{t('landlord.recent_activities')}</div>
          <div className="activity-logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {getActivities().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {t('landlord.no_activities') || 'Chưa có hoạt động nào.'}
              </div>
            ) : (
              getActivities().map((log, index) => (
                <div key={index} className="activity-log-item" style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                  fontSize: '13px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.text}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{log.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 15mm; }
          body * { visibility: hidden; }
          #report-printable, #report-printable * { visibility: visible; }
          #report-printable {
            position: absolute; left: 0; top: 0; width: 100%;
            background: #fff !important; color: #000 !important;
            box-shadow: none !important; padding: 0 !important;
          }
          .no-print, .hero-banner-print { display: none !important; }
          .l-stats-grid { display: flex !important; gap: 10px !important; margin-bottom: 20px !important; }
          .l-stat-card { border: 1px solid #ccc !important; background: #fff !important; flex: 1 !important; padding: 15px !important; }
          .l-stat-card__value { color: #000 !important; }
          .l-chart-card, .l-report-sheet { border: 1px solid #ccc !important; padding: 15px !important; margin-top: 20px !important; page-break-inside: avoid; }
          .l-chart-bars { height: 150px !important; }
          .l-chart-col__bar { border: 1px solid #333 !important; background: #eee !important; }
          .l-chart-col__bar--current { background: #333 !important; }
          table { border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 8px !important; }
        }
      `}</style>
    </div>
  );
}
