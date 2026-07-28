package com.btl.server.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class CapNhatHoSoDTO {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải ở trong quá khứ")     private LocalDate ngaySinh;

    private String gioiTinh;

    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "^\\d{12}$", message = "CCCD phải đúng 12 chữ số")     private String soCccd;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Địa chỉ thường trú không được để trống")
    private String diaChiThuongTru;

    private String tenNganHang;
    private String soTaiKhoan;
    private String chuTaiKhoan;

        public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }
    public String getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(String gioiTinh) { this.gioiTinh = gioiTinh; }
    public String getSoCccd() { return soCccd; }
    public void setSoCccd(String soCccd) { this.soCccd = soCccd; }
    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDiaChiThuongTru() { return diaChiThuongTru; }
    public void setDiaChiThuongTru(String diaChiThuongTru) { this.diaChiThuongTru = diaChiThuongTru; }
    public String getTenNganHang() { return tenNganHang; }
    public void setTenNganHang(String tenNganHang) { this.tenNganHang = tenNganHang; }
    public String getSoTaiKhoan() { return soTaiKhoan; }
    public void setSoTaiKhoan(String soTaiKhoan) { this.soTaiKhoan = soTaiKhoan; }
    public String getChuTaiKhoan() { return chuTaiKhoan; }
    public void setChuTaiKhoan(String chuTaiKhoan) { this.chuTaiKhoan = chuTaiKhoan; }
}