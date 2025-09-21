# UdaanSarathi – Developer Guide (All Talk, No Code)

This guide is your high-level orientation to the current workspace: what exists, how it works, where to look, and how to extend it. It is intentionally verbose so you can quickly regain context after a break. All talk, no code.

---

## 1) What This System Does

- __Purpose__: A recruitment portal enabling agencies to create tagged job postings, candidates to find relevant jobs by title/skills/education/experience, apply to jobs, and move through an interview workflow, with analytics for agencies.
- __Core Concept__: Tags enrich job postings and candidate profiles to power matching. Matching supports canonical job titles, skill overlap, education overlap, and experience compatibility.

---

## 2) Architecture Map

- __Framework__: NestJS, TypeORM, PostgreSQL.
- __Key Modules__:
  - `candidate/`: candidate entity/service/controller; relevant jobs logic.
  - `domain/`: job posting domain entities/services (postings, contracts, positions, interviews, etc.).
  - `application/`: job applications workflow (apply → shortlist → schedule → complete/withdraw).
  - `agency/`: agency CRUD + job posting creation + analytics endpoint.
  - `job-title/`: canonical titles (seeded) to back validation and canonical matching.
  - `owner-analytics/`: portal-wide aggregates (not main focus of this session).
- __DB Features__: JSONB columns for tags and profiles; GIN indexes where applicable; join table for `canonical_titles`.

---

## 3) Data Model – Key Entities

- __JobPosting__ (`src/modules/domain/domain.entity.ts`)
  - `skills?: string[]` (JSONB)
  - `education_requirements?: string[]` (JSONB)
  - `experience_requirements?: { min_years?: number; max_years?: number; level?: 'fresher' | 'experienced' | 'skilled' | 'expert' }` (JSONB)
  - `canonical_titles?: JobTitle[]` (Many-to-Many via `job_posting_titles`)
  - `contracts` own `positions` → salaries, employer, agency
- __Candidate__ (`src/modules/candidate/candidate.entity.ts`)
  - `skills?: any[]` JSONB (objects recommended; `title`, `years` or `duration_months`)
  - `education?: any[]` JSONB (e.g., `{ degree: 'technical-diploma' }`)
- __CandidateJobProfile__
  - `profile_blob.preferred_titles: string[]` validated against active `JobTitle`
- __CandidatePreference__
  - Explicit ordered list of titles; matching prioritizes these over job profile.
- __JobTitle__
  - Canonical, seeded; used for validation and canonical title matching.
- __JobApplication__ (`src/modules/application/`)
  - Status state machine: `applied → shortlisted → interview_scheduled → interview_rescheduled → interview_passed|interview_failed|withdrawn`.

---

## 4) Tagging – Creation and Update

- __Migration__: `reference/migrations/20250906_add_job_posting_tags.ts` adds JSONB fields and join table.
- __Validation on Create__: `AgencyController` uses `CreateJobPostingWithTagsDto` so tags are validated on POST creation.
- __Update Tags__: `PATCH /agencies/:license/job-postings/:id/tags` updates tags; ownership is enforced (posting must belong to the agency license).
- __Retrieve Tags__: `GET /agencies/:license/job-postings/:id/tags` returns current tags.

__Ownership__: The agency license in the URL must match the posting's contract agency license; otherwise Forbidden.

---

## 5) Matching – How Relevant Jobs Are Determined

- __Core Method__: `CandidateService.getRelevantJobs(candidateId, opts)`
  - Pulls preferred titles from `CandidatePreference` or job profile fallback.
  - Builds SQL that matches if any of the following are true:
    - Position title in candidate titles (title match), OR
    - Skills overlap (candidate skills vs `job_postings.skills`), OR
    - Education overlap (candidate education tokens vs `job_postings.education_requirements`), OR
    - Canonical titles match (opt-in via `useCanonicalTitles: true`): posting’s canonical titles intersect candidate preferred titles.
  - Optional filters: `country`, salary (base or converted), AND/OR combination with filters.
  - __Scoring__ (opt-in `includeScore: true`):
    - Skills overlap percent + education overlap percent + experience compatibility (1/0) averaged → `fitness_score` 0–100.
    - Candidate years heuristic = sum of skill `years` or `duration_months/12`.

- __Grouped Matching__: `CandidateService.getRelevantJobsGrouped(candidateId, opts)`
  - For each preferred title, fetch results constrained to that single title (via `preferredOverride`) and order by `fitness_score` desc.

- __Experience Taxonomy__: Nepal labor market levels: `fresher`, `experienced`, `skilled`, `expert`. Max years capped at 30 (validation).

