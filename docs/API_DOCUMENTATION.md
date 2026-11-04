# OpenAPI / Swagger REST API Specification

All microservice APIs are exposed through the Spring Cloud API Gateway entry point at `http://localhost:8080`.

---

## 1. Authentication Service (`/api/auth/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/auth/login` | `POST` | Public | `{ email, password }` | 200 OK / 401 | Authenticate credentials and return signed JWT Bearer token |
| `/api/auth/register` | `POST` | Public | `{ name, email, password, role, department }` | 201 Created / 400 | Register new system user |
| `/api/auth/validate` | `GET` | Public | `?token=...` | 200 OK / 400 | Validate active JWT token signature and expiry |
| `/api/auth/users` | `GET` | Bearer JWT | None | 200 OK / 401 | List all registered system users (RBAC governance) |
| `/api/auth/users/{id}` | `GET` | Bearer JWT | None | 200 OK / 404 | Get user details by user ID |

---

## 2. Candidate Service (`/api/candidates/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/candidates` | `POST` | Bearer JWT | Candidate profile JSON | 201 Created / 400 | Create candidate dossier record |
| `/api/candidates` | `GET` | Bearer JWT | `?search=...&status=...` | 200 OK | Search, filter, and list candidate profiles |
| `/api/candidates/{id}` | `GET` | Bearer JWT | None | 200 OK / 404 | Retrieve candidate dossier by ID |
| `/api/candidates/{id}` | `PUT` | Bearer JWT | Updated candidate JSON | 200 OK / 404 | Update candidate profile details & resume |
| `/api/candidates/{id}/status` | `PATCH` | Bearer JWT | `{ status }` | 200 OK / 404 | Update candidate operational status |
| `/api/candidates/{id}` | `DELETE` | Bearer JWT | None | 204 No Content | Delete candidate record |

---

## 3. Job Requisition Service (`/api/jobs/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/jobs` | `POST` | Bearer JWT | Job requisition JSON | 201 Created / 400 | Create and publish job requisition |
| `/api/jobs` | `GET` | Bearer JWT | `?search=...&department=...&workMode=...` | 200 OK | Search and filter job requisitions |
| `/api/jobs/{id}` | `GET` | Bearer JWT | None | 200 OK / 404 | Get detailed requisition specifications |
| `/api/jobs/{id}` | `PUT` | Bearer JWT | Updated job JSON | 200 OK / 404 | Update requisition specifications |
| `/api/jobs/{id}/status` | `PATCH` | Bearer JWT | `{ status }` | 200 OK / 404 | Change requisition status (`OPEN`, `CLOSED`, `DRAFT`) |
| `/api/jobs/{id}` | `DELETE` | Bearer JWT | None | 204 No Content | Remove job requisition |

---

## 4. Application Service (`/api/applications/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/applications` | `POST` | Bearer JWT | `{ candidateId, jobId, coverLetter, ... }` | 201 / 400 / 404 / 409 | Submit job application (with duplicate check) |
| `/api/applications` | `GET` | Bearer JWT | `?status=...` | 200 OK | Retrieve all job applications |
| `/api/applications/{id}` | `GET` | Bearer JWT | None | 200 OK / 404 | Get application details by ID |
| `/api/applications/candidate/{id}` | `GET` | Bearer JWT | None | 200 OK | Get all applications submitted by candidate |
| `/api/applications/job/{id}` | `GET` | Bearer JWT | None | 200 OK | Get all applications for a specific job requisition |
| `/api/applications/{id}/status` | `PATCH` | Bearer JWT | `{ status }` | 200 OK / 404 | Synchronize application stage status |

### Application Error Contract:
- **Duplicate Application**: Returns HTTP `409 Conflict`:
  ```json
  { "message": "Candidate has already applied for this job" }
  ```
- **Validation Errors**: Returns HTTP `400 Bad Request`:
  ```json
  { "message": "Candidate ID is required" }
  ```
- **Entity Not Found**: Returns HTTP `404 Not Found`:
  ```json
  { "message": "Candidate not found with ID: 99999" }
  ```

---

## 5. Recruitment Pipeline Service (`/api/pipeline/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/pipeline` | `POST` | Bearer JWT | Pipeline initialization JSON | 201 Created / 400 | Initialize pipeline entry at stage `APPLIED` |
| `/api/pipeline` | `GET` | Bearer JWT | `?stage=...` | 200 OK | List all active pipeline entries |
| `/api/pipeline/{id}/move` | `POST` | Bearer JWT | `{ toStage, forceMove, comments, movedByName }` | 200 OK / 400 | Execute stage transition with validation & audit log |
| `/api/pipeline/{id}/history` | `GET` | Bearer JWT | None | 200 OK / 404 | Retrieve immutable stage transition audit history |
| `/api/pipeline/kanban` | `GET` | Bearer JWT | `?jobId=...` | 200 OK | Retrieve candidates grouped by 7 Kanban stages |
| `/api/pipeline/application/{appId}`| `GET` | Bearer JWT | None | 200 OK / 404 | Lookup pipeline entry by application ID |

---

## 6. Interview Evaluation Service (`/api/interviews/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/interviews` | `POST` | Bearer JWT | Session schedule JSON | 201 Created / 400 | Schedule interview & sync pipeline to `INTERVIEW` |
| `/api/interviews` | `GET` | Bearer JWT | `?status=...` | 200 OK | List scheduled interview sessions |
| `/api/interviews/{id}` | `GET` | Bearer JWT | None | 200 OK / 404 | Get interview details by ID |
| `/api/interviews/{id}/feedback` | `PUT` | Bearer JWT | Scorecard evaluation payload | 200 OK / 400 | Record 6-competency ratings & recommendation |
| `/api/interviews/{id}/cancel` | `PUT` | Bearer JWT | None | 200 OK / 404 | Cancel interview session |

### Competency Evaluation Payload:
```json
{
  "rating": 5,
  "overallRating": 4.8,
  "recommendation": "STRONG_HIRE",
  "strengths": "Outstanding system design and microservice patterns.",
  "weaknesses": "Could articulate cloud scaling trade-offs more deeply.",
  "detailedFeedback": "Candidate demonstrated deep domain expertise.",
  "status": "COMPLETED"
}
```

---

## 7. Notification Service (`/api/notifications/**`)

| Endpoint | Method | Security | Request Body / Parameters | Response Status | Description |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/notifications` | `GET` | Bearer JWT | None | 200 OK | Retrieve real-time platform event feed |
| `/api/notifications/{id}/read` | `PUT` | Bearer JWT | None | 200 OK / 404 | Mark specific notification as read |
