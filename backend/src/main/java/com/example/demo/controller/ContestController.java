package com.example.demo.controller;

import com.example.demo.entity.ProgrammingContest;
import com.example.demo.service.ContestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestService contestService;

    @Autowired
    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @GetMapping
    public ResponseEntity<Page<ProgrammingContest>> getAllContests(Pageable pageable) {
        return ResponseEntity.ok(contestService.getAllContests(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgrammingContest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody ProgrammingContest contest) {
        contestService.createContest(contest);
        return ResponseEntity.ok("Contest created");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody ProgrammingContest details) {
        contestService.updateContest(id, details);
        return ResponseEntity.ok("Contest updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        contestService.deleteContest(id);
        return ResponseEntity.ok("Contest deleted");
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<String> enroll(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            Principal principal) {
        String user = (username != null && !username.trim().isEmpty())
                ? username.trim()
                : (principal != null ? principal.getName() : "contestant");
        contestService.enrollParticipant(id, user);
        return ResponseEntity.ok("Enrolled successfully!");
    }

    @PostMapping("/{id}/unenroll")
    public ResponseEntity<String> unenroll(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            Principal principal) {
        String user = (username != null && !username.trim().isEmpty())
                ? username.trim()
                : (principal != null ? principal.getName() : "contestant");
        contestService.unenrollParticipant(id, user);
        return ResponseEntity.ok("Unenrolled successfully!");
    }

    @DeleteMapping("/{id}/enroll")
    public ResponseEntity<String> unenrollViaDelete(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            Principal principal) {
        return unenroll(id, username, principal);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getEnrolledParticipants(id));
    }

    @GetMapping("/{id}/my-score")
    public ResponseEntity<?> getMyScore(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            Principal principal) {
        String user = (username != null && !username.trim().isEmpty())
                ? username.trim()
                : (principal != null ? principal.getName() : "contestant");
        return ResponseEntity.ok(contestService.getMyContestScore(id, user));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getContestAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getContestAnalytics(id));
    }
}
