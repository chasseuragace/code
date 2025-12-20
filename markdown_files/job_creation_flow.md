# UdaanSarathi Job Creation: Frontend Flow and JSON Contracts

This document specifies the multi-step job creation flow on the frontend and links to concrete JSON samples used by the backend (`CreateJobPostingDto`, tag updates, and expenses). All paths are relative to `src/resource/`.

- Backend references:
  - `src/modules/domain/domain.service.ts`
  - `src/modules/domain/dto/create-job-posting-with-tags.dto.ts`
  - `src/modules/job-title/job-title.entity.ts`
  - `src/modules/candidate/candidate-preference.entity.ts`

## Steps

1. Draft Create (minimal fields)
- Purpose: obtain a posting ID to attach details later.
- Minimal required fields (see CreateJobPostingDto):
  - `posting_title`, `country`, `posting_agency`, `employer`, `contract.period_years`, one minimal `position` (title + salary).
- Sample: `sample/data/jobs.create.sample.json`

2. Posting Details
- Enrich administrative fields:
  - `city`, `lt_number`, `chalani_number`, `approval_date_*`, `posting_date_*`, `announcement_type`, `notes`.
- API: partial update (PATCH) to posting.

3. Contract
- Fields: `period_years`, `renewable`, `hours_per_day`, `days_per_week`, `overtime_policy` (as_per_company_policy|paid|unpaid|not_applicable), `weekly_off_days`, `food|accommodation|transport` (free|paid|not_provided), `annual_leave_days`.

4. Positions (one-to-many)
- Each position requires `title`, `vacancies` (male/female), `salary.monthly_amount`, `salary.currency`.
- Optional overrides: `hours_per_day_override`, `days_per_week_override`, `overtime_policy_override`, `weekly_off_days_override`, `food_override`, `accommodation_override`, `transport_override`, `position_notes`.

5. Tags & Canonical Titles
- Fields: `skills[]`, `education_requirements[]`, `experience_requirements { min_years, preferred_years, domains[] }`, `canonical_title_ids[]` or `canonical_title_names[]`.
- API: tags-only update endpoint.
- Sample: `sample/data/jobs.update-tags.sample.json`
- Job titles sample: `sample/data/job-titles.sample.json`

6. Expenses (attach after draft exists)
- Types and samples:
  - Medical: `sample/data/expenses.medical.sample.json`
  - Insurance: extend similarly using payer + optional coverage
  - Travel: `sample/data/expenses.travel.sample.json`
  - Visa/Permit: `sample/data/expenses.visa.sample.json`
  - Training: `sample/data/expenses.training.sample.json`
  - Welfare/Service: `sample/data/expenses.welfare.sample.json`
- Common shape (ExpenseDto):
  - `who_pays`: company | worker | shared | not_applicable | agency
  - `is_free`: boolean
  - `amount?`, `currency?`, `notes?`

7. Cutout (job advert image)
- Purpose: store the actual advertisement cutout image (e.g., newspaper scan) for the posting.
- Endpoints:
  - Upload: `POST /agencies/:license/job-postings/:id/cutout` (form-data: `file`)
  - Remove: `DELETE /agencies/:license/job-postings/:id/cutout?deleteFile=true|false`
    - Default (or `false`): soft delete (clears DB `cutout_url`, file remains on disk)
    - `true`: hard delete (clears DB and deletes file from disk)
- Storage & Serving:
  - Files are stored at `public/<license>/<jobId>/cutout.<ext>`
  - Served via static path `/public/<license>/<jobId>/cutout.<ext>`
- Samples:
  - After upload: `sample/data/job.get.with-cutout.sample.json`
  - After soft delete: `sample/data/job.get.after-cutout-removed.sample.json`

8. Interview (optional)
- Fields: `interview_date_ad|bs`, `interview_time`, `location`, `contact_person`, `required_documents[]`, `notes`, optional `expenses[]`.

9. Review & Publish
- Summarize all sections; allow Save Draft or Publish (activate posting).

## JSON Samples

- Create job (draft or full): `sample/data/jobs.create.sample.json`
- Update tags: `sample/data/jobs.update-tags.sample.json`
- Job titles reference: `sample/data/job-titles.sample.json`
- Candidate preferences reference: `sample/data/candidate-preferences.sample.json`
- Expenses:
  - Medical: `sample/data/expenses.medical.sample.json`
  - Travel: `sample/data/expenses.travel.sample.json`
  - Visa/Permit: `sample/data/expenses.visa.sample.json`
  - Training: `sample/data/expenses.training.sample.json`
  - Welfare/Service: `sample/data/expenses.welfare.sample.json`

## Validation Highlights

- Country must exist (code or name) – enforced by backend lookup.
- Enum values must match backend:
  - `AnnouncementType`: full_ad | short_ad | update
  - `OvertimePolicy`: as_per_company_policy | paid | unpaid | not_applicable
  - `ProvisionType`: free | paid | not_provided
  - `ExpensePayer`: company | worker | shared | not_applicable | agency
  - `TicketType`: one_way | round_trip | return_only
- If an expense `is_free` is false, require `amount` and `currency`.

## Test Coverage

- Mixed payer expenses end-to-end verified by:
  - `test/flow.agency.create-job.expenses.spec.ts` (PASS)

Use these samples as canonical shapes for the frontend form payloads.
