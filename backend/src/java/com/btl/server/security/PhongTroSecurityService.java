package com.btl.server.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.btl.server.entity.PhongTro;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.service.PhongTroService;

@Component("phongTroSecurity")
public class PhongTroSecurityService {

    @Autowired
    private PhongTroService phongTroService;
    
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    public boolean isOwner(Long phongId, String username) {
        PhongTro phong = phongTroService.getPhongById(phongId);
        TaiKhoan user = taiKhoanRepository.findByUsername(username).orElse(null);
        
        if (phong == null || user == null) return false;
        return phong.getChuTroId().equals(user.getId());
    }
}