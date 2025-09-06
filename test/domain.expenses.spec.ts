import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { AnnouncementType, OvertimePolicy, ProvisionType, ExpensePayer } from 'src/modules/domain/domain.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

describe('Domain Expenses - attach and fetch', () => {
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let expenses: import('src/modules/domain/domain.service').ExpenseService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
    expenses = boot.expenses;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('adds medical/insurance/travel/visa/training/welfare expenses and retrieves them', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      posting_title: 'Posting for Expenses',
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
    });

    await expenses.createMedicalExpense(posting.id, {
      domestic: { who_pays: ExpensePayer.WORKER, amount: 2000, currency: 'NPR' },
      foreign: { who_pays: ExpensePayer.COMPANY, is_free: true },
    });
    await expenses.createInsuranceExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true });
    await expenses.createTravelExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true });
    await expenses.createVisaPermitExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true });
    await expenses.createTrainingExpense(posting.id, { who_pays: ExpensePayer.AGENCY, amount: 5000, currency: 'NPR' });
    await expenses.createWelfareServiceExpense(posting.id, { welfare: { who_pays: ExpensePayer.WORKER, amount: 1000, currency: 'NPR' } });

    const all = await expenses.getJobPostingExpenses(posting.id);
    expect(all.medical).toBeTruthy();
    expect(all.insurance).toBeTruthy();
    expect(all.travel).toBeTruthy();
    expect(all.visa).toBeTruthy();
    expect(all.training).toBeTruthy();
    expect(all.welfare).toBeTruthy();
  });
});
