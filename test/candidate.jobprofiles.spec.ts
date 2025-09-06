import { TestingModule } from '@nestjs/testing';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

// TC6.1 – Add a job profile for a candidate
// TC7.1 – Update a job profile (label and blob)
// TC8.1 – List job profiles ordered by updated_at desc

describe('Candidate - job profiles', () => {
  let moduleRef: TestingModule;
  let candidates: CandidateService;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = boot.candidates;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('TC6.1 adds job profile for candidate and persists JSON blob', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Job Prof User',
      phone: '+9779810010001',
      address: { name: 'Loc A' },
    });

    const profileBlob = { summary: 'Welders profile', years: 4, skills: ['welding', 'safety'] };
    const jp = await candidates.addJobProfile(c.id, { profile_blob: profileBlob, label: 'Default' });

    expect(jp.id).toBeDefined();
    expect(jp.candidate_id).toBe(c.id);
    expect(jp.profile_blob.summary).toBe('Welders profile');
    expect(jp.label).toBe('Default');
  });

  it('TC7.1 updates job profile label and blob', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Job Prof Updater',
      phone: '+9779810010002',
    });
    const first = await candidates.addJobProfile(c.id, { profile_blob: { summary: 'v1' }, label: 'v1' });

    const updated = await candidates.updateJobProfile(first.id, {
      profile_blob: { summary: 'v2', tags: ['hot'] },
      label: 'v2',
    });
    expect(updated.label).toBe('v2');
    expect(updated.profile_blob.summary).toBe('v2');
    expect(updated.profile_blob.tags).toEqual(['hot']);
  });

  it('TC8.1 lists job profiles ordered by updated_at desc', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Lister',
      phone: '+9779810010003',
    });

    const jp1 = await candidates.addJobProfile(c.id, { profile_blob: { i: 1 }, label: 'one' });
    const jp2 = await candidates.addJobProfile(c.id, { profile_blob: { i: 2 }, label: 'two' });

    // touch jp1 to move it to top
    await candidates.updateJobProfile(jp1.id, { label: 'one*' });

    const list = await candidates.listJobProfiles(c.id);
    expect(list.length).toBe(2);
    // first should be jp1 due to recent update
    expect(list[0].id).toBe(jp1.id);
    expect(list[0].label).toBe('one*');
    expect(list[1].id).toBe(jp2.id);
  });

  it('TC13.2 rejects non-object profile_blob for job profile', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Validator',
      phone: '+9779810010004',
    });

    await expect(
      candidates.addJobProfile(c.id, { profile_blob: 'not-an-object' as any, label: 'x' }),
    ).rejects.toThrow('profile_blob must be an object');

    const created = await candidates.addJobProfile(c.id, { profile_blob: { ok: true }, label: 'ok' });
    await expect(
      candidates.updateJobProfile(created.id, { profile_blob: 123 as any }),
    ).rejects.toThrow('profile_blob must be an object');
  });
});
