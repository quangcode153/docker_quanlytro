package com.btl.server.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.btl.server.entity.ThongBao;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    
   List<ThongBao> findByChuTroIdOrderByNgayDangDesc(Long chuTroId);
}