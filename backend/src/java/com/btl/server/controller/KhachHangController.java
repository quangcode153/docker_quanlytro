package com.btl.server.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.btl.server.dto.CapNhatHoSoDTO;
import com.btl.server.dto.HoSoResponseDTO;
import com.btl.server.dto.KhachHangDTO;
import com.btl.server.service.KhachHangService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {

    @Autowired
    private KhachHangService khachHangService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KhachHangDTO>> layDanhSachKhachHang() {
        return ResponseEntity.ok(khachHangService.getKhachHangAnToan());
    }

    @GetMapping("/ho-so/me")
    public ResponseEntity<HoSoResponseDTO> layHoSoCaNhan(Principal principal) {
        return ResponseEntity.ok(khachHangService.layHoSoCaNhan(principal.getName()));
    }

    @PutMapping("/ho-so/me")
    public ResponseEntity<HoSoResponseDTO> capNhatHoSoCaNhan(
            Principal principal,
            @Valid @RequestBody CapNhatHoSoDTO dto) {
        return ResponseEntity.ok(khachHangService.capNhatHoSoCaNhan(principal.getName(), dto));
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<HoSoResponseDTO> layChiTietKhachHang(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(khachHangService.layHoSoTheoId(id, principal.getName()));
    }
}