package com.enterprise.interview.config;

import com.enterprise.interview.entity.Interview;
import com.enterprise.interview.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private InterviewRepository interviewRepository;

    @Override
    public void run(String... args) throws Exception {
        if (interviewRepository.count() == 0) {
            Interview i1 = new Interview(
                    1L, 1L, "Sarah Jenkins",
                    1L, "Senior Java Developer", 4L, "Senior Tech Lead",
                    LocalDateTime.now().plusDays(2).withHour(14).withMinute(0), 60,
                    "HR", "https://meet.company.com/hr-sarah-jenkins", "SCHEDULED"
            );

            Interview i2 = new Interview(
                    2L, 2L, "Alex Chen",
                    2L, "Frontend React Developer", 4L, "Senior Tech Lead",
                    LocalDateTime.now().plusDays(1).withHour(10).withMinute(30), 60,
                    "TECHNICAL", "https://meet.company.com/tech-alex-chen", "SCHEDULED"
            );

            Interview i3 = new Interview(
                    4L, 4L, "Elena Rostova",
                    4L, "DevOps Infrastructure Engineer", 4L, "Senior Tech Lead",
                    LocalDateTime.now().minusDays(3), 60,
                    "TECHNICAL", "https://meet.company.com/tech-elena", "COMPLETED"
            );
            i3.setFeedback("Exceptional cloud deployment architecture knowledge. Strong recommendation for hire.");
            i3.setRating(5);

            interviewRepository.saveAll(List.of(i1, i2, i3));
        }
    }
}
