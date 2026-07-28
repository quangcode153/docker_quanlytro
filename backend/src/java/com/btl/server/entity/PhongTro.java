package com.btl.server.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import com.btl.server.enums.TrangThaiPhong;

@Entity
@Table(name = "phong_tro")
public class PhongTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên phòng không được để trống!")
    @Column(name = "ten_phong")
    private String tenPhong;

    @NotNull(message = "Chưa nhập giá phòng!")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá phòng không được là số âm!")
    @Column(name = "gia_phong")
    private BigDecimal giaPhong;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiPhong trangThai = TrangThaiPhong.TRONG;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "chu_tro_id", nullable = false)
    private Long chuTroId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá điện không được là số âm!")
    @Column(name = "gia_dien")
    private BigDecimal giaDien;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá nước không được là số âm!")
    @Column(name = "gia_nuoc")
    private BigDecimal giaNuoc;

    @Column(name = "dia_chi")
    private String diaChi;

    @DecimalMin(value = "0.0", inclusive = true, message = "Diện tích không được là số âm!")
    @Column(name = "dien_tich")
    private Double dienTich;

    @Column(name = "hinh_anh", columnDefinition = "TEXT")
    private String hinhAnh;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tiền cọc không được là số âm!")
    @Column(name = "tien_coc")
    private BigDecimal tienCoc;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenPhong() {
        return tenPhong;
    }

    public void setTenPhong(String tenPhong) {
        this.tenPhong = tenPhong;
    }

    public BigDecimal getGiaPhong() {
        return giaPhong;
    }

    public void setGiaPhong(BigDecimal giaPhong) {
        this.giaPhong = giaPhong;
    }

    public TrangThaiPhong getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThaiPhong trangThai) {
        this.trangThai = trangThai;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Long getChuTroId() {
        return chuTroId;
    }

    public void setChuTroId(Long chuTroId) {
        this.chuTroId = chuTroId;
    }

    public BigDecimal getGiaDien() {
        return giaDien;
    }

    public void setGiaDien(BigDecimal giaDien) {
        this.giaDien = giaDien;
    }

    public BigDecimal getGiaNuoc() {
        return giaNuoc;
    }

    public void setGiaNuoc(BigDecimal giaNuoc) {
        this.giaNuoc = giaNuoc;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public Double getDienTich() {
        return dienTich;
    }

    public void setDienTich(Double dienTich) {
        this.dienTich = dienTich;
    }

    public String getHinhAnh() {
        return hinhAnh;
    }

    public void setHinhAnh(String hinhAnh) {
        this.hinhAnh = hinhAnh;
    }

    public BigDecimal getTienCoc() {
        return tienCoc;
    }

    public void setTienCoc(BigDecimal tienCoc) {
        this.tienCoc = tienCoc;
    }
}