import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobTitle } from './job-title.entity';
import { JobTitleService } from './job-title.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobTitle])],
  providers: [JobTitleService],
  exports: [TypeOrmModule, JobTitleService],
})
export class JobTitleModule {}
