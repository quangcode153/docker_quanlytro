/**
 * InvoiceTab.jsx — Tab Quản lý Hoá đơn
 * Component con của LandlordPage
 */
import { useTranslation } from 'react-i18next';
import emptyInvoiceImg from '../../../assets/empty_invoice.png';

export default function InvoiceTab({ hoaDons, onCapNhatSo }) {
  const { t } = useTranslation();

  const unpaidInvoices = hoaDons.filter(hd => hd.trangThai === 'CHUA_THANH_TOAN');
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, hd) => sum + (hd.tongTien || 0), 0);

  const handleInHoaDon = (hd) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert(t('common.popup_blocked') || 'Vui lòng cho phép trình duyệt mở popup để in hóa đơn!');
      return;
    }
    
    const daTT = hd.trangThai === 'DA_THANH_TOAN';
    const currency = t('landlord.currency') || 'đ';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('tenant.invoice_title') || 'Hóa đơn'} - ${hd.phongTro?.tenPhong || ''}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }
            .info-item span {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              padding: 12px 15px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
              color: #475569;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              background-color: #f1f5f9;
            }
            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 10px;
            }
            .status--paid {
              background-color: #dcfce7;
              color: #15803d;
            }
            .status--unpaid {
              background-color: #fef3c7;
              color: #b45309;
            }
            .footer {
              text-align: center;
              margin-top: 60px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HÓA ĐƠN TIỀN PHÒNG / RENTAL INVOICE</div>
            <div class="subtitle">${t('landlord.month') || 'Tháng'} ${hd.thang}/${hd.nam}</div>
            <div class="status ${daTT ? 'status--paid' : 'status--unpaid'}">
              ${daTT ? 'ĐÃ THANH TOÁN / PAID' : 'CHƯA THANH TOÁN / UNPAID'}
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item"><span>Phòng / Room:</span> ${hd.phongTro?.tenPhong || '—'}</div>
            <div class="info-item"><span>Khách thuê / Tenant:</span> ${hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || '—'}</div>
            <div class="info-item"><span>Mã hóa đơn / Invoice ID:</span> #${hd.id}</div>
            <div class="info-item"><span>Ngày tạo / Created Date:</span> ${new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Khoản mục / Description</th>
                <th class="text-right">Thành tiền / Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tiền phòng / Room Rent</td>
                <td class="text-right">${hd.tienPhong?.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td>Tiền điện / Electricity</td>
                <td class="text-right">${hd.tienDien?.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td>Tiền nước / Water</td>
                <td class="text-right">${hd.tienNuoc?.toLocaleString()} ${currency}</td>
              </tr>
              <tr class="total-row">
                <td>Tổng thanh toán / Total</td>
                <td class="text-right">${hd.tongTien?.toLocaleString()} ${currency}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: space-between; margin-top: 80px;">
            <div style="text-align: center; width: 45%;">
              <p style="margin-bottom: 60px;"><strong>Người lập hóa đơn / Prepared By</strong><br/>(Ký, ghi rõ họ tên / Sign & Write Name)</p>
              <p style="color: #cbd5e1;">................................................</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <p style="margin-bottom: 60px;"><strong>Khách thuê phòng / Tenant</strong><br/>(Ký, ghi rõ họ tên / Sign & Write Name)</p>
              <p style="color: #cbd5e1;">................................................</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của Smart Room Rental! / Thank you for choosing Smart Room Rental!</p>
            <p>© 2026 Smart Room Rental.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="l-card" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="l-section-title">🧾 {t('landlord.invoice_manage_title')}</div>

      {unpaidInvoices.length > 0 && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'fadeInUp 0.3s ease',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t('landlord.debt_warning_title', { count: unpaidInvoices.length })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {t('landlord.debt_warning_total')} <strong style={{ color: 'var(--danger)', fontSize: '14px' }}>{totalUnpaidAmount.toLocaleString()}đ</strong>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {t('landlord.debt_warning_tip')}
          </div>
        </div>
      )}

      {hoaDons.length === 0 ? (
        <div className="l-empty" style={{ padding: '48px 0' }}>
          <img src={emptyInvoiceImg} alt="No invoices" style={{ width: '160px', marginBottom: '16px', opacity: 0.8 }} />
          <div className="l-empty__text">{t('landlord.no_invoices')}</div>
        </div>
      ) : (
        <div className="l-room-grid">
          {hoaDons.map((hd, i) => {
            const daTT = hd.trangThai === 'DA_THANH_TOAN';
            return (
              <div
                key={hd.id}
                className="l-invoice-card"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animation: 'fadeIn 0.35s ease both',
                  borderTop: `3px solid ${daTT ? 'var(--success)' : 'var(--danger)'}`,
                  boxShadow: !daTT ? '0 4px 12px rgba(239, 68, 68, 0.05)' : 'none',
                }}
              >
                {/* Header */}
                <div className="l-invoice-card__header">
                  <div>
                    <div className="l-invoice-card__room">
                      🏠 {hd.phongTro?.tenPhong}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {t('landlord.month')} {hd.thang}/{hd.nam}
                    </div>
                  </div>
                  <span className={`l-tag l-tag--${daTT ? 'green' : 'red'}`}>
                    {daTT ? t('landlord.status_paid') : `🚨 ${t('landlord.status_unpaid') || 'Chưa thanh toán'}`}
                  </span>
                </div>

                {/* Chi tiết */}
                <div className="l-info-row">
                  <span className="l-info-row__label">{t('landlord.room_fee_label')}</span>
                  <span className="l-info-row__value">{hd.tienPhong?.toLocaleString()} {t('landlord.currency')}</span>
                </div>
                <div className="l-info-row">
                  <span className="l-info-row__label">{t('landlord.utility_label')}</span>
                  <span className="l-info-row__value">{hd.tienDien?.toLocaleString()} {t('landlord.currency')} / {hd.tienNuoc?.toLocaleString()} {t('landlord.currency')}</span>
                </div>
                <div className="l-info-row">
                  <span className="l-info-row__label">{t('landlord.total_amount')}</span>
                  <span className="l-info-row__value" style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: 'bold' }}>
                    {hd.tongTien?.toLocaleString()} {t('landlord.currency')}
                  </span>
                </div>
                <div className="l-info-row" style={{ borderBottom: 'none' }}>
                  <span className="l-info-row__label">{t('landlord.tenant_label')}</span>
                  <span className="l-info-row__value" style={{ fontSize: '12px' }}>
                    {hd.khachHang?.khachHang?.hoTen || hd.khachHang?.username || '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="l-invoice-card__actions">
                  <button className="l-btn" style={{ flex: 1, fontSize: '12px' }} onClick={() => handleInHoaDon(hd)}>
                    🖨️ {t('landlord.btn_print')}
                  </button>
                  {!daTT && (
                    <button
                      className="l-btn l-btn--danger"
                      style={{ flex: 1, fontSize: '12px' }}
                      onClick={() => onCapNhatSo(hd)}
                    >
                      ✏️ {t('landlord.btn_update_number')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
