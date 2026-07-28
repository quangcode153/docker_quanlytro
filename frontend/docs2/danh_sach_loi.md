# 📋 Danh Sách Lỗi & Hướng Dẫn Sửa Đổi (Bản Theo Dõi)

Tài liệu này tổng hợp toàn bộ các lỗi/tính năng cần nâng cấp trong dự án **Quản Lý Phòng Trọ**, phân chia rõ ràng bên cần sửa đổi (Frontend / Backend), liệt kê các file bị ảnh hưởng và giải pháp xử lý chi tiết.

---

## 🛠️ Nhóm 1: Hệ Thống Đăng Ký & Xác Thực Tài Khoản

### 1. Kiểm tra định dạng Gmail đăng ký (phải có `@gmail.com`)
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx`
    *   BE: `backend/src/java/com/btl/server/dto/AuthRequestDTO.java`
*   **Hướng dẫn sửa**:
    *   **FE**: Sử dụng Regex trong hàm validate đăng ký: `/^[a-zA-Z0-9._%+-]+@gmail\.com$/` để kiểm tra email đầu vào trước khi submit form.
    *   **BE**: 
        *   Thêm Annotation kiểm tra định dạng tại class `AuthRequestDTO` để bảo vệ tầng API:
            ```java
            @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email phải là địa chỉ Gmail hợp lệ (@gmail.com)")
            private String email;
            ```
        *   Kiểm tra trùng lặp email: Xác thực xem địa chỉ email này đã được sử dụng bởi tài khoản nào khác trong hệ thống hay chưa trước khi tiến hành lưu tài khoản mới.

### 2. Hiển thị rõ lỗi đăng ký theo từng ô nhập liệu (Inline Error)
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx` & `frontend/src/pages/Login/Login.css`
*   **Hướng dẫn sửa**:
    *   Tách biệt state quản lý lỗi chung thành state object dạng `errors` (chứa `username`, `password`, `email`, `hoTen`).
    *   Khi người dùng submit hoặc blur ô nhập liệu, thực hiện kiểm tra và gán lỗi riêng biệt cho từng trường.
    *   Hiển thị thẻ `<span className="error-message">` màu đỏ pastel dịu ngay dưới mỗi ô nhập thay vì dùng thông báo `error` chung.

### 3. Chưa kiểm tra (validate) giá trị Họ tên (`name`) khi đăng ký
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx`
    *   BE:
        *   `backend/src/java/com/btl/server/dto/AuthRequestDTO.java`
        *   `backend/src/java/com/btl/server/controller/TaiKhoanController.java`
*   **Hướng dẫn sửa**:
    *   **FE**: Thêm ô nhập liệu "Họ và tên" (`hoTen`) trên form đăng ký. Ràng buộc độ dài ký tự tối thiểu (ví dụ: 2-50 ký tự), không được chứa số/ký tự đặc biệt.
    *   **BE**:
        *   Thêm trường `hoTen` trong `AuthRequestDTO` kèm theo validation.
        *   Cập nhật logic tạo tài khoản trong `TaiKhoanController.java` để truyền đúng tên hiển thị xuống tầng lưu trữ hồ sơ `KhachHang`.

### 4. Quên mật khẩu: Khôi phục tài khoản qua mã OTP gửi đến Gmail
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx`
    *   BE:
        *   `backend/src/java/com/btl/server/service/MailService.java` [NEW]
        *   `backend/src/java/com/btl/server/controller/TaiKhoanController.java`
        *   `backend/src/resources/application.properties`
*   **Hướng dẫn sửa**:
    *   **BE**:
        *   Cấu hình `spring-boot-starter-mail` trong `application.properties` sử dụng dịch vụ SMTP Gmail.
        *   Xây dựng API `POST /api/tai-khoan/forgot-password`: Kiểm tra email tồn tại -> Tạo mã OTP 6 số (hạn dùng 5 phút) gửi về email.
        *   Xây dựng API `POST /api/tai-khoan/reset-password`: Nhận OTP, kiểm tra khớp/hạn dùng -> Cho phép cập nhật mật khẩu mới đã băm Bcrypt.
    *   **FE**: Bổ sung liên kết "Quên mật khẩu" trong form Login. Mở màn hình/modal nhập email -> gửi OTP -> nhập OTP cùng mật khẩu mới.

