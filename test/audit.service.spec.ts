import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { AuditService, AuditContext, AuditActivity, AuditOutcome } from '../src/modules/audit/audit.service';
import { AuditLog, AuditCategories, AuditActions } from '../src/modules/audit/audit.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  describe('log', () => {
    it('should create an audit log entry for job application', async () => {
      const context: AuditContext = {
        method: 'POST',
        path: '/applications',
        correlationId: 'corr-123',
        originIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        userId: 'user-uuid',
        userRole: 'candidate',
        clientId: 'web-app',
      };

      const activity: AuditActivity = {
        action: AuditActions.APPLY_JOB,
        category: AuditCategories.APPLICATION,
        resourceType: 'job_application',
        resourceId: 'app-uuid',
        metadata: { job_posting_id: 'job-uuid' },
      };

      const outcome: AuditOutcome = {
        outcome: 'success',
        statusCode: 201,
        durationMs: 45,
      };

      const expectedEntry = {
        method: 'POST',
        path: '/applications',
        correlation_id: 'corr-123',
        origin_ip: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        user_id: 'user-uuid',
        user_role: 'candidate',
        client_id: 'web-app',
        action: 'apply_job',
        category: 'application',
        resource_type: 'job_application',
        resource_id: 'app-uuid',
        outcome: 'success',
        status_code: 201,
        duration_ms: 45,
      };

      mockRepository.create.mockReturnValue(expectedEntry);
      mockRepository.save.mockResolvedValue({ id: 'audit-uuid', ...expectedEntry });

      const result = await service.log(context, activity, outcome);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.action).toBe('apply_job');
      expect(result.category).toBe('application');
    });

    it('should log failed authentication attempt', async () => {
      const context: AuditContext = {
        method: 'POST',
        path: '/verify',
        clientId: 'anonymous',
      };

      const activity: AuditActivity = {
        action: AuditActions.LOGIN_VERIFY,
        category: AuditCategories.AUTH,
      };

      const outcome: AuditOutcome = {
        outcome: 'failure',
        statusCode: 400,
        errorMessage: 'Invalid OTP',
      };

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({ id: 'audit-uuid' });

      await service.log(context, activity, outcome);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login_verify',
          category: 'auth',
          outcome: 'failure',
          error_message: 'Invalid OTP',
        })
      );
    });

    it('should log agency workflow action with state change', async () => {
      const context: AuditContext = {
        method: 'POST',
        path: '/applications/app-123/shortlist',
        userId: 'agency-user-uuid',
        userRole: 'agency_user',
        agencyId: 'agency-uuid',
      };

      const activity: AuditActivity = {
        action: AuditActions.SHORTLIST_CANDIDATE,
        category: AuditCategories.APPLICATION,
        resourceType: 'job_application',
        resourceId: 'app-123',
        stateChange: { status: ['applied', 'shortlisted'] },
      };

      const outcome: AuditOutcome = {
        outcome: 'success',
        statusCode: 200,
      };

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({ id: 'audit-uuid' });

      await service.log(context, activity, outcome);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'shortlist_candidate',
          agency_id: 'agency-uuid',
          state_change: { status: ['applied', 'shortlisted'] },
        })
      );
    });
  });

  describe('query', () => {
    it('should query logs with filters', async () => {
      const mockLogs = [
        { id: '1', action: 'apply_job', category: 'application' },
        { id: '2', action: 'shortlist_candidate', category: 'application' },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockLogs, 2]);

      const result = await service.query({
        category: 'application',
        page: 1,
        limit: 50,
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should scope query by agency', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.query({
        agencyId: 'agency-uuid',
        category: 'application',
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agency_id: 'agency-uuid',
            category: 'application',
          }),
        })
      );
    });
  });

  describe('getResourceHistory', () => {
    it('should return audit history for a specific resource', async () => {
      const mockHistory = [
        { id: '1', action: 'apply_job', resource_id: 'app-123' },
        { id: '2', action: 'shortlist_candidate', resource_id: 'app-123' },
        { id: '3', action: 'schedule_interview', resource_id: 'app-123' },
      ];

      mockRepository.find.mockResolvedValue(mockHistory);

      const result = await service.getResourceHistory('job_application', 'app-123');

      expect(result).toHaveLength(3);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { resource_type: 'job_application', resource_id: 'app-123' },
        })
      );
    });
  });

  describe('getUserActivity', () => {
    it('should return activity for a specific user', async () => {
      const mockActivity = [
        { id: '1', user_id: 'user-123', action: 'apply_job' },
        { id: '2', user_id: 'user-123', action: 'withdraw_application' },
      ];

      mockRepository.find.mockResolvedValue(mockActivity);

      const result = await service.getUserActivity('user-123');

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-123' },
        })
      );
    });
  });
});

describe('AuditLog Entity', () => {
  it('should have correct category constants', () => {
    expect(AuditCategories.AUTH).toBe('auth');
    expect(AuditCategories.APPLICATION).toBe('application');
    expect(AuditCategories.JOB_POSTING).toBe('job_posting');
    expect(AuditCategories.AGENCY).toBe('agency');
    expect(AuditCategories.CANDIDATE).toBe('candidate');
    expect(AuditCategories.INTERVIEW).toBe('interview');
  });

  it('should have correct action constants', () => {
    expect(AuditActions.APPLY_JOB).toBe('apply_job');
    expect(AuditActions.SHORTLIST_CANDIDATE).toBe('shortlist_candidate');
    expect(AuditActions.SCHEDULE_INTERVIEW).toBe('schedule_interview');
    expect(AuditActions.WITHDRAW_APPLICATION).toBe('withdraw_application');
  });
});
