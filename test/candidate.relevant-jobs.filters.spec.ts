import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { JobPostingService } from 'src/modules/domain/domain.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { CandidateJobProfile } from 'src/modules/candidate/candidate-job-profile.entity';
import { clearDomain } from './utils/ops/clearDomain';
import { CountryService } from 'src/modules/country/country.service';

// NOTE: This suite scaffolds advanced filtering behavior.
// Some tests may be skipped until service implementation catches up.

describe('Candidate relevant jobs - advanced filters', () => {
  let moduleRef: TestingModule;
  let candidates: CandidateService;
  let jobs: JobPostingService;
  let titles: JobTitleService;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = boot.candidates;
    jobs = moduleRef.get(JobPostingService);
    titles = moduleRef.get(JobTitleService);

    // Clean domain & candidate tables
    await clearDomain(moduleRef);
    const candidateRepo = moduleRef.get<any>(getRepositoryToken(Candidate));
    const jobProfileRepo = moduleRef.get<any>(getRepositoryToken(CandidateJobProfile));
    await jobProfileRepo.clear();
    await candidateRepo.clear();

    // Seed required countries for this suite
    const countries = moduleRef.get(CountryService, { strict: false });
    await countries.upsertMany([
      { country_code: 'UAE', country_name: 'UAE', currency_code: 'AED', currency_name: 'Dirham', npr_multiplier: '36.00' },
      { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Riyal', npr_multiplier: '36.50' },
      { country_code: 'OMN', country_name: 'Oman', currency_code: 'OMR', currency_name: 'Rial', npr_multiplier: '350.00' },
    ]);

    // Seed titles used in tests
    await titles.upsertMany([
      { title: 'Welder', rank: 1, is_active: true },
      { title: 'Driver', rank: 2, is_active: true },
      { title: 'Electrician', rank: 3, is_active: true },
      { title: 'Cook', rank: 4, is_active: true },
    ]);

    // Seed postings for filters
    // UAE postings
    await jobs.createJobPosting({
      posting_title: 'UAE-Welder-High',
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: 'A', license_number: 'LIC-AF-1' },
      employer: { company_name: 'UAE Co 1', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Welder', vacancies: { male: 5, female: 0 }, salary: { monthly_amount: 1500, currency: 'AED', converted: [ { amount: 410, currency: 'USD' }, { amount: 55000, currency: 'NPR' } ] } },
      ],
    });

    await jobs.createJobPosting({
      posting_title: 'UAE-Driver-Low',
      country: 'UAE',
      city: 'Abu Dhabi',
      posting_agency: { name: 'B', license_number: 'LIC-AF-2' },
      employer: { company_name: 'UAE Co 2', country: 'UAE', city: 'Abu Dhabi' },
      contract: { period_years: 1 },
      positions: [
        { title: 'Driver', vacancies: { male: 3, female: 0 }, salary: { monthly_amount: 800, currency: 'AED', converted: [ { amount: 218, currency: 'USD' }, { amount: 20000, currency: 'NPR' } ] } },
      ],
    });

    // Qatar posting
    await jobs.createJobPosting({
      posting_title: 'Qatar-Electrician',
      country: 'Qatar',
      city: 'Doha',
      posting_agency: { name: 'C', license_number: 'LIC-AF-3' },
      employer: { company_name: 'QA Co', country: 'Qatar', city: 'Doha' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Electrician', vacancies: { male: 2, female: 1 }, salary: { monthly_amount: 1000, currency: 'QAR', converted: [ { amount: 275, currency: 'USD' }, { amount: 35000, currency: 'NPR' } ] } },
      ],
    });

    // Oman posting, unrelated title
    await jobs.createJobPosting({
      posting_title: 'Oman-Cook',
      country: 'Oman',
      city: 'Muscat',
      posting_agency: { name: 'D', license_number: 'LIC-AF-4' },
      employer: { company_name: 'OM Co', country: 'Oman', city: 'Muscat' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Cook', vacancies: { male: 2, female: 2 }, salary: { monthly_amount: 300, currency: 'OMR' } },
      ],
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('AND: titles + country + base salary min', async () => {
    const cand = await candidates.createCandidate({ full_name: 'AND User', phone: '+9779800000000' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Welder', 'Electrician'] } });

    // Expect only UAE-Welder-High when AND with UAE and salary >= 1200 AED
    const res = await candidates.getRelevantJobs(cand.id, {
      // planned options; implementation to follow
      country: 'UAE',
      salary: { min: 1200, currency: 'AED', source: 'base' },
      combineWith: 'AND',
    } as any);

    expect(res.data.some((p) => p.posting_title === 'UAE-Welder-High')).toBeTruthy();
    expect(res.data.some((p) => p.posting_title === 'UAE-Driver-Low')).toBeFalsy();
    expect(res.data.some((p) => p.posting_title === 'Qatar-Electrician')).toBeFalsy();
  });

  it('OR: titles OR country', async () => {
    const cand = await candidates.createCandidate({ full_name: 'OR User', phone: '+9779800000001' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Electrician'] } });

    // Expect either title match (Qatar-Electrician) OR country match (any UAE)
    const res = await candidates.getRelevantJobs(cand.id, {
      country: 'UAE',
      combineWith: 'OR',
    } as any);

    const titlesOrCountry = res.data.map((p) => p.posting_title);
    expect(titlesOrCountry.includes('Qatar-Electrician') || titlesOrCountry.includes('UAE-Welder-High') || titlesOrCountry.includes('UAE-Driver-Low')).toBeTruthy();
  });

  it('multi-country array', async () => {
    const cand = await candidates.createCandidate({ full_name: 'MultiCountry', phone: '+9779800000002' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Electrician', 'Welder'] } });

    const res = await candidates.getRelevantJobs(cand.id, {
      country: ['UAE', 'Qatar'],
      combineWith: 'AND',
    } as any);

    const countries = new Set(res.data.map((p) => (p.country || '').toLowerCase()));
    expect(countries.has('uae') || countries.has('qatar')).toBeTruthy();
  });

  it('salary range (base)', async () => {
    const cand = await candidates.createCandidate({ full_name: 'SalaryRange', phone: '+9779800000003' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Driver', 'Welder'] } });

    const res = await candidates.getRelevantJobs(cand.id, {
      salary: { min: 900, max: 1400, currency: 'AED', source: 'base' },
      combineWith: 'AND',
    } as any);

    const titlesFound = res.data.map((p) => p.posting_title);
    // UAE-Driver-Low (800) should be filtered out, UAE-Welder-High (1500) filtered out by max 1400
    expect(titlesFound.includes('UAE-Driver-Low')).toBeFalsy();
    expect(titlesFound.includes('UAE-Welder-High')).toBeFalsy();
  });

  it('converted salary min (USD)', async () => {
    const cand = await candidates.createCandidate({ full_name: 'ConvSalary', phone: '+9779800000004' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Welder', 'Driver'] } });

    const res = await candidates.getRelevantJobs(cand.id, {
      salary: { min: 300, currency: 'USD', source: 'converted' },
      combineWith: 'AND',
    } as any);

    const titlesFound = res.data.map((p) => p.posting_title);
    expect(titlesFound.includes('UAE-Welder-High')).toBeTruthy();
    expect(titlesFound.includes('UAE-Driver-Low')).toBeFalsy();
  });

  it('converted salary min (NPR)', async () => {
    const cand = await candidates.createCandidate({ full_name: 'ConvSalaryNPR', phone: '+9779800000005' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Welder', 'Driver'] } });

    const res = await candidates.getRelevantJobs(cand.id, {
      salary: { min: 50000, currency: 'NPR', source: 'converted' },
      combineWith: 'AND',
    } as any);

    const titlesFound = res.data.map((p) => p.posting_title);
    expect(titlesFound.includes('UAE-Welder-High')).toBeTruthy();
    expect(titlesFound.includes('UAE-Driver-Low')).toBeFalsy();
  });

  it('converted salary range (NPR 30k–50k)', async () => {
    const cand = await candidates.createCandidate({ full_name: 'ConvSalaryNPRRange', phone: '+9779800000006' });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Electrician'] } });

    const res = await candidates.getRelevantJobs(cand.id, {
      salary: { min: 30000, max: 50000, currency: 'NPR', source: 'converted' },
      combineWith: 'AND',
    } as any);

    const titlesFound = res.data.map((p) => p.posting_title);
    expect(titlesFound).toContain('Qatar-Electrician');
  });
});
