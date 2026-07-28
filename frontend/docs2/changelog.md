# 📝 Changelog — Lịch sử Phát triển

> Ghi lại các thay đổi, tính năng mới, và sửa lỗi theo thời gian để dễ dàng theo dõi quá trình phát triển của dự án.

---

## [2026-06-05] - Loại bỏ Đăng nhập Facebook, Tách biệt Xác thực Google & Cập nhật Cơ chế Khôi phục Mật khẩu

### Tính năng mới & Cơ chế (Feature & Mechanism Changes)
- **Tách biệt Xác thực Google sau khi đăng nhập (Link Google flow):**
  - Chuyển nút đăng nhập Google từ trang Đăng nhập (`Login.jsx`) vào trong trang thông tin cá nhân (`HoSoForm.jsx`).
  - Hỗ trợ liên kết tài khoản Google cho người dùng đã đăng nhập thủ công thông qua thiết lập cookie link flow (`oauth2_action=link` và `oauth2_username`).
  - Tại trang thông tin cá nhân (`HoSoForm.jsx`), nếu tài khoản đã liên kết email sẽ hiển thị read-only cùng thẻ xanh `✓ Đã liên kết Google`, ngược lại sẽ cảnh báo và cho phép nhấn nút liên kết.
  - Tối ưu hóa API chuyển hướng thành công và thất bại (`OAuth2AuthenticationSuccessHandler.java`, `SecurityConfig.java`) để tự động điều hướng người dùng trở lại màn hình dashboard kèm mã trạng thái (`?link=success` hoặc `?link=error`).
- **Đơn giản hóa Đăng ký thủ công:**
  - Loại bỏ hoàn toàn trường nhập email và cơ chế gửi/nhập mã OTP xác thực email ở form đăng ký thủ công. Giờ đây người dùng đăng ký chỉ cần nhập Tên đăng nhập, Họ tên, Mật khẩu và Vai trò.
  - Người dùng đăng ký qua Google vẫn được tự động ghi nhận email và đánh dấu đã liên kết.
- **Cơ chế Khôi phục mật khẩu an toàn:**
  - API quên mật khẩu `/api/tai-khoan/forgot-password` thực hiện kiểm tra Gmail của tài khoản. Nếu tài khoản đăng ký thủ công chưa từng thực hiện liên kết Google (chưa có email trong DB), hệ thống sẽ từ chối gửi mã OTP khôi phục mật khẩu và trả về lỗi: `"Tài khoản chưa có Gmail không thể khôi phục"`.

### Sửa lỗi (Hotfix) & Dọn dẹp
- **Xóa Đăng nhập Facebook:** Loại bỏ hoàn toàn các cấu hình client registration của Facebook ở cả Frontend lẫn Backend (`application.properties`, `Login.jsx`, `Login.css`), chỉ sử dụng đăng nhập bằng Google.
- **Sửa lỗi kẹt nút Đăng nhập:** Thêm `setLoading(false)` khi đăng ký tài khoản thành công để khôi phục trạng thái nút bấm khi chuyển hướng về lại trang đăng nhập.

---

## [2026-06-03] - Thống kê Phòng trọ, Tìm kiếm Phòng Trực tiếp, Bộ lọc Hóa đơn Chưa thanh toán & Chặn Số âm

### Tính năng mới (Feature)
- **Admin (Thống kê & Tìm kiếm phòng):** 
  - Bổ sung Thẻ thống kê (Card) nổi bật hiển thị: *Tổng số phòng hệ thống*, *Phòng trống*, và *Đang thuê* ngay phía đầu của tab Phòng trọ (`PHONG`) của Admin.
  - Tích hợp công cụ **Tìm kiếm phòng trọ trực tiếp** bên cạnh tìm kiếm chủ trọ. Khi nhập từ khóa (ví dụ: `101`), Admin có thể chọn nhanh phòng trọ để hiển thị Modal chi tiết phòng kèm thông tin Hợp đồng & Hóa đơn liên quan mà không cần tìm từng chủ trọ.
  - Bổ sung số lượng phòng trọ sở hữu (ví dụ: `🏠 5 phòng`) ngay dưới tên từng chủ trọ trong danh sách của Admin.
  - Triển khai API `/api/thong-ke/admin` (quyền Admin) trả về dữ liệu thống kê phòng trọ của hệ thống.
- **Chủ trọ (Bộ lọc hóa đơn):** 
  - Bổ sung bộ lọc trạng thái hóa đơn dạng pill điều hướng ("Tất cả" / "Chưa thanh toán") tại tab Hóa đơn.
  - Nâng cấp API `/api/hoa-don/chu-tro/{chuTroId}` chấp nhận thêm tham số lọc trạng thái `trangThai`.

