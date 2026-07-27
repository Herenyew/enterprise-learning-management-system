# LMS Prisma Schema Gap Review

Reviewed sources:

- Schema: `C:\Users\Hermela\Downloads\Telegram Desktop\database review.prisma`
- BRD: `C:\Users\Hermela\Downloads\DRAFT LMS BRD V02 (2).docx`
- User journeys: `C:\Users\Hermela\Downloads\LMS TEMPLATES & USER JOURNEYS.pdf`

## Executive Summary

The current Prisma schema is strong for the LMS core: companies, employees, roles, courses, course versions, chapters, content, enrollments, progress, quizzes, certificates, programs, live sessions, surveys, TNA, XP, badges, and approval workflows are already represented.

The main gaps are not basic LMS entities. They are the deeper configuration and audit records needed to prove that every BRD requirement is fully represented in a normalized database:

- Reusable templates need child tables for chapters, content, tasks, milestones, questions, and scoring rules.
- Certificate templates need real design/layer/signature-position records, not only a background image and signer list.
- Question types must be database-configurable, not only a Prisma enum.
- Assignment, survey, notification, report, leaderboard, and audit workflows need dedicated transactional tables.
- Program types need default settings and retire/archive metadata.
- TNA needs work-unit, budget/cost-center, requester-entity, and fulfillment traceability fields.

## Requirement Coverage Review

### 1. Course Creation Templates

Requirement:

- Reusable course creation templates must include title, description, level, category, chapters, content items, XP value, and pass threshold.

Current schema:

- `CourseTemplate` exists at `database review.prisma:3051`.
- It stores template-level metadata such as name, category, level, passing score, completion threshold, XP-related flags, and audience.

Gap:

- No normalized child tables for template chapters or template content items.
- No direct reusable structure for "template -> chapter -> content -> quiz/pass rule".

Recommended additions:

- `CourseTemplateChapter`
- `CourseTemplateContentItem`
- `CourseTemplateAssessmentRule`
- Optional `CourseTemplateResource`

Key fields:

- `templateId`, `title`, `displayOrder`, `description`
- `contentTypeId`, `durationMinutes`, `pageCount`, `allowDownload`, `sourceType`, `sourceUrl`
- `xpValue`, `passThreshold`, `isRequired`

### 2. Learning Program Templates

Requirement:

- HR must create, save, and reuse program templates including target audience, start/end dates, task list, milestones, course lists, task sequences, and assessment rules.

Current schema:

- `ProgramTemplate` exists at `database review.prisma:3088`.
- `LearningProgram`, `ProgramCourse`, `ProgramTask`, `ProgramMilestone`, and `ProgramCohort` exist for live programs.

Gap:

- `ProgramTemplate` has no child tables for reusable courses, task sequences, milestones, cohort defaults, approval rules, or assessment rules.
- `LearningProgram` does not show source template/source program clone fields for traceability.

Recommended additions:

- `ProgramTemplateCourse`
- `ProgramTemplateTask`
- `ProgramTemplateMilestone`
- `ProgramTemplateAssessmentRule`
- `ProgramTemplateCohortDefault`

Recommended fields on `LearningProgram`:

- `sourceTemplateId Int?`
- `sourceProgramId Int?`
- `duplicatedFromProgramId Int?`

Recommended fields on `ProgramTemplate`:

- `programTypeId Int?`
- `defaultOwnerEmployeeId String?`
- `defaultCertificateTemplateId Int?`
- `defaultXpMultiplier Decimal?`
- `defaultEnrollmentWorkflowId Int?`
- `defaultCompletionWorkflowId Int?`

### 3. Program Types

Requirement:

- Program types must be configurable/extensible, may have default duration, default certificate template, default XP multiplier, and type-specific approval workflows.
- Retired types must be hidden from new creation while historical data remains.

Current schema:

- `ProgramType` exists at `database review.prisma:1597`.
- It currently has `name`, `description`, and `isActive`.

Gap:

- No default duration, certificate template, XP multiplier, enrollment/completion workflow references, or retirement/archive metadata.

