package com.example.demo.controller;

import com.example.demo.dto.AiDoubtRequestDto;
import com.example.demo.dto.AiDoubtResponseDto;
import com.example.demo.service.AiDoubtAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ai/doubt-assistant")
public class AiDoubtController {

    private final AiDoubtAssistantService doubtService;

    @Autowired
    public AiDoubtController(AiDoubtAssistantService doubtService) {
        this.doubtService = doubtService;
    }

    @PostMapping
    public ResponseEntity<AiDoubtResponseDto> askDoubt(@RequestBody AiDoubtRequestDto request) {
        AiDoubtResponseDto response = doubtService.answerDoubt(request);
        return ResponseEntity.ok(response);
    }
}
