we are here in the workspace,
I will open the backend controllers to verify available endpoints that support the described job creation and expense flows. Specifically, I’ll check `src/modules/domain/domain.controller.ts` and [src/modules/agency/agency.controller.ts](cci:7://file:///Users/code_shared/portal/agency_research/code/src/modules/agency/agency.controller.ts:0:0-0:0).

I'll open [src/modules/agency/agency.controller.ts](cci:7://file:///Users/code_shared/portal/agency_research/code/src/modules/agency/agency.controller.ts:0:0-0:0) to verify which endpoints exist for job creation and related flows.

Short answer: Partially. You already have the key create and tags endpoints, but not the expense/interview/update endpoints the frontend stepper needs.

What exists now
- Agency job creation
  - POST `agencies/:license/job-postings`
    - In [AgencyController.createJobPostingForAgency](cci:1://file:///Users/code_shared/portal/agency_research/code/src/modules/agency/agency.controller.ts:104:2-130:3) uses [CreateJobPostingWithTagsDto](cci:2://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/dto/create-job-posting-with-tags.dto.ts:5:0-50:1) and infers `posting_agency` from the agency license.
- Tags
  - PATCH `agencies/:license/job-postings/:id/tags`
  - GET `agencies/:license/job-postings/:id/tags`
- Utilities/seed
  - POST `jobs/seedv1` in [DomainController](cci:2://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.controller.ts:5:0-36:1) for seeding (not a production endpoint)

What’s missing for the frontend flow
- Update posting details/contract
  - Backend service [JobPostingService.updateJobPosting()](cci:1://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.service.ts:326:2-343:3) exists, but there is no controller route for it.
  - Needed: PATCH `agencies/:license/job-postings/:id` to update partial posting details (Step 1) and contract (Step 2).
- Positions management
  - Create update/remove endpoints or a consolidated PATCH to manage the positions array.
  - Needed: POST/PUT/DELETE under `agencies/:license/job-postings/:id/positions` (or a single PATCH that replaces positions).
- Expenses
  - ExpenseService methods exist (medical, insurance, travel, visa, training, welfare) in [domain.service.ts](cci:7://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.service.ts:0:0-0:0), but not exposed via controller.
  - Needed:
    - POST `agencies/:license/job-postings/:id/expenses/medical`
    - POST `agencies/:license/job-postings/:id/expenses/insurance`
    - POST `agencies/:license/job-postings/:id/expenses/travel`
    - POST `agencies/:license/job-postings/:id/expenses/visa`
    - POST `agencies/:license/job-postings/:id/expenses/training`
    - POST `agencies/:license/job-postings/:id/expenses/welfare`
    - Optional GET `agencies/:license/job-postings/:id/expenses`
- Interview
  - [InterviewService](cci:2://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.service.ts:498:0-562:1) exists, but no controller endpoints shown.
  - Needed:
    - POST `agencies/:license/job-postings/:id/interview`
    - GET `agencies/:license/job-postings/:id/interview`
    - PATCH `agencies/:license/job-postings/:id/interview`
- Listing/find for an agency’s postings
  - [JobPostingService.findAllJobPostings(...)](cci:1://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.service.ts:311:2-324:3) exists; no controller route to expose it filtered by agency.
  - Needed:
    - GET `agencies/:license/job-postings?status=draft|active&...` to power the frontend list view

Proposed minimal API for the stepper
- Draft creation:
  - Use existing POST `agencies/:license/job-postings` with minimal payload to get the ID.
- Update details and contract:
  - PATCH `agencies/:license/job-postings/:id` (maps to [updateJobPosting](cci:1://file:///Users/code_shared/portal/agency_research/code/src/modules/domain/domain.service.ts:326:2-343:3) for fields under CreateJobPostingDto and contract).
- Manage positions:
  - Option A: PATCH `agencies/:license/job-postings/:id/positions` with the full desired positions array.
  - Option B: granular POST/PUT/DELETE for each position.
- Tags:
  - Use existing PATCH tags endpoint.
- Expenses:
  - Six POST endpoints as listed above.
- Interview:
  - POST/GET/PATCH as above.
- List:
  - GET postings for an agency with paging and optional filters.

Would you like me to implement these controller endpoints now?
- I can add them under [AgencyController](cci:2://file:///Users/code_shared/portal/agency_research/code/src/modules/agency/agency.controller.ts:12:0-176:1) to enforce ownership via license (mirroring your tag endpoints).
- I will include DTOs for request bodies and wire them to the existing services.
- I can also add quick Jest tests to cover a couple of endpoints (e.g., create interview; attach medical + travel expenses) to keep parity with the existing mixed-expense service test.
## Current Focus

- get the DTOs (frontend integration-ready) and prove end-to-end flows

## What we did (Sept 11)

- Generated canonical JSON samples for frontend contracts
  - `src/resource/sample/data/jobs.create.sample.json`
  - `src/resource/sample/data/jobs.update-tags.sample.json`
  - `src/resource/sample/data/job-titles.sample.json`
  - `src/resource/sample/data/candidate-preferences.sample.json`
  - Expenses:
    - `src/resource/sample/data/expenses.medical.sample.json`
    - `src/resource/sample/data/expenses.travel.sample.json`
    - `src/resource/sample/data/expenses.visa.sample.json`
    - `src/resource/sample/data/expenses.training.sample.json`
    - `src/resource/sample/data/expenses.welfare.sample.json`

- Documented the multi-step job creation flow (draft-first)
  - Overview: `src/resource/README.md`
  - Spec: `src/resource/job_creation_flow.md`

- Validated expense variations via Jest (worker/company/agency payers)
  - Test: `test/flow.agency.create-job.expenses.spec.ts` (PASS)

## How to regenerate samples (inside Docker)

```
docker compose exec -T server npm run emit:dto
```

Outputs to `src/resource/sample/data/`.

## Gaps identified (backend controllers)

- We have create + tags endpoints under `AgencyController`, but missing:
  - PATCH `agencies/:license/job-postings/:id` (update details/contract)
  - Positions management endpoints (add/update/remove or bulk PATCH)
  - Expenses endpoints (medical/insurance/travel/visa/training/welfare)
  - Interview endpoints (create/get/update)
  - Listing endpoint: GET `agencies/:license/job-postings` (with filters)

## Next Actions

1) Implement missing controller endpoints (see "Gaps identified")
2) Add OpenAPI-style YAML under `src/resource/` for job creation + tags + expenses + interview
3) Scaffold the React stepper using the documented flow and samples
4) Wire frontend calls to the new endpoints; iterate with sample payloads
5) Mark this doc as done once endpoints + stepper MVP are merged

## Definition of Done (for this phase)

- Frontend has concrete JSON contracts (samples) and documentation
- Backend exposes the needed endpoints for the stepper
- Mixed-payer expenses covered by tests (already passing) and accessible via API
- Frontend stepper can create a draft, enrich details, set tags, attach expenses, and publish
