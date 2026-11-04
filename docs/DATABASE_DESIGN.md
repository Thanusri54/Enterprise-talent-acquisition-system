# Database Schema Design

The TalentFlow microservice platform strictly enforces database isolation per microservice domain. Each service encapsulates its domain logic and connects to its dedicated database instance with zero cross-service table joins.

---

## 1. `auth-service` Schema (`users`)

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- BCrypt hashed
    role VARCHAR(50) NOT NULL,       -- ADMIN, HR_MANAGER, RECRUITER, INTERVIEWER, CANDIDATE
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. `candidate-service` Schema (`candidates`)

```sql
CREATE TABLE candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    location VARCHAR(255),
    title VARCHAR(255),
    skills TEXT,
    experience_years INT,
    education VARCHAR(255),
    resume_url VARCHAR(500),
    summary TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, SHORTLISTED, INTERVIEW, SELECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 3. `job-service` Schema (`jobs`)

```sql
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    required_skills TEXT,
    preferred_skills TEXT,
    min_experience INT DEFAULT 0,
    max_experience INT DEFAULT 10,
    min_salary VARCHAR(50),
    max_salary VARCHAR(50),
    location VARCHAR(255),
    work_mode VARCHAR(50) DEFAULT 'Hybrid', -- On-site, Hybrid, Remote
    employment_type VARCHAR(50) DEFAULT 'Full Time',
    openings INT DEFAULT 1,
    description TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- DRAFT, OPEN, CLOSED
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 4. `application-service` Schema (`job_applications`)

```sql
CREATE TABLE job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    job_id BIGINT NOT NULL,
    job_title VARCHAR(255),
    department VARCHAR(255),
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, SCREENING, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, ON_HOLD
    recruiter_id BIGINT,
    recruiter_name VARCHAR(255),
    cover_letter TEXT,
    match_score INT DEFAULT 85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (candidate_id, job_id) -- Enforces 409 Conflict on duplicates
);
```

---

## 5. `pipeline-service` Schema (`candidate_pipelines`, `pipeline_history`)

```sql
CREATE TABLE candidate_pipelines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    candidate_id BIGINT NOT NULL,
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    skills TEXT,
    experience_years INT,
    job_id BIGINT NOT NULL,
    job_title VARCHAR(255),
    current_stage VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    assigned_recruiter_name VARCHAR(255),
    match_score INT DEFAULT 88,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pipeline_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pipeline_id BIGINT NOT NULL,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    moved_by_name VARCHAR(255) DEFAULT 'System',
    comments TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pipeline FOREIGN KEY (pipeline_id) REFERENCES candidate_pipelines(id) ON DELETE CASCADE
);
```

---

## 6. `interview-service` Schema (`interviews`)

```sql
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    job_id BIGINT NOT NULL,
    job_title VARCHAR(255),
    interviewer_id BIGINT NOT NULL,
    interviewer_name VARCHAR(255),
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    interview_type VARCHAR(100) DEFAULT 'Technical Round',
    meeting_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    rating INT,
    overall_rating DOUBLE,
    recommendation VARCHAR(50), -- STRONG_HIRE, HIRE, HOLD, NO_HIRE
    strengths TEXT,
    weaknesses TEXT,
    detailed_feedback TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. `notification-service` Schema (`notifications`)

```sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- STAGE_CHANGE, INTERVIEW_SCHEDULED, OFFER_EXTENDED
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
