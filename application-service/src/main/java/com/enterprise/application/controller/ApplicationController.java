package com.enterprise.application.controller;

import com.enterprise.application.entity.Application;
import com.enterprise.application.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<Application> createApplication(@RequestBody Application application) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(application));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Application>> getByCandidateId(@PathVariable("candidateId") Long candidateId) {
        return ResponseEntity.ok(applicationService.getApplicationsByCandidateId(candidateId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getByJobId(@PathVariable("jobId") Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Application> assignRecruiter(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        Long recruiterId = Long.valueOf(body.get("recruiterId").toString());
        String recruiterName = body.get("recruiterName") != null ? body.get("recruiterName").toString() : "Lead Recruiter";
        return ResponseEntity.ok(applicationService.assignRecruiter(id, recruiterId, recruiterName));
    }
}
