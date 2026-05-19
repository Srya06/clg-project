# 🚀 Code-D-B: Full-Stack Integration Audit Guide (42/42)

This document provides a comprehensive checklist for manually testing every single endpoint in the backend system.

## 🛠️ Global Setup
1. **Base URL**: `http://localhost:5000/api/v1`
2. **Swagger Docs**: `http://localhost:5000/api-docs`
3. **Authorization**: Most endpoints (Student/HOD) require a **Bearer Token**. 
   - Get the token from `POST /auth/login`.
   - Click "Authorize" in Swagger and paste it.

---

## 📅 Recommended Testing Sequence

### PHASE 1: Authentication (7 Endpoints)
| # | Endpoint | Method | Purpose | Required Body |
|---|---|---|---|---|
| 1 | `/auth/register` | POST | Create Student/HOD | `{ email, password, firstName, lastName, role, branch, year }` |
| 2 | `/auth/login` | POST | Get Access Token | `{ email, password }` |
| 3 | `/auth/refresh` | POST | Rotate Tokens | `{ refreshToken }` |
| 4 | `/auth/forgot-password` | POST | Request Reset | `{ email }` |
| 5 | `/auth/reset-password/:token` | POST | Set New Password | `{ password }` |
| 6 | `/auth/update-password` | PATCH | Change while logged in | `{ oldPassword, newPassword }` |
| 7 | `/auth/logout` | POST | End Session | None |

### PHASE 2: Student Profile & Setup (5 Endpoints)
| # | Endpoint | Method | Purpose | Notes |
|---|---|---|---|---|
| 8 | `/student/profile` | GET | Fetch own data | Checks if branch/year saved |
| 9 | `/student/profile` | PUT | Update Professional Info | Add `leetcodeUsername`, `linkedinUrl`, `careerGoal` |
| 10| `/student/resume` | POST | Upload PDF Resume | Use `multipart/form-data` |
| 11| `/student/resume/analyze` | GET | Extract skills | Uses local parsing logic |
| 12| `/student/score` | GET | Live Platform Score | Calculates grade (A-F) |

### PHASE 3: AI Intelligence Engine (4 Endpoints)
| # | Endpoint | Method | Purpose | Required Body |
|---|---|---|---|---|
| 13| `/ai/chat` | POST | Mentorship Chat | `{ message: "Help me with React" }` |
| 14| `/ai/generate-roadmap` | POST | AI Logic Trigger | `{ goal, currentSkills }` |
| 15| `/ai/analyze-resume` | POST | AI Resume Parsing | `{ text }` |
| 16| `/ai/recommend` | GET | Skill Suggestions | Query: `?skills=javascript` |

### PHASE 4: Roadmap & Progress (4 Endpoints)
| # | Endpoint | Method | Purpose | Required Body |
|---|---|---|---|---|
| 17| `/student/roadmap` | GET | View Active Plan | Returns 4-week structure |
| 18| `/student/roadmap/generate`| POST | User Trigger for AI | `{ goal: "DevOps Engineer" }` |
| 19| `/student/progress` | GET | History | List of all completed tasks |
| 20| `/student/progress` | PUT | Mark Task | `{ roadmapId, taskId, isCompleted: true }` |

### PHASE 5: Integrations & Resources (6 Endpoints)
| # | Endpoint | Method | Purpose | Notes |
|---|---|---|---|---|
| 21| `/integrations/github/connect`| GET | OAuth Start | Browser Redirect |
| 22| `/integrations/github/callback`| GET | OAuth Finalize | Handled by GitHub |
| 23| `/integrations/status` | GET | Connection List | Shows connected usernames |
| 24| `/integrations/github/sync` | POST | Pull Commit Data | Updates platform score |
| 25| `/integrations/leetcode/sync` | POST | Pull Problem Stats | Updates platform score |
| 26| `/integrations/resources` | GET | Learning Links | Fallback if AI is offline |

### PHASE 6: Notifications & Announcements (5 Endpoints)
| # | Endpoint | Method | Purpose | Required Body |
|---|---|---|---|---|
| 27| `/notifications` | GET | List Alerts | Notifications for this user |
| 28| `/notifications/mark-all` | PUT | Clear All | Sets all to read |
| 29| `/notifications/:id` | PUT | Mark Single | Sets specific alert to read |
| 30| `/student/announcements` | GET | HOD Broadcasts | Filtered by branch/year |
| 31| `/student/announcements/:id/respond` | POST | Acknowledge | `{ response: "Coming!" }` |

### PHASE 7: HOD Monitoring & Analytics (10 Endpoints)
| # | Endpoint | Method | Purpose | Role Required |
|---|---|---|---|---|
| 32| `/hod/students` | GET | Student Directory | HOD/Admin |
| 33| `/hod/students/:id` | GET | Deep Dive Profile | HOD/Admin |
| 34| `/hod/rankings` | GET | Leaderboard | Global rankings |
| 35| `/hod/alerts` | GET | At-Risk Students | Flags low performers |
| 36| `/hod/analytics` | GET | Dept aggregates | Grade distributions |
| 37| `/hod/top-performers` | GET | Elite List | Grade A students |
| 38| `/hod/low-performers` | GET | Support List | Grade D/F students |
| 39| `/hod/announcements` | POST | Create Broadcast | `{ title, body, targetBranch }` |
| 40| `/hod/announcements` | GET | Audit History | View past broadcasts |
| 41| `/hod/announcements/:id` | DELETE| Archive | Removes announcement |

### PHASE 8: Health & System (1 Endpoint)
| # | Endpoint | Method | Purpose |
|---|---|---|---|
| 42| `/health` | GET | Check Status | Verifies API & DB connection |

---

## 🛡️ Sample Payload for Complex Tests

### 1. Register a Student
```json
{
  "firstName": "Surya",
  "lastName": "Kumar",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "branch": "Computer Science",
  "year": 3
}
```

### 2. Create HOD Announcement
```json
{
  "title": "Semester Final Projects",
  "body": "Please submit your GitHub links by Friday.",
  "priority": "high",
  "targetBranch": "Computer Science",
  "notifyByEmail": true
}
```

### 3. AI Roadmap Goal
```json
{
  "goal": "Cloud Architect (AWS/Azure)"
}
```