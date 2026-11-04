package com.enterprise.pipeline.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_pipelines")
public class CandidatePipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private Long candidateId;

    private String candidateName;
    private String candidateEmail;
    private String skills;
    private Integer experienceYears;

    @Column(nullable = false)
    private Long jobId;

    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PipelineStage currentStage;

    private Long assignedRecruiterId;
    private String assignedRecruiterName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CandidatePipeline() {}

    public CandidatePipeline(Long applicationId, Long candidateId, String candidateName, String candidateEmail,
                             String skills, Integer experienceYears, Long jobId, String jobTitle,
                             PipelineStage currentStage, Long assignedRecruiterId, String assignedRecruiterName) {
        this.applicationId = applicationId;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.skills = skills;
        this.experienceYears = experienceYears;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.currentStage = currentStage != null ? currentStage : PipelineStage.APPLIED;
        this.assignedRecruiterId = assignedRecruiterId;
        this.assignedRecruiterName = assignedRecruiterName;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.currentStage == null) this.currentStage = PipelineStage.APPLIED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public PipelineStage getCurrentStage() { return currentStage; }
    public void setCurrentStage(PipelineStage currentStage) { this.currentStage = currentStage; }

    public Long getAssignedRecruiterId() { return assignedRecruiterId; }
    public void setAssignedRecruiterId(Long assignedRecruiterId) { this.assignedRecruiterId = assignedRecruiterId; }

    public String getAssignedRecruiterName() { return assignedRecruiterName; }
    public void setAssignedRecruiterName(String assignedRecruiterName) { this.assignedRecruiterName = assignedRecruiterName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
