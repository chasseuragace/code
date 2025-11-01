import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  JobPosting,
  JobContract,
  JobPosition,
  Employer,
  SalaryConversion,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
  InterviewExpense,
  InterviewDetail,
} from 'src/modules/domain/domain.entity';
import { PostingAgency } from 'src/modules/domain/PostingAgency';

// Delete in foreign-key-safe order to reset domain tables between tests
export async function clearDomain(moduleRef: TestingModule) {
  const repos = {
    interviewExpense: moduleRef.get<any>(getRepositoryToken(InterviewExpense)),
    interview: moduleRef.get<any>(getRepositoryToken(InterviewDetail)),
    medical: moduleRef.get<any>(getRepositoryToken(MedicalExpense)),
    insurance: moduleRef.get<any>(getRepositoryToken(InsuranceExpense)),
    travel: moduleRef.get<any>(getRepositoryToken(TravelExpense)),
    visa: moduleRef.get<any>(getRepositoryToken(VisaPermitExpense)),
    training: moduleRef.get<any>(getRepositoryToken(TrainingExpense)),
    welfare: moduleRef.get<any>(getRepositoryToken(WelfareServiceExpense)),
    salaryConv: moduleRef.get<any>(getRepositoryToken(SalaryConversion)),
    position: moduleRef.get<any>(getRepositoryToken(JobPosition)),
    contract: moduleRef.get<any>(getRepositoryToken(JobContract)),
    posting: moduleRef.get<any>(getRepositoryToken(JobPosting)),
    employer: moduleRef.get<any>(getRepositoryToken(Employer)),
    agency: moduleRef.get<any>(getRepositoryToken(PostingAgency)),
  };

  await repos.interviewExpense.createQueryBuilder().delete().execute();
  await repos.interview.createQueryBuilder().delete().execute();
  await repos.medical.createQueryBuilder().delete().execute();
  await repos.insurance.createQueryBuilder().delete().execute();
  await repos.travel.createQueryBuilder().delete().execute();
  await repos.visa.createQueryBuilder().delete().execute();
  await repos.training.createQueryBuilder().delete().execute();
  await repos.welfare.createQueryBuilder().delete().execute();
  await repos.salaryConv.createQueryBuilder().delete().execute();
  await repos.position.createQueryBuilder().delete().execute();
  await repos.contract.createQueryBuilder().delete().execute();
  await repos.posting.createQueryBuilder().delete().execute();
  await repos.employer.createQueryBuilder().delete().execute();
  await repos.agency.createQueryBuilder().delete().execute();
}
