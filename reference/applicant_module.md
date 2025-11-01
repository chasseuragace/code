# Applicant/Candidate Module – Feasibility Document

This document outlines a pragmatic design for introducing an Applicant/Candidate module alongside the existing Agency/Jobs domain. It focuses on data model, service surface, security, integration with current jobs, and migration path. No hires/applications processing workflow beyond “apply” is implemented now, but is sketched for later.

- Reference jobs list: `reference/jobs/jobs.md` (seed for JobTitle table)
- Existing jobs domain: `src/modules/domain/domain.service.ts`

## Goals
- Capture applicant profile data (identity, address, passport, skills, education).
- Allow applicants to express job title preferences (from controlled list).
- Support multiple job profiles as JSONB blobs.
- Allow applicants to apply to existing `JobPosting`.
- Keep future agency workflow (shortlist → interview → pass/fail) out-of-scope for implementation, but documented for extension.

## Scope
- In-scope: Data model, service APIs, TypeORM entity sketches, migrations plan, basic validation notes.
- Out-of-scope (now): UI, file storage service for certificates, agency-side workflow execution, notification system.

## High-level Model
```mermaid
erDiagram
  Candidate ||--|{ CandidatePreference : has
  Candidate ||--|{ CandidateJobProfile : has
  Candidate ||--|{ JobApplication : applies
  JobPosting ||--|{ JobApplication : receives
  JobTitle ||--o{ CandidatePreference : ref

  Candidate {
    uuid id
    string full_name
    string phone
    jsonb address              // { name, coordinates, province, district, municipality, ward }
    string passport_number
    jsonb skills[]             // [{ title, duration_months, documents: [url|id] }]
    jsonb education[]          // [{ title, institute, document: url|id }]
    bool is_active
    datetime created_at
    datetime updated_at
  }

  JobTitle {
    uuid id
    string title
    string sector      // optional categorization
    int    rank        // for ordering
    bool   is_active
  }

  CandidatePreference {
    uuid id
    uuid candidate_id
    uuid job_title_id
    int  priority      // 1..N, optional
    datetime created_at
  }

  CandidateJobProfile {
    uuid id
    uuid candidate_id
    jsonb profile_blob // arbitrary JSON per job/market
    string label       // e.g., "Gulf Driver Profile"
    datetime created_at
    datetime updated_at
  }

  JobApplication {
    uuid id
    uuid candidate_id
    uuid job_posting_id
    string status      // submitted | withdrawn | (future: shortlisted|interview_scheduled|passed|failed)
    jsonb metadata     // optional attachments, notes
    datetime created_at
    datetime updated_at
  }
```

## Entities – TypeORM Sketches
Implementation-ready once we create a `candidate` module.

```ts
// Candidate.entity.ts (sketch)
@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() full_name: string;
  @Column({ unique: true }) phone: string; // consider E.164 normalization
  @Column('jsonb', { nullable: true }) address?: {
    name?: string;
    coordinates?: { lat: number; lng: number };
    province?: string; district?: string; municipality?: string; ward?: string;
  };
  @Column({ nullable: true }) passport_number?: string;
  @Column('jsonb', { nullable: true }) skills?: Array<{ title: string; duration_months?: number; documents?: string[] }>;
  @Column('jsonb', { nullable: true }) education?: Array<{ title: string; institute?: string; document?: string }>;
  @Column({ default: true }) is_active: boolean;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}

// JobTitle.entity.ts (sketch)
@Entity('job_titles')
export class JobTitle {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) title: string;
  @Column({ nullable: true }) sector?: string;
  @Column({ type: 'int', default: 0 }) rank: number;
  @Column({ default: true }) is_active: boolean;
}

// CandidatePreference.entity.ts (sketch)
@Entity('candidate_preferences')
@Unique(['candidate_id', 'job_title_id'])
export class CandidatePreference {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') candidate_id: string;
  @Column('uuid') job_title_id: string;
  @Column({ type: 'int', nullable: true }) priority?: number;
  @CreateDateColumn() created_at: Date;
}

// CandidateJobProfile.entity.ts (sketch)
@Entity('candidate_job_profiles')
export class CandidateJobProfile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') candidate_id: string;
  @Column('jsonb') profile_blob: any;
  @Column({ nullable: true }) label?: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}

// JobApplication.entity.ts (sketch)
@Entity('job_applications')
@Unique(['candidate_id', 'job_posting_id'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') candidate_id: string;
  @Column('uuid') job_posting_id: string; // FK to JobPosting (domain.entity)
  @Column({ default: 'submitted' }) status: 'submitted' | 'withdrawn'; // extend later
  @Column('jsonb', { nullable: true }) metadata?: any;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

## Service Surface (NestJS Sketch)
- `CandidateService`
  - `createCandidate(dto)` / `updateCandidate(id, dto)` / `findById(id)`
  - `addPreference(candidateId, jobTitleId, priority?)`
  - `removePreference(candidateId, jobTitleId)`
  - `listPreferences(candidateId)`
  - `addJobProfile(candidateId, blob, label?)` / `updateJobProfile(id, blob?)` / `listJobProfiles(candidateId)`
- `JobTitleService`
  - `listJobTitles({ search?, sector?, active? })`
  - `seedFromReference()` reads `reference/jobs/jobs.md` (or a curated JSON) once and inserts.
- `ApplicationService`
  - `apply(candidateId, jobPostingId, metadata?)` (validates posting exists and is active)
  - `withdraw(applicationId)`
  - `listByCandidate(candidateId)`

Note: Job posting reads/writes reuse `JobPostingService` from `src/modules/domain/domain.service.ts`.

## API DTOs (Sketch)
```ts
// create/update candidate
{
  full_name: string,
  phone: string,
  address?: { name?: string, coordinates?: {lat:number,lng:number}, province?: string, district?: string, municipality?: string, ward?: string },
  passport_number?: string,
  skills?: Array<{ title: string, duration_months?: number, documents?: string[] }>,
  education?: Array<{ title: string, institute?: string, document?: string }>
}

