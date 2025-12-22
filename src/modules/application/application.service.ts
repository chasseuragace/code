import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, DataSource } from 'typeorm';
import { JobApplication, JobApplicationHistoryEntry, JobApplicationStatus } from './job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { JobApplicationListItemDto } from './dto/paginated-job-applications.dto';
import { ApplicationDetailsDto } from './dto/application-details.dto';
import { JobPosting, JobPosition } from '../domain/domain.entity';
import { InterviewService } from '../domain/domain.service';
import { InterviewHelperService } from '../domain/interview-helper.service';
import { NotificationService } from '../notification/notification.service';
import { UserRole } from '../user/user.entity';
import { ROLE_PERMISSIONS } from '../../config/rolePermissions';
import { CandidateService } from '../candidate/candidate.service';

export type ApplyOptions = { note?: string | null; updatedBy?: string | null };
export type ListOptions = { status?: JobApplicationStatus; page?: number; limit?: number };
export type UpdateOptions = { note?: string | null; updatedBy?: string | null };
export type CorrectionOptions = { reason: string; updatedBy?: string | null };
export type ScheduleInterviewInput = {
  interview_date_ad?: string;
  interview_date_bs?: string;
  interview_time?: string;
  duration_minutes?: number;
  location?: string;
  contact_person?: string;
  required_documents?: string[];
  notes?: string;
};
export type RescheduleInterviewInput = Partial<ScheduleInterviewInput>;

const TERMINAL_STATUSES: ReadonlySet<JobApplicationStatus> = new Set([
  'withdrawn',
  'interview_passed',
  'interview_failed',
]);

