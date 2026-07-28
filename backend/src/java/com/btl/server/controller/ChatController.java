package com.btl.server.controller;

import com.btl.server.entity.TinNhan;
import com.btl.server.repository.TinNhanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TinNhanRepository tinNhanRepository;

    @GetMapping("/api/tin-nhan/{user1}/{user2}")
    public List<TinNhan> layLichSuChat(@PathVariable Long user1, @PathVariable Long user2) {
        return tinNhanRepository.timLichSuChat(user1, user2);
    }

    @MessageMapping("/chat.send")
    public void xuLyTinNhan(TinNhan tinNhan) {
        tinNhan.setThoiGian(LocalDateTime.now());
        tinNhanRepository.save(tinNhan);

        messagingTemplate.convertAndSend("/topic/chat/" + tinNhan.getNguoiNhanId(), tinNhan);
        messagingTemplate.convertAndSend("/topic/chat/" + tinNhan.getNguoiGuiId(), tinNhan);
    }
}