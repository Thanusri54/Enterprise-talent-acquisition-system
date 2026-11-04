# TalentFlow — Postman API Test Suite & Integration Guide

Welcome to the automated Postman API test suite for **TalentFlow — Enterprise Talent Acquisition and Candidate Pipeline Orchestration Engine**.

This directory contains everything required to test, audit, and demonstrate all backend microservices, role-based access control (RBAC), and end-to-end recruitment pipelines through the **Spring Cloud API Gateway** (`http://localhost:8080`).

---

## 1. Directory Files

| File | Format | Description |
| :--- | :--- | :--- |
| **`TalentFlow-API-Collection.json`** | Postman Collection v2.1.0 | 8 organized folders containing positive workflows, automated JWT token handling, dynamic ID chaining, boundary validations, and security test assertions. |
| **`TalentFlow-Environment.json`** | Postman Environment v2.1.0 | Standard variable environment containing `baseUrl`, tokens, IDs, and GitHub-safe default mock credentials without sensitive secrets. |
| **`README.md`** | Markdown | Step-by-step setup, execution ordering, architecture topology, and HTTP response code reference. |

---

## 2. Microservice Architecture & Port Reference

All requests in the Postman collection target the **Spring Cloud API Gateway** on port **8080**, which dynamically routes requests via Netflix Eureka Service Discovery to the respective microservices:

```
                                  +------------------------------------+
                                  |    Postman Collection / Runner     |
                                  +-----------------+------------------+
                                                    | HTTP / REST + Bearer JWT
                                                    v
                                  +------------------------------------+
                                  |      Spring Cloud API Gateway      |
                                  |     (Port 8080 / JWT & RBAC)       |
                                  +-----------------+------------------+
                                                    |
                                                    v Service Discovery
                                  +------------------------------------+
                                  |       Netflix Eureka Registry      |
                                  |      (EUREKA-SERVER Port 8761)     |
                                  +-----------------+------------------+
                                                    |
     +-------------------+-------------------+------+------------+-------------------+-------------------+
     |                   |                   |                   |                   |                   |
     v                   v                   v                   v                   v                   v
+----------+       +-----------+       +-----------+       +-----------+       +-----------+       +-----------+
|   AUTH   |       | CANDIDATE |       |    JOB    |       |APPLICATION|       | PIPELINE  |       | INTERVIEW |
| SERVICE  |       |  SERVICE  |       |  SERVICE  |       |  SERVICE  |       |  SERVICE  |       |  SERVICE  |
|  (8081)  |       |  (8082)   |       |  (8083)   |       |  (8084)   |       |  (8085)   |       |  (8086)   |
+----------+       +-----------+       +-----------+       +-----------+       +-----------+       +-----------+
```

| Microservice | Internal Port | Gateway Route Prefix | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Eureka Registry** | `8761` | Direct dashboard: `http://localhost:8761` | Dynamic service registration & heartbeats |
| **API Gateway** | `8080` | Entry point for all `/api/**` calls | JWT validation, RBAC enforcement, Reverse proxy |
| **Auth Service** | `8081` | `/api/auth/**` | Registration, BCrypt verification, JWT token issuance |
| **Candidate Service** | `8082` | `/api/candidates/**` | Candidate talent profiles, resumes, skill matching |
| **Job Service** | `8083` | `/api/jobs/**` | Job requisitions, salary bands, descriptions |
| **Application Service** | `8084` | `/api/applications/**` | Job application submissions, 409 duplicate conflict checks |
| **Pipeline Service** | `8085` | `/api/pipeline/**` | 7-stage state machine (`APPLIED` -> `SELECTED`) |
| **Interview Service** | `8086` | `/api/interviews/**` | Technical interview scheduling & 6-dimension scorecards |
| **Notification Service** | `8087` | `/api/notifications/**` | Event notification alerts and feeds |

---

## 3. How to Import and Configure Postman

### Step 1: Import Files
1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop (or select) both:
   - `postman/TalentFlow-API-Collection.json`
   - `postman/TalentFlow-Environment.json`
4. Confirm the import.

### Step 2: Select the Active Environment
1. In the top-right environment dropdown, select **TalentFlow Environment**.
2. Verify the initial variables:
   - `baseUrl`: `http://localhost:8080`
   - `defaultPassword`: `password123`
   - Token variables (`authToken`, `recruiterToken`, `candidateToken`, etc.) start blank and are dynamically populated during login.

---

## 4. Automated Token Management & ID Chaining

The collection uses Postman **Tests Scripts** (`pm.test` and `pm.environment.set`) to automate end-to-end chaining:

1. **Token Persistence**:
   - Running any Login request (e.g. `Login - Recruiter`, `Login - Candidate`, `Login - HR Manager`) automatically parses the response JWT and stores it in both `{{authToken}}` and the role-specific variable (`{{recruiterToken}}`, `{{candidateToken}}`, `{{hrToken}}`, etc.).
2. **Dynamic ID Chaining**:
   - `Create Candidate Profile` -> saves `{{candidateId}}`.
   - `Get All Jobs` / `Create Job Requisition` -> saves `{{jobId}}`.
   - `Submit Candidate Application` -> saves `{{applicationId}}`.
   - `Initialize Pipeline Entry` -> saves `{{pipelineId}}`.
   - `Schedule Technical Interview` -> saves `{{interviewId}}`.
