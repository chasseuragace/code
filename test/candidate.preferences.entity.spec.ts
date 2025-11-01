import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

/**
 * CandidatePreference specs
 * - CP-1: add unique preferences and move-to-top on re-add
 * - CP-2: remove preference and reindex
 * - CP-3: validation against JobTitle (non-existent/inactive)
 * - CP-4: getRelevantJobs prefers CandidatePreference over job profile
 */

describe('Candidate Preferences (entity, ordering, integration)', () => {
  let moduleRef: TestingModule;
  let candidates: CandidateService;
  let jobTitles: JobTitleService;
  let candidateId: string;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = moduleRef.get(CandidateService);
    jobTitles = moduleRef.get(JobTitleService);

    const cand = await candidates.createCandidate({ full_name: 'Pref User', phone: '+9779811000000' });
    candidateId = cand.id;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('CP-1 adds preferences uniquely and reorders (move to top on re-add)', async () => {
    await jobTitles.upsertMany([
      { title: 'Welder', is_active: true, rank: 1 },
      { title: 'Electrician', is_active: true, rank: 2 },
      { title: 'PlumberX', is_active: true, rank: 3 },
    ]);

    await candidates.addPreference(candidateId, 'Welder');
    await candidates.addPreference(candidateId, 'Electrician');
    await candidates.addPreference(candidateId, 'PlumberX');

    let prefs = await candidates.listPreferences(candidateId);
    expect(prefs.map((p) => p.title)).toEqual(['Welder', 'Electrician', 'PlumberX']);
    expect(prefs.map((p) => p.priority)).toEqual([1, 2, 3]);

    // Re-add Electrician should move it to top
    await candidates.addPreference(candidateId, 'Electrician');
    prefs = await candidates.listPreferences(candidateId);
    expect(prefs.map((p) => p.title)).toEqual(['Electrician', 'Welder', 'PlumberX']);
    expect(prefs.map((p) => p.priority)).toEqual([1, 2, 3]);
  });

  it('CP-2 removes preference and reindexes priorities', async () => {
    // Remove the middle item (Welder now at priority 2)
    await candidates.removePreference(candidateId, 'Welder');
    const prefs = await candidates.listPreferences(candidateId);
    expect(prefs.map((p) => p.title)).toEqual(['Electrician', 'PlumberX']);
    expect(prefs.map((p) => p.priority)).toEqual([1, 2]);
  });

  it('CP-3 rejects invalid or inactive titles on add', async () => {
    await expect(candidates.addPreference(candidateId, 'NoSuchTitle999')).rejects.toThrow(/Invalid or inactive job title/);

    // Add inactive and expect rejection
    await jobTitles.upsertMany([{ title: 'Dormant', is_active: false, rank: 99 }]);
    await expect(candidates.addPreference(candidateId, 'Dormant')).rejects.toThrow(/Invalid or inactive job title/);
  });

  it('CP-4 getRelevantJobs requires preferences; no fallback to job profile when none', async () => {
    // With existing preferences, ensure it does not throw (smoke test)
    await candidates.addPreference(candidateId, 'Electrician');
    await expect(
      candidates.getRelevantJobs(candidateId, { page: 1, limit: 1 })
    ).resolves.toHaveProperty('page', 1);

    // Remove all preferences -> now should reject (no fallback)
    const current = await candidates.listPreferences(candidateId);
    for (const p of current) await candidates.removePreference(candidateId, p.title);

    await expect(
      candidates.getRelevantJobs(candidateId, { page: 1, limit: 1 })
    ).rejects.toThrow('Candidate has no preferred job titles');
  });
});
