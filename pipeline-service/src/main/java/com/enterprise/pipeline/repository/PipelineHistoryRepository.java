package com.enterprise.pipeline.repository;

import com.enterprise.pipeline.entity.PipelineHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineHistoryRepository extends JpaRepository<PipelineHistory, Long> {
    List<PipelineHistory> findByPipelineIdOrderByTimestampDesc(Long pipelineId);
}
