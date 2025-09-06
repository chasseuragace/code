import { AnnouncementType, OvertimePolicy, ProvisionType } from 'src/modules/domain/domain.service';
import { uniqueSuffix } from '../id';

export function buildPostingDto(overrides: Partial<any> = {}): any {
  const s = uniqueSuffix('-');
  const base = {
    posting_title: `Posting ${s}`,
    country: 'UAE',
    city: 'Dubai',
    announcement_type: AnnouncementType.FULL_AD,
    posting_agency: { name: `Agency ${s}`, license_number: `LIC-${s}` },
    employer: { company_name: `Employer ${s}`, country: 'UAE', city: 'Dubai' },
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
      {
        title: `Worker ${s}`,
        vacancies: { male: 5, female: 0 },
        salary: { monthly_amount: 1000, currency: 'AED' },
      },
    ],
  };
  return { ...base, ...overrides };
}
