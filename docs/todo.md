# ✅ TODO — Kế hoạch Phát triển

> Sắp xếp theo mức độ ưu tiên và nhóm chức năng.
> Tick `[x]` khi hoàn thành, di chuyển sang `progress.md`.

---

## 🔴 Sprint Hiện tại — Ưu tiên Cao

### 1. Fix Token mất sau Reload (F5)
**Vấn đề:**
- Expected: Request luôn có `Authorization: Bearer <token>`
- Actual: Một số request gửi đi không có header → 401 → bị đá về login

**Hướng debug:**
```js
// Thêm vào Interceptor để kiểm tra
api.interceptors.request.use((config) => {
  console.log('[Interceptor]', config.headers.Authorization); // Có token không?
  return config;
});
// Mở Console → F5 → xem log có in ra Bearer không
```

**Hướng fix:** Đảm bảo `isLoadingAuth === false` trước khi render bất kỳ component nào gọi API. Hiện tại `ProtectedRoute` đã có gate này — kiểm tra xem có component nào gọi API ngoài luồng không.

- [ ] Thêm log vào Interceptor
- [ ] Xác nhận `ProtectedRoute` đang block đúng
- [ ] Test lại sau reload

---

### 2. Hoàn thiện UI Điện nước & Hóa đơn

**Backend đã xong.** Chỉ cần làm phần Frontend.

**LandlordPage — Thêm tab "Điện nước":**
- [x] Form nhập chỉ số: chọn HĐ, nhập tháng/năm, chỉ số đầu/cuối điện và nước
- [x] Gọi `POST /api/dien-nuoc/chot-so`
- [x] Hiển thị hóa đơn vừa tạo ngay sau khi chốt
- [x] Lịch sử chỉ số theo từng phòng

**TenantPage — Thêm tab "Hóa đơn":**
- [x] Badge "chưa thanh toán" nếu còn nợ

---

## 🟡 Sprint Tiếp theo — Ưu tiên Trung bình

### 3. Thay alert() bằng Toast Notification
- [ ] Cài `sonner` hoặc `react-toastify`
- [ ] Tạo helper: `toast.success()`, `toast.error()`, `toast.confirm()`
- [ ] Thay toàn bộ `alert()` / `window.confirm()` trong tất cả pages và components

### 4. Dashboard Thống kê
- [ ] **BE:** API `GET /thong-ke/doanh-thu?thang=5&nam=2025&landlordId=1`
- [ ] **FE:** Component biểu đồ cột (recharts) tổng thu theo tháng
- [ ] **FE:** Thẻ thống kê nhanh: tổng phòng, phòng trống, phòng đang thuê
- [ ] Hiển thị ở AdminPage (toàn hệ thống) và LandlordPage (theo khu trọ)

### 5. Audit Enum Hardcode
- [ ] Tìm kiếm toàn bộ `'Trống'`, `'Đã thuê'`, `'CHỜ_DUYỆT'`... trong FE
- [ ] Thay bằng `ROOM_STATUS.EMPTY`, `CONTRACT_STATUS.PENDING`... từ `constants.js`

---

## 🟢 Backlog — Ưu tiên Thấp

### 6. Refactor ID sang Long
- [x] Đổi `Integer` → `Long` trong Entity: `TinNhan`, `ChiSoDienNuoc`, `HoaDon`
- [x] Cập nhật DTO và Repository
- [x] Viết migration script nếu đã có data (Ghi chú: Đã đồng bộ code)

### 7. Push Notification Realtime
- [ ] Thiết kế event schema: `{ type, title, targetUserId, payload }`
- [ ] Backend broadcast qua WebSocket khi: HĐ được duyệt, hóa đơn mới, khiếu nại được xử lý
- [ ] FE: Badge số đỏ trên icon chuông ở Header
- [ ] FE: Dropdown danh sách thông báo chưa đọc

### 8. Bảng tin (Thông báo từ Chủ trọ)
- [ ] LandlordPage: Form đăng thông báo mới
- [ ] TenantPage tab "Bảng tin": hiển thị thông báo từ chủ trọ của mình

---

## 💡 Đề xuất Tính năng Mới (Feature Roadmap)

> Những tính năng này sẽ giúp dự án hoàn thiện và có thể thương mại hóa.

### 🏆 High Value

| Tính năng | Mô tả | Độ khó |
|---|---|---|
| **QR Payment** | Tạo QR VNPay/MoMo từ hóa đơn, khách quét là thanh toán | Trung bình |
| **Export PDF Hóa đơn** | Chủ trọ xuất hóa đơn PDF gửi cho khách | Thấp |
| **Auto Email Hóa đơn** | Gửi email tự động khi có hóa đơn mới (Spring Mail) | Thấp |
| **Ký HĐ điện tử** | Upload ảnh CMND + xác nhận điều khoản online | Cao |

### 📈 Growth Features

| Tính năng | Mô tả | Độ khó |
|---|---|---|
| **Đánh giá Chủ trọ** | Khách thuê rating + review sau khi rời phòng | Thấp |
| **Lịch sử phòng** | Timeline: ai thuê từ khi nào, điện nước mỗi tháng | Thấp |
| **Tìm phòng nâng cao** | Filter theo giá, khu vực, tiện ích; map tích hợp | Cao |
| **Báo cáo tài chính** | Xuất Excel báo cáo thu/chi theo quý | Trung bình |
| **Multi-landlord Admin** | Admin quản lý nhiều chủ trọ theo khu vực | Cao |

### 🔒 Security & Performance

| Tính năng | Mô tả | Độ khó |
|---|---|---|
| **Refresh Token** | Tự động làm mới JWT không cần login lại | Trung bình |
| **Rate Limiting** | Giới hạn request/phút để chống spam/brute-force | Thấp |
| **Image Upload** | Chủ trọ upload ảnh phòng (Cloudinary/S3) | Trung bình |
| **2FA** | Xác thực 2 bước qua OTP SMS/Email cho Admin | Cao |
