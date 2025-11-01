import 'reflect-metadata';
import { bootstrapDomainTestModule } from './utils/testModule';
import { CountryService } from 'src/modules/country/country.service';
import { buildPostingDto } from './utils/builders/posting';
import { createInterviewWithExpense, createPostingWithDefaults } from './utils/ops/domainOps';

describe('OwnerAnalyticsService - Interviews Weekly Time Series', () => {
  it('aggregates interviews per ISO week (DATE_TRUNC week) ascending', async () => {
    const { moduleRef, jobs, interviews, owners } = await bootstrapDomainTestModule();

    try {
      const countries = moduleRef.get(CountryService, { strict: false });
      await countries.upsertMany([
        { country_code: 'CIT', country_name: 'C-INT-TS', currency_code: 'CUR', currency_name: 'Currency', npr_multiplier: '1.00' },
      ]);
      // Clean any prior interviews in our future test window to avoid pollution
      const ds = moduleRef.get(require('typeorm').DataSource, { strict: false });
      await ds.query(`DELETE FROM interview_details WHERE interview_date_ad BETWEEN '2031-01-01' AND '2031-12-31'`);
      // Helper to build posting quickly
      const posting = await createPostingWithDefaults(jobs, buildPostingDto({
        posting_title: 'P0',
        country: 'C-INT-TS',
        posting_agency: { name: 'A-INT-TS', license_number: 'LIC-INT-TS' },
        employer: { company_name: 'E-INT-TS', country: 'EC', city: 'EZ' },
        positions: [
          {
            title: 'Worker',
            vacancies: { male: 1, female: 0 },
            salary: { monthly_amount: 1000, currency: 'USD' },
          },
        ],
      } as any));

      const posting2 = await createPostingWithDefaults(jobs, buildPostingDto({
        posting_title: 'P1',
        country: 'C-INT-TS',
        posting_agency: { name: 'A2-INT-TS', license_number: 'LIC2-INT-TS' },
        employer: { company_name: 'E2-INT-TS', country: 'EC', city: 'EZ' },
        positions: [
          {
            title: 'Worker',
            vacancies: { male: 1, female: 0 },
            salary: { monthly_amount: 1000, currency: 'USD' },
          },
        ],
      } as any));

      // Seed interviews across three different weeks
      // Use Wednesday dates to avoid edge around week boundaries (DATE_TRUNC('week') starts Monday in Postgres)
      const d1 = new Date('2031-01-08'); // Wed (future to avoid collisions)
      const d2 = new Date('2031-01-15'); // next Wed
      const d3 = new Date('2031-01-22'); // next Wed

      // Week 1: 2 interviews
      await createInterviewWithExpense(interviews, posting.id, { interview_date_ad: d1.toISOString() });
      await createInterviewWithExpense(interviews, posting2.id, { interview_date_ad: d1.toISOString() });

      // Week 2: 1 interview
      await createInterviewWithExpense(interviews, posting.id, { interview_date_ad: d2.toISOString() });

      // Week 3: 3 interviews
      await createInterviewWithExpense(interviews, posting.id, { interview_date_ad: d3.toISOString() });
      await createInterviewWithExpense(interviews, posting.id, { interview_date_ad: d3.toISOString() });
      await createInterviewWithExpense(interviews, posting2.id, { interview_date_ad: d3.toISOString() });

      const series = await owners.getInterviewsTimeSeriesWeekly();

      // Expect three buckets in ascending order
      expect(series.length).toBeGreaterThanOrEqual(3);

      // Compute expected week starts (ISO Monday)
      const weekStart = (d: Date) => {
        const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const day = dt.getUTCDay(); // 0 Sun ... 6 Sat
        const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
        dt.setUTCDate(dt.getUTCDate() + diff);
        return dt.toISOString().slice(0, 10);
      };

      const w1 = weekStart(d1);
      const w2 = weekStart(d2);
      const w3 = weekStart(d3);

      // Filter series to our three weeks
      const lookup: Record<string, number> = Object.fromEntries(series.map(s => [s.week_start, s.interviews]));

      expect(lookup[w1]).toBe(2);
      expect(lookup[w2]).toBe(1);
      expect(lookup[w3]).toBe(3);
    } finally {
      await moduleRef.close();
    }
  });
});
