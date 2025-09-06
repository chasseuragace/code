import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';
import {
  AnnouncementType,
  OvertimePolicy,
  ProvisionType,
} from 'src/modules/domain/domain.service';

describe('Domain Posting - overrides and edges', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('persists position overrides and notes (JP-3)', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      positions: [
        {
          title: 'Technician',
          vacancies: { male: 2, female: 1 },
          salary: { monthly_amount: 1800, currency: 'AED' },
          hours_per_day_override: 10,
          days_per_week_override: 5,
          overtime_policy_override: OvertimePolicy.AS_PER_COMPANY_POLICY,
          weekly_off_days_override: 2,
          food_override: ProvisionType.PAID,
          accommodation_override: ProvisionType.NOT_PROVIDED,
          transport_override: ProvisionType.FREE,
          position_notes: 'Night shift',
        },
      ],
    });

    const pos = posting.contracts[0].positions[0];
    expect(pos.hours_per_day_override).toBe(10);
    expect(pos.days_per_week_override).toBe(5);
    expect(pos.overtime_policy_override).toBe(OvertimePolicy.AS_PER_COMPANY_POLICY);
    expect(pos.weekly_off_days_override).toBe(2);
    expect(pos.food_override).toBe(ProvisionType.PAID);
    expect(pos.accommodation_override).toBe(ProvisionType.NOT_PROVIDED);
    expect(pos.transport_override).toBe(ProvisionType.FREE);
    expect(pos.position_notes).toBe('Night shift');
  });

  it('accepts optional undefined fields on create (JP-E1)', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      city: undefined,
      approval_date_ad: undefined,
      posting_date_bs: undefined,
    });
    // Some drivers persist undefined as null; accept null or undefined
    expect(posting.city == null).toBe(true);
    expect((posting as any).approval_date_ad == null || !Number.isNaN(new Date((posting as any).approval_date_ad as any).getTime())).toBe(true);
    // posting_date_bs may be undefined or null if not provided
    expect((posting as any).posting_date_bs == null).toBe(true);
  });

  it('omits salary conversions when not provided (JP-E2)', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      positions: [
        {
          title: 'NoConv',
          vacancies: { male: 1, female: 0 },
          salary: { monthly_amount: 1000, currency: 'AED' },
        },
      ],
    });

    const pos = posting.contracts[0].positions[0];
    expect((pos as any).salaryConversions?.length || 0).toBe(0);
  });

  it('sets defaults for announcement type and posting_date_ad (CC-4)', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      announcement_type: undefined,
      posting_date_ad: undefined,
    });

    expect(posting.announcement_type).toBe(AnnouncementType.FULL_AD);
    // posting_date_ad defaults to now; validate parseable date
    expect(Number.isNaN(new Date((posting as any).posting_date_ad as any).getTime())).toBe(false);
  });
});
