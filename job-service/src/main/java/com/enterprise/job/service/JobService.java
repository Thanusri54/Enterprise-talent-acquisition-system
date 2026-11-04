package com.enterprise.job.service;

import com.enterprise.job.entity.Job;
import com.enterprise.job.exception.BadRequestException;
import com.enterprise.job.exception.ResourceNotFoundException;
import com.enterprise.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Job job) {
        if (job == null) {
            throw new BadRequestException("Job payload cannot be null");
        }
        if (job.getTitle() == null || job.getTitle().isBlank()) {
            throw new BadRequestException("Job title is required");
        }
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs(String department, String status, String search) {
        if (department != null && !department.isBlank()) {
            return jobRepository.findByDepartmentIgnoreCase(department);
        }
        if (status != null && !status.isBlank()) {
            return jobRepository.findByStatus(status);
        }
        if (search != null && !search.isBlank()) {
            return jobRepository.findByTitleContainingIgnoreCase(search);
        }
        return jobRepository.findAll();
    }

    public Job getJobById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid job ID provided: " + id);
        }
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job Requisition not found with ID: " + id));
    }

    public Job updateJob(Long id, Job updatedJob) {
        Job existing = getJobById(id);
        existing.setTitle(updatedJob.getTitle());
        existing.setDepartment(updatedJob.getDepartment());
        existing.setRequiredSkills(updatedJob.getRequiredSkills());
        existing.setExperienceLevel(updatedJob.getExperienceLevel());
        existing.setLocation(updatedJob.getLocation());
        existing.setEmploymentType(updatedJob.getEmploymentType());
        existing.setSalaryRange(updatedJob.getSalaryRange());
        existing.setDescription(updatedJob.getDescription());
        existing.setRequirements(updatedJob.getRequirements());
        if (updatedJob.getStatus() != null) {
            existing.setStatus(updatedJob.getStatus());
        }
        return jobRepository.save(existing);
    }

    public void deleteJob(Long id) {
        Job job = getJobById(id);
        jobRepository.delete(job);
    }

    public Job updateJobStatus(Long id, String status) {
        Job job = getJobById(id);
        job.setStatus(status);
        return jobRepository.save(job);
    }
}
