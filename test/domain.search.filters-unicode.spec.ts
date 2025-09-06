import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';
import { uniqueSuffix } from './utils/id';

/**
 * Covers:
 * - ILIKE filters are case-insensitive substring matches for country/employer/agency/position
 * - Unicode strings work in ILIKE
 * - Deactivation propagates to search (search enforces is_active=true)
 */

describe('Domain Posting - search filters (ILIKE, Unicode) and deactivation propagation', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  const marker = `Search-UNI-${uniqueSuffix('-')}`;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;

    // Seed dataset with Unicode and mixed case values
    await createPostingWithDefaults(jobs, {
      posting_title: `${marker}-A`,
      country: 'Népal', // Unicode accented
      employer: { company_name: 'Álpha Technologies', country: 'Népal', city: 'Kathmandu' },
      posting_agency: { name: 'SÛnrise Agency', license_number: `LIC-UNI-${marker}-1` },
      positions: [{ title: 'Senior Déveloper', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 900, currency: 'NPR' } }],
    } as any);

    await createPostingWithDefaults(jobs, {
      posting_title: `${marker}-B`,
      country: 'nepal', // lower-case, no accent
      employer: { company_name: 'beta INDUSTRIES', country: 'nepal', city: 'Pokhara' },
      posting_agency: { name: 'moonLIGHT agency', license_number: `LIC-UNI-${marker}-2` },
      positions: [{ title: 'Júnior QA', vacancies: { male: 0, female: 2 }, salary: { monthly_amount: 1000, currency: 'NPR' } }],
    } as any);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('ILIKE: country filter is case-insensitive and supports Unicode', async () => {
    const r1 = await jobs.searchJobPostings({ country: 'NEP' }); // uppercase subset
    expect(r1.data.some(p => p.country.toLowerCase().includes('nep'))).toBe(true);

    const r2 = await jobs.searchJobPostings({ country: 'nép' }); // accented subset
    expect(r2.data.some(p => p.country.toLowerCase().includes('nép'.replace('é','e')) || p.country.toLowerCase().includes('nép'))).toBe(true);
  });

  it('ILIKE: employer, agency, and position filters are case-insensitive (note: ILIKE is not diacritic-insensitive by default)', async () => {
    const byEmployer = await jobs.searchJobPostings({ employer_name: 'álpha' });
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    expect(byEmployer.data.some(p => p.contracts.some(c => norm(c.employer.company_name).includes('alpha')))).toBe(true);

    const byAgency = await jobs.searchJobPostings({ agency_name: 'sûnrise' });
    expect(byAgency.data.some(p => p.contracts.some(c => norm(c.agency.name).includes('sunrise')))).toBe(true);

    const byPosition = await jobs.searchJobPostings({ position_title: 'dével' }); // Unicode substring
    expect(byPosition.data.some(p => p.contracts.some(c => c.positions.some(pos => norm(pos.title).includes('devel'))))).toBe(true);
  });

  it('Deactivation propagates to search (is_active=true enforced)', async () => {
    const p = await createPostingWithDefaults(jobs, { posting_title: `${marker}-ToDeactivate`, country: marker });
    const pre = await jobs.searchJobPostings({ country: marker });
    expect(pre.data.some(x => x.id === p.id)).toBe(true);

    await jobs.deactivateJobPosting(p.id);

    const post = await jobs.searchJobPostings({ country: marker });
    expect(post.data.some(x => x.id === p.id)).toBe(false);
  });
});
