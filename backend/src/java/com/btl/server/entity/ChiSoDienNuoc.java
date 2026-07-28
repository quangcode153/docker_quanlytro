package com.btl.server.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "chi_so_dien_nuoc")
public class ChiSoDienNuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thang")
    private Integer thang;

    @Column(name = "nam")
    private Integer nam;

    @Column(name = "so_dien_cu")
    private Integer soDienCu;

    @Column(name = "so_dien_moi")
    private Integer soDienMoi;

    @Column(name = "so_nuoc_cu")
    private Integer soNuocCu;

    @Column(name = "so_nuoc_moi")
    private Integer soNuocMoi;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PhongTro phongTro;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getThang() { return thang; }
    public void setThang(Integer thang) { this.thang = thang; }

    public Integer getNam() { return nam; }
    public void setNam(Integer nam) { this.nam = nam; }

    public Integer getSoDienCu() { return soDienCu; }
    public void setSoDienCu(Integer soDienCu) { this.soDienCu = soDienCu; }

    public Integer getSoDienMoi() { return soDienMoi; }
    public void setSoDienMoi(Integer soDienMoi) { this.soDienMoi = soDienMoi; }

    public Integer getSoNuocCu() { return soNuocCu; }
    public void setSoNuocCu(Integer soNuocCu) { this.soNuocCu = soNuocCu; }

    public Integer getSoNuocMoi() { return soNuocMoi; }
    public void setSoNuocMoi(Integer soNuocMoi) { this.soNuocMoi = soNuocMoi; }

    public PhongTro getPhongTro() { return phongTro; }
    public void setPhongTro(PhongTro phongTro) { this.phongTro = phongTro; }
}