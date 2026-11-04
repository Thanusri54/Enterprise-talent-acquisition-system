package com.enterprise.candidate.repository;

import com.enterprise.candidate.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmail(String email);
    boolean existsByEmail(String email);

    List<Candidate> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrTitleContainingIgnoreCase(
            String fullName, String email, String title);
    List<Candidate> findByStatus(String status);
}
