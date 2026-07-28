package com.btl.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.btl.server.entity.HopDong;
import com.btl.server.entity.PhongTro;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.enums.TrangThaiHopDong;

@Repository
public interface HopDongRepository extends JpaRepository<HopDong, Long> {

    boolean existsByPhongTroAndTrangThai(PhongTro phongTro, TrangThaiHopDong trangThai);

    boolean existsByKhachHangAndPhongTroAndTrangThai(TaiKhoan khachHang, PhongTro phongTro, TrangThaiHopDong trangThai);

        @Modifying(clearAutomatically = true)
    @Query("UPDATE HopDong h SET h.trangThai = :trangThaiMoi WHERE h.phongTro.id = :phongTroId AND h.id <> :hopDongIdDuocDuyet AND h.trangThai = :trangThaiCu")
    int tuChoiCacHopDongChoDuyetKhac(
            @Param("phongTroId") Long phongTroId, 
            @Param("hopDongIdDuocDuyet") Long hopDongIdDuocDuyet, 
            @Param("trangThaiCu") TrangThaiHopDong trangThaiCu, 
            @Param("trangThaiMoi") TrangThaiHopDong trangThaiMoi);

    List<HopDong> findByPhongTro_ChuTroId(Long chuTroId);

    List<HopDong> findByKhachHang_Id(Long khachHangId);

    List<HopDong> findByPhongTro_Id(Long phongTroId);

    List<HopDong> findByKhachHang_IdAndTrangThai(Long khachHangId, TrangThaiHopDong trangThai);

    boolean existsByPhongTro_IdAndTrangThaiAndIdNot(Long phongTroId, TrangThaiHopDong trangThai, Long hopDongIdLoaiTru);

         @Modifying(clearAutomatically = true)
    @Query("UPDATE HopDong h SET h.trangThai = :ketThuc WHERE h.phongTro.id = :phongId AND h.trangThai = :daDuyet")
    int ketThucHopDongTheoPhong(@Param("phongId") Long phongId, 
                                @Param("daDuyet") TrangThaiHopDong daDuyet, 
                                @Param("ketThuc") TrangThaiHopDong ketThuc);
    
    boolean existsByKhachHang_IdAndPhongTro_ChuTroId(Long khachHangId, Long chuTroId);

    @Modifying
    void deleteByPhongTro_Id(Long phongId);
}