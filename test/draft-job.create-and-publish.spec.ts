import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DraftJobModule } from 'src/modules/draft-job/draft-job.module';
import { DraftJobService } from 'src/modules/draft-job/draft-job.service';
import { DraftStatus } from 'src/modules/draft-job/draft-job.entity';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AgencyService } from 'src/modules/agency/agency.service';
import { CountryModule } from 'src/modules/country/country.module';
import { CountryService } from 'src/modules/country/country.service';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { JobTitleService } from 'src/modules/job-title/job-title.service';

jest.setTimeout(60000);

describe('Draft Job - Create and Publish Flow', () => {
  let moduleRef: TestingModule;
  let draftJobService: DraftJobService;
  let agencyService: AgencyService;
  let countryService: CountryService;
  let jobTitleService: JobTitleService;
  let agencyId: string;
  let userId: string;
  let licenseNumber: string;
  let dataSource: any;

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
        DraftJobModule,
        AgencyModule,
        CountryModule,
        JobTitleModule,
      ],
    }).compile();

    draftJobService = moduleRef.get(DraftJobService);
    agencyService = moduleRef.get(AgencyService);
    countryService = moduleRef.get(CountryService);
    jobTitleService = moduleRef.get(JobTitleService);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('creates agency, creates draft, validates, and publishes', async () => {
    // Seed prerequisites
    await countryService.upsertMany([
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
    ]);
    await jobTitleService.upsertMany([
      { title: 'Electrician', rank: 1 },
    ]);

    // Create a test user with unique phone
    const userRepo = dataSource.getRepository('User');
    const uniquePhone = `+977${Date.now().toString().slice(-10)}`;
    const testUser = await userRepo.save({
      phone: uniquePhone,
      full_name: 'Draft Test User',
      role: 'owner',
    });
    userId = testUser.id;

    // Create agency
    licenseNumber = `DRAFT-${Date.now()}`;
    const agency = await agencyService.createAgency({
      name: "Draft Test Agency",
      license_number: licenseNumber,
      address: "Test Address",
      phones: ["+977-1-1234567"],
      emails: ["draft@test.com"],
    });
    agencyId = agency.id;
    expect(agencyId).toBeTruthy();
    expect(userId).toBeTruthy();

    console.log('✓ Setup complete: User and Agency created');

    // 5) Create incomplete draft
    const incompleteDraft = await draftJobService.create(agencyId, userId, {
      posting_title: "Electrician - Dubai",
      country: "UAE",
    });
    expect(incompleteDraft.id).toBeTruthy();
    expect(incompleteDraft.status).toBe(DraftStatus.DRAFT);
    console.log('✓ Created incomplete draft:', incompleteDraft.id);

    // 6) Validate incomplete draft (should fail)
    const validation1 = draftJobService.validateDraftForPublishing(incompleteDraft);
    expect(validation1.valid).toBe(false);
    expect(validation1.errors.length).toBeGreaterThan(0);
    console.log('✓ Validation failed as expected:', validation1.errors.length, 'errors');

    // 7) Update draft with complete data
    const today = new Date().toISOString().split('T')[0];
    const completeDraft = await draftJobService.update(
      incompleteDraft.id,
      agencyId,
      userId,
      {
        city: "Dubai",
        approval_date_ad: new Date(today),
        posting_date_ad: new Date(today),
        announcement_type: "full_ad",
        employer: {
          company_name: "Test Construction LLC",
          country: "UAE",
          city: "Dubai",
        },
        contract: {
          period_years: 2,
          renewable: true,
          hours_per_day: 8,
          days_per_week: 6,
          overtime_policy: "paid",
          weekly_off_days: 1,
          food: "free",
          accommodation: "free",
          transport: "free",
          annual_leave_days: 30,
        },
        positions: [
          {
            title: "Electrician",
            vacancies: { male: 5, female: 0 },
            salary: {
              monthly_amount: 2000,
              currency: "AED",
            },
          },
        ],
      },
    );
    console.log('✓ Updated draft with complete data');

    // 8) Validate complete draft (should pass)
    const validation2 = draftJobService.validateDraftForPublishing(completeDraft);
    expect(validation2.valid).toBe(true);
    expect(validation2.errors.length).toBe(0);
    console.log('✓ Validation passed');

    // 9) Publish draft
    const publishResult = await draftJobService.publishDraft(
      completeDraft.id,
      agencyId,
      userId,
      licenseNumber,
    );
    expect(publishResult.job_posting_id).toBeTruthy();
    expect(publishResult.draft_id).toBe(completeDraft.id);
    console.log('✓ Draft published successfully');
    console.log('  Draft ID:', publishResult.draft_id);
    console.log('  Job Posting ID:', publishResult.job_posting_id);

    // 10) Verify draft status changed to published
    const publishedDraft = await draftJobService.findOne(
      completeDraft.id,
      agencyId,
      userId,
    );
    expect(publishedDraft.status).toBe(DraftStatus.PUBLISHED);
    expect(publishedDraft.published_job_id).toBe(publishResult.job_posting_id);
    console.log('✓ Draft status updated to PUBLISHED');

    // 11) Try to update published draft (should fail)
    try {
      await draftJobService.update(completeDraft.id, agencyId, userId, {
        posting_title: "Updated Title",
      });
      throw new Error('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('Cannot update a published draft');
      console.log('✓ Cannot update published draft (as expected)');
    }

    // 12) Try to delete published draft (should fail)
    try {
      await draftJobService.remove(completeDraft.id, agencyId, userId);
      throw new Error('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('Cannot delete a published draft');
      console.log('✓ Cannot delete published draft (as expected)');
    }

    console.log('\n✅ Draft Job Flow Test Completed Successfully!');
  });

  it('creates multiple drafts and lists them', async () => {
    // Seed more countries
    await countryService.upsertMany([
      { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Qatari Riyal', npr_multiplier: '36.50' },
      { country_code: 'SAU', country_name: 'Saudi Arabia', currency_code: 'SAR', currency_name: 'Saudi Riyal', npr_multiplier: '35.50' },
      { country_code: 'KWT', country_name: 'Kuwait', currency_code: 'KWD', currency_name: 'Kuwaiti Dinar', npr_multiplier: '433.00' },
    ]);

    // Create 3 drafts
    const draft1 = await draftJobService.create(agencyId, userId, {
      posting_title: "Plumber - Qatar",
      country: "Qatar",
    });

    const draft2 = await draftJobService.create(agencyId, userId, {
      posting_title: "Carpenter - Saudi Arabia",
      country: "Saudi Arabia",
    });

    const draft3 = await draftJobService.create(agencyId, userId, {
      posting_title: "Mason - Kuwait",
      country: "Kuwait",
    });

    console.log('✓ Created 3 drafts');

    // List all drafts
    const drafts = await draftJobService.findAll(agencyId, userId);
    expect(drafts.length).toBeGreaterThanOrEqual(3);
    console.log('✓ Listed drafts:', drafts.length);

    // Delete one draft
    await draftJobService.remove(draft2.id, agencyId, userId);
    console.log('✓ Deleted draft:', draft2.id);

    // Verify deletion
    const draftsAfterDelete = await draftJobService.findAll(agencyId, userId);
    expect(draftsAfterDelete.length).toBe(drafts.length - 1);
    console.log('✓ Verified deletion, remaining drafts:', draftsAfterDelete.length);

    console.log('\n✅ Multiple Drafts Test Completed Successfully!');
  });
});
