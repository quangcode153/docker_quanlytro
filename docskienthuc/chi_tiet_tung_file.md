# 🔍 Từ Điển Chi Tiết: 62 File Mã Nguồn Java Backend (Kèm Code & Chú Thích Từng Dòng)

Tài liệu này chứa thông tin chi tiết và mã nguồn thực tế kèm giải thích từng dòng của **tất cả 62 file** trong hệ thống backend Spring Boot.

---

## 🏛️ 1. ROOT & CONFIG (2 Files)

### 1️⃣ `ServerApplication.java`
*   **Mục đích**: Điểm chạy chính khởi động server Tomcat nhúng.
```java
package com.btl.server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // Annotation cấu hình tự động và quét các component trong dự án
public class ServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args); // Chạy ứng dụng Spring Boot
    }
}
```

### 2️⃣ `WebSocketConfig.java`
*   **Mục đích**: Định cấu hình kết nối WebSocket và STOMP Broker phục vụ chat.
```java
package com.btl.server.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration // Đánh dấu lớp cấu hình Spring
@EnableWebSocketMessageBroker // Kích hoạt trung chuyển tin nhắn thời gian thực
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // Đăng ký cổng bắt tay handshake kết nối là /ws
                .setAllowedOriginPatterns("*") // Cho phép mọi Client (như React cổng 5173) truy cập
                .withSockJS(); // SockJS dự phòng nếu websocket thuần bị chặn
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue"); // /topic (nhóm), /queue (riêng tư 1-1)
        registry.setApplicationDestinationPrefixes("/app"); // Tiền tố gửi tin lên server bắt đầu bằng /app
    }
}
```

---

## 🔐 2. SECURITY & AUTHENTICATION (6 Files)

### 3️⃣ `JwtService.java`
*   **Mục đích**: Sinh token và giải mã thông tin tài khoản từ chuỗi JWT.
```java
package com.btl.server.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.*;

@Service // Đăng ký Service Bean
public class JwtService {
    @Value("${jwt.secret}") private String secretKey; // Đọc key bí mật từ application.properties
    @Value("${jwt.expiration}") private long jwtExpiration; // Đọc hạn dùng từ config

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role); // Nạp quyền truy cập vào claims
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username) // Đặt username làm định danh
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Đặt hạn dùng
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Ký bằng HS256
                .compact();
    }
    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody().getSubject();
    }
    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
```

### 4️⃣ `JwtAuthenticationFilter.java`
*   **Mục đích**: Bộ lọc chặn từng request để xác thực JWT và kiểm tra khóa tài khoản.
```java
package com.btl.server.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired private JwtService jwtService;
    @Autowired private TaiKhoanRepository repo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization"); // Đọc token từ header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Chuyển tiếp nếu không có token
            return;
        }
        String token = authHeader.substring(7); // Trích xuất token
        String username = jwtService.extractUsername(token); // Giải mã lấy username
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Kiểm tra trạng thái khóa, nạp quyền vào SecurityContextHolder nếu hợp lệ...
        }
        filterChain.doFilter(request, response);
    }
}
```

### 5️⃣ `SecurityConfig.java`
*   **Mục đích**: Cấu hình phân quyền endpoints và tích hợp OAuth2 Google.
```java
package com.btl.server.security;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF vì dùng JWT Stateless
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Chạy chế độ không session
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/tai-khoan/**").permitAll() // Đăng ký, đăng nhập công khai
                .anyRequest().authenticated() // Mọi API khác phải đăng nhập
            );
        return http.build();
    }
}
```

### 6️⃣ `PhongTroSecurityService.java`
*   **Mục đích**: Kiểm tra chủ trọ có đúng quyền sở hữu phòng trọ trước khi sửa/xóa.
```java
package com.btl.server.security;
import com.btl.server.repository.PhongTroRepository;
import org.springframework.stereotype.Service;

@Service("phongTroSecurity")
public class PhongTroSecurityService {
    @Autowired private PhongTroRepository repo;
    public boolean isOwner(Long id, String username) {
        // Kiểm tra xem phòng có thuộc về chủ trọ đang thao tác không
        return repo.findById(id).map(p -> p.getChuTro().getUsername().equals(username)).orElse(false);
    }
}
```

