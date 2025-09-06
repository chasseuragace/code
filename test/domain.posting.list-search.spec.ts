import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

describe('Domain Posting - list & search', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('paginates active postings and filters by country', async () => {
    // Seed a handful of postings with mixed countries
    const createdIds: string[] = [];
    for (let i = 0; i < 12; i++) {
      const country = i % 2 === 0 ? 'UAE' : 'Qatar';
      const posting = await createPostingWithDefaults(jobs, { country });
      createdIds.push(posting.id);
    }

    const page1 = await jobs.findAllJobPostings(1, 5);
    expect(page1.data.length).toBe(5);
    expect(page1.total).toBeGreaterThanOrEqual(12);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(5);

    const uaeOnly = await jobs.findAllJobPostings(1, 50, 'uae');
    expect(uaeOnly.data.every(p => p.country.toLowerCase().includes('uae'))).toBe(true);
  });

  it('searches by position title, salary ranges with currency, employer/agency names', async () => {
    // Distinct dataset
    const p1 = await createPostingWithDefaults(jobs, {
      posting_title: 'Searchable-1',
      country: 'UAE',
      employer: { company_name: 'Alpha Co', country: 'UAE', city: 'Dubai' },
      posting_agency: { name: 'Sunrise Agency', license_number: 'LIC-SUN' },
      positions: [{ title: 'Welder', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED' } }],
    });
    const p2 = await createPostingWithDefaults(jobs, {
      posting_title: 'Searchable-2',
      country: 'Qatar',
      employer: { company_name: 'Beta Industries', country: 'Qatar', city: 'Doha' },
      posting_agency: { name: 'Moonlight Agency', license_number: 'LIC-MOON' },
      positions: [{ title: 'Driver', vacancies: { male: 3, female: 1 }, salary: { monthly_amount: 2000, currency: 'QAR' } }],
    });

    // Position title filter (use higher limit to avoid pagination issues)
    const byTitle = await jobs.searchJobPostings({ position_title: 'weld', limit: 100 });
    expect(byTitle.data.some(p => p.id === p1.id)).toBe(true);

    // Salary min+currency
    const byMinSalary = await jobs.searchJobPostings({ min_salary: 1800, currency: 'QAR', limit: 100 });
    expect(byMinSalary.data.some(p => p.id === p2.id)).toBe(true);
    expect(byMinSalary.data.every(p => p.contracts.some(c => c.positions.some(pos => pos.salary_currency === 'QAR' && pos.monthly_salary_amount >= 1800)))).toBe(true);

    // Employer ILIKE
    const byEmployer = await jobs.searchJobPostings({ employer_name: 'alpha', limit: 100 });
    expect(byEmployer.data.some(p => p.id === p1.id)).toBe(true);

    // Agency ILIKE
    const byAgency = await jobs.searchJobPostings({ agency_name: 'moon', limit: 100 });
    expect(byAgency.data.some(p => p.id === p2.id)).toBe(true);
  });
});
