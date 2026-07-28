package com.btl.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import com.btl.server.entity.ChiSoDienNuoc;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChiSoDienNuocRepository extends JpaRepository<ChiSoDienNuoc, Long> {
    Optional<ChiSoDienNuoc> findByPhongTroIdAndThangAndNam(Long phongId, Integer thang, Integer nam);
    List<ChiSoDienNuoc> findByPhongTroIdOrderByNamDescThangDesc(Long phongId);

    @Modifying
    void deleteByPhongTro_Id(Long phongId);
}