import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { AnnouncementType, OvertimePolicy, ProvisionType, ExpensePayer } from 'src/modules/domain/domain.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

/**
 * Verifies that when an agency creates a job posting, expenses can be attached with
 * mixed payers (worker/applicant, company/employer, agency) and are persisted correctly.
 */
describe('Flow: Agency creates job with mixed expense payers', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let expenses: import('src/modules/domain/domain.service').ExpenseService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
    expenses = boot.expenses;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('supports expenses paid by worker, employer, and agency', async () => {
    // Create a posting as an agency with a valid contract and one position
    const posting = await createPostingWithDefaults(jobs, {
      posting_title: 'Posting with Mixed Expenses',
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
        transport: ProvisionType.NOT_PROVIDED,
      },
      positions: [
        { title: 'General Worker', vacancies: { male: 2, female: 1 }, salary: { monthly_amount: 1200, currency: 'AED' } },
      ],
    });

    // Attach expenses with mixed payers/variations
    await expenses.createMedicalExpense(posting.id, {
      domestic: { who_pays: ExpensePayer.WORKER, amount: 2500, currency: 'NPR', notes: 'Medical in Nepal paid by worker' },
      foreign: { who_pays: ExpensePayer.COMPANY, is_free: true, notes: 'Medical abroad covered by employer' },
    });

    await expenses.createInsuranceExpense(posting.id, {
      who_pays: ExpensePayer.COMPANY,
      is_free: true,
      coverage_amount: 10000,
      coverage_currency: 'AED',
      notes: 'Comprehensive employer insurance',
    });

    await expenses.createTravelExpense(posting.id, {
      who_pays: ExpensePayer.COMPANY,
      is_free: false,
      amount: 800,
      currency: 'AED',
      ticket_type: 'round_trip' as any,
      notes: 'Round-trip ticket provided by employer',
    } as any);

    await expenses.createVisaPermitExpense(posting.id, {
      who_pays: ExpensePayer.WORKER,
      is_free: false,
      amount: 300,
      currency: 'AED',
      refundable: false,
      notes: 'Visa fee paid by worker',
    });

    await expenses.createTrainingExpense(posting.id, {
      who_pays: ExpensePayer.AGENCY,
      is_free: false,
      amount: 5000,
      currency: 'NPR',
      duration_days: 3,
      mandatory: true,
      notes: 'Pre-departure orientation shouldered by agency',
    });

    await expenses.createWelfareServiceExpense(posting.id, {
      welfare: { who_pays: ExpensePayer.WORKER, is_free: false, amount: 1500, currency: 'NPR', refundable: false, notes: 'Welfare fund' },
      service: { who_pays: ExpensePayer.COMPANY, is_free: true, service_type: 'accommodation', refundable: false, notes: 'Accommodation service' },
    });

    // Retrieve and assert persistence/fields
    const all = await expenses.getJobPostingExpenses(posting.id);
    expect(all.medical).toBeTruthy();
    expect(all.insurance).toBeTruthy();
    expect(all.travel).toBeTruthy();
    expect(all.visa).toBeTruthy();
    expect(all.training).toBeTruthy();
    expect(all.welfare).toBeTruthy();

    // Spot-check a few critical fields
    expect(all.medical?.domestic_who_pays).toBeDefined();
    expect(all.medical?.foreign_who_pays).toBeDefined();
    expect(all.insurance?.who_pays).toBeDefined();
    expect(all.travel?.who_provides).toBeDefined();
    expect(all.visa?.who_pays).toBeDefined();
    expect(all.training?.who_pays).toBeDefined();
  });
});
