package com.enterprise.candidate.service;

import com.enterprise.candidate.entity.Candidate;
import com.enterprise.candidate.exception.BadRequestException;
import com.enterprise.candidate.exception.ResourceNotFoundException;
import com.enterprise.candidate.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.findByEmail(candidate.getEmail())
                .orElseGet(() -> candidateRepository.save(candidate));
    }

    public List<Candidate> getAllCandidates(String query, String skills, String status) {
        if (status != null && !status.isBlank()) {
            return candidateRepository.findByStatus(status);
        }
        if (query != null && !query.isBlank()) {
            return candidateRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrTitleContainingIgnoreCase(query, query, query);
        }
        return candidateRepository.findAll();
    }

    public Candidate getCandidateById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid candidate ID provided: " + id);
        }
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with ID: " + id));
    }

    public Candidate getCandidateByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Candidate email cannot be empty");
        }
        return candidateRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with email: " + email));
    }

    public Candidate updateCandidate(Long id, Candidate updatedCandidate) {
        Candidate existing = getCandidateById(id);
        existing.setFullName(updatedCandidate.getFullName());
        existing.setPhone(updatedCandidate.getPhone());
        existing.setLocation(updatedCandidate.getLocation());
        existing.setTitle(updatedCandidate.getTitle());
        existing.setSkills(updatedCandidate.getSkills());
        existing.setExperienceYears(updatedCandidate.getExperienceYears());
        existing.setEducation(updatedCandidate.getEducation());
        existing.setResumeUrl(updatedCandidate.getResumeUrl());
        existing.setSummary(updatedCandidate.getSummary());
        if (updatedCandidate.getStatus() != null) {
            existing.setStatus(updatedCandidate.getStatus());
        }
        return candidateRepository.save(existing);
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = getCandidateById(id);
        candidateRepository.delete(candidate);
    }

    public Candidate updateCandidateStatus(Long id, String status) {
        Candidate candidate = getCandidateById(id);
        candidate.setStatus(status);
        return candidateRepository.save(candidate);
    }
}