// add preference
{ job_title_id: string, priority?: number }

// add job profile
{ label?: string, profile_blob: any }

// apply
{ job_posting_id: string, metadata?: any }
```

## Validation and Data Quality
- Phone normalization: E.164 format; uniqueness enforced.
- Passport format: optional; simple regex by country if desired.
- Coordinates: validate lat/lng ranges.
- Skills/Education documents: store URLs or object-storage keys (no binary in DB).
- Preferences: enforce `candidate_id + job_title_id` uniqueness.

## Security / Access Control (future-ready)
- If multi-tenant or public-facing API:
  - Candidates can only read/write their own `Candidate`, `CandidatePreference`, `CandidateJobProfile`, `JobApplication`.
  - Agencies can only read `JobApplication` for their postings (via join `JobPosting -> JobContract(posting_agency_id)`).
- Row-Level Security (if moved to Postgres policies later) can mirror these rules.

## Integration with Existing Domain
- Apply flow checks posting exists and is active via `JobPostingService.findJobPostingById()` and `jp.is_active`.
- Preferences tie against a controlled `JobTitle` table seeded from `reference/jobs/jobs.md`.
- No schema changes to current jobs tables are required.

## Migrations Plan
1. Create tables: `candidates`, `job_titles`, `candidate_preferences`, `candidate_job_profiles`, `job_applications`.
2. Seed `job_titles` from `reference/jobs/jobs.md` (one-time; or maintain a JSON seed file for deterministic load).
3. Add minimal indexes:
   - `candidates(phone) UNIQUE`, `job_titles(title) UNIQUE`.
   - `candidate_preferences(candidate_id, job_title_id) UNIQUE`.
   - `job_applications(candidate_id, job_posting_id) UNIQUE`.
   - Foreign keys to `job_postings(id)` if using TypeORM relations.

## Performance Considerations
- JSONB fields kept to reasonable size (profiles, skills/education arrays). Index selectively via GIN if heavy filters are needed later.
- Common queries:
  - `listJobTitles` (title ILIKE, sector) → btree idx on `(is_active, title)`.
  - `listByCandidate` for preferences and applications → btree on candidate_id.

## Future: Agency Workflow (document only)
- After application, the agency workflow per posting:
  - `shortlist` → `interview_scheduled` (with date/time + location) → `passed`/`failed`.
- This aligns with existing `InterviewDetail` if we later connect applications to interviews.
- Additional tables (later): `application_events` for audit trail; or extend `status` with timestamps.

## Open Questions
- Do we require candidate email separate from phone? OTP? Auth integration?
- Do we allow multiple addresses (perm / temp)?
- Do we need document verification for passport/certificates at this stage?
- Should preferences support ranking per country/market?

## Recommended Next Steps
- Approve schema and services surface.
- Decide on seeding mechanism for `JobTitle` (derive from `reference/jobs/jobs.md` to a canonical JSON and seed).
- Implement `candidate` Nest module: entities, services, tests.
- Expose minimal HTTP endpoints (optional) after services are tested.
