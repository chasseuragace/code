# Domain Services Test Plan

This plan enumerates human-readable use cases and test scenarios for the Domain services implemented in `src/modules/domain/domain.service.ts`.

- Services under test:
  - `JobPostingService`
  - `ExpenseService`
  - `InterviewService`
- Entities: `JobPosting`, `PostingAgency`, `Employer`, `JobContract`, `JobPosition`, `SalaryConversion`, `MedicalExpense`, `InsuranceExpense`, `TravelExpense`, `VisaPermitExpense`, `TrainingExpense`, `WelfareServiceExpense`, `InterviewDetail`, `InterviewExpense`.

## Test Environment
- DB: Postgres (as configured by `TypeOrmModule.forRoot` in tests).
- Entities auto-loaded; `synchronize: true` (no migrations yet).
- Close the Nest TestingModule in `afterAll` to avoid open-handle warnings.

### Owner Analytics (Addendum)
- Uses shared DB; tests isolate data by:
  - Seeding far-future `posting_date_ad` dates (e.g., year 2031).
  - Passing optional filters on service methods to scope data: `countries`, `since`.
- Negative deactivation durations (if `updated_at < posting_date_ad`) are excluded from averages in assertions.

#### Test Isolation Notes
- Weekly interviews time-series: use a far-future window (2031) and delete any `interview_details` in that date range before seeding to prevent cross-test pollution. This keeps weekly counts deterministic without altering production query logic.
- Unicode ILIKE filters: Postgres `ILIKE` is case-insensitive but not diacritic-insensitive. Tests issue queries with the same diacritics as seeded data (e.g., employer `álpha`, agency `sûnrise`). Assertions may normalize returned strings (NFD + strip accents) for robust substring checks, but queries should reflect actual stored accents.
- Salary stats isolation: seed in a unique test country (e.g., `TST-C`) and use unique test-only currencies (e.g., `TST1`, `TST2`). Clean prior rows in that country before seeding. Percentile expectations align with PostgreSQL `PERCENTILE_CONT` interpolation.
- Preference: keep production methods unchanged for isolation; favor scoped seed data and targeted cleanup. Consider optional filters (e.g., `since`, `countries`) only when necessary and broadly useful.

## Conventions
- Use fresh data per test case for isolation (unique agency license numbers, employer names, posting titles).
- Prefer service-level assertions (avoid direct repository access where possible).
- Dates: optional date strings are converted to Date where provided; otherwise remain undefined.
  - For Owner Analytics specs, prefer date-only comparisons and far-future windows to avoid collisions.

---

## JobPostingService

Public operations used by tests:
- `createJobPosting(dto)`
- `findJobPostingById(id)`
- `findAllJobPostings(page, limit, country?, isActive?)`
- `updateJobPosting(id, updateDto)`
- `deactivateJobPosting(id)`
- `searchJobPostings(params)`

### Use Case JP-1: Create posting with contract and positions
- Input: complete DTO: posting header, `posting_agency`, `employer`, one contract, multiple positions; some optional fields omitted.
- Expected:
  - `PostingAgency` upsert by `license_number` (create if not exists, reuse if exists).
  - `Employer` upsert by `(company_name, country, city)`.
  - `JobPosting` created with defaults:
    - `announcement_type` defaults to `FULL_AD` if not provided.
    - `posting_date_ad` defaults to `new Date()` if not provided.
  - `JobContract` created and linked to posting, employer, and agency.
  - `JobPosition`(s) created and linked to the contract.
  - `SalaryConversion` entries created when provided on a position.
  - `findJobPostingById` returns the posting with relations:
    - `contracts`, `contracts.employer`, `contracts.agency`, `contracts.positions`, `contracts.positions.salaryConversions`.

### Use Case JP-2: Agency and employer reuse idempotency
- Arrange: Pre-create an agency/employer pair via a first posting.
- Action: Create a second posting referencing the same agency license and employer triple.
- Expected:
  - Second `createJobPosting` does not create duplicate agency/employer.
  - Both postings reference the same agency and employer IDs.

