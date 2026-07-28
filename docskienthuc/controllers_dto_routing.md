# 🛣️ RESTful APIs, Controllers & Tầng Truyền Dữ Liệu (DTO)

Tài liệu này giải thích cấu trúc các Endpoint (URL) của hệ thống, vai trò của từng Controller, cách thức truyền tải dữ liệu an toàn qua DTO (Data Transfer Object) và cơ chế kiểm tra tính hợp lệ (Validation) đầu vào.

---

## 🔗 1. Hệ Thống Router / Endpoints Chính (RESTful APIs)

Dự án được phân cấp URL rõ ràng theo chuẩn RESTful nhằm tối ưu hóa việc định tuyến và phân quyền:

### 🔐 Tác Vụ Hệ Thống & Tài Khoản (`/api/tai-khoan`)
*   `POST /api/tai-khoan/register`: Đăng ký tài khoản khách thuê mới (kiểm tra Gmail hợp lệ, họ tên đầy đủ).
*   `POST /api/tai-khoan/login`: Đăng nhập hệ thống (trả về Token JWT và thông tin người dùng).
*   `GET /api/tai-khoan/me`: Lấy thông tin tài khoản đang đăng nhập từ token.
*   `POST /api/tai-khoan/forgot-password`: Yêu cầu gửi mã OTP khôi phục mật khẩu về Gmail.
*   `POST /api/tai-khoan/reset-password`: So khớp OTP và cập nhật mật khẩu mới.

### 🏠 Quản Lý Phòng Trọ (`/api/phong-tro`)
*   `GET /api/phong-tro/search`: Bộ lọc tìm kiếm phòng trống nâng cao (tên phòng, địa chỉ, khoảng giá, trạng thái).
*   `POST /api/phong-tro`: Thêm phòng trọ mới (chỉ dành cho Chủ trọ - `ROLE_LANDLORD`).
*   `PUT /api/phong-tro/{id}`: Cập nhật thông tin phòng trọ.
*   `DELETE /api/phong-tro/{id}`: Xóa phòng trọ (nếu chưa có hợp đồng hiệu lực).

### 📜 Quản Lý Hợp Đồng (`/api/hop-dong`)
*   `POST /api/hop-dong`: Khách thuê gửi yêu cầu đăng ký thuê phòng (tạo hợp đồng trạng thái `CHO_DUYET`).
*   `PUT /api/hop-dong/{id}/duyet`: Chủ trọ duyệt hợp đồng (phòng trọ chuyển sang `DA_THUE`).
*   `PUT /api/hop-dong/{id}/khach-huy`: Khách thuê gửi yêu cầu hủy/trả phòng sớm.
*   `PUT /api/hop-dong/{id}/duyet-huy`: Chủ trọ đồng ý duyệt hủy hợp đồng (phòng trọ chuyển về `TRONG`).

### 💵 Quản Lý Hóa Đơn (`/api/hoa-don`)
*   `POST /api/hoa-don/tinh-tien/{phongId}`: Chủ trọ chốt số điện nước mới và tự động sinh hóa đơn tháng.
*   `GET /api/hoa-don/me`: Khách thuê lấy danh sách toàn bộ hóa đơn tiền phòng cá nhân.
*   `POST /api/hoa-don/{id}/thanh-toan`: Khách thuê xác nhận thanh toán hóa đơn (đã quét mã VietQR thành công).

---

## 📦 2. Vai Trò Của DTO & Cơ Chế Kiểm Tra Dữ Liệu (Validation)

### ❓ DTO (Data Transfer Object) là gì?
Trong dự án, DTO là các class Java chỉ chứa các thuộc tính dữ liệu và getter/setter, không chứa logic nghiệp vụ hay cấu trúc JPA mapping. 
*   *Lý do sử dụng*:
    1.  **Bảo mật**: Tránh để lộ cấu trúc bảng CSDL (Entity) ra Client. Ví dụ, khi trả thông tin tài khoản về, ta dùng `HoSoResponseDTO` để loại bỏ thuộc tính `password` nhạy cảm.
    2.  **Đơn giản hóa**: Gộp dữ liệu từ nhiều bảng hoặc rút gọn dữ liệu trước khi gửi đi nhằm giảm tải đường truyền mạng.

### 🛡️ Cơ Chế Validation Đầu Vào:
Spring Boot sử dụng thư viện `Jakarta Validation` (Hibernate Validator) để ràng buộc kiểm tra dữ liệu gửi lên ở tầng Controller trước khi đưa xuống xử lý tại tầng Service.

