import 'reflect-metadata';
import { OwnerAnalyticsService } from 'src/modules/owner/owner.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('OwnerAnalyticsService - Portal Overview', () => {
  it('returns portal overview with sane totals and recent activity', async () => {
    const { moduleRef, jobs, interviews, owners } = await bootstrapDomainTestModule();
    try {
      // Seed a few postings and interviews for the 7d window
      const p1 = await jobs.createJobPosting(buildPostingDto());
      const p2 = await jobs.createJobPosting(buildPostingDto({ country: 'Qatar' }));
      const p3 = await jobs.createJobPosting(buildPostingDto({ country: 'UAE' }));

      // Deactivate one posting to contribute to deactivated_postings_7d
      await jobs.deactivateJobPosting(p3.id);

      // Add an interview on p1 within 7d window (today)
      await interviews.createInterview(p1.id, {
        interview_date_ad: new Date().toISOString(),
        location: 'HQ',
        contact_person: 'Ops',
        expenses: [],
      });

      const overview = await owners.getPortalOverview();

      // Basic shape assertions
      expect(overview).toHaveProperty('generated_at');
      expect(overview).toHaveProperty('totals');
      expect(overview).toHaveProperty('recent_activity');
      expect(overview).toHaveProperty('top_countries_by_active_postings');

      // Totals sanity (non-negative numbers)
      expect(overview.totals.agencies).toBeGreaterThanOrEqual(1);
      expect(overview.totals.postings.total).toBeGreaterThanOrEqual(3);
      expect(overview.totals.postings.active).toBeGreaterThanOrEqual(1);
      expect(overview.totals.postings.inactive).toBeGreaterThanOrEqual(1);
      expect(overview.totals.interviews).toBeGreaterThanOrEqual(1);
      expect(overview.totals.countries).toBeGreaterThanOrEqual(1);

      // Recent activity should reflect at least 1 new posting and 1 deactivation and 1 interview in last 7d
      expect(overview.recent_activity.new_postings_7d).toBeGreaterThanOrEqual(3);
      expect(overview.recent_activity.deactivated_postings_7d).toBeGreaterThanOrEqual(1);
      expect(overview.recent_activity.interviews_7d).toBeGreaterThanOrEqual(1);

      // Top countries list is an array with objects having country and active_postings
      expect(Array.isArray(overview.top_countries_by_active_postings)).toBe(true);
      if (overview.top_countries_by_active_postings.length > 0) {
        const item = overview.top_countries_by_active_postings[0] as any;
        expect(item).toHaveProperty('country');
        expect(item).toHaveProperty('active_postings');
      }
    } finally {
      await moduleRef.close();
    }
  }, 30000);
});