const ALLOWED_TRANSITIONS: Readonly<Record<JobApplicationStatus, JobApplicationStatus[]>> = {
  applied: ['shortlisted', 'interview_scheduled', 'withdrawn'],
  shortlisted: ['interview_scheduled', 'withdrawn'],
  interview_scheduled: ['interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
  interview_rescheduled: ['interview_scheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
  interview_passed: [],
  interview_failed: [],
  withdrawn: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Check if a role has permission for an action
 */
function checkPermission(role: UserRole | null | undefined, action: string): void {
  if (!role) {
    throw new ForbiddenException('User role is required');
  }
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions || !permissions.includes(action)) {
    throw new ForbiddenException(`Permission denied: ${role} cannot perform ${action}`);
  }
}

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobPosting) private readonly postingRepo: Repository<JobPosting>,
    private readonly interviewSvc: InterviewService,
    private readonly interviewHelperSvc: InterviewHelperService,
    private readonly notificationService: NotificationService,
    private readonly candidateService: CandidateService,
    private dataSource: DataSource,
  ) {}

  // Diagnostics
  async getById(id: string): Promise<JobApplication | null> {
    return this.appRepo.findOne({ where: { id } });
  }

  // Create a new application
  async apply(
    candidateId: string, 
    jobPostingId: string, 
    positionId: string,
    opts: ApplyOptions = {}
  ): Promise<JobApplication> {
    // Validate candidate exists and posting is active
    const [candidate, posting, position] = await Promise.all([
      this.candidateRepo.findOne({ where: { id: candidateId as any } as FindOptionsWhere<Candidate> }),
      this.postingRepo.findOne({ 
        where: { id: jobPostingId as any } as FindOptionsWhere<JobPosting>,
        relations: ['contracts', 'contracts.positions']
      }),
      this.dataSource.getRepository(JobPosition).findOne({ 
        where: { id: positionId as any } as FindOptionsWhere<JobPosition>,
        relations: ['job_contract']
      })
    ]);

    if (!candidate) throw new Error('Candidate not found');
    if (!posting) throw new Error('Job posting not found');
    if (!position) throw new Error('Position not found');
    if (!posting.is_active) throw new Error('Job posting is not active');

    // Verify position belongs to the job posting
    const positionBelongsToPosting = posting.contracts.some(contract => 
      contract.positions.some(pos => pos.id === positionId)
    );
    if (!positionBelongsToPosting) {
      throw new Error('Position does not belong to the specified job posting');
    }

    // Enforce uniqueness: prevent duplicate applications unless the previous one was withdrawn
    // Find the LATEST application for this candidate/job/position combination
    const existing = await this.appRepo.findOne({ 
      where: { 
        candidate_id: candidateId, 
        job_posting_id: jobPostingId,
        position_id: positionId
      },
      order: { created_at: 'DESC' }
    });
    if (existing && existing.status !== 'withdrawn') {
      throw new Error('Candidate has already applied to this position');
    }

    const status: JobApplicationStatus = 'applied';
    const history: JobApplicationHistoryEntry[] = [
      {
        prev_status: null,
        next_status: status,
        updated_at: nowIso(),
        updated_by: opts.updatedBy ?? null,
        note: opts.note ?? null,
      },
    ];

    const entity = this.appRepo.create({
      candidate_id: candidateId,
      job_posting_id: jobPostingId,
      position_id: positionId,
      status,
      history_blob: history,
      withdrawn_at: null,
    });

    return this.appRepo.save(entity);
  }

  // List candidate applications with optional status filter
  async listApplied(
    candidateId: string,
    options: ListOptions = {}
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = options;
    const where: FindOptionsWhere<JobApplication> = { candidate_id: candidateId };

    if (status) {
      where.status = status as any;
    }

    const [items, total] = await this.appRepo.findAndCount({
      where,
      relations: [
        'job_posting',
        'job_posting.contracts',
        'job_posting.contracts.agency',
        'job_posting.contracts.employer',  // Added employer relationship
        'job_posting.contracts.positions',
        'interview_details',
        'interview_details.expenses',
      ],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map to DTOs with the required structure
    const result = items.map((app) => {
      // Get the first contract (assuming there's at least one)
      const contract = app.job_posting?.contracts?.[0];
      const agency = contract?.agency;
      const interview = app.interview_details?.[0];

      // Find the position for this application
      const position = contract?.positions?.find(p => p.id === app.position_id);

      // Map position details if found
      let positionDto: any = null;
      if (position) {
        positionDto = {
          id: position.id,
          title: position.title,
          vacancies: position.total_vacancies,
          salary_range: `${position.monthly_salary_amount} ${position.salary_currency}`,
          experience_required: position.position_notes?.match(/experience:?\s*([^\n]+)/i)?.[1]?.trim() || 'Not specified',
          skills_required: position.position_notes?.match(/skills?:?\s*([^\n]+)/i)?.[1]?.split(',').map(s => s.trim()) || []
        };
      }

      // Find the interview details if status is interview_scheduled or interview_rescheduled
      let interviewDetails: any = null;
      if (['interview_scheduled', 'interview_rescheduled'].includes(app.status) && app.interview_details?.[0]) {
        const interview = app.interview_details[0];
        interviewDetails = {
          id: interview.id,
          interview_date_ad: interview.interview_date_ad,
          interview_date_bs: interview.interview_date_bs,
          interview_time: interview.interview_time,
          location: interview.location,
          contact_person: interview.contact_person,
          required_documents: interview.required_documents,
          notes: interview.notes,
          expenses: interview.expenses?.map(expense => ({
            id: expense.id,
            expense_type: expense.expense_type,
            who_pays: expense.who_pays,
            is_free: expense.is_free,
            amount: expense.amount,
            currency: expense.currency,
            refundable: expense.refundable,
            notes: expense.notes
          })) || []
        };
      }

      // Get job posting details from the first contract
      let jobPosting: any = null;
      if (app.job_posting) {
        const contract = app.job_posting.contracts?.[0];
        jobPosting = {
          title: app.job_posting.posting_title,
          employer: contract?.employer ? {
            company_name: contract.employer.company_name,
            country: contract.employer.country || app.job_posting.country,
            city: contract.employer.city || app.job_posting.city
          } : {
            company_name: 'Unknown',
            country: app.job_posting.country,
            city: app.job_posting.city
          },
          country: app.job_posting.country,
          city: app.job_posting.city
        };
      }

      // Build the response object with all existing fields
      const response: any = {
        id: app.id,
        candidate_id: app.candidate_id,
        job_posting_id: app.job_posting_id,
        status: app.status,
        agency_name: agency?.name || null,
        interview: interviewDetails,
        history_blob: app.history_blob, // Include application history with notes
        created_at: app.created_at,
        updated_at: app.updated_at
      };

      // Add position details if available
      if (positionDto) {
        response.position = positionDto;
      }

      // Add job posting details if available
      if (jobPosting) {
        response.job_posting = jobPosting;
      }

      return response;
    });

    return { items: result, total, page, limit };
  }

  // Withdraw application by candidate + posting
  async withdraw(candidateId: string, jobPostingId: string, opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    // Role validation
    checkPermission(userRole, 'withdraw');
    
    // Find the LATEST application for this candidate/job combination
    const app = await this.appRepo.findOne({ 
      where: { candidate_id: candidateId, job_posting_id: jobPostingId },
      order: { created_at: 'DESC' }
    });
    if (!app) throw new Error('Application not found');
    if (app.status === 'withdrawn') return app; // idempotent
    // Allow withdrawing from any non-withdrawn status (including terminal statuses like interview_passed)

    // If there's an active interview, cancel it
    const interview = await this.interviewHelperSvc.findLatestInterviewForApplication(app.id);
    if (interview && interview.status === 'scheduled') {
      await this.interviewHelperSvc.cancelInterview(interview.id, {
        rejection_reason: opts.note || 'Application withdrawn',
        notes: opts.note || undefined,
      });
    }

    const prev = app.status;
    app.status = 'withdrawn';
    app.withdrawn_at = new Date();

    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: app.status,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: opts.note ?? null,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];

    return this.appRepo.save(app);
  }

  // Strict workflow status update
  async updateStatus(applicationId: string, nextStatus: JobApplicationStatus, opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    // Role validation
    if (nextStatus === 'shortlisted') {
      checkPermission(userRole, 'shortlist');
    } else if (nextStatus === 'interview_scheduled') {
      checkPermission(userRole, 'schedule_interview');
    } else if (nextStatus === 'interview_rescheduled') {
      checkPermission(userRole, 'reschedule_interview');
    } else if (nextStatus === 'interview_passed' || nextStatus === 'interview_failed') {
      checkPermission(userRole, 'complete_interview');
    } else if (nextStatus === 'withdrawn') {
      checkPermission(userRole, 'withdraw');
    }

    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');

    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot update a terminal application');

    const allowed = ALLOWED_TRANSITIONS[app.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid status transition from ${app.status} to ${nextStatus}`);
    }

    const prev = app.status;
    app.status = nextStatus;
    if (nextStatus === 'withdrawn') app.withdrawn_at = new Date();

    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: nextStatus,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: opts.note ?? null,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];

    const savedApp = await this.appRepo.save(app);

    // Trigger notification for shortlisted status
    if (nextStatus === 'shortlisted') {
      try {
        await this.notificationService.createNotificationFromApplication(savedApp, 'shortlisted');
      } catch (error) {
        console.error('Failed to create notification for shortlisted status:', error);
        // Don't fail the main operation if notification fails
      }
    }

    return savedApp;
  }

  // Override transitions for corrections while auditing
  async makeCorrection(applicationId: string, correctedStatus: JobApplicationStatus, opts: CorrectionOptions): Promise<JobApplication> {
    if (!opts?.reason || opts.reason.trim().length === 0) {
      throw new Error('Correction requires a reason');
    }
    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');

    const prev = app.status;
    app.status = correctedStatus;
    app.withdrawn_at = correctedStatus === 'withdrawn' ? new Date() : null;

    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: correctedStatus,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: `CORRECTION: ${opts.reason}`,
      corrected: true,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];

    return this.appRepo.save(app);
  }

  // Schedule an interview for an application and link it
  async scheduleInterview(applicationId: string, input: ScheduleInterviewInput, opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    checkPermission(userRole, 'schedule_interview');

    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot schedule interview for terminal application');
    const allowedFrom = ['applied', 'shortlisted', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid schedule from status ${app.status}`);

    // Persist interview and capture its id
    const createdInterview = await this.interviewSvc.createInterview(app.job_posting_id, { ...input, job_application_id: app.id });

    const prev = app.status;
    app.status = 'interview_scheduled';
    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: app.status,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: opts.note ?? null,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];
    const savedApp = await this.appRepo.save(app);

    // Trigger notification for interview scheduled
    try {
      await this.notificationService.createNotificationFromApplication(savedApp, 'interview_scheduled', createdInterview.id);
    } catch (error) {
      console.error('Failed to create notification for interview scheduled:', error);
      // Don't fail the main operation if notification fails
    }

    // Attach interview (non-persistent) to ease API responses
    (savedApp as any).interview = { id: createdInterview.id };
    return savedApp;
  }

  // Reschedule an interview; updates interview details and application status
  async rescheduleInterview(applicationId: string, interviewId: string, updates: RescheduleInterviewInput, opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    checkPermission(userRole, 'reschedule_interview');

    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot reschedule interview for terminal application');
    const allowedFrom = ['interview_scheduled', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid reschedule from status ${app.status}`);

    // Use interview helper to reschedule (sets rescheduled_at timestamp)
    await this.interviewHelperSvc.rescheduleInterview(interviewId, {
      ...updates,
      notes: opts.note || undefined,
    });

    const prev = app.status;
    app.status = 'interview_rescheduled';
    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: app.status,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: opts.note ?? null,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];
    const savedApp = await this.appRepo.save(app);

    // Trigger notification for interview rescheduled
    try {
      await this.notificationService.createNotificationFromApplication(savedApp, 'interview_rescheduled', interviewId);
    } catch (error) {
      console.error('Failed to create notification for interview rescheduled:', error);
      // Don't fail the main operation if notification fails
    }

    return savedApp;
  }

  // Complete an interview with result pass/fail
  async completeInterview(applicationId: string, result: 'passed'|'failed', opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    checkPermission(userRole, 'complete_interview');

    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot complete interview for terminal application');
    const allowedFrom = ['interview_scheduled', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid complete from status ${app.status}`);

    // Update interview entity with result and completion timestamp
    const interview = await this.interviewHelperSvc.findLatestInterviewForApplication(applicationId);
    if (interview) {
      await this.interviewHelperSvc.completeInterview(interview.id, {
        result: result === 'passed' ? 'pass' : 'fail',
        notes: opts.note || undefined,
      });
    }

    const nextStatus: JobApplicationStatus = result === 'passed' ? 'interview_passed' : 'interview_failed';
    const prev = app.status;
    app.status = nextStatus;
    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: nextStatus,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: opts.note ?? null,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];
    const savedApp = await this.appRepo.save(app);

    // Trigger notification for interview result
    try {
      await this.notificationService.createNotificationFromApplication(savedApp, nextStatus);
    } catch (error) {
      console.error(`Failed to create notification for interview ${result}:`, error);
      // Don't fail the main operation if notification fails
    }

    return savedApp;
  }

  /**
   * Check which positions a candidate has applied to (excluding withdrawn applications)
   * @param candidateId - The candidate's UUID
   * @param positionIds - Array of position UUIDs to check
   * @returns Set of position IDs that have active applications
   */
  async getAppliedPositionIds(
    candidateId: string, 
    positionIds: string[]
  ): Promise<Set<string>> {
    if (positionIds.length === 0) return new Set();
    
    // Use DataSource query for UUID handling
    const applications = await this.dataSource.query(
      `SELECT position_id, status FROM job_applications 
       WHERE candidate_id = $1::uuid AND position_id = ANY($2::uuid[])`,
      [candidateId, positionIds]
    );
    
    // Filter out withdrawn applications and convert to string
    return new Set(
      applications
        .filter((app: any) => app.status !== 'withdrawn')
        .map((app: any) => String(app.position_id))
    );
  }

  // Get comprehensive application details for frontend
  async getApplicationDetails(applicationId: string): Promise<ApplicationDetailsDto | null> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: [
        'job_posting',
        'job_posting.contracts',
        'job_posting.contracts.agency',
        'job_posting.contracts.employer',
        'job_posting.contracts.positions',
        'interview_details',
        'interview_details.expenses',
      ],
    });

    if (!app) {
      return null;
    }

    return this.buildApplicationDetailsDto(app);
  }

  // Get the latest application details for a candidate
  async getLatestApplicationDetailsForCandidate(candidateId: string): Promise<ApplicationDetailsDto | null> {
    const app = await this.appRepo.findOne({
      where: { candidate_id: candidateId },
      relations: [
        'job_posting',
        'job_posting.contracts',
        'job_posting.contracts.agency',
        'job_posting.contracts.employer',
        'job_posting.contracts.positions',
        'interview_details',
        'interview_details.expenses',
      ],
      order: { created_at: 'DESC' },
    });

    if (!app) {
      return null;
    }

    return this.buildApplicationDetailsDto(app);
  }

  // Helper method to build ApplicationDetailsDto from JobApplication entity
  private buildApplicationDetailsDto(app: JobApplication): ApplicationDetailsDto {
    // Helper functions for data formatting
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    };

    const getProgressFromStatus = (status: JobApplicationStatus): number => {
      const progressMap: Record<JobApplicationStatus, number> = {
        'applied': 1,
        'shortlisted': 2,
        'interview_scheduled': 3,
        'interview_rescheduled': 3,
        'interview_passed': 5,
        'interview_failed': 4,
        'withdrawn': 0,
      };
      return progressMap[status] || 0;
    };

    const formatStatus = (status: JobApplicationStatus): string => {
      const statusMap: Record<JobApplicationStatus, string> = {
        'applied': 'Applied',
        'shortlisted': 'Shortlisted',
        'interview_scheduled': 'Interview Scheduled',
        'interview_rescheduled': 'Interview Rescheduled',
        'interview_passed': 'Interview Passed',
        'interview_failed': 'Interview Failed',
        'withdrawn': 'Withdrawn',
      };
      return statusMap[status] || status;
    };

    // Get contract and related data
    const contract = app.job_posting?.contracts?.[0];
    const agency = contract?.agency;
    const employer = contract?.employer;
    const position = contract?.positions?.find(p => p.id === app.position_id);
    const interview = app.interview_details?.[0];

    // Build the response
    const result: ApplicationDetailsDto = {
      id: app.id,
      appliedOn: formatDate(app.created_at),
      lastUpdated: formatDate(app.updated_at),
      status: formatStatus(app.status),
      remarks: 'Documents verified, waiting for interview confirmation', // TODO: Add remarks field to entity
      progress: getProgressFromStatus(app.status),
      job: {
        title: position?.title || app.job_posting?.posting_title || 'Unknown Position',
        company: employer?.company_name || 'Unknown Company',
        location: `${app.job_posting?.city || 'Unknown'}, ${app.job_posting?.country || 'Unknown'}`,
        category: 'General', // TODO: Add category field to job posting
        salary: position ? `${position.monthly_salary_amount} ${position.salary_currency}` : 'Not specified',
        contract: '2 Years Contract', // TODO: Add contract duration field
        accommodation: 'Provided by Employer', // TODO: Add accommodation field
        workingHours: '8 hrs/day, 6 days/week', // TODO: Add working hours field
        description: position?.position_notes || 'No description available', // TODO: Add proper job description
      },
      employer: {
        name: employer?.company_name || 'Unknown Company',
        country: employer?.country || app.job_posting?.country || 'Unknown',
        agency: agency?.name || 'Unknown Agency',
        license: 'Govt. License No. 1234/067/68', // TODO: Add license field to agency
        agencyPhone: '+977 9812345678', // TODO: Add phone field to agency
        agencyEmail: 'info@agency.com', // TODO: Add email field to agency
        agencyAddress: 'Address not available', // TODO: Add address field to agency
      },
    };

    // Add interview details if available
    if (interview && ['interview_scheduled', 'interview_rescheduled'].includes(app.status)) {
      // Format interview date - handle both Date objects and strings
      let interviewDate = 'TBD';
      if (interview.interview_date_ad) {
        try {
          const dateObj = interview.interview_date_ad instanceof Date 
            ? interview.interview_date_ad 
            : new Date(interview.interview_date_ad);
          interviewDate = formatDate(dateObj);
        } catch (e) {
          interviewDate = 'TBD';
        }
      }

      // Format interview time - handle both time objects and strings
      let interviewTime = '10:00 AM';
      if (interview.interview_time) {
        try {
          if (typeof interview.interview_time === 'string') {
            // Parse HH:mm format to 12-hour format
            const [hours, minutes] = interview.interview_time.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            interviewTime = `${displayHour}:${minutes} ${ampm}`;
          }
        } catch (e) {
          interviewTime = '10:00 AM';
        }
      }

      result.interview = {
        date: interviewDate,
        time: interviewTime,
        mode: interview.type || 'In-person',
        location: interview.location || 'TBD',
        documents: interview.required_documents || [],
        contactPerson: interview.contact_person || 'Not assigned',
        contactRole: 'HR Officer', // TODO: Add contact role field to interview
        contactPhone: agency?.contact_phone || 'Not provided',
        contactEmail: agency?.contact_email || 'Not provided',
        notes: interview.notes || null,
      };
    }

    return result;
  }

  // Reject an application with reason
  async rejectApplication(applicationId: string, reason: string, opts: UpdateOptions = {}, userRole?: UserRole): Promise<JobApplication> {
    checkPermission(userRole, 'reject');

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot reject a terminal application');

    // Cancel any active interview
    const interview = await this.interviewHelperSvc.findLatestInterviewForApplication(app.id);
    if (interview && interview.status === 'scheduled') {
      await this.interviewHelperSvc.cancelInterview(interview.id, {
        rejection_reason: reason,
        notes: reason,
      });
    }

    const prev = app.status;
    app.status = 'withdrawn'; // Set status to withdrawn when rejecting
    
    const entry: JobApplicationHistoryEntry = {
      prev_status: prev,
      next_status: app.status,
      updated_at: nowIso(),
      updated_by: opts.updatedBy ?? null,
      note: `REJECTED: ${reason}`,
    };
    app.history_blob = [...(app.history_blob ?? []), entry];

    const savedApp = await this.appRepo.save(app);

    // Trigger notification for rejection
    try {
      await this.notificationService.createNotificationFromApplication(savedApp, 'withdrawn');
    } catch (error) {
      console.error('Failed to create notification for rejection:', error);
    }

    return savedApp;
  }

  // Bulk reject all "applied" applications for a job posting
  async bulkRejectApplicationsForJobPosting(
    jobPostingId: string, 
    reason: string, 
    opts: UpdateOptions = {},
    userRole?: UserRole
  ): Promise<{ rejected: number; applicationIds: string[] }> {
    checkPermission(userRole, 'bulk_reject');

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    // Find all applications with status "applied" for this job posting
    const applications = await this.appRepo.find({
      where: {
        job_posting_id: jobPostingId,
        status: 'applied'
      }
    });

    const rejectedIds: string[] = [];

    // Reject each application
    for (const app of applications) {
      try {
        await this.rejectApplication(app.id, reason, opts, userRole);
        rejectedIds.push(app.id);
      } catch (error) {
        console.error(`Failed to reject application ${app.id}:`, error);
        // Continue with other applications even if one fails
      }
    }

    return {
      rejected: rejectedIds.length,
      applicationIds: rejectedIds
    };
  }

  // Count total applications for a job posting
  async countApplicationsByJobPosting(jobPostingId: string): Promise<number> {
    return this.appRepo.count({ where: { job_posting_id: jobPostingId } });
  }

  // Analytics for a candidate's applications
  async getAnalytics(candidateId: string): Promise<{
    total: number;
    active: number;
    by_status: Record<JobApplicationStatus, number>;
  }> {
    const allStatuses: JobApplicationStatus[] = [
      'applied',
      'shortlisted',
      'interview_scheduled',
      'interview_rescheduled',
      'interview_passed',
      'interview_failed',
      'withdrawn',
    ];

    const total = await this.appRepo.count({ where: { candidate_id: candidateId } });

    // Active = non-terminal statuses (exclude passed/failed/withdrawn)
    const activeStatuses: JobApplicationStatus[] = [
      'applied',
      'shortlisted',
      'interview_scheduled',
      'interview_rescheduled',
    ];
    const active = await this.appRepo.count({ where: { candidate_id: candidateId, status: In(activeStatuses) } });

    const entries = await Promise.all(
      allStatuses.map(async (s) => {
        const count = await this.appRepo.count({ where: { candidate_id: candidateId, status: s } });
        return [s, count] as const;
      }),
    );
    const by_status = entries.reduce((acc, [s, n]) => {
      acc[s] = n;
      return acc;
    }, {} as Record<JobApplicationStatus, number>);

    return { total, active, by_status };
  }

  // Get application details with candidate data for S2 component
  async getApplicationDetailsWithCandidate(applicationId: string): Promise<any> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: [
        'job_posting',
        'job_posting.contracts',
        'job_posting.contracts.agency',
        'job_posting.contracts.employer',
        'job_posting.contracts.positions',
        'interview_details',
        'interview_details.expenses',
      ],
    });

    if (!app) {
      return null;
    }

    // Load candidate data
    const candidate = await this.candidateRepo.findOne({
      where: { id: app.candidate_id },
    });

    // Load candidate job profile (skills, education, experience, trainings)
    const jobProfile = await this.dataSource.getRepository('CandidateJobProfile').findOne({
      where: { candidate_id: app.candidate_id },
      order: { updated_at: 'DESC' },
    });

    // Get application details (job, employer, interview info)
    const details = this.buildApplicationDetailsDto(app);

    // Format skills from job profile
    const profileBlob = (jobProfile?.profile_blob as any) || {};
    const formattedSkills = (profileBlob.skills || []).map((skill: any) => ({
      title: skill.title || skill,
      years: skill.years || 0,
      duration_months: skill.duration_months || 0,
      formatted: skill.title ? `${skill.title}${skill.years ? ` (${skill.years}y)` : ''}` : skill
    }));

    // Get documents and slots for the candidate
    const documentsWithSlots = await this.candidateService.getDocumentsWithSlots(app.candidate_id);

    // Return combined response with candidate + application data for S2 component
    return {
      candidate: {
        id: candidate?.id,
        name: candidate?.full_name || 'Candidate Name',
        phone: candidate?.phone || '',
        email: candidate?.email || '',
        address: candidate?.address || null,
        passport_number: candidate?.passport_number || null,
        profile_image: candidate?.profile_image || null,
      },
      application: {
        id: app.id,
        stage: app.status,
        created_at: app.created_at,
        updated_at: app.updated_at,
        history_blob: app.history_blob || [],
      },
      job_profile: {
        skills: formattedSkills,
        education: profileBlob.education || [],
        experience: profileBlob.experience || [],
        trainings: profileBlob.trainings || [],
        summary: profileBlob.summary || null,
      },
      documents: documentsWithSlots.data,
      ...details, // Include all the original details (job, employer, interview, etc.)
    };
  }
}
