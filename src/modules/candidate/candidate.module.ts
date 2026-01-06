import { Module, forwardRef } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { DocumentTypeController } from './document-type.controller';
import { MobileJobController } from './mobile-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateJobProfile } from './candidate-job-profile.entity';
import { JobTitle } from '../job-title/job-title.entity';
import { JobPosting } from '../domain/domain.entity';
import { CandidatePreference } from './candidate-preference.entity';
import { CandidateDocument } from './candidate-document.entity';
import { DocumentType } from './document-type.entity';
import { DocumentTypeService } from './document-type.service';
import { DomainModule } from '../domain/domain.module';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';
import { ImageUploadModule } from '../shared/image-upload.module';
import { FitnessScoreModule } from '../shared/fitness-score.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, CandidateJobProfile, CandidatePreference, CandidateDocument, DocumentType, JobTitle, JobPosting]), 
    forwardRef(() => DomainModule),
    forwardRef(() => ApplicationModule),
    ImageUploadModule,
    FitnessScoreModule,
    forwardRef(() => AuthModule),
  ],
  providers: [CandidateService, DocumentTypeService],
  controllers: [CandidateController, DocumentTypeController, MobileJobController],
  exports: [CandidateService, DocumentTypeService],
})
export class CandidateModule {}
