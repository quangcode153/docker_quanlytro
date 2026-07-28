package com.btl.server.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "khach_thue")
public class KhachHang {

	@Id
	@Column(name = "khach_id")
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "khach_id")
	@JsonIgnore
	private TaiKhoan taiKhoan;

	@Column(name = "ho_ten")
	private String hoTen;

	@Column(name = "ngay_sinh")
	private LocalDate ngaySinh;

	@Column(name = "gioi_tinh")
	private String gioiTinh;

	@Column(name = "so_cccd", unique = true)
	private String soCccd;

	@Column(name = "so_dien_thoai")
	private String soDienThoai;

	@Column(name = "email")
	private String email;

	@Column(name = "dia_chi_thuong_tru", columnDefinition = "TEXT")
	private String diaChiThuongTru;

	@Column(name = "ten_ngan_hang")
	private String tenNganHang;

	@Column(name = "so_tai_khoan")
	private String soTaiKhoan;

	@Column(name = "chu_tai_khoan")
	private String chuTaiKhoan;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public TaiKhoan getTaiKhoan() {
		return taiKhoan;
	}

	public void setTaiKhoan(TaiKhoan taiKhoan) {
		this.taiKhoan = taiKhoan;
	}

	public String getHoTen() {
		return hoTen;
	}

	public void setHoTen(String hoTen) {
		this.hoTen = hoTen;
	}

	public LocalDate getNgaySinh() {
		return ngaySinh;
	}

	public void setNgaySinh(LocalDate ngaySinh) {
		this.ngaySinh = ngaySinh;
	}

	public String getGioiTinh() {
		return gioiTinh;
	}

	public void setGioiTinh(String gioiTinh) {
		this.gioiTinh = gioiTinh;
	}

	public String getSoCccd() {
		return soCccd;
	}

	public void setSoCccd(String soCccd) {
		this.soCccd = soCccd;
	}

	public String getSoDienThoai() {
		return soDienThoai;
	}

	public void setSoDienThoai(String soDienThoai) {
		this.soDienThoai = soDienThoai;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getDiaChiThuongTru() {
		return diaChiThuongTru;
	}

	public void setDiaChiThuongTru(String diaChiThuongTru) {
		this.diaChiThuongTru = diaChiThuongTru;
	}

	public String getTenNganHang() { return tenNganHang; }
	public void setTenNganHang(String tenNganHang) { this.tenNganHang = tenNganHang; }

	public String getSoTaiKhoan() { return soTaiKhoan; }
	public void setSoTaiKhoan(String soTaiKhoan) { this.soTaiKhoan = soTaiKhoan; }

	public String getChuTaiKhoan() { return chuTaiKhoan; }
	public void setChuTaiKhoan(String chuTaiKhoan) { this.chuTaiKhoan = chuTaiKhoan; }
}