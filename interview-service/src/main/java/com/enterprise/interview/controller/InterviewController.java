package com.enterprise.interview.controller;

import com.enterprise.interview.entity.Interview;
import com.enterprise.interview.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Interview interview) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interviewService.scheduleInterview(interview));
    }

    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(interviewService.getInterviewById(id));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Interview>> getByApplicationId(@PathVariable("applicationId") Long applicationId) {
        return ResponseEntity.ok(interviewService.getByApplicationId(applicationId));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Interview>> getByCandidateId(@PathVariable("candidateId") Long candidateId) {
        return ResponseEntity.ok(interviewService.getByCandidateId(candidateId));
    }

    @GetMapping("/interviewer/{interviewerId}")
    public ResponseEntity<List<Interview>> getByInterviewerId(@PathVariable("interviewerId") Long interviewerId) {
        return ResponseEntity.ok(interviewService.getByInterviewerId(interviewerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable("id") Long id, @RequestBody Interview interview) {
        return ResponseEntity.ok(interviewService.updateInterview(id, interview));
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<Interview> submitFeedback(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(interviewService.submitFeedback(id, body));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Interview> cancelInterview(@PathVariable("id") Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Cancelled by user";
        return ResponseEntity.ok(interviewService.cancelInterview(id, reason));
    }
}
