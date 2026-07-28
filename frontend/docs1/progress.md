# 📊 Progress — Tiến độ Dự án

> Cập nhật mỗi khi hoàn thành hoặc bắt đầu một module mới.
> **Cập nhật lần cuối:** Tháng 5/2025

---

## Tổng quan nhanh

```
Auth & Security     ████████████ 100%  ✅
Core CRUD           ████████████ 100%  ✅
Chat Realtime       ████████████ 100%  ✅
Hồ sơ & Khiếu nại  ████████████ 100%  ✅
UI/UX & i18n        ████████████ 100%  ✅
Điện nước & HĐ      ████████████ 100%  ✅
Dashboard           ████████████ 100%  ✅
Notification        ░░░░░░░░░░░░   0%  ⏭️
```

---

## Chi tiết từng module

### ✅ Auth & Security (100%)
- [x] Đăng nhập / Đăng ký
- [x] JWT stateless, lưu localStorage
- [x] Phân quyền 4 role: Admin, Landlord, User, Guest
- [x] Khóa / Mở khóa tài khoản (Admin)
- [x] Axios Interceptor gắn token + xử lý 401/403
- [x] ProtectedRoute + lazy loading pages
- [x] AuthContext với fetchMe, loginSuccess, logout

### ✅ CRUD Phòng trọ (100%)
- [x] Thêm / Sửa / Xóa phòng (Landlord)
- [x] Auto đổi trạng thái phòng khi HĐ được duyệt/hủy
- [x] Admin xem toàn bộ khu trọ theo chủ
- [x] Race condition guard (`existsByPhongTroIdAndTrangThai`)

### ✅ Quản lý Hợp đồng (100%)
- [x] Guest gửi yêu cầu thuê (validate hồ sơ trước)
- [x] Landlord duyệt / từ chối
- [x] Polling trạng thái HĐ mỗi 10s (App.jsx)
- [x] Màn hình chờ duyệt cho Guest/User

### ✅ Chat Realtime (100%)
- [x] WebSocket SockJS + STOMP
- [x] Optimistic UI
- [x] Chống duplicate tin nhắn
- [x] Dynamic WebSocket URL (không hardcode localhost)
- [x] Clear history khi đổi người chat

### ✅ Hồ sơ & Khiếu nại (100%)
- [x] Tạo / Cập nhật hồ sơ cá nhân
- [x] Validate đầy đủ (CCCD + SĐT) trước khi gửi yêu cầu thuê
- [x] Gửi khiếu nại từ mọi role
- [x] Admin xem và đánh dấu đã xử lý

### ✅ UI/UX & Quốc tế hóa (i18n) (100%)
- [x] Design system thống nhất (style object, design tokens)
- [x] Lazy loading pages
- [x] Responsive layout
- [x] ChatBox redesign (avatar, bubble styles)
- [x] Modal chi tiết phòng & Hợp đồng đầy đủ chữ ký
- [x] Đa ngôn ngữ (i18next) - Viết/Anh toàn hệ thống
- [x] Empty states, loading states

### ✅ Điện nước & Hóa đơn (100%)
- [x] Entity: `ChiSoDienNuoc`, `HoaDon`
- [x] Service: tính tiền tự động, tạo hóa đơn
- [x] API endpoints: `POST /dien-nuoc/chot-so`, `GET /hoa-don/me`
- [x] FE: Form nhập chỉ số, Cập nhật & Xuất hóa đơn cho Landlord
- [x] FE: Trang xem hóa đơn & Thanh toán QR cho Tenant
- [x] Test end-to-end flow hoàn tất

### ✅ Dashboard Thống kê (100%)
- [x] API thống kê doanh thu theo tháng/năm
- [x] Biểu đồ cột Thống kê biến động (Landlord Dashboard)
- [x] Tỉ lệ phòng trống/đã thuê, Công nợ chưa thu

### ⏭️ Push Notification (0%)
- [ ] Thiết kế luồng: Server push → client
- [ ] Các event: yêu cầu thuê mới, HĐ duyệt, hóa đơn mới
- [ ] Badge số đỏ trên Header

---

## 🐛 Bugs & Issues

| # | Mức | Mô tả | Nguyên nhân nghi ngờ |
|---|---|---|---|
| 1 | 🟢 | Token mất sau reload F5 | Fixed (Interceptor + Loading Auth) |
| 2 | 🟢 | Còn hardcode enum tiếng Việt | Fixed (Audit i18n toàn hệ thống) |
| 3 | 🟢 | ID Chat/Điện nước dùng Integer | Fixed (Đã migrate sang Long) |
| 4 | 🟢 | Tin nhắn lặp khi gửi | Fixed (De-duplication logic) |
| 5 | 🟡 | Dùng `alert()` thô | (Sắp tới: Toast Library) |
