import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { AnnouncementType } from 'src/modules/domain/domain.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';

describe('Domain Posting - update and deactivate', () => {
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

  it('updates posting header fields and converts AD date strings', async () => {
    const posting = await createPostingWithDefaults(jobs);

    const updated = await jobs.updateJobPosting(posting.id, {
      posting_title: posting.posting_title + ' - Updated',
      country: 'United Arab Emirates',
      city: 'Dubai Marina',
      lt_number: 'LT-123',
      chalani_number: 'CH-456',
      approval_date_bs: '2081-01-01',
      approval_date_ad: new Date().toISOString(),
      posting_date_bs: '2081-01-02',
      announcement_type: AnnouncementType.SHORT_AD,
      notes: 'Updated header',
    });

    expect(updated.id).toBe(posting.id);
    expect(updated.posting_title).toContain('Updated');
    expect(updated.country).toBe('United Arab Emirates');
    expect(updated.city).toBe('Dubai Marina');
    expect(updated.announcement_type).toBe(AnnouncementType.SHORT_AD);
    // Ensure approval_date_ad is a valid date (string or Date)
    expect(Number.isNaN(new Date((updated as any).approval_date_ad as any).getTime())).toBe(false);
  });

  it('deactivates posting and is excluded from active lists', async () => {
    const posting = await createPostingWithDefaults(jobs);

    await jobs.deactivateJobPosting(posting.id);

    // findAllJobPostings (default isActive=true) should not include it
    const list = await jobs.findAllJobPostings(1, 10);
    const ids = list.data.map((p) => p.id);
    expect(ids).not.toContain(posting.id);

    // Direct fetch returns with is_active=false
    const byId = await jobs.findJobPostingById(posting.id);
    expect((byId as any).is_active).toBe(false);
  });
});
