import 'reflect-metadata';
import { bootstrapDomainTestModule } from './utils/testModule';
import { CountryService } from 'src/modules/country/country.service';
import { buildPostingDto } from './utils/builders/posting';

function postingDto(overrides: Partial<any> = {}) {
  return buildPostingDto({
    posting_title: 'DX-POST',
    posting_date_ad: '2030-01-01',
    country: 'DX-C1',
    posting_agency: { name: 'DX-A', license_number: 'DX-LIC-A' },
    employer: { company_name: 'DX-E', country: 'DX', city: 'DX' },
    positions: [
      { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'USD' } },
    ],
    ...overrides,
  } as any);
}

describe('OwnerAnalyticsService - Deactivation Metrics', () => {
  it('computes global deactivation rate and per-country breakdown', async () => {
    const { moduleRef, jobs, owners } = await bootstrapDomainTestModule();
    try {
      const countries = moduleRef.get(CountryService, { strict: false });
      await countries.upsertMany([
        { country_code: 'DX1', country_name: 'DX-C1', currency_code: 'CUR', currency_name: 'Currency', npr_multiplier: '1.00' },
        { country_code: 'DX2', country_name: 'DX-C2', currency_code: 'CUR', currency_name: 'Currency', npr_multiplier: '1.00' },
      ]);
      // Create 4 postings across two countries
      const p1 = await jobs.createJobPosting(postingDto({ country: 'DX-C1', posting_agency: { name: 'DX-A1', license_number: 'DX-LIC-A1' } }));
      const p2 = await jobs.createJobPosting(postingDto({ country: 'DX-C1', posting_agency: { name: 'DX-A2', license_number: 'DX-LIC-A2' } }));
      const p3 = await jobs.createJobPosting(postingDto({ country: 'DX-C2', posting_agency: { name: 'DX-A3', license_number: 'DX-LIC-A3' } }));
      const p4 = await jobs.createJobPosting(postingDto({ country: 'DX-C2', posting_agency: { name: 'DX-A4', license_number: 'DX-LIC-A4' } }));

      // Deactivate two postings: one per country
      await jobs.deactivateJobPosting(p1.id);
      await jobs.deactivateJobPosting(p3.id);

      const metrics = await owners.getDeactivationMetrics({ countries: ['DX-C1', 'DX-C2'] });

      // Global rate: 2 deactivated / 4 total = 0.5
      expect(metrics.deactivation_rate).toBeGreaterThan(0.49);
      expect(metrics.deactivation_rate).toBeLessThan(0.51);

      // Avg days should be non-negative number
      expect(typeof metrics.avg_days_to_deactivate).toBe('number');
      expect(metrics.avg_days_to_deactivate).toBeGreaterThanOrEqual(0);

      // Per-country rates
      const map = Object.fromEntries(metrics.by_country.map(x => [x.country, x.rate]));
      expect(map['DX-C1']).toBeGreaterThan(0.49); // 1/2
      expect(map['DX-C1']).toBeLessThan(0.51);
      expect(map['DX-C2']).toBeGreaterThan(0.49); // 1/2
      expect(map['DX-C2']).toBeLessThan(0.51);

      // Avg days per country should be numbers
      const avgMap = Object.fromEntries(metrics.by_country.map(x => [x.country, x.avg_days]));
      expect(typeof avgMap['DX-C1']).toBe('number');
      expect(avgMap['DX-C1']).toBeGreaterThanOrEqual(0);
      expect(typeof avgMap['DX-C2']).toBe('number');
      expect(avgMap['DX-C2']).toBeGreaterThanOrEqual(0);
    } finally {
      await moduleRef.close();
    }
  });
});
