import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobTitle } from './job-title.entity';
import { JobTitleService } from './job-title.service';
import { JobTitleController } from './job-title.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobTitle])],
  providers: [JobTitleService],
  controllers: [JobTitleController],
  exports: [TypeOrmModule, JobTitleService],
})
export class JobTitleModule {}
