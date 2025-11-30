import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainController } from './domain.controller';
import { PublicJobsController } from './public-jobs.controller';
import { InterviewsController } from './interviews.controller';
import { Country } from '../country/country.entity';
import { JobTitle } from '../job-title/job-title.entity';
import {
  JobPosting,
  Employer,
  JobContract,
  SalaryConversion,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
  InterviewDetail,
  InterviewExpense,
  JobPosition,
} from './domain.entity';
import { PostingAgency } from './PostingAgency';
import { ExpenseService, InterviewService, JobPostingService } from './domain.service';
import { InterviewHelperService } from './interview-helper.service';
import { CurrencyConversionService } from '../currency/currency-conversion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPosting,
      PostingAgency,
      Employer,
      JobContract,
      JobPosition,
      JobTitle,
      SalaryConversion,
      MedicalExpense,
      InsuranceExpense,
      TravelExpense,
      VisaPermitExpense,
      TrainingExpense,
      WelfareServiceExpense,
      InterviewDetail,
      InterviewExpense,
      Country,
    ]),
  ],
  providers: [JobPostingService, ExpenseService, InterviewService, InterviewHelperService, CurrencyConversionService],
  controllers: [DomainController, PublicJobsController, InterviewsController],
  exports: [TypeOrmModule, JobPostingService, ExpenseService, InterviewService, InterviewHelperService, CurrencyConversionService],
})
export class DomainModule {}