3. Subsequent requests automatically reuse these variables without any manual copying or pasting.

---

## 5. Recommended Execution Order

To run the complete collection from end-to-end, follow this sequence:

```
1. Authentication
   ├── Register New User (Candidate)
   ├── Login - Recruiter (captures recruiterToken)
   ├── Login - Candidate (captures candidateToken)
   ├── Login - Interviewer (captures interviewerToken)
   ├── Login - HR Manager (captures hrToken)
   ├── Login - Admin (captures adminToken)
   └── Validate Token
   
2. Candidates
   ├── Get All Candidates
   ├── Create Candidate Profile (captures candidateId)
   ├── Get Candidate Profile By ID
   ├── Search Candidates by Query / Skill
   └── Update Candidate Profile

3. Jobs
   ├── Get All Jobs (captures jobId)
   ├── Get Job By ID
   ├── Get Active Jobs (Status = OPEN)
   └── Create Job Requisition (Recruiter)

4. Applications
   ├── Submit Candidate Application (captures applicationId)
   ├── Get Application By ID
   ├── Get Candidate Applications By Candidate ID
   ├── Negative: Duplicate Application Rejection (HTTP 409 CONFLICT)
   ├── Negative: Missing Candidate ID (HTTP 400 BAD REQUEST)
   ├── Negative: Missing Job ID (HTTP 400 BAD REQUEST)
   ├── Negative: Invalid Negative Candidate ID (HTTP 400 BAD REQUEST)
   ├── Negative: Invalid Negative Job ID (HTTP 400 BAD REQUEST)
   ├── Negative: Non-Existent Candidate ID (HTTP 404 NOT FOUND)
   └── Negative: Non-Existent Job ID (HTTP 404 NOT FOUND)

5. Recruiter / Pipeline
   ├── Get All Applications (Recruiter)
   ├── Initialize Pipeline Entry (captures pipelineId)
   ├── Get Pipeline Record by Application ID
   ├── Move Pipeline to SCREENING
   ├── Move Pipeline to SHORTLISTED
   ├── Schedule Technical Interview (captures interviewId)
   └── Move Pipeline to INTERVIEW

6. Interviews
   ├── Get All Interviews
   ├── Get Interview By ID
   ├── Get Interview by Application ID
   └── Submit Competency Feedback & Scorecard (Rating 5, STRONG_HIRE, COMPLETED)

7. HR
   ├── Review Application Dossier (HR)
   ├── Select Candidate (Final Decision: SELECTED)
   ├── Synchronize Application Status (SELECTED)
   ├── Put Candidate On Hold (Decision: ON_HOLD)
   └── Reject Candidate (Decision: REJECTED)

8. Authorization / Security Tests
   ├── Security: Request Without JWT (HTTP 401 UNAUTHORIZED)
   ├── Security: Invalid JWT Token (HTTP 401 UNAUTHORIZED)
   ├── Security: Tampered JWT Signature (HTTP 401 UNAUTHORIZED)
   ├── Security: Candidate Accessing Recruiter Pipeline Move (HTTP 403 FORBIDDEN)
   ├── Security: Candidate Accessing Recruiter Kanban (HTTP 403 FORBIDDEN)
   ├── Security: Interviewer Accessing HR User Governance (HTTP 403 FORBIDDEN)
   └── Security: Admin Authorized Access to User Governance (HTTP 200 OK)
```

---

## 6. HTTP Status Code Validation Guide

| Status Code | Scenario in Test Suite | Assertion Detail |
| :--- | :--- | :--- |
| **`200 OK`** | Standard query, profile updates, pipeline stage transitions | Response body contains expected payload or updated entity. |
| **`201 CREATED`** | User registration, job creation, application submission, interview scheduling | Response body returns created entity with newly generated numeric ID. |
| **`400 BAD REQUEST`** | Input validation failures: missing `candidateId` or `jobId`, negative IDs (`-1`), malformed payload | Response returns structured error explaining the validation failure. |
| **`401 UNAUTHORIZED`** | Missing `Authorization` header, invalid JWT signature, expired token | Spring Cloud Gateway rejects request before routing to downstream services. |
| **`403 FORBIDDEN`** | Role-Based Access Control (RBAC) violation: Candidate attempting Recruiter move/Kanban, Interviewer accessing HR user governance | Gateway `JwtAuthenticationFilter` evaluates role claims and denies access. |
| **`404 NOT FOUND`** | Resource lookup with non-existent ID (e.g. `/api/candidates/99999`, `/api/jobs/99999`) | Target microservice returns 404 with resource not found message. |
| **`409 CONFLICT`** | Candidate re-applying for a job requisition they have already applied for | Application Service rejects duplicate submission with message: `"Candidate has already applied for this job"`. |

---

## 7. Running with Postman Collection Runner or Newman

You can execute the entire suite automatically via Postman's built-in **Collection Runner** or using **Newman** (Postman CLI):

```powershell
# Install Newman CLI (if not already installed)
npm install -g newman

# Run the complete test suite against localhost Gateway
newman run "postman/TalentFlow-API-Collection.json" -e "postman/TalentFlow-Environment.json"
```
