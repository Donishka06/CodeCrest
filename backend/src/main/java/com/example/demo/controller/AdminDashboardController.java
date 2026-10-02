package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final SystemUserRepository userRepository;
    private final ProgrammingContestRepository contestRepository;
    private final CodingChallengeRepository challengeRepository;
    private final ChallengeSubmissionRepository submissionRepository;

    @Autowired
    public AdminDashboardController(
            SystemUserRepository userRepository,
            ProgrammingContestRepository contestRepository,
            CodingChallengeRepository challengeRepository,
            ChallengeSubmissionRepository submissionRepository
    ) {
        this.userRepository = userRepository;
        this.contestRepository = contestRepository;
        this.challengeRepository = challengeRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAdminOverview() {
        Map<String, Object> data = new HashMap<>();

        // Users Metrics
        List<SystemUser> users = userRepository.findAll();
        long totalUsers = users.size();
        long adminsCount = 0;
        long settersCount = 0;
        long studentsCount = 0;

        for (SystemUser u : users) {
            String role = u.getRole() != null ? u.getRole().toUpperCase() : "";
            if (role.contains("ADMIN")) {
                adminsCount++;
            } else if (role.contains("SETTER")) {
                settersCount++;
            } else {
                studentsCount++;
            }
        }

        data.put("totalUsers", totalUsers);
        data.put("adminsCount", adminsCount);
        data.put("settersCount", settersCount);
        data.put("studentsCount", studentsCount);

        // Contests Metrics
        List<ProgrammingContest> contests = contestRepository.findAll();
        long totalContests = contests.size();
        long activeContests = 0;
        long upcomingContests = 0;
        long expiredContests = 0;

        LocalDateTime now = LocalDateTime.now();
        for (ProgrammingContest c : contests) {
            String s = c.getStatus() != null ? c.getStatus().toUpperCase() : "";
            if ("ACTIVE".equals(s)) {
                activeContests++;
            } else if ("UPCOMING".equals(s)) {
                upcomingContests++;
            } else if ("EXPIRED".equals(s) || "COMPLETED".equals(s)) {
                expiredContests++;
            } else {
                // If status wasn't calculated, check start and end dates
                if (c.getStartTime() != null && c.getEndTime() != null) {
                    if (now.isBefore(c.getStartTime())) {
                        upcomingContests++;
                    } else if (now.isAfter(c.getEndTime())) {
                        expiredContests++;
                    } else {
                        activeContests++;
                    }
                } else {
                    upcomingContests++;
                }
            }
        }

        data.put("totalContests", totalContests);
        data.put("activeContests", activeContests);
        data.put("upcomingContests", upcomingContests);
        data.put("expiredContests", expiredContests);

        // Challenges Metrics
        List<CodingChallenge> challenges = challengeRepository.findAll();
        long totalChallenges = challenges.size();
        long easyChallenges = 0;
        long mediumChallenges = 0;
        long hardChallenges = 0;

        for (CodingChallenge ch : challenges) {
            String diff = ch.getDifficulty() != null ? ch.getDifficulty().toUpperCase() : "EASY";
            if ("HARD".equals(diff)) {
                hardChallenges++;
            } else if ("MEDIUM".equals(diff)) {
                mediumChallenges++;
            } else {
                easyChallenges++;
            }
        }

        data.put("totalChallenges", totalChallenges);
        data.put("easyChallenges", easyChallenges);
        data.put("mediumChallenges", mediumChallenges);
        data.put("hardChallenges", hardChallenges);

        // Submissions count
        long totalSubmissions = submissionRepository.count();
        data.put("totalSubmissions", totalSubmissions);

        // Activity stream aggregation
        List<Map<String, Object>> activities = new ArrayList<>();

        // Add recent submissions
        try {
            var recentSubs = submissionRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id")));
            for (ChallengeSubmission sub : recentSubs.getContent()) {
                Map<String, Object> act = new HashMap<>();
                act.put("id", "sub-" + sub.getId());
                act.put("type", "SUBMISSION");
                act.put("title", "Solution submitted on " + (sub.getChallenge() != null ? sub.getChallenge().getTitle() : "Challenge"));
                act.put("description", "Verdict: " + sub.getVerdict() + " by " + (sub.getContestant() != null ? sub.getContestant().getUsername() : "contestant"));
                act.put("timestamp", sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : LocalDateTime.now().toString());
                act.put("badge", sub.getVerdict());
                activities.add(act);
            }
        } catch (Exception ignored) {}

        // Add recent contests
        for (int i = Math.max(0, contests.size() - 3); i < contests.size(); i++) {
            ProgrammingContest c = contests.get(i);
            Map<String, Object> act = new HashMap<>();
            act.put("id", "contest-" + c.getId());
            act.put("type", "CONTEST");
            act.put("title", "Contest '" + c.getTitle() + "' scheduled");
            act.put("description", "Status: " + c.getStatus());
            act.put("timestamp", c.getStartTime() != null ? c.getStartTime().toString() : LocalDateTime.now().toString());
            act.put("badge", c.getStatus());
            activities.add(act);
        }

        // Add recent challenges
        for (int i = Math.max(0, challenges.size() - 3); i < challenges.size(); i++) {
            CodingChallenge ch = challenges.get(i);
            Map<String, Object> act = new HashMap<>();
            act.put("id", "challenge-" + ch.getId());
            act.put("type", "CHALLENGE");
            act.put("title", "Challenge '" + ch.getTitle() + "' published");
            act.put("description", "Difficulty: " + ch.getDifficulty() + " (" + (ch.getBasePoints() != null ? ch.getBasePoints() : 100) + " pts)");
            act.put("timestamp", LocalDateTime.now().minusHours(i + 1).toString());
            act.put("badge", ch.getDifficulty());
            activities.add(act);
        }

        data.put("recentActivities", activities);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAdminUsers() {
        List<SystemUser> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (SystemUser u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            
            String role = u.getRole() != null ? u.getRole().toUpperCase() : "STUDENT";
            String displayRole = "STUDENT";
            if (role.contains("ADMIN")) {
                displayRole = "ADMIN";
            } else if (role.contains("SETTER")) {
                displayRole = "PROBLEM_SETTER";
            }
            map.put("role", displayRole);
            map.put("status", "ACTIVE");
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : LocalDateTime.now().toString());
            
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }
}