Recommended fields:

- `defaultDurationDays Int?`
- `defaultCertificateTemplateId Int?`
- `defaultXpMultiplier Decimal?`
- `enrollmentWorkflowId Int?`
- `completionWorkflowId Int?`
- `status ProgramTypeStatus @default(ACTIVE)`
- `retiredAt DateTime?`
- `archivedAt DateTime?`
- `createdBy Int?`
- `updatedBy Int?`
- `deletedAt DateTime?`

Recommended enum:

- `ProgramTypeStatus { ACTIVE ARCHIVED RETIRED }`

### 4. Quiz Templates And Attempt-Based Scoring

Requirement:

- Quiz templates must include question bank selection, time limit, attempts, scoring rules, configurable question types, per-attempt scoring, retry rules, and audit history.

Current schema:

- `AssessmentTemplate` exists at `database review.prisma:3125`.
- `Assessment`, `Question`, `QuestionVersion`, `QuestionOption`, `AssessmentAttempt`, and `AssessmentAnswer` exist.

Gap:

- `AssessmentTemplate` has settings only, but no template question set or blueprint rows.
- `Question.questionType` uses Prisma enum `QuestionType` at `database review.prisma:228`, which does not satisfy "other configurable question formats" without code migration.
- Attempt-based scoring is not normalized. `AssessmentAttempt` stores attempt number and score, but the policy itself is not represented as reusable rules.

Recommended additions:

- `QuestionTypeDefinition`
- `CompanyQuestionTypeSetting`
- `AssessmentTemplateBlueprint`
- `AssessmentTemplateQuestion`
- `AssessmentScoringPolicy`
- `AssessmentAttemptEvent`

Recommended fields:

- On `Question`: add `questionTypeDefinitionId Int?`
- On `Assessment`: add `retryRule`, `attemptScoringMode`, `retryPenaltyPercent`, `allowBestScore`, `manualReviewRequired`
- On `AssessmentAttempt`: add `timeSpentSeconds`, `endedReason`, `isFlagged`, `flagReason`, `tabSwitchCount`, `ipAddress`, `userAgent`

### 5. Certificate Template Design

Requirement:

- Certificate templates must support background/border design, dynamic fields, signers, signature assets, stamp/seal, expiry, certificate number, QR verification, PDF storage, preview, clone, archive, delete.

Current schema:

- `CertificateTemplate` and `CertificateTemplateSigner` exist at `database review.prisma:2279` and `database review.prisma:2315`.
- `Certificate` and `CertificateVerification` exist.

Gap:

- `CertificateTemplate` only stores template file/background/seal and pattern.
- No layout/layer/block model for document-designer templates.
- `courseVersionId` and `learningProgramId` are `@unique`, which makes the template less reusable. If one template should serve many courses/programs, this should be an assignment table instead.
- Signers only reference an employee and display order; there is no title override, signature image, signing role, or position.

Recommended additions:

- `CertificateTemplateAssignment`
- `CertificateTemplateLayer`
- `CertificateTemplateField`
- `CertificateTemplateAsset`
- `CertificateTemplateBorder`
- `CertificateGeneratedFile`

Recommended fields:

- On `CertificateTemplateSigner`: `roleLabel`, `titleOverride`, `signatureImageUrl`, `positionX`, `positionY`, `width`, `height`, `isRequired`
- On `Certificate`: `pdfUrl`, `storageProvider`, `issuedByUserId`

### 6. Content Uploads, Google Drive, And Attachments

Requirement:

- Content source must support device upload or Google Drive retrieval.
- Documents/videos must store metadata and attached resources.
- SCORM/xAPI, audio, external links, interactive video, live sessions, assignment, and survey content are configurable.

Current schema:

- `CourseContent`, `ContentFile`, `ContentType`, `LiveSession`, `Survey`, and assessment relations exist.

Gap:

