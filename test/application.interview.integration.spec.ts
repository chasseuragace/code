import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bootstrapApplicationTestModule } from './utils/applicationTestModule';
import { ApplicationService } from 'src/modules/application/application.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { JobPosting, InterviewDetail } from 'src/modules/domain/domain.entity';
import { InterviewService } from 'src/modules/domain/domain.service';

/**
 * Covers interview scheduling, rescheduling and completion flows
 */
describe('Application ↔ Interview integration', () => {
  let moduleRef: TestingModule;
  let apps: ApplicationService;
  let interviews: InterviewService;
  let candidateRepo: Repository<Candidate>;
  let postingRepo: Repository<JobPosting>;
  let interviewRepo: Repository<InterviewDetail>;

  beforeAll(async () => {
    const boot = await bootstrapApplicationTestModule();
    moduleRef = boot.moduleRef;
    apps = boot.apps;
    interviews = moduleRef.get(InterviewService);
    candidateRepo = moduleRef.get(getRepositoryToken(Candidate));
    postingRepo = moduleRef.get(getRepositoryToken(JobPosting));
    interviewRepo = moduleRef.get(getRepositoryToken(InterviewDetail));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const createCandidate = async (n = 1) => {
    const c = candidateRepo.create({ full_name: `User ${n}`, phone: `+9779818${n}0000` });
    return candidateRepo.save(c);
  };

  const createPosting = async (n = 1, active = true) => {
    const p = postingRepo.create({ posting_title: `Role ${n}`, country: 'QA', is_active: active });
    return postingRepo.save(p);
  };

  it('scheduleInterview: creates InterviewDetail linked to application and updates status/history', async () => {
    const cand = await createCandidate(100);
    const post = await createPosting(100, true);
    const app = await apps.apply(cand.id, post.id);

    const scheduled = await apps.scheduleInterview(app.id, {
      interview_date_ad: '2025-09-01',
      interview_time: '10:00:00',
      location: 'Agency HQ',
      contact_person: 'Ms. Sita',
      notes: 'Bring passport',
    }, { updatedBy: 'staff:1', note: 'initial schedule' });

    expect(scheduled.status).toBe('interview_scheduled');
    const last = scheduled.history_blob[scheduled.history_blob.length - 1];
    expect(last.next_status).toBe('interview_scheduled');

    // Verify interview persisted and linked
    const found = await interviewRepo.find({ where: { job_posting_id: post.id } });
    const linked = found.find(f => f.job_application_id === app.id);
    expect(linked).toBeDefined();
    expect(linked?.location).toBe('Agency HQ');
  });

  it('rescheduleInterview: updates InterviewDetail and sets status', async () => {
    const cand = await createCandidate(101);
    const post = await createPosting(101, true);
    const app = await apps.apply(cand.id, post.id);
    await apps.scheduleInterview(app.id, { interview_date_ad: '2025-09-05', interview_time: '09:00:00', location: 'Room A' });

    // find interview for this application
    const all = await interviewRepo.find({ where: { job_posting_id: post.id } });
    const linked = all.find(f => f.job_application_id === app.id);
    expect(linked).toBeDefined();

    const res = await apps.rescheduleInterview(app.id, linked!.id, { interview_time: '11:30:00', location: 'Room B' }, { updatedBy: 'staff:2', note: 'panel delay' });
    expect(res.status).toBe('interview_rescheduled');

    const latest = await interviews.findInterviewById(linked!.id);
    expect(latest.interview_time).toBe('11:30:00');
    expect(latest.location).toBe('Room B');
  });

  it('completeInterview: marks pass/fail from scheduled states and becomes terminal', async () => {
    const cand = await createCandidate(102);
    const post = await createPosting(102, true);
    const app = await apps.apply(cand.id, post.id);
    await apps.scheduleInterview(app.id, { interview_date_ad: '2025-09-10', interview_time: '14:00:00' });

    const passed = await apps.completeInterview(app.id, 'passed', { updatedBy: 'panel:1', note: 'great fit' });
    expect(passed.status).toBe('interview_passed');

    await expect(apps.withdraw(cand.id, post.id)).rejects.toThrow(/terminal/i);
  });
});
