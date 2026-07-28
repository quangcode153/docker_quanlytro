# 🗺️ Lộ Trình Học Backend Spring Boot: Từ Cơ Bản Đến Làm Chủ Dự Án "Smart Room Rental"

Lộ trình này được thiết kế nhằm giúp bạn nhanh chóng nắm bắt toàn bộ kiến thức backend trong dự án **Smart Room Rental** (Spring Boot + MySQL + Spring Security + WebSocket + Google OAuth2). Lộ trình được chia làm **7 giai đoạn** học cuốn chiếu, kết hợp lý thuyết nền tảng, sơ đồ luồng, mã nguồn thực tế và bộ câu hỏi vấn đáp bảo vệ đồ án.

---

## 🎯 Mục Tiêu Đạt Được
- **Hiểu sâu kiến trúc**: Nắm vững luồng đi của dữ liệu từ Client qua Controller, Service, Repository đến Cơ sở dữ liệu và ngược lại.
- **Làm chủ nghiệp vụ**: Tự tin giải thích và code lại các nghiệp vụ phức tạp (OTP, Tính tiền điện nước, Hợp đồng, Chat realtime).
- **Vượt qua phản biện**: Trả lời trôi chảy mọi câu hỏi vấn đáp về bảo mật, cơ sở dữ liệu, tối ưu hiệu năng và xử lý lỗi.

---

## 📅 Tổng Quan Lộ Trình Học (7 Giai Đoạn)

```mermaid
gantt
    title Lộ Trình Học Backend (Ước tính: 7 - 10 ngày)
    dateFormat  X
    axisFormat %d
    section Nền Tảng
    GĐ 1: Kiến trúc & Cấu trúc cơ bản :active, 0, 1
    GĐ 2: Thiết kế CSDL & JPA Entity   : 1, 3
    section Nghiệp Vụ REST
    GĐ 3: RESTful APIs, Routing & DTO : 3, 5
    GĐ 4: Logic Nghiệp Vụ & Service    : 5, 7
    section Nâng Cao & Bảo Mật
    GĐ 5: Xử lý lỗi & Chat WebSockets : 7, 8
    GĐ 6: Bảo mật JWT & Google OAuth2 : 8, 10
    section Thực Hành
    GĐ 7: Ôn tập Q&A & Code Practice  : 10, 11
```

---

## 🔍 Chi Tiết Từng Giai Đoạn Học

