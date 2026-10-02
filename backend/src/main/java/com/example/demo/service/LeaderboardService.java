package com.example.demo.service;

import com.example.demo.dto.RankingResponseDto;
import com.example.demo.entity.ContestRanking;
import com.example.demo.entity.ContestantProfile;
import com.example.demo.repository.ContestRankingRepository;
import com.example.demo.repository.ContestantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    @Autowired
    private ContestantProfileRepository profileRepository;

    @Autowired
    private ContestRankingRepository rankingRepository;

    @Autowired
    private com.example.demo.repository.ChallengeSubmissionRepository submissionRepository;

    @Autowired
    private com.example.demo.repository.ProgrammingContestRepository contestRepository;

    public Page<RankingResponseDto> getGlobalLeaderboard(Pageable pageable) {
        Page<ContestantProfile> profiles = profileRepository.findByUserRoleInOrderByTotalPointsDesc(List.of("ROLE_CONTESTANT", "CONTESTANT", "STUDENT"), pageable);
        List<RankingResponseDto> dtos = new ArrayList<>();

        int rankOffset = pageable.getPageNumber() * pageable.getPageSize() + 1;
        for (int i = 0; i < profiles.getContent().size(); i++) {
            ContestantProfile p = profiles.getContent().get(i);
            int solved = submissionRepository.findByContestantUsernameIgnoreCaseAndVerdict(p.getUsername(), "ACCEPTED")
                    .stream()
                    .map(s -> s.getChallenge() != null ? s.getChallenge().getId() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(java.util.stream.Collectors.toSet())
                    .size();
            dtos.add(new RankingResponseDto(rankOffset + i, p.getUsername(), p.getTotalPoints() != null ? p.getTotalPoints() : 0, solved));
        }

        return new PageImpl<>(dtos, pageable, profiles.getTotalElements());
    }

    public Page<RankingResponseDto> getContestLeaderboard(Long contestId, Pageable pageable) {
        if (contestRepository != null) {
            com.example.demo.entity.ProgrammingContest contest = contestRepository.findById(contestId).orElse(null);
            if (contest != null && "UPCOMING".equalsIgnoreCase(contest.getStatus())) {
                // For UPCOMING contests: Do not reveal the live leaderboard
                return new PageImpl<>(java.util.Collections.emptyList(), pageable, 0);
            }
        }

        Page<ContestRanking> rankings = rankingRepository.findByContestIdOrderByCurrentScoreDescPenaltyTimeAsc(contestId, pageable);
        List<RankingResponseDto> dtos = new ArrayList<>();

        int rankOffset = pageable.getPageNumber() * pageable.getPageSize() + 1;
        int currentRank = rankOffset;
        for (int i = 0; i < rankings.getContent().size(); i++) {
            ContestRanking r = rankings.getContent().get(i);
            String role = r.getContestant() != null && r.getContestant().getUser() != null ? r.getContestant().getUser().getRole() : "";
            if (role != null && (role.contains("ADMIN") || role.contains("SETTER"))) {
                continue;
            }
            List<com.example.demo.entity.ChallengeSubmission> contestSubs = submissionRepository.findByContestIdAndContestantUsernameIgnoreCase(contestId, r.getContestant().getUsername());
            int solved = (int) contestSubs.stream()
                    .filter(s -> "ACCEPTED".equalsIgnoreCase(s.getVerdict()))
                    .map(s -> s.getChallenge() != null ? s.getChallenge().getId() : null)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .count();
            int totalAttempts = contestSubs.size();
            int penalty = r.getPenaltyTime() != null ? r.getPenaltyTime() : 0;
            String timeStr = penalty > 0 ? String.format("%02d:%02d", penalty / 60, penalty % 60) : "--:--";
            int rankVal = (r.getLocalRank() != null && r.getLocalRank() > 0) ? r.getLocalRank() : currentRank++;

            RankingResponseDto dto = new RankingResponseDto(rankVal, r.getContestant().getUsername(), r.getCurrentScore() != null ? r.getCurrentScore() : 0, solved, penalty, timeStr);
            dto.setTotalAttempts(totalAttempts);
            dtos.add(dto);
        }

        return new PageImpl<>(dtos, pageable, rankings.getTotalElements());
    }
}
