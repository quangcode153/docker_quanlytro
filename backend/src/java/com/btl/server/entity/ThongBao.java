package com.btl.server.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tieuDe;
    @Column(columnDefinition = "TEXT")
    private String noiDung;
    
    private LocalDateTime ngayDang;
    private Long chuTroId;     
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTieuDe() {
        return tieuDe;
    }
    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }
    public String getNoiDung() {
        return noiDung;
    }
    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
    public LocalDateTime getNgayDang() {
        return ngayDang;
    }
    public void setNgayDang(LocalDateTime ngayDang) {
        this.ngayDang = ngayDang;
    }
    public Long getChuTroId() {
        return chuTroId;
    }
    public void setChuTroId(Long chuTroId) {
        this.chuTroId = chuTroId;
    }
}