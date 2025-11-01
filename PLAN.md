# Plan

1) Bootstrap Dockerized NestJS + Postgres + TypeORM (done).
2) Implement entities, modules, services for agencies and jobs (done).
3) Implement domain module (JobPosting/Contract/Position + Expenses + Interview) (done).
4) Replace seed with domain-aware seed that creates a full posting -> contract -> positions + expenses + interview (done).
5) Add smoke tests for domain services under `test/domain.service.smoke.spec.ts` (done).
6) Run containers, seed DB, and run tests (ongoing as needed).
7) Only after services are fully tested, implement controllers and e2e tests for all endpoints.
8) Add Agency module (domain service first): profiles CRUD, directory/search, postings view, analytics — per `reference/agency.md`.
9) Write Agency tests per TESTPLAN (AG-CRUD, AG-DIR, AG-POST, AG-ANL). Ensure Docker tests pass.
10) Wire optional guards to prevent creating postings for inactive agencies (if desired). Then consider controllers + e2e.
