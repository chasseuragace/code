import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { dataSourceOptions } from './config/typeorm.config';
import { DomainModule } from './modules/domain/domain.module';
import { JobTitleModule } from './modules/job-title/job-title.module';
import { ApplicationModule } from './modules/application/application.module';
import { AgencyModule } from './modules/agency/agency.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { OwnerAnalyticsModule } from './modules/owner-analytics/owner-analytics.module';
import { CountryModule } from './modules/country/country.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { SmsModule } from './modules/sms/sms.module';
import { TesthelperModule } from './modules/testhelper/testhelper.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ApplicationNotesModule } from './modules/application-notes/application-notes.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      synchronize: true, // Dev only
    }),
    DomainModule,
    JobTitleModule,
    ApplicationModule,
    AgencyModule,
    CandidateModule,
    OwnerAnalyticsModule,
    CountryModule,
    CurrencyModule,
    SeedModule,
    AuthModule,
    SmsModule,
    TesthelperModule,
    NotificationModule,
    AdminModule,
    WorkflowModule,
    ApplicationNotesModule,
    AuditModule,
  ],
})
export class AppModule {}
