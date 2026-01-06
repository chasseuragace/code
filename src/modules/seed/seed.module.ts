import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AutoSeedService } from './auto-seed.service';
import { CountryModule } from '../country/country.module';
import { JobTitleModule } from '../job-title/job-title.module';
import { AgencyModule } from '../agency/agency.module';
import { DomainModule } from '../domain/domain.module';
import { CandidateModule } from '../candidate/candidate.module';
import { JobPosting } from '../domain/domain.entity';
import { User } from '../user/user.entity';
import { AgencyUser } from '../agency/agency-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, User, AgencyUser]),
    CountryModule,
    JobTitleModule,
    AgencyModule,
    DomainModule,
    CandidateModule,
  ],
  providers: [SeedService, AutoSeedService],
  controllers: [SeedController],
  exports: [],
})
export class SeedModule {}
