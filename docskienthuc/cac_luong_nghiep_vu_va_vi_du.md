# 🔄 Các Luồng Nghiệp Vụ Chính & Ví Dụ Code Thực Tế

Tài liệu này tổng hợp 5 luồng hoạt động (workflow) nghiệp vụ cốt lõi nhất của Backend, đi kèm phân tích từng bước và các **ví dụ code Java thực tế** lấy từ dự án để bạn dễ hình dung và tự tin trả lời vấn đáp.

---

## 1. Luồng Xác Thực OTP & Khôi Phục Mật Khẩu (OTP Flow)

### ❓ Sơ lược luồng hoạt động:
1.  **Gửi OTP**: Khách gửi email qua API `forgot-password` $\rightarrow$ Hệ thống sinh 6 số ngẫu nhiên $\rightarrow$ Lưu OTP & thời gian hết hạn (5 phút) vào bảng `TaiKhoan` $\rightarrow$ Gửi email HTML qua `MailService`.
2.  **Đổi mật khẩu**: Khách gửi Email, OTP và Mật khẩu mới qua API `reset-password` $\rightarrow$ Hệ thống so khớp OTP & kiểm tra hạn sử dụng $\rightarrow$ Băm mật khẩu mới bằng `BCrypt` $\rightarrow$ Lưu lại.

### 💻 Ví dụ Code Thực Tế:

#### Hàm gửi OTP ở [TaiKhoanController.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/controller/TaiKhoanController.java):
```java
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestParam String email) {
    Optional<TaiKhoan> tkOpt = taiKhoanRepository.findByEmail(email);
    if (tkOpt.isEmpty()) {
        throw new BadRequestException("Email này chưa được đăng ký trong hệ thống!");
    }

    TaiKhoan taiKhoan = tkOpt.get();
    // Sinh mã OTP 6 số ngẫu nhiên
    String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
    
    // Lưu vào database kèm hạn dùng 5 phút
    taiKhoan.setOtpCode(otp);
    taiKhoan.setOtpExp(LocalDateTime.now().plusMinutes(5));
    taiKhoanRepository.save(taiKhoan);

    // Gửi email
    mailService.sendOtpMail(email, otp);

    return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi về Gmail của bạn!"));
}
```

---

## 2. Luồng Đăng Nhập Bằng Google OAuth2 (Google Login Flow)

### ❓ Sơ lược luồng hoạt động:
1.  Người dùng click nút "Đăng nhập Google" ở Frontend $\rightarrow$ Trình duyệt trỏ đến endpoint `/oauth2/authorization/google` của Server.
2.  Sau khi người dùng xác thực với Google thành công, `CustomOAuth2UserService` tiếp nhận thông tin (email, name).
3.  Nếu tài khoản **chưa tồn tại**, hệ thống tự tạo một dòng `TaiKhoan` và `KhachHang` mới với phân quyền mặc định là `ROLE_USER`.
4.  Khi quá trình hoàn tất thành công, `OAuth2AuthenticationSuccessHandler` tạo Token JWT và gửi trả về Frontend bằng cách chuyển hướng trình duyệt (Redirect) kèm token trên URL tham số.

### 💻 Ví dụ Code Thực Tế:

#### Hàm tự động tạo tài khoản trong [CustomOAuth2UserService.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/security/oauth2/CustomOAuth2UserService.java):
```java
private TaiKhoan registerNewUser(String email, String name, AuthProvider provider) {
    // 1. Tạo thực thể đăng nhập TaiKhoan
    TaiKhoan taiKhoan = new TaiKhoan();
    taiKhoan.setUsername(email);
    taiKhoan.setRole("USER"); // Mặc định là Khách thuê
    taiKhoan.setProvider(provider); // GOOGLE
    taiKhoan = taiKhoanRepository.save(taiKhoan);

    // 2. Tạo thực thể hồ sơ KhachHang tương ứng
    KhachHang khachHang = new KhachHang();
    khachHang.setTaiKhoan(taiKhoan);
    khachHang.setHoTen(name);
    khachHang.setEmail(email);
    khachHangRepository.save(khachHang);

    return taiKhoan;
}
```

