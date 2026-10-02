package com.example.demo.repository;

import com.example.demo.entity.ContestRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContestRankingRepository extends JpaRepository<ContestRanking, Long> {
    Optional<ContestRanking> findByContestIdAndContestantId(Long contestId, Long contestantId);
    Page<ContestRanking> findByContestIdOrderByCurrentScoreDescPenaltyTimeAsc(Long contestId, Pageable pageable);
    java.util.List<ContestRanking> findByContestIdOrderByCurrentScoreDescPenaltyTimeAsc(Long contestId);
    java.util.List<ContestRanking> findByContestId(Long contestId);
    long countByContestId(Long contestId);
}
