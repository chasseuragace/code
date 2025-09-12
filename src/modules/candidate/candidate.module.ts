import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateJobProfile } from './candidate-job-profile.entity';
import { JobTitle } from 'src/modules/job-title/job-title.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { CandidatePreference } from './candidate-preference.entity';
import { DomainModule } from '../domain/domain.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, CandidateJobProfile, CandidatePreference, JobTitle, JobPosting]), DomainModule],
  providers: [CandidateService],
  controllers: [CandidateController],
  exports: [CandidateService],
})
export class CandidateModule {}
