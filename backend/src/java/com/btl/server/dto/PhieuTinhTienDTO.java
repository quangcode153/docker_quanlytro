package com.btl.server.dto;

import java.math.BigDecimal;

public class PhieuTinhTienDTO {
    private Long phongId;
    private Integer thang;
    private Integer nam;
    
        private BigDecimal giaPhong;
    
    private Integer soDienDung;
    
        private BigDecimal tienDien;
    
    private Integer soNuocDung;
    
        private BigDecimal tienNuoc;
    
        private BigDecimal tongTien;

    public Long getPhongId() { return phongId; }
    public void setPhongId(Long phongId) { this.phongId = phongId; }

    public Integer getThang() { return thang; }
    public void setThang(Integer thang) { this.thang = thang; }

    public Integer getNam() { return nam; }
    public void setNam(Integer nam) { this.nam = nam; }

    public BigDecimal getGiaPhong() { return giaPhong; }
    public void setGiaPhong(BigDecimal giaPhong) { this.giaPhong = giaPhong; }

    public Integer getSoDienDung() { return soDienDung; }
    public void setSoDienDung(Integer soDienDung) { this.soDienDung = soDienDung; }

    public BigDecimal getTienDien() { return tienDien; }
    public void setTienDien(BigDecimal tienDien) { this.tienDien = tienDien; }

    public Integer getSoNuocDung() { return soNuocDung; }
    public void setSoNuocDung(Integer soNuocDung) { this.soNuocDung = soNuocDung; }

    public BigDecimal getTienNuoc() { return tienNuoc; }
    public void setTienNuoc(BigDecimal tienNuoc) { this.tienNuoc = tienNuoc; }

    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
}