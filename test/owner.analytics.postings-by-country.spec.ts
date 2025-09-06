import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';

describe('OwnerAnalyticsService - Postings by Country', () => {
  it('groups postings by country with active and total counts', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      // Seed postings across countries
      const p1 = await jobs.createJobPosting(buildPostingDto({ country: 'UAE' }));
      const p2 = await jobs.createJobPosting(buildPostingDto({ country: 'UAE' }));
      const p3 = await jobs.createJobPosting(buildPostingDto({ country: 'Qatar' }));

      // Deactivate one in UAE to reflect active vs total difference
      await jobs.deactivateJobPosting(p2.id);

      const rows = await owners.getPostingsByCountry();

      expect(Array.isArray(rows)).toBe(true);
      const uae = rows.find(r => r.country === 'UAE');
      const qatar = rows.find(r => r.country === 'Qatar');

      expect(uae).toBeTruthy();
      expect(qatar).toBeTruthy();

      // UAE: total 2, active 1
      expect(uae!.total).toBeGreaterThanOrEqual(2);
      expect(uae!.active).toBeGreaterThanOrEqual(1);

      // Qatar: total 1, active 1
      expect(qatar!.total).toBeGreaterThanOrEqual(1);
      expect(qatar!.active).toBeGreaterThanOrEqual(1);
    } finally {
      await moduleRef.close();
    }
  }, 30000);
});
