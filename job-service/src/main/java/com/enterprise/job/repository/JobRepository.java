package com.enterprise.job.repository;

import com.enterprise.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByDepartmentIgnoreCase(String department);
    List<Job> findByStatus(String status);
    List<Job> findByTitleContainingIgnoreCase(String search);
}
