import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

describe('Domain Posting - idempotency and NotFound', () => {
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('JP-2: reuses existing PostingAgency and Employer across postings (idempotency)', async () => {
    // First posting creates agency/employer
    const p1 = await createPostingWithDefaults(jobs);
    const c1 = p1.contracts[0];
    const agencyId = (c1 as any).posting_agency_id || c1.agency?.id;
    const employerId = c1.employer?.id;

    expect(c1.agency?.id).toBeDefined();
    expect(c1.employer?.id).toBeDefined();

    // Second posting references the same license_number and employer triple via builders' defaults
    const p2 = await createPostingWithDefaults(jobs, {
      // Ensure same agency and employer identity by overriding to match p1's data
      posting_agency: {
        name: (c1.agency as any).name,
        license_number: (c1.agency as any).license_number,
      },
      employer: {
        company_name: c1.employer.company_name,
        country: c1.employer.country,
        city: c1.employer.city,
      },
    });

    const c2 = p2.contracts[0];

    // Both postings should reference the same underlying agency and employer IDs
    expect(c2.agency?.id).toBe(c1.agency?.id);
    expect(c2.employer?.id).toBe(c1.employer?.id);

    // Sanity: if direct FK fields are exposed, they should also match
    if ((c2 as any).posting_agency_id && (c1 as any).posting_agency_id) {
      expect((c2 as any).posting_agency_id).toBe((c1 as any).posting_agency_id);
    }
    if ((c2 as any).employer_id && (c1 as any).employer_id) {
      expect((c2 as any).employer_id).toBe((c1 as any).employer_id);
    }

    // Extra: ensure postings are distinct
    expect(p2.id).not.toBe(p1.id);
  });

  it('JP-4: findJobPostingById throws NotFound for unknown ID', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000';
    await expect(jobs.findJobPostingById(unknownId)).rejects.toThrow(NotFoundException);
  });
});