#### Ví dụ về Class DTO có Validation ([AuthRequestDTO.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/dto/AuthRequestDTO.java)):
```java
public class AuthRequestDTO {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 4, max = 20, message = "Tên đăng nhập phải từ 4 đến 20 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải chứa ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email phải là địa chỉ Gmail hợp lệ (@gmail.com)")
    private String email;

    @NotBlank(message = "Họ và tên không được để trống")
    private String hoTen;
}
```

*   **Annotation `@Valid`**: Đặt trước tham số nhận DTO trong hàm của Controller (Ví dụ: `public ResponseEntity<?> register(@Valid @RequestBody AuthRequestDTO dto)`). Khi request chạy qua, Spring sẽ tự động kiểm tra các điều kiện ràng buộc.
*   **Xử lý lỗi**: Nếu dữ liệu vi phạm điều kiện, Spring ném ra ngoại lệ `MethodArgumentNotValidException`. Ngoại lệ này sẽ được bắt bởi `GlobalExceptionHandler` để trả về một JSON lỗi định dạng rõ ràng (ví dụ: `{"email": "Email phải là địa chỉ Gmail hợp lệ"}`) giúp Frontend hiển thị Inline Error ngay dưới ô nhập liệu.

---

## 💬 3. Bộ Câu Hỏi Vấn Đáp Về API & DTO (Q&A)

### ❓ Câu 1: RESTful API là gì? Kể tên các HTTP Method em sử dụng trong dự án và ý nghĩa của chúng?
*   **Trả lời**: RESTful API là một tiêu chuẩn thiết kế API dựa trên kiến trúc hệ thống mạng Web. Nó sử dụng các phương thức HTTP tiêu chuẩn để thao tác với tài nguyên:
    *   `GET`: Truy vấn/Đọc dữ liệu (Ví dụ: lấy danh sách phòng trọ trống).
    *   `POST`: Tạo mới tài nguyên (Ví dụ: đăng ký tài khoản, gửi yêu cầu thuê phòng).
    *   `PUT` / `PATCH`: Cập nhật tài nguyên (Ví dụ: duyệt hợp đồng, đổi mật khẩu).
    *   `DELETE`: Xóa tài nguyên (Ví dụ: xóa thông báo, xóa phòng).

### ❓ Câu 2: Biệt danh `@RestController` khác gì `@Controller` thông thường trong Spring Boot?
*   **Trả lời**:
    *   `@Controller`: Thường dùng trong mô hình MVC truyền thống (Server-Side Rendering). Nó trả về tên của một tệp giao diện (HTML/JSP) để hệ thống hiển thị View cho người dùng.
    *   `@RestController`: Là sự kết hợp của `@Controller` và `@ResponseBody`. Nó được thiết kế riêng cho việc xây dựng RESTful APIs. Mọi giá trị trả về của các hàm trong RestController sẽ tự động được Spring Boot chuyển đổi (serialize) trực tiếp thành dữ liệu JSON/XML và ghi thẳng vào HTTP Response Body trả về cho Client (React).

### ❓ Câu 3: Tham số `@RequestBody` và `@RequestParam` khác nhau như thế nào?
*   **Trả lời**:
    *   `@RequestBody`: Dùng để nhận toàn bộ thân của HTTP Request (Request Body), thường được định dạng dưới dạng JSON gửi lên từ Client. Spring Boot sẽ tự động map chuỗi JSON này thành một đối tượng Java DTO cụ thể. Thường dùng cho các tác vụ POST, PUT (tạo mới, cập nhật).
    *   `@RequestParam`: Dùng để nhận các tham số dưới dạng Query Parameter đính kèm sau dấu chấm hỏi trên thanh địa chỉ URL (Ví dụ: `/api/phong-tro/search?giaToiThieu=1000000`). Thường dùng cho các tác vụ GET (tìm kiếm, lọc, phân trang).

### ❓ Câu 4: Nếu Frontend gửi dữ liệu đăng ký sai định dạng email, Backend sẽ xử lý và trả về mã lỗi HTTP bao nhiêu? Lớp nào chịu trách nhiệm định dạng lỗi đó?
*   **Trả lời**: 
    *   Khi dữ liệu sai validation định dạng Gmail, hệ thống sẽ từ chối xử lý nghiệp vụ và trả về mã lỗi **HTTP 400 Bad Request**.
    *   Lớp chịu trách nhiệm bắt ngoại lệ validation này và định dạng lại nội dung JSON trả về là [GlobalExceptionHandler.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/exception/GlobalExceptionHandler.java) thông qua annotation `@ControllerAdvice` và hàm xử lý `@ExceptionHandler(MethodArgumentNotValidException.class)`.
