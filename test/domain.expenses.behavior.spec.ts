import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';
import {
  ExpensePayer,
  ExpenseType,
  TicketType,
} from 'src/modules/domain/domain.service';

/**
 * Covers:
 * - EX-2 is_free semantics
 * - EX-3 domestic vs foreign medical independence
 * - EX-4 travel ticket type mapping
 * - EX-E1 partial welfare/service sections
 * - EX-E2 fetch on posting with no expenses
 * - Duplicate expense type behavior note
 */
describe('Domain Expenses - behavior & edges', () => {
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

  it('EX-E2: fetch on posting with no expenses returns all nulls', async () => {
    const posting = await createPostingWithDefaults(jobs);
    const bundle = await expenses.getJobPostingExpenses(posting.id);
    expect(bundle.medical).toBeNull();
    expect(bundle.insurance).toBeNull();
    expect(bundle.travel).toBeNull();
    expect(bundle.visa).toBeNull();
    expect(bundle.training).toBeNull();
    expect(bundle.welfare).toBeNull();
  });

  it('EX-2/3/4/E1: create expenses with is_free semantics, medical domestic/foreign, travel ticket type, partial welfare/service', async () => {
    const posting = await createPostingWithDefaults(jobs);

    // Medical with both domestic and foreign
    await expenses.createMedicalExpense(posting.id, {
      domestic: { who_pays: ExpensePayer.COMPANY, is_free: true, notes: 'Company covered' },
      foreign: { who_pays: ExpensePayer.WORKER, amount: 200, currency: 'AED', notes: 'Abroad clinic' },
    });

    // Insurance with is_free true should persist without amount/currency
    await expenses.createInsuranceExpense(posting.id, {
      who_pays: ExpensePayer.AGENCY,
      is_free: true,
      notes: 'Provided by agency',
    });

    // Travel with ticket type mapping
    await expenses.createTravelExpense(posting.id, {
      who_pays: ExpensePayer.COMPANY,
      ticket_type: TicketType.ROUND_TRIP,
      amount: 1200,
      currency: 'AED',
      notes: 'Return included',
    } as any);

    // Visa with refundable flag and amount
    await expenses.createVisaPermitExpense(posting.id, {
      who_pays: ExpensePayer.WORKER,
      amount: 300,
      currency: 'AED',
      refundable: false,
      notes: 'Gov fee',
    } as any);

    // Training with duration and mandatory flag
    await expenses.createTrainingExpense(posting.id, {
      who_pays: ExpensePayer.COMPANY,
      amount: 100,
      currency: 'AED',
      duration_days: 3,
      mandatory: true,
      notes: 'Orientation',
    } as any);

    // WelfareService with partial sections
    await expenses.createWelfareServiceExpense(posting.id, {
      welfare: { who_pays: ExpensePayer.WORKER, amount: 50, currency: 'AED', notes: 'Welfare fund' },
      // service section omitted intentionally
    });

    const bundle = await expenses.getJobPostingExpenses(posting.id);

    // Medical assertions
    expect(bundle.medical).toBeTruthy();
    expect(bundle.medical?.domestic_is_free).toBe(true);
    expect(bundle.medical?.domestic_amount).toBeNull();
    expect(Number(bundle.medical?.foreign_amount)).toBe(200);
    expect(bundle.medical?.foreign_currency).toBe('AED');

    // Insurance is_free
    expect(bundle.insurance).toBeTruthy();
    expect(bundle.insurance?.is_free).toBe(true);
    expect(bundle.insurance?.amount).toBeNull();
    expect(bundle.insurance?.currency).toBeNull();

    // Travel ticket type
    expect(bundle.travel).toBeTruthy();
    expect(bundle.travel?.ticket_type).toBe(TicketType.ROUND_TRIP);
    expect(Number(bundle.travel?.amount)).toBe(1200);

    // Visa and Training basic fields
    expect(Number(bundle.visa?.amount)).toBe(300);
    expect(bundle.visa?.currency).toBe('AED');
    expect(bundle.training?.duration_days).toBe(3);

    // Welfare partial
    expect(Number(bundle.welfare?.welfare_amount)).toBe(50);
    expect(bundle.welfare?.welfare_currency).toBe('AED');
    expect(bundle.welfare?.service_amount).toBeNull();
  });

  it('Duplicate expense type behavior: creating two insurance expenses does not throw; get returns one', async () => {
    const posting = await createPostingWithDefaults(jobs);

    const a = await expenses.createInsuranceExpense(posting.id, {
      who_pays: ExpensePayer.WORKER,
      amount: 10,
      currency: 'AED',
      notes: 'A',
    });
    const b = await expenses.createInsuranceExpense(posting.id, {
      who_pays: ExpensePayer.WORKER,
      amount: 20,
      currency: 'AED',
      notes: 'B',
    });

    const got = await expenses.getJobPostingExpenses(posting.id);
    expect(got.insurance).toBeTruthy();
    // Since repository.findOne has no ORDER BY, it may return either A or B; assert it matches one of them
    expect([10, 20]).toContain(Number(got.insurance?.amount ?? -1));
  });
});