### Use Case JP-3: Position overrides and notes
- Input: position DTOs include overrides (hours/days/overtime/weekly_off/food/accommodation/transport) and `position_notes`.
- Expected: persisted fields reflect the overrides and notes.

### Use Case JP-4: Retrieve by ID and NotFound
- Action: `findJobPostingById` with a valid ID.
- Expected: returns entity with full relations as above.
- Action: `findJobPostingById` with a random UUID.
- Expected: throws `NotFoundException`.

### Use Case JP-5: Update posting header
- Arrange: create posting.
- Action: `updateJobPosting(id, partial)` with updates to strings and dates.
- Expected: fields updated; `approval_date_ad` is Date if provided; `updated_at` is set; reading back via `findJobPostingById` reflects updates.

### Use Case JP-6: Deactivate posting
- Arrange: create posting.
- Action: `deactivateJobPosting(id)`.
- Expected: subsequent `findAllJobPostings` with default `isActive=true` does not include the posting; direct `findJobPostingById` still returns with `is_active=false`.

### Use Case JP-7: Pagination and basic filtering
- Arrange: create N postings (>= 15), with varied `country` values and `posting_date_ad` created at different times (implicit now ordering).
- Action: `findAllJobPostings(page=2, limit=5)`.
- Expected:
  - `data.length` is 5.
  - `total` equals N (active ones).
  - Ordered by `posting_date_ad` DESC.
- Action: `findAllJobPostings(1, 10, country='uae')`.
- Expected: only postings with `country ILIKE '%uae%'`.

### Use Case JP-8: Search combinatorial filters
- Arrange: create postings with varied positions titles, salary, currencies, employer names, agency names.
- Actions/Assertions for `searchJobPostings`:
  - Filter by `country` only.
  - Filter by `position_title` only (ILIKE on positions.title).
  - Filter by `min_salary` and `currency` together.
  - Filter by `max_salary` and `currency` together.
  - Filter by employer/company ILIKE.
  - Filter by agency/name ILIKE.
  - Combine multiple filters; assert pagination fields returned and ordering by `posting_date_ad` DESC.

### Edge Case JP-E1: Optional fields undefined
- Provide `city`, `approval_date_ad`, `posting_date_bs` as undefined or omitted.
- Expected: creation succeeds; undefined is accepted without TypeORM type errors (ensures our `undefined` handling is correct).

### Edge Case JP-E2: Salary conversion optional
- Omit `salary.converted` for some positions.
- Expected: no `SalaryConversion` rows for those positions; others present where provided.

---

## ExpenseService

Public operations used by tests:
- `createMedicalExpense(postingId, data)`
- `createInsuranceExpense(postingId, data)`
- `createTravelExpense(postingId, data)`
- `createVisaPermitExpense(postingId, data)`
- `createTrainingExpense(postingId, data)`
- `createWelfareServiceExpense(postingId, data)`
- `getJobPostingExpenses(postingId)`

General behavior:
- No explicit validation/guards; methods map DTO fields to entity columns and save.
- Booleans default to `false` when not provided.

### Use Case EX-1: Create each expense type and fetch bundle
- Arrange: create a posting.
- Action: create each expense type at least once (mix of is_free=true and amount/currency values).
- Expected: `getJobPostingExpenses(id)` returns all created expenses, each with the expected persisted fields.

### Use Case EX-2: is_free semantics
- For expenses where `is_free=true`, omit amount/currency.
- Expected: entity persists with `is_free=true` and amount/currency null; no errors.

### Use Case EX-3: Domestic vs foreign medical
- Provide both domestic and foreign in `createMedicalExpense`.
- Expected: domestic_* and foreign_* sets are stored independently.

### Use Case EX-4: Travel ticket type mapping
- Provide a `ticket_type` (e.g., `ROUND_TRIP`).
- Expected: persisted `ticket_type` equals input.

