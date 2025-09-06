import { ExpensePayer, TicketType } from 'src/modules/domain/domain.service';

export const expenseBuilders = {
  medical(overrides: Partial<any> = {}) {
    const base = {
      domestic: {
        who_pays: ExpensePayer.WORKER,
        is_free: false,
        amount: 200,
        currency: 'NPR',
        notes: 'Medical check (domestic)',
      },
      foreign: {
        who_pays: ExpensePayer.COMPANY,
        is_free: true,
        amount: undefined,
        currency: undefined,
        notes: 'Medical check (foreign)',
      },
    };
    return { ...base, ...overrides };
  },
  insurance(overrides: Partial<any> = {}) {
    const base = {
      who_pays: ExpensePayer.COMPANY,
      is_free: false,
      amount: 500,
      currency: 'AED',
      coverage_amount: 10000,
      coverage_currency: 'AED',
      notes: 'Insurance coverage',
    };
    return { ...base, ...overrides };
  },
  travel(overrides: Partial<any> = {}) {
    const base = {
      who_pays: ExpensePayer.COMPANY,
      ticket_type: TicketType.ONE_WAY,
      is_free: true,
      amount: undefined,
      currency: undefined,
      notes: 'Air ticket',
    };
    return { ...base, ...overrides };
  },
  visa(overrides: Partial<any> = {}) {
    const base = {
      who_pays: ExpensePayer.WORKER,
      is_free: false,
      refundable: false,
      amount: 300,
      currency: 'AED',
      notes: 'Visa/permit',
    };
    return { ...base, ...overrides };
  },
  training(overrides: Partial<any> = {}) {
    const base = {
      who_pays: ExpensePayer.AGENCY,
      is_free: true,
      duration_days: 1,
      mandatory: true,
      amount: undefined,
      currency: undefined,
      notes: 'Orientation training',
    };
    return { ...base, ...overrides };
  },
  welfareService(overrides: Partial<any> = {}) {
    const base = {
      welfare: {
        who_pays: ExpensePayer.WORKER,
        is_free: true,
        amount: undefined,
        currency: undefined,
        fund_purpose: 'General welfare',
        refundable: false,
        notes: 'Welfare',
      },
      service: {
        who_pays: ExpensePayer.AGENCY,
        is_free: false,
        amount: 100,
        currency: 'NPR',
        service_type: 'Processing',
        refundable: false,
        notes: 'Service fee',
      },
    };
    return { ...base, ...overrides };
  },
};
