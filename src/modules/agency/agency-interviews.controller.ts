import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobPostingService } from '../domain/domain.service';
import { InterviewHelperService } from '../domain/interview-helper.service';
import { JobApplication } from '../application/job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
import { PostingAgency } from '../domain/PostingAgency';

import {
  GetJobCandidatesQueryDto,
  InterviewStatsDto,
  JobCandidateDto
} from './dto/job-candidates.dto';

/**
 * Agency Interviews Controller
 * 
 * Handles interview-related endpoints at the agency level (across all jobs)
 * Complements the job-specific interview endpoints in JobCandidatesController
 */

@ApiTags('Agency Interviews')
@Controller('agencies/:license/interviews')
export class AgencyInterviewsController {
  constructor(
    private readonly jobPostingService: JobPostingService,
    private readonly interviewHelperService: InterviewHelperService,
    @InjectRepository(JobApplication)
    private readonly jobAppRepo: Repository<JobApplication>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(CandidateJobProfile)
    private readonly candidateJobProfileRepo: Repository<CandidateJobProfile>,
    @InjectRepository(PostingAgency)
    private readonly agencyRepo: Repository<PostingAgency>,
  ) { }

  /**
   * Get all interviews for an agency (across all jobs)
   * GET /agencies/:license/interviews
   */
  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all interviews for an agency',
    description: 'Returns interviews across all jobs owned by the agency. Supports filtering by date, search, and interview status.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'REG-2025-337912' })
  @ApiQuery({
    name: 'job_id',
    required: false,
    description: 'Filter by specific job ID (optional)',
    example: 'job-uuid'
  })
  @ApiQuery({
    name: 'interview_filter',
    required: false,
    description: 'Interview status filter',
    enum: ['today', 'tomorrow', 'unattended', 'all'],
    example: 'today'
  })
  @ApiQuery({
    name: 'date_alias',
    required: false,
    description: 'Date alias for quick filtering',
    enum: ['today', 'tomorrow', 'this_week', 'next_week', 'this_month'],
    example: 'this_week'
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by candidate name, phone, or interviewer',
    example: 'John Doe'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size (default: 20, max: 100)',
    example: 20
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset (default: 0)',
    example: 0
  })
  @ApiOkResponse({
    description: 'List of interviews with candidate details',
    schema: {
      type: 'object',
      properties: {
        candidates: {
          type: 'array',
          items: { $ref: '#/components/schemas/JobCandidateDto' }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            has_more: { type: 'boolean' }
          }
        }
      }
    }
  })
  async getAllInterviewsForAgency(
    @Param('license') license: string,
    @Query('job_id') jobId?: string,
    @Query('interview_filter') interviewFilter?: string,
    @Query('date_alias') dateAlias?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('search') search?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    try {
      const limit = limitStr ? Math.min(100, Math.max(1, parseInt(limitStr, 10))) : 20;
      const offset = offsetStr ? Math.max(0, parseInt(offsetStr, 10)) : 0;

      // Verify agency exists
      const agency = await this.agencyRepo.findOne({ where: { license_number: license } });
      if (!agency) {
        throw new ForbiddenException('Agency not found');
      }

      // Build query to get all jobs for this agency
      const jobsQuery = this.jobPostingService['jobPostingRepository']
        .createQueryBuilder('jp')
        .innerJoin('jp.contracts', 'contract')
        .innerJoin('contract.agency', 'agency')
        .where('agency.license_number = :license', { license })
        .select('jp.id');

      // If specific job ID provided, filter to that job
      if (jobId) {
        jobsQuery.andWhere('jp.id = :jobId', { jobId });
      }

      const jobs = await jobsQuery.getMany();
      const jobIds = jobs.map(j => j.id);

      if (jobIds.length === 0) {
        return {
          candidates: [],
          pagination: {
            total: 0,
            limit,
            offset,
            has_more: false,
          },
        };
      }

      // Fetch applications with interviews for these jobs
      let applications = await this.jobAppRepo
        .createQueryBuilder('ja')
        .leftJoinAndSelect('ja.interview_details', 'interview')
        .leftJoinAndSelect('ja.job_posting', 'job')
        .where('ja.job_posting_id IN (:...jobIds)', { jobIds })
        .andWhere('ja.status IN (:...statuses)', {
          statuses: ['interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed']
        })
        .getMany();

      // Apply interview status filter
      if (interviewFilter && interviewFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        applications = applications.filter(app => {
          const interview = app.interview_details?.[0];
          if (!interview || !interview.interview_date_ad) return false;

          const interviewDate = new Date(interview.interview_date_ad);
          const interviewDateTime = new Date(interviewDate);

          if (interview.interview_time) {
            const timeParts = interview.interview_time.toString().split(':');
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            interviewDateTime.setHours(hours, minutes, 0, 0);
          }

          switch (interviewFilter) {
            case 'today':
              return interviewDate >= today && interviewDate < tomorrow;
            case 'tomorrow':
              const dayAfterTomorrow = new Date(tomorrow);
              dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
              return interviewDate >= tomorrow && interviewDate < dayAfterTomorrow;
            case 'unattended':
              const duration = interview.duration_minutes || 60;
              const gracePeriod = 30;
              const endTime = new Date(interviewDateTime);
              endTime.setMinutes(endTime.getMinutes() + duration + gracePeriod);
              return now > endTime;
            default:
              return true;
          }
        });
      }

      // Apply date filtering
      if (dateAlias || dateFrom || dateTo) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let filterStartDate: Date | null = null;
        let filterEndDate: Date | null = null;

        if (dateAlias) {
          switch (dateAlias) {
            case 'today':
              filterStartDate = new Date(today);
              filterEndDate = new Date(today);
              filterEndDate.setDate(filterEndDate.getDate() + 1);
              break;
            case 'tomorrow':
              filterStartDate = new Date(today);
              filterStartDate.setDate(filterStartDate.getDate() + 1);
              filterEndDate = new Date(filterStartDate);
              filterEndDate.setDate(filterEndDate.getDate() + 1);
              break;
            case 'this_week':
              const dayOfWeek = today.getDay();
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
              filterStartDate = new Date(today);
              filterStartDate.setDate(filterStartDate.getDate() + mondayOffset);
              filterEndDate = new Date(filterStartDate);
              filterEndDate.setDate(filterEndDate.getDate() + 7);
              break;
            case 'next_week':
              const currentDayOfWeek = today.getDay();
              const nextMondayOffset = currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek;
              filterStartDate = new Date(today);
              filterStartDate.setDate(filterStartDate.getDate() + nextMondayOffset);
              filterEndDate = new Date(filterStartDate);
              filterEndDate.setDate(filterEndDate.getDate() + 7);
              break;
            case 'this_month':
              filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
              filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
              break;
          }
        } else if (dateFrom || dateTo) {
          if (dateFrom) {
            filterStartDate = new Date(dateFrom);
            filterStartDate.setHours(0, 0, 0, 0);
          }
          if (dateTo) {
            filterEndDate = new Date(dateTo);
            filterEndDate.setHours(23, 59, 59, 999);
          }
        }

        if (filterStartDate || filterEndDate) {
          applications = applications.filter(app => {
            const interview = app.interview_details?.[0];
            if (!interview || !interview.interview_date_ad) return false;

            const interviewDate = new Date(interview.interview_date_ad);
            interviewDate.setHours(0, 0, 0, 0);

            if (filterStartDate && interviewDate < filterStartDate) return false;
            if (filterEndDate && interviewDate >= filterEndDate) return false;

            return true;
          });
        }
      }

      // Apply search filter
      if (search && search.trim().length > 0) {
        const searchLower = search.toLowerCase().trim();
        const candidateIds = applications.map(app => app.candidate_id);

        let candidatesForSearch: Candidate[] = [];
        if (candidateIds.length > 0) {
          candidatesForSearch = await this.candidateRepo
            .createQueryBuilder('c')
            .where('c.id IN (:...candidateIds)', { candidateIds })
            .getMany();
        }

        const candidateMap = new Map(candidatesForSearch.map(c => [c.id, c]));

        applications = applications.filter(app => {
          const candidate = candidateMap.get(app.candidate_id);
          const interview = app.interview_details?.[0];

          if (candidate?.full_name?.toLowerCase().includes(searchLower)) return true;
          if (candidate?.phone?.toLowerCase().includes(searchLower)) return true;
          if (interview?.contact_person?.toLowerCase().includes(searchLower)) return true;

          return false;
        });
      }

      // Get total count
      const total = applications.length;

      // Apply pagination
      const paginatedApps = applications.slice(offset, offset + limit);

      // Fetch candidate details
      const candidateIds = paginatedApps.map(app => app.candidate_id);

      let candidates: Candidate[] = [];
      if (candidateIds.length > 0) {
        candidates = await this.candidateRepo
          .createQueryBuilder('c')
          .where('c.id IN (:...candidateIds)', { candidateIds })
          .getMany();
      }

      const candidateMap = new Map(candidates.map(c => [c.id, c]));

      // Fetch job profiles
      let jobProfiles: CandidateJobProfile[] = [];
      if (candidateIds.length > 0) {
        jobProfiles = await this.candidateJobProfileRepo
          .createQueryBuilder('cjp')
          .where('cjp.candidate_id IN (:...candidateIds)', { candidateIds })
          .orderBy('cjp.updated_at', 'DESC')
          .getMany();
      }

      const profileMap = new Map<string, any>();
      for (const profile of jobProfiles) {
        if (!profileMap.has(profile.candidate_id)) {
          profileMap.set(profile.candidate_id, profile.profile_blob);
        }
      }

      // Build response
      const candidateDtos: JobCandidateDto[] = paginatedApps.map(app => {
        const candidate = candidateMap.get(app.candidate_id);
        const profileBlob = profileMap.get(app.candidate_id) || {};
        const interview = app.interview_details?.[0];

        const address = candidate?.address as any;
        const city = address?.municipality || address?.district || 'N/A';
        const country = 'Nepal';

        const candidateSkills = Array.isArray(profileBlob.skills)
          ? profileBlob.skills
            .map((s: any) => (typeof s === 'string' ? s : s?.title))
            .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
          : [];

        return {
          id: candidate?.id || app.candidate_id,
          name: candidate?.full_name || 'Unknown',
          priority_score: 0,
          location: { city, country },
          phone: candidate?.phone || 'N/A',
          email: candidate?.email || 'N/A',
          experience: profileBlob.experience || 'N/A',
          skills: candidateSkills,
          applied_at: app.created_at.toISOString(),
          application_id: app.id,
          documents: [],
          interview: interview ? {
            id: interview.id,
            scheduled_at: interview.interview_date_ad
              ? (interview.interview_date_ad instanceof Date
                ? interview.interview_date_ad.toISOString()
                : new Date(interview.interview_date_ad).toISOString())
              : null,
            time: interview.interview_time ? String(interview.interview_time) : null,
            duration: interview.duration_minutes || 60,
            location: interview.location || null,
            interviewer: interview.contact_person || null,
            notes: interview.notes || null,
            required_documents: interview.required_documents || [],
            status: interview.status || 'scheduled',
            result: interview.result || null,
            type: interview.type || 'In-person',
          } : null,
          job_title: app.job_posting?.posting_title || 'Unknown Job',
          job_id: app.job_posting_id,
        } as any;
      });

      return {
        candidates: candidateDtos,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total,
        },
      };
    } catch (e) {
      throw new ForbiddenException(e.message);
    }
  }

  /**
   * Get interview statistics for all jobs of an agency
   * GET /agencies/:license/interviews/stats
   */
  @Get('stats')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get interview statistics for all agency jobs',
    description: 'Returns aggregated statistics across all jobs owned by the agency'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'REG-2025-337912' })
  @ApiQuery({
    name: 'date_range',
    required: false,
    description: 'Date range filter',
    enum: ['today', 'week', 'month', 'all'],
    example: 'all'
  })
  @ApiOkResponse({
    description: 'Aggregated interview statistics',
    type: InterviewStatsDto
  })
  async getAgencyInterviewStats(
    @Param('license') license: string,
    @Query('date_range') dateRange?: 'today' | 'week' | 'month' | 'all',
  ): Promise<InterviewStatsDto> {
    // Verify agency exists
    const agency = await this.agencyRepo.findOne({ where: { license_number: license } });
    if (!agency) {
      throw new ForbiddenException('Agency not found');
    }

    // Get all jobs for this agency
    const jobs = await this.jobPostingService['jobPostingRepository']
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'contract')
      .innerJoin('contract.agency', 'agency')
      .where('agency.license_number = :license', { license })
      .select('jp.id')
      .getMany();

    const jobIds = jobs.map(j => j.id);

    if (jobIds.length === 0) {
      return {
        total_scheduled: 0,
        today: 0,
        tomorrow: 0,
        unattended: 0,
        completed: 0,
        passed: 0,
        failed: 0,
        cancelled: 0,
      };
    }

    // Aggregate statistics across all jobs
    const statsPromises = jobIds.map(jobId =>
      this.interviewHelperService.getInterviewStatsForJob(jobId, dateRange || 'all')
    );

    const allStats = await Promise.all(statsPromises);

    // Sum up all statistics
    const aggregated = allStats.reduce((acc, stats) => ({
      total_scheduled: acc.total_scheduled + stats.total_scheduled,
      today: acc.today + stats.today,
      tomorrow: acc.tomorrow + stats.tomorrow,
      unattended: acc.unattended + stats.unattended,
      completed: acc.completed + stats.completed,
      passed: acc.passed + stats.passed,
      failed: acc.failed + stats.failed,
      cancelled: acc.cancelled + stats.cancelled,
    }), {
      total_scheduled: 0,
      today: 0,
      tomorrow: 0,
      unattended: 0,
      completed: 0,
      passed: 0,
      failed: 0,
      cancelled: 0,
    });

    return aggregated;
  }
}
