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

/**
 * Frontend-Aligned Draft Job Flow Test
 * 
 * This test follows the exact 8-step wizard flow from the admin panel:
 * 
 * Step 0: Administrative Details (lt_number, chalani_number, dates, announcement_type)
 * Step 1: Contract Terms (period_years, hours, days, overtime, benefits)
 * Step 2: Positions (title, vacancies, salary, currency)
 * Step 3: Tags & Requirements (skills, education, experience)
 * Step 4: Expenses (6 expense types)
 * Step 5: Cutout Upload (job advertisement image)
 * Step 6: Review (preview all data)
 * Step 7: Submit (publish or save as draft)
 */
describe('Draft Job - Frontend 8-Step Wizard Flow', () => {
  let moduleRef: TestingModule;
  let draftJobService: DraftJobService;
  let agencyService: AgencyService;
  let countryService: CountryService;
  let jobTitleService: JobTitleService;
  let agencyId: string;
  let userId: string;
  let licenseNumber: string;
  let dataSource: any;
  let draftId: string;

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

  it('completes full 8-step wizard flow matching frontend expectations', async () => {
    // Setup: Seed prerequisites
    await countryService.upsertMany([
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
      { country_code: 'QAT', country_name: 'Qatar', currency_code: 'QAR', currency_name: 'Qatari Riyal', npr_multiplier: '36.50' },
    ]);
    await jobTitleService.upsertMany([
      { title: 'Electrician', rank: 1 },
      { title: 'Plumber', rank: 2 },
    ]);

    // Create test user and agency
    const userRepo = dataSource.getRepository('User');
    const uniquePhone = `+977${Date.now().toString().slice(-10)}`;
    const testUser = await userRepo.save({
      phone: uniquePhone,
      full_name: 'Frontend Flow Test User',
      role: 'owner',
    });
    userId = testUser.id;

    licenseNumber = `FLOW-${Date.now()}`;
    const agency = await agencyService.createAgency({
      name: "Frontend Flow Test Agency",
      license_number: licenseNumber,
      address: "Test Address",
      phones: ["+977-1-1234567"],
      emails: ["flow@test.com"],
    });
    agencyId = agency.id;

    console.log('✓ Setup complete: User and Agency created');

    // STEP 0: Administrative Details
    console.log('\n📋 STEP 0: Administrative Details');
    const step0Data = {
      posting_title: "Electrician - Dubai Construction Project",
      country: "UAE",
      city: "Dubai",
      employer: {
        company_name: "Dubai Construction LLC",
        country: "UAE",
        city: "Dubai",
      },
      lt_number: "LT-2025-12345",
      chalani_number: "CH-2025-98765",
      approval_date_ad: new Date('2025-01-15'),
      posting_date_ad: new Date('2025-01-20'),
      announcement_type: "full_ad",
      notes: "Urgent requirement for skilled electricians",
      is_partial: true,
      last_completed_step: 0,
    };

    const draft = await draftJobService.create(agencyId, userId, step0Data);
    draftId = draft.id;
    expect(draft.posting_title).toBe(step0Data.posting_title);
    expect(draft.lt_number).toBe(step0Data.lt_number);
    expect(draft.is_partial).toBe(true);
    expect(draft.last_completed_step).toBe(0);
    console.log('✓ Step 0 saved: Administrative details');

    // STEP 1: Contract Terms
    console.log('\n📝 STEP 1: Contract Terms');
    const step1Update = {
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
      is_partial: true,
      last_completed_step: 1,
    };

    const afterStep1 = await draftJobService.update(draftId, agencyId, userId, step1Update);
    expect(afterStep1.contract.period_years).toBe(2);
    expect(afterStep1.contract.food).toBe("free");
    expect(afterStep1.last_completed_step).toBe(1);
    console.log('✓ Step 1 saved: Contract terms');

    // STEP 2: Positions
    console.log('\n👥 STEP 2: Positions');
    const step2Update = {
      positions: [
        {
          title: "Electrician",
          vacancies: { male: 5, female: 0 },
          salary: {
            monthly_amount: 2000,
            currency: "AED",
          },
          position_notes: "Experience in industrial electrical systems required",
        },
        {
          title: "Senior Electrician",
          vacancies: { male: 2, female: 1 },
          salary: {
            monthly_amount: 3000,
            currency: "AED",
          },
          hours_per_day_override: 9,
          position_notes: "Leadership experience required",
        },
      ],
      is_partial: true,
      last_completed_step: 2,
    };

    const afterStep2 = await draftJobService.update(draftId, agencyId, userId, step2Update);
    expect(afterStep2.positions.length).toBe(2);
    expect(afterStep2.positions[0].title).toBe("Electrician");
    expect(afterStep2.positions[0].vacancies.male).toBe(5);
    expect(afterStep2.positions[0].salary.monthly_amount).toBe(2000);
    expect(afterStep2.last_completed_step).toBe(2);
    console.log('✓ Step 2 saved: 2 positions added');

    // STEP 3: Tags & Requirements
    console.log('\n🏷️  STEP 3: Tags & Requirements');
    const step3Update = {
      skills: ["electrical-wiring", "circuit-installation", "industrial-maintenance", "safety-protocols"],
      education_requirements: ["high-school", "diploma"],
      experience_requirements: {
        min_years: 2,
        max_years: 10,
        level: "experienced",
      },
      canonical_title_names: ["Electrician"],
      is_partial: true,
      last_completed_step: 3,
    };

    const afterStep3 = await draftJobService.update(draftId, agencyId, userId, step3Update);
    expect(afterStep3.skills.length).toBe(4);
    expect(afterStep3.education_requirements).toContain("diploma");
    expect(afterStep3.experience_requirements.min_years).toBe(2);
    expect(afterStep3.last_completed_step).toBe(3);
    console.log('✓ Step 3 saved: Skills and requirements');

    // STEP 4: Expenses
    console.log('\n💰 STEP 4: Expenses');
    const step4Update = {
      expenses: {
        medical: {
          domestic: {
            who_pays: "agency",
            is_free: true,
            notes: "Pre-departure medical in Nepal covered by agency",
          },
          foreign: {
            who_pays: "company",
            is_free: true,
            notes: "Medical check-up in UAE covered by employer",
          },
        },
        insurance: {
          who_pays: "company",
          is_free: true,
          coverage_amount: 100000,
          coverage_currency: "AED",
          notes: "Full medical insurance provided by employer",
        },
        travel: {
          who_provides: "company",
          ticket_type: "round_trip",
          is_free: true,
          notes: "Round trip air ticket provided",
        },
        visa: {
          who_pays: "company",
          is_free: true,
          refundable: false,
          notes: "Employment visa fees covered by employer",
        },
        training: {
          who_pays: "company",
          is_free: true,
          duration_days: 7,
          mandatory: true,
          notes: "Safety training upon arrival",
        },
        welfare: {
          welfare: {
            who_pays: "worker",
            is_free: false,
            amount: 5000,
            currency: "NPR",
            fund_purpose: "Foreign employment welfare fund",
            refundable: true,
            notes: "Refundable after contract completion",
          },
          service: {
            who_pays: "worker",
            is_free: false,
            amount: 15000,
            currency: "NPR",
            service_type: "Documentation and processing",
            refundable: false,
            notes: "Agency service charges",
          },
        },
      },
      is_partial: true,
      last_completed_step: 4,
    };

    const afterStep4 = await draftJobService.update(draftId, agencyId, userId, step4Update);
    expect(afterStep4.expenses).toBeDefined();
    expect(afterStep4.expenses.medical).toBeDefined();
    expect(afterStep4.expenses.insurance.coverage_amount).toBe(100000);
    expect(afterStep4.last_completed_step).toBe(4);
    console.log('✓ Step 4 saved: All 6 expense types');

    // STEP 5: Cutout Upload
    console.log('\n📸 STEP 5: Cutout Upload');
    const step5Update = {
      cutout: {
        file_name: "job_ad_electrician.jpg",
        file_url: "/uploads/cutouts/job_ad_electrician.jpg",
        file_size: 245678,
        file_type: "image/jpeg",
        has_file: true,
        is_uploaded: true,
        preview_url: "/uploads/cutouts/job_ad_electrician.jpg",
        uploaded_url: "/uploads/cutouts/job_ad_electrician.jpg",
      },
      is_partial: true,
      last_completed_step: 5,
    };

    const afterStep5 = await draftJobService.update(draftId, agencyId, userId, step5Update);
    expect(afterStep5.cutout.has_file).toBe(true);
    expect(afterStep5.cutout.is_uploaded).toBe(true);
    expect(afterStep5.cutout.file_name).toBe("job_ad_electrician.jpg");
    expect(afterStep5.last_completed_step).toBe(5);
    console.log('✓ Step 5 saved: Cutout uploaded');

    // STEP 6: Review
    console.log('\n👁️  STEP 6: Review');
    const step6Update = {
      reviewed: true,
      is_partial: true,
      last_completed_step: 6,
    };

    const afterStep6 = await draftJobService.update(draftId, agencyId, userId, step6Update);
    expect(afterStep6.reviewed).toBe(true);
    expect(afterStep6.last_completed_step).toBe(6);
    console.log('✓ Step 6 saved: Draft reviewed');

    // STEP 7: Submit (Mark as complete and ready to publish)
    console.log('\n✅ STEP 7: Submit');
    const step7Update = {
      is_complete: true,
      ready_to_publish: true,
      is_partial: false,
      last_completed_step: 7,
    };

    const afterStep7 = await draftJobService.update(draftId, agencyId, userId, step7Update);
    expect(afterStep7.is_complete).toBe(true);
    expect(afterStep7.ready_to_publish).toBe(true);
    expect(afterStep7.is_partial).toBe(false);
    expect(afterStep7.last_completed_step).toBe(7);
    console.log('✓ Step 7 saved: Draft marked as complete');

    // Validate draft is ready for publishing
    const validation = draftJobService.validateDraftForPublishing(afterStep7);
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
    console.log('✓ Validation passed: Draft is ready to publish');

    // Publish the draft
    console.log('\n🚀 Publishing draft to job posting...');
    const publishResult = await draftJobService.publishDraft(
      draftId,
      agencyId,
      userId,
      licenseNumber,
    );
    expect(publishResult.job_posting_id).toBeDefined();
    expect(publishResult.draft_id).toBe(draftId);
    console.log('✓ Draft published successfully');
    console.log(`  Draft ID: ${publishResult.draft_id}`);
    console.log(`  Job Posting ID: ${publishResult.job_posting_id}`);

    // Verify draft status changed to published
    const publishedDraft = await draftJobService.findOne(draftId, agencyId, userId);
    expect(publishedDraft.status).toBe(DraftStatus.PUBLISHED);
    expect(publishedDraft.published_job_id).toBe(publishResult.job_posting_id);
    console.log('✓ Draft status updated to PUBLISHED');

    console.log('\n✅ Full 8-step wizard flow completed successfully!');
  });

  it('supports partial save and resume at any step', async () => {
    console.log('\n📝 Testing partial save and resume functionality');

    // Create a partial draft (stop at step 2)
    const partialDraft = await draftJobService.create(agencyId, userId, {
      posting_title: "Plumber - Qatar Project",
      country: "Qatar",
      city: "Doha",
      employer: {
        company_name: "Qatar Construction Co",
        country: "Qatar",
        city: "Doha",
      },
      lt_number: "LT-2025-54321",
      chalani_number: "CH-2025-56789",
      approval_date_ad: new Date('2025-02-01'),
      posting_date_ad: new Date('2025-02-05'),
      announcement_type: "full_ad",
      contract: {
        period_years: 3,
        renewable: true,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: "paid",
        weekly_off_days: 1,
        food: "free",
        accommodation: "free",
        transport: "paid",
        annual_leave_days: 21,
      },
      positions: [
        {
          title: "Plumber",
          vacancies: { male: 3, female: 0 },
          salary: {
            monthly_amount: 1800,
            currency: "QAR",
          },
        },
      ],
      is_partial: true,
      last_completed_step: 2,
    });

    expect(partialDraft.is_partial).toBe(true);
    expect(partialDraft.last_completed_step).toBe(2);
    console.log('✓ Partial draft saved at step 2');

    // Simulate user leaving and coming back
    console.log('  User leaves and returns later...');

    // Resume and complete remaining steps
    const resumedDraft = await draftJobService.findOne(partialDraft.id, agencyId, userId);
    expect(resumedDraft.last_completed_step).toBe(2);
    console.log('✓ Draft resumed from step 2');

    // Complete remaining steps
    await draftJobService.update(partialDraft.id, agencyId, userId, {
      skills: ["plumbing", "pipe-fitting"],
      education_requirements: ["high-school"],
      experience_requirements: { min_years: 1, max_years: 5, level: "mid-level" },
      is_partial: true,
      last_completed_step: 3,
    });
    console.log('✓ Step 3 completed');

    await draftJobService.update(partialDraft.id, agencyId, userId, {
      expenses: {
        medical: {
          domestic: { who_pays: "agency", is_free: true },
          foreign: { who_pays: "company", is_free: true },
        },
      },
      is_partial: true,
      last_completed_step: 4,
    });
    console.log('✓ Step 4 completed');

    await draftJobService.update(partialDraft.id, agencyId, userId, {
      is_complete: true,
      ready_to_publish: true,
      is_partial: false,
      last_completed_step: 7,
    });
    console.log('✓ Draft marked as complete');

    const finalDraft = await draftJobService.findOne(partialDraft.id, agencyId, userId);
    expect(finalDraft.is_complete).toBe(true);
    expect(finalDraft.is_partial).toBe(false);

    console.log('\n✅ Partial save and resume test completed!');
  });

  it('supports bulk draft creation', async () => {
    console.log('\n📦 Testing bulk draft creation');

    const bulkDraft = await draftJobService.create(agencyId, userId, {
      posting_title: "Multiple Positions - Gulf Countries",
      country: "Multiple Countries",
      employer: {
        company_name: "Multiple Companies",
        country: "Multiple",
        city: "Multiple",
      },
      is_bulk_draft: true,
      bulk_entries: [
        { position: "Electrician", job_count: 5, country: "UAE", salary: "2000", currency: "AED" },
        { position: "Plumber", job_count: 3, country: "Qatar", salary: "1800", currency: "QAR" },
        { position: "Carpenter", job_count: 4, country: "Saudi Arabia", salary: "2200", currency: "SAR" },
      ],
      total_jobs: 12,
      is_partial: false,
      is_complete: true,
    });

    expect(bulkDraft.is_bulk_draft).toBe(true);
    expect(bulkDraft.bulk_entries.length).toBe(3);
    expect(bulkDraft.total_jobs).toBe(12);
    console.log('✓ Bulk draft created with 12 jobs across 3 countries');

    console.log('\n✅ Bulk draft creation test completed!');
  });
});
