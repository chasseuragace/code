import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from 'src/modules/domain/domain.module';
import { ApplicationModule } from 'src/modules/application/application.module';
import { ApplicationService } from 'src/modules/application/application.service';
import { Candidate } from 'src/modules/candidate/candidate.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { JobApplication } from 'src/modules/application/job-application.entity';
import { clearDomain } from './ops/clearDomain';
import { clearApplications } from './ops/clearApplications';

export async function bootstrapApplicationTestModule(): Promise<{
  moduleRef: TestingModule;
  apps: ApplicationService;
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
      ApplicationModule,
    ],
  }).compile();

  // Clear in FK-safe order using shared helpers
  await clearApplications(moduleRef);
  await clearDomain(moduleRef);

  const apps = moduleRef.get(ApplicationService);
  return { moduleRef, apps };
}
