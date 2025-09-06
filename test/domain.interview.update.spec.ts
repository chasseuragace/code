import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults, createInterviewWithExpense } from './utils/ops/domainOps';

describe('Domain Interview - create, update, not found', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let interviews: import('src/modules/domain/domain.service').InterviewService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
    interviews = boot.interviews;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('creates interview with one expense and then updates fields', async () => {
    const posting = await createPostingWithDefaults(jobs);

    const created = await createInterviewWithExpense(interviews, posting.id, {
      location: 'HQ Meeting Room',
      notes: 'Initial round',
    });

    expect(created.id).toBeDefined();
    expect(created.expenses?.length).toBe(1);

    const updated = await interviews.updateInterview(created.id, {
      interview_date_ad: new Date().toISOString(),
      location: 'Video Call',
      notes: 'Rescheduled',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.location).toBe('Video Call');
    expect(updated.notes).toBe('Rescheduled');
    // Ensure interview_date_ad is a valid date (string or Date)
    expect(Number.isNaN(new Date((updated as any).interview_date_ad as any).getTime())).toBe(false);
  });

  it('throws NotFound when updating non-existent interview', async () => {
    await expect(
      interviews.updateInterview('00000000-0000-0000-0000-000000000000', { location: 'Nowhere' }),
    ).rejects.toBeTruthy();
  });
});
