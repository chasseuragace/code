import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyDashboardService } from '../src/modules/agency/agency-dashboard.service';
import { PostingAgency } from '../src/modules/domain/PostingAgency';
import { JobPosting, InterviewDetail } from '../src/modules/domain/domain.entity';
import { JobApplication } from '../src/modules/application/job-application.entity';
import { NotFoundException } from '@nestjs/common';

describe('AgencyDashboardService - Upgrade Tests', () => {
  let service: AgencyDashboardService;
  let agencyRepo: Repository<PostingAgency>;
  let jobPostingRepo: Repository<JobPosting>;
  let applicationRepo: Repository<JobApplication>;
  let interviewRepo: Repository<InterviewDetail>;

  const mockAgency = {
    id: 'agency-uuid-123',
    license_number: 'LIC-AG-0001',
    name: 'Test Agency',
  };

  const mockJobPostings = [
    {
      id: 'job-1',
      posting_title: 'Construction Worker - Dubai',
      country: 'UAE',
      is_active: true,
      created_at: new Date('2025-11-01'),
      updated_at: new Date('2025-11-15'),
      contracts: [{ posting_agency_id: 'agency-uuid-123' }],
    },
    {
      id: 'job-2',
      posting_title: 'Hotel Manager - Dubai',
      country: 'UAE',
      is_active: true,
      created_at: new Date('2025-11-20'),
      updated_at: new Date('2025-11-25'),
      contracts: [{ posting_agency_id: 'agency-uuid-123' }],
    },
    {
      id: 'job-3',
      posting_title: 'Driver - Qatar',
      country: 'Qatar',
      is_active: false,
      created_at: new Date('2025-10-15'),
      updated_at: new Date('2025-10-20'),
      contracts: [{ posting_agency_id: 'agency-uuid-123' }],
    },
  ];

  const mockApplications = [
    {
      id: 'app-1',
      job_posting_id: 'job-1',
      status: 'applied',
      created_at: new Date('2025-11-25'),
      history_blob: [
        {
          prev_status: null,
          next_status: 'applied',
          updated_at: '2025-11-25T10:00:00.000Z',
          updated_by: null,
          note: null,
        },
      ],
    },
    {
      id: 'app-2',
      job_posting_id: 'job-1',
      status: 'shortlisted',
      created_at: new Date('2025-11-26'),
      history_blob: [
        {
          prev_status: null,
          next_status: 'applied',
          updated_at: '2025-11-26T10:00:00.000Z',
          updated_by: null,
          note: null,
        },
        {
          prev_status: 'applied',
          next_status: 'shortlisted',
          updated_at: '2025-11-27T14:00:00.000Z',
          updated_by: 'user-123',
          note: 'Good candidate',
        },
      ],
    },
    {
      id: 'app-3',
      job_posting_id: 'job-2',
      status: 'interview',
      created_at: new Date('2025-11-28'),
      history_blob: [
        {
          prev_status: null,
          next_status: 'applied',
          updated_at: '2025-11-28T10:00:00.000Z',
          updated_by: null,
          note: null,
        },
        {
          prev_status: 'applied',
          next_status: 'shortlisted',
          updated_at: '2025-11-29T10:00:00.000Z',
          updated_by: 'user-123',
          note: null,
        },
        {
          prev_status: 'shortlisted',
          next_status: 'interview',
          updated_at: '2025-11-30T10:00:00.000Z',
          updated_by: 'user-123',
          note: 'Scheduled interview',
        },
      ],
    },
  ];

  const mockInterviews = [
    {
      id: 'interview-1',
      job_posting_id: 'job-1',
      interview_date_ad: new Date('2025-11-28'),
      completed_at: new Date('2025-11-28T15:00:00.000Z'),
      result: 'pass',
      status: 'completed',
    },
    {
      id: 'interview-2',
      job_posting_id: 'job-1',
      interview_date_ad: new Date('2025-11-29'),
      completed_at: new Date('2025-11-29T15:00:00.000Z'),
      result: 'fail',
      status: 'completed',
    },
    {
      id: 'interview-3',
      job_posting_id: 'job-2',
      interview_date_ad: new Date('2025-12-01'),
      completed_at: new Date('2025-12-01T10:00:00.000Z'),
      result: 'pass',
      status: 'completed',
    },
    {
      id: 'interview-4',
      job_posting_id: 'job-2',
      interview_date_ad: new Date('2025-12-05'),
      completed_at: null,
      result: null,
      status: 'scheduled',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyDashboardService,
        {
          provide: getRepositoryToken(PostingAgency),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobPosting),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobApplication),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InterviewDetail),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgencyDashboardService>(AgencyDashboardService);
    agencyRepo = module.get<Repository<PostingAgency>>(getRepositoryToken(PostingAgency));
    jobPostingRepo = module.get<Repository<JobPosting>>(getRepositoryToken(JobPosting));
    applicationRepo = module.get<Repository<JobApplication>>(getRepositoryToken(JobApplication));
    interviewRepo = module.get<Repository<InterviewDetail>>(getRepositoryToken(InterviewDetail));
  });

  describe('getDashboardAnalytics', () => {
    it('should throw NotFoundException if agency not found', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.getDashboardAnalytics('INVALID-LICENSE', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return analytics with new fields', async () => {
      // Mock agency
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      // Mock job postings query
      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([
          { jp_id: 'job-1', jp_country: 'UAE', jp_posting_title: 'Construction Worker - Dubai' },
          { jp_id: 'job-2', jp_country: 'UAE', jp_posting_title: 'Hotel Manager - Dubai' },
          { jp_id: 'job-3', jp_country: 'Qatar', jp_posting_title: 'Driver - Qatar' },
        ]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      // Mock applications query
      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockApplications),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      // Mock interviews query
      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInterviews),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {
        startDate: '2025-11-25T00:00:00.000Z',
        endDate: '2025-12-01T23:59:59.999Z',
      });

      // Test new job fields
      expect(result.jobs).toHaveProperty('openInTimeframe');
      expect(result.jobs).toHaveProperty('createdInTimeframe');
      expect(result.jobs).toHaveProperty('draftInTimeframe');

      // Test new application fields
      expect(result.applications).toHaveProperty('byStatusInTimeframe');

      // Test new interview fields
      expect(result.interviews).toHaveProperty('passRate');
      expect(result.interviews).toHaveProperty('todayStatus');
      expect(result.interviews.todayStatus).toHaveProperty('pass');
      expect(result.interviews.todayStatus).toHaveProperty('fail');
    });

    it('should calculate job metrics correctly', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {
        startDate: '2025-11-20T00:00:00.000Z',
        endDate: '2025-12-01T23:59:59.999Z',
      });

      // Total jobs (all time)
      expect(result.jobs.total).toBe(3);

      // Active jobs
      expect(result.jobs.active).toBe(2);

      // Inactive jobs
      expect(result.jobs.inactive).toBe(1);

      // Jobs created in timeframe (job-2 created on 2025-11-20)
      expect(result.jobs.createdInTimeframe).toBe(1);

      // Open jobs in timeframe (job-2 is active and created in range, job-1 is active but updated in range)
      // job-1: created 2025-11-01, updated 2025-11-15 (not in range 2025-11-20 to 2025-12-01)
      // job-2: created 2025-11-20, updated 2025-11-25 (in range)
      expect(result.jobs.openInTimeframe).toBe(1);
    });

    it('should parse history_blob for application status changes', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([
          { jp_id: 'job-1' },
          { jp_id: 'job-2' },
          { jp_id: 'job-3' },
        ]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockApplications),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {
        startDate: '2025-11-25T00:00:00.000Z',
        endDate: '2025-12-01T23:59:59.999Z',
      });

      // Check byStatusInTimeframe
      expect(result.applications.byStatusInTimeframe).toBeDefined();
      expect(result.applications.byStatusInTimeframe.applied).toBeGreaterThanOrEqual(2);
      expect(result.applications.byStatusInTimeframe.shortlisted).toBeGreaterThanOrEqual(1);
    });

    it('should calculate pass rate correctly', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([
          { jp_id: 'job-1' },
          { jp_id: 'job-2' },
        ]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInterviews),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {});

      // 3 completed interviews: 2 pass, 1 fail
      expect(result.interviews.completed).toBe(3);
      expect(result.interviews.passed).toBe(2);
      expect(result.interviews.failed).toBe(1);

      // Pass rate should be (2/3) * 100 = 66.7%
      expect(result.interviews.passRate).toBeCloseTo(66.7, 1);
    });

    it('should calculate today\'s interview status', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayInterviews = [
        {
          id: 'interview-today-1',
          job_posting_id: 'job-1',
          interview_date_ad: today,
          completed_at: new Date(),
          result: 'pass',
          status: 'completed',
        },
        {
          id: 'interview-today-2',
          job_posting_id: 'job-1',
          interview_date_ad: today,
          completed_at: new Date(),
          result: 'pass',
          status: 'completed',
        },
        {
          id: 'interview-today-3',
          job_posting_id: 'job-2',
          interview_date_ad: today,
          completed_at: new Date(),
          result: 'fail',
          status: 'completed',
        },
      ];

      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([
          { jp_id: 'job-1' },
          { jp_id: 'job-2' },
        ]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(todayInterviews),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {});

      // Today's status should show 2 pass, 1 fail
      expect(result.interviews.todayStatus.pass).toBe(2);
      expect(result.interviews.todayStatus.fail).toBe(1);
    });

    it('should maintain backward compatibility', async () => {
      jest.spyOn(agencyRepo, 'findOne').mockResolvedValue(mockAgency as any);

      const jobQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJobPostings),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(jobPostingRepo, 'createQueryBuilder').mockReturnValue(jobQueryBuilder as any);

      const appQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockApplications),
      };
      jest.spyOn(applicationRepo, 'createQueryBuilder').mockReturnValue(appQueryBuilder as any);

      const interviewQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInterviews),
      };
      jest.spyOn(interviewRepo, 'createQueryBuilder').mockReturnValue(interviewQueryBuilder as any);

      const result = await service.getDashboardAnalytics('LIC-AG-0001', {});

      // Check all old fields still exist
      expect(result.jobs).toHaveProperty('total');
      expect(result.jobs).toHaveProperty('active');
      expect(result.jobs).toHaveProperty('inactive');
      expect(result.jobs).toHaveProperty('drafts');
      expect(result.jobs).toHaveProperty('recentInRange');

      expect(result.applications).toHaveProperty('total');
      expect(result.applications).toHaveProperty('byStatus');
      expect(result.applications).toHaveProperty('uniqueJobs');
      expect(result.applications).toHaveProperty('recentInRange');

      expect(result.interviews).toHaveProperty('total');
      expect(result.interviews).toHaveProperty('pending');
      expect(result.interviews).toHaveProperty('completed');
      expect(result.interviews).toHaveProperty('passed');
      expect(result.interviews).toHaveProperty('failed');
      expect(result.interviews).toHaveProperty('recentInRange');

      expect(result).toHaveProperty('availableCountries');
      expect(result).toHaveProperty('availableJobs');
      expect(result).toHaveProperty('generatedAt');
    });
  });
});
