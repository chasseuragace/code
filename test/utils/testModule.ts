import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from 'src/modules/domain/domain.module';
import { JobPostingService, ExpenseService, InterviewService } from 'src/modules/domain/domain.service';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AgencyService } from 'src/modules/agency/agency.service';
import { OwnerAnalyticsModule } from 'src/modules/owner-analytics/owner-analytics.module';
import { OwnerAnalyticsService } from 'src/modules/owner-analytics/owner-analytics.service';

export async function bootstrapDomainTestModule(): Promise<{
  moduleRef: TestingModule;
  jobs: JobPostingService;
  expenses: ExpenseService;
  interviews: InterviewService;
  agencies: AgencyService;
  owners: OwnerAnalyticsService;
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
    ],
  }).compile();

  const jobs = moduleRef.get(JobPostingService);
  const expenses = moduleRef.get(ExpenseService);
  const interviews = moduleRef.get(InterviewService);
  const agencies = moduleRef.get(AgencyService);
  const owners = moduleRef.get(OwnerAnalyticsService);

  return { moduleRef, jobs, expenses, interviews, agencies, owners };
}
