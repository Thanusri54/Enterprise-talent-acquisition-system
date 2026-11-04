package com.enterprise.pipeline.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pipeline_history")
public class PipelineHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long pipelineId;

    @Enumerated(EnumType.STRING)
    private PipelineStage fromStage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PipelineStage toStage;

    private Long movedByUserId;
    private String movedByName;

    @Column(length = 2000)
    private String comments;

    private LocalDateTime timestamp;

    public PipelineHistory() {}

    public PipelineHistory(Long pipelineId, PipelineStage fromStage, PipelineStage toStage,
                           Long movedByUserId, String movedByName, String comments) {
        this.pipelineId = pipelineId;
        this.fromStage = fromStage;
        this.toStage = toStage;
        this.movedByUserId = movedByUserId;
        this.movedByName = movedByName;
        this.comments = comments;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPipelineId() { return pipelineId; }
    public void setPipelineId(Long pipelineId) { this.pipelineId = pipelineId; }

    public PipelineStage getFromStage() { return fromStage; }
    public void setFromStage(PipelineStage fromStage) { this.fromStage = fromStage; }

    public PipelineStage getToStage() { return toStage; }
    public void setToStage(PipelineStage toStage) { this.toStage = toStage; }

    public Long getMovedByUserId() { return movedByUserId; }
    public void setMovedByUserId(Long movedByUserId) { this.movedByUserId = movedByUserId; }

    public String getMovedByName() { return movedByName; }
    public void setMovedByName(String movedByName) { this.movedByName = movedByName; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
