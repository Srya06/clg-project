# Backend Finalization: Reaching 100%

The goal is to resolve architectural inconsistencies, remove legacy stubs, and ensure all services (Reminders, Scoring, Analytics) work together seamlessly on a unified data model.

## User Review Required

> [!IMPORTANT]
> **Architecture Decision**: I am moving Roadmap storage from the `User` document to a dedicated `Roadmap` collection. This allows for better tracking of tasks, status transitions (pending/in-progress/completed), and enables the automated reminder system to function correctly.

> [!WARNING]
> **Legacy Removal**: `Evaluation` and `StudentProfile` models will be deleted as their properties have been merged into the `User` model for simpler querying.

## Proposed Changes

### Roadmap & Progress Integration

#### [MODIFY] [generateRoadmapController.js](file:///E:/surya/Code_D-B/src/controllers/student/generateRoadmapController.js)
- Update to save generated roadmaps in the `Roadmap` collection.
- Link the `Roadmap` document to the `studentId`.

#### [MODIFY] [updateProgressController.js](file:///E:/surya/Code_D-B/src/controllers/student/updateProgressController.js)
- Ensure it updates `Roadmap.tasks` and `Progress` document correctly.

#### [NEW] [getRoadmapController.js](file:///E:/surya/Code_D-B/src/controllers/student/getRoadmapController.js)
- Implement fetching the current active roadmap for the student.

---

### Cleanup & Refinement

#### [DELETE] [Evaluation.js](file:///E:/surya/Code_D-B/src/models/Evaluation.js)
#### [DELETE] [StudentProfile.js](file:///E:/surya/Code_D-B/src/models/StudentProfile.js)
- Remove unused models to keep the schema clean at 100%.

#### [MODIFY] [reminderService.js](file:///E:/surya/Code_D-B/src/services/notifications/reminderService.js)
- Audit log extraction to ensure it uses `User.updatedAt` or `User.lastGithubSync` correctly for inactivity check.

---

### Demo Readiness

#### [NEW] [seed.js](file:///E:/surya/Code_D-B/src/scripts/seed.js)
- A script to populate the database with several students, HODs, completed/in-progress roadmaps, and scores.

## Open Questions

1. Should I automatically delete the old roadmap when a student generates a new one, or should I archive it? (Current plan: create a new one, archive/delete old one).

## Verification Plan

### Automated Tests
- Run `node src/scripts/seed.js` to ensure the data model works.
- Verify `GET /api/v1/student/score` returns valid scores after seeding.

### Manual Verification
- Test `POST /api/v1/student/roadmap/generate` and check the `Roadmap` collection in MongoDB.
- Test `PUT /api/v1/student/progress` to see the percentage update.