---

## 6) Endpoints – What’s Available Now

- __Candidate__ (`src/modules/candidate/candidate.controller.ts`)
  - POST `/candidates` → create candidate
  - POST `/candidates/:id/job-profiles` → add job profile with `preferred_titles`
  - GET `/candidates/:id/relevant-jobs`
    - Query: `useCanonicalTitles`, `includeScore`, `country`, `combineWith`, `salary_min/max/currency/source`, `page`, `limit`
  - GET `/candidates/:id/relevant-jobs/grouped`
    - Groups by preferred titles, jobs ordered by `fitness_score`
  - NEW: GET `/candidates/:id/relevant-jobs/by-title?title=...`
    - Paginated list for a single preferred title; same filters; optional scoring

- __Agency__ (`src/modules/agency/agency.controller.ts`)
  - POST `/agencies` → create
  - POST `/agencies/:license/job-postings` → create posting; includes tags in response
  - PATCH `/agencies/:license/job-postings/:id/tags` → update tags (ownership enforced)
  - GET `/agencies/:license/job-postings/:id/tags` → fetch tags (ownership enforced)
  - NEW Analytics: GET `/agencies/:license/analytics/applicants-by-phase`
    - Returns rows per posting: `{ posting_id, posting_title, counts: { applied, shortlisted, interview_scheduled, interview_rescheduled, interview_passed, interview_failed, withdrawn } }`

- __Applications__ (`src/modules/application/application.controller.ts`)
  - POST `/applications` → apply
  - GET `/applications/candidates/:id` → list candidate applications (status, pagination)
  - POST `/applications/:id/shortlist` → status: shortlisted
  - POST `/applications/:id/schedule-interview` → status: interview_scheduled (persists interview detail)
  - POST `/applications/:id/complete-interview` → status: interview_passed/failed
  - POST `/applications/:id/withdraw` → status: withdrawn

---

## 7) Key Test Flows – What to Run to Verify

- __Title/Tags Matching__: `test/candidate.matching.tags.spec.ts`
  - Canonical titles toggle on/off
  - Education overlap
  - Experience boundaries + fitness score
  - Apply flow

- __Apply Through API__: `test/flow.candidate.apply-through-api.spec.ts`

- __Grouped Relevant Jobs__: `test/flow.candidate.grouped-relevant-jobs.spec.ts`

- __Agency Application Workflow__
  - Service-level: `test/flow.agency.shortlist-interview.spec.ts`
  - HTTP flow: `test/flow.agency.shortlist-interview-through-api.spec.ts`
    - Includes candidate status verification after each agency action
    - Withdraw after schedule

- __Agency Analytics__: `test/agency.analytics.applicants-by-phase.spec.ts`
  - Validates aggregated applicant counts by status per posting.

- __Seed & Baseline__: `test/flow.system.initialized.spec.ts` (seeds countries & job titles)

- __Other Domain Tests__: Interview create/update/find, posting update, analytic summaries…

__Run__: `npm test -- --runInBand` (we configured Jest for sequential runs, longer timeouts, and open-handle detection in `jest.config.ts`).

---

## 8) Seeding and Validation

- __Seeds__:
  - Countries: `POST /countries/seedv1`
  - Job Titles: `POST /job-titles/seedv1` (reads `src/seed/jobs.seed.json`)
- __Validation__:
  - Candidate job profile `preferred_titles` must exist and be active.
  - Job posting tags validated on creation (`CreateJobPostingWithTagsDto`).
  - Experience years: 0–30; levels as per Nepal taxonomy.

---

## 9) Security & Ownership

- __Agency ownership enforcement__
  - Tag update/fetch routes validate posting’s agency license.
- __Application status transitions__
  - Guarded by `ApplicationService.updateStatus`; terminal statuses prevent further updates except via controlled corrector paths.

---

## 10) Performance, Indexing, and Design Calls

- __JSONB & GIN__: Useful for flexible schemas; consider additional indexes if tag queries widen.
- __Matching Query__: Uses `EXISTS` on `jsonb_array_elements_text` for skills/education and join table for canonical titles; monitor performance if datasets grow.
- __Scoring__: Simple average; intentionally transparent and extensible.
- __Backwards Compatibility__: Tag fields are optional; existing job creation flows remain valid.

---

## 11) Configuration Flags in Matching

- `useCanonicalTitles` (default false): include canonical titles in base match.
- `includeScore` (default false; true for grouped): produce `fitness_score` per posting.
- `combineWith` in filters: `AND` or `OR` with country/salary blocks.
- Salary filtering supports base or converted values.

