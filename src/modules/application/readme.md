# Job Application Module – Design (Service Layer)

This document defines the initial scope and design for the Job Application module. We will only implement the service layer (no controllers/API) to stay consistent with the current codebase.

---

## Module Wiring

- The `ApplicationModule` is imported in the root `AppModule` (`src/app.module.ts`).
- Controllers are intentionally out of scope; only providers/entities are registered.

```
// src/app.module.ts
imports: [
  // ...other modules
  ApplicationModule,
]
```

---

## Goals (MVP)

- Candidate can apply to a job posting.
- Candidate can list their applied jobs.
- Candidate can withdraw an application.
- Applications carry a `status` and an immutable status change history (`history_blob`).
- Status updates primarily by agency member in future; for MVP we accept a free-form `updated_by` string.
- Introduce a strict workflow for allowed status transitions, but support an explicit override method to correct human errors while preserving auditability.
- Re-apply is disallowed for now.
- Interview details will be modeled later; we will only carry interview-related statuses in this MVP.

---

## Quickstart (Service-only)

Example usage within another provider after importing `ApplicationModule`:

```ts
import { ApplicationService } from 'src/modules/application/application.service';

constructor(private readonly apps: ApplicationService) {}

async demo(candidateId: string, postingId: string) {
  await this.apps.apply(candidateId, postingId, { updatedBy: 'system', note: 'initial apply' });
  const list = await this.apps.listApplied(candidateId, { page: 1, limit: 10 });
  return list;
}
```

Notes: No HTTP endpoints are exposed yet; call the service directly.

---

## Entities

### JobApplication (`src/modules/application/job-application.entity.ts`)

- id: `uuid` (PK)
- candidate_id: `uuid` (FK → `Candidate.id`)
- job_posting_id: `uuid` (FK → `JobPosting.id`)
- status: `JobApplicationStatus` (enum)
- history_blob: `jsonb[]` (append-only array of status transitions)
- withdrawn_at: `timestamptz | null`
- created_at: `timestamptz`
- updated_at: `timestamptz`

Constraints and Indexes:
- Unique `(candidate_id, job_posting_id)` to prevent duplicate applications. Re-apply is disallowed.
- Index `(candidate_id, created_at DESC)` for listing by candidate.
- Index `(job_posting_id)` for future analytics.

---

## Status Enum

`JobApplicationStatus` (initial limited workflow):
- `applied`
- `shortlisted`
- `interview_scheduled`
- `interview_rescheduled`
- `interview_passed` (terminal)
- `interview_failed` (terminal)
- `withdrawn` (terminal)

Notes:
- We limit workflow up to interview pass/fail. Further post-interview steps (e.g., hiring, visa, deployment) are out of scope for this MVP.

---

## History Entry Shape

Each element in `history_blob`:
```json
{
  "prev_status": "applied" | null,
  "next_status": "shortlisted",
  "updated_at": "2025-08-27T07:00:00Z",
  "updated_by": "string | null", // free-form for now
  "note": "string | null"
}
```
- Always appended in order.
- Created on: initial apply, status updates, withdraw, and corrections.

---

## Service API (`src/modules/application/application.service.ts`)

- `apply(candidateId: string, jobPostingId: string, opts?: { note?: string; updatedBy?: string })`
  - Ensures Candidate and JobPosting exist.
  - Ensures JobPosting is active.
  - Enforces uniqueness on `(candidate_id, job_posting_id)`; re-apply disallowed (throw).
  - Creates application with status `applied` and initial history entry.

- `listApplied(candidateId: string, opts?: { status?: JobApplicationStatus[]; page?: number; limit?: number })`
  - Returns `{ data, total, page, limit }`, ordered by `created_at DESC`.

- `withdraw(candidateId: string, jobPostingId: string, opts?: { note?: string; updatedBy?: string })`
  - Finds existing application.
  - If terminal (passed/failed/withdrawn), throws 409.
  - Sets status `withdrawn`, sets `withdrawn_at=now`, appends history.

- `updateStatus(applicationId: string, next: JobApplicationStatus, opts?: { note?: string; updatedBy?: string })`
  - Enforces allowed transitions (see Workflow Rules below).
  - Disallows transitions from terminal statuses.
  - Appends history entry.

- `makeCorrection(applicationId: string, correctedStatus: JobApplicationStatus, opts?: { reason: string; updatedBy?: string })`
  - Explicit override that bypasses workflow validation for human error correction.
  - Still disallows correction from `withdrawn` unless explicitly intended (MVP: allow correction from `withdrawn` only back to `applied` or `shortlisted`).
  - Appends history with a special note format: `"correction: <reason>"` to ensure auditability.
  - Consider flagging a `corrected=true` field inside the history entry.

- `getById(applicationId: string)` (utility for tests/diagnostics)

---

## Workflow Rules

Allowed transitions (strict, in `updateStatus` only):
- `applied` → `shortlisted`
- `shortlisted` → `interview_scheduled`
- `interview_scheduled` → `interview_rescheduled` | `interview_passed` | `interview_failed`
- `interview_rescheduled` → `interview_scheduled` | `interview_passed` | `interview_failed`

Terminal statuses:
- `interview_passed`, `interview_failed`, `withdrawn`
- No transitions allowed from terminal statuses via `updateStatus`.

Correction exceptions (in `makeCorrection`):
- Any non-terminal status may be corrected to any other non-terminal status.
- From `withdrawn`, may correct to `applied` or `shortlisted` only (MVP decision to prevent accidental resurrection beyond early pipeline).

---

## Migrations

- Create `job_applications` table with enum type for status and `jsonb[]` for `history_blob`.
- Unique index on `(candidate_id, job_posting_id)`.
- Indexes on `(candidate_id, created_at)` and `(job_posting_id)`.

---

## Validation & Errors

- Apply: 409 if already applied to the same posting.
- Withdraw: 404 if not found, 409 if terminal.
- Update status: 404 if not found, 409 on invalid transition or if terminal.
- Correction: 404 if not found, 409 if violating correction terminal rules.

---

## Testing Plan

- `apply` creates, enforces uniqueness, initializes history.
- `listApplied` filters by status and paginates.
- `withdraw` sets status, timestamp, history; idempotency is intentionally NOT allowed (second withdraw = 409).
- `updateStatus` enforces allowed transitions; terminal blocks further updates.
- `makeCorrection` bypasses workflow with audit trail.
- Integration checks with Candidate and JobPosting existence and active posting constraint.

---

## Out of Scope (Future)

- Interview details entity (schedule/reschedule metadata, interviewer, locations, etc.).
- Agency member identity and permission checks; `updated_by` stays free-form for now.
- Post-interview workflow steps (offer, hiring, visa, medical, deployment).

---

## Implementation Order

1) Entity + migration
2) Service with `apply`, `listApplied`, `withdraw`
3) Workflow `updateStatus`
4) `makeCorrection` override with audit
5) Tests (service-level, using existing test bootstrapping pattern)
