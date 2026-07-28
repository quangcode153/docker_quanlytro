package com.btl.server.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.btl.server.entity.TaiKhoan;
import com.btl.server.repository.TaiKhoanRepository; 

import java.io.IOException;
import java.util.Optional;

import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService;

    @Autowired
    @Lazy
    private UserDetailsService userDetailsService;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository; 

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        if (requestPath.contains("/tai-khoan/login") || requestPath.contains("/tai-khoan/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                Optional<TaiKhoan> userOpt = taiKhoanRepository.findByUsername(username);
                
                if (userOpt.isPresent() && userOpt.get().isLocked()) {
                    logger.warn("⚠️ Chặn truy cập: Tài khoản '{}' đang bị khóa!", username);
                    
                    SecurityContextHolder.clearContext();
                    
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\": \"Tài khoản của bạn đã bị khóa, phiên đăng nhập bị hủy!\"}");
                    
                                        response.getWriter().flush();
                    return; 
                }

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (ExpiredJwtException e) {
            logger.warn("⚠️ Token hết hạn khi truy cập: {}", requestPath);
            SecurityContextHolder.clearContext();

        } catch (UsernameNotFoundException e) {
            logger.warn("⚠️ Tài khoản trong token không tồn tại trong hệ thống: {}", e.getMessage());
            SecurityContextHolder.clearContext();

        } catch (Exception e) {
            logger.error("⚠️ JWT lỗi định dạng hoặc chữ ký: ", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}