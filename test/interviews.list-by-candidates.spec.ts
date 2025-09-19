import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainWithApplicationTestModule } from './utils/testModuleWithApplication';
import { createPostingWithDefaults } from './utils/ops/domainOps';
import { AnnouncementType, OvertimePolicy, ProvisionType } from 'src/modules/domain/domain.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from 'src/modules/candidate/candidate.entity';

function isoDate(daysFromToday = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

describe('InterviewsService.listByCandidate', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;
  let interviews: import('src/modules/domain/domain.service').InterviewService;
  let apps: import('src/modules/application/application.service').ApplicationService;
  let candidateRepo: Repository<Candidate>;

  beforeAll(async () => {
    const boot = await bootstrapDomainWithApplicationTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;
    interviews = boot.interviews;
    apps = boot.apps;
    candidateRepo = moduleRef.get<Repository<Candidate>>(getRepositoryToken(Candidate));
  });

  afterAll(async () => {
    // Clean up candidates to avoid duplicate key violations in future runs
    await candidateRepo.clear();
    await moduleRef?.close();
  });

  it('returns upcoming-first interviews for given candidate IDs, paginated', async () => {
    // Create posting
    const posting = await createPostingWithDefaults(jobs, {
      posting_title: 'Interview Listing Test',
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

    // Create two candidates with unique phone numbers
    const timestamp = new Date().getTime();
    const c1 = await candidateRepo.save(candidateRepo.create({ full_name: 'Alice', phone: `+9779800000001${timestamp}`.slice(0, 20), is_active: true }));
    const c2 = await candidateRepo.save(candidateRepo.create({ full_name: 'Bob', phone: `+9779800000002${timestamp}`.slice(0, 20), is_active: true }));

    // Apply and schedule interviews
    const app1 = await apps.apply(c1.id, posting.id, {});
    const app2 = await apps.apply(c2.id, posting.id, {});

    // Schedule: c1 has earlier interview (tomorrow), c2 later (day after)
    await apps.scheduleInterview(app1.id, { interview_date_ad: isoDate(1), interview_time: '10:00', location: 'Room A' });
    await apps.scheduleInterview(app2.id, { interview_date_ad: isoDate(2), interview_time: '09:30', location: 'Room B' });

    const res = await interviews.listByCandidate({ candidateId: c1.id, page: 1, limit: 10, only_upcoming: true, order: 'upcoming' });
    console.log(JSON.stringify(res, null, 2));

    expect(res.total).toBeGreaterThanOrEqual(1);
    expect(res.items.length).toBeGreaterThanOrEqual(1);

    // Ensure first item is the closest upcoming (c1)
    const d0 = res.items[0].interview_date_ad as any as Date;
    expect(new Date(d0).getTime()).toBeLessThanOrEqual(new Date().getTime() + 86400000);

    // Ensure mapping provides posting, agency, employer context through joins
    const first = res.items[0] as any;
    expect(first.job_posting?.id).toBeDefined();
    expect(first._agency?.name).toBeDefined();
    expect(first._employer?.company_name).toBeDefined();
  });
});
