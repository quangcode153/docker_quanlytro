package com.btl.server.service;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.btl.server.entity.NhatKyHoatDong;
import com.btl.server.repository.NhatKyRepository;

@Service
public class NhatKyService {

    @Autowired
    private NhatKyRepository nhatKyRepository;

    public void ghiLog(String hanhDong, String chiTiet) {
        NhatKyHoatDong log = new NhatKyHoatDong();
        log.setThoiGian(LocalDateTime.now());
        log.setNguoiThucHien("Admin");
        log.setHanhDong(hanhDong);
        log.setChiTiet(chiTiet);

        nhatKyRepository.save(log);
    }
}