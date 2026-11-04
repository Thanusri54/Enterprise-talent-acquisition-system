package com.enterprise.candidate.config;

import com.enterprise.candidate.entity.Candidate;
import com.enterprise.candidate.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CandidateRepository candidateRepository;

    @Override
    public void run(String... args) throws Exception {
        if (candidateRepository.count() == 0) {
            candidateRepository.saveAll(List.of(
                new Candidate(
                    "Sarah Jenkins", "sarah.jenkins@example.com", "+1 555-0101", "San Francisco, CA",
                    "Senior Java Engineer", "Java, Spring Boot, Microservices, Docker, Kubernetes, MySQL",
                    7, "M.S. Computer Science - Stanford", "https://example.com/resumes/sarah_jenkins.pdf",
                    "Expert Java backend architect with extensive experience in cloud-native microservices.", "IN_PIPELINE"
                ),
                new Candidate(
                    "Alex Chen", "alex.chen@example.com", "+1 555-0102", "Seattle, WA",
                    "Frontend React Developer", "React, TypeScript, Vite, Tailwind CSS, Redux, GraphQL",
                    5, "B.S. Software Engineering - UW", "https://example.com/resumes/alex_chen.pdf",
                    "Passionate frontend craftsman building responsive enterprise UI dashboards.", "IN_PIPELINE"
                ),
                new Candidate(
                    "Marcus Vance", "marcus.vance@example.com", "+1 555-0103", "Austin, TX",
                    "Data Scientist & AI Specialist", "Python, PyTorch, TensorFlow, SQL, Spark, Machine Learning",
                    6, "Ph.D. Machine Learning - UT Austin", "https://example.com/resumes/marcus_vance.pdf",
                    "Specialized in predictive analytics and talent matching machine learning models.", "IN_PIPELINE"
                ),
                new Candidate(
                    "Elena Rostova", "elena.rostova@example.com", "+1 555-0104", "New York, NY",
                    "DevOps & Infrastructure Lead", "AWS, Terraform, Kubernetes, Jenkins, CI/CD, Ansible",
                    8, "B.S. Computer Engineering - MIT", "https://example.com/resumes/elena_rostova.pdf",
                    "SRE and DevOps veteran optimizing enterprise cloud deployment pipelines.", "IN_PIPELINE"
                ),
                new Candidate(
                    "David Miller", "david.miller@example.com", "+1 555-0105", "Chicago, IL",
                    "Full Stack Java Developer", "Java, Spring, React, PostgreSQL, Docker, Kafka",
                    4, "B.S. Computer Science - UIUC", "https://example.com/resumes/david_miller.pdf",
                    "Versatile engineer adept at building end-to-end web applications.", "IN_PIPELINE"
                ),
                new Candidate(
                    "Priya Sharma", "priya.sharma@example.com", "+1 555-0106", "San Jose, CA",
                    "Cloud Security Engineer", "Cybersecurity, OAuth2, JWT, Network Security, AWS Security",
                    6, "M.S. Cybersecurity - Carnegie Mellon", "https://example.com/resumes/priya_sharma.pdf",
                    "Security practitioner ensuring zero-trust compliance for enterprise platforms.", "ACTIVE"
                ),
                new Candidate(
                    "James Wilson", "james.wilson@example.com", "+1 555-0107", "Denver, CO",
                    "QA Test Automation Architect", "Selenium, Cypress, JUnit, Postman, Performance Testing",
                    5, "B.S. Information Systems - CU Boulder", "https://example.com/resumes/james_wilson.pdf",
                    "Quality assurance leader committed to automated test pipelines.", "ACTIVE"
                ),
                new Candidate(
                    "Hannah Taylor", "hannah.taylor@example.com", "+1 555-0108", "Boston, MA",
                    "Product Manager - HR Tech", "Agile, Scrum, Product Strategy, User Research, Jira",
                    7, "MBA - Harvard Business School", "https://example.com/resumes/hannah_taylor.pdf",
                    "Strategic product manager driving HR technology transformation.", "ACTIVE"
                ),
                new Candidate(
                    "Michael Ross", "michael.ross@example.com", "+1 555-0109", "Atlanta, GA",
                    "Backend Systems Engineer", "Java 21, Spring Cloud, Kafka, Cassandra, Redis",
                    9, "B.S. Computer Science - Georgia Tech", "https://example.com/resumes/michael_ross.pdf",
                    "High-throughput distributed systems engineer.", "HIRED"
                ),
                new Candidate(
                    "Sophia Martinez", "sophia.martinez@example.com", "+1 555-0110", "Miami, FL",
                    "UI/UX Product Designer", "Figma, Design Systems, User Testing, Prototyping, CSS",
                    4, "B.A. Graphic Design - RISD", "https://example.com/resumes/sophia_martinez.pdf",
                    "Creative UI/UX designer focused on enterprise user satisfaction.", "REJECTED"
                ),
                new Candidate(
                    "Candidate Portal User", "candidate.portal@test.com", "+1 555-0199", "San Francisco, CA",
                    "Senior Full Stack Engineer", "Java, Spring Boot, React, Microservices, SQL, Docker",
                    4, "B.Tech Computer Science", "https://example.com/resumes/candidate_portal.pdf",
                    "Proactive full stack engineer passionate about enterprise applications.", "ACTIVE"
                )
            ));
        }
    }
}
