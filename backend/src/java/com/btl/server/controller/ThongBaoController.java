package com.btl.server.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.btl.server.entity.ThongBao;
import com.btl.server.repository.ThongBaoRepository;

@RestController
@RequestMapping("/api/thong-bao")
public class ThongBaoController {

    @Autowired
    private ThongBaoRepository thongBaoRepository;

   @PostMapping
    public ResponseEntity<ThongBao> dangThongBao(@RequestBody ThongBao thongBao) {
        thongBao.setNgayDang(LocalDateTime.now());
        
        ThongBao saved = thongBaoRepository.save(thongBao);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<ThongBao>> layThongBaoTheoChuTro(@PathVariable Long chuTroId) {
        List<ThongBao> danhSach = thongBaoRepository.findByChuTroIdOrderByNgayDangDesc(chuTroId);
        return ResponseEntity.ok(danhSach);
    }
}