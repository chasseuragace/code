import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/typeorm.config';
import { DomainModule } from './modules/domain/domain.module';
import { JobTitleModule } from './modules/job-title/job-title.module';
import { ApplicationModule } from './modules/application/application.module';
import { AgencyModule } from './modules/agency/agency.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { OwnerAnalyticsModule } from './modules/owner-analytics/owner-analytics.module';
import { CountryModule } from './modules/country/country.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { TesthelperModule } from './modules/testhelper/testhelper.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
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
    SeedModule,
    AuthModule,
    TesthelperModule,
    NotificationModule,
    AdminModule,
  ],
})
export class AppModule {}
