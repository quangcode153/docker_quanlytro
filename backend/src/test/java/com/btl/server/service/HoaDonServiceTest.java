package com.btl.server.service;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.btl.server.entity.HoaDon;
import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiHoaDon;
import com.btl.server.repository.ChiSoDienNuocRepository;
import com.btl.server.repository.HoaDonRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HoaDonServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private ChiSoDienNuocRepository chiSoRepo;

    @Mock
    private NhatKyService nhatKyService;

    @InjectMocks
    private HoaDonService hoaDonService;

    @Test
    void thanhToanHoaDon_WhenExists_ShouldUpdateStatusToDaThanhToan() {
        // Arrange
        Long hoaDonId = 1L;
        Long khachHangId = 10L;
        HoaDon mockHoaDon = new HoaDon();
        mockHoaDon.setId(hoaDonId);
        mockHoaDon.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN);

        when(hoaDonRepository.findById(hoaDonId)).thenReturn(Optional.of(mockHoaDon));

        // Act
        hoaDonService.thanhToanHoaDon(hoaDonId, khachHangId);

        // Assert
        assertEquals(TrangThaiHoaDon.DA_THANH_TOAN, mockHoaDon.getTrangThai());
        verify(hoaDonRepository, times(1)).save(mockHoaDon);
        verify(nhatKyService, times(1)).ghiLog(eq("THANH TOÁN"), anyString());
    }

    @Test
    void thanhToanHoaDon_WhenNotFound_ShouldThrowException() {
        // Arrange
        Long hoaDonId = 999L;
        when(hoaDonRepository.findById(hoaDonId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            hoaDonService.thanhToanHoaDon(hoaDonId, 10L);
        });
        verify(hoaDonRepository, never()).save(any());
    }

    @Test
    void xoaHoaDonBiSai_WhenExists_ShouldDeleteHoaDonAndChiSo() {
        // Arrange
        Long hoaDonId = 1L;
        PhongTro mockPhong = new PhongTro();
        mockPhong.setId(100L);

        HoaDon mockHoaDon = new HoaDon();
        mockHoaDon.setId(hoaDonId);
        mockHoaDon.setPhongTro(mockPhong);
        mockHoaDon.setThang(8);
        mockHoaDon.setNam(2026);

        when(hoaDonRepository.findById(hoaDonId)).thenReturn(Optional.of(mockHoaDon));
        when(chiSoRepo.findByPhongTroIdAndThangAndNam(100L, 8, 2026)).thenReturn(Optional.empty());

        // Act
        hoaDonService.xoaHoaDonBiSai(hoaDonId);

        // Assert
        verify(hoaDonRepository, times(1)).delete(mockHoaDon);
        verify(nhatKyService, times(1)).ghiLog(eq("XÓA HÓA ĐƠN"), anyString());
    }
}
