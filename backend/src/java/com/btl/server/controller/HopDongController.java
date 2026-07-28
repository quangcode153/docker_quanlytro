package com.btl.server.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.btl.server.dto.HopDongRequestDTO;
import com.btl.server.entity.HopDong;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.enums.TrangThaiHopDong;
import com.btl.server.exception.ForbiddenException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.service.HopDongService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hop-dong")
public class HopDongController {

    private static final Logger log = LoggerFactory.getLogger(HopDongController.class);

    private final HopDongService hopDongService;
    private final TaiKhoanRepository taiKhoanRepository;

    public HopDongController(HopDongService hopDongService, TaiKhoanRepository taiKhoanRepository) {
        this.hopDongService = hopDongService;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HopDong>> xemDanhSachHopDong() {
        return ResponseEntity.ok(hopDongService.layTatCaHopDong());
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> kyHopDongMoi(@Valid @RequestBody HopDongRequestDTO request, Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("Xác thực thất bại, user không tồn tại!"));

        hopDongService.taoHopDong(request, user);

        return ResponseEntity.ok(Map.of("message", "Đã tạo yêu cầu thuê phòng thành công!"));
    }

    @GetMapping("/chu-tro/{chuTroId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LANDLORD')")
    public ResponseEntity<List<HopDong>> layHopDongCuaChuTro(@PathVariable Long chuTroId, Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        if (!"ROLE_ADMIN".equals(user.getRole())) {
            if (!"ROLE_LANDLORD".equals(user.getRole()) || !user.getId().equals(chuTroId)) {
                throw new ForbiddenException("Không được phép xem dữ liệu của chủ trọ khác!");
            }
        }

        return ResponseEntity.ok(hopDongService.layHopDongTheoChuTro(chuTroId));
    }

    @GetMapping("/khach/{khachId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<HopDong>> layHopDongCuaKhach(
            @PathVariable Long khachId,
            @RequestParam(required = false, defaultValue = "ALL") String trangThai,
            Principal principal) {

        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        if (!user.getId().equals(khachId)) {
            throw new ForbiddenException("Không được phép xem dữ liệu của người khác!");
        }

        if ("ALL".equalsIgnoreCase(trangThai)) {
            return ResponseEntity.ok(hopDongService.layHopDongTheoKhach(khachId));
        }

        try {
            TrangThaiHopDong enumTrangThai = TrangThaiHopDong.valueOf(trangThai.toUpperCase());
            return ResponseEntity.ok(hopDongService.layHopDongTheoKhachVaTrangThai(khachId, enumTrangThai));
        } catch (IllegalArgumentException e) {
            throw new com.btl.server.exception.BadRequestException("Trạng thái hợp đồng không hợp lệ!");
        }
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LANDLORD')")
    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Long id,
            @RequestParam String trangThai,
            @RequestParam(required = false) String ngayKetThuc,
            Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        try {
            TrangThaiHopDong trangThaiMoi = TrangThaiHopDong.valueOf(trangThai.toUpperCase());
            java.time.LocalDate date = null;
            if (ngayKetThuc != null && !ngayKetThuc.isEmpty()) {
                date = java.time.LocalDate.parse(ngayKetThuc);
            }
            hopDongService.capNhatTrangThaiHopDong(id, trangThaiMoi, date, user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công!"));
        } catch (IllegalArgumentException e) {
            throw new com.btl.server.exception.BadRequestException("Trạng thái chuyển đổi không hợp lệ!");
        }
    }

    @PutMapping("/{id}/gia-han")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LANDLORD')")
    public ResponseEntity<?> capNhatGiaHan(@PathVariable Long id, @RequestParam String ngayKetThucMoi,
            Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        java.time.LocalDate date = java.time.LocalDate.parse(ngayKetThucMoi);
        hopDongService.giaHanHopDong(id, date, user);
        return ResponseEntity.ok(Map.of("message", "Gia hạn hợp đồng thành công!"));
    }

    @PutMapping("/{id}/thanh-ly")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LANDLORD')")
    public ResponseEntity<?> thanhLyHopDong(@PathVariable Long id, Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        hopDongService.capNhatTrangThaiHopDong(id, TrangThaiHopDong.DA_THANH_LY, null, user);
        return ResponseEntity.ok(Map.of("message", "Đã thanh lý hợp đồng thành công!"));
    }

    @PutMapping("/{id}/khach-huy")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> khachHuyHopDong(@PathVariable Long id, Principal principal) {
        TaiKhoan user = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User không tồn tại!"));

        hopDongService.huyHopDongBoiKhach(id, user);
        return ResponseEntity
                .ok(Map.of("message", "Đã hủy hợp đồng thành công! Tiền cọc sẽ bị khấu trừ theo quy định."));
    }
}