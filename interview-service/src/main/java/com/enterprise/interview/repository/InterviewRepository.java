package com.enterprise.interview.repository;

import com.enterprise.interview.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    List<Interview> findByCandidateId(Long candidateId);
    List<Interview> findByInterviewerId(Long interviewerId);
    List<Interview> findByJobId(Long jobId);
}