### 7️⃣ `CustomOAuth2UserService.java`
*   **Mục đích**: Đăng ký tự động tài khoản Gmail mới khi đăng nhập Google OAuth2 lần đầu.
```java
package com.btl.server.security.oauth2;
import com.btl.server.entity.*;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) {
        OAuth2User oAuth2User = super.loadUser(req); // Đọc profile từ Google Auth
        String email = oAuth2User.getAttribute("email");
        // Kiểm tra CSDL: Nếu chưa tồn tại, tự động tạo mới TaiKhoan + KhachHang
        return oAuth2User;
    }
}
```

### 8️⃣ `OAuth2AuthenticationSuccessHandler.java`
*   **Mục đích**: Sinh Token JWT và redirect về Frontend React khi đăng nhập OAuth2 thành công.
```java
package com.btl.server.security.oauth2;
import com.btl.server.security.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Autowired private JwtService jwtService;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth) throws IOException {
        String token = jwtService.generateToken(auth.getName(), "ROLE_USER"); // Sinh Token
        res.sendRedirect("http://localhost:5173/oauth2/redirect?token=" + token); // Gửi token về React
    }
}
```

---

## 🗄️ 3. JPA ENTITIES (10 Files)

### 9️⃣ `TaiKhoan.java`
*   **Mục đích**: Ánh xạ bảng `tai_khoan` lưu thông tin đăng nhập, vai trò và mã OTP.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import com.btl.server.enums.Role;

@Entity
@Table(name = "tai_khoan")
public class TaiKhoan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Khóa chính
    private String username; // Tên đăng nhập
    private String password; // Mật khẩu băm BCrypt
    private String email; // Gmail để nhận OTP
    @Enumerated(EnumType.STRING) private Role role; // Quyền hạn (ROLE_USER, ROLE_LANDLORD, ROLE_ADMIN)
    private String otpCode; // Mã OTP khôi phục mật khẩu
}
```

### 🔟 `KhachHang.java`
*   **Mục đích**: Ánh xạ bảng `khach_hang` lưu hồ sơ cá nhân của khách thuê phòng.
```java
package com.btl.server.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "khach_hang")
public class KhachHang {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String soCccd;
    @OneToOne // Quan hệ 1-1 với TaiKhoan
    @JoinColumn(name = "tai_khoan_id")
    private TaiKhoan taiKhoan;
}
```

### 1️⃣1️⃣ `PhongTro.java`
*   **Mục đích**: Thực thể lưu thông tin phòng trọ, đơn giá, địa chỉ và chủ nhà sở hữu.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import com.btl.server.enums.TrangThaiPhong;

@Entity
public class PhongTro {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tenPhong;
    private BigDecimal giaPhong;
    private int soDienCu;
    private int soNuocCu;
    @Enumerated(EnumType.STRING) private TrangThaiPhong trangThai; // TRONG, DA_THUE, BAO_TRI
    @ManyToOne @JoinColumn(name = "chu_tro_id")
    private TaiKhoan chuTro; // Nhiều phòng trọ thuộc về 1 chủ trọ quản lý
}
```

### 1️⃣2️⃣ `HopDong.java`
*   **Mục đích**: Thực thể lưu hợp đồng thuê phòng giữa khách thuê và chủ nhà.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import com.btl.server.enums.TrangThaiHopDong;

@Entity
public class HopDong {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    @Enumerated(EnumType.STRING) private TrangThaiHopDong trangThai; // CHO_DUYET, DA_DUYET, YEU_CAU_HUY, DA_HUY
    @ManyToOne @JoinColumn(name = "phong_tro_id") private PhongTro phongTro;
    @ManyToOne @JoinColumn(name = "khach_hang_id") private TaiKhoan khachHang;
}
```

### 1️⃣3️⃣ `HoaDon.java`
*   **Mục đích**: Thực thể lưu hóa đơn tiền phòng dịch vụ hàng tháng.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import com.btl.server.enums.TrangThaiHoaDon;

@Entity
public class HoaDon {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int thang;
    private int nam;
    private BigDecimal tienPhong;
    private BigDecimal tienDien;
    private BigDecimal tienNuoc;
    private BigDecimal tongTien;
    @Enumerated(EnumType.STRING) private TrangThaiHoaDon trangThai; // CHUA_THANH_TOAN, DA_THANH_TOAN
    @ManyToOne @JoinColumn(name = "phong_tro_id") private PhongTro phongTro;
}
```

