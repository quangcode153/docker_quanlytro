package com.btl.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.btl.server.entity.NhatKyHoatDong;

@Repository
public interface NhatKyRepository extends JpaRepository<NhatKyHoatDong, Long> {
}