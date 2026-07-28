package com.btl.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.btl.server.entity.KhieuNai;
import java.util.List;

@Repository
public interface KhieuNaiRepository extends JpaRepository<KhieuNai, Long> {
    
    List<KhieuNai> findAllByOrderByThoiGianGuiDesc();
    
    List<KhieuNai> findByTrangThaiOrderByThoiGianGuiDesc(String trangThai);
}