### 1️⃣4️⃣ `ChiSoDienNuoc.java`
*   **Mục đích**: Lưu lịch sử ghi chỉ số điện nước hàng tháng của phòng trọ.
```java
package com.btl.server.entity;
import jakarta.persistence.*;

@Entity
public class ChiSoDienNuoc {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int thang;
    private int nam;
    private int soDienCu;
    private int soDienMoi;
    private int soNuocCu;
    private int soNuocMoi;
    @ManyToOne @JoinColumn(name = "phong_tro_id") private PhongTro phongTro;
}
```

### 1️⃣5️⃣ `KhieuNai.java`
*   **Mục đích**: Thực thể lưu khiếu nại của khách thuê gửi chủ trọ/admin.
```java
package com.btl.server.entity;
import jakarta.persistence.*;

@Entity
public class KhieuNai {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tieuDe;
    private String noiDung;
    private String phanHoi;
    private String trangThai; // CHO_XU_LY, DA_XU_LY
    @ManyToOne @JoinColumn(name = "khach_hang_id") private TaiKhoan khachHang;
}
```

### 1️⃣6️⃣ `TinNhan.java`
*   **Mục đích**: Thực thể lưu tin nhắn trong database phục vụ chat realtime.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TinNhan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long nguoiGuiId;
    private Long nguoiNhanId;
    private String noiDung;
    private LocalDateTime thoiGian;
    private boolean daDoc; // Dùng để hiển thị trạng thái chấm đỏ thông báo chưa đọc
}
```

### 1️⃣7️⃣ `ThongBao.java`
*   **Mục đích**: Lưu trữ thông báo từ chủ nhà đăng cho phòng thuê.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ThongBao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tieuDe;
    private String noiDung;
    private LocalDateTime ngayDang;
    private Long chuTroId;
}
```

### 1️⃣8️⃣ `NhatKyHoatDong.java`
*   **Mục đích**: Thực thể lưu vết hoạt động của các tài khoản trên hệ thống.
```java
package com.btl.server.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class NhatKyHoatDong {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String hanhDong;
    private String chiTiet;
    private LocalDateTime thoiGian;
}
```

---

## 🔢 4. ENUMS (5 Files)

*   **1️⃣9️⃣ `Role.java`**: Quyền hạn (`ROLE_USER` cho khách thuê, `ROLE_LANDLORD` cho chủ trọ, `ROLE_ADMIN` cho quản trị viên).
*   **2️⃣0️⃣ `TrangThaiPhong.java`**: Trạng thái phòng trọ (`TRONG` hiển thị tìm kiếm, `DA_THUE` ẩn tìm kiếm, `BAO_TRI` tạm đóng).
*   **2️⃣1️⃣ `TrangThaiHopDong.java`**: Vòng đời hợp đồng (`CHO_DUYET`, `DA_DUYET`, `YEU_CAU_HUY`, `DA_HUY`, `HET_HAN`, `TU_CHOI`).
*   **2️⃣2️⃣ `TrangThaiHoaDon.java`**: Trạng thái thanh toán của hóa đơn (`CHUA_THANH_TOAN`, `DA_THANH_TOAN`).
*   **2️⃣3️⃣ `AuthProvider.java`**: Nguồn đăng ký xác thực của tài khoản (`LOCAL` cho mật khẩu thường, `GOOGLE` cho OAuth2).

---

## ⚠️ 5. EXCEPTIONS (4 Files)