### Edge Case EX-E1: Missing optional parts
- Call `createWelfareServiceExpense` with only `welfare` or only `service`.
- Expected: the provided section is stored; missing section remains null/undefined.

### Edge Case EX-E2: Fetch on posting with no expenses
- Action: `getJobPostingExpenses` for a posting without expenses.
- Expected: returns `{ medical: null, insurance: null, ... }` (values are `null` if not present).

---

## InterviewService

Public operations used by tests:
- `createInterview(postingId, data)`
- `findInterviewById(id)`
- `findInterviewByJobPosting(postingId)`
- `updateInterview(id, partial)`

General behavior:
- Optional date strings converted to Date; booleans default to false; expenses saved when provided.

### Use Case IV-1: Create interview with one expense
- Arrange: create posting.
- Action: `createInterview` with time/location and a single expense (e.g., DOCUMENT_PROCESSING, worker pays, amount/currency).
- Expected: interview persists with provided fields; has one linked `InterviewExpense`.

### Use Case IV-2: Create interview without expenses
- Action: `createInterview` with no `expenses` array.
- Expected: interview created; `expenses` relation empty when fetched.

### Use Case IV-3: Find by posting ID
- Arrange: create posting+interview.
- Action: `findInterviewByJobPosting(postingId)`.
- Expected: returns the interview with `expenses` relation.

### Use Case IV-4: Update interview fields
- Arrange: create interview.
- Action: `updateInterview(id, partial)` including `interview_date_ad` string.
- Expected: fields updated; `interview_date_ad` is a Date; `updated_at` set; reading by ID reflects updates.

### Edge Case IV-E1: NotFound by ID
- Action: `findInterviewById` or `updateInterview` with a random UUID.
- Expected: throws `NotFoundException`.

---

## ApplicationService – Interview Lifecycle Integration

Public operations used by tests:
- `scheduleInterview(applicationId, payload, meta?)`
- `rescheduleInterview(applicationId, interviewId, partial, meta?)`
- `completeInterview(applicationId, outcome: 'passed' | 'failed', meta?)`

General behavior:
- Persists `InterviewDetail` linked to both `job_posting_id` and nullable `job_application_id` (FK).
- Appends to `history_blob` on `JobApplication` with `{ prev_status, next_status, note, updatedBy, ts }`.
- Enforces strict status transitions:
  - `applied` -> `interview_scheduled` -> `interview_rescheduled` (optional) -> `interview_passed|interview_failed` (terminal).
- Terminal states block further mutating actions (e.g., `withdraw`).

Schema note:
- Migration adds nullable FK and index:
  - `reference/migrations/20250827_add_interview_application_fk.ts`
  - `interview_details.job_application_id UUID NULL`
  - FK `fk_interview_details_job_application` -> `job_applications(id)` ON DELETE SET NULL
  - Index `idx_interview_details_job_application` on `(job_application_id)`

Test coverage:
- `test/application.interview.integration.spec.ts` covers schedule, reschedule, and completion flows, verifies history and FK linkage.

## Cross-cutting Concerns

### CC-1: Transactional integrity on createJobPosting
- Intent: `createJobPosting` uses a transaction and a query runner.
- Strategy: Simulate an error mid-creation (e.g., pass a position with an extremely long title to trigger a DB error if constraints exist; if not present, skip this test). Expect no partial entities committed. Note: current schema may not enforce such constraints; treat this as optional.

### CC-2: Pagination boundaries
- For `findAllJobPostings` and `searchJobPostings`, validate page/limit edges:
  - Page 1, small limit
  - Last page calculation when total % limit != 0
  - Empty page (beyond last) returns 0 results with correct total/page/limit.

### CC-3: ILIKE filter semantics
- Ensure filters are case-insensitive and substring-based for `country`, `position_title`, `employer_name`, `agency_name`.

### CC-4: Default values
- Verify booleans default to `false` where code sets `|| false` (e.g., expenses, contract.renewable).
- Verify announcement type and posting_date_ad defaults.

