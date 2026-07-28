package com.btl.server.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiHopDong;
import com.btl.server.enums.TrangThaiPhong;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.HopDongRepository;
import com.btl.server.repository.PhongTroRepository;
import com.btl.server.repository.HoaDonRepository;
import com.btl.server.repository.ChiSoDienNuocRepository;

@Service
public class PhongTroService {

    private static final Logger log = LoggerFactory.getLogger(PhongTroService.class);

    private final PhongTroRepository phongTroRepository;
    private final HopDongRepository hopDongRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiSoDienNuocRepository chiSoDienNuocRepository;

    public PhongTroService(PhongTroRepository phongTroRepository, 
                           HopDongRepository hopDongRepository,
                           HoaDonRepository hoaDonRepository,
                           ChiSoDienNuocRepository chiSoDienNuocRepository) {
        this.phongTroRepository = phongTroRepository;
        this.hopDongRepository = hopDongRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.chiSoDienNuocRepository = chiSoDienNuocRepository;
    }

    public List<PhongTro> getAllPhongs() {
        return phongTroRepository.findAll();
    }

    public PhongTro savePhong(PhongTro phongTro) {
        return phongTroRepository.save(phongTro);
    }

        public PhongTro getPhongById(Long id) {
        return phongTroRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng trọ có ID: " + id));
    }

    public List<PhongTro> getPhongByChuTroId(Long chuTroId) {
        return phongTroRepository.findByChuTroId(chuTroId);
    }

        public List<PhongTro> timPhongTheoTrangThai(TrangThaiPhong trangThai) {
        return phongTroRepository.findByTrangThai(trangThai);
    }

    public List<PhongTro> locPhongTheoGia(TrangThaiPhong trangThai,BigDecimal  giaToiDa) {
        return phongTroRepository.findByTrangThaiAndGiaPhongLessThanEqual(trangThai, giaToiDa);
    }

    public List<PhongTro> searchPhongTro(String tenPhong, String diaChi, BigDecimal giaToiThieu, BigDecimal giaToiDa, TrangThaiPhong trangThai) {
        return phongTroRepository.searchPhongTro(tenPhong, diaChi, giaToiThieu, giaToiDa, trangThai);
    }

        @Transactional
    public PhongTro capNhatTrangThaiPhong(Long id, TrangThaiPhong trangThaiMoi) {
        PhongTro existingPhong = getPhongById(id);
        existingPhong.setTrangThai(trangThaiMoi);
        phongTroRepository.save(existingPhong);

        if (trangThaiMoi == TrangThaiPhong.TRONG) {
            int count = hopDongRepository.ketThucHopDongTheoPhong(id, TrangThaiHopDong.DA_DUYET, TrangThaiHopDong.DA_KET_THUC);
            if (count > 0) {
                log.info("Phòng {} chuyển trạng thái TRỐNG. Đã thanh lý tự động {} hợp đồng.", id, count);
            }
        }
        return existingPhong;
    }

        @Transactional
    public void deletePhong(Long id) {
        PhongTro existingPhong = getPhongById(id);
        
        if (existingPhong.getTrangThai() == TrangThaiPhong.DA_THUE) {
            throw new com.btl.server.exception.BadRequestException("Không thể xóa phòng đang có khách thuê! Vui lòng thanh lý hợp đồng trước.");
        }
        
        chiSoDienNuocRepository.deleteByPhongTro_Id(id);
        hoaDonRepository.deleteByPhongTro_Id(id);
        hopDongRepository.deleteByPhongTro_Id(id);
        
        phongTroRepository.delete(existingPhong);
        log.info("Đã xóa sạch dữ liệu liên quan và phòng ID: {}", id);
    }
}