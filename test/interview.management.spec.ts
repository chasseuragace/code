import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainModule } from 'src/modules/domain/domain.module';
import { ApplicationModule } from 'src/modules/application/application.module';
import { CandidateModule } from 'src/modules/candidate/candidate.module';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { CountryModule } from 'src/modules/country/country.module';
import { JobTitleModule } from 'src/modules/job-title/job-title.module';
import { ApplicationService } from 'src/modules/application/application.service';
import { InterviewHelperService } from 'src/modules/domain/interview-helper.service';
import { JobPostingService } from 'src/modules/domain/domain.service';
import { AgencyService } from 'src/modules/agency/agency.service';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { CountryService } from 'src/modules/country/country.service';

/**
 * Interview Management Tests
 * 
 * Tests the enhanced interview functionality including:
 * - Interview status tracking
 * - Interview completion with results
 * - Interview cancellation
 * - Interview rescheduling
 * - Interview statistics
 */

describe('Interview Management', () => {
  let moduleRef: TestingModule;
  let applicationService: ApplicationService;
  let interviewHelperService: InterviewHelperService;
  let jobPostingService: JobPostingService;
  let agencyService: AgencyService;
  let candidateService: CandidateService;
  let countryService: CountryService;
  let dataSource: DataSource;

  let testJobId: string;
  let testApplicationId: string;
  let testCandidateId: string;

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
        DomainModule,
        ApplicationModule,
        CandidateModule,
        AgencyModule,
        CountryModule,
        JobTitleModule,
      ],
    }).compile();

    applicationService = moduleRef.get(ApplicationService);
    interviewHelperService = moduleRef.get(InterviewHelperService);
    jobPostingService = moduleRef.get(JobPostingService);
    agencyService = moduleRef.get(AgencyService);
    candidateService = moduleRef.get(CandidateService);
    countryService = moduleRef.get(CountryService);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('should set up test data (agency, job, candidate, application)', async () => {
    // Seed country
    await countryService.upsertMany([
      { 
        country_code: 'UAE', 
        country_name: 'United Arab Emirates', 
        currency_code: 'AED', 
        currency_name: 'UAE Dirham', 
        npr_multiplier: '36.00' 
      },
    ]);

    // Create agency
    const agency = await agencyService.createAgency({
      name: 'Interview Test Agency',
      license_number: 'LIC-INT-TEST-001',
      address: 'Kathmandu',
      phones: ['+977-1-5559999'],
      emails: ['interview@test.com'],
    });

    // Create job
    const job = await jobPostingService.createJobPosting({
      posting_title: 'Test Job for Interviews',
      country: 'UAE',
      city: 'Dubai',
      posting_date_ad: new Date().toISOString().slice(0, 10),
      announcement_type: 'full_ad' as any,
      posting_agency: {
        name: agency.name,
        license_number: agency.license_number,
      },
      employer: {
        company_name: 'Test Employer',
        country: 'UAE',
        city: 'Dubai',
      },
      contract: {
        period_years: 2,
        renewable: true,
        hours_per_day: 8,
        days_per_week: 6,
      },
      positions: [
        {
          title: 'Test Position',
          vacancies: { male: 5, female: 5 },
          salary: { monthly_amount: 1500, currency: 'AED' },
        },
      ],
    });
    testJobId = job.id;

    // Create candidate
    const candidate = await candidateService.createCandidate({
      full_name: 'Test Candidate',
      phone: '+977-9841234567',
      email: 'testcandidate@example.com',
      gender: 'male',
      age: 25,
      address: {
        province: 'Bagmati',
        district: 'Kathmandu',
        municipality: 'Kathmandu',
        ward: 1,
      },
    });
    testCandidateId = candidate.id;

    // Create application
    const position = job.contracts[0].positions[0];
    const application = await applicationService.apply(
      testCandidateId,
      testJobId,
      position.id,
      { note: 'Test application for interview tests' }
    );
    testApplicationId = application.id;

    // Shortlist the candidate
    await applicationService.updateStatus(testApplicationId, 'shortlisted', {
      note: 'Shortlisted for interview test',
    });

    expect(testJobId).toBeDefined();
    expect(testApplicationId).toBeDefined();
    expect(testCandidateId).toBeDefined();
  });

  it('should schedule an interview with new fields', async () => {
    const result = await applicationService.scheduleInterview(
      testApplicationId,
      {
        interview_date_ad: '2025-12-15',
        interview_time: '14:00',
        duration_minutes: 60,
        location: 'Office - Conference Room A',
        contact_person: 'Test Interviewer',
        required_documents: ['passport', 'cv'],
        notes: 'Please arrive 10 minutes early',
      },
      { note: 'Interview scheduled via test', updatedBy: 'test-system' }
    );

    expect(result.status).toBe('interview_scheduled');

    // Verify interview was created with new fields
    const interview = await interviewHelperService.findLatestInterviewForApplication(testApplicationId);
    expect(interview).toBeDefined();
    expect(interview?.status).toBe('scheduled');
    expect(interview?.type).toBe('In-person');
    expect(interview?.duration_minutes).toBe(60);
  });

  it('should reschedule an interview and set rescheduled_at timestamp', async () => {
    const interview = await interviewHelperService.findLatestInterviewForApplication(testApplicationId);
    expect(interview).toBeDefined();

    await applicationService.rescheduleInterview(
      testApplicationId,
      interview!.id,
      {
        interview_date_ad: '2025-12-20',
        interview_time: '10:00',
        location: 'Office - Conference Room B',
      },
      { note: 'Rescheduled due to interviewer availability', updatedBy: 'test-system' }
    );

    // Verify reschedule
    const updatedInterview = await interviewHelperService.findLatestInterviewForApplication(testApplicationId);
    expect(updatedInterview?.status).toBe('scheduled');
    expect(updatedInterview?.rescheduled_at).toBeDefined();
    expect(updatedInterview?.location).toBe('Office - Conference Room B');
  });

  it('should complete an interview with pass result', async () => {
    const interview = await interviewHelperService.findLatestInterviewForApplication(testApplicationId);
    expect(interview).toBeDefined();

    await applicationService.completeInterview(
      testApplicationId,
      'passed',
      { note: 'Candidate performed well', updatedBy: 'test-system' }
    );

    // Verify completion
    const updatedInterview = await interviewHelperService.findLatestInterviewForApplication(testApplicationId);
    expect(updatedInterview?.status).toBe('completed');
    expect(updatedInterview?.result).toBe('pass');
    expect(updatedInterview?.completed_at).toBeDefined();

    // Verify application status
    const application = await applicationService.getById(testApplicationId);
    expect(application?.status).toBe('interview_passed');
  });

  it('should get interview statistics for a job', async () => {
    const stats = await interviewHelperService.getInterviewStatsForJob(testJobId, 'all');

    expect(stats).toBeDefined();
    expect(stats.completed).toBeGreaterThanOrEqual(1);
    expect(stats.passed).toBeGreaterThanOrEqual(1);
    expect(typeof stats.total_scheduled).toBe('number');
    expect(typeof stats.today).toBe('number');
    expect(typeof stats.tomorrow).toBe('number');
    expect(typeof stats.unattended).toBe('number');
    expect(typeof stats.cancelled).toBe('number');
    expect(typeof stats.failed).toBe('number');
  });

  it('should detect unattended interviews correctly', async () => {
    // Create a new application for unattended test
    const position = (await jobPostingService.findJobPostingById(testJobId)).contracts[0].positions[0];
    const candidate2 = await candidateService.createCandidate({
      full_name: 'Test Candidate 2',
      phone: '+977-9841234568',
      email: 'testcandidate2@example.com',
      gender: 'male',
      age: 26,
      address: {
        province: 'Bagmati',
        district: 'Kathmandu',
        municipality: 'Kathmandu',
        ward: 2,
      },
    });

    const application2 = await applicationService.apply(
      candidate2.id,
      testJobId,
      position.id,
      { note: 'Test application for unattended test' }
    );

    await applicationService.updateStatus(application2.id, 'shortlisted');

    // Schedule interview in the past
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    
    await applicationService.scheduleInterview(
      application2.id,
      {
        interview_date_ad: pastDate.toISOString().slice(0, 10),
        interview_time: '10:00',
        duration_minutes: 60,
        location: 'Office',
        contact_person: 'Test Interviewer',
      },
      { note: 'Past interview for unattended test' }
    );

    const interview = await interviewHelperService.findLatestInterviewForApplication(application2.id);
    expect(interview).toBeDefined();

    // Check if it's detected as unattended
    const isUnattended = interviewHelperService.isInterviewUnattended(interview!);
    expect(isUnattended).toBe(true);
  });

  it('should cancel interview when application is withdrawn', async () => {
    // Create another application for withdrawal test
    const position = (await jobPostingService.findJobPostingById(testJobId)).contracts[0].positions[0];
    const candidate3 = await candidateService.createCandidate({
      full_name: 'Test Candidate 3',
      phone: '+977-9841234569',
      email: 'testcandidate3@example.com',
      gender: 'female',
      age: 24,
      address: {
        province: 'Bagmati',
        district: 'Kathmandu',
        municipality: 'Kathmandu',
        ward: 3,
      },
    });

    const application3 = await applicationService.apply(
      candidate3.id,
      testJobId,
      position.id,
      { note: 'Test application for withdrawal test' }
    );

    await applicationService.updateStatus(application3.id, 'shortlisted');

    await applicationService.scheduleInterview(
      application3.id,
      {
        interview_date_ad: '2025-12-25',
        interview_time: '14:00',
        duration_minutes: 60,
        location: 'Office',
        contact_person: 'Test Interviewer',
      },
      { note: 'Interview for withdrawal test' }
    );

    // Withdraw application
    await applicationService.withdraw(
      candidate3.id,
      testJobId,
      { note: 'Candidate withdrew', updatedBy: 'test-system' }
    );

    // Verify interview was cancelled
    const interview = await interviewHelperService.findLatestInterviewForApplication(application3.id);
    expect(interview?.status).toBe('cancelled');
    expect(interview?.result).toBe('rejected');
    expect(interview?.cancelled_at).toBeDefined();
  });
});
