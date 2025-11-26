import { Module } from '@nestjs/common';
import { TesthelperController } from './controllers/testhelper.controller';
import { TesthelperService } from './services/testhelper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { JobApplication } from '../application/job-application.entity';
import { User } from '../user/user.entity';
import { JobPosting } from '../domain/domain.entity';
import { JobContract } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { DraftJob } from '../draft-job/draft-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      JobApplication,
      User,
      JobPosting,
      JobContract,
      PostingAgency,
      DraftJob
    ]),
  ],
  controllers: [TesthelperController],
  providers: [TesthelperService],
  exports: [TesthelperService],
})
export class TesthelperModule {}
