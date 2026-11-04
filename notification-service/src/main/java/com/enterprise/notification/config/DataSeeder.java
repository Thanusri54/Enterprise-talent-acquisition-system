package com.enterprise.notification.config;

import com.enterprise.notification.entity.Notification;
import com.enterprise.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (notificationRepository.count() == 0) {
            notificationRepository.saveAll(List.of(
                new Notification(
                    3L, "recruiter@company.com",
                    "Candidate Pipeline Update: Sarah Jenkins",
                    "Sarah Jenkins moved to HR_INTERVIEW stage for Senior Java Developer.",
                    "STAGE_CHANGE"
                ),
                new Notification(
                    4L, "interviewer@company.com",
                    "Technical Interview Scheduled",
                    "Technical interview scheduled with Alex Chen for Frontend React Developer on tomorrow at 10:30 AM.",
                    "INTERVIEW_SCHEDULED"
                ),
                new Notification(
                    2L, "hr@company.com",
                    "Offer Extended: Elena Rostova",
                    "Formal offer extended to Elena Rostova for DevOps Infrastructure Engineer position.",
                    "OFFER_EXTENDED"
                ),
                new Notification(
                    3L, "recruiter@company.com",
                    "New Candidate Application",
                    "David Miller applied for Senior Java Developer position.",
                    "APPLICATION_RECEIVED"
                )
            ));
        }
    }
}
