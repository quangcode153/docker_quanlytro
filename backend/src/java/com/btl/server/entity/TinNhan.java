package com.btl.server.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tin_nhan")
public class TinNhan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_gui_id")
    private Long nguoiGuiId;

    @Column(name = "nguoi_nhan_id")
    private Long nguoiNhanId;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getNguoiGuiId() { return nguoiGuiId; }
    public void setNguoiGuiId(Long nguoiGuiId) { this.nguoiGuiId = nguoiGuiId; }
    public Long getNguoiNhanId() { return nguoiNhanId; }
    public void setNguoiNhanId(Long nguoiNhanId) { this.nguoiNhanId = nguoiNhanId; }
    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }
    public LocalDateTime getThoiGian() { return thoiGian; }
    public void setThoiGian(LocalDateTime thoiGian) { this.thoiGian = thoiGian; }
}