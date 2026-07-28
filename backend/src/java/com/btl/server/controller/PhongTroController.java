package com.btl.server.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.btl.server.entity.PhongTro;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.entity.HopDong;
import com.btl.server.enums.TrangThaiHopDong;
import com.btl.server.enums.TrangThaiPhong;
import com.btl.server.exception.BadRequestException;
import com.btl.server.exception.ForbiddenException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.service.PhongTroService;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.repository.HopDongRepository;

@RestController
@RequestMapping("/api/phong-tro")
public class PhongTroController {

    private static final Logger log = LoggerFactory.getLogger(PhongTroController.class);

    private final PhongTroService phongTroService;
    private final TaiKhoanRepository taiKhoanRepository;
    private final HopDongRepository hopDongRepository;

    public PhongTroController(PhongTroService phongTroService, 
                              TaiKhoanRepository taiKhoanRepository, 
                              HopDongRepository hopDongRepository) {
        this.phongTroService = phongTroService;
        this.taiKhoanRepository = taiKhoanRepository;
        this.hopDongRepository = hopDongRepository;
    }

    @GetMapping
    public ResponseEntity<List<PhongTro>> layDanhSachPhong(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(phongTroService.getAllPhongs());
        }

        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(principal.getName().toLowerCase()).orElse(null);
        
                if (taiKhoan != null && "ROLE_LANDLORD".equals(taiKhoan.getRole())) {
            return ResponseEntity.ok(phongTroService.getPhongByChuTroId(taiKhoan.getId()));
        }
        
        return ResponseEntity.ok(phongTroService.getAllPhongs());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LANDLORD')")
    public ResponseEntity<?> themPhongMoi(@Valid @RequestBody PhongTro phongTro, Principal principal) {
        if (principal == null) {
            throw new ForbiddenException("Bạn cần đăng nhập để thực hiện thao tác này!");
        }

        TaiKhoan chuTro = taiKhoanRepository.findByUsername(principal.getName().toLowerCase())
                .orElseThrow(() -> new ForbiddenException("Thông tin chủ trọ không hợp lệ!"));

        phongTro.setChuTroId(chuTro.getId());
        
                phongTro.setTrangThai(TrangThaiPhong.TRONG); 

        log.info("User {} đã thêm phòng trọ mới", chuTro.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(phongTroService.savePhong(phongTro));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @phongTroSecurity.isOwner(#id, authentication.name)")
    public ResponseEntity<?> capNhatPhong(@PathVariable Long id, @Valid @RequestBody PhongTro phongTroMoi) {
        PhongTro existingPhong = phongTroService.getPhongById(id);
        
        if (existingPhong == null) {
            throw new NotFoundException("Không tìm thấy phòng trọ!");
        }

        phongTroMoi.setId(id);
        phongTroMoi.setChuTroId(existingPhong.getChuTroId());
        
        log.info("Cập nhật thông tin phòng ID: {}", id);
        return ResponseEntity.ok(phongTroService.savePhong(phongTroMoi));
    }

    @PutMapping("/{id}/trang-thai")
    @Transactional
    @PreAuthorize("hasRole('ADMIN') or @phongTroSecurity.isOwner(#id, authentication.name)")
    public ResponseEntity<?> capNhatTrangThaiPhong(@PathVariable Long id, @RequestParam String trangThai) {
        PhongTro existingPhong = phongTroService.getPhongById(id);
        if (existingPhong == null) {
            throw new NotFoundException("Không tìm thấy phòng trọ!");
        }

                TrangThaiPhong trangThaiEnum;
        try {
            trangThaiEnum = TrangThaiPhong.valueOf(trangThai.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái phòng không hợp lệ!");
        }
        existingPhong.setTrangThai(trangThaiEnum);
        phongTroService.savePhong(existingPhong);

                if (trangThaiEnum == TrangThaiPhong.TRONG) {
            List<HopDong> hopDongs = hopDongRepository.findByPhongTro_Id(id);
            int count = 0;
            for (HopDong hd : hopDongs) {
                if (hd.getTrangThai() == TrangThaiHopDong.DA_DUYET) {
                    hd.setTrangThai(TrangThaiHopDong.DA_KET_THUC);
                    hopDongRepository.save(hd);
                    count++;
                }
            }
            if (count > 0) {
                log.info("Phòng {} chuyển trạng thái Trống. Đã thanh lý tự động {} hợp đồng.", id, count);
            }
        }
        
        return ResponseEntity.ok(existingPhong);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasRole('ADMIN') or @phongTroSecurity.isOwner(#id, authentication.name)")
    public ResponseEntity<?> xoaPhong(@PathVariable Long id) {
        PhongTro existingPhong = phongTroService.getPhongById(id);
        if (existingPhong == null) {
            throw new NotFoundException("Không tìm thấy phòng trọ!");
        }

        phongTroService.deletePhong(id);
        log.info("Đã xóa phòng ID: {}", id);
        
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành công phòng và các hợp đồng liên quan!"));
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<List<PhongTro>> timPhong(@RequestParam String trangThai) {
        try {
            TrangThaiPhong trangThaiEnum = TrangThaiPhong.valueOf(trangThai.toUpperCase());
            return ResponseEntity.ok(phongTroService.timPhongTheoTrangThai(trangThaiEnum));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái phòng không hợp lệ!");
        }
    }

        @GetMapping("/loc-phong")
    public ResponseEntity<List<PhongTro>> locPhongTheoGia(
            @RequestParam String trangThai, @RequestParam BigDecimal giaToiDa) {
        try {
            TrangThaiPhong trangThaiEnum = TrangThaiPhong.valueOf(trangThai.toUpperCase());
            return ResponseEntity.ok(phongTroService.locPhongTheoGia(trangThaiEnum, giaToiDa));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái phòng không hợp lệ!");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PhongTro>> searchPhong(
            @RequestParam(required = false) String tenPhong,
            @RequestParam(required = false) String diaChi,
            @RequestParam(required = false) BigDecimal giaToiThieu,
            @RequestParam(required = false) BigDecimal giaToiDa,
            @RequestParam(required = false) String trangThai) {
        TrangThaiPhong trangThaiEnum = null;
        if (trangThai != null && !trangThai.trim().isEmpty()) {
            try {
                trangThaiEnum = TrangThaiPhong.valueOf(trangThai.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Trạng thái phòng không hợp lệ!");
            }
        }
        return ResponseEntity.ok(phongTroService.searchPhongTro(tenPhong, diaChi, giaToiThieu, giaToiDa, trangThaiEnum));
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<PhongTro>> layPhongTheoChuTro(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(phongTroService.getPhongByChuTroId(chuTroId));
    }
}