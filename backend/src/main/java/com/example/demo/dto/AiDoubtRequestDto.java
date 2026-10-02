package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiDoubtRequestDto {
    private Long contestId;
    private Long challengeId;
    private String problemTitle;
    private String problemDescription;
    private String contestantCode;
    private String contestantDoubt;
    private String doubtType = "GENERAL"; // HINT, CONCEPT, ERROR_EXPLANATION, EDGE_CASE, GENERAL
    private String errorDetails;
    private String language = "javascript";

    public AiDoubtRequestDto() {}

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public Long getChallengeId() { return challengeId; }
    public void setChallengeId(Long challengeId) { this.challengeId = challengeId; }

    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public String getContestantCode() { return contestantCode; }
    public void setContestantCode(String contestantCode) { this.contestantCode = contestantCode; }

    public String getContestantDoubt() { return contestantDoubt; }
    public void setContestantDoubt(String contestantDoubt) { this.contestantDoubt = contestantDoubt; }

    public String getDoubtType() { return doubtType; }
    public void setDoubtType(String doubtType) { this.doubtType = doubtType; }

    public String getErrorDetails() { return errorDetails; }
    public void setErrorDetails(String errorDetails) { this.errorDetails = errorDetails; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
