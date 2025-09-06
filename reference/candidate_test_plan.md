# Candidate Module – Test Plan
## Relevant Jobs by Candidate Preferences

Objective: Given a candidate with a job preferences profile (preferred job titles), fetch relevant active job postings that have positions matching any of the preferred titles.

Assumptions
- Candidate preferences are stored in `candidate_job_profiles.profile_blob` with `preferred_titles: string[]`.
- Job titles are managed in `job_titles` and preferences are validated against active titles.
- Job postings/positions are defined in `job_postings` and `job_positions` (via `DomainModule`).

Acceptance Criteria
- A few job postings exist with various `JobPosition.title` values.
- A user (candidate) has a job profile with `preferred_titles` containing a subset of titles.
- Fetching relevant jobs for that user returns only active postings having at least one position with title in `preferred_titles`.
- Returned positions per posting may be filtered to matching titles (optional), but postings must match at minimum.
- Optional filters: country, pagination (page/limit).

API/Service Contract
- `CandidateService.getRelevantJobs(candidateId: string, opts?: { country?: string; page?: number; limit?: number; }): Promise<{ data: JobPosting[]; total: number; page: number; limit: number }>`
- Throws `NotFoundException` if candidate not found.
- Throws `BadRequestException` if candidate has no preferences or `preferred_titles` empty.

Test Scenarios
1) Seed active job titles and create job postings with positions:
   - Posting A: positions ['Welder', 'Driver']
   - Posting B: positions ['Electrician']
   - Posting C: positions ['Cook'] (control)
2) Candidate preferences: `preferred_titles = ['Welder', 'Electrician']`.
3) getRelevantJobs returns postings A and B, not C.
4) Country filter: if postings in mixed countries, filtering by `country` narrows results correctly.
5) Edge cases: empty preferences -> BadRequest; titles not in active list -> already validated at profile creation.


This plan enumerates use cases and ties each to concrete test cases. It targets services/entities only (no UI/controllers yet).

- Feasibility: `reference/applicant_module.md`
- Jobs seed: `reference/jobs/jobs.seed.json`
- Domain (jobs): `src/modules/domain/domain.entity.ts`

## Scope
- In-scope: Candidate entities/services, preferences, job profiles (JSONB), applications (apply/withdraw) to `JobPosting`.
- Out-of-scope: Agency workflow (shortlist/interview/pass/fail), notifications, authentication flows.

## Preconditions / Fixtures
- `job_titles` table seeded from `reference/jobs/jobs.seed.json`.
- At least one active `JobPosting` exists with contracts/positions in `src/modules/domain/domain.entity.ts`.
- Database supports JSONB (Postgres).

## Entities under test
- `Candidate`
- `JobTitle`
- `CandidatePreference`
- `CandidateJobProfile`
- `JobApplication`

## Use Cases (UC)
- UC1: Create Candidate profile
- UC2: Update Candidate profile
- UC3: Add job title preference
- UC4: Remove job title preference
- UC5: List job title preferences
- UC6: Add job profile (JSONB)
- UC7: Update job profile (JSONB)
- UC8: List job profiles
- UC9: Apply to a job posting
- UC10: Withdraw an application
- UC11: Validation – phone uniqueness and normalization
- UC12: Validation – coordinates range in address
- UC13: Validation – JSONB shape for skills/education/profile
- UC14: Integrity – preference uniqueness per (candidate, job_title)
- UC15: Integrity – application uniqueness per (candidate, job_posting)
- UC16: Integrity – application to inactive/nonexistent posting rejected
- UC17: Seed integrity – `JobTitle` aligns with `jobs.seed.json`

## Test Cases (TC) mapped to Use Cases

- TC1.1 (UC1) Create minimal candidate
  - Input: `{ full_name, phone }`
  - Expect: `Candidate` created, defaults set (`is_active=true`, timestamps present).

- TC1.2 (UC1) Create candidate with full details
  - Input: address with coordinates, passport, skills[], education[]
  - Expect: JSONB persisted and retrievable intact.

- TC2.1 (UC2) Update candidate partial fields
  - Change `passport_number`, append skills/education
  - Expect: Fields updated, `updated_at` changes, unchanged fields preserved.

- TC3.1 (UC3) Add valid preference
  - Pre: candidate exists, `JobTitle` = "Mason"
  - Action: addPreference(candidateId, jobTitleId, priority=1)
  - Expect: Row created, no duplicates.

- TC3.2 (UC3/UC14) Add duplicate preference
  - Action: addPreference same (candidateId, jobTitleId)
  - Expect: Unique violation or graceful 409/DomainError.

- TC4.1 (UC4) Remove preference
  - Pre: preference exists
  - Expect: Row deleted, idempotent second delete returns not-found/ignored per spec.

- TC5.1 (UC5) List preferences ordered
  - Expect: List sorted by `priority` then `created_at`.

