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
  ],
})
export class AppModule {}
