package com.btl.server.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.web.util.UriComponentsBuilder;

import com.btl.server.repository.TaiKhoanRepository;

import com.btl.server.security.oauth2.CustomOAuth2UserService;
import com.btl.server.security.oauth2.OAuth2AuthenticationSuccessHandler;
import java.util.Arrays;
import java.io.IOException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Value("${oauth2.redirect.uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/tai-khoan/**", "/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/hop-dong/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/phong-tro/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/phong-tro/**").hasAnyRole("ADMIN", "LANDLORD")
                .requestMatchers(HttpMethod.PUT, "/api/phong-tro/**").hasAnyRole("ADMIN", "LANDLORD")
                .requestMatchers(HttpMethod.DELETE, "/api/phong-tro/**").hasAnyRole("ADMIN", "LANDLORD")
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/tin-nhan/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED))
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler((req, res, exception) -> {
                    String action = null;
                    jakarta.servlet.http.Cookie[] cookies = req.getCookies();
                    if (cookies != null) {
                        for (jakarta.servlet.http.Cookie cookie : cookies) {
                            if ("oauth2_action".equals(cookie.getName())) {
                                action = cookie.getValue();
                                break;
                            }
                        }
                    }

                    jakarta.servlet.http.Cookie clearCookie = new jakarta.servlet.http.Cookie("oauth2_action", null);
                    clearCookie.setPath("/");
                    clearCookie.setMaxAge(0);
                    res.addCookie(clearCookie);

                    jakarta.servlet.http.Cookie clearUserCookie = new jakarta.servlet.http.Cookie("oauth2_username", null);
                    clearUserCookie.setPath("/");
                    clearUserCookie.setMaxAge(0);
                    res.addCookie(clearUserCookie);

                    String errorMsg = exception.getMessage();
                    if ("link".equals(action)) {
                        String redirectUrl = UriComponentsBuilder.fromUriString(redirectUri.replace("/oauth2/redirect", "/dashboard"))
                            .queryParam("link", "error")
                            .queryParam("error", errorMsg)
                            .build().toUriString();
                        res.sendRedirect(redirectUrl);
                    } else {
                        String frontendLoginUrl = redirectUri.replace("/oauth2/redirect", "/login");
                        String redirectUrl = UriComponentsBuilder.fromUriString(frontendLoginUrl)
                            .queryParam("error", errorMsg)
                            .build().toUriString();
                        res.sendRedirect(redirectUrl);
                    }
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}