---

## 3. Luồng Tạo & Phê Duyệt Hợp Đồng (Contract Flow)

### ❓ Sơ lược luồng hoạt động:
1.  **Khách tạo**: Khách thuê gửi thông tin đăng ký (ID phòng, ngày bắt đầu, tiền cọc) $\rightarrow$ Hệ thống kiểm tra xem phòng đó có trống không $\rightarrow$ Tạo hợp đồng trạng thái `CHO_DUYET`.
2.  **Chủ duyệt**: Chủ trọ bấm duyệt hợp đồng $\rightarrow$ Hệ thống cập nhật trạng thái hợp đồng thành `DA_DUYET` $\rightarrow$ Chuyển trạng thái phòng trọ tương ứng thành `DA_THUE`.

### 💻 Ví dụ Code Thực Tế:

#### Logic Duyệt hợp đồng ở [HopDongService.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/service/HopDongService.java):
```java
@Transactional
public HopDong capNhatTrangThaiHopDong(Long hopDongId, TrangThaiHopDong trangThaiMoi, LocalDate ngayKetThuc, TaiKhoan currentUser) {
    HopDong hd = hopDongRepository.findById(hopDongId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy hợp đồng!"));

    // Phân quyền: Chỉ chủ trọ của phòng đó mới được phê duyệt
    if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
        if (!hd.getPhongTro().getChuTroId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền thao tác trên hợp đồng này!");
        }
    }

    hd.setTrangThai(trangThaiMoi);

    if (hd.getPhongTro() != null) {
        PhongTro p = hd.getPhongTro();
        
        if (trangThaiMoi == TrangThaiHopDong.DA_DUYET) {
            // Chuyển trạng thái phòng sang ĐÃ THUÊ
            p.setTrangThai(TrangThaiPhong.DA_THUE);
            phongTroRepository.save(p);

            // Tự động TỪ CHỐI tất cả các yêu cầu chờ duyệt khác của phòng này
            hopDongRepository.tuChoiCacHopDongChoDuyetKhac(
                    p.getId(), hd.getId(), TrangThaiHopDong.CHO_DUYET, TrangThaiHopDong.TU_CHOI);
        }
    }
    return hopDongRepository.save(hd);
}
```

---

## 4. Luồng Chốt Điện Nước & Tính Tiền Hàng Tháng (Utility Flow)

### ❓ Sơ lược luồng hoạt động:
1.  Chủ trọ gửi lên: `soDienMoi`, `soNuocMoi`, `thang`, `nam`.
2.  Hệ thống lấy thông tin phòng trọ $\rightarrow$ Kiểm tra số điện/nước mới phải $\ge$ số cũ $\rightarrow$ Nhân với đơn giá điện (3.500đ/kWh) và nước (20.000đ/m³) $\rightarrow$ Cộng với tiền phòng để ra tổng tiền $\rightarrow$ Tạo `HoaDon` trạng thái `CHUA_THANH_TOAN` gửi khách.

### 💻 Ví dụ Code Thực Tế:

