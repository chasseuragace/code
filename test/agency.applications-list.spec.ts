import { TestingModule } from '@nestjs/testing';
import { AgencyService } from 'src/modules/agency/agency.service';
import { AgencyApplicationsService } from 'src/modules/agency/agency-applications.service';
import { ApplicationService } from 'src/modules/application/application.service';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { uniqueSuffix } from './utils/id';
import { createPostingWithDefaults } from './utils/ops/domainOps';

// AG-APP-LIST: Agency Applications List Service

describe('Agency Applications List (AG-APP-LIST)', () => {
  let moduleRef: TestingModule;
  let agencies: AgencyService;
  let agencyApps: AgencyApplicationsService;
  let applications: ApplicationService;
  let candidates: CandidateService;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    agencies = boot.agencies;
    jobs = boot.jobs;
    applications = moduleRef.get(ApplicationService);
    candidates = moduleRef.get(CandidateService);
    agencyApps = moduleRef.get(AgencyApplicationsService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('AG-APP-LIST-01: should list all applications for an agency across multiple jobs', async () => {
    const suf = uniqueSuffix();
    
    // Create agency
    const agency = await agencies.createAgency({
      name: `Test Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    // Create two job postings
    const job1 = await createPostingWithDefaults(jobs, {
      posting_title: `Cook Job ${suf}`,
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Cook', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED' } },
      ],
    });

    const job2 = await createPostingWithDefaults(jobs, {
      posting_title: `Driver Job ${suf}`,
      country: 'Qatar',
      city: 'Doha',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Driver', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1500, currency: 'QAR' } },
      ],
    });

    // Create candidates
    const candidate1 = await candidates.createCandidate({
      full_name: `John Doe ${suf}`,
      phone: `+977-${suf.slice(0, 10)}1`,
      email: `john${suf}@test.com`,
    });

    const candidate2 = await candidates.createCandidate({
      full_name: `Jane Smith ${suf}`,
      phone: `+977-${suf.slice(0, 10)}2`,
      email: `jane${suf}@test.com`,
    });

    // Create applications
    const job1Positions = job1.contracts[0].positions;
    const job2Positions = job2.contracts[0].positions;

    await applications.apply(candidate1.id, job1.id, job1Positions[0].id, { note: 'Test application 1' });
    await applications.apply(candidate2.id, job1.id, job1Positions[0].id, { note: 'Test application 2' });
    await applications.apply(candidate1.id, job2.id, job2Positions[0].id, { note: 'Test application 3' });

    // Test: Get all applications for the agency
    const result = await agencyApps.getAgencyApplications(agency.license_number, {
      page: 1,
      limit: 10,
    });

    // Assertions
    expect(result.applications.length).toBe(3);
    expect(result.pagination.total).toBe(3);
    expect(Object.keys(result.candidates).length).toBe(2); // 2 unique candidates
    expect(Object.keys(result.jobs).length).toBe(2); // 2 unique jobs
    expect(Object.keys(result.positions).length).toBe(2); // 2 unique positions

    // Verify data structure
    const firstApp = result.applications[0];
    expect(firstApp.id).toBeDefined();
    expect(firstApp.candidate_id).toBeDefined();
    expect(firstApp.job_posting_id).toBeDefined();
    expect(firstApp.position_id).toBeDefined();
    expect(firstApp.status).toBe('applied');
    expect(typeof firstApp.priority_score).toBe('number');

    // Verify candidate data
    const candidate = result.candidates[firstApp.candidate_id];
    expect(candidate.full_name).toBeDefined();
    expect(candidate.phone).toBeDefined();
    expect(Array.isArray(candidate.skills)).toBe(true);

    // Verify job data
    const job = result.jobs[firstApp.job_posting_id];
    expect(job.posting_title).toBeDefined();
    expect(job.country).toBeDefined();

    // Verify position data
    const position = result.positions[firstApp.position_id];
    expect(position.title).toBeDefined();
    expect(position.monthly_salary_amount).toBeDefined();
  });

  it('AG-APP-LIST-02: should filter applications by status', async () => {
    const suf = uniqueSuffix();
    
    const agency = await agencies.createAgency({
      name: `Filter Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    const job = await createPostingWithDefaults(jobs, {
      posting_title: `Filter Job ${suf}`,
      country: 'UAE',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 3, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
      ],
    });

    const candidate1 = await candidates.createCandidate({
      full_name: `Candidate A ${suf}`,
      phone: `+977-${suf.slice(0, 10)}3`,
    });

    const candidate2 = await candidates.createCandidate({
      full_name: `Candidate B ${suf}`,
      phone: `+977-${suf.slice(0, 10)}4`,
    });

    const jobPositions = job.contracts[0].positions;
    
    const app1 = await applications.apply(candidate1.id, job.id, jobPositions[0].id);
    const app2 = await applications.apply(candidate2.id, job.id, jobPositions[0].id);

    // Shortlist one application
    await applications.updateStatus(app1.id, 'shortlisted');

    // Test: Filter by 'applied' status
    const appliedResult = await agencyApps.getAgencyApplications(agency.license_number, {
      stage: 'applied',
    });

    expect(appliedResult.applications.length).toBe(1);
    expect(appliedResult.applications[0].status).toBe('applied');

    // Test: Filter by 'shortlisted' status
    const shortlistedResult = await agencyApps.getAgencyApplications(agency.license_number, {
      stage: 'shortlisted',
    });

    expect(shortlistedResult.applications.length).toBe(1);
    expect(shortlistedResult.applications[0].status).toBe('shortlisted');
  });

  it('AG-APP-LIST-03: should filter applications by country', async () => {
    const suf = uniqueSuffix();
    
    const agency = await agencies.createAgency({
      name: `Country Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    const uaeJob = await createPostingWithDefaults(jobs, {
      posting_title: `UAE Job ${suf}`,
      country: 'UAE',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
      ],
    });

    const qatarJob = await createPostingWithDefaults(jobs, {
      posting_title: `Qatar Job ${suf}`,
      country: 'Qatar',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'QAR' } },
      ],
    });

    const candidate = await candidates.createCandidate({
      full_name: `Test Candidate ${suf}`,
      phone: `+977-${suf.slice(0, 10)}5`,
    });

    await applications.apply(candidate.id, uaeJob.id, uaeJob.contracts[0].positions[0].id);
    await applications.apply(candidate.id, qatarJob.id, qatarJob.contracts[0].positions[0].id);

    // Test: Filter by UAE
    const uaeResult = await agencyApps.getAgencyApplications(agency.license_number, {
      country: 'UAE',
    });

    expect(uaeResult.applications.length).toBe(1);
    expect(uaeResult.jobs[uaeResult.applications[0].job_posting_id].country).toBe('UAE');

    // Test: Filter by Qatar
    const qatarResult = await agencyApps.getAgencyApplications(agency.license_number, {
      country: 'Qatar',
    });

    expect(qatarResult.applications.length).toBe(1);
    expect(qatarResult.jobs[qatarResult.applications[0].job_posting_id].country).toBe('Qatar');
  });

  it('AG-APP-LIST-04: should paginate results correctly', async () => {
    const suf = uniqueSuffix();
    
    const agency = await agencies.createAgency({
      name: `Pagination Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    const job = await createPostingWithDefaults(jobs, {
      posting_title: `Pagination Job ${suf}`,
      country: 'UAE',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 5, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
      ],
    });

    // Create 5 candidates and applications
    for (let i = 0; i < 5; i++) {
      const candidate = await candidates.createCandidate({
        full_name: `Candidate ${i} ${suf}`,
        phone: `+977-${suf.slice(0, 9)}${i}6`,
      });
      await applications.apply(candidate.id, job.id, job.contracts[0].positions[0].id);
    }

    // Test: Page 1 with limit 2
    const page1 = await agencyApps.getAgencyApplications(agency.license_number, {
      page: 1,
      limit: 2,
    });

    expect(page1.applications.length).toBe(2);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.total).toBe(5);
    expect(page1.pagination.totalPages).toBe(3);
    expect(page1.pagination.hasNext).toBe(true);
    expect(page1.pagination.hasPrev).toBe(false);

    // Test: Page 2
    const page2 = await agencyApps.getAgencyApplications(agency.license_number, {
      page: 2,
      limit: 2,
    });

    expect(page2.applications.length).toBe(2);
    expect(page2.pagination.page).toBe(2);
    expect(page2.pagination.hasNext).toBe(true);
    expect(page2.pagination.hasPrev).toBe(true);

    // Test: Page 3 (last page)
    const page3 = await agencyApps.getAgencyApplications(agency.license_number, {
      page: 3,
      limit: 2,
    });

    expect(page3.applications.length).toBe(1);
    expect(page3.pagination.hasNext).toBe(false);
    expect(page3.pagination.hasPrev).toBe(true);
  });

  it('AG-APP-LIST-05: should get available countries for agency jobs', async () => {
    const suf = uniqueSuffix();
    
    const agency = await agencies.createAgency({
      name: `Countries Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    await createPostingWithDefaults(jobs, {
      posting_title: `UAE Job ${suf}`,
      country: 'UAE',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
      ],
    });

    await createPostingWithDefaults(jobs, {
      posting_title: `Qatar Job ${suf}`,
      country: 'Qatar',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'QAR' } },
      ],
    });

    const countries = await agencyApps.getAgencyJobCountries(agency.license_number);

    expect(countries.length).toBe(2);
    expect(countries).toContain('UAE');
    expect(countries).toContain('Qatar');
  });

  it('AG-APP-LIST-06: should get application statistics', async () => {
    const suf = uniqueSuffix();
    
    const agency = await agencies.createAgency({
      name: `Stats Agency ${suf}`,
      license_number: `REG-2025-${suf}`,
    });

    const job = await createPostingWithDefaults(jobs, {
      posting_title: `Stats Job ${suf}`,
      country: 'UAE',
      posting_agency: { name: agency.name, license_number: agency.license_number },
      positions: [
        { title: 'Worker', vacancies: { male: 3, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
      ],
    });

    const candidate1 = await candidates.createCandidate({
      full_name: `Candidate 1 ${suf}`,
      phone: `+977-${suf.slice(0, 10)}7`,
    });

    const candidate2 = await candidates.createCandidate({
      full_name: `Candidate 2 ${suf}`,
      phone: `+977-${suf.slice(0, 10)}8`,
    });

    const app1 = await applications.apply(candidate1.id, job.id, job.contracts[0].positions[0].id);
    const app2 = await applications.apply(candidate2.id, job.id, job.contracts[0].positions[0].id);

    await applications.updateStatus(app1.id, 'shortlisted');

    const stats = await agencyApps.getAgencyApplicationStatistics(agency.license_number);

    expect(stats.total).toBe(2);
    expect(stats.by_status['applied']).toBe(1);
    expect(stats.by_status['shortlisted']).toBe(1);
    expect(stats.by_country['UAE']).toBe(2);
  });
});
