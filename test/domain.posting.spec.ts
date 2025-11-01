import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementType, OvertimePolicy, ProvisionType } from 'src/modules/domain/domain.service';
import { JobPostingService } from 'src/modules/domain/domain.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Domain Posting - create posting -> contract -> positions', () => {
  let jobs: JobPostingService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('creates posting with contract and positions', async () => {
    const posting = await createPostingWithDefaults(jobs, {
      announcement_type: AnnouncementType.FULL_AD,
      contract: {
        period_years: 2,
        renewable: true,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: OvertimePolicy.PAID,
        weekly_off_days: 1,
        food: ProvisionType.FREE,
        accommodation: ProvisionType.FREE,
        transport: ProvisionType.PAID,
      },
      positions: [
        { title: 'Role 1', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1500, currency: 'AED' } },
        { title: 'Role 2', vacancies: { male: 0, female: 2 }, salary: { monthly_amount: 1600, currency: 'AED' } },
      ],
    });

    expect(posting.id).toBeDefined();
    expect(posting.contracts?.length).toBeGreaterThan(0);
    expect(posting.contracts[0].positions?.length).toBe(2);
  });
});