### Sửa lỗi (Hotfix) & Xác thực
- **Backend (Lỗi 11 - Chặn số âm):** Tích hợp annotation `@DecimalMin(value = "0.0", ...)` chặn dữ liệu âm cho giá phòng, giá điện, giá nước, diện tích, và tiền cọc tại thực thể `PhongTro.java`.
- **Frontend (Lỗi 11):** Thêm thuộc tính `min="0"` vào các trường nhập liệu số tại form thêm/sửa phòng trọ của chủ trọ.
- **Frontend (Lỗi 10 - Chat Timestamps):** Tích hợp thành công nhãn thời gian `HH:mm` hoặc `dd/MM HH:mm` dưới mỗi bong bóng tin nhắn.

---

## [2026-06-02] - Cấu hình Email thực tế, Tối ưu Log JWT Backend & Trải nghiệm OTP Frontend

### Tính năng mới (Feature)
- **Backend (SMTP):** Hoàn thành tích hợp email thực tế. Chuyển đổi từ chế độ in OTP giả lập tại Console sang sử dụng tài khoản Gmail thực tế (`phongtroq@gmail.com`) cùng **Mật khẩu ứng dụng (App Password)** được bảo mật, cho phép tự động gửi mã OTP thực về email người nhận.
- **Frontend (UI/UX - OTP):** Bổ sung chỉ dẫn và nhắc nhở `"💡 Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra thư Rác (Spam)."` ở cả thông báo popup alert thành công lẫn dòng chữ hiển thị trực quan dưới các ô nhập mã OTP (cả form Đăng ký lẫn form Khôi phục mật khẩu).

### Sửa lỗi (Hotfix) & Tối ưu hóa (Refactor)
- **Backend (Security):** Tối ưu hóa bộ lọc `JwtAuthenticationFilter.java` bằng cách bắt riêng ngoại lệ `UsernameNotFoundException` khi xác thực Token. Giờ đây, nếu gặp mã JWT cũ/hỏng của tài khoản không tồn tại (Stale JWT), Backend sẽ chỉ in một cảnh báo WARNING ngắn gọn thay vì xả ra cả một trang lỗi Stack Trace dài đỏ lừ.
- **Frontend (Bug - Countdown):** Sửa lỗi đồng hồ đếm ngược OTP không tự động reset về `0` khi người dùng đăng ký thành công, đổi mật khẩu thành công, hoặc chuyển đổi qua lại giữa các tab Đăng nhập/Đăng ký.
- **Frontend (UX):** Bổ sung cơ chế hiển thị `alert()` báo lỗi chi tiết nhận về từ Backend khi gửi mã OTP thất bại (ví dụ: thông báo trùng Gmail), giúp người dùng biết được nguyên nhân thay vì thất bại trong im lặng.

---

## [2026-05-17] - Tích hợp Tìm kiếm Nâng cao & Yêu cầu Hủy hợp đồng

### Tính năng mới (Feature)
- **Backend (API):** Mở rộng bộ lọc `/api/phong-tro/search` để hỗ trợ lọc tìm kiếm theo địa chỉ `diaChi`.
- **Frontend (UI/UX):** Nâng cấp tab **Chợ tìm trọ** trong `GuestPage.jsx` với bộ lọc chuyên nghiệp gồm 2 chế độ: *Tìm theo khu trọ* và *Tìm phòng trống trực tiếp* (cho phép lọc theo Tên phòng, Địa chỉ, Khoảng giá Min - Max).
- **Backend (API) & Frontend (UI/UX):** Triển khai luồng **Yêu cầu hủy hợp đồng** an toàn (Khách thuê gửi yêu cầu hủy `khach-huy` ➡️ Trạng thái chuyển thành `YEU_CAU_HUY` ➡️ Chủ trọ kiểm tra và phê duyệt hủy/thanh lý ➡️ Trạng thái thành `DA_KET_THUC`/`DA_THANH_LY` và giải phóng phòng về `TRONG`).
- **Frontend (UI/UX):** Tự động truy vấn thông tin chủ trọ động khi đăng ký thuê phòng trực tiếp từ kết quả tìm kiếm nâng cao, giải quyết triệt để lỗi thiếu thông tin chủ trọ trong Hợp đồng điện tử.

### Sửa lỗi (Hotfix)
- **Frontend (Modal):** Sửa lỗi đơ nút Xác nhận và ẩn nút Hủy dư thừa khi modal có kiểu `success` trong `ConfirmModal.jsx`.
- **System (AI Prompting):** Khởi tạo các tệp tin `.antigravity_rules` và `.test_antigravity` để tối ưu hóa token và định hình chuẩn sinh code cho AI.

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
