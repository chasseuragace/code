# Candidate/Applicant Module – Status Report

This report consolidates actual code and test coverage for candidate-facing use cases. It cites concrete files in the repository to ground each conclusion.

## Scope of this report
- Source analyzed:
  - Entities/Module/Service:
    - [src/modules/candidate/candidate.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.entity.ts:0:0-0:0)
    - [src/modules/candidate/candidate-job-profile.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate-job-profile.entity.ts:0:0-0:0)
    - [src/modules/candidate/candidate.module.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.module.ts:0:0-0:0)
    - [src/modules/candidate/candidate.service.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:0:0-0:0)
  - Tests:
    - [test/candidate.profile.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.profile.spec.ts:0:0-0:0)
    - [test/candidate.update-and-validate.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.update-and-validate.spec.ts:0:0-0:0)
    - [test/candidate.jobprofiles.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.jobprofiles.spec.ts:0:0-0:0)
    - [test/candidate.relevant-jobs.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.spec.ts:0:0-0:0)
    - [test/candidate.relevant-jobs.filters.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.filters.spec.ts:0:0-0:0)
    - [test/utils/candidateTestModule.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/utils/candidateTestModule.ts:0:0-0:0)
  - Reference docs:
    - [reference/applicant_module.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/applicant_module.md:0:0-0:0)
    - [reference/candidate_test_plan.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/candidate_test_plan.md:0:0-0:0)

- Out of scope for this report: UI/controllers. Focus is on entities, services, and test-verified behaviors.

---

## High-level Summary

- __Implemented (core working paths)__:
  - Candidate CRUD (create, partial update, find) with validations and phone normalization
  - Candidate Job Profiles (add, update, list) with validation and title integrity checks
  - Relevant Jobs retrieval by candidate preferences with country and salary filters (base and converted), pagination, and AND/OR composition

- __Partially implemented / planned__:
  - Job Title seeding
  - Applications (apply/withdraw) are designed in references but not implemented in the service yet

- __Deferred/Not implemented__:
  - JobApplication API (apply/withdraw)
  - Seed integrity/uniqueness tests for JobTitle

---

## Data Model (as implemented)

- __Candidate__ [src/modules/candidate/candidate.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.entity.ts:0:0-0:0)
  - Unique phone with index, E.164 storage
  - Optional JSONB for address, skills, education
  - Status flags and timestamps

- __CandidateJobProfile__ [src/modules/candidate/candidate-job-profile.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate-job-profile.entity.ts:0:0-0:0)
  - `candidate_id`, `profile_blob` (JSONB), `label`, timestamps
  - Used to store preference data such as `preferred_titles`

- __CandidatePreference__ [src/modules/candidate/candidate-preference.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate-preference.entity.ts:0:0-0:0)
  - `id` (UUID), `candidate_id` (UUID), `title` (string), `priority` (int, 1-based), timestamps
  - Unique on `(candidate_id, title)`
  - Represents explicit, ordered preferred job titles per candidate

