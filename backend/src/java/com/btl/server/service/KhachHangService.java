package com.btl.server.service;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btl.server.entity.KhachHang;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.dto.KhachHangDTO;
import com.btl.server.dto.CapNhatHoSoDTO;
import com.btl.server.dto.HoSoResponseDTO;
import com.btl.server.exception.BadRequestException;
import com.btl.server.exception.ForbiddenException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.KhachHangRepository;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.repository.HopDongRepository;

@Service
public class KhachHangService {

    private static final Logger log = LoggerFactory.getLogger(KhachHangService.class);

    private final KhachHangRepository khachHangRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final HopDongRepository hopDongRepository;

    public KhachHangService(KhachHangRepository khachHangRepository,
                            TaiKhoanRepository taiKhoanRepository,
                            HopDongRepository hopDongRepository) {
        this.khachHangRepository = khachHangRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.hopDongRepository = hopDongRepository;
    }

    public List<KhachHang> getAllKhachHang() {
                return khachHangRepository.findAll();
    }

    @Transactional
    public KhachHang saveKhach(KhachHang khachHang) {
        return khachHangRepository.save(khachHang);
    }

    public List<KhachHangDTO> getKhachHangAnToan() {
        return khachHangRepository.findAll().stream().map(kh -> {
            KhachHangDTO dto = new KhachHangDTO();
            dto.setHoTen(kh.getHoTen());
            dto.setNgaySinh(kh.getNgaySinh());
            dto.setGioiTinh(kh.getGioiTinh());
            dto.setSoCccd(kh.getSoCccd());
            dto.setSoDienThoai(kh.getSoDienThoai());
            dto.setEmail(kh.getEmail());
            dto.setDiaChiThuongTru(kh.getDiaChiThuongTru());
            dto.setTenPhongDangThue("Xem chi tiết trong Hợp Đồng");
            return dto;
        }).collect(Collectors.toList());
    }

    public HoSoResponseDTO layHoSoCaNhan(String username) {
                TaiKhoan user = taiKhoanRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng!"));

        KhachHang hoSo = khachHangRepository.findByTaiKhoan(user)
                .orElseThrow(() -> new NotFoundException("Chưa có hồ sơ"));

        return new HoSoResponseDTO(hoSo);
    }

    public HoSoResponseDTO layHoSoTheoId(Long id, String currentUsername) {
        TaiKhoan currentUser = taiKhoanRepository.findByUsername(currentUsername.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng hiện tại!"));

         TaiKhoan targetUser = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản đích!"));

        KhachHang hoSo = khachHangRepository.findByTaiKhoan(targetUser)
                .orElseThrow(() -> new NotFoundException("Khách hàng này chưa cập nhật hồ sơ!"));

        if (!"ROLE_ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(hoSo.getId())) {
            boolean isMyTenant = hopDongRepository.existsByKhachHang_IdAndPhongTro_ChuTroId(hoSo.getId(), currentUser.getId());
            if (!isMyTenant) {
                log.warn("Security Alert: User {} cố gắng truy cập trái phép hồ sơ khách hàng ID: {}", currentUser.getUsername(), id);
                throw new ForbiddenException("Cảnh báo bảo mật: Bạn không có quyền xem hồ sơ của khách hàng này!");
            }
        }

        return new HoSoResponseDTO(hoSo);
    }

    @Transactional
    public HoSoResponseDTO capNhatHoSoCaNhan(String username, CapNhatHoSoDTO dto) {
        TaiKhoan user = taiKhoanRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng!"));

        validateCccd(dto.getSoCccd(), user.getId());

        KhachHang hoSo = buildOrUpdateHoSo(user, dto);

        log.info("Cập nhật hồ sơ thành công cho user: {}", user.getUsername());
        return new HoSoResponseDTO(khachHangRepository.save(hoSo));
    }

    private void validateCccd(String cccd, Long userId) {
        if (cccd == null || cccd.trim().isEmpty()) return;
        
        khachHangRepository.findBySoCccd(cccd).ifPresent(kh -> {
            if (kh.getTaiKhoan() != null && !kh.getTaiKhoan().getId().equals(userId)) {
                throw new BadRequestException("Số CCCD đã được đăng ký cho một tài khoản khác!");
            }
        });
    }

    private KhachHang buildOrUpdateHoSo(TaiKhoan user, CapNhatHoSoDTO dto) {
        KhachHang hoSo = khachHangRepository.findByTaiKhoan(user)
                .orElseGet(() -> {
                    KhachHang newHoSo = new KhachHang();
                    newHoSo.setTaiKhoan(user);
                    return newHoSo;
                });

        hoSo.setHoTen(dto.getHoTen());

        if (dto.getNgaySinh() != null) {
            LocalDate ngaySinh = dto.getNgaySinh();
            if (ngaySinh.isAfter(LocalDate.now())) {
                throw new BadRequestException("Ngày sinh không thể thuộc về tương lai!");
            }
            if (ngaySinh.getYear() <= 1900) {
                throw new BadRequestException("Năm sinh phải lớn hơn 1900!");
            }
            if (ngaySinh.isAfter(LocalDate.now().minusYears(18))) {
                throw new BadRequestException("Bạn phải từ 18 tuổi trở lên để đăng ký hoặc cập nhật hồ sơ!");
            }
        }
        hoSo.setNgaySinh(dto.getNgaySinh());
        hoSo.setGioiTinh(dto.getGioiTinh());
        hoSo.setSoCccd(dto.getSoCccd());
        hoSo.setSoDienThoai(dto.getSoDienThoai());
        hoSo.setDiaChiThuongTru(dto.getDiaChiThuongTru());
        hoSo.setTenNganHang(dto.getTenNganHang());
        hoSo.setSoTaiKhoan(dto.getSoTaiKhoan());
        hoSo.setChuTaiKhoan(dto.getChuTaiKhoan());

        return hoSo;
    }
}