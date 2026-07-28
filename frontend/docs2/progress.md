# 📊 Progress — Tiến độ Dự án

> Cập nhật mỗi khi hoàn thành hoặc bắt đầu một module mới.
> **Cập nhật lần cuối:** 03/06/2026

---

## Tổng quan nhanh

```
Auth & Security     ████████████ 100%  ✅
Core CRUD           ████████████ 100%  ✅
Chat Realtime       ████████████ 100%  ✅
Hồ sơ & Khiếu nại  ████████████ 100%  ✅
Điện nước & Hóa đơn ████████████ 100%  ✅
Tìm kiếm Nâng cao   ████████████ 100%  ✅
Hủy Hợp đồng        ████████████ 100%  ✅
UI/UX               ████████████ 100%  ✅
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
- [x] Tích hợp Social Login (Chỉ sử dụng Google OAuth2, đã loại bỏ Facebook)

### ✅ CRUD Phòng trọ & Tìm kiếm (100%)
- [x] Thêm / Sửa / Xóa phòng (Landlord)
- [x] Cascade Delete thông minh giải phóng chỉ số điện nước & hóa đơn liên quan khi xóa phòng
- [x] Auto đổi trạng thái phòng khi HĐ được duyệt/hủy
- [x] Bộ lọc nâng cao: Tìm kiếm theo tên phòng, địa chỉ, khoảng giá phòng trống trực tiếp trên Chợ tìm trọ (Frontend GuestPage)
- [x] API tìm kiếm động `/api/phong-tro/search` hỗ trợ lọc JPQL `@Query` nhiều tiêu chí

### ✅ Quản lý Hợp đồng & Hủy Hợp đồng (100%)
- [x] Guest gửi yêu cầu thuê (validate hồ sơ trước)
- [x] Landlord duyệt / từ chối
- [x] Polling trạng thái HĐ mỗi 10s (App.jsx)
- [x] Màn hình chờ duyệt cho Guest/User
- [x] Luồng khách hủy hợp đồng (`khach-huy` ➡️ status `YEU_CAU_HUY` ➡️ Landlord duyệt thanh lý/hủy mới hoàn toàn giải phóng phòng về `TRONG`).

### ✅ Điện nước & Hóa đơn (100%)
- [x] Entity: `ChiSoDienNuoc`, `HoaDon`
- [x] Service: tính tiền tự động, tạo hóa đơn tự động khi chốt số
- [x] FE: Form chốt chỉ số cho Landlord
- [x] FE: Trang xem danh sách và chi tiết hóa đơn cho Tenant
- [x] Tích hợp thanh toán QR Code động tiện lợi cho từng hóa đơn

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

### ✅ UI/UX Nâng cấp (100%)
- [x] Design system thống nhất (Soft Pink Pastel, Outfit Font)
- [x] Lazy loading pages
- [x] Responsive layout cho cả PC & Mobile
- [x] ChatBox redesign (avatar, bubble styles)
- [x] Hộp thoại ConfirmModal.jsx cao cấp và thân thiện (sửa đơ nút Xác nhận, tự động ẩn nút Hủy khi hiển thị thông báo thành công)
- [x] Empty states, loading states chuyên nghiệp

---

## 🐛 Bugs & Issues

| # | Mức | Mô tả | Trạng thái | Giải pháp |
|---|---|---|---|---|
| 1 | 🔴 | Token mất sau reload F5 | ✅ Fixed | Sửa AuthContext để kiểm tra localStorage trước khi gọi API me |
| 2 | 🟡 | ID Chat/Điện nước dùng Integer | ✅ Fixed | Đã đồng bộ sang kiểu Long toàn bộ thực thể để tránh tràn dữ liệu |
| 3 | 🟢 | Dùng `alert()` thô | ✅ Fixed | Thay thế toàn bộ bằng ConfirmModal thiết kế cao cấp và thân thiện |
| 4 | 🟡 | Chat thiếu hiển thị mốc thời gian (Lỗi 10) | ✅ Fixed | Thêm format và hiển thị HH:mm hoặc dd/MM HH:mm dưới tin nhắn |
| 5 | 🔴 | Giá tiền & Diện tích chấp nhận số âm (Lỗi 11) | ✅ Fixed | Dùng @DecimalMin ở backend và min="0" ở input frontend |
| 6 | 🟡 | Admin thiếu thống kê phòng hệ thống trực quan (Lỗi 13) | ✅ Fixed | Xây dựng API thống kê phòng và hiển thị nhóm 3 thẻ ở đầu tab PHONG |
| 7 | 🟡 | Chủ trọ khó theo dõi các hóa đơn chưa thanh toán (Lỗi 14) | ✅ Fixed | Viết API lọc hóa đơn theo trạng thái và thêm nút lọc ở Frontend |
