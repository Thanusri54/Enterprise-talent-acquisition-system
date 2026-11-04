package com.enterprise.pipeline.service;

import com.enterprise.pipeline.dto.MoveStageRequest;
import com.enterprise.pipeline.entity.CandidatePipeline;
import com.enterprise.pipeline.entity.PipelineHistory;
import com.enterprise.pipeline.entity.PipelineStage;
import com.enterprise.pipeline.repository.CandidatePipelineRepository;
import com.enterprise.pipeline.repository.PipelineHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PipelineService {

    @Autowired
    private CandidatePipelineRepository candidatePipelineRepository;

    @Autowired
    private PipelineHistoryRepository pipelineHistoryRepository;

    @Autowired
    private StageTransitionValidator stageTransitionValidator;

    public CandidatePipeline createPipelineEntry(CandidatePipeline pipeline) {
        if (candidatePipelineRepository.existsByApplicationId(pipeline.getApplicationId())) {
            return candidatePipelineRepository.findByApplicationId(pipeline.getApplicationId()).orElse(pipeline);
        }
        CandidatePipeline saved = candidatePipelineRepository.save(pipeline);

        // Record initial stage history
        PipelineHistory history = new PipelineHistory(
                saved.getId(),
                null,
                saved.getCurrentStage(),
                saved.getAssignedRecruiterId() != null ? saved.getAssignedRecruiterId() : 1L,
                saved.getAssignedRecruiterName() != null ? saved.getAssignedRecruiterName() : "System Seeder",
                "Candidate pipeline record initialized."
        );
        pipelineHistoryRepository.save(history);

        return saved;
    }

    public List<CandidatePipeline> getAllPipelines(Long jobId) {
        if (jobId != null) {
            return candidatePipelineRepository.findByJobId(jobId);
        }
        return candidatePipelineRepository.findAll();
    }

    public CandidatePipeline getPipelineById(Long id) {
        return candidatePipelineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate Pipeline record not found with ID: " + id));
    }

    public CandidatePipeline getPipelineByApplicationId(Long applicationId) {
        return candidatePipelineRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("Candidate Pipeline record not found for Application ID: " + applicationId));
    }

    @Transactional
    public CandidatePipeline moveStage(Long pipelineId, MoveStageRequest request) {
        CandidatePipeline pipeline = getPipelineById(pipelineId);
        PipelineStage fromStage = pipeline.getCurrentStage();
        PipelineStage toStage = request.getToStage();

        if (!stageTransitionValidator.isValidTransition(fromStage, toStage, request.isForceMove())) {
            throw new IllegalArgumentException(String.format(
                    "Invalid stage transition from %s to %s. Stage movement must follow pipeline sequence or use force move.",
                    fromStage, toStage
            ));
        }

        pipeline.setCurrentStage(toStage);
        CandidatePipeline updatedPipeline = candidatePipelineRepository.save(pipeline);

        PipelineHistory history = new PipelineHistory(
                pipelineId,
                fromStage,
                toStage,
                request.getMovedByUserId() != null ? request.getMovedByUserId() : 1L,
                request.getMovedByName() != null ? request.getMovedByName() : "Recruiter",
                request.getComments() != null ? request.getComments() : "Moved candidate to " + toStage
        );
        pipelineHistoryRepository.save(history);

        return updatedPipeline;
    }

    public List<PipelineHistory> getPipelineHistory(Long pipelineId) {
        return pipelineHistoryRepository.findByPipelineIdOrderByTimestampDesc(pipelineId);
    }

    public Map<String, List<CandidatePipeline>> getKanbanBoard(Long jobId) {
        List<CandidatePipeline> pipelines = getAllPipelines(jobId);
        Map<String, List<CandidatePipeline>> kanban = new LinkedHashMap<>();

        for (PipelineStage stage : PipelineStage.values()) {
            kanban.put(stage.name(), new ArrayList<>());
        }

        for (CandidatePipeline cp : pipelines) {
            kanban.computeIfAbsent(cp.getCurrentStage().name(), k -> new ArrayList<>()).add(cp);
        }

        return kanban;
    }

    public Map<String, Object> getAnalytics() {
        List<CandidatePipeline> all = candidatePipelineRepository.findAll();
        Map<String, Long> stageCounts = all.stream()
                .collect(Collectors.groupingBy(p -> p.getCurrentStage().name(), Collectors.counting()));

        // Ensure zero counts for missing stages
        for (PipelineStage stage : PipelineStage.values()) {
            stageCounts.putIfAbsent(stage.name(), 0L);
        }

        long totalCandidates = all.size();
        long hiredCount = stageCounts.getOrDefault("HIRED", 0L);
        long rejectedCount = stageCounts.getOrDefault("REJECTED", 0L);
        long activeCount = totalCandidates - hiredCount - rejectedCount;

        double conversionRate = totalCandidates > 0 ? ((double) hiredCount / totalCandidates) * 100 : 0.0;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalCandidates", totalCandidates);
        analytics.put("activeInPipeline", activeCount);
        analytics.put("hired", hiredCount);
        analytics.put("rejected", rejectedCount);
        analytics.put("conversionRatePercentage", Math.round(conversionRate * 100.0) / 100.0);
        analytics.put("stageCounts", stageCounts);

        return analytics;
    }
}
