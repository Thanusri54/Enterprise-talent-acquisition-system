package com.enterprise.pipeline.config;

import com.enterprise.pipeline.dto.MoveStageRequest;
import com.enterprise.pipeline.entity.CandidatePipeline;
import com.enterprise.pipeline.entity.PipelineStage;
import com.enterprise.pipeline.repository.CandidatePipelineRepository;
import com.enterprise.pipeline.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CandidatePipelineRepository candidatePipelineRepository;

    @Autowired
    private PipelineService pipelineService;

    @Override
    public void run(String... args) throws Exception {
        if (candidatePipelineRepository.count() == 0) {
            // 1. Sarah Jenkins - Senior Java Developer -> Interview
            CandidatePipeline p1 = pipelineService.createPipelineEntry(new CandidatePipeline(
                    1L, 1L, "Sarah Jenkins", "sarah.jenkins@example.com",
                    "Java, Spring Boot, Microservices, Docker, MySQL", 7,
                    1L, "Senior Java Developer", PipelineStage.APPLIED, 3L, "Lead Recruiter"
            ));
            pipelineService.moveStage(p1.getId(), new MoveStageRequest(PipelineStage.SCREENING, 3L, "Lead Recruiter", "Strong candidate profile & technical resume matched."));
            pipelineService.moveStage(p1.getId(), new MoveStageRequest(PipelineStage.SHORTLISTED, 3L, "Lead Recruiter", "Shortlisted for interview panel."));
            pipelineService.moveStage(p1.getId(), new MoveStageRequest(PipelineStage.INTERVIEW, 3L, "Lead Recruiter", "Scheduled technical & HR interview round."));

            // 2. Alex Chen - Frontend React Developer -> Shortlisted
            CandidatePipeline p2 = pipelineService.createPipelineEntry(new CandidatePipeline(
                    2L, 2L, "Alex Chen", "alex.chen@example.com",
                    "React, TypeScript, Vite, Tailwind CSS, Redux", 5,
                    2L, "Frontend React Developer", PipelineStage.APPLIED, 3L, "Lead Recruiter"
            ));
            pipelineService.moveStage(p2.getId(), new MoveStageRequest(PipelineStage.SCREENING, 3L, "Lead Recruiter", "Passed initial resume review."));
            pipelineService.moveStage(p2.getId(), new MoveStageRequest(PipelineStage.SHORTLISTED, 3L, "Lead Recruiter", "Shortlisted based on React portfolio."));

            // 3. Marcus Vance - Data Scientist -> Screening
            CandidatePipeline p3 = pipelineService.createPipelineEntry(new CandidatePipeline(
                    3L, 3L, "Marcus Vance", "marcus.vance@example.com",
                    "Python, PyTorch, TensorFlow, SQL, Spark", 6,
                    3L, "Data Scientist", PipelineStage.APPLIED, 3L, "Lead Recruiter"
            ));
            pipelineService.moveStage(p3.getId(), new MoveStageRequest(PipelineStage.SCREENING, 3L, "Lead Recruiter", "Ph.D. credential verified."));

            // 4. Elena Rostova - DevOps Lead -> Offer
            CandidatePipeline p4 = pipelineService.createPipelineEntry(new CandidatePipeline(
                    4L, 4L, "Elena Rostova", "elena.rostova@example.com",
                    "AWS, Terraform, Kubernetes, Docker, CI/CD", 8,
                    4L, "DevOps Infrastructure Engineer", PipelineStage.APPLIED, 3L, "Lead Recruiter"
            ));
            pipelineService.moveStage(p4.getId(), new MoveStageRequest(PipelineStage.SCREENING, 3L, "Lead Recruiter", "Passed resume screening."));
            pipelineService.moveStage(p4.getId(), new MoveStageRequest(PipelineStage.SHORTLISTED, 3L, "Lead Recruiter", "Shortlisted for interviews."));
            pipelineService.moveStage(p4.getId(), new MoveStageRequest(PipelineStage.INTERVIEW, 4L, "Senior Tech Lead", "Outstanding technical architecture session."));
            pipelineService.moveStage(p4.getId(), new MoveStageRequest(PipelineStage.OFFER, 3L, "Lead Recruiter", "Formal offer letter generated."));

            // 5. David Miller -> Applied
            pipelineService.createPipelineEntry(new CandidatePipeline(
                    5L, 5L, "David Miller", "david.miller@example.com",
                    "Java, Spring, React, PostgreSQL, Docker", 4,
                    1L, "Senior Java Developer", PipelineStage.APPLIED, 3L, "Lead Recruiter"
            ));
        }
    }
}
