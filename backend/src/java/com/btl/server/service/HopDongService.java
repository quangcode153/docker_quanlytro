package com.btl.server.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btl.server.dto.HopDongRequestDTO;
import com.btl.server.entity.HopDong;
import com.btl.server.entity.PhongTro;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.enums.TrangThaiHopDong;
import com.btl.server.enums.TrangThaiPhong;
import com.btl.server.exception.BadRequestException;
import com.btl.server.exception.ForbiddenException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.HopDongRepository;
import com.btl.server.repository.PhongTroRepository;

@Service
public class HopDongService {

    private static final Logger log = LoggerFactory.getLogger(HopDongService.class);

    private final HopDongRepository hopDongRepository;
    private final PhongTroRepository phongTroRepository;

    public HopDongService(HopDongRepository hopDongRepository, PhongTroRepository phongTroRepository) {
        this.hopDongRepository = hopDongRepository;
        this.phongTroRepository = phongTroRepository;
    }

    public HopDong taoHopDong(HopDongRequestDTO request, TaiKhoan khachHang) {
        
        if (request.getNgayKetThuc() != null && request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        PhongTro phong = phongTroRepository.findById(request.getPhongTroId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng!"));

        if (phong.getTrangThai() != TrangThaiPhong.TRONG) {
            throw new BadRequestException("Phòng không ở trạng thái TRỐNG, không thể thuê!");
        }

        if (hopDongRepository.existsByPhongTroAndTrangThai(phong, TrangThaiHopDong.DA_DUYET)) {
            throw new BadRequestException("Phòng này đã có người thuê chính thức!");
        }

        if (hopDongRepository.existsByKhachHangAndPhongTroAndTrangThai(khachHang, phong, TrangThaiHopDong.CHO_DUYET)) {
            throw new BadRequestException("Bạn đã gửi yêu cầu thuê phòng này rồi, vui lòng chờ duyệt!");
        }

        HopDong hopDong = new HopDong();
        hopDong.setKhachHang(khachHang);
        hopDong.setPhongTro(phong);
        hopDong.setNgayBatDau(request.getNgayBatDau());
        hopDong.setNgayKetThuc(request.getNgayKetThuc());
        hopDong.setTienCoc(request.getTienCoc() != null ? request.getTienCoc() : BigDecimal.ZERO);
        hopDong.setTrangThai(TrangThaiHopDong.CHO_DUYET);

        log.info("Khách hàng {} tạo yêu cầu thuê phòng {}", khachHang.getUsername(), phong.getId());
        return hopDongRepository.save(hopDong);
    }

    public List<HopDong> layTatCaHopDong() {
        return hopDongRepository.findAll();
    }

    public List<HopDong> layHopDongTheoChuTro(Long chuTroId) {
        return hopDongRepository.findByPhongTro_ChuTroId(chuTroId);
    }

    public List<HopDong> layHopDongTheoKhach(Long khachId) {
        return hopDongRepository.findByKhachHang_Id(khachId);
    }

    public List<HopDong> layHopDongTheoKhachVaTrangThai(Long khachId, TrangThaiHopDong trangThai) {
        return hopDongRepository.findByKhachHang_IdAndTrangThai(khachId, trangThai);
    }

    @Transactional
    public HopDong capNhatTrangThaiHopDong(Long hopDongId, TrangThaiHopDong trangThaiMoi, LocalDate ngayKetThuc, TaiKhoan currentUser) {
        HopDong hd = hopDongRepository.findById(hopDongId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hợp đồng!"));

        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
             if (!hd.getPhongTro().getChuTroId().equals(currentUser.getId())) {
                throw new ForbiddenException("Bạn không có quyền thao tác trên hợp đồng của khu trọ khác!");
            }
        }

        if (trangThaiMoi == TrangThaiHopDong.DA_DUYET) {
            if (hopDongRepository.existsByPhongTro_IdAndTrangThaiAndIdNot(hd.getPhongTro().getId(), TrangThaiHopDong.DA_DUYET, hd.getId())) {
                throw new BadRequestException("Phòng này đã có hợp đồng ĐÃ DUYỆT khác, không thể duyệt thêm!");
            }
        }

        hd.setTrangThai(trangThaiMoi);
        if (ngayKetThuc != null) {
            hd.setNgayKetThuc(ngayKetThuc);
        }

        if (hd.getPhongTro() != null) {
            PhongTro p = hd.getPhongTro();
            
            if (trangThaiMoi == TrangThaiHopDong.DA_DUYET) {
                p.setTrangThai(TrangThaiPhong.DA_THUE);
                phongTroRepository.save(p);

                int rejectedCount = hopDongRepository.tuChoiCacHopDongChoDuyetKhac(
                        p.getId(), hd.getId(), TrangThaiHopDong.CHO_DUYET, TrangThaiHopDong.TU_CHOI);
                
                log.info("Đã dùng Bulk Update từ chối tự động {} hợp đồng khác của phòng {}", rejectedCount, p.getId());
            } 
            else if (Arrays.asList(TrangThaiHopDong.TU_CHOI, TrangThaiHopDong.HUY, TrangThaiHopDong.DA_KET_THUC, TrangThaiHopDong.DA_THANH_LY).contains(trangThaiMoi)) {
                boolean conNguoiKhacThue = hopDongRepository
                        .existsByPhongTro_IdAndTrangThaiAndIdNot(p.getId(), TrangThaiHopDong.DA_DUYET, hd.getId());
                
                if (!conNguoiKhacThue) {
                    p.setTrangThai(TrangThaiPhong.TRONG);
                    phongTroRepository.save(p);
                }
            }
        }

        log.info("User {} chuyển trạng thái hợp đồng ID {} thành {}", currentUser.getUsername(), hopDongId, trangThaiMoi);
        return hopDongRepository.save(hd);
    }

    @Transactional
    public HopDong giaHanHopDong(Long id, LocalDate ngayKetThucMoi, TaiKhoan currentUser) {
        HopDong hd = hopDongRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hợp đồng!"));

        if (!"ROLE_ADMIN".equals(currentUser.getRole()) && !hd.getPhongTro().getChuTroId().equals(currentUser.getId())) {
            throw new ForbiddenException("Không có quyền gia hạn hợp đồng này!");
        }

        if (ngayKetThucMoi != null && ngayKetThucMoi.isBefore(hd.getNgayBatDau())) {
            throw new BadRequestException("Ngày kết thúc mới phải sau ngày bắt đầu!");
        }

        hd.setNgayKetThuc(ngayKetThucMoi);
        log.info("Chủ trọ {} gia hạn hợp đồng {} đến ngày {}", currentUser.getUsername(), id, ngayKetThucMoi);
        return hopDongRepository.save(hd);
    }

    @Transactional
    public void huyHopDongBoiKhach(Long hopDongId, TaiKhoan currentUser) {
        HopDong hd = hopDongRepository.findById(hopDongId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hợp đồng!"));

        if (!hd.getKhachHang().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền hủy hợp đồng của người khác!");
        }

        if (hd.getTrangThai() != TrangThaiHopDong.DA_DUYET) {
            throw new BadRequestException("Chỉ có thể gửi yêu cầu hủy hợp đồng đang có hiệu lực!");
        }

        // Chỉ gửi yêu cầu, chưa giải phóng phòng ngay
        hd.setTrangThai(TrangThaiHopDong.YEU_CAU_HUY);
        hopDongRepository.save(hd);
        
        log.info("Khách hàng {} đã gửi yêu cầu hủy hợp đồng ID {}. Đang chờ chủ trọ phê duyệt.", 
                currentUser.getUsername(), hopDongId);
    }
}