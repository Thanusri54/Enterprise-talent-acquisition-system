package com.enterprise.application.service;

import com.enterprise.application.entity.Application;
import com.enterprise.application.exception.BadRequestException;
import com.enterprise.application.exception.DuplicateApplicationException;
import com.enterprise.application.exception.ResourceNotFoundException;
import com.enterprise.application.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public Application createApplication(Application application) {
        if (application == null) {
            throw new BadRequestException("Application payload cannot be null");
        }
        if (application.getCandidateId() == null) {
            throw new BadRequestException("Candidate ID is required");
        }
        if (application.getCandidateId() <= 0) {
            throw new BadRequestException("Invalid candidate ID provided: " + application.getCandidateId());
        }
        if (application.getJobId() == null) {
            throw new BadRequestException("Job ID is required");
        }
        if (application.getJobId() <= 0) {
            throw new BadRequestException("Invalid job ID provided: " + application.getJobId());
        }

        if (applicationRepository.existsByCandidateIdAndJobId(application.getCandidateId(), application.getJobId())) {
            throw new DuplicateApplicationException("Candidate has already applied for this job");
        }
        return applicationRepository.save(application);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application getApplicationById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid application ID provided");
        }
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + id));
    }

    public List<Application> getApplicationsByCandidateId(Long candidateId) {
        if (candidateId == null || candidateId <= 0) {
            throw new BadRequestException("Invalid candidate ID provided");
        }
        return applicationRepository.findByCandidateId(candidateId);
    }

    public List<Application> getApplicationsByJobId(Long jobId) {
        if (jobId == null || jobId <= 0) {
            throw new BadRequestException("Invalid job ID provided");
        }
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(Long id, String status) {
        Application app = getApplicationById(id);
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    public Application assignRecruiter(Long id, Long recruiterId, String recruiterName) {
        Application app = getApplicationById(id);
        app.setRecruiterId(recruiterId);
        app.setRecruiterName(recruiterName);
        return applicationRepository.save(app);
    }
}