### 🏛️ Giai Đoạn 1: Kiến Trúc Tổng Quan & Khởi Chạy Hệ Thống
*   **Mục tiêu**: Hiểu cấu trúc thư mục dự án và cách Spring Boot khởi động, nạp các dependency.
*   **Tài liệu đọc chính**: [tong_quan_kien_truc.md](file:///d:/test_antigravity/docskienthuc/tong_quan_kien_truc.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **Mô hình 3 lớp (3-Tier)**: Vai trò của Controller, Service, Repository và Entity.
    2.  **Cơ chế Dependency Injection (DI) & Inversion of Control (IoC)**: Tại sao dùng `@Autowired`, Bean là gì?
    3.  **Annotation chính**: `@SpringBootApplication` tích hợp 3 annotation nào bên trong?
    4.  **Lombok**: Cách sử dụng `@Data`, `@Getter`, `@Setter`, `@Builder` để giảm boilerplate code.
*   **File code thực tế cần đọc**:
    - [ServerApplication.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L9-L21) (Khởi chạy Spring Boot)

---

### 🗄️ Giai Đoạn 2: Thiết Kế Cơ Sở Dữ Liệu & Thực Thể JPA (Entity) & Repository
*   **Mục tiêu**: Nắm được sơ đồ ERD, các quan hệ bảng trong CSDL, cách ánh xạ từ Java Class sang MySQL bằng JPA/Hibernate và cách truy vấn qua Repository.
*   **Tài liệu đọc chính**: 
    - [database_entity_enum.md](file:///d:/test_antigravity/docskienthuc/database_entity_enum.md)
    - [repository_spring_data_jpa.md](file:///d:/test_antigravity/docskienthuc/repository_spring_data_jpa.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **Sơ đồ quan hệ ERD**:
        - Quan hệ `1-1` (`TaiKhoan` <-> `KhachHang`).
        - Quan hệ `1-N` (`TaiKhoan` -> `PhongTro`, `PhongTro` -> `HopDong`, v.v.).
    2.  **JPA Annotations**: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@OneToOne`, `@ManyToOne`, `@OneToMany`.
    3.  **Cascade & Orphan Removal**: Tự động xóa hoặc cập nhật bản ghi con khi cha thay đổi.
    4.  **Spring Data JPA Repository**:
        - Ý nghĩa của `JpaRepository<T, ID>`.
        - Cách viết Query Method tự sinh (`findBy...`) và `@Query` (JPQL).
        - Ý nghĩa của `@Modifying` và cơ chế `clearAutomatically = true`.
    5.  **Enum quản lý trạng thái**: Tại sao dùng Enum cho `Role`, `TrangThaiPhong`, `TrangThaiHopDong`?
    6.  **Cơ chế ddl-auto**: Hiểu lý do tại sao KHÔNG dùng `ddl-auto=update` trên production.
*   **File code thực tế cần đọc**:
    - [TaiKhoan.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L208-L226)
    - [PhongTro.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L248-L268)
    - [HopDong.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L270-L289)
    - [TaiKhoanRepository.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/repository/TaiKhoanRepository.java)
    - [PhongTroRepository.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/repository/PhongTroRepository.java)

---

### 🛣️ Giai Đoạn 3: RESTful APIs, Định Định Tuyến & DTO Validation
*   **Mục tiêu**: Hiểu cấu trúc API endpoints, vai trò của DTO (Data Transfer Object) và cách kiểm soát dữ liệu đầu vào.
*   **Tài liệu đọc chính**: [controllers_dto_routing.md](file:///d:/test_antigravity/docskienthuc/controllers_dto_routing.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **Chuẩn RESTful API**: Phân biệt các HTTP method `GET`, `POST`, `PUT`, `DELETE`.
    2.  **RestController**: Phân biệt `@RestController` (trả về JSON) và `@Controller` (trả về giao diện).
    3.  **RequestParam vs RequestBody**: Khi nào nhận dữ liệu từ Query URL, khi nào nhận JSON Body.
    4.  **Tầng DTO**: Tại sao không trả trực tiếp thực thể Entity ra ngoài Client? (Bảo mật, hiệu năng).
    5.  **Validation đầu vào**: Cách dùng `@NotBlank`, `@Size`, `@Pattern` và cách Spring bắt lỗi bằng Exception.
*   **File code thực tế cần đọc**:
    - [AuthRequestDTO.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L485-L501) (Validation Email/Password)
    - [HoSoResponseDTO.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L533-L545) (Ẩn thông tin nhạy cảm)

---

### 🧠 Giai Đoạn 4: Logic Nghiệp Vụ & Quản Lý Giao Dịch (Service Layer)
*   **Mục tiêu**: Nắm được các luồng nghiệp vụ cốt lõi của dự án và cách kiểm soát tính nhất quán dữ liệu.
*   **Tài liệu đọc chính**: [business_services_logic.md](file:///d:/test_antigravity/docskienthuc/business_services_logic.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **Vòng đời Hợp đồng**: Luồng đi từ `CHO_DUYET` -> `DA_DUYET` (phòng thành `DA_THUE`) -> `YEU_CAU_HUY` -> `DA_HUY`.
    2.  **Nghiệp vụ tính hóa đơn điện nước**: Quy trình chốt chỉ số, kiểm tra `soMoi >= soCu`, nhân đơn giá và tự sinh hóa đơn.
    3.  **Annotation `@Transactional`**: Ý nghĩa của Commit & Rollback, tại sao nó bảo vệ tính toàn vẹn dữ liệu (ACID).
    4.  **Báo cáo & Audit Log**: Cách tính tổng doanh thu bằng JPQL `@Query` và cách ghi nhật ký hoạt động người dùng.
*   **File code thực tế cần đọc**:
    - [HopDongService.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L734-L757)
    - [ChiSoDienNuocService.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L759-L786)
    - [HopDongRepository.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L637-L653) (Bulk Update từ chối các hợp đồng khác)

---

### 💬 Giai Đoạn 5: Xử Lý Lỗi Tập Trung & Chat Realtime (WebSocket)
*   **Mục tiêu**: Hiểu cơ chế bắt lỗi chuyên nghiệp của Spring Boot và kiến trúc giao tiếp thời gian thực 2 chiều.
*   **Tài liệu đọc chính**: [exception_websocket.md](file:///d:/test_antigravity/docskienthuc/exception_websocket.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **Global Exception Handler**: Cách dùng `@RestControllerAdvice` và `@ExceptionHandler` để loại bỏ khối `try-catch` dư thừa.
    2.  **Custom Exceptions**: Ý nghĩa mã lỗi HTTP 400 (Bad Request), 403 (Forbidden), 404 (Not Found).
    3.  **WebSocket vs HTTP**: Tại sao chat phải dùng kết nối hai chiều Full-Duplex thay vì HTTP Polling?
    4.  **STOMP & Message Broker**: Vai trò định tuyến tin nhắn thời gian thực thông qua prefix `/app` và các kênh `/topic`, `/queue`.
    5.  **Trạng thái chưa đọc (daDoc)**: Logic đếm tin nhắn hiển thị chấm đỏ thông báo.
*   **File code thực tế cần đọc**:
    - [GlobalExceptionHandler.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L459-L480)
    - [WebSocketConfig.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L24-L46)
    - [ChatController.java](file:///d:/test_antigravity/docskienthuc/cac_luong_nghiep_vu_va_vi_du.md#L186-L215)

---

### 🔐 Giai Đoạn 6: Bảo Mật Hệ Thống, Token JWT & Google OAuth2
*   **Mục tiêu**: Làm chủ cơ chế bảo mật Stateless, cấu hình phân quyền API và tích hợp đăng nhập bên thứ 3.
*   **Tài liệu đọc chính**: [auth_security_oauth2.md](file:///d:/test_antigravity/docskienthuc/auth_security_oauth2.md)
*   **Nội dung cốt lõi cần nắm**:
    1.  **JWT (JSON Web Token)**: Cấu trúc 3 phần (Header, Payload, Signature). Tại sao JWT là stateless?
    2.  **Security Filter Chain**: Cách `SecurityConfig` chặn request, cấu hình Endpoint PermitAll vs HasRole, tích hợp bộ lọc `JwtAuthenticationFilter`.
    3.  **Google OAuth2 Login**: Luồng chuyển hướng Auth Code, xử lý lấy Profile, tự đăng ký User mới khi đăng nhập lần đầu và redirect token về React.
    4.  **Quên mật khẩu & OTP**: Cách sinh OTP ngẫu nhiên, đặt hạn sử dụng 5 phút và băm mật khẩu bằng `BCryptPasswordEncoder`.
*   **File code thực tế cần đọc**:
    - [SecurityConfig.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L122-L144)
    - [JwtService.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L53-L87)
    - [CustomOAuth2UserService.java](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md#L163-L182)

---

### 🎓 Giai Đoạn 7: Ôn Tập Các Luồng Nghiệp Vụ & Thực Hành Code
*   **Mục tiêu**: Kết nối toàn bộ các giai đoạn lại với nhau bằng các luồng nghiệp vụ thực tế và luyện tập bộ câu hỏi Q&A.
*   **Tài liệu đọc chính**:
    - [cac_luong_nghiep_vu_va_vi_du.md](file:///d:/test_antigravity/docskienthuc/cac_luong_nghiep_vu_va_vi_du.md) (Luyện 5 luồng nghiệp vụ chính)
    - [chi_tiet_tung_file.md](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md) (Tra cứu chi tiết code của toàn bộ 62 file)
*   **Bài tập thực hành đề xuất**:
    1.  **Duyệt code tay**: Mở bất kỳ file Controller nào trong `chi_tiet_tung_file.md` và giải thích luồng dữ liệu đi qua Service nào, Repository nào, tác động đến bảng nào trong Database.
    2.  **Tự vấn đáp (Mock Q&A)**: Đọc to các câu hỏi Q&A ở cuối mỗi tài liệu để luyện tập phản xạ trả lời câu hỏi của thầy cô phản biện đồ án hoặc nhà tuyển dụng.

---

## 💡 Lời Khuyên Để Học Nhanh Nhất
1.  **Học cuốn chiếu**: Không nhảy cóc. Bạn cần hiểu CSDL (GĐ 2) trước khi viết API (GĐ 3), và hiểu API trước khi viết logic Service (GĐ 4).
2.  **Xem Code đi đôi với Giải Thích**: Khi xem mã nguồn ở file [chi_tiet_tung_file.md](file:///d:/test_antigravity/docskienthuc/chi_tiet_tung_file.md), hãy luôn đối chiếu với sơ đồ hoạt động hoặc giải thích ở các file chuyên đề tương ứng.
3.  **Tận dụng sơ đồ Mermaid**: Các sơ đồ Sequence Diagram và State Diagram trong tài liệu là vũ khí cực mạnh giúp bạn hình dung bức tranh toàn cảnh một cách trực quan.

---

## 📅 Kế Hoạch Học Tập Cho Ngày Mai
*   **Chủ đề trọng tâm**: **Thiết Kế Cơ Sở Dữ Liệu & Thực Thể JPA (Entity)**
*   **Tài liệu học chính**: [database_entity_enum.md](file:///d:/test_antigravity/docskienthuc/database_entity_enum.md)
*   **Nhiệm vụ cụ thể**:
    1.  **Ôn tập các Annotation JPA**: Nắm vững ý nghĩa và cách hoạt động của `@Entity`, `@Table`, `@Id`, `@GeneratedValue`.
    2.  **Phân tích mối quan hệ bảng (JPA Relationships)**:
        - Phân biệt sự khác nhau giữa `@OneToOne`, `@ManyToOne`, `@OneToMany`.
        - Hiểu ý nghĩa thực tế của `cascade = CascadeType.ALL` và `orphanRemoval = true` (Ví dụ liên kết giữa `TaiKhoan` và `KhachHang`).
    3.  **Học các Enum Trạng Thái**: Nắm rõ cách quản lý vòng đời của phòng (`TrangThaiPhong`), hợp đồng (`TrangThaiHopDong`) và hóa đơn (`TrangThaiHoaDon`).
    4.  **Luyện bộ câu hỏi Q&A**: Tự trả lời bộ câu hỏi vấn đáp về Database & JPA ở cuối tài liệu để rèn luyện phản xạ.

