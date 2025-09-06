import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';

function posting(country: string, currency: string, salaries: number[]) {
  return buildPostingDto({
    country,
    employer: { company_name: `Emp ${country}`, country, city: 'City' },
    positions: salaries.map((amt, i) => ({
      title: `Role ${i + 1}`,
      vacancies: { male: 1, female: 0 },
      salary: { monthly_amount: amt, currency },
    })),
  });
}

describe('OwnerAnalyticsService - Salary By Country & Currency', () => {
  it('aggregates min/max/avg per country+currency for active postings', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      const short = () => (Date.now() % 1000).toString().padStart(3, '0');
      const c1 = `UAE_${short()}`;
      const c2 = `QAT_${short()}`;
      const curAED = `AED_${short()}`; // <=10 chars
      const curQAR = `QAR_${short()}`;
      // c1 / curAED: [1000, 1500]
      await jobs.createJobPosting(posting(c1, curAED, [1000, 1500]));
      // c1 / curQAR: [900]
      await jobs.createJobPosting(posting(c1, curQAR, [900]));
      // c2 / curQAR: [1100, 1300]
      await jobs.createJobPosting(posting(c2, curQAR, [1100, 1300]));

      const rows = await owners.getSalaryByCountryCurrency();
      // Build lookup by key `${country}|${currency}`
      const byKey: Record<string, any> = {};
      for (const r of rows) byKey[`${r.country}|${r.currency}`] = r;

      const uaeAed = byKey[`${c1}|${curAED}`];
      expect(uaeAed).toBeTruthy();
      expect(uaeAed.min).toBe(1000);
      expect(uaeAed.max).toBe(1500);
      expect(Math.round(uaeAed.avg)).toBe(1250);

      const uaeQar = byKey[`${c1}|${curQAR}`];
      expect(uaeQar).toBeTruthy();
      expect(uaeQar.min).toBe(900);
      expect(uaeQar.max).toBe(900);
      expect(uaeQar.avg).toBe(900);

      const qaQar = byKey[`${c2}|${curQAR}`];
      expect(qaQar).toBeTruthy();
      expect(qaQar.min).toBe(1100);
      expect(qaQar.max).toBe(1300);
      expect(Math.round(qaQar.avg)).toBe(1200);
    } finally {
      await moduleRef.close();
    }
  }, 30000);
});
