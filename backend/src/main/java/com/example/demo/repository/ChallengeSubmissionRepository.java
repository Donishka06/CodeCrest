package com.example.demo.repository;

import com.example.demo.entity.ChallengeSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {
    List<ChallengeSubmission> findByContestantUsername(String username);
    List<ChallengeSubmission> findByContestantUsernameIgnoreCase(String username);
    List<ChallengeSubmission> findByContestantUsernameAndVerdict(String username, String verdict);
    List<ChallengeSubmission> findByContestantUsernameIgnoreCaseAndVerdict(String username, String verdict);
    boolean existsByContestantUsernameAndChallengeIdAndVerdict(String username, Long challengeId, String verdict);
    boolean existsByContestantUsernameIgnoreCaseAndChallengeIdAndVerdict(String username, Long challengeId, String verdict);
    boolean existsByContestantUsernameIgnoreCaseAndChallengeIdAndContestIdAndVerdict(String username, Long challengeId, Long contestId, String verdict);
    List<ChallengeSubmission> findByContestId(Long contestId);
    List<ChallengeSubmission> findByContestIdAndContestantUsernameIgnoreCase(Long contestId, String username);
    List<ChallengeSubmission> findByContestIdAndChallengeIdAndContestantUsernameIgnoreCase(Long contestId, Long challengeId, String username);
    List<ChallengeSubmission> findByChallengeId(Long challengeId);
    Page<ChallengeSubmission> findAll(Pageable pageable);
}
