package com.btl.server.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.btl.server.enums.TrangThaiHoaDon;

@Entity
@Table(name = "hoa_don")
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Thiếu thông tin tháng!")
    @Min(value = 1, message = "Tháng không hợp lệ!")
    @Max(value = 12, message = "Tháng không hợp lệ!")
    @Column(name = "thang")
    private Integer thang;

    @NotNull(message = "Thiếu thông tin năm!")
    @Min(value = 2000, message = "Năm không hợp lệ!")
    @Column(name = "nam")
    private Integer nam;

    @NotNull(message = "Chưa có tổng tiền!")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tổng tiền không được là số âm!")
    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiHoaDon trangThai = TrangThaiHoaDon.CHUA_THANH_TOAN;

    @Column(name = "tien_phong")
    private BigDecimal tienPhong;

    @Column(name = "tien_dien")
    private BigDecimal tienDien;

    @Column(name = "tien_nuoc")
    private BigDecimal tienNuoc;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "phong_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hoaDons"})
    private PhongTro phongTro;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getThang() { return thang; }
    public void setThang(Integer thang) { this.thang = thang; }

    public Integer getNam() { return nam; }
    public void setNam(Integer nam) { this.nam = nam; }

    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }

    public BigDecimal getTienPhong() { return tienPhong; }
    public void setTienPhong(BigDecimal tienPhong) { this.tienPhong = tienPhong; }

    public BigDecimal getTienDien() { return tienDien; }
    public void setTienDien(BigDecimal tienDien) { this.tienDien = tienDien; }

    public BigDecimal getTienNuoc() { return tienNuoc; }
    public void setTienNuoc(BigDecimal tienNuoc) { this.tienNuoc = tienNuoc; }

    public TrangThaiHoaDon getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiHoaDon trangThai) { this.trangThai = trangThai; }

    public PhongTro getPhongTro() { return phongTro; }
    public void setPhongTro(PhongTro phongTro) { this.phongTro = phongTro; }
}