- `ContentFile` is S3-focused and does not represent original source provider cleanly.
- No reusable `FileAsset` table for certificates, uploads, assignments, thumbnails, seals, SCORM packages, and external certificate uploads.
- No interactive-video branch/question table.
- No company-scoped content type settings; `ContentType.isActive` is global.

Recommended additions:

- `FileAsset`
- `CompanyContentTypeSetting`
- `ContentResource`
- `InteractiveVideoNode`
- `InteractiveVideoChoice`
- `ScormPackage`
- `ScormAttempt`
- `XapiStatement`

Recommended fields on `ContentFile`:

- `sourceType ContentSourceType`
- `providerFileId String?`
- `providerUrl String?`
- `importStatus String?`
- `extractedMetadata Json?`

### 7. Assignments And Submissions

Requirement:

- Assignments must support submission type file/text, due date, peer review flag, and available submissions.

Current schema:

- `ProgramTask` and `ProgramTaskSubmission` support program task submissions.

Gap:

- No standalone course-level assignment model for assignments attached to course content or chapters.
- Peer review is a flag, but peer review records are not modeled.

Recommended additions:

- `Assignment`
- `AssignmentSubmission`
- `AssignmentPeerReview`
- `AssignmentRubric`

Key fields:

- `courseContentId`, `programTaskId`, `submissionType`, `dueDate`, `peerReviewEnabled`, `rubric`
- `submittedByEmployeeId`, `textSubmission`, `fileAssetId`, `status`, `score`, `reviewedBy`
- `reviewerEmployeeId`, `revieweeEmployeeId`, `comments`, `score`

### 8. Surveys And Question Sets

Requirement:

- Survey content must support question sets, anonymous flag, creation, results, submissions, and post-course/manager behavior surveys.

Current schema:

- `Survey`, `SurveyQuestion`, `SurveyResponse`, `SurveyAnswer`, and `SurveyTemplate` exist.

Gap:

- `SurveyTemplate` has no template questions.
- No option table for survey multiple-choice/scale questions.
- `SurveyResponse` requires `completionId`, which can block program-level, manager-level, or standalone surveys.
- Anonymous responses still store `employeeId`; this can be acceptable internally, but should be intentionally protected with reporting rules.

Recommended additions:

- `SurveyTemplateQuestion`
- `SurveyTemplateOption`
- `SurveyQuestionOption`
- `SurveyQuestionSet`

Recommended changes:

- Make `SurveyResponse.completionId` optional.
- Add `programEnrollmentId Int?`, `programTaskId Int?`, `recipientEmployeeId String?`, `managerEmployeeId String?`
- Add `anonymizedGroupKey String?` or reporting safeguards.

### 9. Notifications

Requirement:

- Notifications/reminders must cover course assignment, certification, updates, expiry, overdue tasks, and generated certificate emails.
- User journeys mention a `notification_log` table.

Current schema:

- `NotificationTemplate` and `NotificationEvent` exist.

Gap:

- No actual notification delivery/log table.
- No read/unread state for in-app notifications.
- No user notification preferences.
- No scheduled reminders or retry/failure tracking.

Recommended additions:

- `Notification`
- `NotificationDeliveryLog`
- `NotificationPreference`
- `ScheduledNotification`

Key fields:

- `recipientUserId`, `recipientEmployeeId`, `eventId`, `templateId`, `channel`, `title`, `body`, `status`, `readAt`, `sentAt`, `failedAt`, `failureReason`, `entityType`, `entityId`

### 10. Reporting, Exports, And Scheduled Reports

Requirement:

- Reports must include learner progress, course completion/participation, program, quiz, certification, effectiveness, and export PDF/spreadsheet.

Current schema:

- Operational data exists for many report calculations.

Gap:

- No normalized saved report, report schedule, export job, or export file table.

Recommended additions:

- `SavedReport`
- `ReportSchedule`
- `ReportExport`

Key fields:

- `reportType`, `filters Json`, `columns Json`, `createdBy`, `scheduleCron`, `format`, `lastRunAt`, `fileAssetId`, `status`

### 11. Audit And Activity Traceability

Requirement:

- All learning activities and XP transactions must be auditable with timestamp and user ID.
- TNA and approval chains require traceability.

Current schema:

- Some transactional tables have timestamps.
- `EnrollmentActivityLog` exists for enrollment only.
- `XpTransaction` has timestamp but no explicit actor user.

Gap:

- No platform-wide `AuditLog`.
- No actor fields on some transactions.

Recommended additions:

- `AuditLog`

Recommended fields:

- `companyId`, `actorUserId`, `actorEmployeeId`, `action`, `entityType`, `entityId`, `beforeJson`, `afterJson`, `ipAddress`, `userAgent`, `createdAt`

Recommended change:

- Add `createdByUserId Int?` or `awardedByUserId Int?` to `XpTransaction`.

### 12. Leaderboard Configuration

Requirement:

- HR/Admin must configure leaderboard criteria such as XP, completion, or program performance, reset period, visibility, and learner-side default.

Current schema:

- XP, levels, badges, and XP transactions exist.

Gap:

- No `LeaderboardConfig`, no leaderboard default metric, no reset cadence, no snapshot/history entries.

Recommended additions:

- `LeaderboardConfig`
- `LeaderboardSnapshot`
- `LeaderboardEntry`

Key fields:

- `metric`, `scope`, `period`, `resetCadence`, `isDefaultForLearners`, `anonymousMode`, `companyWideEnabled`, `departmentLevelEnabled`

### 13. TNA And Workforce Planning

Requirement:

- TNA must support employee or work-unit requester, free/paid, budget, cost center, CEO approval, aggregation by department/work unit/role/competency/request type, course/program mapping, and traceability.

Current schema:

- `TrainingNeedRequest`, `TnaApprovalWorkflowStep`, `TnaApproval`, and `TnaRecommendation` exist.

Gap:

- No work-unit model or requester entity type.
- No cost center/budget fields beyond estimated cost.
- No fulfillment/linked-course-creation lifecycle fields.

Recommended additions:

- `WorkUnit` or hierarchical `Department.parentId`
- `TnaFulfillment`
- `TnaRequestMetricSnapshot`

Recommended fields on `TrainingNeedRequest`:

- `requesterType TnaRequesterType`
- `requestingWorkUnitId Int?`
- `submittedByUserId Int?`
- `budgetAmount Decimal?`
- `costCenter String?`
- `ceoApprovalRequired Boolean`
- `fulfilledAt DateTime?`
- `fulfillmentStatus TnaFulfillmentStatus`
- `linkedCourseRequestId Int?`

### 14. External Providers And Catalog Offerings

Requirement:

- Third-party providers must auto-sync certification status or provide courses on the LMS. External providers should appear in the course catalog.

Current schema:

- `ExternalProvider` and `ExternalCertificate` exist.

Gap:

- No provider course/track catalog model.
- No sync job/history records.

Recommended additions:

- `ExternalProviderCourse`
- `ExternalProviderTrack`
- `ExternalProviderSyncJob`

Key fields:

- `providerId`, `externalCourseId`, `title`, `description`, `level`, `durationMinutes`, `certificationName`, `catalogUrl`, `thumbnailUrl`, `syncStatus`, `lastSyncedAt`

### 15. Course Reviews, Comments, And Moderation

Requirement:

- Learners may rate/comment/review eligible courses, and HR can moderate/hide/delete inappropriate content.

Current schema:

- `CourseReview` exists and is linked to `CourseCompletion`, which correctly prevents reviews before course completion.

Gap:

- No course comments/discussions separate from final reviews.
- No moderation case/action/report table for hiding, deleting, learner reports, or AI flags.

Recommended additions:

- `CourseComment`
- `ModerationCase`
- `ModerationAction`
- `ContentReport`

Key fields:

- `entityType`, `entityId`, `reportedBy`, `reason`, `severity`, `status`, `actionTaken`, `moderatedBy`, `moderatedAt`

### 16. Calendar And Live Sessions

Requirement:

- Live/ILT sessions need scheduling, attendance, waitlist, recording, calendar views, personal calendar, external calendar export, and double-booking alerts.

