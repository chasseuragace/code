# Learnings and Troubleshooting Log

This document captures issues encountered during initial setup of the Dockerized NestJS + TypeORM + Postgres project, and how we resolved them. It serves as a reference for future onboarding and debugging.

## Environment & Services

- __Context__
  - Docker services defined in `docker-compose.yml` for Postgres (`db`) and Nest server (`server`).
  - Source code mounted into the container for live reload. Tests and configs are also mounted to avoid rebuilds.

---

## Issues and Resolutions

- __Docker daemon not running__
  - Symptom: `Cannot connect to the Docker daemon ... Is the docker daemon running?`
  - Fix: Start Docker Desktop. Then run `docker compose up -d --build`.

- __Nest HTTP platform driver missing__
  - Symptom: `ERROR [PackageLoader] No driver (HTTP) has been selected ... install @nestjs/platform-express`
  - File(s): `package.json`
  - Fix: Add dependency `@nestjs/platform-express`. Rebuild/start containers.

- __Seed script path aliases not resolving__
  - Symptom: `Cannot find module 'src/config/typeorm.config'` when running `npm run seed`.
  - File(s): `tsconfig.json`, `src/seed/seed.ts`
  - Root Cause: Path mapping was too generic and not compatible with `ts-node -r tsconfig-paths/register` inside the container.
  - Fix: Set explicit mapping: `"paths": { "src/*": ["src/*"] }`. After this, `npm run seed` worked.

- __Jest using Babel instead of ts-jest__
  - Symptom: Parser error like `Missing semicolon` at valid TypeScript code; `jest --show-config` showed `babel-jest` transform.
  - File(s): `jest.config.js`, `package.json`
  - Fixes:
    - Add `jest.config.js` (CommonJS) with `preset: 'ts-jest'` and transform for `^.+\.ts$`.
    - Ensure `package.json` test script uses `jest --config jest.config.js`.
    - Result: ts-jest compiles `.ts` tests correctly.

- __Missing Nest testing utilities__
  - Symptom: `Cannot find module '@nestjs/testing'` in tests.
  - File(s): `package.json`
  - Fix: Add devDependency `@nestjs/testing` and install.

- __TypeORM DataSourceOptions typing issues in tests__
  - Symptom: TS2345 union typing errors when manually creating `new DataSource({...})` with altered options.
  - Files: `test/*.spec.ts`
  - Fix: Refactor tests to use `@nestjs/testing` + `TypeOrmModule.forRoot()` and `TypeOrmModule.forFeature(...)` instead of manual `DataSource` construction.

- __Test DB missing__
  - Symptom: `error: database "app_db_test" does not exist`
  - Decision: Use the same DB as the running server (`process.env.DB_DATABASE || 'app_db'`) since it was already seeded, instead of creating a separate test DB.
  - Files: `test/agencies.service.spec.ts`, `test/jobs.service.spec.ts`

- __Entity metadata not found for relations__
  - Symptom: `TypeORMError: Entity metadata for Agency#jobs was not found`
  - Root Cause: Only one side of the related entities was registered in the testing module.
  - Fix: Register both `Agency` and `Job` in `TypeOrmModule.forFeature([Agency, Job])` for tests.

- __Container not picking up Jest/package script changes__
  - Symptom: Jest config changes not reflected without rebuild.
  - File(s): `docker-compose.yml`
  - Fix: Mount `jest.config.js` and `package.json` into `/app` in `server` service volumes.

- __Jest worker did not exit gracefully warning__
  - Symptom: `A worker process has failed to exit gracefully...`
  - Cause: Open handles from Nest/TypeORM during tests.
  - Status: Tests pass; warning is benign. Improvement (optional): capture the Nest module returned by `compile()` and close it in `afterAll` using `await moduleRef.close()` or explicitly close the TypeORM connection.

- __Compose version warning__
  - Symptom: `the attribute version is obsolete` warning from Docker Compose.
  - Status: Non-blocking. We can remove the `version:` key from `docker-compose.yml` later.

---

## Current Known Good Setup

- __Seeding (Domain-aware)__
  - Command: `docker compose exec server npm run seed`
  - Behavior: Boots Nest app context and uses domain services (`JobPostingService`, `ExpenseService`, `InterviewService`) to create a full posting → contract → positions (+ salary conversions) and expenses + interview.
  - Result: `Seed complete (domain smoke)`.

- __Testing__
  - Command: `docker compose exec server npm test` (all tests) or `docker compose exec server npm test -- --runTestsByPath test/domain.service.smoke.spec.ts` (domain smoke only)
  - Result: Service-level tests for Agencies/Jobs and Domain pass.

