package com.example.demo.dto;

public class PlaygroundRequestDto {
    private String sourceCode;
    private String language = "javascript";
    private String customInput = "";
    private Integer timeLimitMs = 5000;

    public PlaygroundRequestDto() {}

    public PlaygroundRequestDto(String sourceCode, String language, String customInput) {
        this.sourceCode = sourceCode;
        this.language = language;
        this.customInput = customInput;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getCode() {
        return sourceCode;
    }

    public void setCode(String code) {
        this.sourceCode = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCustomInput() {
        return customInput;
    }

    public void setCustomInput(String customInput) {
        this.customInput = customInput;
    }

    public Integer getTimeLimitMs() {
        return timeLimitMs;
    }

    public void setTimeLimitMs(Integer timeLimitMs) {
        this.timeLimitMs = timeLimitMs;
    }
}
