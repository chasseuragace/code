import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import { JobApplication, JobApplicationStatus, JobApplicationHistoryEntry } from '../application/job-application.entity';
import { JobPosting, JobPosition, JobContract, InterviewDetail } from '../domain/domain.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateDocument } from '../candidate/candidate-document.entity';
import { Notification } from '../notification/notification.entity';
import { 
  GetWorkflowCandidatesDto, 
  UpdateCandidateStageDto, 
  WorkflowAnalyticsDto 
} from './dto/workflow.dto';

// Workflow stages enum - matching JobApplicationStatus
export enum WorkflowStage {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_RESCHEDULED = 'interview_rescheduled',
  INTERVIEW_PASSED = 'interview_passed',
  INTERVIEW_FAILED = 'interview_failed',
}

// Stage transition rules
const STAGE_TRANSITIONS: Record<WorkflowStage, WorkflowStage | null> = {
  [WorkflowStage.APPLIED]: WorkflowStage.SHORTLISTED,
  [WorkflowStage.SHORTLISTED]: WorkflowStage.INTERVIEW_SCHEDULED,
  [WorkflowStage.INTERVIEW_SCHEDULED]: WorkflowStage.INTERVIEW_PASSED,
  [WorkflowStage.INTERVIEW_RESCHEDULED]: WorkflowStage.INTERVIEW_PASSED,
  [WorkflowStage.INTERVIEW_PASSED]: null, // Final stage
  [WorkflowStage.INTERVIEW_FAILED]: null, // Final stage
};

export interface WorkflowCandidate {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  passport_number: string | null;
  gender: string | null;
  age: number | null;
  profile_image: string | null;
  application: {
    id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    history_blob: any[];
  };
  job: {
    id: string;
    posting_title: string;
    country: string;
    city: string | null;
  };
  position: {
    id: string;
    title: string;
    monthly_salary_amount: number;
    salary_currency: string;
  };
  interview?: {
    id: string;
    interview_date_ad: Date | null;
    interview_time: string | null;
    location: string | null;
    status: string;
    result: string | null;
    feedback: string | null;
  };
  documents: Array<{
    id: string;
    name: string;
    document_url: string;
    document_type: string;
    verification_status: string;
    created_at: Date;
  }>;
}

