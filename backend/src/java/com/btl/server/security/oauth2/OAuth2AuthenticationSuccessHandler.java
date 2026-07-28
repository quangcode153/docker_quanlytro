package com.btl.server.security.oauth2;

import com.btl.server.entity.KhachHang;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.repository.KhachHangRepository;
import com.btl.server.repository.TaiKhoanRepository;
import com.btl.server.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Value("${oauth2.redirect.uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        String action = null;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("oauth2_action".equals(cookie.getName())) {
                    action = cookie.getValue();
                    break;
                }
            }
        }

        // Always clear the cookies on success
        jakarta.servlet.http.Cookie clearCookie = new jakarta.servlet.http.Cookie("oauth2_action", null);
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0);
        response.addCookie(clearCookie);

        jakarta.servlet.http.Cookie clearUserCookie = new jakarta.servlet.http.Cookie("oauth2_username", null);
        clearUserCookie.setPath("/");
        clearUserCookie.setMaxAge(0);
        response.addCookie(clearUserCookie);

        if ("link".equals(action)) {
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri.replace("/oauth2/redirect", "/dashboard"))
                    .queryParam("link", "success")
                    .build().toUriString();
            System.out.println("[SuccessHandler] Redirecting link success to: " + targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String rawEmail = oAuth2User.getAttribute("email");
        String email = rawEmail != null ? rawEmail.trim().toLowerCase() : null;

        System.out.println("[SuccessHandler] onAuthenticationSuccess triggered for email: " + email + ", action: " + action);

        if ("register".equals(action)) {
            String tempToken = java.util.UUID.randomUUID().toString();
            
            String provider = "GOOGLE";
            if (authentication instanceof OAuth2AuthenticationToken) {
                provider = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId().toUpperCase();
            }
            
            String nameVal = oAuth2User.getAttribute("name") != null ? oAuth2User.getAttribute("name").toString() : "";
            
            System.out.println("[SuccessHandler] Action is register. Setting up social registration data for email: " + email + ", socialToken: " + tempToken);

            java.util.Map<String, String> regData = new java.util.HashMap<>();
            regData.put("email", email);
            regData.put("name", nameVal);
            regData.put("provider", provider);
            
            com.btl.server.controller.TaiKhoanController.socialRegistrations.put(tempToken, regData);
            
            String frontendLoginUrl = redirectUri.replace("/oauth2/redirect", "/login");
            String targetUrl = UriComponentsBuilder.fromUriString(frontendLoginUrl)
                    .queryParam("mode", "register")
                    .queryParam("email", email)
                    .queryParam("name", nameVal)
                    .queryParam("socialToken", tempToken)
                    .build().toUriString();
            
            System.out.println("[SuccessHandler] Redirecting register to: " + targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        System.out.println("[SuccessHandler] Action is login. Attempting database lookup for email: " + email);
        Optional<KhachHang> khachHangOptional = khachHangRepository.findByEmail(email);
        TaiKhoan taiKhoan = null;
        if (khachHangOptional.isPresent()) {
            Long taiKhoanId = khachHangOptional.get().getId();
            taiKhoan = taiKhoanRepository.findById(taiKhoanId).orElse(null);
            System.out.println("[SuccessHandler] Found TaiKhoan by KhachHang ID. Present: " + (taiKhoan != null));
        }
        if (taiKhoan == null) {
            taiKhoan = taiKhoanRepository.findByUsername(email)
                    .orElseThrow(() -> new RuntimeException("User not found after social login"));
            System.out.println("[SuccessHandler] Found TaiKhoan by Username email. Present: true");
        }

        String token = jwtService.generateToken(taiKhoan.getUsername(), taiKhoan.getRole());
        System.out.println("[SuccessHandler] Generated JWT token for user: " + taiKhoan.getUsername());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();

        System.out.println("[SuccessHandler] Redirecting login to: " + targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
