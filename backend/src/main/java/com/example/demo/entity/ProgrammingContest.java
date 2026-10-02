package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "programming_contests")
public class ProgrammingContest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime startTime;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime endTime;

    private Integer capacity;

    private String status = "UPCOMING";

    @Transient
    private java.util.List<String> enrolledParticipants = new java.util.ArrayList<>();

    @Transient
    private Integer enrolledCount = 0;

    public ProgrammingContest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String calculateStatus() {
        if (startTime == null || endTime == null) {
            return status != null ? status : "UPCOMING";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime)) {
            return "UPCOMING";
        } else if (!now.isBefore(endTime)) {
            return "EXPIRED";
        } else {
            return "ACTIVE";
        }
    }

    public String getStatus() {
        if (startTime != null && endTime != null) {
            return calculateStatus();
        }
        return status != null ? status : "UPCOMING";
    }

    public void setStatus(String status) { this.status = status; }

    @PrePersist
    @PreUpdate
    public void syncCalculatedStatus() {
        this.status = calculateStatus();
    }

    public java.util.List<String> getEnrolledParticipants() { return enrolledParticipants; }
    public void setEnrolledParticipants(java.util.List<String> enrolledParticipants) {
        this.enrolledParticipants = enrolledParticipants;
        this.enrolledCount = enrolledParticipants != null ? enrolledParticipants.size() : 0;
    }

    public Integer getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(Integer enrolledCount) { this.enrolledCount = enrolledCount; }
}
