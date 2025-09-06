import 'reflect-metadata';
import { bootstrapDomainTestModule } from './utils/testModule';
import { buildPostingDto } from './utils/builders/posting';
import { DataSource } from 'typeorm';

describe('OwnerAnalyticsService - Salary Stats By Currency', () => {
  it('computes min/max/avg and percentiles per currency', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      // Clean up any prior test data in our isolated country to avoid percentile pollution
      const ds = moduleRef.get(DataSource, { strict: false });
      await ds.query(
        `DELETE FROM job_positions WHERE job_contract_id IN (
           SELECT id FROM job_contracts WHERE job_posting_id IN (
             SELECT id FROM job_postings WHERE country = 'TST-C'
           )
         )`
      );
      await ds.query(
        `DELETE FROM job_contracts WHERE job_posting_id IN (
           SELECT id FROM job_postings WHERE country = 'TST-C'
         )`
      );
      await ds.query(`DELETE FROM job_postings WHERE country = 'TST-C'`);
      // Seed TST1 salaries: [1000, 1500, 2000]
      await jobs.createJobPosting(buildPostingDto({ country: 'TST-C', posting_date_ad: '2031-01-05', positions: [ { title: 'Role A1', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'TST1' } } ] }));
      await jobs.createJobPosting(buildPostingDto({ country: 'TST-C', posting_date_ad: '2031-01-06', positions: [ { title: 'Role A2', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1500, currency: 'TST1' } } ] }));
      await jobs.createJobPosting(buildPostingDto({ country: 'TST-C', posting_date_ad: '2031-01-07', positions: [ { title: 'Role A3', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 2000, currency: 'TST1' } } ] }));

      // Seed TST2 salaries: [1800, 2200]
      await jobs.createJobPosting(buildPostingDto({ country: 'TST-C', posting_date_ad: '2031-01-08', positions: [ { title: 'Role Q1', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1800, currency: 'TST2' } } ] }));
      await jobs.createJobPosting(buildPostingDto({ country: 'TST-C', posting_date_ad: '2031-01-09', positions: [ { title: 'Role Q2', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 2200, currency: 'TST2' } } ] }));

      const stats = await owners.getSalaryStatsByCurrency({ since: new Date('2031-01-01') });
      const map = Object.fromEntries(stats.map(s => [s.currency, s]));

      // TST1 expectations (Postgres PERCENTILE_CONT)
      expect(map['TST1'].min).toBe(1000);
      expect(map['TST1'].max).toBe(2000);
      expect(map['TST1'].avg).toBeCloseTo((1000 + 1500 + 2000) / 3, 6);
      expect(map['TST1'].p25).toBeCloseTo(1250, 6);
      expect(map['TST1'].p50).toBeCloseTo(1500, 6);
      expect(map['TST1'].p75).toBeCloseTo(1750, 6);

      // TST2 expectations (Postgres PERCENTILE_CONT)
      expect(map['TST2'].min).toBe(1800);
      expect(map['TST2'].max).toBe(2200);
      expect(map['TST2'].avg).toBeCloseTo((1800 + 2200) / 2, 6);
      expect(map['TST2'].p25).toBeCloseTo(1900, 6);
      expect(map['TST2'].p50).toBeCloseTo(2000, 6);
      expect(map['TST2'].p75).toBeCloseTo(2100, 6);
    } finally {
      await moduleRef.close();
    }
  });
});
