-- =================================================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG TRỌ (QUAN_LY_PHONG_TRO) - DATABASE INITIALIZATION SCRIPT
-- Database: MySQL
-- Charset: UTF-8 (utf8mb4)
-- Created for the current Spring Boot / Java backend application.
-- =================================================================================

-- 1. KHỞI TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IF NOT EXISTS `quan_ly_phong_tro` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `quan_ly_phong_tro`;

-- Tắt kiểm tra khóa ngoại tạm thời để tránh xung đột thứ tự tạo bảng/dữ liệu mẫu
SET FOREIGN_KEY_CHECKS = 0;

-- =================================================================================
-- 2. KHỞI TẠO BẢNG VÀ QUAN HỆ KHÓA (DDL)
-- =================================================================================

-- BẢNG: tai_khoan (Lưu thông tin đăng nhập và phân quyền)
DROP TABLE IF EXISTS `tai_khoan`;
CREATE TABLE `tai_khoan` (
  `id` BIGINT AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(255) NOT NULL,
  `provider` VARCHAR(255) DEFAULT 'LOCAL',
  `is_locked` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tai_khoan_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: khach_thue (Lưu hồ sơ chi tiết của khách thuê)
-- Quan hệ: 1-1 với bảng `tai_khoan` (khach_id làm Khóa chính và Khóa ngoại)
DROP TABLE IF EXISTS `khach_thue`;
CREATE TABLE `khach_thue` (
  `khach_id` BIGINT NOT NULL,
  `ho_ten` VARCHAR(255) DEFAULT NULL,
  `ngay_sinh` DATE DEFAULT NULL,
  `gioi_tinh` VARCHAR(255) DEFAULT NULL,
  `so_cccd` VARCHAR(255) DEFAULT NULL,
  `so_dien_thoai` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `dia_chi_thuong_tru` TEXT DEFAULT NULL,
  `ten_ngan_hang` VARCHAR(255) DEFAULT NULL,
  `so_tai_khoan` VARCHAR(255) DEFAULT NULL,
  `chu_tai_khoan` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`khach_id`),
  UNIQUE KEY `uk_khach_thue_so_cccd` (`so_cccd`),
  CONSTRAINT `fk_khach_thue_tai_khoan` FOREIGN KEY (`khach_id`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: phong_tro (Lưu thông tin phòng trọ)
-- Quan hệ: Nhiều phong_tro - 1 chu_tro (Liên kết đến bảng `tai_khoan`)
DROP TABLE IF EXISTS `phong_tro`;
CREATE TABLE `phong_tro` (
  `id` BIGINT AUTO_INCREMENT,
  `ten_phong` VARCHAR(255) NOT NULL,
  `gia_phong` DECIMAL(38,2) NOT NULL,
  `trang_thai` VARCHAR(255) NOT NULL DEFAULT 'TRONG', -- TRONG, DA_THUE, CHO_DUYET
  `mo_ta` TEXT DEFAULT NULL,
  `chu_tro_id` BIGINT NOT NULL,
  `gia_dien` DECIMAL(38,2) DEFAULT NULL,
  `gia_nuoc` DECIMAL(38,2) DEFAULT NULL,
  `dia_chi` VARCHAR(255) DEFAULT NULL,
  `dien_tich` DOUBLE DEFAULT NULL,
  `hinh_anh` LONGTEXT DEFAULT NULL,
  `tien_coc` DECIMAL(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_phong_tro_chu_tro` FOREIGN KEY (`chu_tro_id`) REFERENCES `tai_khoan` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: hop_dong (Lưu thông tin hợp đồng thuê trọ)
-- Quan hệ khóa:
--   - Nhiều hop_dong - 1 khach_thue (Liên kết qua khach_id đến tai_khoan(id))
--   - Nhiều hop_dong - 1 phong_tro (Liên kết qua phong_id đến phong_tro(id))
DROP TABLE IF EXISTS `hop_dong`;
CREATE TABLE `hop_dong` (
  `id` BIGINT AUTO_INCREMENT,
  `ngay_bat_dau` DATE NOT NULL,
  `ngay_ket_thuc` DATE DEFAULT NULL,
  `tien_coc` DECIMAL(38,2) DEFAULT NULL,
  `trang_thai` VARCHAR(50) NOT NULL DEFAULT 'CHO_DUYET', -- CHO_DUYET, DA_DUYET, TU_CHOI, DA_KET_THUC, CHO_HUY, DA_HUY
  `khach_id` BIGINT DEFAULT NULL,
  `phong_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hop_dong_khach_hang` FOREIGN KEY (`khach_id`) REFERENCES `tai_khoan` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hop_dong_phong_tro` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: hoa_don (Lưu thông tin hóa đơn tiền phòng và dịch vụ hàng tháng)
-- Quan hệ: Nhiều hoa_don - 1 phong_tro (Liên kết qua phong_id đến phong_tro(id))
DROP TABLE IF EXISTS `hoa_don`;
CREATE TABLE `hoa_don` (
  `id` BIGINT AUTO_INCREMENT,
  `thang` INT NOT NULL,
  `nam` INT NOT NULL,
  `tong_tien` DECIMAL(38,2) NOT NULL,
  `trang_thai` VARCHAR(255) NOT NULL DEFAULT 'CHUA_THANH_TOAN', -- CHUA_THANH_TOAN, DA_THANH_TOAN
  `tien_phong` DECIMAL(38,2) DEFAULT NULL,
  `tien_dien` DECIMAL(38,2) DEFAULT NULL,
  `tien_nuoc` DECIMAL(38,2) DEFAULT NULL,
  `phong_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_hoa_don_phong_tro` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: chi_so_dien_nuoc (Lưu chỉ số điện nước hàng tháng của từng phòng)
-- Quan hệ: Nhiều chi_so_dien_nuoc - 1 phong_tro (Liên kết qua phong_id đến phong_tro(id))
DROP TABLE IF EXISTS `chi_so_dien_nuoc`;
CREATE TABLE `chi_so_dien_nuoc` (
  `id` BIGINT AUTO_INCREMENT,
  `thang` INT DEFAULT NULL,
  `nam` INT DEFAULT NULL,
  `so_dien_cu` INT DEFAULT NULL,
  `so_dien_moi` INT DEFAULT NULL,
  `so_nuoc_cu` INT DEFAULT NULL,
  `so_nuoc_moi` INT DEFAULT NULL,
  `phong_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_chi_so_dien_nuoc_phong_tro` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: khieu_nai (Lưu các khiếu nại, phản ánh từ khách thuê)
-- Quan hệ: Nhiều khieu_nai - 1 tai_khoan (Liên kết qua nguoi_gui_id)
DROP TABLE IF EXISTS `khieu_nai`;
CREATE TABLE `khieu_nai` (
  `id` BIGINT AUTO_INCREMENT,
  `nguoi_gui_id` BIGINT NOT NULL,
  `tieu_de` VARCHAR(255) NOT NULL,
  `noi_dung` TEXT NOT NULL,
  `trang_thai` VARCHAR(255) NOT NULL DEFAULT 'CHO_XU_LY', -- CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET
  `thoi_gian_gui` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_khieu_nai_nguoi_gui` FOREIGN KEY (`nguoi_gui_id`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: thong_bao (Lưu các thông báo chung từ chủ trọ gửi hệ thống)
-- Quan hệ: Nhiều thong_bao - 1 tai_khoan (Liên kết qua chu_tro_id)
DROP TABLE IF EXISTS `thong_bao`;
CREATE TABLE `thong_bao` (
  `id` BIGINT AUTO_INCREMENT,
  `tieu_de` VARCHAR(255) DEFAULT NULL,
  `noi_dung` TEXT DEFAULT NULL,
  `ngay_dang` DATETIME DEFAULT NULL,
  `chu_tro_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_thong_bao_chu_tro` FOREIGN KEY (`chu_tro_id`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: tin_nhan (Lưu tin nhắn chat thời gian thực giữa các tài khoản)
-- Quan hệ khóa: 
--   - nguoi_gui_id liên kết đến tai_khoan(id)
--   - nguoi_nhan_id liên kết đến tai_khoan(id)
DROP TABLE IF EXISTS `tin_nhan`;
CREATE TABLE `tin_nhan` (
  `id` BIGINT AUTO_INCREMENT,
  `nguoi_gui_id` BIGINT DEFAULT NULL,
  `nguoi_nhan_id` BIGINT DEFAULT NULL,
  `noi_dung` TEXT DEFAULT NULL,
  `thoi_gian` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tin_nhan_nguoi_gui` FOREIGN KEY (`nguoi_gui_id`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tin_nhan_nguoi_nhan` FOREIGN KEY (`nguoi_nhan_id`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG: nhat_ky_hoat_dong (Lưu lịch sử hoạt động hệ thống, độc lập)
DROP TABLE IF EXISTS `nhat_ky_hoat_dong`;
CREATE TABLE `nhat_ky_hoat_dong` (
  `id` BIGINT AUTO_INCREMENT,
  `thoi_gian` DATETIME DEFAULT NULL,
  `nguoi_thuc_hien` VARCHAR(255) DEFAULT NULL,
  `hanh_dong` VARCHAR(255) DEFAULT NULL,
  `chi_tiet` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bật lại kiểm tra khóa ngoại sau khi hoàn tất tạo cấu trúc
SET FOREIGN_KEY_CHECKS = 1;


-- =================================================================================
-- 3. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA - DML)
-- =================================================================================

-- Thêm tài khoản mẫu: 
-- 1. Chủ trọ (landlord / mật khẩu gốc: '1532006quang' được mã hóa BCrypt tương ứng)
-- 2. Khách thuê (tenant1 / mật khẩu: 'password123' mã hóa BCrypt)
-- 3. Khách thuê (tenant2 / mật khẩu: 'password123' mã hóa BCrypt)
INSERT INTO `tai_khoan` (`id`, `username`, `password`, `role`, `provider`, `is_locked`) VALUES
(1, 'landlord', '$2a$10$wPv3aR8qL.WnQO/T/J/XuuCq/B3H59l/Z6V82d9C3J6.5L3WjJbBq', 'ROLE_LANDLORD', 'LOCAL', 0),
(2, 'tenant1', '$2a$10$wPv3aR8qL.WnQO/T/J/XuuCq/B3H59l/Z6V82d9C3J6.5L3WjJbBq', 'ROLE_TENANT', 'LOCAL', 0),
(3, 'tenant2', '$2a$10$wPv3aR8qL.WnQO/T/J/XuuCq/B3H59l/Z6V82d9C3J6.5L3WjJbBq', 'ROLE_TENANT', 'LOCAL', 0);

-- Thêm hồ sơ khách thuê chi tiết tương ứng với tài khoản tenant1 (id=2) và tenant2 (id=3)
INSERT INTO `khach_thue` (`khach_id`, `ho_ten`, `ngay_sinh`, `gioi_tinh`, `so_cccd`, `so_dien_thoai`, `email`, `dia_chi_thuong_tru`, `ten_ngan_hang`, `so_tai_khoan`, `chu_tai_khoan`) VALUES
(2, 'Nguyễn Văn A', '1998-05-15', 'Nam', '012345678901', '0912345678', 'vana@example.com', 'Hà Nội, Việt Nam', 'Vietcombank', '10129384829', 'NGUYEN VAN A'),
(3, 'Trần Thị B', '2000-11-20', 'Nữ', '098765432109', '0987654321', 'thib@example.com', 'Đà Nẵng, Việt Nam', 'MBBank', '99018273849', 'TRAN THI B');

-- Thêm thông tin phòng trọ của Chủ trọ (id=1)
INSERT INTO `phong_tro` (`id`, `ten_phong`, `gia_phong`, `trang_thai`, `mo_ta`, `chu_tro_id`, `gia_dien`, `gia_nuoc`, `dia_chi`, `dien_tich`, `hinh_anh`, `tien_coc`) VALUES
(1, 'Phòng 101 - Cao cấp', 3500000.00, 'DA_THUE', 'Phòng rộng có ban công thoáng mát, đầy đủ nội thất.', 1, 3500.00, 15000.00, 'Số 12 Ngõ 34, Cầu Giấy, Hà Nội', 25.5, '', 3500000.00),
(2, 'Phòng 102 - Tiêu chuẩn', 2800000.00, 'TRONG', 'Phòng tiện nghi cơ bản, khu vực an ninh tốt.', 1, 3500.00, 15000.00, 'Số 12 Ngõ 34, Cầu Giấy, Hà Nội', 20.0, '', 2800000.00),
(3, 'Phòng 201 - Studio', 4200000.00, 'CHO_DUYET', 'Phòng studio khép kín, hiện đại.', 1, 3500.00, 15000.00, 'Số 12 Ngõ 34, Cầu Giấy, Hà Nội', 30.0, '', 4200000.00);

-- Thêm thông tin Hợp đồng thuê
-- Nguyễn Văn A (id=2) đang thuê Phòng 101 (phong_id=1), hợp đồng đã duyệt
-- Trần Thị B (id=3) đang gửi yêu cầu thuê Phòng 201 (phong_id=3) chờ duyệt
INSERT INTO `hop_dong` (`id`, `ngay_bat_dau`, `ngay_ket_thuc`, `tien_coc`, `trang_thai`, `khach_id`, `phong_id`) VALUES
(1, '2026-01-01', '2026-12-31', 3500000.00, 'DA_DUYET', 2, 1),
(2, '2026-06-01', '2027-05-31', 4200000.00, 'CHO_DUYET', 3, 3);

-- Thêm lịch sử ghi số điện nước của Phòng 101 tháng 04 và tháng 05 năm 2026
INSERT INTO `chi_so_dien_nuoc` (`id`, `thang`, `nam`, `so_dien_cu`, `so_dien_moi`, `so_nuoc_cu`, `so_nuoc_moi`, `phong_id`) VALUES
(1, 4, 2026, 120, 250, 45, 55, 1),
(2, 5, 2026, 250, 410, 55, 68, 1);

-- Thêm Hóa đơn hàng tháng của Phòng 101
-- Hóa đơn tháng 4/2026: Đã thanh toán
-- Hóa đơn tháng 5/2026: Chưa thanh toán
INSERT INTO `hoa_don` (`id`, `thang`, `nam`, `tong_tien`, `trang_thai`, `tien_phong`, `tien_dien`, `tien_nuoc`, `phong_id`) VALUES
(1, 4, 2026, 4105000.00, 'DA_THANH_TOAN', 3500000.00, 455000.00, 150000.00, 1),
(2, 5, 2026, 4255000.00, 'CHUA_THANH_TOAN', 3500000.00, 560000.00, 195000.00, 1);

-- Thêm thông báo chung của Chủ trọ (id=1)
INSERT INTO `thong_bao` (`id`, `tieu_de`, `noi_dung`, `ngay_dang`, `chu_tro_id`) VALUES
(1, 'Thông báo bảo trì hệ thống PCCC', 'Hệ thống PCCC sẽ được kiểm tra và bảo dưỡng định kỳ vào sáng thứ Bảy ngày 23/05/2026. Xin cảm ơn sự hợp tác của các phòng.', '2026-05-15 08:00:00', 1);

-- Thêm khiếu nại mẫu của tenant1 Nguyễn Văn A (id=2)
INSERT INTO `khieu_nai` (`id`, `nguoi_gui_id`, `tieu_de`, `noi_dung`, `trang_thai`, `thoi_gian_gui`) VALUES
(1, 2, 'Yêu cầu kiểm tra khóa vòi nước', 'Vòi nước tại bồn rửa mặt nhà vệ sinh bị rò rỉ nước liên tục, mong chủ nhà cho người sửa chữa.', 'CHO_XU_LY', '2026-05-16 14:30:00');


-- =================================================================================
-- 4. CÁC CÂU TRUY VẤN THƯỜNG DÙNG TRONG ỨNG DỤNG (EXHAUSTIVE SQL QUERIES)
-- =================================================================================

-- [TRUY VẤN 1] Tìm kiếm thông tin đăng nhập tài khoản theo username
-- Ứng dụng: Xác thực bảo mật Spring Security (findByUsername)
-- SELECT * FROM tai_khoan WHERE username = 'landlord';

-- [TRUY VẤN 2] Lấy danh sách các Chủ trọ cùng thông tin Họ Tên của họ
-- Ứng dụng: Admin lấy danh sách tài khoản chủ nhà (findChuTroProjections)
-- SELECT t.id AS id, t.username AS username, t.is_locked AS locked, k.ho_ten AS hoTen 
-- FROM tai_khoan t 
-- LEFT JOIN khach_thue k ON t.id = k.khach_id 
-- WHERE t.role = 'ROLE_LANDLORD';

-- [TRUY VẤN 3] Tìm kiếm nâng cao phòng trọ đa bộ lọc (Search & Filters)
-- Ứng dụng: Khách thuê tìm kiếm phòng trống theo tên, khoảng giá, và trạng thái
-- SELECT * FROM phong_tro p 
-- WHERE ('phòng' IS NULL OR LOWER(p.ten_phong) LIKE LOWER(CONCAT('%', 'phòng', '%')))
--   AND (1000000.00 IS NULL OR p.gia_phong >= 1000000.00)
--   AND (4000000.00 IS NULL OR p.gia_phong <= 4000000.00)
--   AND ('TRONG' IS NULL OR p.trang_thai = 'TRONG');

-- [TRUY VẤN 4] Từ chối các yêu cầu thuê/hợp đồng đang chờ duyệt khác khi duyệt một hợp đồng thành công
-- Ứng dụng: Tự động từ chối hồ sơ khác cùng phòng khi một hồ sơ được chấp thuận (tuChoiCacHopDongChoDuyetKhac)
-- UPDATE hop_dong h 
-- SET h.trang_thai = 'TU_CHOI' 
-- WHERE h.phong_id = 1 
--   AND h.id <> 1 
--   AND h.trang_thai = 'CHO_DUYET';

-- [TRUY VẤN 5] Lấy toàn bộ danh sách hóa đơn của một khách thuê cụ thể dựa trên ID
-- Ứng dụng: Khách thuê xem hóa đơn hàng tháng của phòng mình đang thuê (findHoaDonByKhachHangId)
-- SELECT hd.* 
-- FROM hoa_don hd 
-- JOIN hop_dong h ON hd.phong_id = h.phong_id 
-- WHERE h.khach_id = 2 
--   AND h.trang_thai = 'DA_DUYET';

-- [TRUY VẤN 6] Tổng doanh thu thực tế đã thanh toán của chủ nhà trong tháng nhất định
-- Ứng dụng: Biểu đồ thống kê thu nhập trên Dashboard Chủ trọ (sumDoanhThuByChuTroAndThangNam)
-- SELECT SUM(h.tong_tien) 
-- FROM hoa_don h 
-- JOIN phong_tro p ON h.phong_id = p.id 
-- WHERE p.chu_tro_id = 1 
--   AND h.thang = 4 
--   AND h.nam = 2026 
--   AND h.trang_thai = 'DA_THANH_TOAN';

-- [TRUY VẤN 7] Đếm số lượng hóa đơn chưa thanh toán của tất cả các phòng thuộc một chủ trọ
-- Ứng dụng: Huy hiệu thông báo nhắc nhở nợ tiền trên Dashboard (countHoaDonChuaThanhToan)
-- SELECT COUNT(h.id) 
-- FROM hoa_don h 
-- JOIN phong_tro p ON h.phong_id = p.id 
-- WHERE p.chu_tro_id = 1 
--   AND h.trang_thai = 'CHUA_THANH_TOAN';

-- [TRUY VẤN 8] Tổng số tiền dư nợ (chưa thanh toán) của các phòng thuộc một chủ trọ
-- Ứng dụng: Xem tổng số tiền khách còn đang nợ chủ nhà (sumTienChuaThanhToan)
-- SELECT SUM(h.tong_tien) 
-- FROM hoa_don h 
-- JOIN phong_tro p ON h.phong_id = p.id 
-- WHERE p.chu_tro_id = 1 
--   AND h.trang_thai = 'CHUA_THANH_TOAN';

-- [TRUY VẤN 9] Lấy lịch sử tin nhắn giữa hai người dùng (ví dụ giữa ID 1 và ID 2)
-- Ứng dụng: Khung chat thời gian thực giữa Tenant và Landlord
-- SELECT * 
-- FROM tin_nhan t 
-- WHERE (t.nguoi_gui_id = 1 AND t.nguoi_nhan_id = 2) 
--    OR (t.nguoi_gui_id = 2 AND t.nguoi_nhan_id = 1) 
-- ORDER BY t.thoi_gian ASC;