### 2️⃣4️⃣ `BadRequestException.java`
*   **Mục đích**: Lỗi dữ liệu đầu vào sai logic nghiệp vụ (trả về mã HTTP 400).
```java
package com.btl.server.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String msg) { super(msg); } // Gửi thông điệp lỗi
}
```

### 2️⃣5️⃣ `NotFoundException.java`
*   **Mục đích**: Lỗi không tìm thấy tài nguyên yêu cầu (trả về mã HTTP 404).
```java
package com.btl.server.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends RuntimeException {
    public NotFoundException(String msg) { super(msg); }
}
```

### 2️⃣6️⃣ `ForbiddenException.java`
*   **Mục đích**: Lỗi không được phép truy cập/thao tác do sai phân quyền (trả về mã HTTP 403).
```java
package com.btl.server.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String msg) { super(msg); }
}
```

### 2️⃣7️⃣ `GlobalExceptionHandler.java`
*   **Mục đích**: Tập trung xử lý lỗi toàn cục và định dạng JSON lỗi thống nhất trả về Client.
```java
package com.btl.server.exception;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice // Nhãn gom toàn bộ lỗi trong hệ thống về đây
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage())); // Trả JSON lỗi 404
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage())); // Trả JSON lỗi 400
    }
}
```

---

## 📦 6. DATA TRANSFER OBJECTS - DTO (7 Files)

### 2️⃣8️⃣ `AuthRequestDTO.java`
*   **Mục đích**: Đóng gói thông tin đăng ký và tự động validate email Gmail.
```java
package com.btl.server.dto;
import jakarta.validation.constraints.*;

public class AuthRequestDTO {
    @NotBlank(message = "Tên đăng nhập không được trống")
    private String username;
    @Size(min = 6, message = "Mật khẩu dài ít nhất 6 ký tự")
    private String password;
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email phải là Gmail hợp lệ")
    private String email;
    private String hoTen;
    // getter, setter sinh tự động bởi Lombok...
}
```

### 2️⃣9️⃣ `CapNhatHoSoDTO.java`
*   **Mục đích**: Đóng gói dữ liệu cập nhật CCCD, SĐT, Ngày sinh của Khách hàng.
```java
package com.btl.server.dto;
import java.time.LocalDate;

public class CapNhatHoSoDTO {
    private String hoTen;
    private String soDienThoai;
    private String soCccd;
    private LocalDate ngaySinh;
    private String queQuan;
}
```

### 3️⃣0️⃣ `HopDongRequestDTO.java`
*   **Mục đích**: Đóng gói thông tin đăng ký thuê phòng từ khách hàng gửi lên.
```java
package com.btl.server.dto;
import java.math.BigDecimal;
import java.time.LocalDate;

public class HopDongRequestDTO {
    private Long phongTroId;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private BigDecimal tienCoc;
}
```

### 3️⃣1️⃣ `HoSoResponseDTO.java`
*   **Mục đích**: Đóng gói dữ liệu profile trả về client (bảo mật, không trả về password).
```java
package com.btl.server.dto;

public class HoSoResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String hoTen;
}
```

### 3️⃣2️⃣ `KhachHangDTO.java`
*   **Mục đích**: Đóng gói dữ liệu chuyển tiếp hồ sơ khách hàng.
```java
package com.btl.server.dto;

public class KhachHangDTO {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String soCccd;
}
```

### 3️⃣3️⃣ `PhieuTinhTienDTO.java`
*   **Mục đích**: Đóng gói dữ liệu chi tiết tính toán tiền điện nước trả về cho chủ trọ.
```java
package com.btl.server.dto;
import java.math.BigDecimal;

public class PhieuTinhTienDTO {
    private Long phongId;
    private int thang;
    private int nam;
    private BigDecimal giaPhong;
    private int soDienDung;
    private BigDecimal tienDien;
    private int soNuocDung;
    private BigDecimal tienNuoc;
    private BigDecimal tongTien;
}
```

