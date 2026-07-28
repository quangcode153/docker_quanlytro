package com.btl.server.dto;

import java.math.BigDecimal;
import java.util.List;

public class ThongKeDTO {
    
    private BigDecimal tongDoanhThuThangNay;
    private BigDecimal tongDoanhThuThangTruoc;
    private Double tyLeTangTruong; 

    private int tongSoPhong;
    private int soPhongDaThue;
    private int soPhongTrong;

    private int soHoaDonChuaThanhToan;
    private BigDecimal tongTienChuaThanhToan;

    private List<BieuDoDoanhThu> bieuDoDoanhThu;

    public static class BieuDoDoanhThu {
        private int thang;
        private int nam;
        private BigDecimal doanhThu;

        public BieuDoDoanhThu(int thang, int nam, BigDecimal doanhThu) {
            this.thang = thang;
            this.nam = nam;
            this.doanhThu = doanhThu;
        }

        public int getThang() { return thang; }
        public int getNam() { return nam; }
        public BigDecimal getDoanhThu() { return doanhThu; }
    }

    public BigDecimal getTongDoanhThuThangNay() { return tongDoanhThuThangNay; }
    public void setTongDoanhThuThangNay(BigDecimal tongDoanhThuThangNay) { this.tongDoanhThuThangNay = tongDoanhThuThangNay; }

    public BigDecimal getTongDoanhThuThangTruoc() { return tongDoanhThuThangTruoc; }
    public void setTongDoanhThuThangTruoc(BigDecimal tongDoanhThuThangTruoc) { this.tongDoanhThuThangTruoc = tongDoanhThuThangTruoc; }

    public Double getTyLeTangTruong() { return tyLeTangTruong; }
    public void setTyLeTangTruong(Double tyLeTangTruong) { this.tyLeTangTruong = tyLeTangTruong; }

    public int getTongSoPhong() { return tongSoPhong; }
    public void setTongSoPhong(int tongSoPhong) { this.tongSoPhong = tongSoPhong; }

    public int getSoPhongDaThue() { return soPhongDaThue; }
    public void setSoPhongDaThue(int soPhongDaThue) { this.soPhongDaThue = soPhongDaThue; }

    public int getSoPhongTrong() { return soPhongTrong; }
    public void setSoPhongTrong(int soPhongTrong) { this.soPhongTrong = soPhongTrong; }

    public int getSoHoaDonChuaThanhToan() { return soHoaDonChuaThanhToan; }
    public void setSoHoaDonChuaThanhToan(int soHoaDonChuaThanhToan) { this.soHoaDonChuaThanhToan = soHoaDonChuaThanhToan; }

    public BigDecimal getTongTienChuaThanhToan() { return tongTienChuaThanhToan; }
    public void setTongTienChuaThanhToan(BigDecimal tongTienChuaThanhToan) { this.tongTienChuaThanhToan = tongTienChuaThanhToan; }

    public List<BieuDoDoanhThu> getBieuDoDoanhThu() { return bieuDoDoanhThu; }
    public void setBieuDoDoanhThu(List<BieuDoDoanhThu> bieuDoDoanhThu) { this.bieuDoDoanhThu = bieuDoDoanhThu; }
}
