package com.example.demo.dto;

public class SubmissionRequestDto {
    private Long challengeId;
    private Long contestId;
    private String sourceCode;
    private String username;
    private String language = "javascript";
    private Boolean isTestRun = false;

    public SubmissionRequestDto() {}

    public Long getChallengeId() { return challengeId; }
    public void setChallengeId(Long challengeId) { this.challengeId = challengeId; }

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getCode() { return sourceCode; }
    public void setCode(String code) { this.sourceCode = code; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Boolean getIsTestRun() { return isTestRun != null && isTestRun; }
    public void setIsTestRun(Boolean isTestRun) { this.isTestRun = isTestRun; }
}
