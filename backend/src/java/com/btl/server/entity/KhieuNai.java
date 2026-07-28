package com.btl.server.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "khieu_nai")
public class KhieuNai {

    public enum TrangThaiKhieuNai {
        CHO_XU_LY,
        DANG_XU_LY,
        DA_GIAI_QUYET
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_gui_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TaiKhoan nguoiGui;

    @Column(nullable = false)
    private String tieuDe;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrangThaiKhieuNai trangThai = TrangThaiKhieuNai.CHO_XU_LY;

    @Column(name = "thoi_gian_gui", updatable = false)
    private LocalDateTime thoiGianGui;

    @PrePersist
    protected void onCreate() {
        if (this.thoiGianGui == null) {
            this.thoiGianGui = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TaiKhoan getNguoiGui() { return nguoiGui; }
    public void setNguoiGui(TaiKhoan nguoiGui) { this.nguoiGui = nguoiGui; }

    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public TrangThaiKhieuNai getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiKhieuNai trangThai) { this.trangThai = trangThai; }

    public LocalDateTime getThoiGianGui() { return thoiGianGui; }
    public void setThoiGianGui(LocalDateTime thoiGianGui) { this.thoiGianGui = thoiGianGui; }
}