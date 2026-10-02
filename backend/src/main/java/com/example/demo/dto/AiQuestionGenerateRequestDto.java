package com.example.demo.dto;

public class AiQuestionGenerateRequestDto {
    private Long contestId;
    private String topic;
    private String difficulty; // EASY, MEDIUM, HARD, or MIXED
    private Integer numberOfQuestions; // 1 to 5
    private String language; // javascript, python, java, cpp
    private Integer easyCount;
    private Integer mediumCount;
    private Integer hardCount;

    public AiQuestionGenerateRequestDto() {}

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(Integer numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Integer getEasyCount() { return easyCount; }
    public void setEasyCount(Integer easyCount) { this.easyCount = easyCount; }

    public Integer getMediumCount() { return mediumCount; }
    public void setMediumCount(Integer mediumCount) { this.mediumCount = mediumCount; }

    public Integer getHardCount() { return hardCount; }
    public void setHardCount(Integer hardCount) { this.hardCount = hardCount; }
}
