package com.btl.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import com.btl.server.dto.ThongKeDTO;
import com.btl.server.service.ThongKeService;

@RestController
@RequestMapping("/api/thong-ke")
public class ThongKeController {

    private final ThongKeService thongKeService;

    public ThongKeController(ThongKeService thongKeService) {
        this.thongKeService = thongKeService;
    }

    @GetMapping("/chu-tro/{id}")
    public ResponseEntity<ThongKeDTO> getThongKeChuTro(@PathVariable Long id) {
        ThongKeDTO thongKe = thongKeService.layThongKeChuTro(id);
        return ResponseEntity.ok(thongKe);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getThongKeAdmin() {
        return ResponseEntity.ok(thongKeService.layThongKeAdmin());
    }
}
