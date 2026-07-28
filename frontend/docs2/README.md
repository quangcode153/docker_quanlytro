# 🏠 Smart Room Rental — Hệ thống Quản lý Phòng trọ Thông minh

> **Stack:** Spring Boot 3 · React 18 · JWT · MySQL · WebSocket
> **Mindset:** Tài liệu tập trung vào Trạng thái + Hành động + Vấn đề + Ranh giới hệ thống.

---

## 🎯 Mục tiêu dự án

Số hóa toàn bộ vòng đời vận hành nhà trọ — từ khi khách tìm phòng đến khi thanh toán hóa đơn hàng tháng — thay thế hoàn toàn quy trình giấy tờ, tin nhắn thủ công và tính tiền bằng tay.

---

## 👥 Đối tượng người dùng

| Role | Mô tả | Quyền chính |
|---|---|---|
| `ROLE_ADMIN` | Quản trị viên hệ thống | Toàn quyền: khóa TK, xem khiếu nại, xem tất cả khu trọ |
| `ROLE_LANDLORD` | Chủ nhà trọ | Quản lý phòng, duyệt hợp đồng, chốt điện nước |
| `ROLE_USER` | Khách đang thuê | Xem HĐ, chat chủ trọ, xem hóa đơn, gửi khiếu nại |
| Guest | Khách vãng lai (chưa có HĐ) | Tìm phòng, đăng ký tài khoản, gửi yêu cầu thuê |

---

## ✨ Tính năng hiện có

| Module | Trạng thái | Ghi chú |
|---|---|---|
| Authentication & JWT | ✅ Hoàn thiện | Stateless, localStorage |
| Phân quyền UI theo Role | ✅ Hoàn thiện | ProtectedRoute, role-based render |
| CRUD Phòng trọ | ✅ Hoàn thiện | **Update:** Hỗ trợ tải ảnh từ máy (Base64), chặn xóa khi có khách |
| Quản lý Hợp đồng | ✅ Hoàn thiện | Tạo mới, gia hạn, thanh lý, tiền cọc, xuất PDF |
| Chat Realtime | ✅ Hoàn thiện | WebSocket STOMP + Optimistic UI |
| Hồ sơ cá nhân | ✅ Hoàn thiện | Validate CCCD + SĐT trước khi thuê |
| Khiếu nại | ✅ Hoàn thiện | Gửi → Admin xử lý → Đánh dấu hoàn thành |
| Quản lý người dùng | ✅ Hoàn thiện | Admin khóa/mở khóa tài khoản |
| Nâng cấp UI | ✅ Hoàn thiện | Design system thống nhất, lazy loading |
| Dashboard thống kê | ✅ Hoàn thiện | Biểu đồ doanh thu + Xuất Excel |
| Điện nước & Hóa đơn | ✅ Hoàn thiện | Đã khớp dữ liệu chốt số và in hóa đơn |
| Xuất Hợp đồng (PDF) | ✅ Hoàn thiện | Template chuẩn theo văn bản pháp lý |
| Push Notification | ⏭️ Kế hoạch | Thông báo realtime khi có sự kiện |
| Đăng nhập Google/Facebook | ⏭️ Kế hoạch | Tích hợp OAuth2 (Sẽ thực hiện sau cùng) |

---

## 🛠 Thư viện & Công cụ bổ sung (Frontend)

Nếu bạn là thành viên mới, hãy chạy lệnh sau để cài đặt các thư viện phục vụ việc xuất file:
```bash
npm install jspdf html2canvas xlsx
```

---

## 📡 API Reference (Dành cho Frontend) - Cập nhật mới nhất

### 1. Quản lý Hợp đồng & Phòng trọ
- `PUT /api/hop-dong/{id}/trang-thai?trangThai=DA_DUYET&ngayKetThuc=YYYY-MM-DD`: Duyệt hợp đồng và thiết lập ngày kết thúc.
- `PUT /api/hop-dong/{id}/gia-han?ngayKetThucMoi=YYYY-MM-DD`: Gia hạn hợp đồng hiện tại.
- `PUT /api/hop-dong/{id}/thanh-ly`: Kết thúc hợp đồng sớm, giải phóng phòng (tự động đổi trạng thái phòng về `TRONG`).
- `DELETE /api/phong-tro/{id}`: **Cascade Delete** - Xóa sạch phòng + HĐ + Hóa đơn + Chỉ số điện nước liên quan. (Chặn xóa nếu phòng đang `DA_THUE`).
- `POST /api/phong-tro`: **Base64 Support** - Trường `hinhAnh` đã nâng cấp lên `LONGTEXT` để chứa ảnh upload trực tiếp từ máy.

### 2. Thông tin bổ sung
- `tienCoc`: Đã được thêm vào cả `PhongTro` (Tiền cọc mặc định) và `HopDong` (Tiền cọc thực tế).
- `GET /api/khach-hang/chi-tiet/{id}`: Đã fix lỗi 403, chủ trọ có thể lấy profile của chính mình để điền vào hợp đồng.

---

## 📁 Cấu trúc thư mục bổ sung
```
src/
├── utils/
│   └── exportUtils.js          ← Logic xuất PDF (jspdf) và Excel (xlsx)
├── pages/Landlord/components/
│   └── ContractPDFTemplate.jsx ← Template HĐ ẩn để html2canvas chụp lại
```

---

## 🚀 Khởi chạy dự án

### Backend
```bash
# Yêu cầu: Java 17+, MySQL đang chạy
# spring.jpa.hibernate.ddl-auto=update (Để tự động thêm cột tien_coc và LONGTEXT)
mvn spring-boot:run
```

### Frontend
```bash
npm install
npm run dev
```
