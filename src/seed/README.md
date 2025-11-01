# Seeding Guide (Endpoint-only)

This document defines the canonical, endpoint-only seeding flow and the strict sequence:
1) Seed Countries — Required for Production
2) Seed Job Titles — Required for Production
3) Seed Jobs to Agencies (postings, contracts, positions) — Required for Production
4) Seed Agencies (Seed v1) — Development only (optional)

No automatic seeding at runtime is allowed. All seeding must be triggered via HTTP endpoints.

---

## 0. Prerequisites

- API available at `http://localhost:3000`
- Stack running via Docker Compose
  - `docker compose up -d`
- Optional: Reset DB for a clean seed
  - `docker compose down --volumes --remove-orphans && docker compose up -d --build`

Notes:
- In development, TypeORM is configured with `synchronize: true` and `migrationsRun: true`.
- Paths below assume running from the project root.

---

## 1) Seed Countries — Required for Production

- Seed file: `src/seed/countries.seed.json`
- Endpoint: `POST /countries/seedv1`

Run:
```
curl -X POST http://localhost:3000/countries/seedv1
```

What it does:
- Upserts country metadata (ISO code, name, currency and NPR multiplier) into the `countries` table.

---

## 2) Seed Job Titles — Required for Production

- Seed file: `src/seed/jobs.seed.json`
- Endpoint: `POST /job-titles/seedv1`

Run:
```
curl -X POST http://localhost:3000/job-titles/seedv1
```

What it does:
- Upserts rows into the `job_titles` table on unique `title` (idempotent)

---

## 3) Seed Jobs to Agencies — Required for Production

- Seed file: `src/seed/jobs-to-agencies.seed.json`
- Endpoint: `POST /jobs/seedv1`

Run:
```
curl -X POST http://localhost:3000/jobs/seedv1
```

What it does:
- Creates job postings with nested structures:
  - `PostingAgency` (reused by `license_number` where applicable)
  - `Employer`, `JobContract`, `JobPosition`s (+ salary conversions)

Sequence requirement:
- Run Step 1 (Countries) before creating postings so `country` validation passes.
- Run Step 2 (Job Titles) before Step 3 to keep position titles consistent with canonical job titles.

---

## 4) Seed Agencies (Seed v1) — Development only (optional)

- Seed data file: `src/seed/agencies.seed.json`
- Endpoint: `POST /agencies/seedv1`
- Behavior:
  - Inserts agencies using `license_number` as a natural unique key
  - Idempotent: existing agencies (same license) are reused

Run:

Option A – from host
```
curl -X POST http://localhost:3000/agencies/seedv1
```

Option B – from inside the server container
```
docker compose exec -T server sh -lc "apk add --no-cache curl >/dev/null 2>&1 || true; curl -s -X POST http://localhost:3000/agencies/seedv1"
```

Expected response shape:
```
{
  "source": "src/seed/agencies.seed.json",
  "inserted_or_reused": <number>,
  "agencies": [
    { "license_number": "LIC-AG-0001", "id": "<uuid>" },
    ...
  ]
}
```

---

## Troubleshooting

- API port already in use:
  - Stop the conflicting service or adjust `docker-compose.yml` port mappings.

- Migrations or schema errors on boot:
  - Ensure containers are healthy: `docker compose ps`
  - Tail logs: `docker compose logs -f server`
  - For a clean start: `docker compose down --volumes --remove-orphans && docker compose up -d --build`

- Reproducibility:
  - Seeding is idempotent where possible (agencies by `license_number`, job titles by `title`).

---

## Reference

- Agencies seed file: `src/seed/agencies.seed.json`
- Countries seed file: `src/seed/countries.seed.json`
- Job titles seed file: `src/seed/jobs.seed.json`
- Jobs to agencies seed file: `src/seed/jobs-to-agencies.seed.json`
- Endpoints: `POST /countries/seedv1`, `POST /job-titles/seedv1`, `POST /jobs/seedv1`, `POST /agencies/seedv1`

Deprecated (dev-only utilities):
- `src/seed/seed.ts` remains for local scripts but is not used by production flows. Prefer the HTTP endpoints above.
