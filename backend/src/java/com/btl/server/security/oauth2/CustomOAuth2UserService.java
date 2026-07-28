package com.btl.server.security.oauth2;

import com.btl.server.entity.KhachHang;
import com.btl.server.entity.TaiKhoan;
import com.btl.server.enums.AuthProvider;
import com.btl.server.repository.KhachHangRepository;
import com.btl.server.repository.TaiKhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private HttpServletRequest request;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        
        return processOAuth2User(registrationId, oAuth2User);
    }

    private OAuth2User processOAuth2User(String registrationId, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String rawEmail = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
        if (rawEmail == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        String email = rawEmail.trim().toLowerCase();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        
        Optional<TaiKhoan> taiKhoanOptional = Optional.empty();
        Optional<KhachHang> khachHangOptional = khachHangRepository.findByEmail(email);
        
        System.out.println("[OAuth2] Checking email: " + email);
        System.out.println("[OAuth2] khachHangOptional.isPresent(): " + khachHangOptional.isPresent());
        
        if (khachHangOptional.isPresent()) {
            taiKhoanOptional = Optional.ofNullable(khachHangOptional.get().getTaiKhoan());
            System.out.println("[OAuth2] taiKhoanOptional (from KhachHang).isPresent(): " + taiKhoanOptional.isPresent());
        } else {
            taiKhoanOptional = taiKhoanRepository.findByUsername(email);
            System.out.println("[OAuth2] taiKhoanOptional (from username find).isPresent(): " + taiKhoanOptional.isPresent());
        }
        
        // Check if the user initiated a registration or link flow
        String action = null;
        String linkUsername = null;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("oauth2_action".equals(cookie.getName())) {
                    action = cookie.getValue();
                } else if ("oauth2_username".equals(cookie.getName())) {
                    linkUsername = cookie.getValue();
                }
            }
        }
        
        System.out.println("[OAuth2] Action Cookie value: " + action + ", linkUsername: " + linkUsername);

        TaiKhoan taiKhoan;
        if ("link".equals(action)) {
            System.out.println("[OAuth2] Action is link. linkUsername: " + linkUsername);
            if (linkUsername == null) {
                throw new OAuth2AuthenticationException("unauthorized_link_request");
            }
            
            // Check if the email is already used by someone else
            Optional<KhachHang> existingEmailOwner = khachHangRepository.findByEmail(email);
            if (existingEmailOwner.isPresent()) {
                TaiKhoan ownerAccount = existingEmailOwner.get().getTaiKhoan();
                if (ownerAccount != null && !ownerAccount.getUsername().equals(linkUsername)) {
                    throw new OAuth2AuthenticationException("email_already_linked");
                }
            }
            
            // Link to the current logged-in user
            Optional<TaiKhoan> currentAccountOpt = taiKhoanRepository.findByUsername(linkUsername);
            if (currentAccountOpt.isEmpty()) {
                throw new OAuth2AuthenticationException("user_not_found");
            }
            
            taiKhoan = currentAccountOpt.get();
            taiKhoan.setProvider(provider);
            taiKhoanRepository.save(taiKhoan);
            
            KhachHang khachHang = taiKhoan.getKhachHang();
            if (khachHang == null) {
                khachHang = new KhachHang();
                khachHang.setTaiKhoan(taiKhoan);
            }
            khachHang.setEmail(email);
            khachHang.setHoTen(name != null ? name : khachHang.getHoTen());
            khachHangRepository.save(khachHang);
        } else {
            if (taiKhoanOptional.isPresent()) {
                System.out.println("[OAuth2] User exists in database. action: " + action);
                if ("register".equals(action)) {
                    System.out.println("[OAuth2] Throwing email_already_registered exception");
                    throw new OAuth2AuthenticationException("email_already_registered");
                }
                taiKhoan = taiKhoanOptional.get();
                AuthProvider existingProvider = taiKhoan.getProvider() != null ? taiKhoan.getProvider() : AuthProvider.LOCAL;
                if (!existingProvider.equals(provider)) {
                    taiKhoan.setProvider(provider);
                    taiKhoanRepository.save(taiKhoan);
                }
                updateExistingUser(taiKhoan, name);
            } else {
                System.out.println("[OAuth2] User does NOT exist in database. action: " + action);
                if ("register".equals(action)) {
                    System.out.println("[OAuth2] User does not exist, and action is register. Preparing dummy TaiKhoan");
                    taiKhoan = new TaiKhoan();
                    taiKhoan.setUsername(email);
                    taiKhoan.setRole("USER");
                } else {
                    System.out.println("[OAuth2] User does not exist, and action is login. Registering new social user automatically");
                    taiKhoan = registerNewUser(email, name, provider);
                }
            }
        }

        return oAuth2User;
    }

    private TaiKhoan registerNewUser(String email, String name, AuthProvider provider) {
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setUsername(email);
        taiKhoan.setRole("USER");
        taiKhoan.setProvider(provider);
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        KhachHang khachHang = new KhachHang();
        khachHang.setTaiKhoan(taiKhoan);
        khachHang.setHoTen(name);
        khachHang.setEmail(email);
        khachHangRepository.save(khachHang);

        return taiKhoan;
    }

    private void updateExistingUser(TaiKhoan taiKhoan, String name) {
        KhachHang khachHang = taiKhoan.getKhachHang();
        if (khachHang != null) {
            khachHang.setHoTen(name);
            khachHangRepository.save(khachHang);
        }
    }
}
