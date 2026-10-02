package com.example.demo.controller;

import com.example.demo.dto.RankingResponseDto;
import com.example.demo.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/global")
    public ResponseEntity<Page<RankingResponseDto>> getGlobal(Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(pageable));
    }

    @GetMapping("/contest/{contestId}")
    public ResponseEntity<Page<RankingResponseDto>> getContestLeaderboard(@PathVariable Long contestId, Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.getContestLeaderboard(contestId, pageable));
    }
}