- __Configs touched__
  - `package.json`: ensure `@nestjs/testing`, `ts-jest`, and `@types/jest` present; `test` script uses `jest.config.js`.
  - `tsconfig.json`: mapping for `src/*`; compatible with `ts-node -r tsconfig-paths/register`.
  - `jest.config.js`: ts-jest transform for `.ts`.
  - `docker-compose.yml`: mounts keep Jest and package updates live.
  - `test/*.spec.ts`: prefer Nest TestingModule + `TypeOrmModule.forRoot`/`forFeature` over manual `DataSource`.

---

## Follow-ups (Optional)

- __Silence Jest open-handle warning__: close Nest testing module or underlying data source in `afterAll`.
- __Remove Compose version key__: eliminate warning noise.
- __Add e2e tests__: after controllers are implemented, add Supertest-based e2e tests using the same DB.

---

## 2025-08-20 — Domain Testing Learnings

- __Null vs undefined from ORM__
  - Optional fields sent as `undefined` may persist and read back as `null`.
  - In tests, assert nullish with `field == null` for omitted optionals (e.g., `city`, `posting_date_bs`).
  - Applied in `test/domain.posting.overrides-edge.spec.ts` JP-E1.

- __Decimal strings for numeric columns__
  - Monetary amounts often return as strings (e.g., `"1200.00"`).
  - Coerce before assertions: `Number(value)`.
  - Applied in `test/domain.expenses.behavior.spec.ts` for medical/foreign, travel, visa, and welfare amounts.

- __Duplicate records and unordered fetches__
  - Creating multiple expenses for same type didn’t throw; `findOne` without ORDER BY may return any.
  - Tests should assert membership of acceptable values rather than a specific record.
  - Implemented for duplicate Insurance behavior.

- __Date field assertions__
  - Dates may be serialized; check parseability instead of `instanceof Date`.
  - Used in `test/domain.posting.update.spec.ts` and `test/domain.interview.update.spec.ts`.

- __Builders and uniqueness__
  - Rely on builders’ unique suffixes to avoid DB constraint collisions (avoid hardcoded identifiers).
  - Confirmed in `test/domain.interview.spec.ts` updates.

- __Defaults and partial sections__
  - Verified defaults (announcement type, `posting_date_ad`).
  - Supported partial nested payloads (e.g., `welfare` without `service`).
  - Covered in `test/domain.posting.overrides-edge.spec.ts` and `test/domain.expenses.behavior.spec.ts`.

- __Bootstrapper consistency__
  - Central `bootstrapDomainTestModule` continues to simplify setup/teardown and stability across specs.

### Jest Parallelism & Stability (2025-08-20)

- __Parallel flakiness__
  - Symptom: Running the full suite in parallel intermittently failed (timeouts, state bleed).
  - Action: Run serialized with `--runInBand` for stability while fixes land.

- __TypeORM pool error in spec bootstrap__
  - Symptom: `TypeOrmModule ... this.postgres.Pool is not a constructor` and hook timeouts in `test/candidate.preferences.spec.ts`.
  - Root Cause: The spec manually declared `TypeOrmModule.forRoot`, diverging from the shared test DB config.
  - Fix: Refactored the spec to use `bootstrapCandidateTestModule` from `test/utils/candidateTestModule.ts` (shared, stable Nest/TypeORM setup). All tests passed afterward.

- __Cross-suite data dependency__
  - Symptom: `test/domain.search.filters-unicode.spec.ts` failed when executed with the whole suite (ILIKE expectation false).
  - Cause: Seed/cleanup order sensitivity when sharing the DB across specs.
  - Fix: Ensure each spec seeds its own data and cleans related tables in `beforeAll`, and avoids relying on prior suites. After aligning setup, the suite passed consistently.

- __Open handles troubleshooting__
  - Guidance: Use `--detectOpenHandles` when needed and always `await moduleRef.close()` in `afterAll` for specs using Nest TestingModule to prevent lingering connections.

---

## 2025-08-20 — Owner Analytics Learnings

- __Test isolation in shared DB__
  - Problem: Analytics queries aggregate across the whole DB; shared test DB can pollute results.
  - Techniques used:
    - Seed analytics tests with far-future `posting_date_ad` (e.g., 2031) to keep buckets separate.
    - Add optional filters in services to scope data:
      - `getSalaryStatsByCurrency({ since?: Date })` to include only recent postings in tests.
      - `getDeactivationMetrics({ countries?: string[] })` to target seeded countries.
  - Outcome: Deterministic tests without interfering with existing records.

- __Deactivation duration guard__
  - Some records may have `updated_at < posting_date_ad` from synthetic fixtures or clock skew.
  - We clamp negative (future) durations out of the average to avoid skewing `avg_days_to_deactivate`.

- __Percentiles in Postgres__
  - `PERCENTILE_CONT(ARRAY[0.25, 0.5, 0.75]) WITHIN GROUP (ORDER BY amount)` works well for quartiles per currency.
  - Ensure numeric casts and consistent coercion to `number` in TypeScript when asserting.
