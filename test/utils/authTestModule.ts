import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateModule } from 'src/modules/candidate/candidate.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DataSource } from 'typeorm';

export async function bootstrapAuthTestModule(): Promise<{ moduleRef: TestingModule; dataSource: DataSource }>{
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
      CandidateModule,
      AuthModule,
    ],
  }).compile();

  const dataSource = moduleRef.get(DataSource);
  return { moduleRef, dataSource };
}
