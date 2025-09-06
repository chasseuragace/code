import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults, createInterviewWithExpense } from './utils/ops/domainOps';

/**
 * Covers:
 * - IV-2: Create interview without expenses -> expenses relation empty
 * - IV-3: Find interview by posting ID returns the interview with expenses relation
 */

describe('Domain Interview - find-by-posting and empty expenses', () => {
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

  it('IV-2: creates interview with no expenses; fetch shows empty relation', async () => {
    const posting = await createPostingWithDefaults(jobs);
    // Create interview with no expenses
    const created = await interviews.createInterview(posting.id, {
      interview_date_bs: '2081-01-02',
      interview_time: '10:00',
      location: 'Kathmandu',
      contact_person: 'Coordinator',
      required_documents: ['Passport', 'CV'],
      notes: 'No expenses for this one',
    });

    expect(created.id).toBeDefined();
    expect(Array.isArray(created.expenses)).toBe(true);
    expect(created.expenses.length).toBe(0);

    // Fetch by ID to ensure persistence of empty relation
    const byId = await interviews.findInterviewById(created.id);
    expect(byId.expenses?.length).toBe(0);
  });

  it('IV-3: find interview by posting ID returns the interview with expenses relation', async () => {
    const posting = await createPostingWithDefaults(jobs);
    // Create interview with one expense via helper
    await createInterviewWithExpense(interviews, posting.id, {
      interview_date_bs: '2081-01-15',
      location: 'Pokhara',
    });

    const found = await interviews.findInterviewByJobPosting(posting.id);
    expect(found).toBeTruthy();
    expect(Array.isArray(found!.expenses)).toBe(true);
    expect((found!.expenses as any[]).length).toBeGreaterThanOrEqual(1);
  });
});
