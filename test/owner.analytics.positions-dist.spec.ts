import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';

function postingWithTitle(country: string, title: string) {
  return buildPostingDto({
    country,
    employer: { company_name: `Emp ${country}`, country, city: 'City' },
    positions: [
      {
        title,
        vacancies: { male: 1, female: 0 },
        salary: { monthly_amount: 1200, currency: 'AED' },
      },
    ],
  });
}

describe('OwnerAnalyticsService - Positions Distribution', () => {
  it('counts postings, distinct agencies and countries by title (active only)', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      const suf = (Date.now() % 100000).toString();
      const titleA = `Nurse_${suf}`;
      const titleB = `Driver_${suf}`;
      // Seed: titleA in two countries (distinct agencies via builder), titleB in one
      await jobs.createJobPosting(postingWithTitle('UAE', titleA));
      await jobs.createJobPosting(postingWithTitle('Qatar', titleA));
      await jobs.createJobPosting(postingWithTitle('UAE', titleB));

      const rows = await owners.getPositionsDistribution();
      const byTitle: Record<string, any> = Object.fromEntries(rows.map(r => [r.title, r]));

      const nurse = byTitle[titleA];
      expect(nurse).toBeTruthy();
      expect(nurse.postings).toBe(2);
      expect(nurse.distinct_agencies).toBe(2);
      expect(nurse.distinct_countries).toBe(2);

      const driver = byTitle[titleB];
      expect(driver).toBeTruthy();
      expect(driver.postings).toBe(1);
      expect(driver.distinct_agencies).toBe(1);
      expect(driver.distinct_countries).toBe(1);
    } finally {
      await moduleRef.close();
    }
  }, 30000);
});
