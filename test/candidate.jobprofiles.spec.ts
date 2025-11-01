import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

// TC6.1 – Add a job profile for a candidate
// TC7.1 – Update a job profile (label and blob)
// TC8.1 – List job profiles ordered by updated_at desc

describe('Candidate - job profiles', () => {
  let moduleRef: TestingModule;
  let candidates: CandidateService;
  let app: INestApplication;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = boot.candidates;
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await moduleRef?.close();
  });

  it('TC8.1 lists the single job profile via HTTP endpoint (auto-created then updated)', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Lister HTTP Supertest',
      phone: '+9779810010998',
    });

    // auto-create via update
    const jp1 = await candidates.updateJobProfile(c.id, { profile_blob: { i: 1 }, label: 'one' });
    // update same profile
    const jp2 = await candidates.updateJobProfile(c.id, { profile_blob: { i: 2 }, label: 'two' });
    // touch later so it becomes the latest
    await candidates.updateJobProfile(c.id, { label: 'two*' });

    const res = await request(app.getHttpServer())
      .get(`/candidates/${c.id}/job-profiles`)
      .expect(200);

    const list = res.body as any[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    // the only profile should reflect latest update
    expect(list[0].id).toBe(jp2.id);
    expect(list[0].label).toBe('two*');
  });

  it('TC6.1 creates job profile via update and persists JSON blob', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Job Prof User',
      phone: '+9779810010001',
      address: { name: 'Loc A' },
    });

    const profileBlob = { summary: 'Welders profile', years: 4, skills: ['welding', 'safety'] };
    const jp = await candidates.updateJobProfile(c.id, { profile_blob: profileBlob, label: 'Default' });

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
    const first = await candidates.updateJobProfile(c.id, { profile_blob: { summary: 'v1' }, label: 'v1' });

    const updated = await candidates.updateJobProfile(c.id, {
      profile_blob: { summary: 'v2', tags: ['hot'] },
      label: 'v2',
    });
    expect(updated.label).toBe('v2');
    expect(updated.profile_blob.summary).toBe('v2');
    expect(updated.profile_blob.tags).toEqual(['hot']);
  });


  it('TC13.2 rejects non-object profile_blob for job profile', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Validator',
      phone: '+9779810010004',
    });

    await expect(
      candidates.updateJobProfile(c.id, { profile_blob: 'not-an-object' as any, label: 'x' }),
    ).rejects.toThrow('profile_blob must be a non-array object');

    const created = await candidates.updateJobProfile(c.id, { profile_blob: { ok: true }, label: 'ok' });
    await expect(
      candidates.updateJobProfile(c.id, { profile_blob: 123 as any }),
    ).rejects.toThrow('profile_blob must be a non-array object');
  });
});
