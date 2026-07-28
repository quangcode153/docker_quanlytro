package com.btl.server.repository;

import com.btl.server.entity.TinNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TinNhanRepository extends JpaRepository<TinNhan, Long> {
    @Query("SELECT t FROM TinNhan t WHERE (t.nguoiGuiId = :user1 AND t.nguoiNhanId = :user2) OR (t.nguoiGuiId = :user2 AND t.nguoiNhanId = :user1) ORDER BY t.thoiGian ASC")
    List<TinNhan> timLichSuChat(Long user1, Long user2);
}