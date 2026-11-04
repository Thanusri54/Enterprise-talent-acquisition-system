package com.enterprise.pipeline.dto;

import com.enterprise.pipeline.entity.PipelineStage;

public class MoveStageRequest {
    private PipelineStage toStage;
    private Long movedByUserId;
    private String movedByName;
    private String comments;
    private boolean forceMove;

    public MoveStageRequest() {}

    public MoveStageRequest(PipelineStage toStage, Long movedByUserId, String movedByName, String comments) {
        this.toStage = toStage;
        this.movedByUserId = movedByUserId;
        this.movedByName = movedByName;
        this.comments = comments;
    }

    public PipelineStage getToStage() { return toStage; }
    public void setToStage(PipelineStage toStage) { this.toStage = toStage; }
    public void setTargetStage(PipelineStage targetStage) { this.toStage = targetStage; }
    public void setStage(PipelineStage stage) { this.toStage = stage; }

    public Long getMovedByUserId() { return movedByUserId; }
    public void setMovedByUserId(Long movedByUserId) { this.movedByUserId = movedByUserId; }

    public String getMovedByName() { return movedByName; }
    public void setMovedByName(String movedByName) { this.movedByName = movedByName; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public void setNotes(String notes) { this.comments = notes; }

    public boolean isForceMove() { return forceMove; }
    public void setForceMove(boolean forceMove) { this.forceMove = forceMove; }
}
