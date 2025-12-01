import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { JobPosting, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';
import { AgencyDashboardAnalyticsDto, AgencyDashboardQueryDto } from './dto/agency-dashboard-analytics.dto';

@Injectable()
export class AgencyDashboardService {
  constructor(
    @InjectRepository(PostingAgency)
    private readonly agencyRepo: Repository<PostingAgency>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    @InjectRepository(InterviewDetail)
    private readonly interviewRepo: Repository<InterviewDetail>,
  ) {}

  async getDashboardAnalytics(
    license: string,
    query: AgencyDashboardQueryDto,
  ): Promise<AgencyDashboardAnalyticsDto> {
    // Validate agency
    const agency = await this.agencyRepo.findOne({
      where: { license_number: license },
    });

    if (!agency) {
      throw new NotFoundException(`Agency with license ${license} not found`);
    }

    // Parse date range
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    // Run all analytics queries in parallel
    const [
      jobMetrics,
      applicationMetrics,
      interviewMetrics,
      availableOptions,
    ] = await Promise.all([
      this.getJobMetrics(agency.id, query, startDate, endDate),
      this.getApplicationMetrics(agency.id, query, startDate, endDate),
      this.getInterviewMetrics(agency.id, query, startDate, endDate),
      this.getAvailableOptions(agency.id),
    ]);

    return {
      jobs: jobMetrics,
      applications: applicationMetrics,
      interviews: interviewMetrics,
      availableCountries: availableOptions.countries,
      availableJobs: availableOptions.jobs,
      generatedAt: new Date().toISOString(),
    };
  }

  private async getJobMetrics(
    agencyId: string,
    query: AgencyDashboardQueryDto,
    startDate: Date | null,
    endDate: Date | null,
  ) {
    const queryBuilder = this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .where('jc.posting_agency_id = :agencyId', { agencyId });

    if (query.country) {
      queryBuilder.andWhere('jp.country = :country', { country: query.country });
    }

    if (query.jobId) {
      queryBuilder.andWhere('jp.id = :jobId', { jobId: query.jobId });
    }

    const jobPostings = await queryBuilder.getMany();

    // Total jobs (all time)
    const total = jobPostings.length;
    const active = jobPostings.filter(jp => jp.is_active).length;
    const inactive = total - active;
    const drafts = 0; // TODO: Requires status field

    // Time-scoped metrics
    let recentInRange = 0;
    let openInTimeframe = 0;
    let createdInTimeframe = 0;
    let draftInTimeframe = 0;

    if (startDate && endDate) {
      jobPostings.forEach(jp => {
        const createdAt = jp.created_at;
        const updatedAt = jp.updated_at;

        // Jobs created in timeframe
        if (createdAt && createdAt >= startDate && createdAt <= endDate) {
          createdInTimeframe++;
          recentInRange++;
        }

        // Open jobs created or updated in timeframe
        if (jp.is_active && 
            ((createdAt && createdAt >= startDate && createdAt <= endDate) ||
             (updatedAt && updatedAt >= startDate && updatedAt <= endDate))) {
          openInTimeframe++;
        }

        // Draft jobs created or updated in timeframe (TODO: requires status field)
        // For now, this will be 0
      });
    }

    return {
      total,
      active,
      inactive,
      drafts,
      recentInRange,
      openInTimeframe,
      createdInTimeframe,
      draftInTimeframe,
    };
  }

  private async getApplicationMetrics(
    agencyId: string,
    query: AgencyDashboardQueryDto,
    startDate: Date | null,
    endDate: Date | null,
  ) {
    // Get job posting IDs for this agency
    const jobPostingsQuery = this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .select('jp.id')
      .where('jc.posting_agency_id = :agencyId', { agencyId });

    if (query.country) {
      jobPostingsQuery.andWhere('jp.country = :country', { country: query.country });
    }

    if (query.jobId) {
      jobPostingsQuery.andWhere('jp.id = :jobId', { jobId: query.jobId });
    }

    const jobPostings = await jobPostingsQuery.getRawMany<{ jp_id: string }>();
    const jobPostingIds = jobPostings.map(jp => jp.jp_id);

    if (jobPostingIds.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byStatusInTimeframe: {},
        uniqueJobs: 0,
        recentInRange: 0,
      };
    }

    // Get all applications
    const applications = await this.applicationRepo
      .createQueryBuilder('app')
      .where('app.job_posting_id IN (:...jobPostingIds)', { jobPostingIds })
      .getMany();

    const total = applications.length;

    // Group by current status
    const byStatus: Record<string, number> = {};
    applications.forEach(app => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });

    // Unique jobs with applications
    const uniqueJobs = new Set(applications.map(app => app.job_posting_id)).size;

    // Time-scoped metrics using history_blob
    const byStatusInTimeframe: Record<string, number> = {};
    let recentInRange = 0;

    if (startDate && endDate) {
      applications.forEach(app => {
        // Count applications created in range
        if (app.created_at >= startDate && app.created_at <= endDate) {
          recentInRange++;
        }

        // Parse history_blob for status changes in timeframe
        if (app.history_blob && Array.isArray(app.history_blob)) {
          app.history_blob.forEach((entry: any) => {
            if (entry.next_status && entry.updated_at) {
              const updatedAt = new Date(entry.updated_at);
              if (updatedAt >= startDate && updatedAt <= endDate) {
                const status = entry.next_status;
                byStatusInTimeframe[status] = (byStatusInTimeframe[status] || 0) + 1;
              }
            }
          });
        }
      });
    }

    return {
      total,
      byStatus,
      byStatusInTimeframe,
      uniqueJobs,
      recentInRange,
    };
  }

  private async getInterviewMetrics(
    agencyId: string,
    query: AgencyDashboardQueryDto,
    startDate: Date | null,
    endDate: Date | null,
  ) {
    // Get job posting IDs for this agency
    const jobPostingsQuery = this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .select('jp.id')
      .where('jc.posting_agency_id = :agencyId', { agencyId });

    if (query.country) {
      jobPostingsQuery.andWhere('jp.country = :country', { country: query.country });
    }

    if (query.jobId) {
      jobPostingsQuery.andWhere('jp.id = :jobId', { jobId: query.jobId });
    }

    const jobPostings = await jobPostingsQuery.getRawMany<{ jp_id: string }>();
    const jobPostingIds = jobPostings.map(jp => jp.jp_id);

    if (jobPostingIds.length === 0) {
      return {
        total: 0,
        pending: 0,
        completed: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
        recentInRange: 0,
        todayStatus: { pass: 0, fail: 0 },
      };
    }

    // Get all interviews
    const interviews = await this.interviewRepo
      .createQueryBuilder('iv')
      .where('iv.job_posting_id IN (:...jobPostingIds)', { jobPostingIds })
      .getMany();

    const total = interviews.length;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count by status
    const pending = interviews.filter(iv => {
      const interviewDate = iv.interview_date_ad;
      return interviewDate && interviewDate > now && !iv.result;
    }).length;

    const completed = interviews.filter(iv => iv.result).length;
    const passed = interviews.filter(iv => iv.result === 'pass').length;
    const failed = interviews.filter(iv => iv.result === 'fail').length;

    // Calculate pass rate
    const passRate = completed > 0 ? Math.round((passed / completed) * 1000) / 10 : 0;

    // Today's status
    const todayPass = interviews.filter(iv => {
      const completedAt = iv.completed_at;
      return completedAt && completedAt >= today && completedAt < tomorrow && iv.result === 'pass';
    }).length;

    const todayFail = interviews.filter(iv => {
      const completedAt = iv.completed_at;
      return completedAt && completedAt >= today && completedAt < tomorrow && iv.result === 'fail';
    }).length;

    // Time-scoped metrics
    let recentInRange = 0;
    if (startDate && endDate) {
      recentInRange = interviews.filter(iv => {
        const interviewDate = iv.interview_date_ad;
        return interviewDate && interviewDate >= startDate && interviewDate <= endDate;
      }).length;
    }

    return {
      total,
      pending,
      completed,
      passed,
      failed,
      passRate,
      recentInRange,
      todayStatus: {
        pass: todayPass,
        fail: todayFail,
      },
    };
  }

  private async getAvailableOptions(agencyId: string) {
    const allJobsForAgency = await this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .where('jc.posting_agency_id = :agencyId', { agencyId })
      .select(['jp.country', 'jp.id', 'jp.posting_title'])
      .getRawMany<{ jp_country: string; jp_id: string; jp_posting_title: string }>();

    const countries = [...new Set(allJobsForAgency.map(j => j.jp_country))].filter(Boolean).sort();
    
    const jobs = allJobsForAgency
      .filter((job, index, self) => 
        index === self.findIndex(j => j.jp_id === job.jp_id)
      )
      .map(job => ({
        id: job.jp_id,
        title: job.jp_posting_title,
        country: job.jp_country,
      }))
      .slice(0, 50);

    return { countries, jobs };
  }
}
