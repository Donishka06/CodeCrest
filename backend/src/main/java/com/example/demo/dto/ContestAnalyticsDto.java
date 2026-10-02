package com.example.demo.dto;

import java.util.List;
import java.util.Map;

public class ContestAnalyticsDto {
    private Long contestId;
    private String title;
    private String status;
    private String startTime;
    private String endTime;
    private Integer totalParticipants = 0;
    private Integer totalSubmissions = 0;
    private Integer acceptedSubmissions = 0;
    private Double acceptanceRate = 0.0;
    private Double averageScore = 0.0;
    private Integer highestScore = 0;
    private Map<String, Integer> difficultyDistribution;
    private List<ProblemStatDto> problemStats;

    public ContestAnalyticsDto() {}

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }

    public Integer getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(Integer totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public Integer getAcceptedSubmissions() { return acceptedSubmissions; }
    public void setAcceptedSubmissions(Integer acceptedSubmissions) { this.acceptedSubmissions = acceptedSubmissions; }

    public Double getAcceptanceRate() { return acceptanceRate; }
    public void setAcceptanceRate(Double acceptanceRate) { this.acceptanceRate = acceptanceRate; }

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }

    public Integer getHighestScore() { return highestScore; }
    public void setHighestScore(Integer highestScore) { this.highestScore = highestScore; }

    public Map<String, Integer> getDifficultyDistribution() { return difficultyDistribution; }
    public void setDifficultyDistribution(Map<String, Integer> difficultyDistribution) { this.difficultyDistribution = difficultyDistribution; }

    public List<ProblemStatDto> getProblemStats() { return problemStats; }
    public void setProblemStats(List<ProblemStatDto> problemStats) { this.problemStats = problemStats; }

    public static class ProblemStatDto {
        private Long challengeId;
        private String title;
        private String difficulty;
        private Integer basePoints;
        private Integer totalSubmissions = 0;
        private Integer acceptedSubmissions = 0;
        private Double solveRate = 0.0;
        private Integer solversCount = 0;

        public ProblemStatDto() {}

        public Long getChallengeId() { return challengeId; }
        public void setChallengeId(Long challengeId) { this.challengeId = challengeId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public Integer getBasePoints() { return basePoints; }
        public void setBasePoints(Integer basePoints) { this.basePoints = basePoints; }

        public Integer getTotalSubmissions() { return totalSubmissions; }
        public void setTotalSubmissions(Integer totalSubmissions) { this.totalSubmissions = totalSubmissions; }

        public Integer getAcceptedSubmissions() { return acceptedSubmissions; }
        public void setAcceptedSubmissions(Integer acceptedSubmissions) { this.acceptedSubmissions = acceptedSubmissions; }

        public Double getSolveRate() { return solveRate; }
        public void setSolveRate(Double solveRate) { this.solveRate = solveRate; }

        public Integer getSolversCount() { return solversCount; }
        public void setSolversCount(Integer solversCount) { this.solversCount = solversCount; }
    }
}
