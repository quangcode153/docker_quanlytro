package com.btl.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.btl.server.entity.HoaDon;
import com.btl.server.enums.TrangThaiHoaDon;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    
    boolean existsByPhongTroIdAndThangAndNam(Long phongId, Integer thang, Integer nam);

    @Query("SELECT hd FROM HoaDon hd JOIN HopDong h ON hd.phongTro.id = h.phongTro.id WHERE h.khachHang.id = :khachHangId AND h.trangThai = 'DA_DUYET'")
    List<HoaDon> findHoaDonByKhachHangId(@Param("khachHangId") Long khachHangId);

    List<HoaDon> findByPhongTroChuTroId(Long chuTroId);

    List<HoaDon> findByPhongTroChuTroIdAndTrangThai(Long chuTroId, TrangThaiHoaDon trangThai);

    @Query("SELECT SUM(h.tongTien) FROM HoaDon h WHERE h.phongTro.chuTroId = :chuTroId AND h.thang = :thang AND h.nam = :nam AND h.trangThai = 'DA_THANH_TOAN'")
    java.math.BigDecimal sumDoanhThuByChuTroAndThangNam(@Param("chuTroId") Long chuTroId, @Param("thang") Integer thang, @Param("nam") Integer nam);

    @Query("SELECT COUNT(h) FROM HoaDon h WHERE h.phongTro.chuTroId = :chuTroId AND h.trangThai = 'CHUA_THANH_TOAN'")
    Integer countHoaDonChuaThanhToan(@Param("chuTroId") Long chuTroId);

    @Query("SELECT SUM(h.tongTien) FROM HoaDon h WHERE h.phongTro.chuTroId = :chuTroId AND h.trangThai = 'CHUA_THANH_TOAN'")
    java.math.BigDecimal sumTienChuaThanhToan(@Param("chuTroId") Long chuTroId);

    @Modifying
    void deleteByPhongTro_Id(Long phongId);
}