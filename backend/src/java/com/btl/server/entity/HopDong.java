package com.btl.server.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.btl.server.enums.TrangThaiHopDong;

@Entity
@Table(name = "hop_dong")
public class HopDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    @NotNull(message = "Chưa nhập ngày bắt đầu hợp đồng!")
    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

        @Min(value = 0, message = "Tiền cọc không được là số âm!")
    @Column(name = "tien_coc")
    private BigDecimal tienCoc; 

        @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, columnDefinition = "VARCHAR(50)")
    private TrangThaiHopDong trangThai = TrangThaiHopDong.CHO_DUYET;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_id")
    @JsonIgnoreProperties(value = {"hopDongs", "matKhau", "hibernateLazyInitializer", "handler"}, allowSetters = true)
    private TaiKhoan khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id")
    @JsonIgnoreProperties(value = {"hopDongs", "hibernateLazyInitializer", "handler"}, allowSetters = true)
    private PhongTro phongTro;

                public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }

    public BigDecimal getTienCoc() { return tienCoc; }
    public void setTienCoc(BigDecimal tienCoc) { this.tienCoc = tienCoc; }

    public TrangThaiHopDong getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiHopDong trangThai) { this.trangThai = trangThai; }

    public TaiKhoan getKhachHang() { return khachHang; }
    public void setKhachHang(TaiKhoan khachHang) { this.khachHang = khachHang; }

    public PhongTro getPhongTro() { return phongTro; }
    public void setPhongTro(PhongTro phongTro) { this.phongTro = phongTro; }
}