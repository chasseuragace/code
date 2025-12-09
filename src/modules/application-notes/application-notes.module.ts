import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationNotesController } from './application-notes.controller';
import { ApplicationNotesService } from './application-notes.service';
import { ApplicationNote } from './application-note.entity';
import { JobApplication } from '../application/job-application.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationNote, JobApplication, User]),
    AuthModule,
  ],
  controllers: [ApplicationNotesController],
  providers: [ApplicationNotesService, JwtAuthGuard],
  exports: [ApplicationNotesService],
})
export class ApplicationNotesModule {}
