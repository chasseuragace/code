import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { AnnouncementType, OvertimePolicy, ProvisionType, ExpenseType, ExpensePayer } from 'src/modules/domain/domain.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

describe('Domain Interview - create and attach expenses', () => {
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let interviews: import('src/modules/domain/domain.service').InterviewService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
    interviews = boot.interviews;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('creates interview with an expense for a posting', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      posting_title: 'Posting for Interview',
      country: 'UAE',
      city: 'Dubai',
      announcement_type: AnnouncementType.FULL_AD,
      contract: {
        period_years: 2,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: OvertimePolicy.PAID,
        weekly_off_days: 1,
        food: ProvisionType.FREE,
        accommodation: ProvisionType.FREE,
        transport: ProvisionType.PAID,
      },
      positions: [
        { title: 'Role', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1500, currency: 'AED' } },
      ],
      // keep agency/employer from builder to ensure uniqueness across runs
    });

    const itv = await interviews.createInterview(posting.id, {
      interview_time: '11:00',
      location: 'HQ',
      expenses: [
        { expense_type: ExpenseType.DOCUMENT_PROCESSING, who_pays: ExpensePayer.WORKER, amount: 700, currency: 'NPR' },
      ],
    });

    expect(itv.id).toBeDefined();
    expect(itv.expenses?.length).toBe(1);
  });
});
