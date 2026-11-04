# Problem Analysis & Requirement Specification

## 1. Problem Statement

Traditional enterprise hiring and candidate pipeline management systems rely on monolithic, tightly coupled architectures. As talent acquisition scales across diverse departments, high-volume candidate resume screening, scheduling, and stage transitions create serious bottlenecks:

- **Monolithic Performance Bottlenecks**: High traffic on resume uploads or notification spikes slow down candidate processing across the entire platform.
- **Tight Coupling & High Blast Radius**: A fault or deployment issue in the interview scheduling or notification module can bring down candidate registration and application tracking.
- **Lack of Microservices Isolation**: Candidate screening, requisition tracking, and security authorization share single database instances without domain boundary isolation.

## 2. Proposed System (Microservices SOA Solution)

The **Enterprise Talent Acquisition and Candidate Pipeline Orchestration Engine** restructures the recruitment lifecycle into decoupled microservices communicating through a centralized API Gateway and Service Discovery Registry:

1. **Service Discovery (`EUREKA-SERVER`)**: Dynamic registration and heartbeat monitoring of all microservice instances.
2. **API Gateway (`API-GATEWAY`)**: Unified entry point handling CORS, route redirection, and stateless JWT token authentication filtering.
3. **Authentication (`AUTH-SERVICE`)**: User authentication, BCrypt password hashing, and role-based access control (ADMIN, HR_MANAGER, RECRUITER, INTERVIEWER).
4. **Candidate Management (`CANDIDATE-SERVICE`)**: Candidate profile CRUD, skills index, experience tracking, and resume metadata.
5. **Job Requisitions (`JOB-SERVICE`)**: Requisition specs, department categorizations, required skill sets, and status lifecycle.
6. **Applications (`APPLICATION-SERVICE`)**: Candidate-to-job pairing, application date tracking, and recruiter assignment.
7. **Pipeline Orchestration (`PIPELINE-SERVICE`)**: 9-stage Kanban recruitment workflow validator and historical movement audit logger.
8. **Interview Scheduling (`INTERVIEW-SERVICE`)**: Interview calendar scheduling, virtual meeting room generation, and 5-star rating feedback.
9. **In-App Notifications (`NOTIFICATION-SERVICE`)**: Asynchronous recruitment activity feeds and status alerts.

## 3. Functional Requirements

- **FR-1**: User authentication via JWT with BCrypt password encryption.
- **FR-2**: Role-based access control (ADMIN, HR_MANAGER, RECRUITER, INTERVIEWER).
- **FR-3**: Candidate directory creation, updating, searching, and resume tracking.
- **FR-4**: Job requisition posting, department classification, and skill matching.
- **FR-5**: Candidate job application creation and match score calculation.
- **FR-6**: 9-Stage Recruitment Pipeline movement validation:
  `APPLIED` -> `RESUME_SCREENING` -> `SHORTLISTED` -> `HR_INTERVIEW` -> `TECHNICAL_INTERVIEW` -> `MANAGERIAL_INTERVIEW` -> `OFFER` -> `HIRED` / `REJECTED`.
- **FR-7**: Historical audit trail recording every stage change, timestamp, comments, and recruiter ID.
- **FR-8**: Interview scheduling, meeting link generation, status tracking, and structured evaluation feedback.
- **FR-9**: Real-time in-app notification feed.

## 4. Non-Functional Requirements

- **Security**: Stateless JWT verification at API Gateway; BCrypt salted password hashing.
- **Scalability**: Horizontal scalability of individual microservice instances via Eureka Service Discovery load balancing.
- **Maintainability**: Independent database schemas per service preventing tight schema coupling.
- **Fault Tolerance**: Circuit isolation; failures in Notification Service do not block Candidate or Application registration.
- **Modularity**: Domain-driven design (DDD) separation of candidate, job, application, pipeline, interview, and auth contexts.
