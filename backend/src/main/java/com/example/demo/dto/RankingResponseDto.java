package com.example.demo.dto;

public class RankingResponseDto {
    private Integer rank;
    private String username;
    private Integer score;
    private Integer solvedCount = 0;
    private Integer penalty = 0;
    private String time = "00:00";
    private Integer totalAttempts = 0;

    public RankingResponseDto() {}

    public RankingResponseDto(Integer rank, String username, Integer score) {
        this.rank = rank;
        this.username = username;
        this.score = score;
    }

    public RankingResponseDto(Integer rank, String username, Integer score, Integer solvedCount) {
        this.rank = rank;
        this.username = username;
        this.score = score;
        this.solvedCount = solvedCount;
    }

    public RankingResponseDto(Integer rank, String username, Integer score, Integer solvedCount, Integer penalty, String time) {
        this.rank = rank;
        this.username = username;
        this.score = score;
        this.solvedCount = solvedCount;
        this.penalty = penalty;
        this.time = time;
    }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getSolvedCount() { return solvedCount; }
    public void setSolvedCount(Integer solvedCount) { this.solvedCount = solvedCount; }

    public Integer getPenalty() { return penalty; }
    public void setPenalty(Integer penalty) { this.penalty = penalty; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public Integer getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(Integer totalAttempts) { this.totalAttempts = totalAttempts; }
}
