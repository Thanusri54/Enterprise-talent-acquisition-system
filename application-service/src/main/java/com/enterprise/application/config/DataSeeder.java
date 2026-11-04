package com.enterprise.application.config;

import com.enterprise.application.entity.Application;
import com.enterprise.application.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (applicationRepository.count() == 0) {
            applicationRepository.saveAll(List.of(
                new Application(
                    1L, "Sarah Jenkins", "sarah.jenkins@example.com",
                    1L, "Senior Java Developer", "Engineering",
                    "IN_REVIEW", 3L, "Lead Recruiter",
                    "Excited to apply my 7+ years of Spring Boot experience to enterprise cloud orchestration.", 96
                ),
                new Application(
                    2L, "Alex Chen", "alex.chen@example.com",
                    2L, "Frontend React Developer", "Engineering",
                    "IN_REVIEW", 3L, "Lead Recruiter",
                    "Passionate about building responsive, accessible React interfaces.", 92
                ),
                new Application(
                    3L, "Marcus Vance", "marcus.vance@example.com",
                    3L, "Data Scientist", "Data & AI",
                    "IN_REVIEW", 3L, "Lead Recruiter",
                    "Eager to bring predictive ML pipeline algorithms to HR talent analytics.", 90
                ),
                new Application(
                    4L, "Elena Rostova", "elena.rostova@example.com",
                    4L, "DevOps Infrastructure Engineer", "DevOps & SRE",
                    "IN_REVIEW", 3L, "Lead Recruiter",
                    "Deep experience with AWS, Kubernetes, and Terraform deployment automation.", 94
                ),
                new Application(
                    5L, "David Miller", "david.miller@example.com",
                    1L, "Senior Java Developer", "Engineering",
                    "APPLIED", 3L, "Lead Recruiter",
                    "Fullstack Java developer with Spring & React expertise.", 85
                )
            ));
        }
    }
}
