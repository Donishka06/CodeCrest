package com.example.demo.controller;

import com.example.demo.dto.ChallengeCreationDto;
import com.example.demo.dto.SubmissionRequestDto;
import com.example.demo.dto.SubmissionResponseDto;
import com.example.demo.entity.CodingChallenge;
import com.example.demo.service.ChallengeService;
import com.example.demo.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final SubmissionService submissionService;

    @Autowired
    public ChallengeController(ChallengeService challengeService, SubmissionService submissionService) {
        this.challengeService = challengeService;
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<Page<CodingChallenge>> getAll(Pageable pageable) {
        return ResponseEntity.ok(challengeService.getAllChallenges(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CodingChallenge> getById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody ChallengeCreationDto dto, Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        challengeService.createChallenge(dto, username);
        return ResponseEntity.ok("Challenge created");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody ChallengeCreationDto dto) {
        challengeService.updateChallenge(id, dto);
        return ResponseEntity.ok("Item updated via PUT");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.ok("Challenge deleted");
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResponseDto> submit(@PathVariable Long id, @RequestBody SubmissionRequestDto dto, Principal principal) {
        String username = principal != null && principal.getName() != null && !principal.getName().isEmpty()
                ? principal.getName()
                : (dto.getUsername() != null && !dto.getUsername().trim().isEmpty() ? dto.getUsername().trim() : "contestant");
        dto.setChallengeId(id);
        SubmissionResponseDto resp = submissionService.processSubmission(dto, username);
        return ResponseEntity.ok(resp);
    }
}
