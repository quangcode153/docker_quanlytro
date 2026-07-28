import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ContractModal — Modal Hợp đồng thuê phòng trọ
 * 
 * Props:
 *   role: 'TENANT' | 'LANDLORD' — ai đang mở modal này
 *   - TENANT (khách thuê): chỉ được ký ô Bên B, ô Bên A bị khóa
 *   - LANDLORD (chủ trọ): chỉ được ký ô Bên A, ô Bên B đã ký sẵn & bị khóa
 */
export default function ContractModal({
  isOpen,
  onClose,
  phong,
  chuTroInfo,
  khachThueInfo,
  onConfirm,
  confirmText = "",
  isProcessing = false,
  role = 'TENANT',
  hopDong,
}) {
  const { t } = useTranslation();
  const [kyTenA, setKyTenA] = useState('');
  const [kyTenB, setKyTenB] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const printRef = useRef();

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  // Separate canvas ref used only to display a preview of Bên B's signature for the landlord
  const canvasPreviewBRef = useRef(null);

  // Helper: extract the best display name from an info object that may be
  // a flat KhachThue ({hoTen, username}) OR a nested TaiKhoan ({username, khachHang:{hoTen}})
  const resolveName = (info) =>
    info?.hoTen || info?.khachHang?.hoTen || info?.khachHang?.username || info?.username || '';

  // localStorage key: scoped per phong so each room's contract has its own signature storage
  const sigKey = phong?.id ? `contract_sig_phong_${phong.id}` : null;

  const saveSigToStorage = (updates) => {
    if (!sigKey) return;
    try {
      const prev = JSON.parse(localStorage.getItem(sigKey) || '{}');
      localStorage.setItem(sigKey, JSON.stringify({ ...prev, ...updates }));
    } catch (_) { }
  };

  const loadSigFromStorage = () => {
    if (!sigKey) return {};
    try { return JSON.parse(localStorage.getItem(sigKey) || '{}'); } catch (_) { return {}; }
  };

  // Draw a base64 dataURL back onto the canvas element
  const restoreCanvasFromDataURL = (dataURL) => {
    if (!canvasRef.current || !dataURL) return;
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(img, 0, 0, 240, 120);
      setIsCanvasEmpty(false);
    };
    img.src = dataURL;
  };

  const isAEditable = role === 'LANDLORD' && !!onConfirm;
  const isBEditable = role === 'TENANT' && !!onConfirm;

  // Initialize canvas context, then restore saved canvas strokes from localStorage
  useEffect(() => {
    let timer;
    if (isOpen && (isAEditable || isBEditable)) {
      timer = setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = 240 * 2;
          canvas.height = 120 * 2;
          canvas.style.width = '240px';
          canvas.style.height = '120px';

          const context = canvas.getContext('2d');
          context.scale(2, 2);
          context.lineCap = 'round';
          context.strokeStyle = '#1D4ED8'; // Blue ink
          context.lineWidth = 2.5;
          contextRef.current = context;

          context.clearRect(0, 0, 240, 120);
          setIsCanvasEmpty(true);

          // Restore this party's saved canvas from localStorage
          const saved = loadSigFromStorage();
          const savedCanvas = isAEditable ? saved.chuKyA : saved.chuKyB;
          if (savedCanvas) {
            restoreCanvasFromDataURL(savedCanvas);
          } else {
            // Auto-generate signature on canvas so the user sees it without drawing
            const nameToDraw = isAEditable ? (saved.kyTenA || resolveName(chuTroInfo)) : (saved.kyTenB || resolveName(khachThueInfo));
            if (nameToDraw) {
              context.font = 'italic 24px Georgia, "Times New Roman", cursive';
              context.fillStyle = '#1D4ED8';
              context.textAlign = 'center';
              context.textBaseline = 'middle';
              context.save();
              context.translate(120, 60);
              context.rotate(-0.05);
              context.fillText(nameToDraw, 0, 0);
              context.restore();
              setIsCanvasEmpty(false);
            }
          }
        }
      }, 150);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, role, isAEditable, isBEditable, chuTroInfo, khachThueInfo]);

  const startDrawing = ({ nativeEvent }) => {
    // If the canvas contains the auto-generated text, clear it on first draw attempt
    if (!isDrawing && canvasRef.current && contextRef.current) {
      const saved = loadSigFromStorage();
      const savedCanvas = isAEditable ? saved.chuKyA : saved.chuKyB;
      if (!savedCanvas) {
        contextRef.current.clearRect(0, 0, 240, 120);
      }
    }
    let clientX, clientY;
    if (nativeEvent.touches) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const { nativeEvent } = e;
    let clientX, clientY;
    if (nativeEvent.touches) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    setIsCanvasEmpty(false);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      // Save canvas to localStorage after each stroke
      if (canvasRef.current) {
        const dataURL = canvasRef.current.toDataURL('image/png');
        if (isAEditable) saveSigToStorage({ chuKyA: dataURL, kyTenA: kyTenA });
        else if (isBEditable) saveSigToStorage({ chuKyB: dataURL, kyTenB: kyTenB });
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, 240, 120);
      setIsCanvasEmpty(true);
      // Remove saved canvas from localStorage on clear
      if (isAEditable) saveSigToStorage({ chuKyA: null, kyTenA: null });
      else if (isBEditable) saveSigToStorage({ chuKyB: null, kyTenB: null });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (isOpen) {
      const landlordName = resolveName(chuTroInfo);
      const tenantName = resolveName(khachThueInfo);

      // Nếu không có hàm onConfirm (chỉ xem) hoặc là Landlord xem HĐ đã duyệt
      if (!onConfirm) {
        setKyTenA(landlordName);
        // For view-only, prefer stored name over profile name (preserves what was actually typed)
        const saved = loadSigFromStorage();
        setKyTenB(saved.kyTenB || tenantName);
        setKyTenA(saved.kyTenA || landlordName);
      } else {
        // Chế độ đang ký
        if (role === 'TENANT') {
          setKyTenA(landlordName);
          // Restore previously typed Bên B name if any
          const saved = loadSigFromStorage();
          setKyTenB(saved.kyTenB || '');
        } else {
          // LANDLORD signing: pre-fill Bên B with what tenant actually saved
          const saved = loadSigFromStorage();
          setKyTenA(saved.kyTenA || landlordName);
          setKyTenB(saved.kyTenB || tenantName);
        }
      }

      // Khởi tạo ngày bắt đầu và kết thúc
      if (hopDong) {
        setNgayBatDau(hopDong.ngayBatDau || '');
        setNgayKetThuc(hopDong.ngayKetThuc || '');
      } else {
        setNgayBatDau(new Date().toISOString().split('T')[0]);
        setNgayKetThuc('');
      }
    }
  }, [isOpen, chuTroInfo, khachThueInfo, role, onConfirm, hopDong]);

  if (!isOpen) return null;

  const today = new Date();
  const dots = t('contract.dots');

  const inputBase = {
    width: '100%', marginTop: '8px', padding: '8px 12px',
    border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
    fontFamily: 'inherit', color: '#333', boxSizing: 'border-box',
    outline: 'none', textAlign: 'center', fontStyle: 'italic',
  };
  const inputActive = { ...inputBase, background: '#fff', border: '1.5px solid #93C5FD' };
  const inputLocked = { ...inputBase, background: '#E5E7EB', color: '#6B7280', cursor: 'not-allowed' };

  const canConfirm = isAEditable
    ? kyTenA.trim().length > 0 && !isCanvasEmpty
    : isBEditable
      ? kyTenB.trim().length > 0 && !isCanvasEmpty
      : kyTenA.trim().length > 0 && kyTenB.trim().length > 0;

  // Rút ngắn dots nếu dài quá
  const safeDots = ".....................";

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: '650px',
        maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '40px',
        color: '#333'
      }} id="contract-printable">
        {/* Tiêu đề */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('contract.republic')}</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', textDecoration: 'underline', marginBottom: '20px' }}>{t('contract.motto')}</div>
          <h2 style={{ margin: '0', fontSize: '22px' }}>{t('contract.title')}</h2>
          <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '10px' }}>
            {t('contract.today_text', { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() })}
          </div>
        </div>

        {/* Bên A */}
        <div style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '14px' }}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px' }}>{t('contract.party_a')}</div>
          <div>{t('contract.mr_ms')} <strong>{resolveName(chuTroInfo) || safeDots}</strong></div>
          <div>{t('contract.phone')} {chuTroInfo?.soDienThoai || safeDots}</div>
        </div>

        {/* Bên B */}
        <div style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '14px' }}>
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px' }}>{t('contract.party_b')}</div>
          <div>{t('contract.mr_ms')} <strong>{resolveName(khachThueInfo) || safeDots}</strong></div>
          <div>{t('contract.id_card')} {khachThueInfo?.soCccd || khachThueInfo?.khachHang?.soCccd || safeDots}</div>
          <div>{t('contract.phone')} {khachThueInfo?.soDienThoai || khachThueInfo?.khachHang?.soDienThoai || safeDots}</div>
        </div>

        {/* Điều 1 */}
        <div style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '14px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{t('contract.article_1')}</div>
          <div>{t('contract.article_1_content')} <strong>{phong?.tenPhong}</strong></div>
          <div>{t('contract.address')} {phong?.diaChi || safeDots}</div>
          <div>{t('contract.area')} {phong?.dienTich || '.....'} m²</div>
        </div>

        {/* Điều 2 */}
        <div style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '14px' }}>
          <strong>{t('contract.article_2')}</strong>
          <div>- {t('contract.rent_price')} <strong style={{ color: '#2563EB' }}>{phong?.giaPhong?.toLocaleString() || 0} {t('landlord.unit_vnd') || 'VND'}/{t('landlord.month').toLowerCase()}</strong></div>
          <div>- {t('contract.deposit')} <strong style={{ color: '#D97706' }}>{phong?.tienCoc?.toLocaleString() || 0} {t('landlord.unit_vnd') || 'VND'}</strong></div>
          <div>- {t('contract.electric_price')} {phong?.giaDien ? `${phong.giaDien.toLocaleString()} ${t('landlord.unit_kwh')}` : dots}</div>
          <div>- {t('contract.water_price')} {phong?.giaNuoc ? `${phong.giaNuoc.toLocaleString()} ${t('landlord.unit_m3')}` : dots}</div>

          {/* Thời hạn hợp đồng - Nhập liệu/Hiển thị động */}
          <div style={{ marginTop: '12px', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#1E293B', fontSize: '13px' }}>{t('contract.duration_title')}</span>
            {onConfirm ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>{t('contract.start_date')}</label>
                  <input
                    type="date"
                    value={ngayBatDau}
                    onChange={e => isBEditable && setNgayBatDau(e.target.value)}
                    disabled={!isBEditable}
                    style={isBEditable ? inputActive : inputLocked}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>{t('contract.end_date')}</label>
                  <input
                    type="date"
                    value={ngayKetThuc}
                    onChange={e => (isBEditable || isAEditable) && setNgayKetThuc(e.target.value)}
                    disabled={!(isBEditable || isAEditable)}
                    style={(isBEditable || isAEditable) ? inputActive : inputLocked}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>{t('contract.start_date')}</strong> {ngayBatDau || '—'}</div>
                <div><strong>{t('contract.end_date')}</strong> {ngayKetThuc || t('contract.indefinite')}</div>
                <div style={{ gridColumn: '1 / -1', marginTop: '6px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>{t('contract.locked_note')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Điều 3 */}
        <div style={{ marginBottom: '32px', lineHeight: '1.8', fontSize: '14px' }}>
          <strong>{t('contract.article_3')}</strong>
          <div>- {t('contract.responsibility_1')}</div>
          <div>- {t('contract.responsibility_2')}</div>
          <div>- {t('contract.responsibility_3')}</div>
        </div>

        {/* ===== Phần KÝ TÊN ===== */}
        <div style={{
          padding: '20px', marginBottom: '20px',
          background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px',
        }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '18px', color: '#0369A1' }}>
            ✍️ {t('contract.sign_title')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Bên A */}
            <div style={{
              textAlign: 'center', padding: '18px 14px',
              border: `1px dashed ${isAEditable ? '#3B82F6' : '#D1D5DB'}`,
              borderRadius: '10px',
              background: isAEditable ? '#fff' : '#F3F4F6',
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>{t('contract.party_a_rep')}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px', fontStyle: 'italic' }}>{t('contract.party_a_desc')}</div>

              {isAEditable ? (
                <>
                  <input
                    type="text"
                    placeholder={t('contract.sign_placeholder')}
                    value={kyTenA}
                    onChange={e => setKyTenA(e.target.value)}
                    style={inputActive}
                  />
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '6px' }}>Ký tên bằng chuột / Draw signature:</div>
                    <div style={{ border: '1.5px solid #93C5FD', borderRadius: '8px', background: '#fff', width: '240px', height: '120px', cursor: 'crosshair', overflow: 'hidden' }}>
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ display: 'block' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      style={{
                        marginTop: '6px', padding: '2px 8px', fontSize: '11px',
                        color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '4px',
                        background: '#FEF2F2', cursor: 'pointer'
                      }}
                      className="no-print"
                    >
                      🔄 Xóa chữ ký / Clear
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={inputLocked}>{kyTenA || safeDots}</div>
                  {kyTenA.trim() ? (
                    <>
                      <div style={{
                        marginTop: '10px',
                        border: '1.5px solid #93C5FD',
                        borderRadius: '8px',
                        background: '#F0F9FF',
                        width: '160px',
                        height: '70px',
                        margin: '10px auto 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          fontSize: `${Math.max(14, Math.min(26, Math.floor(160 / (kyTenA.length * 0.7 + 1))))}px`,
                          fontStyle: 'italic',
                          fontFamily: 'Georgia, "Times New Roman", cursive',
                          color: '#1D4ED8',
                          letterSpacing: '1px',
                          userSelect: 'none',
                          padding: '4px 8px',
                          textAlign: 'center',
                          lineHeight: 1.4,
                          borderBottom: '2px solid #1D4ED8',
                          transform: 'rotate(-4deg)',
                        }}>
                          {kyTenA}
                        </div>
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>🔒 {t('contract.signed')}</div>
                    </>
                  ) : (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>{t('contract.waiting_a')}</div>
                  )}
                </>
              )}
            </div>

            {/* Bên B */}
            <div style={{
              textAlign: 'center', padding: '18px 14px',
              border: `1px dashed ${isBEditable ? '#3B82F6' : '#D1D5DB'}`,
              borderRadius: '10px',
              background: isBEditable ? '#fff' : '#F3F4F6',
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>{t('contract.party_b_rep')}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px', fontStyle: 'italic' }}>{t('contract.party_b_desc')}</div>

              {isBEditable ? (
                <>
                  <input
                    type="text"
                    placeholder={t('contract.sign_placeholder')}
                    value={kyTenB}
                    onChange={e => {
                      setKyTenB(e.target.value);
                      saveSigToStorage({ kyTenB: e.target.value });
                    }}
                    style={inputActive}
                  />
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '6px' }}>Ký tên bằng chuột / Draw signature:</div>
                    <div style={{ border: '1.5px solid #93C5FD', borderRadius: '8px', background: '#fff', width: '240px', height: '120px', cursor: 'crosshair', overflow: 'hidden' }}>
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{ display: 'block' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      style={{
                        marginTop: '6px', padding: '2px 8px', fontSize: '11px',
                        color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '4px',
                        background: '#FEF2F2', cursor: 'pointer'
                      }}
                      className="no-print"
                    >
                      🔄 Xóa chữ ký / Clear
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={inputLocked}>{kyTenB || safeDots}</div>
                  {kyTenB.trim() ? (
                    <>
                      {/* Show real canvas signature from localStorage if available */}
                      {(() => {
                        const saved = loadSigFromStorage();
                        return saved.chuKyB ? (
                          <img
                            src={saved.chuKyB}
                            alt="signature"
                            style={{
                              display: 'block',
                              margin: '10px auto 0',
                              width: '160px',
                              height: '70px',
                              border: '1.5px solid #93C5FD',
                              borderRadius: '8px',
                              background: '#F0F9FF',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          // Fallback: cursive text signature
                          <div style={{
                            marginTop: '10px',
                            border: '1.5px solid #93C5FD',
                            borderRadius: '8px',
                            background: '#F0F9FF',
                            width: '160px', height: '70px',
                            margin: '10px auto 0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              fontSize: `${Math.max(14, Math.min(26, Math.floor(160 / (kyTenB.length * 0.7 + 1))))}px`,
                              fontStyle: 'italic',
                              fontFamily: 'Georgia, "Times New Roman", cursive',
                              color: '#1D4ED8', letterSpacing: '1px',
                              userSelect: 'none', textAlign: 'center',
                              borderBottom: '2px solid #1D4ED8',
                              transform: 'rotate(-4deg)',
                            }}>{kyTenB}</div>
                          </div>
                        );
                      })()}
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>🔒 {t('contract.signed')}</div>
                    </>
                  ) : (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>{t('contract.waiting_b')}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cảnh báo */}
        {!canConfirm && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px', background: '#FEF3C7',
            border: '1px solid #FCD34D', borderRadius: '8px',
            fontSize: '13px', color: '#92400E', textAlign: 'center',
          }}>
            ⚠️ {role === 'TENANT' ? t('contract.warning_tenant') : t('contract.warning_landlord')}
          </div>
        )}

        {/* Nút bấm */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }} className="no-print">
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 22px', border: '1px solid var(--accent)',
              borderRadius: '8px', background: 'var(--accent-light)',
              color: 'var(--accent)',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              marginRight: 'auto'
            }}>
            🖨️ {t('landlord.btn_print')}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              padding: '10px 22px', border: '1px solid #D1D5DB',
              borderRadius: '8px', background: '#F9FAFB',
              cursor: 'pointer', fontWeight: 500, fontSize: '14px'
            }}>
            {t('contract.btn_cancel')}
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                // Save final canvas + name to localStorage before confirming
                if (canvasRef.current) {
                  const dataURL = canvasRef.current.toDataURL('image/png');
                  if (isAEditable) saveSigToStorage({ chuKyA: dataURL, kyTenA });
                  else if (isBEditable) saveSigToStorage({ chuKyB: dataURL, kyTenB });
                }
                onConfirm({ ngayBatDau, ngayKetThuc, kyTenA, kyTenB });
              }}
              disabled={isProcessing || !canConfirm}
              style={{
                padding: '10px 22px', border: 'none', borderRadius: '8px',
                background: canConfirm ? '#2563EB' : '#9CA3AF',
                color: '#fff',
                cursor: canConfirm && !isProcessing ? 'pointer' : 'not-allowed',
                fontWeight: 'bold', fontSize: '14px',
                transition: 'background 0.2s',
              }}>
              {isProcessing ? `⏳ ${t('contract.btn_processing')}` : `✅ ${confirmText || t('contract.btn_cancel')}`}
            </button>
          )}
        </div>

        {/* CSS for Printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #contract-printable, #contract-printable * {
              visibility: visible;
            }
            #contract-printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              box-shadow: none;
              overflow: visible;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
