# Notes

- __Seed (domain-aware)__
  - File: `src/seed/seed.ts`
  - Behavior: Boots Nest app context and uses `JobPostingService`, `ExpenseService`, `InterviewService` to create a sample JobPosting → Contract → Positions (+ conversions) and attach all expense types + an interview.
  - Run: `docker compose exec server npm run seed`

- __Domain services__ (in `src/modules/domain/`)
  - Entities: `JobPosting`, `PostingAgency`, `Employer`, `JobContract`, `JobPosition`, `SalaryConversion`, `MedicalExpense`, `InsuranceExpense`, `TravelExpense`, `VisaPermitExpense`, `TrainingExpense`, `WelfareServiceExpense`, `InterviewDetail`, `InterviewExpense`.
  - Services: `JobPostingService`, `ExpenseService`, `InterviewService`.

- __Smoke tests__
  - File: `test/domain.service.smoke.spec.ts`
  - Runs a full creation flow and asserts contracts, positions, and expenses persist. Run with: `docker compose exec server npm test -- --runTestsByPath test/domain.service.smoke.spec.ts`

- __Other tests__
  - `test/agencies.service.spec.ts`, `test/jobs.service.spec.ts` cover the simple modules.

- __Next__
  - Add controllers and e2e tests after services are fully validated.