### 5. Đăng nhập bằng Gmail (Google) và Facebook (OAuth2)
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[ ] Chưa thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login.jsx`, `frontend/src/App.jsx`
    *   BE:
        *   `backend/src/java/com/btl/server/security/CustomOAuth2UserService.java`
        *   `backend/src/java/com/btl/server/security/OAuth2AuthenticationSuccessHandler.java`
        *   `backend/src/java/com/btl/server/security/SecurityConfig.java`
        *   `backend/application.properties`
*   **Hướng dẫn sửa**:
    *   **BE**: Cấu hình Client ID và Client Secret cho dịch vụ OAuth2 (Google/Facebook) trong `application.properties`. Đăng ký và phân quyền endpoint `/oauth2/**` trong `SecurityConfig.java`. Cấu hình `CustomOAuth2UserService` để tự động tạo tài khoản khách thuê nếu email chưa tồn tại trong hệ thống và `OAuth2AuthenticationSuccessHandler` để trả về mã JWT qua đường dẫn callback.
    *   **FE**: Thêm các nút đăng nhập nhanh bằng Google/Facebook trong `Login.jsx` trỏ về các liên kết tương ứng trên Server (ví dụ: `/oauth2/authorization/google` và `/oauth2/authorization/facebook`). Xử lý nhận Token từ đường dẫn callback chuyển hướng, lưu vào `localStorage` và chuyển tiếp vào phiên làm việc.

---

## 🏗️ Nhóm 2: Hồ Sơ Cá Nhân & Quy Trình Thuê Phòng

### 6. Lưu trữ thông tin cập nhật tạm thời khi điều hướng trang
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[ ] Chưa thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Tenant/TenantPage.jsx` & `frontend/src/pages/Landlord/LandlordPage.jsx`
*   **Hướng dẫn sửa**:
    *   Khi người dùng sửa form hồ sơ cá nhân hoặc điền thông tin dở dang, sử dụng sự kiện `onChange` lưu các giá trị của form vào `sessionStorage` (hoặc `localStorage`).
    *   Khi component được khởi tạo lại (mount), đọc lại thông tin tạm từ `sessionStorage` để điền tự động (Autofill). Xóa dữ liệu tạm này sau khi submit thành công.

### 7. Ràng buộc ngày tháng năm sinh hợp lệ
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: Hồ sơ thông tin cá nhân khách thuê
    *   BE: `backend/src/java/com/btl/server/service/KhachHangService.java`
*   **Hướng dẫn sửa**:
    *   **FE**: Đặt giới hạn `max` cho input date là ngày hiện tại trừ đi 18 năm (Ví dụ: khách thuê phải từ 18 tuổi trở lên để ký hợp đồng dân sự).
    *   **BE**: Kiểm tra ngày sinh trong `KhachHang` trước khi lưu, đảm bảo ngày sinh không thuộc về tương lai hoặc quá phi lý (ví dụ: năm sinh phải lớn hơn 1900).

### 8. Danh sách chọn Ngân hàng trực quan và thực tế
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[ ] Chưa thực hiện`
*   **File ảnh hưởng**:
    *   FE: Form cập nhật tài khoản ngân hàng của chủ trọ và khách thuê
*   **Hướng dẫn sửa**:
    *   Thay thế ô nhập text tự do bằng thẻ `<select>` chứa danh sách các ngân hàng lớn phổ biến Việt Nam kèm mã ngắn định dạng (Ví dụ: Vietcombank, Techcombank, MB Bank, BIDV, Agribank, VietinBank...).
    *   Đồng bộ định dạng chuỗi lưu trữ thống nhất để hiển thị đẹp hơn trên hóa đơn thanh toán.

### 9. Cho phép khách thuê thoát khỏi màn hình chờ duyệt hợp đồng
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[ ] Chưa thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/App.jsx`
*   **Hướng dẫn sửa**:
    *   Hiện tại khi khách thuê nhấn đăng ký phòng, hệ thống rơi vào màn hình `WaitingScreen` (chờ duyệt) và khóa toàn bộ điều hướng.
    *   Cần bổ sung một nút **"Hủy yêu cầu & Chọn phòng khác"** trong `WaitingScreen`.
    *   Khi click, sẽ gọi API xóa hợp đồng ở trạng thái `CHO_DUYET` hiện tại, xóa state lưu trữ hợp đồng của khách và tự động chuyển hướng khách về lại giao diện tìm phòng trống `GuestPage`.

---

## 💬 Nhóm 3: Hệ Thống Chat Realtime

### 10. Bổ sung thời gian gửi tin nhắn trong đoạn chat
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/components/ChatBox.jsx`
    *   BE: `backend/src/java/com/btl/server/entity/TinNhan.java`
*   **Hướng dẫn sửa**:
    *   **BE**: Đảm bảo trường `thoiGianGui` kiểu `LocalDateTime` được nạp đầy đủ giá trị mặc định lúc tạo tin và chuyển đổi JSON đúng định dạng ISO tiêu chuẩn.
    *   **FE**: Đọc giá trị thời gian từ đối tượng tin nhắn, định dạng về dạng thân thiện `HH:mm` (hoặc thêm ngày nếu là tin nhắn cũ) và hiển thị nhỏ gọn, tinh tế ngay dưới bong bóng tin nhắn.

---

## 🏢 Nhóm 4: Quản Lý Phòng Trọ & Tài Chính (Chủ Trọ & Admin)

### 11. Chặn giá tiền thuê trọ không được phép là số âm
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Landlord/RoomTab.jsx`
    *   BE: `backend/src/java/com/btl/server/entity/PhongTro.java`
*   **Hướng dẫn sửa**:
    *   **FE**: Thêm thuộc tính `min="0"` vào input số nhập giá phòng trọ.
    *   **BE**: Sử dụng Annotation `@DecimalMin(value = "0.0", message = "Giá phòng trọ không thể nhỏ hơn 0")` trên thuộc tính `giaPhong` trong thực thể `PhongTro`.

### 12. Chuẩn hóa quy trình điền thông tin phòng trọ hợp lý
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[ ] Chưa thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Landlord/RoomTab.jsx` & `frontend/src/pages/Landlord/UtilityModal.jsx`
*   **Hướng dẫn sửa**:
    *   Cấu hình kiểm tra không cho phép nhập ký tự không phải số ở các ô: giá phòng, tiền cọc, diện tích, chỉ số điện/nước.
    *   Tự động thêm dấu phân cách phần nghìn (Ví dụ: `3,500,000` VND) khi chủ trọ đang nhập liệu để tăng độ trực quan.
    *   Ràng buộc số điện mới phải $\ge$ số điện cũ; số nước mới phải $\ge$ số nước cũ ngay tại Client trước khi cho phép chốt số.

### 13. Bổ sung hiển thị tổng số phòng trọ trong hệ thống ở trang Admin
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Admin/AdminPage.jsx`
    *   BE: `backend/src/java/com/btl/server/service/ThongKeService.java`
*   **Hướng dẫn sửa**:
    *   **BE**: Trong dữ liệu thống kê trả về cho Admin, bổ sung trường đếm tổng số phòng `tongSoPhong` từ repo: `phongTroRepository.count()`.
    *   **FE**: Thiết kế thêm một Thẻ thống kê (Card) nổi bật trong trang `AdminPage` để hiển thị con số này (Ví dụ: "Tổng số phòng trọ hệ thống: 45 phòng").

### 14. Hiển thị danh sách khách thuê đang nợ/chưa thanh toán tiền trọ
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Landlord/InvoiceTab.jsx` (Hoặc thêm widget trên dashboard chủ trọ)
    *   BE: `backend/src/java/com/btl/server/repository/HoaDonRepository.java`
*   **Hướng dẫn sửa**:
    *   **BE**: Viết API/Method lấy danh sách hóa đơn theo trạng thái chưa thanh toán: `findByTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN)`.
    *   **FE**: Hiển thị bảng tổng hợp riêng hoặc badge đỏ báo động các hóa đơn nợ quá hạn của khách thuê để chủ trọ dễ dàng theo dõi và đôn đốc đóng tiền.

---

## 🛠️ Nhóm 5: Tối Ưu Log Backend & Trải Nghiệm OTP Frontend (Mới bổ sung)

### 15. Backend xả log lỗi Stack Trace màu đỏ khi token chứa username không tồn tại
*   **Phân loại**: **Backend**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   BE: `backend/src/java/com/btl/server/security/JwtAuthenticationFilter.java`
*   **Hướng dẫn sửa**:
    *   Trước đây, khi trình duyệt gửi kèm JWT token cũ của một tài khoản đã bị xóa khỏi cơ sở dữ liệu (Stale JWT), `UserDetailsService` sẽ ném ra `UsernameNotFoundException` khiến bộ lọc Jwt ném ra lỗi `⚠️ JWT lỗi định dạng hoặc chữ ký:` và xả cả một trang Stack Trace dài màu đỏ làm nhiễu console.
    *   Giải pháp: Import và catch riêng ngoại lệ `UsernameNotFoundException` trong `JwtAuthenticationFilter.java` để chỉ in ra một log dạng `logger.warn` ngắn gọn và chuyên nghiệp, giúp console luôn sạch sẽ.

### 16. Đồng hồ đếm ngược (Countdown) OTP không tự động reset
*   **Phân loại**: **Frontend**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx`
*   **Hướng dẫn sửa**:
    *   Lỗi: Sau khi đăng ký tài khoản hoặc khôi phục mật khẩu thành công, hoặc khi người dùng chuyển đổi qua lại giữa tab Đăng ký và Đăng nhập, đồng hồ đếm ngược OTP cũ vẫn tiếp tục đếm ngược mà không bị xóa đi.
    *   Giải pháp: Thêm dòng `setCountdown(0);` và `setForgotCountdown(0);` tại các vị trí xử lý thành công và hàm chuyển đổi tab `switchMode` để đảm bảo trải nghiệm người dùng trơn tru nhất.

### 17. Thiếu thông báo lỗi chi tiết từ Backend khi gửi OTP thất bại và nhắc nhở hòm thư Rác
*   **Phân loại**: **Cả hai (BE + FE)**
*   **Trạng thái**: `[x] Đã thực hiện`
*   **File ảnh hưởng**:
    *   FE: `frontend/src/pages/Login/Login.jsx`
    *   BE: `backend/src/resources/application.properties` & `backend/src/java/com/btl/server/controller/TaiKhoanController.java`
*   **Hướng dẫn sửa**:
    *   **BE**: Cấu hình SMTP bằng tài khoản Gmail thực tế (`phongtroq@gmail.com`) cùng Mật khẩu ứng dụng bảo mật thay vì in giả lập tại Console. Trả về đúng mã lỗi `400 Bad Request` cùng message chi tiết nếu trùng Gmail đăng ký.
    *   **FE**:
        *   Cập nhật hàm catch lỗi gửi OTP để bật hộp thoại `alert('⚠️ Lỗi: ' + errMsg)` hiển thị chi tiết lỗi của Backend (ví dụ: thông báo trùng Gmail) thay vì chỉ im lặng lưu vào error state.
        *   Bổ sung câu nhắc nhở `"💡 Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra thư Rác (Spam)."` ở cả thông báo gửi OTP thành công lẫn hiển thị trực quan dạng nhãn nhỏ màu cam dưới các ô nhập OTP trên form.

---

## 🎯 Nguyên Tắc Phối Hợp & Quy Trình Fix Lỗi

1.  **Dọn dẹp code trước khi sửa**: Luôn chạy `git status` và `git diff` trước khi lập trình để đảm bảo không bị xung đột mã nguồn.
2.  **Sửa Backend trước, Frontend sau**: Bổ sung validation ở API và thực thể dữ liệu JPA trước để định hình cấu trúc JSON chuẩn, sau đó tiến hành map giao diện UI tương ứng.
3.  **Không phá vỡ kiến trúc sẵn có**: Đảm bảo toàn bộ logic xử lý ngoại lệ trung tâm (`GlobalExceptionHandler`) và interceptor mạng (`api.js`) hoạt động đồng bộ.
