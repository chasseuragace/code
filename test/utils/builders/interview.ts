import { ExpensePayer, ExpenseType } from 'src/modules/domain/domain.service';

export function buildInterviewDto(overrides: Partial<any> = {}): any {
  const base: any = {
    location: 'Kathmandu Office',
    interviewer: 'HR Team',
    notes: 'Initial screening',
    interview_date_ad: new Date().toISOString(),
    expenses: [
      {
        expense_type: ExpenseType.DOCUMENT_PROCESSING,
        who_pays: ExpensePayer.WORKER,
        amount: 50,
        currency: 'NPR',
        notes: 'Docs',
      },
    ],
  };
  return { ...base, ...overrides };
}
