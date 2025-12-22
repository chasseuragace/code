import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, InterviewDetail } from '../domain/domain.entity';
import { JobApplication } from '../application/job-application.entity';
import { 
  AdminJobFiltersDto, 
  AdminJobListResponseDto, 
  AdminJobItemDto 
} from './dto/admin-job-list.dto';

@Injectable()
export class AdminJobsService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(JobApplication)
    private applicationRepo: Repository<JobApplication>,
  ) {}

  /**
   * Get admin job list with filters and statistics
   */
  async getAdminJobList(filters: AdminJobFiltersDto): Promise<AdminJobListResponseDto> {
    try {
      console.log('[AdminJobsService] getAdminJobList called with filters:', JSON.stringify(filters));
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;
      console.log('[AdminJobsService] Pagination:', { page, limit, skip });

    // Build base query
    let query = this.jobPostingRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.contracts', 'contract')
      .leftJoinAndSelect('contract.employer', 'employer')
      .leftJoinAndSelect('contract.agency', 'agency')
      .leftJoinAndSelect('contract.positions', 'position');

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      query = query.andWhere(
        '(LOWER(job.posting_title) LIKE LOWER(:search) OR LOWER(COALESCE(employer.company_name, \'\')) LIKE LOWER(:search) OR CAST(job.id AS TEXT) LIKE :search)',
        { search: `%${filters.search.trim()}%` }
      );
    }

    // Apply country filter
    if (filters.country && filters.country.trim()) {
      query = query.andWhere('job.country = :country', { country: filters.country.trim() });
    }

    // Apply agency filter
    if (filters.agency_id && filters.agency_id.trim()) {
      query = query.andWhere('agency.id = :agencyId', { agencyId: filters.agency_id.trim() });
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply sorting
    const sortBy = filters.sort_by || 'published_date';
    const order = (filters.order || 'DESC').toUpperCase() as 'ASC' | 'DESC';

    // For now, we'll sort by published_date
    // Statistics-based sorting will be added after we get the data
    if (sortBy === 'published_date') {
      query = query.orderBy('job.posting_date_ad', order);
    } else {
      // Default to published date for other sorts (will be sorted in memory after stats)
      query = query.orderBy('job.posting_date_ad', 'DESC');
    }

    // Apply pagination
    query = query.skip(skip).take(limit);

    // Execute query
    console.log('[AdminJobsService] Executing query with filters:', filters);
    const jobs = await query.getMany();
    console.log('[AdminJobsService] Found', jobs.length, 'jobs');

    // Get job IDs for statistics
    const jobIds = jobs.map(j => j.id);

    // Fetch application statistics
    const appStats = await this.getApplicationStatistics(jobIds);
    const statsMap = new Map(appStats.map(s => [s.job_id, s]));

    // Transform to DTO
    let data: AdminJobItemDto[] = jobs.map(job => {
      const contract = job.contracts?.[0];
      const position = contract?.positions?.[0];
      const stats = statsMap.get(job.id) || {
        applications_count: '0',
        applied_count: '0',
        shortlisted_count: '0',
        withdrawn_count: '0',
        interviews_today: '0',
        total_interviews: '0',
      } as any;

      return {
        id: job.id,
        title: job.posting_title,
        company: contract?.employer?.company_name || 'N/A',
        country: job.country,
        city: job.city || undefined,
        created_at: job.created_at,
        published_at: job.posting_date_ad || undefined,

        salary: position
          ? `${Number(position.monthly_salary_amount)} ${position.salary_currency}`
          : 'N/A',
        currency: position?.salary_currency || '',
        salary_amount: Number(position?.monthly_salary_amount) || 0,

        applications_count: parseInt(stats.applications_count),
        applied_count: parseInt(stats.applied_count),
        shortlisted_count: parseInt(stats.shortlisted_count),
        withdrawn_count: parseInt(stats.withdrawn_count),
        interviews_today: parseInt(stats.interviews_today),
        total_interviews: parseInt(stats.total_interviews),
        view_count: 0, // TODO: Implement view tracking
        is_active: job.is_active ?? true,

        category: position?.title || 'General',
        tags: job.skills || [],
        requirements: job.education_requirements || [],
        description: job.posting_title, // Use title as description for now

        working_hours: contract?.hours_per_day
          ? `${contract.hours_per_day} hours/day`
          : undefined,
        accommodation: contract?.accommodation || undefined,
        food: contract?.food || undefined,
        visa_status: 'Company will provide', // TODO: Derive from expenses
        contract_duration: contract?.period_years
          ? `${contract.period_years} years`
          : undefined,

        agency: contract?.agency
          ? {
              id: contract.agency.id,
              name: contract.agency.name,
              license_number: contract.agency.license_number,
            }
          : undefined,
      };
    });

    // Apply statistics-based sorting if needed
    if (sortBy === 'applications') {
      data = data.sort((a, b) => 
        order === 'DESC' 
          ? b.applications_count - a.applications_count
          : a.applications_count - b.applications_count
      );
    } else if (sortBy === 'shortlisted') {
      data = data.sort((a, b) => 
        order === 'DESC'
          ? b.shortlisted_count - a.shortlisted_count
          : a.shortlisted_count - b.shortlisted_count
      );
    } else if (sortBy === 'interviews') {
      data = data.sort((a, b) => 
        order === 'DESC'
          ? b.interviews_today - a.interviews_today
          : a.interviews_today - b.interviews_today
      );
    }

      return {
        data,
        total,
        page,
        limit,
        filters: {
          search: filters.search,
          country: filters.country,
          agency_id: filters.agency_id,
        },
      };
    } catch (error) {
      console.error('[AdminJobsService] Error in getAdminJobList:', error);
      throw error;
    }
  }

  /**
   * Get application statistics for job postings
   */
  async getApplicationStatistics(jobIds: string[]) {
    if (jobIds.length === 0) return [];

    // Application-driven stats
    const appStats = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.job_posting_id', 'job_id')
      .addSelect('COUNT(*)', 'applications_count')
      .addSelect(
        "SUM(CASE WHEN app.status = 'applied' THEN 1 ELSE 0 END)",
        'applied_count'
      )
      .addSelect(
        "SUM(CASE WHEN app.status = 'shortlisted' THEN 1 ELSE 0 END)",
        'shortlisted_count'
      )
      .addSelect(
        "SUM(CASE WHEN app.status = 'withdrawn' THEN 1 ELSE 0 END)",
        'withdrawn_count'
      )
      .where('app.job_posting_id IN (:...ids)', { ids: jobIds })
      .groupBy('app.job_posting_id')
      .getRawMany();

    // Interview-driven stats (truth source for interviews)
    const interviewRepo = this.jobPostingRepo.manager.getRepository(InterviewDetail);
    const interviewStats = await interviewRepo
      .createQueryBuilder('iv')
      .select('iv.job_posting_id', 'job_id')
      .addSelect(
        "SUM(CASE WHEN iv.status = 'scheduled' AND iv.interview_date_ad = CURRENT_DATE THEN 1 ELSE 0 END)",
        'interviews_today'
      )
      .addSelect('COUNT(*)', 'total_interviews')
      .where('iv.job_posting_id IN (:...ids)', { ids: jobIds })
      .groupBy('iv.job_posting_id')
      .getRawMany();

    // Merge stats by job_id
    const map = new Map<string, any>();
    for (const a of appStats) {
      map.set(String(a.job_id), {
        job_id: String(a.job_id),
        applications_count: String(a.applications_count ?? '0'),
        applied_count: String(a.applied_count ?? '0'),
        shortlisted_count: String(a.shortlisted_count ?? '0'),
        withdrawn_count: String(a.withdrawn_count ?? '0'),
        interviews_today: '0',
        total_interviews: '0',
      });
    }
    for (const iv of interviewStats) {
      const key = String(iv.job_id);
      const existing = map.get(key) || {
        job_id: key,
        applications_count: '0',
        applied_count: '0',
        shortlisted_count: '0',
        withdrawn_count: '0',
        interviews_today: '0',
        total_interviews: '0',
      };
      existing.interviews_today = String(iv.interviews_today ?? '0');
      existing.total_interviews = String(iv.total_interviews ?? '0');
      map.set(key, existing);
    }

    return Array.from(map.values());
  }

  /**
   * Get country distribution (job count by country)
   */
  async getCountryDistribution(agencyId?: string): Promise<Record<string, number>> {
    let query = this.jobPostingRepo
      .createQueryBuilder('job')
      .select('job.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('job.is_active = :active', { active: true });

    // Filter by agency if provided
    if (agencyId) {
      query = query
        .leftJoin('job.contracts', 'contract')
        .leftJoin('contract.agency', 'agency')
        .andWhere('agency.id = :agencyId', { agencyId });
    }

    const results = await query
      .groupBy('job.country')
      .getRawMany();

    const distribution: Record<string, number> = {};
    results.forEach(r => {
      distribution[r.country] = parseInt(r.count);
    });

    return distribution;
  }
}
