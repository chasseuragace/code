import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CountryModule } from 'src/modules/country/country.module';
import { CountryService } from 'src/modules/country/country.service';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { JobTitleService } from 'src/modules/job-title/job-title.service';

describe('flow_system_initialized', () => {
  let moduleRef: TestingModule;
  let countrySvc: CountryService;
  let titleSvc: JobTitleService;
  let dataSource: DataSource;

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
        CountryModule,
        JobTitleModule,
      ],
    }).compile();
    countrySvc = moduleRef.get(CountryService);
    titleSvc = moduleRef.get(JobTitleService);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('seed countries and job titles', async () => {
    const countries = [
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
      { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Qatari Riyal', npr_multiplier: '36.50' },
    ];
    const titles = [
      { title: 'Electrician', rank: 1 },
      { title: 'Welder', rank: 2 },
    ];

    const cRes = await countrySvc.upsertMany(countries);
    expect(cRes.affected).toBe(2);

    const tRes = await titleSvc.upsertMany(titles);
    expect(tRes.affected).toBe(2);

    const cList = await countrySvc.listAll();
    expect(cList.total).toBeGreaterThanOrEqual(2);

    const tList = await titleSvc.listAll({ limit: 10 });
    expect(tList.total).toBeGreaterThanOrEqual(2);
  });
});
