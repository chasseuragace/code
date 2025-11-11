import { Module, forwardRef } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { DocumentTypeController } from './document-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateJobProfile } from './candidate-job-profile.entity';
import { JobTitle } from 'src/modules/job-title/job-title.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { CandidatePreference } from './candidate-preference.entity';
import { CandidateDocument } from './candidate-document.entity';
import { DocumentType } from './document-type.entity';
import { DocumentTypeService } from './document-type.service';
import { DomainModule } from '../domain/domain.module';
import { AuthModule } from '../auth/auth.module';
import { ApplicationModule } from '../application/application.module';
import { ImageUploadModule } from '../shared/image-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, CandidateJobProfile, CandidatePreference, CandidateDocument, DocumentType, JobTitle, JobPosting]), 
    DomainModule,
    ApplicationModule,
    ImageUploadModule,
    forwardRef(() => AuthModule),
  ],
  providers: [CandidateService, DocumentTypeService],
  controllers: [CandidateController, DocumentTypeController],
  exports: [CandidateService, DocumentTypeService],
})
export class CandidateModule {}
