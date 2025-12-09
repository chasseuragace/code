import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowService, WorkflowStage } from '../src/modules/workflow/workflow.service';
import { JobApplication } from '../src/modules/application/job-application.entity';
import { JobPosting, JobPosition, JobContract, InterviewDetail } from '../src/modules/domain/domain.entity';
import { Candidate } from '../src/modules/candidate/candidate.entity';
import { CandidateDocument } from '../src/modules/candidate/candidate-document.entity';
import { Notification } from '../src/modules/notification/notification.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let applicationRepo: Repository<JobApplication>;
  let jobPostingRepo: Repository<JobPosting>;
  let positionRepo: Repository<JobPosition>;
  let contractRepo: Repository<JobContract>;
  let candidateRepo: Repository<Candidate>;
  let interviewRepo: Repository<InterviewDetail>;
  let documentRepo: Repository<CandidateDocument>;
  let notificationRepo: Repository<Notification>;

  const mockAgencyId = 'agency-123';
  const mockCandidateId = 'candidate-123';
  const mockApplicationId = 'application-123';
  const mockJobPostingId = 'job-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: getRepositoryToken(JobApplication),
          useValue: {
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
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
          provide: getRepositoryToken(JobPosition),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobContract),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Candidate),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InterviewDetail),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CandidateDocument),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    applicationRepo = module.get<Repository<JobApplication>>(
      getRepositoryToken(JobApplication),
    );
    jobPostingRepo = module.get<Repository<JobPosting>>(
      getRepositoryToken(JobPosting),
    );
    positionRepo = module.get<Repository<JobPosition>>(
      getRepositoryToken(JobPosition),
    );
    contractRepo = module.get<Repository<JobContract>>(
      getRepositoryToken(JobContract),
    );
    candidateRepo = module.get<Repository<Candidate>>(
      getRepositoryToken(Candidate),
    );
    interviewRepo = module.get<Repository<InterviewDetail>>(
      getRepositoryToken(InterviewDetail),
    );
    documentRepo = module.get<Repository<CandidateDocument>>(
      getRepositoryToken(CandidateDocument),
    );
    notificationRepo = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWorkflowCandidates', () => {
    it('should return workflow candidates with pagination and analytics', async () => {
      const mockApplications = [
        {
          id: mockApplicationId,
          candidate_id: mockCandidateId,
          job_posting_id: mockJobPostingId,
          position_id: 'position-123',
          status: WorkflowStage.SHORTLISTED,
          created_at: new Date(),
          updated_at: new Date(),
          history_blob: [],
          candidate: {
            id: mockCandidateId,
            full_name: 'John Doe',
            phone: '+977-9841234567',
            email: 'john@example.com',
            passport_number: 'PA1234567',
            gender: 'male',
            age: 28,
            profile_image: null,
          },
          jobPosting: {
            id: mockJobPostingId,
            posting_title: 'Security Guard - Dubai',
            country: 'UAE',
            city: 'Dubai',
          },
          position: {
            id: 'position-123',
            title: 'Security Guard',
            monthly_salary_amount: 1500,
            salary_currency: 'AED',
          },
          interviews: [],
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(mockApplications),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { stage: WorkflowStage.SHORTLISTED, count: '1' },
        ]),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const mockDocQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(documentRepo, 'createQueryBuilder')
        .mockReturnValue(mockDocQueryBuilder as any);

      const result = await service.getWorkflowCandidates(mockAgencyId, {
        page: 1,
        limit: 15,
      });

      expect(result).toBeDefined();
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0].full_name).toBe('John Doe');
      expect(result.pagination.current_page).toBe(1);
      expect(result.pagination.total_items).toBe(1);
      expect(result.analytics).toBeDefined();
      expect(result.analytics.total_candidates).toBeGreaterThanOrEqual(0);
    });

    it('should filter by stage', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const mockDocQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(documentRepo, 'createQueryBuilder')
        .mockReturnValue(mockDocQueryBuilder as any);

      await service.getWorkflowCandidates(mockAgencyId, {
        stage: WorkflowStage.SHORTLISTED as any,
        page: 1,
        limit: 15,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'app.status = :stage',
        { stage: WorkflowStage.SHORTLISTED },
      );
    });

    it('should apply search filter', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const mockDocQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(documentRepo, 'createQueryBuilder')
        .mockReturnValue(mockDocQueryBuilder as any);

      await service.getWorkflowCandidates(mockAgencyId, {
        search: 'John',
        page: 1,
        limit: 15,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('updateCandidateStage', () => {
    it('should successfully update stage from applied to shortlisted', async () => {
      const mockApplication = {
        id: mockApplicationId,
        candidate_id: mockCandidateId,
        job_posting_id: mockJobPostingId,
        status: WorkflowStage.APPLIED,
        history_blob: [],
        created_at: new Date(),
        updated_at: new Date(),
        jobPosting: {
          id: mockJobPostingId,
          posting_title: 'Test Job',
        },
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockApplication),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest
        .spyOn(applicationRepo, 'save')
        .mockResolvedValue({ ...mockApplication, status: WorkflowStage.SHORTLISTED } as any);

      jest.spyOn(notificationRepo, 'create').mockReturnValue({} as any);
      jest.spyOn(notificationRepo, 'save').mockResolvedValue({} as any);

      const result = await service.updateCandidateStage(mockAgencyId, mockCandidateId, {
        application_id: mockApplicationId,
        new_stage: WorkflowStage.SHORTLISTED as any,
      });

      expect(result.success).toBe(true);
      expect(result.data.new_stage).toBe(WorkflowStage.SHORTLISTED);
      expect(result.data.previous_stage).toBe(WorkflowStage.APPLIED);
    });

    it('should throw NotFoundException if application not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(
        service.updateCandidateStage(mockAgencyId, mockCandidateId, {
          application_id: mockApplicationId,
          new_stage: WorkflowStage.SHORTLISTED as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid stage transition', async () => {
      const mockApplication = {
        id: mockApplicationId,
        candidate_id: mockCandidateId,
        job_posting_id: mockJobPostingId,
        status: WorkflowStage.APPLIED,
        history_blob: [],
        created_at: new Date(),
        updated_at: new Date(),
        jobPosting: {
          id: mockJobPostingId,
          posting_title: 'Test Job',
        },
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockApplication),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Try to skip from applied directly to interview-passed
      await expect(
        service.updateCandidateStage(mockAgencyId, mockCandidateId, {
          application_id: mockApplicationId,
          new_stage: WorkflowStage.INTERVIEW_PASSED as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create interview when moving to interview-scheduled', async () => {
      const mockApplication = {
        id: mockApplicationId,
        candidate_id: mockCandidateId,
        job_posting_id: mockJobPostingId,
        status: WorkflowStage.SHORTLISTED,
        history_blob: [],
        created_at: new Date(),
        updated_at: new Date(),
        jobPosting: {
          id: mockJobPostingId,
          posting_title: 'Test Job',
        },
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockApplication),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest
        .spyOn(applicationRepo, 'save')
        .mockResolvedValue({ ...mockApplication, status: WorkflowStage.INTERVIEW_SCHEDULED } as any);

      const mockInterview = {
        id: 'interview-123',
        job_posting_id: mockJobPostingId,
        job_application_id: mockApplicationId,
      };

      jest.spyOn(interviewRepo, 'create').mockReturnValue(mockInterview as any);
      jest.spyOn(interviewRepo, 'save').mockResolvedValue(mockInterview as any);
      jest.spyOn(notificationRepo, 'create').mockReturnValue({} as any);
      jest.spyOn(notificationRepo, 'save').mockResolvedValue({} as any);

      const result = await service.updateCandidateStage(mockAgencyId, mockCandidateId, {
        application_id: mockApplicationId,
        new_stage: WorkflowStage.INTERVIEW_SCHEDULED as any,
        interview_details: {
          interview_date_ad: '2024-12-15',
          interview_time: '10:00',
          location: 'Agency Office',
          duration_minutes: 60,
          type: 'In-person' as any,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.interview_id).toBe('interview-123');
      expect(interviewRepo.create).toHaveBeenCalled();
      expect(interviewRepo.save).toHaveBeenCalled();
    });

    it('should create notification on stage change', async () => {
      const mockApplication = {
        id: mockApplicationId,
        candidate_id: mockCandidateId,
        job_posting_id: mockJobPostingId,
        status: WorkflowStage.APPLIED,
        history_blob: [],
        created_at: new Date(),
        updated_at: new Date(),
        jobPosting: {
          id: mockJobPostingId,
          posting_title: 'Test Job',
        },
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockApplication),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest
        .spyOn(applicationRepo, 'save')
        .mockResolvedValue({ ...mockApplication, status: WorkflowStage.SHORTLISTED } as any);

      const createNotificationSpy = jest.spyOn(notificationRepo, 'create').mockReturnValue({} as any);
      const saveNotificationSpy = jest.spyOn(notificationRepo, 'save').mockResolvedValue({} as any);

      await service.updateCandidateStage(mockAgencyId, mockCandidateId, {
        application_id: mockApplicationId,
        new_stage: WorkflowStage.SHORTLISTED as any,
      });

      expect(createNotificationSpy).toHaveBeenCalled();
      expect(saveNotificationSpy).toHaveBeenCalled();
    });
  });

  describe('verifyAgencyAccess', () => {
    it('should return true if agency has access to candidate', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.verifyAgencyAccess(mockAgencyId, mockCandidateId);

      expect(result).toBe(true);
    });

    it('should return false if agency does not have access to candidate', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      jest
        .spyOn(applicationRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.verifyAgencyAccess(mockAgencyId, mockCandidateId);

      expect(result).toBe(false);
    });
  });
});
