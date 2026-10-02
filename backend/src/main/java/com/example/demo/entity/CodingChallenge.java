package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "coding_challenges")
public class CodingChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "setter_id")
    private SystemUser setter;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String sampleTestCases;

    @Column(columnDefinition = "TEXT")
    private String hiddenTestCases;

    private String difficulty;

    private Integer basePoints;

    private Integer timeLimitMs;

    private String status;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private ProgrammingContest contest;

    public CodingChallenge() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SystemUser getSetter() { return setter; }
    public void setSetter(SystemUser setter) { this.setter = setter; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getBasePoints() { return basePoints; }
    public void setBasePoints(Integer basePoints) { this.basePoints = basePoints; }

    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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

    public ProgrammingContest getContest() { return contest; }
    public void setContest(ProgrammingContest contest) { this.contest = contest; }
}