#### Logic chốt số tính tiền ở [ChiSoDienNuocService.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/service/ChiSoDienNuocService.java):
```java
@Transactional
public PhieuTinhTienDTO chotSoVaTinhTien(ChiSoDienNuoc chiSo) {
    Long idPhong = chiSo.getPhongTro().getId();
    Integer thang = chiSo.getThang();
    Integer nam = chiSo.getNam();

    // 1. Kiểm tra xem tháng này phòng đã chốt và lập hóa đơn chưa
    if (hoaDonRepository.existsByPhongTroIdAndThangAndNam(idPhong, thang, nam)) {
        throw new BadRequestException("Dữ liệu tháng này của phòng đã tồn tại!");
    }

    // 2. Kiểm tra chỉ số mới không được nhỏ hơn chỉ số cũ
    if (chiSo.getSoDienMoi() < chiSo.getSoDienCu() || chiSo.getSoNuocMoi() < chiSo.getSoNuocCu()) {
        throw new BadRequestException("Chỉ số mới không được nhỏ hơn chỉ số cũ!");
    }

    PhongTro phong = phongTroRepository.findById(idPhong)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng!"));

    // 3. Tính toán chi phí dịch vụ
    BigDecimal giaPhong = phong.getGiaPhong();
    int soDienDung = chiSo.getSoDienMoi() - chiSo.getSoDienCu();
    int soNuocDung = chiSo.getSoNuocMoi() - chiSo.getSoNuocCu();
    
    BigDecimal tienDien = GIA_DIEN.multiply(BigDecimal.valueOf(soDienDung)); // GIA_DIEN = 3500.0
    BigDecimal tienNuoc = GIA_NUOC.multiply(BigDecimal.valueOf(soNuocDung)); // GIA_NUOC = 20000.0
    BigDecimal tongTien = giaPhong.add(tienDien).add(tienNuoc);

    // 4. Tạo hóa đơn gửi khách thuê
    HoaDon hoaDonMoi = new HoaDon();
    hoaDonMoi.setPhongTro(phong);
    hoaDonMoi.setThang(thang);
    hoaDonMoi.setNam(nam);
    hoaDonMoi.setTienPhong(giaPhong);
    hoaDonMoi.setTienDien(tienDien);
    hoaDonMoi.setTienNuoc(tienNuoc);
    hoaDonMoi.setTongTien(tongTien);
    hoaDonMoi.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN); 
    hoaDonRepository.save(hoaDonMoi);

    // 5. Trả về DTO tổng hợp kết quả hiển thị cho chủ trọ
    PhieuTinhTienDTO phieu = new PhieuTinhTienDTO();
    // ... set các giá trị trả về ...
    return phieu;
}
```

---

## 5. Luồng Gửi & Đẩy Tin Nhắn Chat Realtime (WebSocket Chat Flow)

### ❓ Sơ lược luồng hoạt động:
1.  Người dùng gửi tin nhắn (JSON) lên cổng websocket tại địa chỉ `/app/chat.send`.
2.  `ChatController` tiếp nhận tin nhắn, đóng dấu thời gian gửi hiện tại và lưu vào database.
3.  Gọi `messagingTemplate.convertAndSend` đẩy tin nhắn về cổng lắng nghe riêng của người nhận `/topic/chat/{nguoiNhanId}` để hiển thị tức thời (realtime) bên giao diện người nhận.

### 💻 Ví dụ Code Thực Tế:

#### Định cấu hình và đẩy tin nhắn ở [ChatController.java](file:///d:/test_antigravity/backend/src/java/com/btl/server/controller/ChatController.java):
```java
@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TinNhanRepository tinNhanRepository;

    // API HTTP thường để tải lại lịch sử chat khi mở hộp thoại
    @GetMapping("/api/tin-nhan/{user1}/{user2}")
    public List<TinNhan> layLichSuChat(@PathVariable Long user1, @PathVariable Long user2) {
        return tinNhanRepository.timLichSuChat(user1, user2);
    }

    // Endpoint nhận tin nhắn thời gian thực qua WebSocket
    @MessageMapping("/chat.send")
    public void xuLyTinNhan(TinNhan tinNhan) {
        tinNhan.setThoiGian(LocalDateTime.now());
        // Lưu tin nhắn vào Database
        tinNhanRepository.save(tinNhan);

        // Đẩy tin nhắn về kênh của người nhận và người gửi để đồng bộ hóa ngay lập tức
        messagingTemplate.convertAndSend("/topic/chat/" + tinNhan.getNguoiNhanId(), tinNhan);
        messagingTemplate.convertAndSend("/topic/chat/" + tinNhan.getNguoiGuiId(), tinNhan);
    }
}
```
