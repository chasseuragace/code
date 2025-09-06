import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JobApplication, JobApplicationHistoryEntry, JobApplicationStatus } from './job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { JobPosting } from '../domain/domain.entity';
import { InterviewService } from '../domain/domain.service';

export type ApplyOptions = { note?: string | null; updatedBy?: string | null };
export type ListOptions = { status?: JobApplicationStatus; page?: number; limit?: number };
export type UpdateOptions = { note?: string | null; updatedBy?: string | null };
export type CorrectionOptions = { reason: string; updatedBy?: string | null };
export type ScheduleInterviewInput = {
  interview_date_ad?: string;
  interview_date_bs?: string;
  interview_time?: string;
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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(JobApplication) private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobPosting) private readonly postingRepo: Repository<JobPosting>,
    private readonly interviewSvc: InterviewService,
  ) {}

  // Diagnostics
  async getById(id: string): Promise<JobApplication | null> {
    return this.appRepo.findOne({ where: { id } });
  }

  // Create a new application
  async apply(candidateId: string, jobPostingId: string, opts: ApplyOptions = {}): Promise<JobApplication> {
    // Validate candidate exists
    const [candidate, posting] = await Promise.all([
      this.candidateRepo.findOne({ where: { id: candidateId as any } as FindOptionsWhere<Candidate> }),
      this.postingRepo.findOne({ where: { id: jobPostingId as any } as FindOptionsWhere<JobPosting> }),
    ]);
    if (!candidate) throw new Error('Candidate not found');
    if (!posting) throw new Error('Job posting not found');
    if (!posting.is_active) throw new Error('Job posting is not active');

    // Enforce uniqueness
    const existing = await this.appRepo.findOne({ where: { candidate_id: candidateId, job_posting_id: jobPostingId } });
    if (existing) throw new Error('Candidate has already applied to this posting');

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
      status,
      history_blob: history,
      withdrawn_at: null,
    });

    return this.appRepo.save(entity);
  }

  // List candidate applications with optional status filter
  async listApplied(candidateId: string, opts: ListOptions = {}): Promise<{ items: JobApplication[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const where: FindOptionsWhere<JobApplication> = { candidate_id: candidateId } as any;
    if (opts.status) (where as any).status = opts.status;

    const [items, total] = await this.appRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  // Withdraw application by candidate + posting
  async withdraw(candidateId: string, jobPostingId: string, opts: UpdateOptions = {}): Promise<JobApplication> {
    const app = await this.appRepo.findOne({ where: { candidate_id: candidateId, job_posting_id: jobPostingId } });
    if (!app) throw new Error('Application not found');
    if (app.status === 'withdrawn') return app; // idempotent
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot withdraw from terminal status');

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
  async updateStatus(applicationId: string, nextStatus: JobApplicationStatus, opts: UpdateOptions = {}): Promise<JobApplication> {
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

    return this.appRepo.save(app);
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
  async scheduleInterview(applicationId: string, input: ScheduleInterviewInput, opts: UpdateOptions = {}): Promise<JobApplication> {
    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot schedule interview for terminal application');
    const allowedFrom = ['applied', 'shortlisted', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid schedule from status ${app.status}`);

    // Persist interview
    await this.interviewSvc.createInterview(app.job_posting_id, { ...input, job_application_id: app.id });

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
    return this.appRepo.save(app);
  }

  // Reschedule an interview; updates interview details and application status
  async rescheduleInterview(applicationId: string, interviewId: string, updates: RescheduleInterviewInput, opts: UpdateOptions = {}): Promise<JobApplication> {
    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot reschedule interview for terminal application');
    const allowedFrom = ['interview_scheduled', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid reschedule from status ${app.status}`);

    await this.interviewSvc.updateInterview(interviewId, updates as any);

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
    return this.appRepo.save(app);
  }

  // Complete an interview with result pass/fail
  async completeInterview(applicationId: string, result: 'passed'|'failed', opts: UpdateOptions = {}): Promise<JobApplication> {
    const app = await this.getById(applicationId);
    if (!app) throw new Error('Application not found');
    if (TERMINAL_STATUSES.has(app.status)) throw new Error('Cannot complete interview for terminal application');
    const allowedFrom = ['interview_scheduled', 'interview_rescheduled'];
    if (!allowedFrom.includes(app.status)) throw new Error(`Invalid complete from status ${app.status}`);

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
    return this.appRepo.save(app);
  }
}