---

## Additional Coverage Addenda

- __Deterministic ordering__
  - Add secondary sort key (e.g., `id DESC`) assertions when timestamps can tie, for both `findAllJobPostings()` and `searchJobPostings()`.

- __Deactivation effects propagate to search__
  - After `deactivateJobPosting`, verify `searchJobPostings()` (which enforces `is_active=true`) excludes the posting as well as `findAllJobPostings()`.

- __Duplicate expenses behavior__
  - Since `getJobPostingExpenses()` uses `findOne`, create two of the same expense type and observe which one is returned (document current behavior). Consider adding uniqueness constraints later; for now, assert non-throw and presence of at least one.

- __Unicode and case variants in ILIKE__
  - Insert employers/agencies/countries with Unicode and mixed case (e.g., `Népal`, `uae`, `UAE`). Ensure filters match regardless of case and work with Unicode.

- __Pagination edges (explicit)__
  - Test exact multiples and off-by-one: totals 10, 11, 19 with limits 5, 7, etc., including empty last page.

- __Date handling and timezone__
  - For AD date strings, assert persisted field is a Date. Compare by date-only where relevant to avoid timezone flakiness (don’t assert exact milliseconds).

- __Money/precision sanity__
  - Use integer-like amounts for equality assertions. Avoid floating values that can introduce precision issues.

- __Optional transactional rollback__
  - If schema constraints are added later, enable a test that forces a mid-transaction failure and asserts no partial rows remain.

## Test File Mapping
- Posting basics and relations: `test/domain.posting.spec.ts`
- Expenses bundle and specifics: `test/domain.expenses.spec.ts`
- Interview lifecycle: `test/domain.interview.spec.ts`
- Application ↔ Interview integration: `test/application.interview.integration.spec.ts`
- Additional planned specs (to add):
  - `test/domain.posting.update.spec.ts` (JP-5, JP-6)
  - `test/domain.posting.list-search.spec.ts` (JP-7, JP-8, CC-2, CC-3)
  - `test/domain.interview.update.spec.ts` (IV-4, IV-E1)
  
### Owner Analytics Specs
- `test/owner.analytics.deactivation-metrics.spec.ts`
  - Uses `owners.getDeactivationMetrics({ countries: [...] })` with seeded countries and filters to isolate.
- `test/owner.analytics.salary-stats.spec.ts`
  - Seeds positions with far-future `posting_date_ad` and calls `owners.getSalaryStatsByCurrency({ since: new Date('2031-01-01') })`.

---

## AgencyService (Planned)

Public operations to implement and test:
- `createAgency(dto)` / `updateAgency(id, dto)`
- `deactivateAgency(id)` / `activateAgency(id)`
- `findAgencyById(id)` / `findAgencyByLicense(license)`
- `listAgencies(filters, page, limit)` with case-insensitive Unicode ILIKE on name/country/city/license
- `getAgencyPostings(id, { active_only, page, limit })`
- `getAgencyAnalytics(id)` summarizing counts and salary aggregates

Test suites and cases:
- AG-CRUD: create, update, deactivate/activate, reuse-by-license (no duplicates)
- AG-DIR: list/paginate/filter agencies; exclude inactive by default
- AG-POST: list agency’s postings; respect active_only; pagination edges
- AG-ANL: analytics—active/total postings, interviews count, salary min/max/avg per currency

Test file mapping (planned):
- `test/agency.profile-crud.spec.ts` (AG-CRUD)
- `test/agency.directory.spec.ts` (AG-DIR)
- `test/agency.postings.spec.ts` (AG-POST)
- `test/agency.analytics.spec.ts` (AG-ANL)

---

## Out-of-Scope (for now)
- Controller and e2e coverage (to be planned later).
- Migrations and schema-level constraints (replace `synchronize: true`).
- Validation layer (DTO/class-validator) — not implemented in services; tests avoid asserting validations that don’t exist.
