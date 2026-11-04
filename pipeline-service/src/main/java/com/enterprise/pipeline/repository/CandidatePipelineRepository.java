package com.enterprise.pipeline.repository;

import com.enterprise.pipeline.entity.CandidatePipeline;
import com.enterprise.pipeline.entity.PipelineStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatePipelineRepository extends JpaRepository<CandidatePipeline, Long> {
    Optional<CandidatePipeline> findByApplicationId(Long applicationId);
    List<CandidatePipeline> findByJobId(Long jobId);
    List<CandidatePipeline> findByCandidateId(Long candidateId);
    List<CandidatePipeline> findByCurrentStage(PipelineStage stage);
    boolean existsByApplicationId(Long applicationId);
}
