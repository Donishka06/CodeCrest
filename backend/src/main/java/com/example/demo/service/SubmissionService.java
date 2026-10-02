package com.example.demo.service;

import com.example.demo.dto.SubmissionRequestDto;
import com.example.demo.dto.SubmissionResponseDto;
import com.example.demo.entity.*;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private ChallengeSubmissionRepository submissionRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private ContestantProfileRepository profileRepository;

    @Autowired
    private ProgrammingContestRepository contestRepository;

    @Autowired
    private ContestRankingRepository rankingRepository;

    @Autowired(required = false)
    private SystemUserRepository userRepository;

    @Autowired
    private CodeExecutionService codeExecutionService;

    @Autowired
    private ChallengeService challengeService;

    public SubmissionResponseDto processSubmission(SubmissionRequestDto dto, String username) {
        CodingChallenge challenge = challengeRepository.findById(dto.getChallengeId())
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + dto.getChallengeId()));
        challengeService.enrichChallengeWithProblemSpecs(challenge);

        ContestantProfile profile = profileRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> profileRepository.findByUsername(username)
                .orElseGet(() -> {
                    SystemUser u = null;
                    if (userRepository != null) {
                        u = userRepository.findByUsernameIgnoreCase(username)
                                .orElseGet(() -> userRepository.findByUsername(username).orElse(null));
                    }
                    ContestantProfile cp = new ContestantProfile();
                    cp.setUser(u);
                    cp.setUsername(username);
                    cp.setTotalPoints(0);
                    cp.setAccountStatus("ACTIVE");
                    return profileRepository.save(cp);
                }));

        ProgrammingContest contest = null;
        if (dto.getContestId() != null) {
            contest = contestRepository.findById(dto.getContestId()).orElse(null);
            if (contest != null) {
                String cStatus = contest.getStatus();
                if ("EXPIRED".equalsIgnoreCase(cStatus) || "COMPLETED".equalsIgnoreCase(cStatus)) {
                    throw new BusinessValidationException("Contest has expired. Submissions are no longer accepted.");
                }
            }
        }

        boolean isTestRun = dto.getIsTestRun();
        String testCasesJson = isTestRun
                ? (challenge.getSampleTestCases() != null ? challenge.getSampleTestCases() : challenge.getHiddenTestCases())
                : (challenge.getHiddenTestCases() != null ? challenge.getHiddenTestCases() : challenge.getSampleTestCases());

        CodeExecutionService.ExecutionResult execResult = codeExecutionService.evaluate(
                dto.getSourceCode(),
                dto.getLanguage(),
                testCasesJson,
                challenge.getTimeLimitMs(),
                isTestRun
        );

        String verdict = execResult.verdict != null ? execResult.verdict : "WRONG_ANSWER";
        boolean isCorrect = "ACCEPTED".equalsIgnoreCase(verdict);
        int execTime = execResult.executionTimeMs;

        int pointsEarned = 0;
        ChallengeSubmission submission = null;

        if (!isTestRun) {
            if (isCorrect) {
                int challengePoints = challenge.getBasePoints() != null ? challenge.getBasePoints() : 100;
                boolean alreadySolvedGlobal = submissionRepository.existsByContestantUsernameIgnoreCaseAndChallengeIdAndVerdict(username, challenge.getId(), "ACCEPTED")
                        || submissionRepository.existsByContestantUsernameAndChallengeIdAndVerdict(username, challenge.getId(), "ACCEPTED");
                if (!alreadySolvedGlobal) {
                    profile.setTotalPoints((profile.getTotalPoints() != null ? profile.getTotalPoints() : 0) + challengePoints);
                    profileRepository.save(profile);
                }

                if (contest != null) {
                    boolean alreadySolvedInContest = submissionRepository.existsByContestantUsernameIgnoreCaseAndChallengeIdAndContestIdAndVerdict(
                            username, challenge.getId(), contest.getId(), "ACCEPTED");
                    if (!alreadySolvedInContest) {
                        pointsEarned = challengePoints;
                        final ProgrammingContest finalContest = contest;
                        final int finalPoints = pointsEarned;
                        ContestRanking ranking = rankingRepository.findByContestIdAndContestantId(finalContest.getId(), profile.getId())
                                .orElseGet(() -> {
                                    ContestRanking r = new ContestRanking();
                                    r.setContest(finalContest);
                                    r.setContestant(profile);
                                    r.setCurrentScore(0);
                                    r.setPenaltyTime(0);
                                    r.setLocalRank(0);
                                    return r;
                                });

                        long minutesFromStart = 0;
                        if (finalContest.getStartTime() != null) {
                            minutesFromStart = Math.max(0, java.time.Duration.between(finalContest.getStartTime(), java.time.LocalDateTime.now()).toMinutes());
                        }
                        List<ChallengeSubmission> priorAttempts = submissionRepository.findByContestIdAndChallengeIdAndContestantUsernameIgnoreCase(
                                finalContest.getId(), challenge.getId(), username);
                        long wrongAttempts = priorAttempts.stream().filter(s -> !"ACCEPTED".equalsIgnoreCase(s.getVerdict())).count();
                        int penaltyIncrement = (int) minutesFromStart + ((int) wrongAttempts * 20);

                        ranking.setCurrentScore((ranking.getCurrentScore() != null ? ranking.getCurrentScore() : 0) + finalPoints);
                        ranking.setPenaltyTime((ranking.getPenaltyTime() != null ? ranking.getPenaltyTime() : 0) + penaltyIncrement);
                        rankingRepository.save(ranking);
                    }
                } else if (!alreadySolvedGlobal) {
                    pointsEarned = challengePoints;
                }
            }

            submission = new ChallengeSubmission();
            submission.setChallenge(challenge);
            submission.setContestant(profile);
            submission.setContest(contest);
            submission.setSourceCode(dto.getSourceCode());
            submission.setVerdict(verdict);
            submission.setExecutionTimeMs(execTime);
            submission.setMemoryUsage(execResult.memoryUsage);
            submission.setTimeComplexity(execResult.timeComplexity);
            submission.setSpaceComplexity(execResult.spaceComplexity);
            submission.setPointsEarned(pointsEarned);

            submissionRepository.save(submission);

            if (contest != null) {
                List<ContestRanking> allRankings = rankingRepository.findByContestIdOrderByCurrentScoreDescPenaltyTimeAsc(contest.getId());
                int rk = 1;
                for (ContestRanking cr : allRankings) {
                    cr.setLocalRank(rk++);
                }
                rankingRepository.saveAll(allRankings);
            }
        }

        SubmissionResponseDto resp = new SubmissionResponseDto(
                submission != null ? submission.getId() : null,
                verdict,
                pointsEarned,
                execTime,
                execResult.message != null ? execResult.message : (isCorrect ? "Solution accepted" : "Execution completed with failures")
        );
        resp.setMemoryUsage(execResult.memoryUsage);
        resp.setTimeComplexity(execResult.timeComplexity);
        resp.setSpaceComplexity(execResult.spaceComplexity);
        resp.setComplexityDetails(execResult.complexityDetails);
        resp.setTotalTestCases(execResult.totalTestCases);
        resp.setPassedTestCases(execResult.passedTestCases);
        resp.setErrorDetails(execResult.errorDetails);
        resp.setTestCaseResults(execResult.testCaseResults);

        return resp;
    }

    public Page<ChallengeSubmission> getAllSubmissions(Pageable pageable) {
        return submissionRepository.findAll(pageable);
    }

    public List<ChallengeSubmission> getSubmissionsByUsername(String username) {
        List<ChallengeSubmission> list = submissionRepository.findByContestantUsernameIgnoreCase(username);
        if (list.isEmpty()) {
            list = submissionRepository.findByContestantUsername(username);
        }
        return list;
    }

    public List<Long> getSolvedChallengeIdsByUsername(String username) {
        List<ChallengeSubmission> list = submissionRepository.findByContestantUsernameIgnoreCaseAndVerdict(username, "ACCEPTED");
        if (list.isEmpty()) {
            list = submissionRepository.findByContestantUsernameAndVerdict(username, "ACCEPTED");
        }
        return list.stream()
                .map(s -> s.getChallenge() != null ? s.getChallenge().getId() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public void deleteSubmission(Long id) {
        if (!submissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Submission not found with id: " + id);
        }
        submissionRepository.deleteById(id);
    }
}
