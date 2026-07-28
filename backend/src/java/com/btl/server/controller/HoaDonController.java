package com.btl.server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

import com.btl.server.service.HoaDonService;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.entity.HoaDon;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.enums.TrangThaiHoaDon;

@RestController
@RequestMapping("/api/hoa-don")
public class HoaDonController {

    private final HoaDonService hoaDonService;
    private final TaiKhoanRepository taiKhoanRepository;

    public HoaDonController(HoaDonService hoaDonService, TaiKhoanRepository taiKhoanRepository) {
        this.hoaDonService = hoaDonService;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<HoaDon>> layHoaDonTheoChuTro(
            @PathVariable Long chuTroId,
            @RequestParam(required = false) TrangThaiHoaDon trangThai) {
        if (trangThai != null) {
            return ResponseEntity.ok(hoaDonService.layHoaDonCuaChuTroTheoTrangThai(chuTroId, trangThai));
        }
        return ResponseEntity.ok(hoaDonService.layHoaDonCuaChuTro(chuTroId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<HoaDon>> layHoaDonCuaToi(Principal principal) {
        TaiKhoan tk = taiKhoanRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user!"));

        return ResponseEntity.ok(hoaDonService.layDanhSachHoaDonCuaKhach(tk.getId()));
    }

    @PostMapping("/{id}/thanh-toan")
    public ResponseEntity<Void> thanhToan(@PathVariable Long id, Principal principal) {
        TaiKhoan tk = taiKhoanRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user!"));

        hoaDonService.thanhToanHoaDon(id, tk.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaHoaDon(@PathVariable Long id) {
        hoaDonService.xoaHoaDonBiSai(id);
        return ResponseEntity.noContent().build();
    }
}