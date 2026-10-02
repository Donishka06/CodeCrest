package com.example.demo.controller;

import com.example.demo.entity.ChallengeSubmission;
import com.example.demo.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    @Autowired
    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<Page<ChallengeSubmission>> getAll(Pageable pageable) {
        return ResponseEntity.ok(submissionService.getAllSubmissions(pageable));
    }

    @PostMapping
    public ResponseEntity<com.example.demo.dto.SubmissionResponseDto> submit(@RequestBody com.example.demo.dto.SubmissionRequestDto dto, Principal principal) {
        String username = principal != null && principal.getName() != null && !principal.getName().isEmpty()
                ? principal.getName()
                : (dto.getUsername() != null && !dto.getUsername().trim().isEmpty() ? dto.getUsername().trim() : "contestant");
        com.example.demo.dto.SubmissionResponseDto resp = submissionService.processSubmission(dto, username);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChallengeSubmission>> getMy(Principal principal) {
        String username = principal != null ? principal.getName() : "contestant";
        return ResponseEntity.ok(submissionService.getSubmissionsByUsername(username));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ChallengeSubmission>> getMe(Principal principal) {
        return getMy(principal);
    }

    @GetMapping("/my-solved-ids")
    public ResponseEntity<List<Long>> getMySolvedIds(Principal principal) {
        String username = principal != null ? principal.getName() : "contestant";
        return ResponseEntity.ok(submissionService.getSolvedChallengeIdsByUsername(username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok("Submission deleted");
    }
}
