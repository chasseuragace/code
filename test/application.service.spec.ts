import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bootstrapApplicationTestModule } from './utils/applicationTestModule';
import { ApplicationService } from 'src/modules/application/application.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { JobApplication } from 'src/modules/application/job-application.entity';

describe('ApplicationService', () => {
  let moduleRef: TestingModule;
  let apps: ApplicationService;
  let candidateRepo: Repository<Candidate>;
  let postingRepo: Repository<JobPosting>;
  let appRepo: Repository<JobApplication>;

  beforeAll(async () => {
    const boot = await bootstrapApplicationTestModule();
    moduleRef = boot.moduleRef;
    apps = boot.apps;
    candidateRepo = moduleRef.get(getRepositoryToken(Candidate));
    postingRepo = moduleRef.get(getRepositoryToken(JobPosting));
    appRepo = moduleRef.get(getRepositoryToken(JobApplication));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const createCandidate = async (n = 1) => {
    const c = candidateRepo.create({ full_name: `Test User ${n}`, phone: `+97798000000${n}` });
    return candidateRepo.save(c);
  };

  const createPosting = async (n = 1, active = true) => {
    const p = postingRepo.create({ posting_title: `Worker ${n}`, country: 'UAE', is_active: active });
    return postingRepo.save(p);
  };

  it('apply: creates a new application with history and default status', async () => {
    const cand = await createCandidate(1);
    const post = await createPosting(1, true);

    const app = await apps.apply(cand.id, post.id, { note: 'initial apply', updatedBy: 'candidate:abc' });

    expect(app.id).toBeDefined();
    expect(app.status).toBe('applied');
    expect(app.history_blob.length).toBe(1);
    expect(app.history_blob[0].prev_status).toBeNull();
    expect(app.history_blob[0].next_status).toBe('applied');
  });

  it('apply: prevents duplicate applications to same posting', async () => {
    const cand = await createCandidate(2);
    const post = await createPosting(2, true);
    await apps.apply(cand.id, post.id);
    await expect(apps.apply(cand.id, post.id)).rejects.toThrow(/already applied/i);
  });

  it('listApplied: returns paginated results and can filter by status', async () => {
    const cand = await createCandidate(3);
    const postA = await createPosting(3, true);
    const postB = await createPosting(4, true);
    await apps.apply(cand.id, postA.id);
    await apps.apply(cand.id, postB.id);

    const page1 = await apps.listApplied(cand.id, { page: 1, limit: 1 });
    expect(page1.total).toBe(2);
    expect(page1.items.length).toBe(1);
    expect(page1.page).toBe(1);

    const onlyApplied = await apps.listApplied(cand.id, { status: 'applied' });
    expect(onlyApplied.total).toBe(2);
  });

  it('withdraw: marks as withdrawn with history and timestamp', async () => {
    const cand = await createCandidate(4);
    const post = await createPosting(5, true);
    const app = await apps.apply(cand.id, post.id, { updatedBy: 'candidate:4' });

    const withdrawn = await apps.withdraw(cand.id, post.id, { note: 'changed mind', updatedBy: 'candidate:4' });
    expect(withdrawn.status).toBe('withdrawn');
    expect(withdrawn.withdrawn_at).toBeInstanceOf(Date);
    expect(withdrawn.history_blob[withdrawn.history_blob.length - 1].next_status).toBe('withdrawn');

    // idempotent
    const again = await apps.withdraw(cand.id, post.id);
    expect(again.status).toBe('withdrawn');
  });

  it('updateStatus: enforces allowed transitions', async () => {
    const cand = await createCandidate(5);
    const post = await createPosting(6, true);
    const app = await apps.apply(cand.id, post.id);

    const s1 = await apps.updateStatus(app.id, 'shortlisted', { updatedBy: 'staff:1' });
    expect(s1.status).toBe('shortlisted');

    // invalid transition
    await expect(apps.updateStatus(s1.id, 'applied')).rejects.toThrow(/invalid status transition/i);

    const s2 = await apps.updateStatus(s1.id, 'interview_scheduled', { updatedBy: 'staff:2' });
    expect(s2.status).toBe('interview_scheduled');

    const s3 = await apps.updateStatus(s2.id, 'interview_passed', { updatedBy: 'staff:3' });
    expect(s3.status).toBe('interview_passed');

    // terminal
    await expect(apps.updateStatus(s3.id, 'interview_failed')).rejects.toThrow(/terminal/i);
  });

  it('makeCorrection: overrides to any status with audit note', async () => {
    const cand = await createCandidate(6);
    const post = await createPosting(7, true);
    const app = await apps.apply(cand.id, post.id);

    // Wrongly marked failed; correct to passed
    const s1 = await apps.updateStatus(app.id, 'interview_scheduled');
    const s2 = await apps.updateStatus(s1.id, 'interview_failed');
    const corrected = await apps.makeCorrection(s2.id, 'interview_passed', { reason: 'panel re-evaluated', updatedBy: 'admin:1' });

    expect(corrected.status).toBe('interview_passed');
    const last = corrected.history_blob[corrected.history_blob.length - 1];
    expect(last.corrected).toBe(true);
    expect(last.note).toMatch(/correction/i);
  });

  it('apply: rejects when posting is inactive', async () => {
    const cand = await createCandidate(7);
    const inactive = await createPosting(8, false);
    await expect(apps.apply(cand.id, inactive.id)).rejects.toThrow(/not active/i);
  });
});
