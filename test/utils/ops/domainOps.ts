import { JobPostingService, ExpenseService, InterviewService } from 'src/modules/domain/domain.service';
import { buildPostingDto } from '../builders/posting';
import { expenseBuilders } from '../builders/expenses';
import { buildInterviewDto } from '../builders/interview';

export async function createPostingWithDefaults(
  jobs: JobPostingService,
  overrides: Partial<any> = {},
) {
  const dto = buildPostingDto(overrides);
  return jobs.createJobPosting(dto);
}

export async function attachAllExpenses(
  expensesSvc: ExpenseService,
  postingId: string,
  overrides: {
    medical?: Partial<any>;
    insurance?: Partial<any>;
    travel?: Partial<any>;
    visa?: Partial<any>;
    training?: Partial<any>;
    welfareService?: Partial<any>;
  } = {},
) {
  await expensesSvc.createMedicalExpense(postingId, expenseBuilders.medical(overrides.medical));
  await expensesSvc.createInsuranceExpense(postingId, expenseBuilders.insurance(overrides.insurance));
  await expensesSvc.createTravelExpense(postingId, expenseBuilders.travel(overrides.travel));
  await expensesSvc.createVisaPermitExpense(postingId, expenseBuilders.visa(overrides.visa));
  await expensesSvc.createTrainingExpense(postingId, expenseBuilders.training(overrides.training));
  await expensesSvc.createWelfareServiceExpense(postingId, expenseBuilders.welfareService(overrides.welfareService));
  return expensesSvc.getJobPostingExpenses(postingId);
}

export async function createInterviewWithExpense(
  interviewsSvc: InterviewService,
  postingId: string,
  overrides: Partial<any> = {},
) {
  const dto = buildInterviewDto(overrides);
  return interviewsSvc.createInterview(postingId, dto);
}
