# Decisions Log

## Candidate Relevant Jobs – Filtering Strategy (Option A)

- Decision Date: 2025-08-20
- Owner: Candidate module

### Summary
- We will keep title-based matching using free-text `JobPosition.title` for relevant jobs (Option A). No strict FK to `JobTitle` for now.
- Filters will be extended to support country (multi-select), salary (min/max, base vs converted), and logical combination AND/OR between "title predicate" and "other filters".
- Indexing will be persisted via TypeORM migrations so it applies in dev and production.

### API Shape (planned)
- `CandidateService.getRelevantJobs(candidateId, opts)` will accept:
  - `usePreferences?: boolean` (default true)
  - `titleMatch?: 'any' | 'all'` (default 'any')
  - `country?: string | string[]`
  - `salary?: { min?: number; max?: number; currency?: string; source?: 'base' | 'converted' }` (default source = 'base')
  - `combineWith?: 'AND' | 'OR'` (default 'AND')
  - `page?, limit?, sortBy?, sortDir?`

### Query Approach
- Use `EXISTS` on `job_positions` (and `salary_conversions` if needed) to avoid row explosion and leverage indexes.
- Title predicate uses normalized (lower) match against preferences.
- Deduplicate via DISTINCT IDs for pagination and accurate counts.

### Indexing Plan (apply directly in dev)
- job_postings: `(is_active, posting_date_ad DESC, employer_id)`
- employers: `(country)`
- job_positions: `(job_posting_id)`, `(job_posting_id, salary_min, salary_max)`, functional index on `lower(title)`
- salary_conversions: `(job_position_id)`, `(currency, min_amount)` (and/or max)

Rationale: Supports frequent predicates on activity, recency, country filter, title search, and salary thresholds.

### Testing
- Add a dedicated test suite to cover:
  - AND across title + country + base salary
  - OR between title and country
  - Multi-country filter
  - Salary range (base)
  - Salary converted (requires `salary_conversions` seed)
  - No preferences path (usePreferences=false)

### Notes
- To avoid drift in Option A, tests/fixtures must use seeded/normalized titles.
- We may later add an optional `job_title_id` linkage (Option B) without breaking API.

- 2025-08-20: Chose NestJS + TypeORM + Postgres. Reason: strong ecosystem, structured DI, TypeORM integration.
- 2025-08-20: Dev uses TypeORM `synchronize: true` for speed; will switch to migrations later.
- 2025-08-20: Service-first approach per requirements; controllers added only after service tests pass.
- 2025-08-20: Docker with mounted `src` for live reload via ts-node-dev.
- 2025-08-20: Added Domain module (`JobPosting`, `JobContract`, `JobPosition`, Expenses, Interview) as the canonical model for job flows.
- 2025-08-20: Replaced legacy agencies/jobs seed with domain-aware seed. Seed now boots Nest application context and uses services for correctness over raw repositories.
- 2025-08-20: In domain services, prefer `undefined` over `null` for optional Date fields and optional filters to satisfy TypeORM `DeepPartial` typings.
- 2025-08-20: Wrote domain smoke tests at service layer before any controllers, to validate end-to-end persistence of posting -> contract -> positions and expenses.
- 2025-08-20: Introduced dedicated Agency module plan (profiles + directory + postings view + analytics). Decision: implement as a domain service first, with tests, before adding controllers.
- 2025-08-20: Agency identity remains `license_number` for reuse; profiles add optional contact/address/compliance fields; deactivation via `is_active`.

## Owner Analytics – Service Design and Test Isolation

- Decision Date: 2025-08-20
- Owner: Owner Analytics module

### Summary
- Implement Owner Analytics as service methods first (no controllers yet). Tests validate service behavior end-to-end through Nest TestingModule.
- Add optional slicing parameters to support analytics use cases and enable deterministic tests:
  - `getDeactivationMetrics(params?: { countries?: string[] })`
  - `getSalaryStatsByCurrency(params?: { since?: Date })`
- These parameters are backward-compatible (optional) and useful in production for dashboard filters.

### Deactivation Metrics Semantics
- Deactivation proxy: `JobPosting.is_active = FALSE` and `updated_at` vs `posting_date_ad`.
- Negative durations are ignored for averaging to avoid skew from future-dated postings.

### Test Isolation Strategy
- Shared DB across specs necessitates isolation techniques:
  - Seed with far-future `posting_date_ad` in analytics tests.
  - Use the optional filters above (`countries`, `since`) to scope queries to test data.
- This is a pragmatic choice until per-test DB isolation or transactions are introduced.

### Controllers
- Do not add controllers for Owner Analytics at this stage. We'll expose endpoints later after service API stabilizes.

## Job Application – Service-First Module Wiring

- Decision Date: 2025-08-27
- Owner: Application module

### Summary
- Implement Job Application strictly as a service layer for now; no controllers.
- Wire `ApplicationModule` into the root `AppModule` so other providers can inject `ApplicationService`.
- Enforce strict workflow transitions with an explicit `makeCorrection` override that appends to history for audit.
- Persist append-only `history_blob` (JSONB array) for status changes with metadata.
- Disallow duplicate applications via unique `(candidate_id, job_posting_id)`.

### Rationale
- Matches project-wide “service-first” approach and testing strategy.
- Avoids premature API exposure until the workflow stabilizes.

### Testing
- Service-level Jest tests cover apply, list, withdraw, updateStatus, makeCorrection, and constraints.

## Interview ↔ Application Linkage and Lifecycle

- Decision Date: 2025-08-27
- Owner: Application + Domain modules

### Summary
- Link `InterviewDetail` to `JobApplication` via a nullable FK `job_application_id` while retaining the existing `job_posting_id`.
- Handle interview lifecycle through `ApplicationService` to enforce application status transitions and audit trails.

### Schema Changes
- Migration: `reference/migrations/20250827_add_interview_application_fk.ts`
  - Add column: `interview_details.job_application_id UUID NULL`.
  - Add index: `idx_interview_details_job_application (job_application_id)`.
  - Add FK: `fk_interview_details_job_application` -> `job_applications(id)` ON DELETE SET NULL.

### Lifecycle and Workflow
- Methods: `scheduleInterview`, `rescheduleInterview`, `completeInterview('passed'|'failed')` implemented in `ApplicationService`.
- Status transitions: `applied` -> `interview_scheduled` -> `interview_rescheduled` (optional) -> `interview_passed|interview_failed` (terminal).
- Append-only `history_blob` records `{ prev_status, next_status, note, updatedBy, ts }` on every transition.
- Terminal states prevent further mutating actions (e.g., withdraw).

### Testing
- Covered by `test/application.interview.integration.spec.ts` for scheduling, rescheduling, completion, FK linkage, and history updates.

### Rationale
- Nullable FK with `ON DELETE SET NULL` decouples interview records from application deletion while preserving data integrity and analytics.
