package com.btl.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class AuthRequestDTO {

    @NotBlank(message = "Tên đăng nhập không được để trống!")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống!")
    @Size(min = 3, message = "Mật khẩu phải chứa ít nhất 6 ký tự")
    private String password;

    private String role;

    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email phải là địa chỉ Gmail hợp lệ (@gmail.com)")
    private String email;

    private String hoTen;
    private String otp;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}