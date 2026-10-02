package com.example.demo.dto;

import java.util.List;

public class AddContestQuestionsRequestDto {
    private Long contestId;
    private List<AiGeneratedQuestionDto> questions;

    public AddContestQuestionsRequestDto() {}

    public Long getContestId() { return contestId; }
    public void setContestId(Long contestId) { this.contestId = contestId; }

    public List<AiGeneratedQuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<AiGeneratedQuestionDto> questions) { this.questions = questions; }
}