- TC6.1 (UC6) Add job profile JSONB
  - Input: `{ label: "Gulf Driver Profile", profile_blob: { lang: "EN", exp_years: 3 } }`
  - Expect: Row created, JSONB stored.

- TC7.1 (UC7) Update job profile JSONB
  - Action: update blob (add `license_category: "Light"`)
  - Expect: Merge/replace as per spec; `updated_at` changes.

- TC8.1 (UC8) List job profiles
  - Expect: Returns all for candidate, ordered by `updated_at DESC`.

- TC9.1 (UC9) Apply to active posting
  - Pre: Active `JobPosting` exists
  - Action: apply(candidateId, jobPostingId)
  - Expect: `JobApplication` created with status `submitted`.

- TC9.2 (UC9/UC15) Apply duplicate to same posting
  - Expect: Unique violation or graceful 409.

- TC10.1 (UC10) Withdraw application
  - Action: withdraw(applicationId)
  - Expect: Status becomes `withdrawn`, `updated_at` changes.

- TC11.1 (UC11) Phone uniqueness
  - Pre: Candidate with phone `+9779812345678`
  - Action: create another with same (normalized) phone
  - Expect: Unique violation or 409.

- TC11.2 (UC11) Phone normalization to E.164
  - Input: `9812345678` (local)
  - Expect: Stored as `+9779812345678` (normalization behavior defined in service).

- TC12.1 (UC12) Coordinates validation
  - Input: `lat: 91` or `lng: 181`
  - Expect: Validation error.

- TC13.1 (UC13) Skills/education JSONB schema
  - Input: malformed array (non-object entries)
  - Expect: Validation error.

- TC14.1 (UC14) Preference uniqueness index
  - Ensure DB constraint on `(candidate_id, job_title_id)` exists and blocks duplicates.

- TC15.1 (UC15) Application uniqueness index
  - Ensure DB constraint on `(candidate_id, job_posting_id)` exists and blocks duplicates.

- TC16.1 (UC16) Apply to inactive posting
  - Pre: `JobPosting.is_active = false`
  - Expect: Application rejected with domain error.

- TC16.2 (UC16) Apply to non-existent posting
  - Expect: NotFound/DomainError.

- TC17.1 (UC17) JobTitle seed fields
  - Verify `title`, `rank`, `is_active`, `difficulty`, `skills_summary`, `description` loaded from `jobs.seed.json`.

- TC17.2 (UC17) Unique title
  - Attempt to insert duplicate title (case-insensitive)
  - Expect: Unique index violation.

## Negative/Edge Cases
- Very large JSONB in `profile_blob` → rejected or accepted within size budget.
- Empty preferences list → handled gracefully.
- Removing last application → candidate remains intact.
- High priority gaps (1 then 10) → system tolerates non-contiguous priorities.

## Notes
- No UI/controllers yet; tests target services/repositories only.
- When implementing, reference the models in `reference/applicant_module.md` and reuse `JobPosting` from `src/modules/domain/domain.entity.ts`.
 - Matching strategy (Option A, fast): `CandidateService.getRelevantJobs()` currently matches on `JobPosition.title` as free-text. Since postings are not strictly linked to `JobTitle`, ensure tests (and any seeded/fixture data) use titles from the active `job_titles` list to avoid drift. Consider normalizing titles on creation (trim/case) to reduce mismatches. A more robust, optional link via `job_title_id` can be added later without breaking this behavior.

## Deferred/Skipped (pending JobTitle seed and active JobPosting fixtures)
- Preferences (UC3–UC5, TC3.1–TC5.1) and uniqueness index (TC14.1) depend on `JobTitle` table seeded from `reference/jobs/jobs.seed.json`.
- Applications (UC9–UC10, TC9.1–TC10.1) and uniqueness index (TC15.1), plus inactive/non-existent posting validations (TC16.1–TC16.2), depend on existing active `JobPosting` fixtures.
- Seed integrity (UC17, TC17.1–TC17.2) depends on implementing `JobTitle` entity and seed process.

Action: Implement `JobTitle` entity + seeding and ensure at least one active `JobPosting` exists, then unskip the above test groups.

## Converted Salary Filtering – Implemented
- Status: Implemented in `CandidateService.getRelevantJobs()` and covered by tests in `test/candidate.relevant-jobs.filters.spec.ts`.
- Implementation: When `opts.salary.source === 'converted'`, the query adds an `EXISTS` subquery on `salary_conversions` to filter by `converted_currency` and `converted_amount` (min/max). This avoids row explosion.
- Tests: The suite seeds USD conversions for positions and verifies that a USD minimum threshold returns only postings whose positions meet that converted minimum.
- Indexes: Backed by migration `reference/migrations/20250820_add_candidate_filter_indexes.ts` to support efficient lookups.
