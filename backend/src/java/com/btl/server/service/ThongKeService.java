package com.btl.server.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.btl.server.dto.ThongKeDTO;
import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiPhong;
import com.btl.server.repository.HoaDonRepository;
import com.btl.server.repository.PhongTroRepository;

@Service
public class ThongKeService {

    private final HoaDonRepository hoaDonRepository;
    private final PhongTroRepository phongTroRepository;

    public ThongKeService(HoaDonRepository hoaDonRepository, PhongTroRepository phongTroRepository) {
        this.hoaDonRepository = hoaDonRepository;
        this.phongTroRepository = phongTroRepository;
    }

    public ThongKeDTO layThongKeChuTro(Long chuTroId) {
        ThongKeDTO dto = new ThongKeDTO();

        List<PhongTro> cacPhong = phongTroRepository.findByChuTroId(chuTroId);
        int tongSoPhong = cacPhong.size();
        int soPhongDaThue = 0;
        int soPhongTrong = 0;

        for (PhongTro p : cacPhong) {
            if (p.getTrangThai() == TrangThaiPhong.DA_THUE) {
                soPhongDaThue++;
            } else if (p.getTrangThai() == TrangThaiPhong.TRONG) {
                soPhongTrong++;
            }
        }

        dto.setTongSoPhong(tongSoPhong);
        dto.setSoPhongDaThue(soPhongDaThue);
        dto.setSoPhongTrong(soPhongTrong);

        Integer countChuaThanhToan = hoaDonRepository.countHoaDonChuaThanhToan(chuTroId);
        BigDecimal tienChuaThanhToan = hoaDonRepository.sumTienChuaThanhToan(chuTroId);

        dto.setSoHoaDonChuaThanhToan(countChuaThanhToan != null ? countChuaThanhToan : 0);
        dto.setTongTienChuaThanhToan(tienChuaThanhToan != null ? tienChuaThanhToan : BigDecimal.ZERO);

        LocalDate now = LocalDate.now();
        int thangHienTai = now.getMonthValue();
        int namHienTai = now.getYear();

        int thangTruoc = thangHienTai == 1 ? 12 : thangHienTai - 1;
        int namTruoc = thangHienTai == 1 ? namHienTai - 1 : namHienTai;

        BigDecimal doanhThuThangNay = hoaDonRepository.sumDoanhThuByChuTroAndThangNam(chuTroId, thangHienTai,
                namHienTai);
        if (doanhThuThangNay == null)
            doanhThuThangNay = BigDecimal.ZERO;

        BigDecimal doanhThuThangTruoc = hoaDonRepository.sumDoanhThuByChuTroAndThangNam(chuTroId, thangTruoc, namTruoc);
        if (doanhThuThangTruoc == null)
            doanhThuThangTruoc = BigDecimal.ZERO;

        dto.setTongDoanhThuThangNay(doanhThuThangNay);
        dto.setTongDoanhThuThangTruoc(doanhThuThangTruoc);

        if (doanhThuThangTruoc.compareTo(BigDecimal.ZERO) == 0) {
            if (doanhThuThangNay.compareTo(BigDecimal.ZERO) > 0) {
                dto.setTyLeTangTruong(100.0);
            } else {
                dto.setTyLeTangTruong(0.0);
            }
        } else {
            BigDecimal chenhLech = doanhThuThangNay.subtract(doanhThuThangTruoc);
            BigDecimal phanTram = chenhLech.divide(doanhThuThangTruoc, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            dto.setTyLeTangTruong(phanTram.doubleValue());
        }

        List<ThongKeDTO.BieuDoDoanhThu> bieuDo = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate t = now.minusMonths(i);
            BigDecimal dt = hoaDonRepository.sumDoanhThuByChuTroAndThangNam(chuTroId, t.getMonthValue(), t.getYear());
            if (dt == null)
                dt = BigDecimal.ZERO;
            bieuDo.add(new ThongKeDTO.BieuDoDoanhThu(t.getMonthValue(), t.getYear(), dt));
        }
        dto.setBieuDoDoanhThu(bieuDo);

        return dto;
    }

    public Map<String, Object> layThongKeAdmin() {
        long tongSoPhong = phongTroRepository.count();
        long soPhongDaThue = phongTroRepository.countByTrangThai(com.btl.server.enums.TrangThaiPhong.DA_THUE);
        long soPhongTrong = phongTroRepository.countByTrangThai(com.btl.server.enums.TrangThaiPhong.TRONG);

        Map<String, Object> map = new HashMap<>();
        map.put("tongSoPhong", tongSoPhong);
        map.put("soPhongDaThue", soPhongDaThue);
        map.put("soPhongTrong", soPhongTrong);
        return map;
    }
}
