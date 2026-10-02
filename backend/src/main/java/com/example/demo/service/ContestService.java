package com.example.demo.service;

import com.example.demo.entity.ChallengeSubmission;
import com.example.demo.entity.CodingChallenge;
import com.example.demo.entity.ContestRanking;
import com.example.demo.entity.ContestantProfile;
import com.example.demo.entity.ProgrammingContest;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ChallengeSubmissionRepository;
import com.example.demo.repository.CodingChallengeRepository;
import com.example.demo.repository.ContestRankingRepository;
import com.example.demo.repository.ContestantProfileRepository;
import com.example.demo.repository.ProgrammingContestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContestService {

    @Autowired
    private ProgrammingContestRepository contestRepository;

    @Autowired
    private ContestantProfileRepository profileRepository;

    @Autowired
    private ContestRankingRepository rankingRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private ChallengeSubmissionRepository submissionRepository;

    private void populateEnrolledDetails(ProgrammingContest contest) {
        if (contest == null) return;
        String calculated = contest.calculateStatus();
        if (!calculated.equalsIgnoreCase(contest.getStatus())) {
            contest.setStatus(calculated);
            contestRepository.save(contest);
        }
        List<ContestRanking> rankings = rankingRepository.findByContestId(contest.getId());
        List<String> participants = rankings.stream()
                .map(r -> r.getContestant().getUsername())
                .collect(Collectors.toList());
        contest.setEnrolledParticipants(participants);
        contest.setEnrolledCount(participants.size());
    }

    public List<ProgrammingContest> getAllContests() {
        List<ProgrammingContest> list = contestRepository.findAll();
        for (ProgrammingContest c : list) {
            populateEnrolledDetails(c);
        }
        return list;
    }

    public Page<ProgrammingContest> getAllContests(Pageable pageable) {
        Page<ProgrammingContest> page = contestRepository.findAll(pageable);
        for (ProgrammingContest c : page.getContent()) {
            populateEnrolledDetails(c);
        }
        return page;
    }

    public ProgrammingContest getContestById(Long id) {
        ProgrammingContest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
        populateEnrolledDetails(contest);
        return contest;
    }

    public void createContest(ProgrammingContest contest) {
        if (contest.getStartTime() == null) {
            contest.setStartTime(java.time.LocalDateTime.now());
        }
        if (contest.getEndTime() == null) {
            contest.setEndTime(java.time.LocalDateTime.now().plusDays(7));
        }
        contest.setStatus(contest.calculateStatus());
        if (contest.getCapacity() == null || contest.getCapacity() <= 0) {
            contest.setCapacity(100);
        }
        contestRepository.save(contest);
    }

    public void updateContest(Long id, ProgrammingContest details) {
        ProgrammingContest contest = getContestById(id);
        contest.setTitle(details.getTitle());
        contest.setStartTime(details.getStartTime());
        contest.setEndTime(details.getEndTime());
        contest.setCapacity(details.getCapacity());
        contest.setStatus(contest.calculateStatus());
        contestRepository.save(contest);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteContest(Long id) {
        if (!contestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contest not found with id: " + id);
        }

        // 1. Unlink challenge submissions associated with this contest
        List<ChallengeSubmission> submissions = submissionRepository.findByContestId(id);
        if (submissions != null && !submissions.isEmpty()) {
            for (ChallengeSubmission s : submissions) {
                s.setContest(null);
            }
            submissionRepository.saveAll(submissions);
        }

        // 2. Unlink coding challenges associated with this contest
        List<CodingChallenge> challenges = challengeRepository.findByContestId(id);
        if (challenges != null && !challenges.isEmpty()) {
            for (CodingChallenge c : challenges) {
                c.setContest(null);
            }
            challengeRepository.saveAll(challenges);
        }

        // 3. Delete rankings associated with this contest
        List<ContestRanking> rankings = rankingRepository.findByContestId(id);
        if (rankings != null && !rankings.isEmpty()) {
            rankingRepository.deleteAll(rankings);
        }

        // 4. Delete the contest itself
        contestRepository.deleteById(id);
    }

    public void enrollParticipant(Long contestId, String username) {
        ProgrammingContest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + contestId));

        String status = contest.getStatus();
        if ("EXPIRED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            throw new BusinessValidationException("Cannot enroll in an expired contest");
        }

        long currentCount = rankingRepository.countByContestId(contestId);
        if (contest.getCapacity() != null && currentCount >= contest.getCapacity()) {
            throw new BusinessValidationException("Contest capacity limit reached");
        }

        ContestantProfile profile = profileRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username)));

        if (rankingRepository.findByContestIdAndContestantId(contest.getId(), profile.getId()).isPresent()) {
            throw new BusinessValidationException("Already enrolled in this contest");
        }

        ContestRanking ranking = new ContestRanking();
        ranking.setContest(contest);
        ranking.setContestant(profile);
        ranking.setCurrentScore(0);
        ranking.setPenaltyTime(0);
        ranking.setLocalRank(0);

        rankingRepository.save(ranking);
    }

    @org.springframework.transaction.annotation.Transactional
    public void unenrollParticipant(Long contestId, String username) {
        ProgrammingContest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + contestId));

        String status = contest.getStatus();
        if ("EXPIRED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            throw new BusinessValidationException("Cannot unenroll from an expired contest");
        }

        ContestantProfile profile = profileRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username)));

        ContestRanking ranking = rankingRepository.findByContestIdAndContestantId(contest.getId(), profile.getId())
                .orElseThrow(() -> new BusinessValidationException("Not enrolled in this contest"));

        rankingRepository.delete(ranking);
    }

    public java.util.Map<String, Object> getMyContestScore(Long contestId, String username) {
        ContestantProfile profile = profileRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> profileRepository.findByUsername(username).orElse(null));
        if (profile == null) {
            return java.util.Map.of("score", 0, "rank", 0);
        }
        ContestRanking ranking = rankingRepository.findByContestIdAndContestantId(contestId, profile.getId()).orElse(null);
        int score = ranking != null && ranking.getCurrentScore() != null ? ranking.getCurrentScore() : 0;
        int rank = ranking != null && ranking.getLocalRank() != null ? ranking.getLocalRank() : 1;
        return java.util.Map.of("score", score, "rank", rank);
    }

    public List<com.example.demo.dto.RankingResponseDto> getEnrolledParticipants(Long contestId) {
        List<ContestRanking> rankings = rankingRepository.findByContestId(contestId);
        List<com.example.demo.dto.RankingResponseDto> dtos = new java.util.ArrayList<>();
        int rank = 1;
        for (ContestRanking r : rankings) {
            dtos.add(new com.example.demo.dto.RankingResponseDto(rank++, r.getContestant().getUsername(), r.getCurrentScore()));
        }
        return dtos;
    }

    public com.example.demo.dto.ContestAnalyticsDto getContestAnalytics(Long contestId) {
        ProgrammingContest contest = getContestById(contestId);
        List<ContestRanking> rankings = rankingRepository.findByContestId(contestId);
        List<CodingChallenge> challenges = challengeRepository.findByContestId(contestId);
        List<ChallengeSubmission> submissions = submissionRepository.findByContestId(contestId);

        com.example.demo.dto.ContestAnalyticsDto dto = new com.example.demo.dto.ContestAnalyticsDto();
        dto.setContestId(contest.getId());
        dto.setTitle(contest.getTitle());
        dto.setStatus(contest.getStatus());
        dto.setStartTime(contest.getStartTime() != null ? contest.getStartTime().toString() : "");
        dto.setEndTime(contest.getEndTime() != null ? contest.getEndTime().toString() : "");
        dto.setTotalParticipants(rankings.size());
        dto.setTotalSubmissions(submissions.size());

        long acceptedCount = submissions.stream()
                .filter(s -> "ACCEPTED".equalsIgnoreCase(s.getVerdict()))
                .count();
        dto.setAcceptedSubmissions((int) acceptedCount);
        double accRate = submissions.isEmpty() ? 0.0 : ((double) acceptedCount / submissions.size()) * 100.0;
        dto.setAcceptanceRate(Math.round(accRate * 10.0) / 10.0);

        double avgScore = rankings.isEmpty() ? 0.0 : rankings.stream()
                .mapToInt(r -> r.getCurrentScore() != null ? r.getCurrentScore() : 0)
                .average()
                .orElse(0.0);
        dto.setAverageScore(Math.round(avgScore * 10.0) / 10.0);

        int maxScore = rankings.stream()
                .mapToInt(r -> r.getCurrentScore() != null ? r.getCurrentScore() : 0)
                .max()
                .orElse(0);
        dto.setHighestScore(maxScore);

        java.util.Map<String, Integer> diffMap = new java.util.HashMap<>();
        diffMap.put("EASY", 0);
        diffMap.put("MEDIUM", 0);
        diffMap.put("HARD", 0);
        for (CodingChallenge c : challenges) {
            String diff = c.getDifficulty() != null ? c.getDifficulty().toUpperCase() : "MEDIUM";
            diffMap.put(diff, diffMap.getOrDefault(diff, 0) + 1);
        }
        dto.setDifficultyDistribution(diffMap);

        List<com.example.demo.dto.ContestAnalyticsDto.ProblemStatDto> problemStats = new java.util.ArrayList<>();
        for (CodingChallenge c : challenges) {
            com.example.demo.dto.ContestAnalyticsDto.ProblemStatDto ps = new com.example.demo.dto.ContestAnalyticsDto.ProblemStatDto();
            ps.setChallengeId(c.getId());
            ps.setTitle(c.getTitle());
            ps.setDifficulty(c.getDifficulty() != null ? c.getDifficulty() : "MEDIUM");
            ps.setBasePoints(c.getBasePoints() != null ? c.getBasePoints() : 100);

            List<ChallengeSubmission> cSubs = submissions.stream()
                    .filter(s -> s.getChallenge() != null && c.getId().equals(s.getChallenge().getId()))
                    .collect(Collectors.toList());
            ps.setTotalSubmissions(cSubs.size());

            long cAccepted = cSubs.stream()
                    .filter(s -> "ACCEPTED".equalsIgnoreCase(s.getVerdict()))
                    .count();
            ps.setAcceptedSubmissions((int) cAccepted);

            long uniqueSolvers = cSubs.stream()
                    .filter(s -> "ACCEPTED".equalsIgnoreCase(s.getVerdict()))
                    .map(s -> s.getContestant() != null ? s.getContestant().getUsername() : null)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .count();
            ps.setSolversCount((int) uniqueSolvers);

            double solveRate = cSubs.isEmpty() ? 0.0 : ((double) cAccepted / cSubs.size()) * 100.0;
            ps.setSolveRate(Math.round(solveRate * 10.0) / 10.0);

            problemStats.add(ps);
        }
        dto.setProblemStats(problemStats);

        return dto;
    }
}
