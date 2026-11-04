package com.enterprise.candidate.controller;

import com.enterprise.candidate.entity.Candidate;
import com.enterprise.candidate.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.createCandidate(candidate));
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "skills", required = false) String skills,
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(candidateService.getAllCandidates(query, skills, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getCandidateByEmail(@PathVariable("email") String email) {
        try {
            return ResponseEntity.ok(candidateService.getCandidateByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Candidate profile not found for email: " + email));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable("id") Long id, @RequestBody Candidate candidate) {
        return ResponseEntity.ok(candidateService.updateCandidate(id, candidate));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Candidate> updateCandidateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(candidateService.updateCandidateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCandidate(@PathVariable("id") Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok(Map.of("message", "Candidate deleted successfully with ID: " + id));
    }
}