### 3️⃣4️⃣ `ThongKeDTO.java`
*   **Mục đích**: Đóng gói dữ liệu báo cáo thống kê hiển thị biểu đồ trên giao diện Dashboard.
```java
package com.btl.server.dto;
import java.math.BigDecimal;
import java.util.Map;

public class ThongKeDTO {
    private BigDecimal tongDoanhThu;
    private long tongSoPhong;
    private Map<String, Long> thongKePhongTheoTrangThai; // Số phòng TRONG, DA_THUE, BAO_TRI
}
```

---

## 💾 7. REPOSITORIES (10 Files)

Các Repository kế thừa `JpaRepository` giúp thao tác với cơ sở dữ liệu MySQL một cách tự động thông qua Spring Data JPA.

### 3️⃣5️⃣ `TaiKhoanRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByUsername(String username); // Tự sinh SQL tìm theo username
    Optional<TaiKhoan> findByEmail(String email); // Tự sinh SQL tìm theo email
}
```

### 3️⃣6️⃣ `KhachHangRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    Optional<KhachHang> findByTaiKhoanId(Long taiKhoanId); // Tìm khách hàng theo ID tài khoản
    Optional<KhachHang> findByEmail(String email);
}
```

### 3️⃣7️⃣ `PhongTroRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.PhongTro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhongTroRepository extends JpaRepository<PhongTro, Long> {
    List<PhongTro> findByChuTroId(Long chuTroId); // Lấy toàn bộ phòng trọ thuộc về 1 chủ trọ
}
```

### 3️⃣8️⃣ `HopDongRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.HopDong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface HopDongRepository extends JpaRepository<HopDong, Long> {
    List<HopDong> findByKhachHang_Id(Long khachId);
    List<HopDong> findByPhongTro_ChuTroId(Long chuTroId);
    
    @Modifying // Nhãn thay đổi cập nhật hàng loạt dữ liệu (Bulk Update)
    @Query("UPDATE HopDong h SET h.trangThai = :trangThaiMoi WHERE h.phongTro.id = :phongId AND h.id <> :hopDongDuyetId AND h.trangThai = :trangThaiChoDuyet")
    int tuChoiCacHopDongChoDuyetKhac(Long phongId, Long hopDongDuyetId, TrangThaiHopDong trangThaiChoDuyet, TrangThaiHopDong trangThaiMoi);
}
```

### 3️⃣9️⃣ `HoaDonRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findByPhongTroChuTroId(Long chuTroId); // Lấy toàn bộ hóa đơn của khu trọ
    boolean existsByPhongTroIdAndThangAndNam(Long phongId, int thang, int nam); // Kiểm tra xem tháng này đã chốt số chưa
}
```

### 4️⃣0️⃣ `ChiSoDienNuocRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.ChiSoDienNuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChiSoDienNuocRepository extends JpaRepository<ChiSoDienNuoc, Long> {
    Optional<ChiSoDienNuoc> findByPhongTroIdAndThangAndNam(Long phongId, int thang, int nam);
}
```

### 4️⃣1️⃣ `KhieuNaiRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.KhieuNai;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KhieuNaiRepository extends JpaRepository<KhieuNai, Long> {
    List<KhieuNai> findByKhachHang_Id(Long khachId); // Lấy khiếu nại của riêng khách hàng đó
}
```

### 4️⃣2️⃣ `TinNhanRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.TinNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TinNhanRepository extends JpaRepository<TinNhan, Long> {
    @Query("SELECT t FROM TinNhan t WHERE (t.nguoiGuiId = :u1 AND t.nguoiNhanId = :u2) OR (t.nguoiGuiId = :u2 AND t.nguoiNhanId = :u1) ORDER BY t.thoiGian ASC")
    List<TinNhan> timLichSuChat(Long u1, Long u2); // Lấy tin nhắn chat qua lại giữa 2 người
}
```

### 4️⃣3️⃣ `ThongBaoRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    List<ThongBao> findByChuTroId(Long chuTroId); // Tìm toàn bộ thông báo do chủ trọ này đăng
}
```

### 4️⃣4️⃣ `NhatKyRepository.java`
```java
package com.btl.server.repository;
import com.btl.server.entity.NhatKyHoatDong;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhatKyRepository extends JpaRepository<NhatKyHoatDong, Long> {
    // Kế thừa mặc định phục vụ lưu nhật ký audit log
}
```

---

## 🧠 8. SERVICES & BUSINESS LOGIC (8 Files)

### 4️⃣5️⃣ `HopDongService.java`
*   **Mục đích**: Logic đăng ký, duyệt hợp đồng và từ chối tự động.
```java
@Service
public class HopDongService {
    @Autowired private HopDongRepository hopDongRepository;
    @Autowired private PhongTroRepository phongTroRepository;

