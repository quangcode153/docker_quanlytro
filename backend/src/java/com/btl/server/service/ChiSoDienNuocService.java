package com.btl.server.service;

import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btl.server.entity.ChiSoDienNuoc;
import com.btl.server.entity.HoaDon;
import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiHoaDon;
import com.btl.server.exception.BadRequestException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.ChiSoDienNuocRepository;
import com.btl.server.repository.HoaDonRepository;
import com.btl.server.repository.PhongTroRepository;
import com.btl.server.dto.PhieuTinhTienDTO;

@Service
public class ChiSoDienNuocService {

    private static final Logger log = LoggerFactory.getLogger(ChiSoDienNuocService.class);

    private final ChiSoDienNuocRepository chiSoRepo;
    private final PhongTroRepository phongTroRepository;
    private final HoaDonRepository hoaDonRepository;

    private static final BigDecimal GIA_DIEN = new BigDecimal("3500.0");
    private static final BigDecimal GIA_NUOC = new BigDecimal("20000.0");

    public ChiSoDienNuocService(ChiSoDienNuocRepository chiSoRepo, 
                                PhongTroRepository phongTroRepository, 
                                HoaDonRepository hoaDonRepository) {
        this.chiSoRepo = chiSoRepo;
        this.phongTroRepository = phongTroRepository;
        this.hoaDonRepository = hoaDonRepository;
    }

    @Transactional
    public PhieuTinhTienDTO chotSoVaTinhTien(ChiSoDienNuoc chiSo) {
        
        Long idPhong = chiSo.getPhongTro().getId();
        Integer thang = chiSo.getThang();
        Integer nam = chiSo.getNam();

        if (hoaDonRepository.existsByPhongTroIdAndThangAndNam(idPhong, thang, nam)) {
            throw new BadRequestException("Dữ liệu tháng " + thang + "/" + nam + " của phòng này đã tồn tại. Vui lòng kiểm tra lại hoặc xóa hóa đơn cũ trước khi chốt số mới!");
        }

        if (chiSo.getSoDienMoi() < chiSo.getSoDienCu() || chiSo.getSoNuocMoi() < chiSo.getSoNuocCu()) {
            throw new BadRequestException("Chỉ số mới không được nhỏ hơn chỉ số cũ!");
        }

        PhongTro phong = phongTroRepository.findById(idPhong)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng này!"));

        BigDecimal giaPhong = phong.getGiaPhong();
        ChiSoDienNuoc daLuu = chiSoRepo.save(chiSo);

        int soDienDung = daLuu.getSoDienMoi() - daLuu.getSoDienCu();
        int soNuocDung = daLuu.getSoNuocMoi() - daLuu.getSoNuocCu();
        
        BigDecimal tienDien = GIA_DIEN.multiply(BigDecimal.valueOf(soDienDung));
        BigDecimal tienNuoc = GIA_NUOC.multiply(BigDecimal.valueOf(soNuocDung));
        BigDecimal tongTien = giaPhong.add(tienDien).add(tienNuoc);

        HoaDon hoaDonMoi = new HoaDon();
        hoaDonMoi.setPhongTro(phong);
        hoaDonMoi.setThang(daLuu.getThang());
        hoaDonMoi.setNam(daLuu.getNam());
        hoaDonMoi.setTienPhong(giaPhong);
        hoaDonMoi.setTienDien(tienDien);
        hoaDonMoi.setTienNuoc(tienNuoc);
        hoaDonMoi.setTongTien(tongTien);
        
        hoaDonMoi.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN); 
        
        hoaDonRepository.save(hoaDonMoi);

        PhieuTinhTienDTO phieu = new PhieuTinhTienDTO();
        phieu.setPhongId(phong.getId());
        phieu.setThang(daLuu.getThang());
        phieu.setNam(daLuu.getNam());
        phieu.setGiaPhong(giaPhong);
        phieu.setSoDienDung(soDienDung);
        phieu.setTienDien(tienDien);
        phieu.setSoNuocDung(soNuocDung);
        phieu.setTienNuoc(tienNuoc);
        phieu.setTongTien(tongTien);

        log.info("Chốt số điện nước thành công cho phòng ID: {}, Tháng: {}/{}", idPhong, thang, nam);
        return phieu;
    }

    @Transactional
    public PhieuTinhTienDTO capNhatChiSoVaTinhTien(Long hoaDonId, ChiSoDienNuoc chiSoMoi) {
        HoaDon hd = hoaDonRepository.findById(hoaDonId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy hóa đơn!"));

        if (hd.getTrangThai() == TrangThaiHoaDon.DA_THANH_TOAN) {
            throw new BadRequestException("Hóa đơn đã được thanh toán, không thể thay đổi chỉ số điện nước!");
        }

        if (chiSoMoi.getSoDienMoi() < chiSoMoi.getSoDienCu() || chiSoMoi.getSoNuocMoi() < chiSoMoi.getSoNuocCu()) {
            throw new BadRequestException("Chỉ số mới không được nhỏ hơn chỉ số cũ!");
        }

        ChiSoDienNuoc chiSoHienTai = chiSoRepo.findByPhongTroIdAndThangAndNam(hd.getPhongTro().getId(), hd.getThang(), hd.getNam())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy dữ liệu điện nước của tháng này!"));

        chiSoHienTai.setSoDienCu(chiSoMoi.getSoDienCu());
        chiSoHienTai.setSoDienMoi(chiSoMoi.getSoDienMoi());
        chiSoHienTai.setSoNuocCu(chiSoMoi.getSoNuocCu());
        chiSoHienTai.setSoNuocMoi(chiSoMoi.getSoNuocMoi());

        ChiSoDienNuoc daLuu = chiSoRepo.save(chiSoHienTai);

        int soDienDung = daLuu.getSoDienMoi() - daLuu.getSoDienCu();
        int soNuocDung = daLuu.getSoNuocMoi() - daLuu.getSoNuocCu();
        
        BigDecimal tienDien = GIA_DIEN.multiply(BigDecimal.valueOf(soDienDung));
        BigDecimal tienNuoc = GIA_NUOC.multiply(BigDecimal.valueOf(soNuocDung));
        BigDecimal giaPhong = hd.getPhongTro().getGiaPhong();
        BigDecimal tongTien = giaPhong.add(tienDien).add(tienNuoc);

        hd.setTienDien(tienDien);
        hd.setTienNuoc(tienNuoc);
        hd.setTongTien(tongTien);
        
        hoaDonRepository.save(hd);

        PhieuTinhTienDTO phieu = new PhieuTinhTienDTO();
        phieu.setPhongId(hd.getPhongTro().getId());
        phieu.setThang(daLuu.getThang());
        phieu.setNam(daLuu.getNam());
        phieu.setGiaPhong(giaPhong);
        phieu.setSoDienDung(soDienDung);
        phieu.setTienDien(tienDien);
        phieu.setSoNuocDung(soNuocDung);
        phieu.setTienNuoc(tienNuoc);
        phieu.setTongTien(tongTien);

        log.info("Cập nhật số điện nước thành công cho hóa đơn ID: {}", hoaDonId);
        return phieu;
    }

    public java.util.Optional<ChiSoDienNuoc> layChiSoDienNuoc(Long phongId, Integer thang, Integer nam) {
        return chiSoRepo.findByPhongTroIdAndThangAndNam(phongId, thang, nam);
    }

    public java.util.List<ChiSoDienNuoc> layLichSuChiSo(Long phongId) {
        return chiSoRepo.findByPhongTroIdOrderByNamDescThangDesc(phongId);
    }
}