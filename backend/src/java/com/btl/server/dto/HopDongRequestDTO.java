package com.btl.server.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class HopDongRequestDTO {

    @NotNull(message = "ID phòng trọ không được để trống!")
    private Long phongTroId;

    @NotNull(message = "Ngày bắt đầu không được để trống!")
    private LocalDate ngayBatDau;

    private LocalDate ngayKetThuc;

    @Min(value = 0, message = "Tiền cọc không được là số âm!")
    private BigDecimal tienCoc;

        public Long getPhongTroId() { return phongTroId; }
    public void setPhongTroId(Long phongTroId) { this.phongTroId = phongTroId; }
    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }
    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
    public BigDecimal getTienCoc() { return tienCoc; }
    public void setTienCoc(BigDecimal tienCoc) { this.tienCoc = tienCoc; }
}