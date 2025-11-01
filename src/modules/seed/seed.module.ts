import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CountryModule } from '../country/country.module';
import { JobTitleModule } from '../job-title/job-title.module';
import { AgencyModule } from '../agency/agency.module';
import { DomainModule } from '../domain/domain.module';
import { JobPosting } from '../domain/domain.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting]),
    CountryModule,
    JobTitleModule,
    AgencyModule,
    DomainModule,
  ],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [],
})
export class SeedModule {}
