import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyDashboardService } from '../src/modules/agency/agency-dashboard.service';
import { PostingAgency } from '../src/modules/domain/PostingAgency';
import { JobPosting, InterviewDetail, Employer, JobContract, JobPosition } from '../src/modules/domain/domain.entity';
import { JobApplication } from '../src/modules/application/job-application.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

/**
 * Ramesh's Journey Test Suite
 * 
 * This test simulates Ramesh's 3-month journey with scattered data:
 * - Month 1 (September): 5 jobs, 23 applications, 2 interviews, 0% pass rate
 * - Month 2 (October): 15 jobs, 89 applications, 18 interviews, 47% pass rate
 * - Month 3 (November): 25 jobs, 156 applications, 34 interviews, 64% pass rate
 * - Today (December 1st): Real-time status
 */
describe('AgencyDashboardService - Ramesh\'s Journey (3 Months)', () => {
  let module: TestingModule;
  let service: AgencyDashboardService;
  let agencyRepo: Repository<PostingAgency>;
  let jobPostingRepo: Repository<JobPosting>;
  let applicationRepo: Repository<JobApplication>;
  let interviewRepo: Repository<InterviewDetail>;
  let employerRepo: Repository<Employer>;
  let contractRepo: Repository<JobContract>;

  let testAgencyId: string;
  let testAgencyLicense: string;
  let testEmployerId: string;

  // Track created IDs for cleanup
  const createdJobIds: string[] = [];
  const createdApplicationIds: string[] = [];
  const createdInterviewIds: string[] = [];

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
          synchronize: false,
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
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await cleanupTestData();
    await insertRameshJourneyData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  async function cleanupTestData() {
    // Delete in reverse order of dependencies
    for (const id of createdInterviewIds) {
      await interviewRepo.delete({ id }).catch(() => {});
    }
    for (const id of createdApplicationIds) {
      await applicationRepo.delete({ id }).catch(() => {});
    }
    for (const id of createdJobIds) {
      await contractRepo.delete({ job_posting_id: id }).catch(() => {});
      await jobPostingRepo.delete({ id }).catch(() => {});
    }
    if (testAgencyId) await agencyRepo.delete({ id: testAgencyId }).catch(() => {});
    if (testEmployerId) await employerRepo.delete({ id: testEmployerId }).catch(() => {});

    createdJobIds.length = 0;
    createdApplicationIds.length = 0;
    createdInterviewIds.length = 0;
  }

  async function insertRameshJourneyData() {
    // Create Ramesh's agency
    const agency = agencyRepo.create({
      name: 'Nepal Overseas Placement Services',
      license_number: `RAMESH-${Date.now()}`,
      address: 'Kathmandu, Nepal',
      phones: ['+977-9841234567'],
      emails: ['ramesh@nops.com'],
    });
    const savedAgency = await agencyRepo.save(agency);
    testAgencyId = savedAgency.id;
    testAgencyLicense = savedAgency.license_number;

    // Create employers
    const employer = employerRepo.create({
      company_name: 'Dubai Construction Co',
      country: 'UAE',
      city: 'Dubai',
    });
    const savedEmployer = await employerRepo.save(employer);
    testEmployerId = savedEmployer.id;

    const qatarEmployer = employerRepo.create({
      company_name: 'Qatar Hospitality Group',
      country: 'Qatar',
      city: 'Doha',
    });
    const savedQatarEmployer = await employerRepo.save(qatarEmployer);

    // Month 1: September (5 jobs, 23 applications, 2 interviews, 0% pass)
    await createMonthData({
      month: 8, // September (0-indexed)
      year: 2025,
      jobCount: 5,
      applicationCount: 23,
      interviewCount: 2,
      passCount: 0,
      countries: ['UAE', 'UAE', 'UAE', 'Qatar', 'Saudi Arabia'],
      employerId: savedEmployer.id,
    });

    // Month 2: October (15 jobs, 89 applications, 18 interviews, 47% pass)
    await createMonthData({
      month: 9, // October
      year: 2025,
      jobCount: 15,
      applicationCount: 89,
      interviewCount: 18,
      passCount: 8, // 8/18 = 44.4% (close to 47%)
      countries: ['UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'Qatar', 'Qatar', 'Qatar', 'Saudi Arabia', 'Saudi Arabia', 'Saudi Arabia', 'Bahrain'],
      employerId: savedEmployer.id,
    });

    // Month 3: November (25 jobs, 156 applications, 34 interviews, 64% pass)
    await createMonthData({
      month: 10, // November
      year: 2025,
      jobCount: 25,
      applicationCount: 156,
      interviewCount: 34,
      passCount: 22, // 22/34 = 64.7%
      countries: ['UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'UAE', 'Qatar', 'Qatar', 'Qatar', 'Qatar', 'Qatar', 'Saudi Arabia', 'Saudi Arabia', 'Saudi Arabia', 'Bahrain', 'Oman'],
      employerId: savedEmployer.id,
    });

    // Today: December 1st (3 jobs this week, 2 interviews today)
    const today = new Date(2025, 11, 1); // December 1, 2025
    await createTodayData({
      date: today,
      jobCount: 3,
      applicationCount: 34,
      interviewCount: 8,
      todayInterviewCount: 2,
      todayPassCount: 2,
      todayFailCount: 0,
      employerId: savedEmployer.id,
    });
  }

  async function createMonthData(params: {
    month: number;
    year: number;
    jobCount: number;
    applicationCount: number;
    interviewCount: number;
    passCount: number;
    countries: string[];
    employerId: string;
  }) {
    const { month, year, jobCount, applicationCount, interviewCount, passCount, countries, employerId } = params;

    // Create jobs scattered throughout the month
    for (let i = 0; i < jobCount; i++) {
      const dayOfMonth = Math.floor((i / jobCount) * 28) + 1; // Spread across month
      const jobDate = new Date(year, month, dayOfMonth);
      const country = countries[i % countries.length];

      const job = jobPostingRepo.create({
        posting_title: `${country} Job ${i + 1} - ${getJobTitle(i)}`,
        country,
        city: getCityForCountry(country),
        is_active: Math.random() > 0.2, // 80% active
        posting_date_ad: jobDate,
        created_at: jobDate,
        updated_at: jobDate,
        announcement_type: 'full_ad',
      });
      const savedJob = await jobPostingRepo.save(job);
      createdJobIds.push(savedJob.id);

      // Create contract
      const contract = contractRepo.create({
        job_posting_id: savedJob.id,
        employer_id: employerId,
        posting_agency_id: testAgencyId,
        period_years: 2,
        renewable: true,
      });
      await contractRepo.save(contract);

      // Create applications for this job (distributed)
      const appsForJob = Math.floor(applicationCount / jobCount);
      for (let j = 0; j < appsForJob; j++) {
        const appDay = dayOfMonth + Math.floor(Math.random() * 5);
        const appDate = new Date(year, month, Math.min(appDay, 28));

        const statuses = ['applied', 'shortlisted', 'interview', 'passed', 'rejected'];
        const finalStatus = statuses[Math.floor(Math.random() * statuses.length)];

        const app = applicationRepo.create({
          job_posting_id: savedJob.id,
          candidate_id: `candidate-${month}-${i}-${j}`,
          status: finalStatus,
          created_at: appDate,
          history_blob: generateHistoryBlob(appDate, finalStatus),
        });
        const savedApp = await applicationRepo.save(app);
        createdApplicationIds.push(savedApp.id);
      }
    }

    // Create interviews scattered throughout the month
    const jobsWithInterviews = createdJobIds.slice(-jobCount);
    for (let i = 0; i < interviewCount; i++) {
      const dayOfMonth = Math.floor((i / interviewCount) * 28) + 5; // Start interviews 5 days into month
      const interviewDate = new Date(year, month, dayOfMonth);
      const jobId = jobsWithInterviews[i % jobsWithInterviews.length];

      // Find an application for this job
      const apps = await applicationRepo.find({ where: { job_posting_id: jobId }, take: 1 });
      if (apps.length === 0) continue;

      const isPassed = i < passCount;
      const interview = interviewRepo.create({
        job_posting_id: jobId,
        job_application_id: apps[0].id,
        interview_date_ad: interviewDate,
        interview_time: '10:00:00',
        duration_minutes: 60,
        status: 'completed',
        result: isPassed ? 'pass' : 'fail',
        completed_at: interviewDate,
        type: 'In-person',
      });
      const savedInterview = await interviewRepo.save(interview);
      createdInterviewIds.push(savedInterview.id);
    }
  }

  async function createTodayData(params: {
    date: Date;
    jobCount: number;
    applicationCount: number;
    interviewCount: number;
    todayInterviewCount: number;
    todayPassCount: number;
    todayFailCount: number;
    employerId: string;
  }) {
    const { date, jobCount, applicationCount, interviewCount, todayInterviewCount, todayPassCount, todayFailCount, employerId } = params;

    // Create jobs for this week
    for (let i = 0; i < jobCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const jobDate = new Date(date);
      jobDate.setDate(jobDate.getDate() - daysAgo);

      const job = jobPostingRepo.create({
        posting_title: `This Week Job ${i + 1}`,
        country: 'UAE',
        city: 'Dubai',
        is_active: true,
        posting_date_ad: jobDate,
        created_at: jobDate,
        updated_at: jobDate,
        announcement_type: 'full_ad',
      });
      const savedJob = await jobPostingRepo.save(job);
      createdJobIds.push(savedJob.id);

      const contract = contractRepo.create({
        job_posting_id: savedJob.id,
        employer_id: employerId,
        posting_agency_id: testAgencyId,
        period_years: 2,
        renewable: true,
      });
      await contractRepo.save(contract);
    }

    // Create applications for this week
    const recentJobs = createdJobIds.slice(-jobCount);
    for (let i = 0; i < applicationCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const appDate = new Date(date);
      appDate.setDate(appDate.getDate() - daysAgo);

      const jobId = recentJobs[i % recentJobs.length];
      const app = applicationRepo.create({
        job_posting_id: jobId,
        candidate_id: `candidate-today-${i}`,
        status: 'applied',
        created_at: appDate,
        history_blob: generateHistoryBlob(appDate, 'applied'),
      });
      const savedApp = await applicationRepo.save(app);
      createdApplicationIds.push(savedApp.id);
    }

    // Create interviews for this week
    for (let i = 0; i < interviewCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const interviewDate = new Date(date);
      interviewDate.setDate(interviewDate.getDate() - daysAgo);

      const apps = await applicationRepo.find({ take: 1, skip: i });
      if (apps.length === 0) continue;

      const interview = interviewRepo.create({
        job_posting_id: apps[0].job_posting_id,
        job_application_id: apps[0].id,
        interview_date_ad: interviewDate,
        interview_time: '10:00:00',
        duration_minutes: 60,
        status: i < interviewCount - 2 ? 'completed' : 'scheduled',
        result: i < interviewCount - 2 ? (Math.random() > 0.3 ? 'pass' : 'fail') : null,
        completed_at: i < interviewCount - 2 ? interviewDate : null,
        type: 'In-person',
      });
      const savedInterview = await interviewRepo.save(interview);
      createdInterviewIds.push(savedInterview.id);
    }

    // Create today's interviews
    for (let i = 0; i < todayInterviewCount; i++) {
      const apps = await applicationRepo.find({ take: 1, skip: applicationCount + i });
      if (apps.length === 0) continue;

      const interview = interviewRepo.create({
        job_posting_id: apps[0].job_posting_id,
        job_application_id: apps[0].id,
        interview_date_ad: date,
        interview_time: `${10 + i}:00:00`,
        duration_minutes: 60,
        status: 'completed',
        result: i < todayPassCount ? 'pass' : 'fail',
        completed_at: date,
        type: 'In-person',
      });
      const savedInterview = await interviewRepo.save(interview);
      createdInterviewIds.push(savedInterview.id);
    }
  }

  function generateHistoryBlob(startDate: Date, finalStatus: string): any[] {
    const history = [
      {
        prev_status: null,
        next_status: 'applied',
        updated_at: startDate.toISOString(),
        updated_by: null,
        note: 'Initial application',
      },
    ];

    if (finalStatus !== 'applied') {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + 2);
      history.push({
        prev_status: 'applied',
        next_status: finalStatus,
        updated_at: nextDate.toISOString(),
        updated_by: testAgencyId,
        note: `Moved to ${finalStatus}`,
      });
    }

    return history;
  }

  function getJobTitle(index: number): string {
    const titles = [
      'Construction Worker',
      'Hotel Manager',
      'Chef',
      'Driver',
      'Security Guard',
      'Nurse',
      'Electrician',
      'Plumber',
      'Waiter',
      'Cleaner',
    ];
    return titles[index % titles.length];
  }

  function getCityForCountry(country: string): string {
    const cities: Record<string, string> = {
      'UAE': 'Dubai',
      'Qatar': 'Doha',
      'Saudi Arabia': 'Riyadh',
      'Bahrain': 'Manama',
      'Oman': 'Muscat',
    };
    return cities[country] || 'Unknown';
  }

  describe('Ramesh\'s Journey - Month by Month', () => {
    it('Month 1 (September): Should show 5 jobs, low activity', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-30T23:59:59.999Z',
      });

      console.log('September Analytics:', JSON.stringify(result, null, 2));

      expect(result.jobs.createdInTimeframe).toBe(5);
      expect(result.applications.recentInRange).toBeGreaterThanOrEqual(20);
      expect(result.interviews.recentInRange).toBe(2);
      
      // Pass rate should be 0% (0 passed out of 2)
      expect(result.interviews.passRate).toBe(0);
    });

    it('Month 2 (October): Should show 15 jobs, improving pass rate', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-10-01T00:00:00.000Z',
        endDate: '2025-10-31T23:59:59.999Z',
      });

      console.log('October Analytics:', JSON.stringify(result, null, 2));

      expect(result.jobs.createdInTimeframe).toBe(15);
      expect(result.applications.recentInRange).toBeGreaterThanOrEqual(80);
      expect(result.interviews.recentInRange).toBe(18);
      
      // Pass rate should be around 44-47%
      expect(result.interviews.passRate).toBeGreaterThan(40);
      expect(result.interviews.passRate).toBeLessThan(50);
    });

    it('Month 3 (November): Should show 25 jobs, high pass rate', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-11-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
      });

      console.log('November Analytics:', JSON.stringify(result, null, 2));

      expect(result.jobs.createdInTimeframe).toBe(25);
      expect(result.applications.recentInRange).toBeGreaterThanOrEqual(150);
      expect(result.interviews.recentInRange).toBe(34);
      
      // Pass rate should be around 64%
      expect(result.interviews.passRate).toBeGreaterThan(60);
      expect(result.interviews.passRate).toBeLessThan(70);
    });

    it('Last 3 Months: Should show total of 45 jobs', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
      });

      console.log('Last 3 Months Analytics:', JSON.stringify(result, null, 2));

      // Total jobs created in 3 months
      expect(result.jobs.createdInTimeframe).toBe(45);
      
      // Total applications
      expect(result.applications.recentInRange).toBeGreaterThanOrEqual(250);
      
      // Total interviews
      expect(result.interviews.recentInRange).toBe(54);
      
      // Overall pass rate (30 passed out of 54)
      expect(result.interviews.passRate).toBeGreaterThan(50);
    });

    it('This Week (December): Should show recent activity', async () => {
      const weekAgo = new Date(2025, 11, 1);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: weekAgo.toISOString(),
        endDate: new Date(2025, 11, 1).toISOString(),
      });

      console.log('This Week Analytics:', JSON.stringify(result, null, 2));

      expect(result.jobs.createdInTimeframe).toBe(3);
      expect(result.applications.recentInRange).toBeGreaterThanOrEqual(30);
      expect(result.interviews.recentInRange).toBeGreaterThanOrEqual(8);
    });

    it('Today (December 1st): Should show today\'s interview status', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {});

      console.log('Today\'s Status:', JSON.stringify(result.interviews.todayStatus, null, 2));

      // Should have 2 interviews today
      expect(result.interviews.todayStatus.pass).toBe(2);
      expect(result.interviews.todayStatus.fail).toBe(0);
    });
  });

  describe('Country Filtering', () => {
    it('UAE: Should show majority of jobs', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
        country: 'UAE',
      });

      console.log('UAE Analytics:', JSON.stringify(result, null, 2));

      // UAE should have most jobs
      expect(result.jobs.createdInTimeframe).toBeGreaterThan(20);
    });

    it('Qatar: Should show fewer jobs', async () => {
      const result = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
        country: 'Qatar',
      });

      console.log('Qatar Analytics:', JSON.stringify(result, null, 2));

      // Qatar should have fewer jobs than UAE
      expect(result.jobs.createdInTimeframe).toBeLessThan(15);
      expect(result.jobs.createdInTimeframe).toBeGreaterThan(0);
    });
  });

  describe('Growth Metrics', () => {
    it('Should show month-over-month growth', async () => {
      const sept = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-30T23:59:59.999Z',
      });

      const oct = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-10-01T00:00:00.000Z',
        endDate: '2025-10-31T23:59:59.999Z',
      });

      const nov = await service.getDashboardAnalytics(testAgencyLicense, {
        startDate: '2025-11-01T00:00:00.000Z',
        endDate: '2025-11-30T23:59:59.999Z',
      });

      console.log('Growth Trajectory:');
      console.log('September:', sept.jobs.createdInTimeframe, 'jobs');
      console.log('October:', oct.jobs.createdInTimeframe, 'jobs');
      console.log('November:', nov.jobs.createdInTimeframe, 'jobs');

      // Jobs should increase each month
      expect(oct.jobs.createdInTimeframe).toBeGreaterThan(sept.jobs.createdInTimeframe);
      expect(nov.jobs.createdInTimeframe).toBeGreaterThan(oct.jobs.createdInTimeframe);

      // Pass rate should improve
      expect(oct.interviews.passRate).toBeGreaterThan(sept.interviews.passRate);
      expect(nov.interviews.passRate).toBeGreaterThan(oct.interviews.passRate);
    });
  });
});
