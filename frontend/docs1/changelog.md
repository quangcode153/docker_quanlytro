# 📝 Changelog — Lịch sử Phát triển

> Ghi lại các thay đổi, tính năng mới, và sửa lỗi theo thời gian để dễ dàng theo dõi quá trình phát triển của dự án.

---

## [2026-05-16] - Hoàn thiện Hệ thống: i18n & Hợp đồng Điện tử

### Tính năng mới (Feature)
- **Internationalization (i18n):** Triển khai đa ngôn ngữ toàn diện (Tiếng Việt & Tiếng Anh) cho toàn bộ hệ thống (Landing Page, Dashboard, Chat, Billing).
- **Hợp đồng Điện tử:** Khách thuê hiện đã có thể xem trực tiếp nội dung hợp đồng và thực hiện ký tên điện tử ngay trên giao diện `TenantPage`.
- **Giao diện (UI):** Thiết kế lại trang chủ (`HomePage`) và trang đăng nhập (`Login`) theo phong cách hiện đại, chuyên nghiệp.
- **Admin:** Bổ sung tính năng quản lý danh sách phòng theo từng chủ trọ và xử lý khiới nại tập trung.

### Sửa lỗi & Tối ưu (Fixes & Optimization)
- **ChatBox:** Sửa triệt để lỗi lặp tin nhắn (duplicate messages) bằng cơ chế lọc ID và đối chiếu nội dung thực tế.
- **Auth:** Khắc phục lỗi hiển thị nhầm vai trò (Role) trong Header sau khi đăng ký thành công.
- **Tài liệu:** Cập nhật toàn bộ `docs/` gồm: Architecture, Integration, Decisions và tạo bản tổng kết `project_summary.md`.

---

## [2026-05-14] - Bổ sung thông tin phòng trọ và API tìm kiếm

### Tính năng mới (Feature)
- **Backend (Entity):** Thêm các trường dữ liệu mới cho `PhongTro` gồm `giaDien`, `giaNuoc`, `diaChi`, `dienTich`, `hinhAnh` nhằm hỗ trợ quản lý phòng chi tiết hơn.
- **Backend (API):** Bổ sung API `GET /api/phong-tro/search` dùng `@Query` (JPQL) để tìm kiếm và lọc phòng trọ linh hoạt theo `tenPhong`, `giaToiThieu`, `giaToiDa`, và `trangThai`.

---

## [2026-05-14] - Fix Bugs Đăng ký & Hóa đơn

### Sửa lỗi (Hotfix)
- **Backend (Auth):** Bổ sung trường `role` bị thiếu và sửa hàm `getRole()` trong `AuthRequestDTO.java` để fix lỗi tài khoản chủ trọ đăng ký luôn bị ép thành quyền `ROLE_USER`.
- **Backend (Controller):** Bổ sung phương thức `xoaHoaDon(@PathVariable Long id)` còn thiếu trong `HoaDonController` (đã có ở Service nhưng quên expose API ra) giúp fix lỗi biên dịch trong Unit Test và hoàn thiện chức năng xóa hóa đơn bị sai.

---

## [2026-05-03] - Tính năng Cốt lõi: Điện Nước & Hóa Đơn

### Tính năng mới (Feature)
- **Chủ trọ:** Thêm tab `💰 Điện Nước` vào trang quản lý. Bổ sung Modal form chốt chỉ số điện/nước hàng tháng, tự động gọi API để xuất hóa đơn.
- **Khách thuê:** Thêm tab `🧾 Hóa đơn` vào bảng điều khiển. Tự động lấy danh sách hóa đơn từ hệ thống, hiển thị chi tiết các khoản phí và trạng thái thanh toán.

### Sửa lỗi (Hotfix)
- **Backend:** Bổ sung API `GET /api/hoa-don/me` bị thiếu trong thiết kế ban đầu. Cập nhật `HoaDonRepository`, `HoaDonService`, `HoaDonController` để khách thuê có thể lấy danh sách hóa đơn dựa trên các hợp đồng đang thuê (`DA_DUYET`).
- **Frontend:** Sửa lỗi lệch cấu trúc JSON payload gửi lên khi gọi API `POST /api/dien-nuoc/chot-so` ở `LandlordPage` (đồng bộ field theo entity `ChiSoDienNuoc.java`).

---

## [2026-05-03] - Cấu trúc lại dự án (Monorepo)

### Thay đổi kiến trúc (Refactor)
- Tách dự án thành 2 thư mục độc lập `frontend/` và `backend/` để dễ quản lý.
- Di chuyển toàn bộ mã nguồn Spring Boot, `pom.xml`, `mvnw` vào thư mục `backend/`.
- Di chuyển toàn bộ mã nguồn ReactJS (`src copy/` đổi lại thành `src/`), `package.json`, `vite.config.js` vào thư mục `frontend/`.
- Giữ các tài liệu dự án trong thư mục `docs/` ở cấp cao nhất.

---

## [2026-05-03] - Refactor & Đồng bộ kiểu dữ liệu Backend

### Sửa lỗi (Fixes)
- Khắc phục lỗi lệch kiểu dữ liệu (Type Mismatch) giữa Entity và Repository bằng cách đổi generic của `HoaDonRepository` và `KhachHangRepository` sang `Long`.
- Cập nhật tham số của phương thức xóa hóa đơn trong `HoaDonService` và `HoaDonController` từ `Integer` sang `Long` để tránh lỗi khi thao tác với ID.

### Thay đổi kiến trúc (Refactor)
- Đồng bộ kiểu dữ liệu của khóa chính (ID) từ `Integer` sang `Long` cho các Entity: `ChiSoDienNuoc`, `TinNhan`, `NhatKyHoatDong`.
- Chuyển kiểu dữ liệu các trường liên kết ID người dùng (`nguoiGuiId`, `nguoiNhanId` trong `TinNhan` và `userId` trong `NhatKyHoatDong`) sang `Long` để thống nhất với Entity `TaiKhoan`.
- Cập nhật các Repository tương ứng (`ChiSoDienNuocRepository`, `NhatKyRepository`, `TinNhanRepository`) để sử dụng `Long`.

### Khác
- Đánh dấu hoàn thành task "Refactor ID sang Long" trong `todo.md`.
