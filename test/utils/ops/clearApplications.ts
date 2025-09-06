import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobApplication } from 'src/modules/application/job-application.entity';

export async function clearApplications(moduleRef: TestingModule) {
  const appRepo = moduleRef.get<any>(getRepositoryToken(JobApplication));
  await appRepo.createQueryBuilder().delete().from(JobApplication).execute();
}
