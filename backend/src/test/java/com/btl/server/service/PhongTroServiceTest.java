package com.btl.server.service;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.btl.server.entity.PhongTro;
import com.btl.server.enums.TrangThaiPhong;
import com.btl.server.exception.BadRequestException;
import com.btl.server.exception.NotFoundException;
import com.btl.server.repository.ChiSoDienNuocRepository;
import com.btl.server.repository.HoaDonRepository;
import com.btl.server.repository.HopDongRepository;
import com.btl.server.repository.PhongTroRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PhongTroServiceTest {

    @Mock
    private PhongTroRepository phongTroRepository;

    @Mock
    private HopDongRepository hopDongRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private ChiSoDienNuocRepository chiSoDienNuocRepository;

    @InjectMocks
    private PhongTroService phongTroService;

    @Test
    void getPhongById_WhenExists_ShouldReturnPhong() {
        // Arrange
        Long phongId = 1L;
        PhongTro mockPhong = new PhongTro();
        mockPhong.setId(phongId);
        mockPhong.setTenPhong("Phòng 101");
        mockPhong.setTrangThai(TrangThaiPhong.TRONG);
        
        when(phongTroRepository.findById(phongId)).thenReturn(Optional.of(mockPhong));

        // Act
        PhongTro result = phongTroService.getPhongById(phongId);

        // Assert
        assertNotNull(result);
        assertEquals(phongId, result.getId());
        assertEquals("Phòng 101", result.getTenPhong());
        verify(phongTroRepository, times(1)).findById(phongId);
    }

    @Test
    void getPhongById_WhenNotExists_ShouldThrowNotFoundException() {
        // Arrange
        Long phongId = 999L;
        when(phongTroRepository.findById(phongId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            phongTroService.getPhongById(phongId);
        });
        verify(phongTroRepository, times(1)).findById(phongId);
    }

    @Test
    void deletePhong_WhenDaThue_ShouldThrowBadRequestException() {
        // Arrange
        Long phongId = 1L;
        PhongTro mockPhong = new PhongTro();
        mockPhong.setId(phongId);
        mockPhong.setTrangThai(TrangThaiPhong.DA_THUE);

        when(phongTroRepository.findById(phongId)).thenReturn(Optional.of(mockPhong));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            phongTroService.deletePhong(phongId);
        });
        
        assertTrue(exception.getMessage().contains("Không thể xóa phòng đang có khách thuê"));
        verify(phongTroRepository, never()).delete(any());
    }

    @Test
    void deletePhong_WhenTrong_ShouldDeleteSuccessfully() {
        // Arrange
        Long phongId = 1L;
        PhongTro mockPhong = new PhongTro();
        mockPhong.setId(phongId);
        mockPhong.setTrangThai(TrangThaiPhong.TRONG);

        when(phongTroRepository.findById(phongId)).thenReturn(Optional.of(mockPhong));

        // Act
        phongTroService.deletePhong(phongId);

        // Assert
        verify(chiSoDienNuocRepository, times(1)).deleteByPhongTro_Id(phongId);
        verify(hoaDonRepository, times(1)).deleteByPhongTro_Id(phongId);
        verify(hopDongRepository, times(1)).deleteByPhongTro_Id(phongId);
        verify(phongTroRepository, times(1)).delete(mockPhong);
    }
}
