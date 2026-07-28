package com.btl.server.dto;

import java.time.LocalDate;

public class KhachHangDTO {
    
    private String hoTen; 
    
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String soCccd;
    private String soDienThoai;
    private String email;
    private String diaChiThuongTru;
    
    private String tenPhongDangThue;

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

    public String getTenPhongDangThue() { return tenPhongDangThue; }
    public void setTenPhongDangThue(String tenPhongDangThue) { this.tenPhongDangThue = tenPhongDangThue; }
}