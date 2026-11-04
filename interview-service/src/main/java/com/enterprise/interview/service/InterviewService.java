package com.enterprise.interview.service;

import com.enterprise.interview.entity.Interview;
import com.enterprise.interview.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    public Interview scheduleInterview(Interview interview) {
        return interviewRepository.save(interview);
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public Interview getInterviewById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview record not found with ID: " + id));
    }

    public List<Interview> getByApplicationId(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId);
    }

    public List<Interview> getByCandidateId(Long candidateId) {
        return interviewRepository.findByCandidateId(candidateId);
    }

    public List<Interview> getByInterviewerId(Long interviewerId) {
        return interviewRepository.findByInterviewerId(interviewerId);
    }

    public Interview updateInterview(Long id, Interview updated) {
        Interview existing = getInterviewById(id);
        existing.setInterviewerId(updated.getInterviewerId());
        existing.setInterviewerName(updated.getInterviewerName());
        existing.setScheduledTime(updated.getScheduledTime());
        existing.setDurationMinutes(updated.getDurationMinutes());
        existing.setInterviewType(updated.getInterviewType());
        existing.setMeetingLink(updated.getMeetingLink());
        if (updated.getStatus() != null) {
            existing.setStatus(updated.getStatus());
        }
        return interviewRepository.save(existing);
    }

    public Interview submitFeedback(Long id, Map<String, Object> body) {
        Interview interview = getInterviewById(id);
        String feedback = "";
        if (body.get("feedback") != null) {
            feedback = body.get("feedback").toString();
        } else if (body.get("detailedFeedback") != null) {
            String rec = body.get("recommendation") != null ? body.get("recommendation").toString() : "SELECT";
            String str = body.get("strengths") != null ? body.get("strengths").toString() : "";
            String det = body.get("detailedFeedback").toString();
            feedback = String.format("[%s] Strengths: %s. Notes: %s", rec, str, det);
        }

        Integer rating = 4;
        if (body.get("rating") != null) {
            rating = Integer.valueOf(body.get("rating").toString());
        } else if (body.get("overallRating") != null) {
            rating = (int) Math.round(Double.parseDouble(body.get("overallRating").toString()));
        }

        String status = body.get("status") != null ? body.get("status").toString() : "COMPLETED";

        interview.setFeedback(feedback);
        interview.setRating(rating);
        interview.setStatus(status);
        return interviewRepository.save(interview);
    }

    public Interview cancelInterview(Long id, String reason) {
        Interview interview = getInterviewById(id);
        interview.setStatus("CANCELLED");
        interview.setFeedback("Cancelled: " + (reason != null ? reason : "No reason provided"));
        return interviewRepository.save(interview);
    }
}
