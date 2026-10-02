package com.example.demo.dto;

public class SubmissionResponseDto {
    private Long submissionId;
    private String verdict;
    private Integer pointsEarned;
    private Integer executionTimeMs;
    private String message;
    private String memoryUsage;
    private String timeComplexity;
    private String spaceComplexity;
    private String complexityDetails;
    private Integer totalTestCases = 0;
    private Integer passedTestCases = 0;
    private String errorDetails;
    private java.util.List<TestCaseResult> testCaseResults = new java.util.ArrayList<>();

    public static class TestCaseResult {
        private int testCaseIndex;
        private boolean passed;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private Integer executionTimeMs;
        private String error;

        public TestCaseResult() {}

        public TestCaseResult(int testCaseIndex, boolean passed, String input, String expectedOutput, String actualOutput, Integer executionTimeMs, String error) {
            this.testCaseIndex = testCaseIndex;
            this.passed = passed;
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.executionTimeMs = executionTimeMs;
            this.error = error;
        }

        public int getTestCaseIndex() { return testCaseIndex; }
        public void setTestCaseIndex(int testCaseIndex) { this.testCaseIndex = testCaseIndex; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public String getActualOutput() { return actualOutput; }
        public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }

        public Integer getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    public SubmissionResponseDto() {}

    public SubmissionResponseDto(Long submissionId, String verdict, Integer pointsEarned, Integer executionTimeMs, String message) {
        this.submissionId = submissionId;
        this.verdict = verdict;
        this.pointsEarned = pointsEarned;
        this.executionTimeMs = executionTimeMs;
        this.message = message;
    }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }

    public Integer getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(String memoryUsage) { this.memoryUsage = memoryUsage; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public String getComplexityDetails() { return complexityDetails; }
    public void setComplexityDetails(String complexityDetails) { this.complexityDetails = complexityDetails; }

    public Integer getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }

    public Integer getPassedTestCases() { return passedTestCases; }
    public void setPassedTestCases(Integer passedTestCases) { this.passedTestCases = passedTestCases; }

    public String getErrorDetails() { return errorDetails; }
    public void setErrorDetails(String errorDetails) { this.errorDetails = errorDetails; }

    public java.util.List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(java.util.List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
}
