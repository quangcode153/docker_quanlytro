package com.btl.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.btl.server.entity.TaiKhoan;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByUsername(String username);
    Optional<TaiKhoan> findFirstByRole(String role);
    
        List<TaiKhoan> findByRole(String role);

        Page<TaiKhoan> findAll(Pageable pageable);

        @Query("SELECT t.id AS id, t.username AS username, t.locked AS locked, k.hoTen AS hoTen " +
           "FROM TaiKhoan t LEFT JOIN t.khachHang k WHERE t.role = 'ROLE_LANDLORD'")
    List<ChuTroProjection> findChuTroProjections();

    public interface ChuTroProjection {
        Long getId();
        String getUsername();
        Boolean getLocked();
        String getHoTen();
    }
}