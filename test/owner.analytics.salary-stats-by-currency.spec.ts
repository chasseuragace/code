import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';
import { uniqueSuffix } from './utils/id';

// Helper to build custom salaries in a single currency
function postingWithSalaries(currency: string, salaries: number[]) {
  return buildPostingDto({
    positions: salaries.map((amt, i) => ({
      title: `Role ${i + 1}`,
      vacancies: { male: 1, female: 0 },
      salary: { monthly_amount: amt, currency },
    })),
  });
}

describe('OwnerAnalyticsService - Salary Stats By Currency', () => {
  it('computes min/max/avg and percentiles per currency', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      const short = (n: number) => (Date.now() % 1000).toString().padStart(3, '0');
      const curAED = `AED_${short(1)}`; // max ~7 chars
      const curQAR = `QAR_${short(2)}`;
      // Seed AED-like salaries: [1000, 1200, 1500, 2000]
      await jobs.createJobPosting(postingWithSalaries(curAED, [1000, 1200, 1500, 2000]));
      // Seed QAR-like salaries: [900, 1100, 1300]
      await jobs.createJobPosting(postingWithSalaries(curQAR, [900, 1100, 1300]));

      const rows = await owners.getSalaryStatsByCurrency();
      const byCur: Record<string, any> = Object.fromEntries(rows.map(r => [r.currency, r]));

      const aed = byCur[curAED];
      expect(aed).toBeTruthy();
      expect(aed.min).toBe(1000);
      expect(aed.max).toBe(2000);
      expect(Math.round(aed.avg)).toBe(Math.round((1000 + 1200 + 1500 + 2000) / 4));
      // For even N=4, percentile_cont at 0.5 is average of middle two (1200,1500) => 1350
      expect(Math.round(aed.p50)).toBe(1350);
      expect(aed.p25).toBeGreaterThanOrEqual(1000);
      expect(aed.p75).toBeLessThanOrEqual(2000);

      const qar = byCur[curQAR];
      expect(qar).toBeTruthy();
      expect(qar.min).toBe(900);
      expect(qar.max).toBe(1300);
      expect(Math.round(qar.avg)).toBe(Math.round((900 + 1100 + 1300) / 3));
      // For odd N=3, median is middle => 1100
      expect(Math.round(qar.p50)).toBe(1100);
    } finally {
      await moduleRef.close();
    }
  }, 30000);
});
