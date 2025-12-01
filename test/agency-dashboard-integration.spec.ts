import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyDashboardService } from '../src/modules/agency/agency-dashboard.service';
import { PostingAgency } from '../src/modules/domain/PostingAgency';
import { JobPosting, InterviewDetail, Employer, JobContract, JobPosition } from '../src/modules/domain/domain.entity';
import { JobApplication } from '../src/modules/application/job-application.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

describe('AgencyDashboardService - Integration Tests (Real DB)', () => {
  let module: TestingModule;
  let service: AgencyDashboardService;
  let agencyRepo: Repository<PostingAgency>;
  let jobPostingRepo: Repository<JobPosting>;
  let applicationRepo: Repository<JobApplication>;
  let interviewRepo: Repository<InterviewDetail>;
  let employerRepo: Repository<Employer>;
  let contractRepo: Repository<JobContract>;
  let positionRepo: Repository<JobPosition>;

  // Test data IDs
  let testAgencyId: string;
  let testAgencyLicense: string;
  let testJobId1: string;
  let testJobId2: string;
  let testApplicationId1: string;
  let testApplicationId2: string;
  let testInterviewId1: string;
  let testInterviewId2: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'test_db',
          entities: [
            PostingAgency,
            JobPosting,
            JobApplication,
            InterviewDetail,
            Employer,
            JobContract,
            JobPosition,
          ],
          synchronize: false, // Don't auto-sync in tests
        }),
        TypeOrmModule.forFeature([
          PostingAgency,
          JobPosting,
          JobApplication,
          InterviewDetail,
          Employer,
          JobContract,
          JobPosition,
        ]),
      ],
      providers: [AgencyDashboardService],
    }).compile();

    service = module.get<AgencyDashboardService>(AgencyDashboardService);
    agencyRepo = module.get<Repository<PostingAgency>>(getRepositoryToken(PostingAgency));
    jobPostingRepo = module.get<Repository<JobPosting>>(getRepositoryToken(JobPosting));
    applicationRepo = module.get<Repository<JobApplication>>(getRepositoryToken(JobApplication));
    interviewRepo = module.get<Repository<InterviewDetail>>(getRepositoryToken(InterviewDetail));
    employerRepo = module.get<Repository<Employer>>(getRepositoryToken(Employer));
    contractRepo = module.get<Repository<JobContract>>(getRepositoryToken(JobContract));
    positionRepo = module.get<Repository<JobPosition>>(getRepositoryToken(JobPosition));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
    
    // Insert test data
    await insertTestData();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  async function cleanupTestData() {
    // Delete in reverse order of dependencies
    if (testInterviewId1) await interviewRepo.delete({ id: testInterviewId1 });
    if (testInterviewId2) await interviewRepo.delete({ id: testInterviewId2 });
    if (testApplicationId1) await applicationRepo.delete({ id: testApplicationId1 });
    if (testApplicationId2) await applicationRepo.delete({ id: testApplicationId2 });
    if (testJobId1) {
      await positionRepo.delete({ job_contract_id: testJobId1 });
      await contractRepo.delete({ job_posting_id: testJobId1 });
      await jobPostingRepo.delete({ id: testJobId1 });
    }
    if (testJobId2) {
      await positionRepo.delete({ job_contract_id: testJobId2 });
      await contractRepo.delete({ job_posting_id: testJobId2 });
      await jobPostingRepo.delete({ id: testJobId2 });
    }
    if (testAgencyId) await agencyRepo.delete({ id: testAgencyId });
  }

  async function insertTestData() {
    // Create test agency
    const agency = agencyRepo.create({
      name: 'Test Agency for Dashboard',
      license_number: `TEST-LIC-${Date.now()}`,
      address: 'Test Address',
      phones: ['+977-9841234567'],
      emails: ['test@agency.com'],
    });
    const savedAgency = await agencyRepo.save(agency);
    testAgencyId = savedAgency.id;
    testAgencyLicense = savedAgency.license_number;

    // Create test employer
    const employer = employerRepo.create({
      company_name: 'Test Employer',
      country: 'UAE',
      city: 'Dubai',
    });
    const savedEmployer = await employerRepo.save(employer);

    // Create test job 1 (created this week)
    const job1 = jobPostingRepo.create({
      posting_title: 'Construction Worker - Dubai',
      country: 'UAE',
      city: 'Dubai',
      is_active: true,
      posting_date_ad: new Date(),
      announcement_type: 'full_ad',
    });
    const savedJob1 = await jobPostingRepo.save(job1);
    testJobId1 = savedJob1.id;

    // Create contract for job 1
    const contract1 = contractRepo.create({
      job_posting_id: testJobId1,
      employer_id: savedEmployer.id,
      posting_agency_id: testAgencyId,
      period_years: 2,
      renewable: true,
    });
    await contractRepo.save(contract1);

    // Create test job 2 (created last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const job2 = jobPostingRepo.create({
      posting_title: 'Hotel Manager - Dubai',
      country: 'UAE',
      city: 'Dubai',
      is_active: true,
      posting_date_ad: lastMonth,
      announcement_type: 'full_ad',
    });
    const savedJob2 = await jobPostingRepo.save(job2);
    testJobId2 = savedJob2.id;

    // Create contract for job 2
    const contract2 = contractRepo.create({
      job_posting_id: testJobId2,
      employer_id: savedEmployer.id,
      posting_agency_id: testAgencyId,
      period_years: 2,
      renewable: true,
    });
    await contractRepo.save(contract2);

    // Create test applications with history_blob
    const app1 = applicationRepo.create({
      job_posting_id: testJobId1,
      candidate_id: '00000000-0000-0000-0000-000000000001', // Dummy candidate ID
      status: 'shortlisted',
      history_blob: [
        {
          prev_status: null,
          next_status: 'applied',
          updated_at: new Date().toISOString(),
          updated_by: null,
          note: 'Initial application',
        },
        {
          prev_status: 'applied',
          next_status: 'shortlisted',
          updated_at: new Date().toISOString(),
          updated_by: testAgencyId,
          note: 'Good candidate',
        },
      ],
    });
    const savedApp1 = await applicationRepo.save(app1);
    testApplicationId1 = savedApp1.id;

    const app2 = applicationRepo.create({
      job_posting_id: testJobId2,
      candidate_id: '00000000-0000-0000-0000-000000000002', // Dummy candidate ID
      status: 'applied',
      history_blob: [
        {
          prev_status: null,
          next_status: 'applied',
          updated_at: new Date().toISOString(),
          updated_by: null,
          note: 'Initial application',
        },
      ],
    });
    const savedApp2 = await applicationRepo.save(app2);
    testApplicationId2 = savedApp2.id;

    // Create test interviews
    const today = new Date();
    const interview1 = interviewRepo.create({
      job_posting_id: testJobId1,
      job_application_id: testApplicationId1,
      interview_date_ad: today,
      interview_time: '10:00:00',
      duration_minutes: 60,
      status: 'completed',
      result: 'pass',
      completed_at: new Date(),
      type: 'In-person',
    });
    const savedInterview1 = await interviewRepo.save(interview1);
    testInterviewId1 = savedInterview1.id;

    const interview2 = interviewRepo.create({
      job_posting_id: testJobId2,
      job_application_id: testApplicationId2,
      interview_date_ad: today,
      interview_time: '14:00:00',
      duration_minutes: 60,
      status: 'completed',
      result: 'fail',
      completed_at: new Date(),
      type: 'Online',
    });
    const savedInterview2 = await interviewRepo.save(interview2);
    testInterviewId2 = savedInterview2.id;
  }

  describe('Real Database Tests', () => {
    it('should retrieve analytics from real database', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      expect(result).toBeDefined();
      expect(result.jobs).toBeDefined();
      expect(result.applications).toBeDefined();
      expect(result.interviews).toBeDefined();
    });

    it('should return correct job counts', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      // Should have 2 jobs total
      expect(result.jobs.total).toBe(2);
      
      // Both jobs are active
      expect(result.jobs.active).toBe(2);
      expect(result.jobs.inactive).toBe(0);
    });

    it('should calculate time-scoped job metrics', async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: weekAgo.toISOString(),
        endDate: new Date().toISOString(),
      });

      // Job 1 was created this week
      expect(result.jobs.createdInTimeframe).toBeGreaterThanOrEqual(1);
      
      // Job 1 is open and in timeframe
      expect(result.jobs.openInTimeframe).toBeGreaterThanOrEqual(1);
    });

    it('should parse history_blob correctly', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        endDate: new Date().toISOString(),
      });

      // Should have status changes in timeframe
      expect(result.applications.byStatusInTimeframe).toBeDefined();
      
      // Should have at least 2 applications that moved to 'applied' status
      expect(result.applications.byStatusInTimeframe.applied).toBeGreaterThanOrEqual(2);
      
      // Should have 1 application that moved to 'shortlisted' status
      expect(result.applications.byStatusInTimeframe.shortlisted).toBeGreaterThanOrEqual(1);
    });

    it('should calculate pass rate from real data', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      // We have 2 interviews: 1 pass, 1 fail
      expect(result.interviews.completed).toBe(2);
      expect(result.interviews.passed).toBe(1);
      expect(result.interviews.failed).toBe(1);
      
      // Pass rate should be 50%
      expect(result.interviews.passRate).toBe(50);
    });

    it('should calculate today\'s interview status from real data', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      // Both interviews were completed today
      expect(result.interviews.todayStatus.pass).toBe(1);
      expect(result.interviews.todayStatus.fail).toBe(1);
    });

    it('should filter by country', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        country: 'UAE',
      });

      // Both jobs are in UAE
      expect(result.jobs.total).toBe(2);
      
      // Should have UAE in available countries
      expect(result.availableCountries).toContain('UAE');
    });

    it('should return available jobs for dropdown', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      expect(result.availableJobs).toBeDefined();
      expect(result.availableJobs.length).toBe(2);
      
      // Check job structure
      expect(result.availableJobs[0]).toHaveProperty('id');
      expect(result.availableJobs[0]).toHaveProperty('title');
      expect(result.availableJobs[0]).toHaveProperty('country');
    });

    it('should have all new fields in response', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      // New job fields
      expect(result.jobs).toHaveProperty('openInTimeframe');
      expect(result.jobs).toHaveProperty('createdInTimeframe');
      expect(result.jobs).toHaveProperty('draftInTimeframe');

      // New application fields
      expect(result.applications).toHaveProperty('byStatusInTimeframe');

      // New interview fields
      expect(result.interviews).toHaveProperty('passRate');
      expect(result.interviews).toHaveProperty('todayStatus');
      expect(result.interviews.todayStatus).toHaveProperty('pass');
      expect(result.interviews.todayStatus).toHaveProperty('fail');
    });

    it('should maintain backward compatibility with old fields', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      // Old job fields
      expect(result.jobs).toHaveProperty('total');
      expect(result.jobs).toHaveProperty('active');
      expect(result.jobs).toHaveProperty('inactive');
      expect(result.jobs).toHaveProperty('drafts');
      expect(result.jobs).toHaveProperty('recentInRange');

      // Old application fields
      expect(result.applications).toHaveProperty('total');
      expect(result.applications).toHaveProperty('byStatus');
      expect(result.applications).toHaveProperty('uniqueJobs');
      expect(result.applications).toHaveProperty('recentInRange');

      // Old interview fields
      expect(result.interviews).toHaveProperty('total');
      expect(result.interviews).toHaveProperty('pending');
      expect(result.interviews).toHaveProperty('completed');
      expect(result.interviews).toHaveProperty('passed');
      expect(result.interviews).toHaveProperty('failed');
      expect(result.interviews).toHaveProperty('recentInRange');
    });
  });
});
