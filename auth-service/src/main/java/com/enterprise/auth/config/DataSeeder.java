package com.enterprise.auth.config;

import com.enterprise.auth.dto.RegisterRequest;
import com.enterprise.auth.entity.Role;
import com.enterprise.auth.repository.UserRepository;
import com.enterprise.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            authService.register(new RegisterRequest(
                    "System Admin",
                    "admin@company.com",
                    "password123",
                    Role.ADMIN,
                    "Executive"
            ));

            authService.register(new RegisterRequest(
                    "HR Manager",
                    "hr@company.com",
                    "password123",
                    Role.HR_MANAGER,
                    "Human Resources"
            ));

            authService.register(new RegisterRequest(
                    "Lead Recruiter",
                    "recruiter@company.com",
                    "password123",
                    Role.RECRUITER,
                    "Talent Acquisition"
            ));

            authService.register(new RegisterRequest(
                    "Senior Tech Lead",
                    "interviewer@company.com",
                    "password123",
                    Role.INTERVIEWER,
                    "Engineering"
            ));

            authService.register(new RegisterRequest(
                    "Candidate Portal User",
                    "candidate.portal@test.com",
                    "password123",
                    Role.CANDIDATE,
                    "Software Engineering"
            ));
        }
    }
}