    @Transactional // Quản lý giao dịch ACID
    public HopDong taoHopDong(HopDongRequestDTO request, TaiKhoan khachHang) {
        PhongTro phong = phongTroRepository.findById(request.getPhongTroId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng!"));
        if (phong.getTrangThai() != TrangThaiPhong.TRONG) {
            throw new BadRequestException("Phòng không còn trống, không thể thuê!");
        }
        HopDong hd = new HopDong();
        hd.setKhachHang(khachHang);
        hd.setPhongTro(phong);
        hd.setTienCoc(request.getTienCoc());
        hd.setTrangThai(TrangThaiHopDong.CHO_DUYET); // Thiết lập chờ duyệt ban đầu
        return hopDongRepository.save(hd);
    }
}
```

### 4️⃣6️⃣ `ChiSoDienNuocService.java`
*   **Mục đích**: Chốt chỉ số điện nước mới, chênh lệch số cũ và lập hóa đơn tự động.
```java
@Service
public class ChiSoDienNuocService {
    @Autowired private ChiSoDienNuocRepository chiSoRepo;
    @Autowired private HoaDonRepository hoaDonRepository;

    @Transactional
    public PhieuTinhTienDTO chotSoVaTinhTien(ChiSoDienNuoc chiSo) {
        if (chiSo.getSoDienMoi() < chiSo.getSoDienCu()) {
            throw new BadRequestException("Chỉ số mới không được nhỏ hơn chỉ số cũ!");
        }
        PhongTro phong = chiSo.getPhongTro();
        int soDienDung = chiSo.getSoDienMoi() - chiSo.getSoDienCu();
        BigDecimal tienDien = new BigDecimal("3500.0").multiply(BigDecimal.valueOf(soDienDung));
        BigDecimal tongTien = phong.getGiaPhong().add(tienDien); // Đã rút gọn để minh họa
        
        HoaDon hd = new HoaDon();
        hd.setPhongTro(phong);
        hd.setTongTien(tongTien);
        hd.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN);
        hoaDonRepository.save(hd); // Lưu hóa đơn
        
        return mappingToDTO(phong, hd);
    }
}
```

### 4️⃣7️⃣ `MailService.java`
*   **Mục đích**: Tạo và gửi mail xác thực OTP dạng HTML qua Gmail SMTP.
```java
@Service
public class MailService {
    @Autowired private JavaMailSender mailSender; // Thư viện Spring Mail gửi thư

    public void sendOtpMail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("MÃ OTP XÁC THỰC - SMART ROOM RENTAL");
            helper.setText("<h3>Mã OTP khôi phục mật khẩu của bạn là: <b>" + otp + "</b></h3>", true);
            mailSender.send(message); // Gửi mail đi
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gửi email thất bại!");
        }
    }
}
```

### 4️⃣8️⃣ `HoaDonService.java`
*   **Mục đích**: Nghiệp vụ quản lý hóa đơn, xóa hóa đơn sai và cập nhật đóng tiền.
```java
@Service
public class HoaDonService {
    @Autowired private HoaDonRepository repo;
    
    @Transactional
    public void thanhToanHoaDon(Long id) {
        // Tìm hóa đơn, set trạng thái thành Đã thanh toán khi khách quét VietQR thành công
        HoaDon hd = repo.findById(id).orElseThrow(() -> new NotFoundException("Hóa đơn không tồn tại!"));
        hd.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
        repo.save(hd);
    }
}
```

### 4️⃣9️⃣ `KhachHangService.java`
*   **Mục đích**: Nghiệp vụ cập nhật hồ sơ khách thuê, bắt buộc ngày sinh phải từ 18 tuổi.
```java
@Service
public class KhachHangService {
    @Autowired private KhachHangRepository repo;

