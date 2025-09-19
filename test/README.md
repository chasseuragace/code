# Test Conventions

This project uses Jest to test domain services (NestJS + TypeORM) with a Postgres DB via docker-compose.

## Conventions

- **Bootstrapper**: Always set up test modules using `test/utils/testModule.ts` (`bootstrapDomainTestModule()`). It provides:
  - `jobs`: `JobPostingService`
  - `expenses`: `ExpenseService`
  - `interviews`: `InterviewService`
  - `moduleRef`: TestingModule to close in `afterAll`

- **Builders**: Prefer data builders for readability and deterministic data:
  - `test/utils/builders/posting.ts` → `buildPostingDto(overrides)`
  - `test/utils/builders/expenses.ts` → `expenseBuilders.*()` for all expense DTOs
  - `test/utils/builders/interview.ts` → `buildInterviewDto(overrides)`
  - Use `test/utils/id.ts` → `uniqueSuffix()` for predictable uniqueness when needed.

- **Ops helpers**: Use high-level ops where possible:
  - `test/utils/ops/domainOps.ts`
    - `createPostingWithDefaults(jobs, overrides?)`
    - `attachAllExpenses(expenses, postingId, overrides?)`
    - `createInterviewWithExpense(interviews, postingId, overrides?)`

- **Dates**: Services may serialize dates as strings. Assert date validity using parseability, e.g.:
  ```ts
  expect(Number.isNaN(new Date(value as any).getTime())).toBe(false);
  ```

- **Uniqueness**: To avoid DB unique constraint collisions across runs:
  - Do not hardcode `posting_agency.license_number` or `employer.company_name`.
  - Let builders generate unique values, or use `uniqueSuffix()` in overrides.

- **Cleanup**: Close the module in `afterAll`:
  ```ts
  afterAll(async () => {
    await moduleRef?.close();
  });
  ```

- **Environment**: Tests are intended to run in Docker. The server container mounts `src/` and `test/`, with DB from `db` service (see `docker-compose.yml`).

## Running tests in Docker

```bash
# from repo root of the service
docker compose up -d db
# run tests
docker compose run --rm server npm test
```

Optionally rebuild the server image when dependencies change:
```bash
docker compose build server
```

### Run specific tests (exec into running server container)

If your `server` container is already up (via `docker compose up -d server db`), you can run a subset of tests using `docker compose exec`:

```bash
docker compose exec server npm test -- \
  test/e2e.auth.register-verify.spec.ts \
  test/e2e.candidate.profile-crud.spec.ts
```

Notes:
- The `--` separates the `npm test` command from Jest's file args.
- You can pass globs or multiple file paths.
- Use `docker compose run --rm server npm test -- <files>` if the server container is not running; `exec` requires it to be running.

## Gotchas

- **Null vs undefined from ORM**
  - Optional fields sent as `undefined` may read back as `null`.
  - Prefer nullish assertions: `expect(obj.field == null).toBe(true)` when checking omitted optionals.

- **Decimal strings for numeric columns**
  - Monetary amounts can return as strings (e.g., `"1200.00"`).
  - Coerce in assertions: `Number(value)`.

- **Duplicate records and unordered fetches**
  - Without an explicit ORDER BY, a `findOne` may return any matching row.
  - Assert membership of acceptable values instead of a specific record when duplicates are possible.

- **Date assertions**
  - Dates may be serialized to strings; check parseability instead of `instanceof Date`.

- **Builders and uniqueness**
  - Use builders and `uniqueSuffix()` to avoid unique constraint collisions; avoid hardcoding identifiers.

- **Defaults and partial sections**
  - Verify defaults (e.g., announcement type, `posting_date_ad`).
  - Allow partial nested payloads where services support them (e.g., `welfare` without `service`).

- **Bootstrapper**
  - Use `bootstrapDomainTestModule()` consistently and close the `moduleRef` in `afterAll`.
