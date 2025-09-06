import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from 'src/modules/domain/domain.module';
import { JobPostingService, ExpenseService, InterviewService } from 'src/modules/domain/domain.service';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AgencyService } from 'src/modules/agency/agency.service';
import { OwnerAnalyticsModule } from 'src/modules/owner-analytics/owner-analytics.module';
import { OwnerAnalyticsService } from 'src/modules/owner-analytics/owner-analytics.service';
import { CountryModule } from 'src/modules/country/country.module';
import { CountryService } from 'src/modules/country/country.service';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { JobTitleService } from 'src/modules/job-title/job-title.service';

export async function bootstrapDomainTestModule(): Promise<{
  moduleRef: TestingModule;
  jobs: JobPostingService;
  expenses: ExpenseService;
  interviews: InterviewService;
  agencies: AgencyService;
  owners: OwnerAnalyticsService;
  countries: CountryService;
  titles: JobTitleService;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'app_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
      DomainModule,
      AgencyModule,
      OwnerAnalyticsModule,
      CountryModule,
      JobTitleModule,
    ],
  }).compile();

  const jobs = moduleRef.get(JobPostingService);
  const expenses = moduleRef.get(ExpenseService);
  const interviews = moduleRef.get(InterviewService);
  const agencies = moduleRef.get(AgencyService);
  const owners = moduleRef.get(OwnerAnalyticsService);
  const countries = moduleRef.get(CountryService);
  const titles = moduleRef.get(JobTitleService);

  // Seed baseline Countries and Job Titles required by validations and analytics tests
  await countries.upsertMany([
    { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
    { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Qatari Riyal', npr_multiplier: '36.50' },
  ]);
  await titles.upsertMany([
    { title: 'Electrician', rank: 1, is_active: true } as any,
    { title: 'Welder', rank: 2, is_active: true } as any,
  ]);

  return { moduleRef, jobs, expenses, interviews, agencies, owners, countries, titles };
}
