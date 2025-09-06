import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CountryModule } from 'src/modules/country/country.module';
import { CountryService } from 'src/modules/country/country.service';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { JobTitleService } from 'src/modules/job-title/job-title.service';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AgencyService } from 'src/modules/agency/agency.service';
import { AgencyController } from 'src/modules/agency/agency.controller';

/**
 * flow_agency_create_job
 * Preconditions:
 *  - Countries and Job Titles seeded
 *  - Agency exists
 * Flow:
 *  - Create job posting via AgencyController.createJobPostingForAgency (without posting_agency in body)
 */

describe('flow_agency_create_job', () => {
  let moduleRef: TestingModule;
  let countrySvc: CountryService;
  let titleSvc: JobTitleService;
  let agencySvc: AgencyService;
  let agencyCtrl: AgencyController;
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
        AgencyModule,
      ],
    }).compile();

    countrySvc = moduleRef.get(CountryService);
    titleSvc = moduleRef.get(JobTitleService);
    agencySvc = moduleRef.get(AgencyService);
    agencyCtrl = moduleRef.get(AgencyController);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('seeds prerequisites and creates a job for an agency', async () => {
    // Seed prerequisites
    await countrySvc.upsertMany([
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
    ]);
    await titleSvc.upsertMany([
      { title: 'Electrician', rank: 1 },
    ]);

    // Create Agency
    const agency = await agencySvc.createAgency({
      name: 'Flow Test Agency',
      license_number: 'LIC-FLOW-0001',
      address: 'Kathmandu',
      phones: ['+977-1-5559999'],
      emails: ['flow@test-agency.example'],
      website: 'https://flow.agency.example',
    });

    // Create Job via controller (posting_agency inferred by license)
    const res = await agencyCtrl.createJobPostingForAgency('LIC-FLOW-0001', {
      posting_title: 'Electricians for Dubai',
      country: 'UAE',
      city: 'Dubai',
      approval_date_ad: new Date().toISOString().slice(0,10),
      posting_date_ad: new Date().toISOString().slice(0,10),
      announcement_type: 'full_ad' as any,
      notes: 'Flow test posting',
      employer: { company_name: 'Flow Electric Co', country: 'UAE', city: 'Dubai' },
      contract: {
        period_years: 2,
        renewable: true,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: 'paid' as any,
        weekly_off_days: 1,
        food: 'free' as any,
        accommodation: 'free' as any,
        transport: 'paid' as any,
        annual_leave_days: 14,
      },
      positions: [
        {
          title: 'Electrician',
          vacancies: { male: 5, female: 1 },
          salary: {
            monthly_amount: 1600,
            currency: 'AED',
            converted: [{ amount: 57600, currency: 'NPR' }]
          },
        },
      ],
    } as any);

    expect(res).toBeTruthy();
    expect(res.id).toBeDefined();
    expect(res.posting_title).toBe('Electricians for Dubai');
  });
});
