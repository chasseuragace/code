import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { JobPostingService } from 'src/modules/domain/domain.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { CandidateJobProfile } from 'src/modules/candidate/candidate-job-profile.entity';
import { JobPosting, JobContract, JobPosition, PostingAgency, Employer } from 'src/modules/domain/domain.entity';
import { clearDomain } from './utils/ops/clearDomain';

describe('Candidate relevant jobs by preferences', () => {
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

    // Ensure clean tables for deterministic assertions
    await clearDomain(moduleRef);

    // Also clear candidates to isolate
    const candidateRepo = moduleRef.get<any>(getRepositoryToken(Candidate));
    const jobProfileRepo = moduleRef.get<any>(getRepositoryToken(CandidateJobProfile));
    await jobProfileRepo.clear();
    await candidateRepo.clear();

    // Seed minimal job titles used in this test
    await titles.upsertMany([
      { title: 'Welder', rank: 1, is_active: true },
      { title: 'Driver', rank: 2, is_active: true },
      { title: 'Electrician', rank: 3, is_active: true },
      { title: 'Cook', rank: 4, is_active: true },
    ]);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('returns postings whose positions match preferred_titles', async () => {
    // Resolve canonical title IDs
    const welder = await titles.findByTitle('Welder');
    const driver = await titles.findByTitle('Driver');
    const electrician = await titles.findByTitle('Electrician');
    const cook = await titles.findByTitle('Cook');

    // Create postings
    const postingA = await jobs.createJobPosting({
      posting_title: 'A',
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: 'A Agency', license_number: 'LIC-A' },
      employer: { company_name: 'A Co', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Welder', vacancies: { male: 5, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } },
        { title: 'Driver', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 900, currency: 'AED' } },
      ],
      canonical_title_ids: [welder?.id, driver?.id].filter(Boolean) as string[],
    } as any);

    const postingB = await jobs.createJobPosting({
      posting_title: 'B',
      country: 'UAE',
      city: 'Abu Dhabi',
      posting_agency: { name: 'B Agency', license_number: 'LIC-B' },
      employer: { company_name: 'B Co', country: 'UAE', city: 'Abu Dhabi' },
      contract: { period_years: 1 },
      positions: [
        { title: 'Electrician', vacancies: { male: 3, female: 1 }, salary: { monthly_amount: 1100, currency: 'AED' } },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean) as string[],
    } as any);

    const postingC = await jobs.createJobPosting({
      posting_title: 'C',
      country: 'Qatar',
      city: 'Doha',
      posting_agency: { name: 'C Agency', license_number: 'LIC-C' },
      employer: { company_name: 'C Co', country: 'Qatar', city: 'Doha' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Cook', vacancies: { male: 10, female: 2 }, salary: { monthly_amount: 1200, currency: 'QAR' } },
      ],
      canonical_title_ids: [cook?.id].filter(Boolean) as string[],
    } as any);

    // Create candidate with preferences
    const cand = await candidates.createCandidate({ full_name: 'Test User', phone: '+9779811111111' });
    await candidates.addPreference(cand.id, 'Welder');
    await candidates.addPreference(cand.id, 'Electrician');

    const res = await candidates.getRelevantJobs(cand.id);
    const ids = res.data.map((p) => p.id);
    expect(ids).toContain(postingA.id);
    expect(ids).toContain(postingB.id);
    expect(ids).not.toContain(postingC.id);
  });

  it('applies country filter', async () => {
    const cand = await candidates.createCandidate({ full_name: 'Filter User', phone: '+9779822222222' });
    await candidates.addPreference(cand.id, 'Welder');
    await candidates.addPreference(cand.id, 'Electrician');

    const resUAE = await candidates.getRelevantJobs(cand.id, { country: 'UAE' });
    expect(resUAE.data.every((p) => (p.country || '').toLowerCase().includes('uae'))).toBe(true);

    const resQatar = await candidates.getRelevantJobs(cand.id, { country: 'Qatar' });
    // From setup, only postingC is in Qatar but it doesn't match preferences -> expect 0
    expect(resQatar.data.length).toBe(0);
  });

  it('throws when no preferences exist', async () => {
    const cand = await candidates.createCandidate({ full_name: 'No Pref', phone: '+9779833333333' });
    await expect(candidates.getRelevantJobs(cand.id)).rejects.toThrow('Candidate has no preferred job titles');
  });
});
