import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from 'src/modules/domain/domain.module';
import { CandidateModule } from 'src/modules/candidate/candidate.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { CandidateJobProfile } from 'src/modules/candidate/candidate-job-profile.entity';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { CandidatePreference } from 'src/modules/candidate/candidate-preference.entity';
import { CountryModule } from 'src/modules/country/country.module';

export async function bootstrapCandidateTestModule(): Promise<{
  moduleRef: TestingModule;
  candidates: CandidateService;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'app_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
      DomainModule,
      CountryModule,
      JobTitleModule,
      CandidateModule,
    ],
  }).compile();

  // Ensure a clean slate for candidate-related tests to avoid unique constraint collisions
  const candidateRepo = moduleRef.get<any>(getRepositoryToken(Candidate));
  await candidateRepo.clear();
  const jobProfileRepo = moduleRef.get<any>(getRepositoryToken(CandidateJobProfile));
  await jobProfileRepo.clear();
  const prefRepo = moduleRef.get<any>(getRepositoryToken(CandidatePreference));
  await prefRepo.clear();

  const candidates = moduleRef.get(CandidateService);

  return { moduleRef, candidates };
}
