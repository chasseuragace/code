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

  it('accepts profile with valid active preferred_titles', async () => {
    await jobTitles.upsertMany([
      { title: 'Welder', is_active: true, rank: 1 },
      { title: 'Electrician', is_active: true, rank: 2 },
    ]);

    const row = await candidates.addJobProfile(candidateId, {
      profile_blob: {
        preferred_titles: ['Welder', 'Electrician'],
        desired_countries: ['UAE'],
      },
      label: 'Valid Prefs',
    });

    expect(row.id).toBeTruthy();
    expect(row.profile_blob.preferred_titles).toEqual(['Welder', 'Electrician']);
  });

  it('rejects profile with non-existent title', async () => {
    await expect(
      candidates.addJobProfile(candidateId, {
        profile_blob: { preferred_titles: ['NoSuchTitle999'] },
      })
    ).rejects.toThrow(/Invalid or inactive job titles/);
  });

  it('rejects profile with inactive title', async () => {
    await jobTitles.upsertMany([{ title: 'Plumber', is_active: false, rank: 3 }]);

    await expect(
      candidates.addJobProfile(candidateId, {
        profile_blob: { preferred_titles: ['Plumber'] },
      })
    ).rejects.toThrow(/Invalid or inactive job titles/);
  });
});