---

## 12) How To Extend

- __Scoring Weights__: Add weights for skills/education/experience; accept via query params.
- __Per-Title Pagination__: Already available (`/by-title`). Extend with cursor pagination if needed.
- __Analytics__: Add endpoints for time-series, funnel conversion, or agency dashboards.
- __Search__: Add full-text search across employers/positions with ILIKE or Postgres full-text.
- __Caching__: Introduce caching for job titles list and frequent analytics.

---

## 13) Troubleshooting

- __Tests timing out__: We run `--runInBand` with higher timeouts; ensure DB is running and seeds exist. Check `jest.config.ts`.
- __Validation errors__: Ensure seeds ran (countries, job titles) and canonical title IDs/names are valid/active.
- __Ownership errors__: Confirm the agency license in URL matches the posting’s contract agency license.

---

## 13) Automated Deployment & CI/CD

### GitHub Actions Deployment

The project uses GitHub Actions for automated deployment to staging/development environments:

**Trigger**: Push a `deploy` tag to trigger automatic deployment
```bash
git tag deploy
git push origin deploy
```

**Process**: 
- Code checkout from main branch
- Docker container rebuild and restart
- Health checks and validation
- Automatic rollback on failure

**Configuration**: 
- Location: `.github/workflows/docker-image.yml`
- Requires GitHub secrets: `DEV_IP`, `DEV_USER`, `DEV_PASS`, `DEV_PATH`
- Full documentation: `docs/github-actions-deployment.md`

### OpenAPI Automated Generation

The system automatically generates API clients and documentation:

**Generation Process**:
- OpenAPI spec exported from running server
- Dart client package generated automatically
- API documentation in Markdown format
- Contract validation through E2E tests

**Access Generated Files**:
- Location: `dev_tools/package_form_open_api/openapi/`
- Documentation: `dev_tools/package_form_open_api/readme.md`
- Usage: Import as local package in Flutter/Dart projects

### Automated Testing Integration

**E2E Test Coverage**:
- Ramesh's complete journey test validates API contracts
- Comprehensive user flow validation
- Automatic contract validation against deployed services
- Regression protection for API changes

**Test Execution**:
```bash
# Run all tests
npm test -- --runInBand

# Run specific test files
npm test -- e2e.ramesh-journey.spec.ts
```

## 14) Quick Start Checklist

1. **Local Development**:
   - Run DB and app (docker-compose or your process manager)
   - Seed: `POST /countries/seedv1`, `POST /job-titles/seedv1`

2. **API Testing**:
   - Create Agency → Create Tagged Job Posting
   - Create Candidate → Add Job Profile with preferred titles
   - Fetch Relevant Jobs → Apply → Shortlist → Schedule Interview

3. **Automated Deployment**:
   - Commit and push changes to main branch
   - Tag for deployment: `git tag deploy && git push origin deploy`
   - Monitor deployment in GitHub Actions

4. **OpenAPI Client Generation**:
   - Ensure server is running and accessible
   - Run generation: `cd dev_tools/package_form_open_api && ./build.sh`
   - Test generated client against deployed server

5. **Validation**:
   - Run E2E tests: `npm test -- --runInBand`
   - Check API contracts through Ramesh's journey test
   - Verify deployment health: `docker-compose ps`

## 15) File Pointers (Where to Look)

- **Core Application**: `src/modules/` (candidate, domain, application, agency)
- **Deployment**: `.github/workflows/docker-image.yml`
- **OpenAPI Generation**: `dev_tools/package_form_open_api/`
- **E2E Tests**: `test/e2e.*.spec.ts` (especially `e2e.ramesh-journey.spec.ts`)
- **Documentation**: `docs/` (deployment guide, API contracts)
- **Data Contracts**: `data_crontacts/` (frontend contracts, analytics)

## 16) Deferred & Next Ideas

- **Performance Testing**: Load testing, response time validation
- **Multi-Environment Support**: Staging, production, blue-green deployment
- **Advanced CI/CD**: Zero-downtime deployments, automatic rollback
- **Enhanced Monitoring**: Integration with Prometheus, Grafana
- **API Versioning**: Versioned API endpoints and contracts

---

> This guide is intentionally comprehensive and conversational. If anything is unclear, search the referenced files or run the targeted tests named above to see concrete usage and behavior. For deployment-specific issues, see `docs/github-actions-deployment.md`. For OpenAPI integration, see `dev_tools/package_form_open_api/readme.md`.
