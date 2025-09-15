import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

describe('Candidate Preferences (validation against JobTitles)', () => {
  let moduleRef: TestingModule;
  let candidates: CandidateService;
  let jobTitles: JobTitleService;
  let candidateId: string;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = moduleRef.get(CandidateService);
    jobTitles = moduleRef.get(JobTitleService);

    const cand = await candidates.createCandidate({
      full_name: 'Test User',
      phone: '+9779800000000',
    });
    candidateId = cand.id;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('accepts adding preferences with valid active job titles', async () => {
    await jobTitles.upsertMany([
      { title: 'Welder', is_active: true, rank: 1 },
      { title: 'Electrician', is_active: true, rank: 2 },
    ]);

    await candidates.addPreference(candidateId, 'Welder');
    await candidates.addPreference(candidateId, 'Electrician');

    const rows = await candidates.listPreferenceRows(candidateId);
    const titles = rows.map((r: any) => r.title);
    expect(titles).toEqual(expect.arrayContaining(['Electrician', 'Welder']));
    expect(titles.length).toBe(2);
    expect(rows.every((r: any) => !!r.job_title_id)).toBeTruthy();
  });

  it('rejects adding preference with non-existent title', async () => {
    await expect(candidates.addPreference(candidateId, 'NoSuchTitle999')).rejects.toThrow(/Invalid or inactive job title/);
  });

  it('rejects adding preference with inactive title', async () => {
    await jobTitles.upsertMany([{ title: 'Plumber', is_active: false, rank: 3 }]);
    await expect(candidates.addPreference(candidateId, 'Plumber')).rejects.toThrow(/Invalid or inactive job title/);
  });
});