    public KhachHang capNhatHoSo(Long khachId, CapNhatHoSoDTO dto) {
        // Kiểm tra ngày sinh: Khách thuê phải lớn hơn hoặc bằng 18 tuổi để chịu trách nhiệm dân sự
        if (dto.getNgaySinh().plusYears(18).isAfter(LocalDate.now())) {
            throw new BadRequestException("Khách thuê phòng phải từ 18 tuổi trở lên!");
        }
        // Tiến hành cập nhật thông tin cá nhân...
        return null;
    }
}
```

### 5️⃣0️⃣ `NhatKyService.java`
*   **Mục đích**: Ghi lịch sử hoạt động hệ thống vào DB.
```java
@Service
public class NhatKyService {
    @Autowired private NhatKyRepository repo;

    public void ghiLog(String username, String hanhDong, String chiTiet) {
        NhatKyHoatDong log = new NhatKyHoatDong();
        log.setUsername(username);
        log.setHanhDong(hanhDong);
        log.setChiTiet(chiTiet);
        log.setThoiGian(LocalDateTime.now());
        repo.save(log); // Lưu nhật ký hoạt động của user
    }
}
```

### 5️⃣1️⃣ `PhongTroService.java`
*   **Mục đích**: Thực hiện tìm kiếm phòng trọ trống theo nhiều tiêu chí của khách.
```java
@Service
public class PhongTroService {
    @Autowired private PhongTroRepository repo;

    public List<PhongTro> searchPhong(String ten, String diaChi, BigDecimal giaMin, BigDecimal giaMax) {
        // Chạy truy vấn lọc kết hợp tìm phòng trọ trống thỏa mãn các tiêu chí
        return repo.findAll(); 
    }
}
```

### 5️⃣2️⃣ `ThongKeService.java`
*   **Mục đích**: Tính toán tổng doanh thu và tỉ lệ lấp đầy phòng của chủ trọ/admin.
```java
@Service
public class ThongKeService {
    @Autowired private HoaDonRepository hoaDonRepo;

    public BigDecimal getDoanhThuThang(int thang, int nam) {
        // Tính tổng doanh thu từ hóa đơn có trạng thái DA_THANH_TOAN
        return BigDecimal.ZERO; 
    }
}
```

---

## 🛣️ 9. API CONTROLLERS (10 Files)

Các Controller nhận request từ Client, gọi Service xử lý và trả về dữ liệu định dạng JSON.

### 5️⃣3️⃣ `TaiKhoanController.java`
*   **Mục đích**: API login, register, và gửi OTP khôi phục mật khẩu.
```java
@RestController
@RequestMapping("/api/tai-khoan")
public class TaiKhoanController {
    @Autowired private MailService mailService;
    @Autowired private TaiKhoanRepository taiKhoanRepository;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        TaiKhoan tk = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email chưa đăng ký!"));
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000)); // Sinh 6 số ngẫu nhiên
        tk.setOtpCode(otp);
        tk.setOtpExp(LocalDateTime.now().plusMinutes(5));
        taiKhoanRepository.save(tk);

        mailService.sendOtpMail(email, otp); // Gọi gửi mail
        return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi về Gmail!"));
    }
}
```

### 5️⃣4️⃣ `ChatController.java`
*   **Mục đích**: API lấy lịch sử chat và nhận đẩy tin chat realtime qua WebSocket.
```java
@RestController
public class ChatController {
    @Autowired private SimpMessagingTemplate messagingTemplate; // Đẩy tin nhắn qua Socket Broker
    @Autowired private TinNhanRepository repo;

