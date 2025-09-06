import { TestingModule } from '@nestjs/testing';
import { AgencyService } from 'src/modules/agency/agency.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { uniqueSuffix } from './utils/id';
import { createPostingWithDefaults } from './utils/ops/domainOps';

// AG-ANL: Agency analytics

describe('Agency Analytics (AG-ANL)', () => {
  let moduleRef: TestingModule;
  let agencies: AgencyService;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let interviews: import('src/modules/domain/domain.service').InterviewService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    agencies = boot.agencies;
    jobs = boot.jobs;
    interviews = boot.interviews;
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('AG-11/12/13: counts and salary aggregates per currency from ACTIVE postings only', async () => {
    const suf = uniqueSuffix();
    const ag = await agencies.createAgency({ name: `Analytics AG ${suf}`, license_number: `LIC-A-${suf}` });

    // Active posting with two positions (AED)
    const p1 = await createPostingWithDefaults(jobs, {
      posting_title: `ANL-1-${suf}`,
      posting_agency: { name: ag.name, license_number: ag.license_number },
      positions: [
        { title: 'Welder', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED' } },
        { title: 'Driver', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1500, currency: 'AED' } },
      ],
    });

    // Active posting with one position (QAR)
    const p2 = await createPostingWithDefaults(jobs, {
      posting_title: `ANL-2-${suf}`,
      posting_agency: { name: ag.name, license_number: ag.license_number },
      positions: [
        { title: 'Cook', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 2000, currency: 'QAR' } },
      ],
    });

    // Inactive posting should not affect salary aggregates or active count
    const p3 = await createPostingWithDefaults(jobs, {
      posting_title: `ANL-3-${suf}`,
      posting_agency: { name: ag.name, license_number: ag.license_number },
      positions: [
        { title: 'Helper', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 9999, currency: 'AED' } },
      ],
    });
    await jobs.deactivateJobPosting(p3.id);

    // Interviews on p1 and p2
    await interviews.createInterview(p1.id, { location: 'HQ', notes: 'p1 interview' });
    await interviews.createInterview(p2.id, { location: 'HQ', notes: 'p2 interview' });

    const anl = await agencies.getAgencyAnalytics(ag.id);

    expect(anl.total_postings).toBeGreaterThanOrEqual(3);
    expect(anl.active_postings).toBe(2);
    expect(anl.interviews_count).toBeGreaterThanOrEqual(2);

    // Salary aggregates per currency from ACTIVE postings only
    expect(anl.salary['AED']).toBeDefined();
    expect(anl.salary['AED'].min).toBe(1200);
    expect(anl.salary['AED'].max).toBe(1500);
    // avg between 1200 and 1500 -> 1350
    expect(Math.round(anl.salary['AED'].avg)).toBe(1350);

    expect(anl.salary['QAR']).toBeDefined();
    expect(anl.salary['QAR'].min).toBe(2000);
    expect(anl.salary['QAR'].max).toBe(2000);
    expect(anl.salary['QAR'].avg).toBe(2000);
  });
});
