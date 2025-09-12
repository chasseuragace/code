# UdaanSarathi Resource Index

Authoritative references for frontend–backend contracts and flows.

## Documents

- Job Creation Flow Spec
  - `job_creation_flow.md`
  - Describes multi-step draft-first creation, fields, validation, enums, and API mapping based on:
    - `src/modules/domain/domain.service.ts`
    - `src/modules/domain/dto/create-job-posting-with-tags.dto.ts`

## JSON Samples (canonical payloads)

- Job Posting (create / draft or full)
  - `sample/data/jobs.create.sample.json`
- Tag Updates (skills, education, experience, canonical titles)
  - `sample/data/jobs.update-tags.sample.json`
- Reference: Entities/Lookups
  - `sample/data/job-titles.sample.json`
  - `sample/data/candidate-preferences.sample.json`

### Expenses

- Medical
  - `sample/data/expenses.medical.sample.json`
- Travel
  - `sample/data/expenses.travel.sample.json`
- Visa/Permit
  - `sample/data/expenses.visa.sample.json`
- Training
  - `sample/data/expenses.training.sample.json`
- Welfare/Service
  - `sample/data/expenses.welfare.sample.json`

### Cutout (Job advert image)

- Job detail with cutout_url (after upload)
  - `sample/data/job.get.with-cutout.sample.json`
- Job detail after soft delete (DB cleared, file remains on disk)
  - `sample/data/job.get.after-cutout-removed.sample.json`

Static files note:
- Server exposes `/public/` for static assets. Uploaded cutouts are stored at `public/<license>/<jobId>/cutout.<ext>` and accessible at `/public/<license>/<jobId>/cutout.<ext>`.

## Test Coverage

- Mixed expense payers (worker/company/agency) verified by Jest:
  - `test/flow.agency.create-job.expenses.spec.ts`

## How to regenerate samples (inside Docker)

```bash
# From repo root
docker compose exec -T server npm run emit:dto
```

Outputs will be written under `src/resource/sample/data/`.
