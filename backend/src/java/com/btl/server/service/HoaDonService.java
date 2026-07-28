package com.btl.server.service;

import com.btl.server.entity.ChiSoDienNuoc;
import com.btl.server.entity.HoaDon;
import com.btl.server.enums.TrangThaiHoaDon;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.btl.server.repository.ChiSoDienNuocRepository;
import com.btl.server.repository.HoaDonRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final ChiSoDienNuocRepository chiSoRepo;
    private final NhatKyService nhatKyService;

    private static final BigDecimal GIA_DIEN = new BigDecimal("3500.0");
    private static final BigDecimal GIA_NUOC = new BigDecimal("20000.0");

    public HoaDonService(HoaDonRepository hoaDonRepository,
                         ChiSoDienNuocRepository chiSoRepo,
                         NhatKyService nhatKyService) {
        this.hoaDonRepository = hoaDonRepository;
        this.chiSoRepo = chiSoRepo;
        this.nhatKyService = nhatKyService;
    }

    @Transactional
    public void xoaHoaDonBiSai(Long id) {
        HoaDon hd = hoaDonRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn này để xóa!"));
        
                chiSoRepo.findByPhongTroIdAndThangAndNam(hd.getPhongTro().getId(), hd.getThang(), hd.getNam())
            .ifPresent(chiSo -> chiSoRepo.delete(chiSo));

        hoaDonRepository.delete(hd);
        nhatKyService.ghiLog("XÓA HÓA ĐƠN", "Đã xóa hóa đơn và chỉ số điện nước tháng " + hd.getThang() + "/" + hd.getNam() + " (ID = " + id + ")");
    }

    public List<HoaDon> layHoaDonCuaChuTro(Long chuTroId) {
        return hoaDonRepository.findByPhongTroChuTroId(chuTroId);
    }

    public List<HoaDon> layHoaDonCuaChuTroTheoTrangThai(Long chuTroId, TrangThaiHoaDon trangThai) {
        return hoaDonRepository.findByPhongTroChuTroIdAndTrangThai(chuTroId, trangThai);
    }

    public List<HoaDon> layDanhSachHoaDonCuaKhach(Long khachHangId) {
        List<HoaDon> dsHoaDon = hoaDonRepository.findHoaDonByKhachHangId(khachHangId);
        
        for (HoaDon hd : dsHoaDon) {
            if (hd.getTienPhong() == null) {
                boSungChiTietHoaDon(hd);
            }
        }
        return dsHoaDon;
    }

    private void boSungChiTietHoaDon(HoaDon hd) {
        try {
            BigDecimal giaPhong = hd.getPhongTro().getGiaPhong();
            hd.setTienPhong(giaPhong);
            
            chiSoRepo.findByPhongTroIdAndThangAndNam(
                hd.getPhongTro().getId(), hd.getThang(), hd.getNam()
            ).ifPresent(chiSo -> {
                int soDien = chiSo.getSoDienMoi() - chiSo.getSoDienCu();
                int soNuoc = chiSo.getSoNuocMoi() - chiSo.getSoNuocCu();
                hd.setTienDien(GIA_DIEN.multiply(BigDecimal.valueOf(soDien)));
                hd.setTienNuoc(GIA_NUOC.multiply(BigDecimal.valueOf(soNuoc)));
            });
            
            if (hd.getTienDien() == null && hd.getTongTien() != null) {
                BigDecimal conLai = hd.getTongTien().subtract(giaPhong);
                hd.setTienDien(BigDecimal.ZERO);
                hd.setTienNuoc(conLai.compareTo(BigDecimal.ZERO) > 0 ? conLai : BigDecimal.ZERO);
            }

            hoaDonRepository.save(hd);
        } catch (Exception e) {
            
            if (hd.getTienPhong() == null) hd.setTienPhong(BigDecimal.ZERO);
            if (hd.getTienDien() == null) hd.setTienDien(BigDecimal.ZERO);
            if (hd.getTienNuoc() == null) hd.setTienNuoc(BigDecimal.ZERO);
        }
    }

    @Transactional
    public void thanhToanHoaDon(Long id, Long khachHangId) {
        HoaDon hd = hoaDonRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn!"));
            
        hd.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
        hoaDonRepository.save(hd);
        
        nhatKyService.ghiLog("THANH TOÁN", "Hóa đơn ID " + id + " đã được thanh toán thành công.");
    }
}