export interface WorkflowAnalytics {
  total_candidates: number;
  by_stage: Record<string, number>;
  by_job: Array<{
    job_id: string;
    job_title: string;
    country: string;
    stages: Record<string, number>;
  }>;
  conversion_rates: {
    applied_to_shortlisted: number;
    shortlisted_to_scheduled: number;
    scheduled_to_passed: number;
    overall_success_rate: number;
  };
}

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(JobPosition)
    private readonly positionRepo: Repository<JobPosition>,
    @InjectRepository(JobContract)
    private readonly contractRepo: Repository<JobContract>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(InterviewDetail)
    private readonly interviewRepo: Repository<InterviewDetail>,
    @InjectRepository(CandidateDocument)
    private readonly documentRepo: Repository<CandidateDocument>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Get workflow candidates for an agency
   */
  async getWorkflowCandidates(
    agencyId: string,
    filters: GetWorkflowCandidatesDto,
  ): Promise<{
    candidates: WorkflowCandidate[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
    analytics: WorkflowAnalytics;
  }> {
    const startTime = Date.now();
    
    // Build base query with agency scoping
    const query = this.buildWorkflowQuery(agencyId, filters);
    
    // Get total count
    const totalItems = await query.getCount();
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 15;
    const offset = (page - 1) * limit;
    
    query.skip(offset).take(limit);
    
    // Execute query
    const applications = await query.getMany();
    
    // Transform to workflow candidates
    const candidates = await this.transformToWorkflowCandidates(applications);
    
    // Calculate analytics
    const analytics = await this.calculateAnalytics(agencyId, filters);
    
    const queryTime = Date.now() - startTime;
    console.log(`Workflow query completed in ${queryTime}ms`);
    
    return {
      candidates,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalItems / limit),
        total_items: totalItems,
        items_per_page: limit,
      },
      analytics,
    };
  }

  /**
   * Build workflow query with filters
   */
  private buildWorkflowQuery(
    agencyId: string,
    filters: GetWorkflowCandidatesDto,
  ): SelectQueryBuilder<JobApplication> {
    const query = this.applicationRepo
      .createQueryBuilder('app')
      // Use leftJoinAndMapOne to properly map the candidate object
      .leftJoinAndMapOne(
        'app.candidate',
        Candidate,
        'candidate',
        'candidate.id = app.candidate_id'
      )
      .leftJoinAndSelect('app.job_posting', 'jobPosting')
      // Use leftJoinAndMapOne to properly map the position object
      .leftJoinAndMapOne(
        'app.position',
        JobPosition,
        'position',
        'position.id = app.position_id'
      )
      .leftJoin('jobPosting.contracts', 'contract')
      .leftJoinAndSelect('app.interview_details', 'interview')
      .where('contract.posting_agency_id = :agencyId', { agencyId })
      .andWhere('app.status IN (:...stages)', {
        stages: Object.values(WorkflowStage),
      });

    // Filter by stage
    if (filters.stage && filters.stage !== 'all') {
      // When filtering by interview_scheduled, also include interview_rescheduled
      if (filters.stage === 'interview_scheduled') {
        query.andWhere('app.status IN (:...interviewStages)', { 
          interviewStages: ['interview_scheduled', 'interview_rescheduled'] 
        });
      } else {
        query.andWhere('app.status = :stage', { stage: filters.stage });
      }
    }

    // Filter by job posting
    if (filters.job_posting_id) {
      query.andWhere('app.job_posting_id = :jobPostingId', {
        jobPostingId: filters.job_posting_id,
      });
    }

    // Search filter
    if (filters.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('candidate.full_name ILIKE :search', {
            search: `%${filters.search}%`,
          })
            .orWhere('candidate.phone ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('candidate.passport_number ILIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('candidate.email ILIKE :search', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }

    // Sorting
    const sortBy = filters.sort || 'newest';
    switch (sortBy) {
      case 'newest':
        query.orderBy('app.created_at', 'DESC');
        break;
      case 'oldest':
        query.orderBy('app.created_at', 'ASC');
        break;
      case 'name':
        query.orderBy('candidate.full_name', 'ASC');
        break;
      default:
        query.orderBy('app.created_at', 'DESC');
    }

    return query;
  }

  /**
   * Transform applications to workflow candidates
   */
  private async transformToWorkflowCandidates(
    applications: JobApplication[],
  ): Promise<WorkflowCandidate[]> {
    // Handle empty applications array
    if (applications.length === 0) {
      return [];
    }
    
    const candidateIds = applications.map((app) => app.candidate_id);
    
    // Fetch documents for all candidates in one query
    const documents = await this.documentRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.document_type', 'docType')
      .where('doc.candidate_id IN (:...candidateIds)', { candidateIds })
      .andWhere('doc.is_active = true')
      .getMany();
    
    // Group documents by candidate
    const documentsByCandidate = documents.reduce((acc, doc) => {
      if (!acc[doc.candidate_id]) {
        acc[doc.candidate_id] = [];
      }
      acc[doc.candidate_id].push({
        id: doc.id,
        name: doc.name,
        document_url: doc.document_url,
        document_type: doc.document_type?.name || 'Unknown',
        verification_status: doc.verification_status,
        created_at: doc.created_at,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return applications.map((app: any) => {
      // TypeORM with leftJoin + addSelect creates nested objects with the alias name
      // So 'candidate' alias becomes app.candidate, 'position' becomes app.position
      const candidate = app.candidate || {};
      const jobPosting = app.jobPosting || app.job_posting || {};
      const position = app.position || {};
      
      return {
        id: app.candidate_id,
        full_name: candidate.full_name || 'Unknown',
        phone: candidate.phone || '',
        email: candidate.email || null,
        passport_number: candidate.passport_number || null,
        gender: candidate.gender || null,
        age: candidate.age || null,
        profile_image: candidate.profile_image || null,
        application: {
          id: app.id,
          status: app.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
          history_blob: app.history_blob || [],
        },
        job: {
          id: app.job_posting_id,
          posting_title: jobPosting.posting_title || 'Unknown Job',
          country: jobPosting.country || '',
          city: jobPosting.city || null,
        },
        position: {
          id: app.position_id,
          title: position.title || 'Unknown Position',
          monthly_salary_amount: parseFloat((position.monthly_salary_amount || 0).toString()),
          salary_currency: position.salary_currency || 'NPR',
        },
        interview: app.interview_details?.[0]
          ? {
              id: app.interview_details[0].id,
              interview_date_ad: app.interview_details[0].interview_date_ad,
              interview_time: app.interview_details[0].interview_time,
              location: app.interview_details[0].location,
              status: app.interview_details[0].status,
              result: app.interview_details[0].result,
              feedback: app.interview_details[0].feedback,
            }
          : undefined,
        documents: documentsByCandidate[app.candidate_id] || [],
      };
    });
  }

  /**
   * Calculate workflow analytics
   */
  async calculateAnalytics(
    agencyId: string,
    filters: GetWorkflowCandidatesDto,
  ): Promise<WorkflowAnalytics> {
    // Get stage counts
    const stageCounts = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'stage')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('app.job_posting', 'jobPosting')
      .leftJoin('jobPosting.contracts', 'contract')
      .where('contract.posting_agency_id = :agencyId', { agencyId })
      .andWhere('app.status IN (:...stages)', {
        stages: Object.values(WorkflowStage),
      })
      .groupBy('app.status')
      .getRawMany();

    const byStage = stageCounts.reduce((acc, row) => {
      acc[row.stage] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Ensure all stages are present
    Object.values(WorkflowStage).forEach((stage) => {
      if (!byStage[stage]) {
        byStage[stage] = 0;
      }
    });

    // Get job-wise breakdown
    const jobCounts = await this.applicationRepo
      .createQueryBuilder('app')
      .select('jobPosting.id', 'job_id')
      .addSelect('jobPosting.posting_title', 'job_title')
      .addSelect('jobPosting.country', 'country')
      .addSelect('app.status', 'stage')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('app.job_posting', 'jobPosting')
      .leftJoin('jobPosting.contracts', 'contract')
      .where('contract.posting_agency_id = :agencyId', { agencyId })
      .andWhere('app.status IN (:...stages)', {
        stages: Object.values(WorkflowStage),
      })
      .groupBy('jobPosting.id, jobPosting.posting_title, jobPosting.country, app.status')
      .getRawMany();

    // Group by job
    const byJobMap = new Map<string, any>();
    jobCounts.forEach((row) => {
      if (!byJobMap.has(row.job_id)) {
        byJobMap.set(row.job_id, {
          job_id: row.job_id,
          job_title: row.job_title,
          country: row.country,
          stages: {},
        });
      }
      const job = byJobMap.get(row.job_id);
      job.stages[row.stage] = parseInt(row.count, 10);
    });

    const byJob = Array.from(byJobMap.values());

    // Calculate conversion rates
    const totalCandidates = Object.values(byStage).reduce<number>((sum, count) => sum + (count as number), 0);
    const applied = byStage[WorkflowStage.APPLIED] || 0;
    const shortlisted = byStage[WorkflowStage.SHORTLISTED] || 0;
    const scheduled = byStage[WorkflowStage.INTERVIEW_SCHEDULED] || 0;
    const passed = byStage[WorkflowStage.INTERVIEW_PASSED] || 0;

    const conversionRates = {
      applied_to_shortlisted: applied > 0 ? (shortlisted / applied) * 100 : 0,
      shortlisted_to_scheduled: shortlisted > 0 ? (scheduled / shortlisted) * 100 : 0,
      scheduled_to_passed: scheduled > 0 ? (passed / scheduled) * 100 : 0,
      overall_success_rate: totalCandidates > 0 ? (passed / totalCandidates) * 100 : 0,
    };

    return {
      total_candidates: totalCandidates,
      by_stage: byStage,
      by_job: byJob,
      conversion_rates: conversionRates,
    };
  }

  /**
   * Update candidate stage
   */
  async updateCandidateStage(
    agencyId: string,
    candidateId: string,
    updateDto: UpdateCandidateStageDto,
  ): Promise<{ success: boolean; message: string; data: any }> {
    // Find application
    const application = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job_posting', 'jobPosting')
      .leftJoin('jobPosting.contracts', 'contract')
      .where('app.id = :applicationId', { applicationId: updateDto.application_id })
      .andWhere('app.candidate_id = :candidateId', { candidateId })
      .andWhere('contract.posting_agency_id = :agencyId', { agencyId })
      .getOne();

    if (!application) {
      throw new NotFoundException('Application not found or access denied');
    }

    // Validate stage transition
    const currentStage = application.status as unknown as WorkflowStage;
    const newStage = updateDto.new_stage as unknown as WorkflowStage;
    
    if (!this.isValidTransition(currentStage, newStage)) {
      throw new BadRequestException(
        `Invalid stage transition from ${currentStage} to ${newStage}. ` +
        `You can only move to the next stage in sequence.`,
      );
    }

    // Update application status
    const previousStage = application.status;
    application.status = newStage as JobApplicationStatus;
    application.updated_at = new Date();
    
    // Update history
    const historyEntry: JobApplicationHistoryEntry = {
      prev_status: previousStage,
      next_status: newStage as JobApplicationStatus,
      updated_at: new Date().toISOString(),
      updated_by: agencyId,
      note: updateDto.notes || '',
    };
    application.history_blob = [...(application.history_blob || []), historyEntry];

    await this.applicationRepo.save(application);

    // Create interview if moving to interview-scheduled
    let interviewId: string | undefined;
    if (newStage === WorkflowStage.INTERVIEW_SCHEDULED && updateDto.interview_details) {
      const interview = this.interviewRepo.create({
        job_posting_id: application.job_posting_id,
        job_application_id: application.id,
        interview_date_ad: updateDto.interview_details.interview_date_ad,
        interview_time: updateDto.interview_details.interview_time,
        duration_minutes: updateDto.interview_details.duration_minutes || 60,
        location: updateDto.interview_details.location,
        contact_person: updateDto.interview_details.contact_person,
        type: updateDto.interview_details.type || 'In-person',
        status: 'scheduled',
      });
      const savedInterview = await this.interviewRepo.save(interview);
      interviewId = savedInterview.id;
    }

    // Create notification
    await this.createStageChangeNotification(
      application,
      newStage,
      agencyId,
      interviewId,
    );

    return {
      success: true,
      message: `Candidate moved from ${previousStage} to ${newStage}`,
      data: {
        application_id: application.id,
        previous_stage: previousStage,
        new_stage: newStage,
        updated_at: application.updated_at,
        interview_id: interviewId,
      },
    };
  }

  /**
   * Validate stage transition
   */
  private isValidTransition(currentStage: WorkflowStage, newStage: WorkflowStage): boolean {
    const allowedNextStage = STAGE_TRANSITIONS[currentStage];
    return allowedNextStage === newStage;
  }

  /**
   * Create notification for stage change
   */
  private async createStageChangeNotification(
    application: JobApplication,
    newStage: WorkflowStage,
    agencyId: string,
    interviewId?: string,
  ): Promise<void> {
    const notificationTypeMap: Record<WorkflowStage, string> = {
      [WorkflowStage.APPLIED]: 'applied',
      [WorkflowStage.SHORTLISTED]: 'shortlisted',
      [WorkflowStage.INTERVIEW_SCHEDULED]: 'interview_scheduled',
      [WorkflowStage.INTERVIEW_RESCHEDULED]: 'interview_rescheduled',
      [WorkflowStage.INTERVIEW_PASSED]: 'interview_passed',
      [WorkflowStage.INTERVIEW_FAILED]: 'interview_failed',
    };

    const titleMap: Record<WorkflowStage, string> = {
      [WorkflowStage.APPLIED]: 'Application Received',
      [WorkflowStage.SHORTLISTED]: 'You have been shortlisted!',
      [WorkflowStage.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
      [WorkflowStage.INTERVIEW_RESCHEDULED]: 'Interview Rescheduled',
      [WorkflowStage.INTERVIEW_PASSED]: 'Congratulations! You passed the interview',
      [WorkflowStage.INTERVIEW_FAILED]: 'Interview Result',
    };

    const messageMap: Record<WorkflowStage, string> = {
      [WorkflowStage.APPLIED]: 'Your application has been received and is under review.',
      [WorkflowStage.SHORTLISTED]: 'Great news! You have been shortlisted for the position.',
      [WorkflowStage.INTERVIEW_SCHEDULED]: 'Your interview has been scheduled. Please check the details.',
      [WorkflowStage.INTERVIEW_RESCHEDULED]: 'Your interview has been rescheduled. Please check the updated details.',
      [WorkflowStage.INTERVIEW_PASSED]: 'Congratulations! You have successfully passed the interview.',
      [WorkflowStage.INTERVIEW_FAILED]: 'Thank you for your time. Unfortunately, you did not pass the interview.',
    };

    const notification = this.notificationRepo.create({
      candidate_id: application.candidate_id,
      job_application_id: application.id,
      job_posting_id: application.job_posting_id,
      agency_id: agencyId,
      interview_id: interviewId,
      notification_type: notificationTypeMap[newStage] as any,
      title: titleMap[newStage],
      message: messageMap[newStage],
      payload: {
        stage: newStage,
        application_id: application.id,
        interview_id: interviewId,
      } as any,
      is_read: false,
      is_sent: false,
    });

    await this.notificationRepo.save(notification);
  }

  /**
   * Verify agency has access to candidate
   */
  async verifyAgencyAccess(agencyId: string, candidateId: string): Promise<boolean> {
    const count = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoin('app.job_posting', 'jobPosting')
      .leftJoin('jobPosting.contracts', 'contract')
      .where('app.candidate_id = :candidateId', { candidateId })
      .andWhere('contract.posting_agency_id = :agencyId', { agencyId })
      .getCount();

    return count > 0;
  }
}
