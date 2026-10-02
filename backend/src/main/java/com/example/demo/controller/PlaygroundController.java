package com.example.demo.controller;

import com.example.demo.dto.PlaygroundRequestDto;
import com.example.demo.dto.PlaygroundResponseDto;
import com.example.demo.service.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/playground")
public class PlaygroundController {

    private final CodeExecutionService codeExecutionService;

    @Autowired
    public PlaygroundController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/run")
    public ResponseEntity<PlaygroundResponseDto> runCode(@RequestBody PlaygroundRequestDto dto) {
        PlaygroundResponseDto response = codeExecutionService.executePlayground(
                dto.getSourceCode(),
                dto.getLanguage(),
                dto.getCustomInput(),
                dto.getTimeLimitMs()
        );
        return ResponseEntity.ok(response);
    }
}
