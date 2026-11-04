package com.enterprise.job.config;

import com.enterprise.job.entity.Job;
import com.enterprise.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private JobRepository jobRepository;

    @Override
    public void run(String... args) throws Exception {
        if (jobRepository.count() == 0) {
            jobRepository.saveAll(List.of(
                new Job(
                    "Senior Java Developer", "Engineering", "Java, Spring Boot, Microservices, Docker, MySQL",
                    "Senior Level (5+ yrs)", "San Francisco, CA", "FULL_TIME", "$150,000 - $185,000",
                    "Lead design and development of enterprise microservices backend architectures.",
                    "Must have 5+ years Java experience, microservices, Spring Boot, and REST API design.", "OPEN", 1L
                ),
                new Job(
                    "Frontend React Developer", "Engineering", "React, TypeScript, Vite, Tailwind CSS, Redux",
                    "Mid Level (3+ yrs)", "Remote / Seattle, WA", "FULL_TIME", "$120,000 - $145,000",
                    "Build intuitive, high-performance UI dashboards for enterprise talent platforms.",
                    "Proficiency in React 18, state management, modern CSS frameworks, and REST consumption.", "OPEN", 1L
                ),
                new Job(
                    "Data Scientist", "Data & AI", "Python, PyTorch, SQL, Machine Learning, Analytics",
                    "Senior Level (4+ yrs)", "Austin, TX", "FULL_TIME", "$140,000 - $170,000",
                    "Develop intelligent candidate matching models and recruitment pipeline analytics.",
                    "Strong background in machine learning algorithms, NLP for resume parsing, and SQL.", "OPEN", 1L
                ),
                new Job(
                    "DevOps Infrastructure Engineer", "DevOps & SRE", "AWS, Kubernetes, Terraform, Docker, Jenkins",
                    "Senior Level (5+ yrs)", "New York, NY", "FULL_TIME", "$155,000 - $190,000",
                    "Architect multi-cloud deployment automation and zero-downtime infrastructure.",
                    "Hands-on experience with Terraform, Kubernetes clusters, and container security.", "OPEN", 1L
                )
            ));
        }
    }
}
