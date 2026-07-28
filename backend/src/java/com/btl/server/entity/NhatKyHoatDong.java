package com.btl.server.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhat_ky_hoat_dong")
public class NhatKyHoatDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    @Column(name = "nguoi_thuc_hien")
    private String nguoiThucHien;

    @Column(name = "hanh_dong")
    private String hanhDong;

    @Column(name = "chi_tiet", length = 500)
    private String chiTiet;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getThoiGian() { return thoiGian; }
    public void setThoiGian(LocalDateTime thoiGian) { this.thoiGian = thoiGian; }

    public String getNguoiThucHien() { return nguoiThucHien; }
    public void setNguoiThucHien(String nguoiThucHien) { this.nguoiThucHien = nguoiThucHien; }

    public String getHanhDong() { return hanhDong; }
    public void setHanhDong(String hanhDong) { this.hanhDong = hanhDong; }

    public String getChiTiet() { return chiTiet; }
    public void setChiTiet(String chiTiet) { this.chiTiet = chiTiet; }
}