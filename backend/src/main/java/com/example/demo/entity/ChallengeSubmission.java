package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_submissions")
public class ChallengeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    private String verdict;

    private Integer executionTimeMs;

    private String memoryUsage;

    private String timeComplexity;

    private String spaceComplexity;

    private Integer pointsEarned;

    @ManyToOne
    @JoinColumn(name = "contestant_id")
    private ContestantProfile contestant;

    @ManyToOne
    @JoinColumn(name = "challenge_id")
    private CodingChallenge challenge;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private ProgrammingContest contest;

    private LocalDateTime submittedAt;

    public ChallengeSubmission() {
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public Integer getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(String memoryUsage) { this.memoryUsage = memoryUsage; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }

    public ContestantProfile getContestant() { return contestant; }
    public void setContestant(ContestantProfile contestant) { this.contestant = contestant; }

    public CodingChallenge getChallenge() { return challenge; }
    public void setChallenge(CodingChallenge challenge) { this.challenge = challenge; }

    public ProgrammingContest getContest() { return contest; }
    public void setContest(ProgrammingContest contest) { this.contest = contest; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
