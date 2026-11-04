package com.enterprise.pipeline.controller;

import com.enterprise.pipeline.dto.MoveStageRequest;
import com.enterprise.pipeline.entity.CandidatePipeline;
import com.enterprise.pipeline.entity.PipelineHistory;
import com.enterprise.pipeline.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pipeline")
public class PipelineController {

    @Autowired
    private PipelineService pipelineService;

    @PostMapping
    public ResponseEntity<CandidatePipeline> createPipelineEntry(@RequestBody CandidatePipeline pipeline) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pipelineService.createPipelineEntry(pipeline));
    }

    @GetMapping
    public ResponseEntity<List<CandidatePipeline>> getAllPipelines(@RequestParam(name = "jobId", required = false) Long jobId) {
        return ResponseEntity.ok(pipelineService.getAllPipelines(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidatePipeline> getPipelineById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(pipelineService.getPipelineById(id));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<CandidatePipeline> getPipelineByApplicationId(@PathVariable("applicationId") Long applicationId) {
        return ResponseEntity.ok(pipelineService.getPipelineByApplicationId(applicationId));
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<CandidatePipeline> moveStage(@PathVariable("id") Long id, @RequestBody MoveStageRequest request) {
        return ResponseEntity.ok(pipelineService.moveStage(id, request));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<PipelineHistory>> getPipelineHistory(@PathVariable("id") Long id) {
        return ResponseEntity.ok(pipelineService.getPipelineHistory(id));
    }

    @GetMapping("/kanban")
    public ResponseEntity<Map<String, List<CandidatePipeline>>> getKanbanBoard(@RequestParam(name = "jobId", required = false) Long jobId) {
        return ResponseEntity.ok(pipelineService.getKanbanBoard(jobId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(pipelineService.getAnalytics());
    }
}
