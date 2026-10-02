package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiGeneratedQuestionDto {
    private Long id;
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraints;
    private String sampleTestCases;
    private String hiddenTestCases;
    private String difficulty = "EASY";
    private Integer basePoints = 100;
    private Integer timeLimitMs = 1000;
    private String status = "DRAFT";
    private Long contestId;
    private String topic;

    public AiGeneratedQuestionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public String getSampleTestCases() { return sampleTestCases; }
    public void setSampleTestCases(String sampleTestCases) { this.sampleTestCases = sampleTestCases; }

    public String getHiddenTestCases() { return hiddenTestCases; }
    public void setHiddenTestCases(String hiddenTestCases) { this.hiddenTestCases = hiddenTestCases; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getBasePoints() { return basePoints; }
    public void setBasePoints(Integer basePoints) { this.basePoints = basePoints; }

    public Integer getPoints() { return basePoints; }
    public void setPoints(Integer points) { this.basePoints = points; }

    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
}