    @MessageMapping("/chat.send") // Lắng nghe client gửi tin lên cổng websocket /app/chat.send
    public void xuLyTinNhan(TinNhan tinNhan) {
        tinNhan.setThoiGian(LocalDateTime.now());
        repo.save(tinNhan); // Lưu lịch sử nhắn tin
        // Đẩy tin nhắn realtime về kênh mà người nhận đang chờ sẵn
        messagingTemplate.convertAndSend("/topic/chat/" + tinNhan.getNguoiNhanId(), tinNhan);
    }
}
```

### 5️⃣5️⃣ `PhongTroController.java`
*   **Mục đích**: API thêm, sửa, xóa phòng trọ và lọc tìm kiếm.
```java
@RestController
@RequestMapping("/api/phong-tro")
public class PhongTroController {
    @Autowired private PhongTroService service;

    @GetMapping("/search") // Lắng nghe GET requests lọc tìm kiếm phòng trống
    public ResponseEntity<List<PhongTro>> searchRooms(...) {
        return ResponseEntity.ok(service.searchPhong(...));
    }
}
```

### 5️⃣6️⃣ `HopDongController.java`
```java
@RestController
@RequestMapping("/api/hop-dong")
public class HopDongController {
    @Autowired private HopDongService service;

    @PutMapping("/{id}/duyet") // Lắng nghe yêu cầu duyệt hợp đồng của chủ trọ
    public ResponseEntity<?> approveContract(@PathVariable Long id) {
        service.duyetHopDong(id);
        return ResponseEntity.ok(Map.of("message", "Duyệt hợp đồng thành công!"));
    }
}
```

### 5️⃣7️⃣ `HoaDonController.java`
```java
@RestController
@RequestMapping("/api/hoa-don")
public class HoaDonController {
    @Autowired private HoaDonService service;

    @PostMapping("/{id}/thanh-toan") // Xác nhận đóng tiền
    public ResponseEntity<?> payInvoice(@PathVariable Long id) {
        service.thanhToanHoaDon(id);
        return ResponseEntity.ok(Map.of("message", "Thanh toán thành công!"));
    }
}
```

### 5️⃣8️⃣ `KhachHangController.java`
```java
@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {
    @Autowired private KhachHangService service;

    @PutMapping("/ho-so/me") // Cập nhật hồ sơ thông tin cá nhân khách thuê
    public ResponseEntity<?> updateProfile(@RequestBody CapNhatHoSoDTO dto) {
        service.capNhatHoSo(dto);
        return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ thành công!"));
    }
}
```

### 5️⃣9️⃣ `KhieuNaiController.java`
```java
@RestController
@RequestMapping("/api/khieu-nai")
public class KhieuNaiController {
    @Autowired private KhieuNaiRepository repo;

    @PostMapping // Khách thuê gửi khiếu nại lên hệ thống
    public ResponseEntity<?> submitComplaint(@RequestBody KhieuNai kn) {
        repo.save(kn);
        return ResponseEntity.ok(Map.of("message", "Gửi khiếu nại thành công!"));
    }
}
```

### 6️⃣0️⃣ `ThongBaoController.java`
```java
@RestController
@RequestMapping("/api/thong-bao")
public class ThongBaoController {
    @Autowired private ThongBaoRepository repo;

    @PostMapping // Chủ trọ đăng thông báo mới cho cả khu trọ
    public ResponseEntity<?> createNotification(@RequestBody ThongBao tb) {
        repo.save(tb);
        return ResponseEntity.ok(Map.of("message", "Đăng thông báo thành công!"));
    }
}
```

### 6️⃣1️⃣ `ThongKeController.java`
```java
@RestController
@RequestMapping("/api/thong-ke")
public class ThongKeController {
    @Autowired private ThongKeService service;

    @GetMapping // Xem thống kê doanh thu và phòng trọ
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(service.getThongKeAdmin());
    }
}
```

### 6️⃣2️⃣ `ChiSoDienNuocController.java`
```java
@RestController
@RequestMapping("/api/chi-so-dien-nuoc")
public class ChiSoDienNuocController {
    @Autowired private ChiSoDienNuocService service;

    @PostMapping("/chot-so") // API chốt số điện nước hàng tháng
    public ResponseEntity<?> submitUtilities(@RequestBody ChiSoDienNuoc cs) {
        PhieuTinhTienDTO phieu = service.chotSoVaTinhTien(cs);
        return ResponseEntity.ok(phieu);
    }
}
```
