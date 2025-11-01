import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { DataSource, Repository } from 'typeorm';
import { JobTitle } from 'src/modules/job-title/job-title.entity';

describe('JobTitleService', () => {
  let moduleRef: TestingModule;
  let service: JobTitleService;
  let dataSource: DataSource;
  let repo: Repository<JobTitle>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
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
        JobTitleModule,
      ],
    }).compile();

    service = moduleRef.get(JobTitleService);
    dataSource = moduleRef.get(DataSource);
    repo = dataSource.getRepository(JobTitle);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    // Clean table before each test
    await repo.createQueryBuilder().delete().from(JobTitle).execute();
  });

  it('upsertMany should insert rows and avoid duplicates by title', async () => {
    const rows = [
      { title: 'Welder', rank: 1 },
      { title: 'Electrician', rank: 2 },
    ];
    await service.upsertMany(rows);

    let all = await service.listAll({ limit: 10 });
    expect(all.total).toBe(2);

    // Upsert with changed rank for Welder, same title
    await service.upsertMany([{ title: 'Welder', rank: 3 }]);

    const updated = await service.findByTitle('Welder');
    expect(updated?.rank).toBe(3);

    all = await service.listAll({ limit: 10 });
    expect(all.total).toBe(2);
  });

  it('listAll should filter by is_active and search by q', async () => {
    await service.upsertMany([
      { title: 'Senior Welder', rank: 1, is_active: true },
      { title: 'Junior Welder', rank: 2, is_active: false },
      { title: 'Electrician', rank: 3, is_active: true },
    ]);

    const active = await service.listAll({ is_active: true });
    expect(active.data.every((r) => r.is_active)).toBe(true);

    const search = await service.listAll({ q: 'Welder' });
    expect(search.data.length).toBe(2);
    expect(search.data.map((r) => r.title)).toEqual(
      expect.arrayContaining(['Senior Welder', 'Junior Welder'])
    );
  });

  it('findByTitle should return the specific job title', async () => {
    await service.upsertMany([{ title: 'Plumber', rank: 5 }]);
    const found = await service.findByTitle('Plumber');
    expect(found).toBeTruthy();
    expect(found?.title).toBe('Plumber');
  });
});
