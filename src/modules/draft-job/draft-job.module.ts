import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftJobController } from './draft-job.controller';
import { DraftJobService } from './draft-job.service';
import { DraftJob } from './draft-job.entity';
import { DomainModule } from '../domain/domain.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DraftJob, User]),
    DomainModule,
    AuthModule,
  ],
  controllers: [DraftJobController],
  providers: [DraftJobService],
  exports: [DraftJobService],
})
export class DraftJobModule {}
