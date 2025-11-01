import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CountryModule } from 'src/modules/country/country.module';
import { CountryService } from 'src/modules/country/country.service';
import { Country } from 'src/modules/country/country.entity';

describe('CountryService', () => {
  let moduleRef: TestingModule;
  let service: CountryService;
  let dataSource: DataSource;
  let repo: Repository<Country>;

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
      ],
    }).compile();

    service = moduleRef.get(CountryService);
    dataSource = moduleRef.get(DataSource);
    repo = dataSource.getRepository(Country);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  beforeEach(async () => {
    await repo.createQueryBuilder().delete().from(Country).execute();
  });

  it('upsertMany should insert rows and avoid duplicates by country_code', async () => {
    const rows = [
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
      { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Qatari Riyal', npr_multiplier: '36.50' },
    ];

    await service.upsertMany(rows);

    let all = await service.listAll();
    expect(all.total).toBe(2);

    // Upsert with changed multiplier for UAE, same code
    await service.upsertMany([{ country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '37.00' }]);

    const updated = await service.findByNameOrCode('UAE');
    expect(Number(updated?.npr_multiplier)).toBeCloseTo(37.0, 6);

    all = await service.listAll();
    expect(all.total).toBe(2);
  });

  it('findByNameOrCode should find by alpha-3 code or by case-insensitive country name', async () => {
    await service.upsertMany([
      { country_code: 'KSA', country_name: 'Saudi Arabia', currency_code: 'SAR', currency_name: 'Saudi Riyal', npr_multiplier: '35.00' },
    ]);

    const byCode = await service.findByNameOrCode('KSA');
    expect(byCode).toBeTruthy();
    expect(byCode?.country_name).toBe('Saudi Arabia');

    const byName = await service.findByNameOrCode('saudi arabia');
    expect(byName).toBeTruthy();
    expect(byName?.country_code).toBe('KSA');
  });

  it('listAll should return sorted countries by name', async () => {
    await service.upsertMany([
      { country_code: 'IND', country_name: 'India', currency_code: 'INR', currency_name: 'Indian Rupee', npr_multiplier: '1.60' },
      { country_code: 'AUS', country_name: 'Australia', currency_code: 'AUD', currency_name: 'Australian Dollar', npr_multiplier: '88.00' },
      { country_code: 'JPN', country_name: 'Japan', currency_code: 'JPY', currency_name: 'Japanese Yen', npr_multiplier: '0.90' },
    ]);

    const { data } = await service.listAll();
    const names = data.map((c) => c.country_name);
    expect(names).toEqual(['Australia', 'India', 'Japan']);
  });
});
