package com.btl.server.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiPhong;

import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiPhong;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PhongTroRepository extends JpaRepository<PhongTro, Long> {
    
    List<PhongTro> findByChuTroId(Long chuTroId);

    List<PhongTro> findByTrangThai(TrangThaiPhong trangThai);

    long countByTrangThai(TrangThaiPhong trangThai);

    List<PhongTro> findByTrangThaiAndGiaPhongLessThanEqual(TrangThaiPhong trangThai, BigDecimal giaToiDa);

    List<PhongTro> findByTenPhongContainingIgnoreCase(String tenPhong);

    @Query("SELECT p FROM PhongTro p WHERE " +
           "(:tenPhong IS NULL OR LOWER(p.tenPhong) LIKE LOWER(CONCAT('%', :tenPhong, '%'))) AND " +
           "(:diaChi IS NULL OR LOWER(p.diaChi) LIKE LOWER(CONCAT('%', :diaChi, '%'))) AND " +
           "(:giaToiThieu IS NULL OR p.giaPhong >= :giaToiThieu) AND " +
           "(:giaToiDa IS NULL OR p.giaPhong <= :giaToiDa) AND " +
           "(:trangThai IS NULL OR p.trangThai = :trangThai)")
    List<PhongTro> searchPhongTro(@Param("tenPhong") String tenPhong,
                                  @Param("diaChi") String diaChi,
                                  @Param("giaToiThieu") BigDecimal giaToiThieu,
                                  @Param("giaToiDa") BigDecimal giaToiDa,
                                  @Param("trangThai") TrangThaiPhong trangThai);
}