package com.btl.server.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> xuLyLoiNhapLieu(MethodArgumentNotValidException ex) {
        Map<String, String> danhSachLoi = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String tenTruongBiSai = ((FieldError) error).getField();
            String tinNhanBaoLoi = error.getDefaultMessage();
            danhSachLoi.put(tenTruongBiSai, tinNhanBaoLoi);
        });
        return danhSachLoi;
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public Map<String, String> xuLyLoiTrungLapDuLieu(DataIntegrityViolationException ex) {
        Map<String, String> loi = new HashMap<>();
        loi.put("message", "Dữ liệu không hợp lệ hoặc đã tồn tại trong hệ thống (CCCD/SĐT/Email).");
        return loi;
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }
}