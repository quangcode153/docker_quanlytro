package com.btl.server.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpMessage(String to, String otp, boolean isRegister) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            if (isRegister) {
                message.setSubject("Mã OTP xác thực đăng ký tài khoản Quản Lý Phòng Trọ");
                message.setText("Chào bạn,\n\n"
                        + "Cảm ơn bạn đã lựa chọn sử dụng dịch vụ của hệ thống Quản Lý Phòng Trọ.\n"
                        + "Mã xác thực OTP đăng ký tài khoản của bạn là: " + otp + "\n"
                        + "Mã xác thực này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n"
                        + "Trân trọng,\n"
                        + "Ban quản trị Hệ thống Quản Lý Phòng Trọ");
            } else {
                message.setSubject("Mã OTP khôi phục mật khẩu tài khoản Quản Lý Phòng Trọ");
                message.setText("Chào bạn,\n\n"
                        + "Chúng tôi nhận được yêu cầu khôi phục mật khẩu liên kết với địa chỉ Gmail này.\n"
                        + "Mã xác thực OTP của bạn là: " + otp + "\n"
                        + "Mã xác thực này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n"
                        + "Trân trọng,\n"
                        + "Ban quản trị Hệ thống Quản Lý Phòng Trọ");
            }
            mailSender.send(message);
            System.out.println("[SMTP SUCCESS] Đã gửi email chứa OTP thành công tới: " + to);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("==================================================================");
            System.err.println("[DEVELOPER SMTP FALLBACK] GỬI MAIL SMTP THẤT BẠI (CHƯA CẤU HÌNH GMAIL THỰC TẾ).");
            System.err.println(">>> ĐỂ TEST ĐĂNG KÝ / QUÊN MẬT KHẨU, HÃY DÙNG MÃ OTP SAU:");
            System.err.println(">>> MÃ OTP XÁC THỰC CỦA BẠN LÀ: " + otp);
            System.err.println("==================================================================");
        }
    }
}