Current schema:

- `LiveSession`, `LiveSessionAttendance`, and `LiveSessionWaitlist` exist.

Gap:

- No calendar export/subscription tokens.
- No conflict alert/audit records.
- `meetingUrl` exists regardless of in-person/virtual; enforce with validation or fields.

Recommended additions:

- `CalendarEvent`
- `CalendarExportSubscription`
- `ScheduleConflict`

Recommended changes:

- Enforce `meetingUrl` nullable for in-person via app validation or database check where supported.

### 17. Organization And Employee Profile

Requirement:

- Manager reports, TNA by work unit, role/job title, team-level reports, profile photo, learner profile, and assigned team views.

Current schema:

- `Employee`, `Department`, `JobTitle`, and `JobLevel` exist.

Gap:

- `Employee` lacks manager relationship and profile photo.
- `Department` lacks hierarchy/work-unit distinction.

Recommended fields:

- On `Employee`: `managerEmployeeId String?`, `profilePhotoUrl String?`, `workUnitId Int?`, `hireDate DateTime?`, `employmentStatus String?`
- On `Department`: `parentDepartmentId Int?`, `departmentType String?`, `managerEmployeeId String?`

## High-Priority Schema Changes

These are the changes most necessary to say the BRD is fully represented:

1. Add template child tables for course, program, assessment, survey, and certificate layouts.
2. Add configurable question type tables and move creator-visible question types away from enum-only behavior.
3. Add notification delivery/log/preferences tables.
4. Add audit logging and actor fields for XP and important admin actions.
5. Add program type defaults/retirement fields.
6. Add standalone assignment/submission/peer review tables.
7. Add reporting/export/scheduled report tables.
8. Add TNA work-unit/requester/budget/fulfillment traceability fields.
9. Add leaderboard configuration/snapshot tables.
10. Add external provider course/track catalog tables.

## Lower-Priority But Recommended Improvements

- Add `FileAsset` as a shared file abstraction instead of storing raw URLs in every table.
- Add `sourceType` and provider metadata to `ContentFile`.
- Add `CalendarEvent`, `CalendarExportSubscription`, and `ScheduleConflict`.
- Add `CourseComment` and richer moderation records.
- Add profile photo, manager relationship, and department hierarchy.

## Existing Schema Strengths

The following areas are already well represented and should be retained:

- Versioned course publishing via `Course` and `CourseVersion`.
- Course structure via `CourseChapter`, `CourseContent`, and `ContentFile`.
- Enrollment/progress via `Enrollment`, `LearningProgress`, `LessonProgress`, and `CourseCompletion`.
- Core quiz attempt tracking via `Assessment`, `Question`, `QuestionVersion`, `AssessmentAttempt`, and `AssessmentAnswer`.
- Core certificates via `CertificateTemplate`, `Certificate`, and `CertificateVerification`.
- Learning programs via `LearningProgram`, `ProgramCourse`, `ProgramCohort`, `ProgramEnrollment`, `ProgramTask`, and `ProgramMilestone`.
- Live sessions via `LiveSession`, attendance, instructors, and waitlists.
- TNA workflow base via `TrainingNeedRequest`, `TnaApproval`, and `TnaRecommendation`.
- XP/badges via `XpRule`, `XpTransaction`, `LearningLevel`, `Badge`, and `EmployeeBadge`.
- Generic approvals via `ApprovalWorkflow`, `ApprovalWorkflowStep`, `ApprovalWorkflowInstance`, and `ApprovalDecision`.

## Suggested Implementation Order

1. Normalize templates first, because course/program creation depends on them.
2. Add configurable question types and assessment scoring policy.
3. Add assignment, survey template, and notification log tables.
4. Add certificate template designer tables.
5. Add report/export/audit tables.
6. Add TNA work-unit and fulfillment fields.
7. Add leaderboard and external provider catalog tables.

After these changes, the schema will be much closer to full BRD coverage and ready for implementation against the frontend prototype.
