package com.example.demo.dto;

import java.util.ArrayList;
import java.util.List;

public class AiDoubtResponseDto {
    private String reply;
    private String doubtType;
    private List<String> suggestedFollowUps = new ArrayList<>();
    private boolean isGuardrailActive = true;

    public AiDoubtResponseDto() {}

    public AiDoubtResponseDto(String reply, String doubtType, List<String> suggestedFollowUps) {
        this.reply = reply;
        this.doubtType = doubtType;
        if (suggestedFollowUps != null) {
            this.suggestedFollowUps = suggestedFollowUps;
        }
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getDoubtType() { return doubtType; }
    public void setDoubtType(String doubtType) { this.doubtType = doubtType; }

    public List<String> getSuggestedFollowUps() { return suggestedFollowUps; }
    public void setSuggestedFollowUps(List<String> suggestedFollowUps) { this.suggestedFollowUps = suggestedFollowUps; }

    public boolean isGuardrailActive() { return isGuardrailActive; }
    public void setGuardrailActive(boolean guardrailActive) { isGuardrailActive = guardrailActive; }
}
