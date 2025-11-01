# Candidates Mobile App API – Jobs Discovery

This folder documents the API contracts for the Candidate persona (mobile app):
- Filter jobs (list)
- Job details (by ID)

These contracts are based on:
- Persona and data model: `reference/applicant_module.md`
- Implemented filtering behaviors in tests: `test/candidate.relevant-jobs.filters.spec.ts`

## Endpoints

1) GET /candidates/:candidateId/jobs
- Purpose: return jobs relevant to the candidate with filters and pagination.
- Query params (all optional unless stated):
  - `country` (string or CSV list). Example: `UAE` or `UAE,Qatar`
  - `salary.min` (number)
  - `salary.max` (number)
  - `salary.currency` (string, e.g., `AED`, `USD`, `NPR`)
  - `salary.source` (string: `base` | `converted`)
  - `combineWith` (string: `AND` | `OR`) – how to combine preferred titles with filters
  - `page` (number, default 1)
  - `limit` (number, default 10)
  - `q` (string; free text on title/agency/employer/city) [optional]
  - `activeOnly` (boolean; default true)

- Returns: a paginated list with minimally necessary card info.
  - Note: `fitness_score` is included by default in list items (0–100), computed from skills/education overlap and experience bounds.

2) GET /jobs/:jobId
- Purpose: return detailed job information for the job details screen (public/read-only).
- Optionally, GET /candidates/:candidateId/jobs/:jobId to enrich with candidate-specific context (e.g., already applied?).

3) GET /candidates/:candidateId/jobs/:jobId
- Purpose: candidate-context job details; same as public details plus `fitness_score`.
- Response sample: `job.details.with-fitness.response.sample.json`

## Samples

- Filter list
  - Request: `search.request.sample.json`
  - Response: `search.response.sample.json`
- Job details
  - Response: `job.details.response.sample.json`

## List Item (Card) Fields
- `id`
- `posting_title`
- `country`, `city`
- `primary_titles` (titles under positions, distinct)
- `salary`: base monthly range per currency, plus primary converted amounts if any
- `agency`: `{ name, license_number }`
- `employer`: `{ company_name, country, city }`
- `posting_date_ad`
- `cutout_url` (if available)
- `fitness_score` (0–100)

## Details Fields
- All list fields
- `announcement_type`
- `notes`
- `contract`: `{ period_years, renewable?, hours_per_day?, days_per_week?, overtime_policy?, weekly_off_days?, food?, accommodation?, transport?, annual_leave_days? }`
- `positions[]`: `{ title, vacancies: { male, female, total }, salary: { monthly_amount, currency, converted[] }, overrides: { ... } }`
- `skills[]`, `education_requirements[]`, `experience_requirements{}`
- `canonical_titles[]` (resolved names)
- `expenses`: `{ medical[], insurance[], travel[], visa_permit[], training[], welfare_service[] }`
- `interview?` (if present and public)
- `cutout_url`
- `fitness_score` (only on candidate-context endpoint)

Notes:
- Where converted salaries exist, include objects like `{ amount, currency }`.
- Only active postings should be returned in list by default.