- __Module wiring__ [src/modules/candidate/candidate.module.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.module.ts:0:0-0:0)
  - Registers repositories for [Candidate](cci:2://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.entity.ts:2:0-40:1), [CandidateJobProfile](cci:2://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate-job-profile.entity.ts:2:0-21:1), `JobTitle`, and `JobPosting`
  - Exposes [CandidateService](cci:2://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:40:0-303:1)

---

## Implemented Service Surface and Behaviors

- __Candidate profile__
  - [createCandidate(input)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:53:2-68:3) [src/modules/candidate/candidate.service.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:0:0-0:0)
    - Normalizes `phone` to E.164 with Nepal default (+977) if 10-digit local starting with 9
    - Validations: coordinates range, `skills`/`education` arrays of objects
    - Defaults `is_active=true`
  - [updateCandidate(id, input)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:74:2-102:3)
    - Partial updates; re-validates on changed fields; preserves other fields
  - [findById(id)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:70:2-72:3)

- __Job Profiles__
  - [addJobProfile(candidateId, { profile_blob, label? })](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:104:2-142:3)
    - Validates candidate existence
    - Validates `profile_blob` is object
    - If `profile_blob.preferred_titles` present:
      - Requires array of strings
      - Verifies titles exist and are active in `JobTitle` via `In([...])`
  - [updateJobProfile(id, { profile_blob?, label? })](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:144:2-158:3)
    - Validates `profile_blob` shape if provided
  - [listJobProfiles(candidateId)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:160:2-165:3) ordered by `updated_at DESC`

- __Relevant Jobs discovery__
  - [getRelevantJobs(candidateId, opts?)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:167:2-302:3)
    - Prefers explicit `CandidatePreference` titles ordered by `priority`
    - Falls back to most recent job profile `preferred_titles` when no preferences exist
    - Base query:
      - Active postings only (`jp.is_active = true`)
      - Joins `contracts`, `positions`, `employer`, `agency`
      - Order by `posting_date_ad DESC`
    - Title predicate: `positions.title IN (:...titles)`
    - Filters:
      - Country: supports string or array, uses `ILIKE` with OR semantics for array
      - Salary filtering:
        - Base: `positions.monthly_salary_amount` and `positions.salary_currency`
        - Converted: EXISTS against `salary_conversions` on `job_position_id`, with currency and min/max constraints
      - Combine mode: `AND` (default) or `OR` between title group and other filters
    - Pagination: `page` (default 1), `limit` (default 10)
    - Returns `{ data, total, page, limit }`

- __Candidate Preferences__
  - [listPreferences(candidateId)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:160:2-165:3)
    - Returns ordered list of `{ title, priority }`
  - [addPreference(candidateId, title)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:167:2-302:3)
    - Validates `title` against active `JobTitle`
    - Appends new titles to the end (priority = max + 1)
    - Re-adding an existing title moves it to the top (priority 1) and reindexes
  - [removePreference(candidateId, title)](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:226:2-260:3)
    - Removes if exists; idempotent
    - Reindexes remaining priorities to be continuous from 1

---

## Test-Verified Use Cases

- __Profile creation & normalization__ [test/candidate.profile.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.profile.spec.ts:0:0-0:0)
  - TC1.1: Minimal create; phone normalized to `+977...`; `is_active=true`
  - TC11.2: Already-normalized E.164 accepted unchanged
  - TC11.1: Unique phone enforced (relies on DB uniqueness)

- __Update & validation__ [test/candidate.update-and-validate.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.update-and-validate.spec.ts:0:0-0:0)
  - TC1.2: Full JSONB persistence for address/skills/education/passport
  - TC2.1: Partial update preserves other fields, updates timestamp
  - TC12.1: Invalid coordinates rejected
  - TC13.1: Invalid JSONB array shape rejected

- __Job profiles__ [test/candidate.jobprofiles.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.jobprofiles.spec.ts:0:0-0:0)
  - TC6.1: Add job profile with JSONB and label
  - TC7.1: Update job profile label and blob; verifies `updated_at` ordering
  - TC8.1: List job profiles ordered by `updated_at DESC`
  - TC13.2: Rejects non-object `profile_blob` on add/update

- __Relevant jobs by preferences__ [test/candidate.relevant-jobs.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.spec.ts:0:0-0:0)
  - Returns postings whose positions match `preferred_titles`
  - Country filter narrows results
  - Throws when no preferences exist

- __Advanced filters for relevant jobs__ [test/candidate.relevant-jobs.filters.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.filters.spec.ts:0:0-0:0)
  - AND: titles + country + base salary minimum
  - OR: titles OR country
  - Multi-country array filtering
  - Base salary range (min/max) behavior
  - Converted salary filtering (USD min; NPR min; NPR range) via `salary_conversions` EXISTS

- __Candidate Preferences entity and integration__ [test/candidate.preferences.entity.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.preferences.entity.spec.ts:0:0-0:0)
  - Uniqueness and ordering (append new; move-to-top on re-add)
  - Remove + reindex priorities
  - Validation against active `JobTitle`
  - `getRelevantJobs()` prefers preferences; falls back to job profile

- __Test bootstrapping/fixtures__ [test/utils/candidateTestModule.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/utils/candidateTestModule.ts:0:0-0:0)
  - In-memory-like Postgres via TypeORM with `synchronize: true`
  - Ensures candidate tables are cleared per suite
  - Integrates `DomainModule`, `JobTitleModule`, [CandidateModule](cci:2://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.module.ts:8:0-13:31)

---

## Features Explicitly Planned in Docs but Not Yet Implemented

From [reference/applicant_module.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/applicant_module.md:0:0-0:0) and [reference/candidate_test_plan.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/candidate_test_plan.md:0:0-0:0):

- __Preferences via dedicated entity__
  - UC3–UC5 CandidatePreference (add/remove/list) not implemented in the service
  - Current implementation relies on `CandidateJobProfile.profile_blob.preferred_titles`
  - Uniqueness and ordering by `priority` are not present in code

- __Applications__
  - UC9–UC10 apply/withdraw to `JobPosting` are not in [CandidateService](cci:2://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:40:0-303:1)
  - UC15–UC16 uniqueness and active/non-existent posting validations are not implemented

- __JobTitle seed integrity__
  - UC17 seed checks and title uniqueness tests are documented but not present here

- __Security and RLS__
  - Access control rules are documented (future-ready), not enforced at service layer

---

## Inferred/Implicit Use Cases

- __Phone normalization and uniqueness enforcement__
  - Supported via [normalizePhoneE164()](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:8:0-17:1) and DB unique index on `Candidate.phone`
  - Implicit behavior around Nepal default country code for local numbers

- __Preference validation via JobTitle__
  - Instead of an explicit preference table, the system validates `preferred_titles` against active `JobTitle` on job profile creation/update

- __Flexible filtering composition__
  - [getRelevantJobs()](cci:1://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:167:2-302:3) supports both AND/OR composition across core title-match and optional filters, enabling broader discovery scenarios

---

## Gaps and Risks

- __Preference management UX/consistency__
  - Preferences stored inside job profile JSONB may drift from a canonical JobTitle set without additional normalization beyond current checks at add/update time

- __Applications missing__
  - No ability to submit/withdraw applications yet; this limits end-to-end candidate flow

- __Seed/fixture coupling__
  - Relevant jobs matching assumes position titles align with active JobTitles; mismatches possible without stronger linkage (e.g., `job_title_id` on positions)

- __Constraints not encoded__
  - Uniqueness and integrity constraints for preferences and applications are not present as there are no respective entities implemented yet

---

## Status by Use Case (from [reference/candidate_test_plan.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/candidate_test_plan.md:0:0-0:0))

- __UC1 Create Candidate__: Implemented and tested
- __UC2 Update Candidate__: Implemented and tested
- __UC3–UC5 Candidate Preferences__: Planned in docs; not implemented in service (deferred)
- __UC6–UC8 Job Profiles__: Implemented and tested
- __UC9–UC10 Applications__: Planned; not implemented
- __UC11–UC13 Validations__: Implemented and tested (phone normalization/uniqueness, coordinates, JSONB shape)
- __UC14 Preference uniqueness__: Not applicable yet (no preference entity)
- __UC15 Application uniqueness__: Not implemented yet
- __UC16 Application to inactive/nonexistent__: Not implemented yet
- __UC17 JobTitle seed integrity__: Planned; not tested here

- __Converted Salary Filtering (note in test plan)__: Implemented and covered by [candidate.relevant-jobs.filters.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.filters.spec.ts:0:0-0:0)

---

## Recommended Next Actions

- __Finalize preference model__:
  - Decide whether to retain preferences in `profile_blob` or implement `CandidatePreference` entity per doc
  - If entity-based, implement add/remove/list + uniqueness and priority ordering

- __Implement Applications__:
  - Add `JobApplication` entity and service methods `apply/withdraw/listByCandidate`
  - Enforce uniqueness and active posting validation

- __Strengthen linkage to JobTitle__:
  - Optionally add `job_title_id` to `JobPosition` to avoid free-text mismatches
  - Or standardize title normalization more aggressively on posting creation

- __Seed and test JobTitle integrity__:
  - Implement seed from `reference/jobs/jobs.seed.json`
  - Add tests for uniqueness and expected fields

- __Access control__:
  - Add guards/policies or document how this will be enforced at API/RLS layer

---

## References

- Code:
  - [src/modules/candidate/candidate.service.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.service.ts:0:0-0:0)
  - [src/modules/candidate/candidate.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.entity.ts:0:0-0:0)
  - [src/modules/candidate/candidate-job-profile.entity.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate-job-profile.entity.ts:0:0-0:0)
  - [src/modules/candidate/candidate.module.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/src/modules/candidate/candidate.module.ts:0:0-0:0)

- Tests:
  - [test/candidate.profile.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.profile.spec.ts:0:0-0:0)
  - [test/candidate.update-and-validate.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.update-and-validate.spec.ts:0:0-0:0)
  - [test/candidate.jobprofiles.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.jobprofiles.spec.ts:0:0-0:0)
  - [test/candidate.relevant-jobs.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.spec.ts:0:0-0:0)
  - [test/candidate.relevant-jobs.filters.spec.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/candidate.relevant-jobs.filters.spec.ts:0:0-0:0)
  - [test/utils/candidateTestModule.ts](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/test/utils/candidateTestModule.ts:0:0-0:0)

- Design/Plans:
  - [reference/applicant_module.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/applicant_module.md:0:0-0:0)
  - [reference/candidate_test_plan.md](cci:7://file:///Users/ajaydahal/code/v2/meetings/delta_2/meetings/agency_research/code/reference/candidate_test_plan.md:0:0-0:0)

---

Summary of completion: I analyzed the candidate/applicant code and tests and compiled a concise, grounded status report with citations. If you want, I can save this as `reference/candidate_status_report.md` or expand any section with more detail.