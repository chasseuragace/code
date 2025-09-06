# Agency Module: Use Cases and Test Plan

This document defines the non-technical feature set (use cases), proposed data model, service surface, and a concrete test plan for an "agency" module that manages agency profiles and analytics in the job-portal domain.

## Scope
- Manage Agency profiles (distinct from Employers)
- Reuse existing Agency records in postings (already occurs by `license_number`)
- Provide read APIs for Agency directory, detail, and related postings
- Provide first-wave analytics per Agency

## Data Model (Profile)
Entity: `PostingAgency`
- `id: uuid`
- `license_number: string` (unique, primary identity for reuse)
- `name: string`
- `country?: string | null`
- `city?: string | null`
- `address?: string | null`
- `contact_email?: string | null`
- `contact_phone?: string | null`
- `website?: string | null`
- `logo_url?: string | null`
- `description?: string | null`
- `license_valid_till?: date | null`
- `is_active: boolean` (default true) – for soft deactivation of the Agency itself
- `created_at: timestamp`
- `updated_at: timestamp`

Relationships:
- 1..N `JobPosting` (existing), each posting references one `PostingAgency`

Notes:
- Existing createPosting flow must continue to "upsert by license_number" to avoid duplicates.

## Use Cases (Non-technical)
- Create agency profile
- Update agency profile (contact info, description, city/country)
- Deactivate/activate agency (hide from directory and exclude from future posting creation if needed)
- View agency profile (basic info + compliance fields)
- View agency’s postings (active/inactive)
- Search/list agencies by name/country/city/license (case-insensitive, Unicode-friendly)
- Analytics snapshot per agency
  - Active postings count
  - Total postings count
  - Interviews count for agency’s postings
  - Salary aggregates across positions in this agency’s active postings (min/max/avg per currency)

## Service Surface (Domain layer)
`AgencyService`
- `createAgency(dto: CreateAgencyDto): Promise<Agency>`
- `updateAgency(id: string, dto: UpdateAgencyDto): Promise<Agency>`
- `deactivateAgency(id: string): Promise<void>`
- `activateAgency(id: string): Promise<void>`
- `findAgencyById(id: string): Promise<Agency>`
- `findAgencyByLicense(license: string): Promise<Agency>`
- `listAgencies(filters: { name?: string; country?: string; city?: string; license_number?: string; page?: number; limit?: number; }): Promise<{ data: Agency[]; total: number; page: number; limit: number; }>`
- `getAgencyPostings(id: string, opts?: { active_only?: boolean; page?: number; limit?: number; }): Promise<{ data: JobPosting[]; total: number; page: number; limit: number; }>`
- `getAgencyAnalytics(id: string): Promise<AgencyAnalytics>`

`AgencyAnalytics`
- `active_postings: number`
- `total_postings: number`
- `interviews_count: number`
- `salary: Record<currency, { min: number; max: number; avg: number }>`

DTOs (indicative)
- `CreateAgencyDto`: `license_number`, `name`, optional contact/address fields
- `UpdateAgencyDto`: partial of profile fields except `license_number`

## Test Plan (Suites and Cases)

### 1) Agency Profile CRUD (AG-CRUD)
- AG-1: create agency with minimal fields (name, license); fetch by id and license
- AG-2: update profile fields (city, contact info); verify persistence
- AG-3: deactivate/activate agency; verify directory behavior (excluded when inactive)
- AG-4: prevent duplicate by license_number: creating again returns/uses the same agency

### 2) Agency Directory and Search (AG-DIR)
- AG-5: list agencies paginated; verify total, first/last/empty page behavior
- AG-6: filter by name (ILIKE, Unicode), country, city, license (case-insensitive)
- AG-7: deactivated agencies excluded by default; optional flag to include

### 3) Agency Postings (AG-POST)
- AG-8: get agency’s postings – active_only true returns only active
- AG-9: after deactivating a posting, it disappears from active_only view
- AG-10: pagination edges on agency’s postings list

### 4) Agency Analytics (AG-ANL)
- AG-11: active_postings and total_postings reflect reality
- AG-12: interviews_count aggregates across this agency’s postings
- AG-13: salary aggregates (min/max/avg) computed per currency from positions in active postings
  - amounts stored as numeric strings in PG should be coerced to numbers for assertions (consistency with existing tests)

### Cross-Cutting Test Conventions
- Use `bootstrapDomainTestModule()` for setup/teardown
- Use builders with unique suffixes to avoid collisions
- Coerce decimal strings to numbers in assertions
- Treat optional fields as nullish when persisted
- Date assertions: check parseability
- Unicode/ILIKE for name filters

## Non-Functional
- Pagination defaults consistent with job postings
- Soft-deletes via `is_active` on Agency; no cascade deletion of postings
- Transactions around create/update where needed

## Incremental Delivery Plan
1) Implement `AgencyService` CRUD + directory (AG-CRUD, AG-DIR)
2) Implement postings view (AG-POST)
3) Implement analytics (AG-ANL)
4) Wire optional guards to prevent creating postings for inactive agencies (if desired)
