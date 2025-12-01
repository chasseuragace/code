import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Query, 
  Body, 
  HttpCode, 
  ParseUUIDPipe, 
  ForbiddenException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiOkResponse, ApiBody, ApiBadRequestResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobPostingService } from '../domain/domain.service';
import { InterviewHelperService } from '../domain/interview-helper.service';
import { ApplicationService } from '../application/application.service';
import { CandidateService } from '../candidate/candidate.service';
import { JobApplication } from '../application/job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
import { JobPosting } from '../domain/domain.entity';

import {
  GetJobCandidatesQueryDto,
  GetJobCandidatesResponseDto,
  BulkShortlistDto,
  BulkRejectDto,
  BulkScheduleInterviewDto,
  BulkActionResponseDto,
  JobDetailsWithAnalyticsDto,
  JobCandidateDto,
  InterviewStatsDto
} from './dto/job-candidates.dto';
import { CandidateFullDetailsDto } from './dto/candidate-full-details.dto';

@ApiTags('Agency Job Candidates')
@Controller('agencies/:license/jobs')
export class JobCandidatesController {
  constructor(
    private readonly jobPostingService: JobPostingService,
    private readonly interviewHelperService: InterviewHelperService,
    private readonly applicationService: ApplicationService,
    private readonly candidateService: CandidateService,
    @InjectRepository(JobApplication)
    private readonly jobAppRepo: Repository<JobApplication>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(CandidateJobProfile)
    private readonly candidateJobProfileRepo: Repository<CandidateJobProfile>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
  ) {}

  /**
   * Get job details with analytics
   * GET /agencies/:license/jobs/:jobId/details
   */
  @Get(':jobId/details')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get job details with analytics',
    description: 'Returns job posting details along with real-time analytics about applications. The tags field contains actual candidate skills (not job tags) for use as filter options.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiOkResponse({ 
    description: 'Job details with analytics',
    type: JobDetailsWithAnalyticsDto 
  })
  async getJobDetailsWithAnalytics(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<JobDetailsWithAnalyticsDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Get analytics counts
    const analytics = await this.jobAppRepo
      .createQueryBuilder('ja')
      .select('COUNT(*)', 'total_applicants')
      .addSelect("COUNT(CASE WHEN ja.status = 'shortlisted' THEN 1 END)", 'shortlisted_count')
      .addSelect("COUNT(CASE WHEN ja.status = 'interview_scheduled' OR ja.status = 'interview_rescheduled' THEN 1 END)", 'scheduled_count')
      .addSelect("COUNT(CASE WHEN ja.status = 'interview_passed' THEN 1 END)", 'passed_count')
      .where('ja.job_posting_id = :jobId', { jobId })
      .getRawOne();

    const contract = job.contracts?.[0];
    
    // Handle date conversion - posting_date_ad might be string or Date
    let postedDate: string;
    if (job.posting_date_ad) {
      postedDate = job.posting_date_ad instanceof Date 
        ? job.posting_date_ad.toISOString() 
        : job.posting_date_ad;
    } else {
      postedDate = job.created_at instanceof Date 
        ? job.created_at.toISOString() 
        : job.created_at;
    }

    // Get available candidate skills for filtering (replaces job tags)
    // This provides actual skills that can be used to filter candidates
    const applications = await this.jobAppRepo
      .createQueryBuilder('ja')
      .where('ja.job_posting_id = :jobId', { jobId })
      .andWhere('ja.status = :stage', { stage: 'applied' })
      .getMany();

    let availableSkills: string[] = [];
    
    if (applications.length > 0) {
      const candidateIds = applications.map(app => app.candidate_id);
      
      // Fetch job profiles for these candidates
      const jobProfiles = await this.candidateJobProfileRepo
        .createQueryBuilder('cjp')
        .where('cjp.candidate_id IN (:...candidateIds)', { candidateIds })
        .orderBy('cjp.updated_at', 'DESC')
        .getMany();

      // Extract unique skills
      const skillsSet = new Set<string>();
      const profileMap = new Map<string, any>();
      
      // Get most recent profile for each candidate
      for (const profile of jobProfiles) {
        if (!profileMap.has(profile.candidate_id)) {
          profileMap.set(profile.candidate_id, profile.profile_blob);
        }
      }

      // Extract skills from all profiles
      for (const profileBlob of profileMap.values()) {
        if (Array.isArray(profileBlob.skills)) {
          profileBlob.skills.forEach((s: any) => {
            const skill = typeof s === 'string' ? s : s?.title;
            if (skill && typeof skill === 'string' && skill.trim().length > 0) {
              skillsSet.add(skill);
            }
          });
        }
      }

      availableSkills = Array.from(skillsSet).sort();
    }

    return {
      id: job.id,
      title: job.posting_title,
      company: contract?.employer?.company_name || 'N/A',
      location: {
        city: job.city || 'N/A',
        country: job.country || 'N/A',
      },
      posted_date: postedDate,
      description: job.notes || '',
      requirements: job.education_requirements || [],
      tags: availableSkills, // CHANGED: Now returns candidate skills instead of job.skills
      is_active: job.is_active, // Job posting status (active/closed)
      analytics: {
        view_count: (job as any).view_count || 0,
        total_applicants: parseInt(analytics.total_applicants) || 0,
        shortlisted_count: parseInt(analytics.shortlisted_count) || 0,
        scheduled_count: parseInt(analytics.scheduled_count) || 0,
        passed_count: parseInt(analytics.passed_count) || 0,
      },
    };
  }

  /**
   * Get candidates for a job with filtering and pagination
   * GET /agencies/:license/jobs/:jobId/candidates
   */
  @Get(':jobId/candidates')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get candidates for a job with filtering',
    description: 'Returns paginated list of candidates who applied to this job, with optional skill filtering and sorting by priority score'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiOkResponse({ 
    description: 'Paginated list of candidates',
    type: GetJobCandidatesResponseDto 
  })
  async getJobCandidates(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query() query: GetJobCandidatesQueryDto,
  ): Promise<GetJobCandidatesResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { stage, limit = 10, offset = 0, skills, sort_by = 'priority_score', sort_order = 'desc', interview_filter, date_alias, date_from, date_to, search } = query;

    // Parse skills filter
    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Fetch applications for this job and stage with interview details
    let applications = await this.jobAppRepo
      .createQueryBuilder('ja')
      .leftJoinAndSelect('ja.interview_details', 'interview')
      .where('ja.job_posting_id = :jobId', { jobId })
      .andWhere('ja.status = :stage', { stage })
      .getMany();

    // Apply interview filtering if requested (only for interview_scheduled stage)
    if (stage === 'interview_scheduled' && interview_filter && interview_filter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      applications = applications.filter(app => {
        const interview = app.interview_details?.[0];
        if (!interview || !interview.interview_date_ad) return false;
        
        const interviewDate = new Date(interview.interview_date_ad);
        const interviewDateTime = new Date(interviewDate);
        
        // Parse time if available (format: "HH:MM:SS" or "HH:MM")
        if (interview.interview_time) {
          const timeParts = interview.interview_time.toString().split(':');
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          interviewDateTime.setHours(hours, minutes, 0, 0);
        }
        
        switch (interview_filter) {
          case 'today':
            return interviewDate >= today && interviewDate < tomorrow;
          
          case 'tomorrow':
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            return interviewDate >= tomorrow && interviewDate < dayAfterTomorrow;
          
          case 'unattended':
            // Interview time + duration + 30min grace period has passed
            const duration = interview.duration_minutes || 60;
            const gracePeriod = 30; // minutes
            const endTime = new Date(interviewDateTime);
            endTime.setMinutes(endTime.getMinutes() + duration + gracePeriod);
            return now > endTime;
          
          default:
            return true;
        }
      });
    }

    // Apply date filtering (date_alias takes precedence over date_from/date_to)
    if (stage === 'interview_scheduled' && (date_alias || date_from || date_to)) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let filterStartDate: Date | null = null;
      let filterEndDate: Date | null = null;

      // Process date_alias first (takes precedence)
      if (date_alias) {
        switch (date_alias) {
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
            // Get Monday of current week
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            filterStartDate = new Date(today);
            filterStartDate.setDate(filterStartDate.getDate() + mondayOffset);
            // Get Sunday of current week
            filterEndDate = new Date(filterStartDate);
            filterEndDate.setDate(filterEndDate.getDate() + 7);
            break;
          
          case 'next_week':
            // Get Monday of next week
            const currentDayOfWeek = today.getDay();
            const nextMondayOffset = currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek;
            filterStartDate = new Date(today);
            filterStartDate.setDate(filterStartDate.getDate() + nextMondayOffset);
            // Get Sunday of next week
            filterEndDate = new Date(filterStartDate);
            filterEndDate.setDate(filterEndDate.getDate() + 7);
            break;
          
          case 'this_month':
            // First day of current month
            filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
            // First day of next month
            filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            break;
        }
      } else if (date_from || date_to) {
        // Use custom date range
        if (date_from) {
          filterStartDate = new Date(date_from);
          filterStartDate.setHours(0, 0, 0, 0);
        }
        if (date_to) {
          filterEndDate = new Date(date_to);
          filterEndDate.setHours(23, 59, 59, 999);
        }
      }

      // Apply date filter
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

    // Apply search filter (candidate name, phone, or interviewer)
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase().trim();
      const candidateIds = applications.map(app => app.candidate_id);
      
      // Fetch candidate data for search
      const candidatesForSearch = await this.candidateRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...candidateIds)', { candidateIds })
        .getMany();
      
      const candidateMap = new Map(candidatesForSearch.map(c => [c.id, c]));
      
      applications = applications.filter(app => {
        const candidate = candidateMap.get(app.candidate_id);
        const interview = app.interview_details?.[0];
        
        // Search in candidate name
        if (candidate?.full_name?.toLowerCase().includes(searchLower)) return true;
        
        // Search in candidate phone
        if (candidate?.phone?.toLowerCase().includes(searchLower)) return true;
        
        // Search in interviewer name
        if (interview?.contact_person?.toLowerCase().includes(searchLower)) return true;
        
        return false;
      });
    }

    if (applications.length === 0) {
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

    // Fetch candidates
    const candidateIds = applications.map(app => app.candidate_id);
    const candidatesData = await this.candidateRepo
      .createQueryBuilder('c')
      .where('c.id IN (:...candidateIds)', { candidateIds })
      .getMany();

    // Fetch job profiles for these candidates (most recent profile per candidate)
    const jobProfiles = await this.candidateJobProfileRepo
      .createQueryBuilder('cjp')
      .where('cjp.candidate_id IN (:...candidateIds)', { candidateIds })
      .orderBy('cjp.updated_at', 'DESC')
      .getMany();

    // Create maps for quick lookup
    const candidateMap = new Map(candidatesData.map(c => [c.id, c]));
    const profileMap = new Map<string, any>();
    
    // Get most recent profile for each candidate
    for (const profile of jobProfiles) {
      if (!profileMap.has(profile.candidate_id)) {
        profileMap.set(profile.candidate_id, profile.profile_blob);
      }
    }

    // Calculate priority score for each candidate
    const jobSkills = job.skills || [];
    const jobEducation = job.education_requirements || [];
    
    // Build candidate data with scores
    const candidatesWithScores = applications.map(app => {
      const candidate = candidateMap.get(app.candidate_id);
      if (!candidate) return null;

      const profileBlob = profileMap.get(app.candidate_id) || {};
      
      // Extract skills from profile blob
      const candidateSkills = Array.isArray(profileBlob.skills)
        ? profileBlob.skills
            .map((s: any) => (typeof s === 'string' ? s : s?.title))
            .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
        : [];
      
      const candidateSkillsLower = candidateSkills.map((s: string) => s.toLowerCase());

      // Apply skill filtering (AND logic)
      if (skillsArray.length > 0) {
        const hasAllSkills = skillsArray.every(requiredSkill => 
          candidateSkillsLower.includes(requiredSkill.toLowerCase())
        );
        if (!hasAllSkills) {
          return null; // Filter out this candidate
        }
      }

      // Extract education from profile blob
      const candidateEducation = Array.isArray(profileBlob.education)
        ? profileBlob.education
            .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
            .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
        : [];
      const candidateEducationLower = candidateEducation.map((e: string) => e.toLowerCase());

      // Calculate priority score
      let parts = 0;
      let sumPct = 0;

      // Skills overlap
      if (jobSkills.length > 0) {
        const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
        const intersection = candidateSkillsLower.filter(s => jobSkillsLower.includes(s));
        const pct = intersection.length / jobSkills.length;
        parts++;
        sumPct += pct;
      }

      // Education overlap
      if (jobEducation.length > 0) {
        const jobEducationLower = jobEducation.map(e => e.toLowerCase());
        const intersection = candidateEducationLower.filter(e => jobEducationLower.includes(e));
        const pct = intersection.length / jobEducation.length;
        parts++;
        sumPct += pct;
      }

      // Experience requirements (if specified)
      const expReq = job.experience_requirements as any;
      if (expReq && (typeof expReq.min_years === 'number' || typeof expReq.max_years === 'number')) {
        // Extract years from profile blob
        const years = Array.isArray(profileBlob.skills)
          ? profileBlob.skills.reduce((acc: number, s: any) => {
              if (typeof s?.duration_months === 'number') return acc + s.duration_months / 12;
              if (typeof s?.years === 'number') return acc + s.years;
              return acc;
            }, 0)
          : 0;
        
        const minOk = typeof expReq.min_years === 'number' ? years >= expReq.min_years : true;
        const maxOk = typeof expReq.max_years === 'number' ? years <= expReq.max_years : true;
        const pct = minOk && maxOk ? 1 : 0;
        parts++;
        sumPct += pct;
      }

      const priority_score = parts > 0 ? Math.round((sumPct / parts) * 100) : 0;

      return {
        application: app,
        candidate,
        profileBlob,
        candidateSkills,
        priority_score,
      };
    }).filter(Boolean) as Array<{ 
      application: JobApplication; 
      candidate: Candidate; 
      profileBlob: any;
      candidateSkills: string[];
      priority_score: number 
    }>;

    // Sort by priority score or other fields
    candidatesWithScores.sort((a, b) => {
      if (sort_by === 'priority_score') {
        return sort_order === 'desc' 
          ? b.priority_score - a.priority_score 
          : a.priority_score - b.priority_score;
      } else if (sort_by === 'applied_at') {
        const dateA = new Date(a.application.created_at).getTime();
        const dateB = new Date(b.application.created_at).getTime();
        return sort_order === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sort_by === 'name') {
        return sort_order === 'desc'
          ? b.candidate.full_name.localeCompare(a.candidate.full_name)
          : a.candidate.full_name.localeCompare(b.candidate.full_name);
      }
      return 0;
    });

    // Get total after filtering
    const total = candidatesWithScores.length;

    // Apply pagination
    const paginatedResults = candidatesWithScores.slice(offset, offset + limit);

    // Map to response DTOs
    const candidateDtos: JobCandidateDto[] = paginatedResults.map(({ application, candidate, profileBlob, candidateSkills, priority_score }) => {
      // Extract address from candidate
      const address = candidate.address as any;
      const city = address?.municipality || address?.district || 'N/A';
      const country = 'Nepal'; // Default, could be in profile

      // Extract interview data if available
      const interview = application.interview_details?.[0];

      return {
        id: candidate.id,
        name: candidate.full_name,
        priority_score,
        location: {
          city,
          country,
        },
        phone: candidate.phone,
        email: candidate.email || 'N/A',
        experience: profileBlob.experience || 'N/A',
        skills: candidateSkills,
        applied_at: application.created_at.toISOString(),
        application_id: application.id,
        documents: (application as any).documents || [],
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
          required_documents: interview.required_documents || []
        } : null
      };
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
  }

  /**
   * Bulk shortlist candidates
   * POST /agencies/:license/jobs/:jobId/candidates/bulk-shortlist
   */
  @Post(':jobId/candidates/bulk-shortlist')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bulk shortlist candidates',
    description: 'Move multiple candidates from "applied" to "shortlisted" stage in a single operation'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiBody({ type: BulkShortlistDto })
  @ApiOkResponse({ 
    description: 'Bulk shortlist result',
    type: BulkActionResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid request or candidates not in "applied" stage' })
  async bulkShortlist(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() body: BulkShortlistDto,
  ): Promise<BulkActionResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { candidate_ids } = body;
    const failed: string[] = [];
    const errors: Record<string, string> = {};
    let updated_count = 0;

    // Process each candidate
    for (const candidateId of candidate_ids) {
      try {
        // Find application for this candidate and job
        const application = await this.jobAppRepo.findOne({
          where: {
            candidate_id: candidateId,
            job_posting_id: jobId,
          },
        });

        if (!application) {
          failed.push(candidateId);
          errors[candidateId] = 'Application not found';
          continue;
        }

        // Only shortlist if currently in "applied" stage
        if (application.status !== 'applied') {
          failed.push(candidateId);
          errors[candidateId] = `Cannot shortlist from "${application.status}" stage`;
          continue;
        }

        // Update to shortlisted
        await this.applicationService.updateStatus(application.id, 'shortlisted', {
          note: 'Bulk shortlisted via agency workflow',
          updatedBy: 'agency',
        });

        updated_count++;
      } catch (error) {
        failed.push(candidateId);
        errors[candidateId] = error.message || 'Unknown error';
      }
    }

    return {
      success: failed.length === 0,
      updated_count,
      failed: failed.length > 0 ? failed : undefined,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Get available skills for filtering
   * GET /agencies/:license/jobs/:jobId/candidates/available-skills
   */
  @Get(':jobId/candidates/available-skills')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get available skills for filtering candidates',
    description: 'Returns unique skills from candidates who applied to this job. Use these as filter options instead of job tags.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiQuery({ name: 'stage', required: false, description: 'Filter by stage (default: applied)', example: 'applied' })
  @ApiOkResponse({ 
    description: 'List of unique skills from candidates',
    schema: {
      type: 'object',
      properties: {
        available_skills: {
          type: 'array',
          items: { type: 'string' },
          example: ['Electrical Wiring', 'English (Language)', 'Cooking']
        },
        total_candidates: {
          type: 'number',
          example: 45
        }
      }
    }
  })
  async getAvailableSkills(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('stage') stage: string = 'applied',
  ): Promise<{ available_skills: string[]; total_candidates: number }> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Fetch applications for this job and stage
    const applications = await this.jobAppRepo
      .createQueryBuilder('ja')
      .where('ja.job_posting_id = :jobId', { jobId })
      .andWhere('ja.status = :stage', { stage })
      .getMany();

    if (applications.length === 0) {
      return {
        available_skills: [],
        total_candidates: 0,
      };
    }

    // Fetch candidates
    const candidateIds = applications.map(app => app.candidate_id);
    
    // Fetch job profiles for these candidates
    const jobProfiles = await this.candidateJobProfileRepo
      .createQueryBuilder('cjp')
      .where('cjp.candidate_id IN (:...candidateIds)', { candidateIds })
      .orderBy('cjp.updated_at', 'DESC')
      .getMany();

    // Extract unique skills
    const skillsSet = new Set<string>();
    const profileMap = new Map<string, any>();
    
    // Get most recent profile for each candidate
    for (const profile of jobProfiles) {
      if (!profileMap.has(profile.candidate_id)) {
        profileMap.set(profile.candidate_id, profile.profile_blob);
      }
    }

    // Extract skills from all profiles
    for (const profileBlob of profileMap.values()) {
      if (Array.isArray(profileBlob.skills)) {
        profileBlob.skills.forEach((s: any) => {
          const skill = typeof s === 'string' ? s : s?.title;
          if (skill && typeof skill === 'string' && skill.trim().length > 0) {
            skillsSet.add(skill);
          }
        });
      }
    }

    // Convert to sorted array
    const available_skills = Array.from(skillsSet).sort();

    return {
      available_skills,
      total_candidates: applications.length,
    };
  }

  /**
   * Bulk reject candidates
   * POST /agencies/:license/jobs/:jobId/candidates/bulk-reject
   */
  @Post(':jobId/candidates/bulk-reject')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bulk reject candidates',
    description: 'Move multiple candidates to "withdrawn" stage (rejected) in a single operation'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiBody({ type: BulkRejectDto })
  @ApiOkResponse({ 
    description: 'Bulk reject result',
    type: BulkActionResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  async bulkReject(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() body: BulkRejectDto,
  ): Promise<BulkActionResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { candidate_ids, reason } = body;
    const failed: string[] = [];
    const errors: Record<string, string> = {};
    let updated_count = 0;

    // Process each candidate
    for (const candidateId of candidate_ids) {
      try {
        // Find application for this candidate and job
        const application = await this.jobAppRepo.findOne({
          where: {
            candidate_id: candidateId,
            job_posting_id: jobId,
          },
        });

        if (!application) {
          failed.push(candidateId);
          errors[candidateId] = 'Application not found';
          continue;
        }

        // Reject by withdrawing the application
        await this.applicationService.withdraw(
          candidateId,
          jobId,
          {
            note: reason || 'Bulk rejected via agency workflow',
            updatedBy: 'agency',
          }
        );

        updated_count++;
      } catch (error) {
        failed.push(candidateId);
        errors[candidateId] = error.message || 'Unknown error';
      }
    }

    return {
      success: failed.length === 0,
      updated_count,
      failed: failed.length > 0 ? failed : undefined,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Bulk schedule interviews
   * POST /agencies/:license/jobs/:jobId/candidates/bulk-schedule-interview
   */
  @Post(':jobId/candidates/bulk-schedule-interview')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bulk schedule interviews for multiple candidates',
    description: 'Schedule interviews for multiple candidates in a single operation. Only candidates in "shortlisted" stage can be scheduled.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiBody({ type: BulkScheduleInterviewDto })
  @ApiOkResponse({ 
    description: 'Bulk schedule result',
    type: BulkActionResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid request or candidates not in "shortlisted" stage' })
  async bulkScheduleInterview(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() body: BulkScheduleInterviewDto,
  ): Promise<BulkActionResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { candidate_ids, ...interviewData } = body;
    const failed: string[] = [];
    const errors: Record<string, string> = {};
    let scheduled_count = 0;

    // Process each candidate
    for (const candidateId of candidate_ids) {
      try {
        // Find application for this candidate and job
        const application = await this.jobAppRepo.findOne({
          where: {
            candidate_id: candidateId,
            job_posting_id: jobId,
          },
        });

        if (!application) {
          failed.push(candidateId);
          errors[candidateId] = 'Application not found';
          continue;
        }

        // Only schedule if currently in "shortlisted" stage
        if (application.status !== 'shortlisted') {
          failed.push(candidateId);
          errors[candidateId] = `Cannot schedule from "${application.status}" stage`;
          continue;
        }

        // Schedule interview
        await this.applicationService.scheduleInterview(
          application.id,
          {
            interview_date_ad: interviewData.interview_date_ad,
            interview_date_bs: interviewData.interview_date_bs,
            interview_time: interviewData.interview_time,
            duration_minutes: interviewData.duration_minutes || 60,
            location: interviewData.location,
            contact_person: interviewData.contact_person,
            required_documents: interviewData.required_documents,
            notes: interviewData.notes,
          },
          {
            note: 'Bulk scheduled via agency workflow',
            updatedBy: interviewData.updatedBy || 'agency',
          }
        );

        scheduled_count++;
      } catch (error) {
        failed.push(candidateId);
        errors[candidateId] = error.message || 'Unknown error';
      }
    }

    return {
      success: failed.length === 0,
      updated_count: scheduled_count,
      failed: failed.length > 0 ? failed : undefined,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Get complete candidate details for a job application (unified endpoint)
   * GET /agencies/:license/jobs/:jobId/candidates/:candidateId/details
   */
  @Get(':jobId/candidates/:candidateId/details')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get complete candidate details for a job application',
    description: 'Returns all candidate information in a single response: profile, job profile, application history, and interview details. Documents are fetched separately.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID (UUID)', example: 'candidate-uuid' })
  @ApiOkResponse({ 
    description: 'Complete candidate details',
    type: CandidateFullDetailsDto 
  })
  async getCandidateFullDetails(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
  ): Promise<CandidateFullDetailsDto> {
    // 1. Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // 2. Fetch candidate basic info
    const candidate = await this.candidateService.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // 3. Fetch job profile (most recent)
    const jobProfiles = await this.candidateJobProfileRepo.find({
      where: { candidate_id: candidateId },
      order: { updated_at: 'DESC' },
      take: 1,
    });
    const profile = jobProfiles[0];
    const profileBlob = (profile?.profile_blob as any) || {};

    // 4. Fetch application with history
    const application = await this.jobAppRepo.findOne({
      where: {
        candidate_id: candidateId,
        job_posting_id: jobId,
      },
      relations: ['interview_details', 'interview_details.expenses'],
    });

    if (!application) {
      throw new NotFoundException('Application not found for this candidate and job');
    }

    // 5. Get interview details (if exists)
    const interview = application.interview_details?.[0] || null;

    // 6. Get job context
    const contract = job.contracts[0];
    const position = contract?.positions?.find(p => p.id === application.position_id);

    // 7. Format address with formatted field
    const formatAddress = (addr: any): any => {
      if (!addr) return null;
      
      const parts: string[] = [];
      if (addr.name) parts.push(addr.name);
      if (addr.ward) parts.push(`Ward ${addr.ward}`);
      if (addr.municipality && addr.municipality !== addr.name) parts.push(addr.municipality);
      if (addr.district && addr.district !== addr.municipality) parts.push(addr.district);
      if (addr.province) parts.push(`${addr.province} Province`);
      
      return {
        formatted: parts.length > 0 ? parts.join(', ') : null,
        name: addr.name || null,
        province: addr.province || null,
        district: addr.district || null,
        municipality: addr.municipality || null,
        ward: addr.ward || null,
      };
    };

    // 8. Extract and flatten skills to array of strings
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];

    // 9. Extract education
    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education.map((e: any) => {
          if (typeof e === 'string') {
            return { degree: e, institution: null, year_completed: null };
          }
          return {
            degree: e.degree || e.title || e.name || 'Unknown',
            institution: e.institution || null,
            year_completed: e.year_completed || null,
          };
        })
      : [];

    // 10. Extract trainings
    const trainings = Array.isArray(profileBlob.trainings)
      ? profileBlob.trainings.map((t: any) => ({
          title: t.title || 'Unknown',
          provider: t.provider || null,
          hours: t.hours || null,
          certificate: t.certificate || false,
        }))
      : [];

    // 11. Extract experience
    const experience = Array.isArray(profileBlob.experience)
      ? profileBlob.experience.map((exp: any) => ({
          title: exp.title || 'Unknown',
          employer: exp.employer || null,
          start_date_ad: exp.start_date_ad || null,
          end_date_ad: exp.end_date_ad || null,
          months: exp.months || exp.duration_months || null,
          description: exp.description || null,
        }))
      : [];

    // 12. Build and return response
    return {
      candidate: {
        id: candidate.id,
        name: candidate.full_name,
        phone: candidate.phone,
        email: candidate.email || null,
        gender: candidate.gender || null,
        age: candidate.age || null,
        address: formatAddress(candidate.address),
        passport_number: candidate.passport_number || null,
        profile_image: candidate.profile_image || null,
        is_active: candidate.is_active,
      },
      job_profile: {
        summary: profileBlob.summary || null,
        skills,
        education,
        trainings,
        experience,
      },
      job_context: {
        job_id: job.id,
        job_title: job.posting_title,
        job_company: contract?.employer?.company_name || null,
        job_location: {
          city: job.city || null,
          country: job.country,
        },
      },
      application: {
        id: application.id,
        position_id: application.position_id,
        position_title: position?.title || null,
        status: application.status,
        created_at: application.created_at.toISOString(),
        updated_at: application.updated_at.toISOString(),
        history_blob: application.history_blob || [],
      },
      interview: interview ? {
        id: interview.id,
        interview_date_ad: interview.interview_date_ad 
          ? (interview.interview_date_ad instanceof Date 
              ? interview.interview_date_ad.toISOString() 
              : new Date(interview.interview_date_ad).toISOString())
          : null,
        interview_date_bs: interview.interview_date_bs || null,
        interview_time: interview.interview_time ? String(interview.interview_time) : null,
        location: interview.location || null,
        contact_person: interview.contact_person || null,
        required_documents: interview.required_documents || null,
        notes: interview.notes || null,
        expenses: (interview.expenses || []).map(exp => ({
          expense_type: exp.expense_type,
          who_pays: exp.who_pays,
          is_free: exp.is_free,
          amount: exp.amount || null,
          currency: exp.currency || null,
          refundable: exp.refundable || false,
          notes: exp.notes || null,
        })),
      } : null,
    };
  }

  /**
   * Get interview statistics for a job
   * GET /agencies/:license/jobs/:jobId/interview-stats
   */
  @Get(':jobId/interview-stats')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get interview statistics for a job',
    description: 'Returns summary statistics for interviews including counts by status, date, and result. Supports optional date range filtering.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiQuery({ 
    name: 'date_range', 
    required: false, 
    description: 'Date range filter',
    enum: ['today', 'week', 'month', 'all'],
    example: 'all'
  })
  @ApiOkResponse({ 
    description: 'Interview statistics',
    type: InterviewStatsDto 
  })
  async getInterviewStats(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Query('date_range') dateRange?: 'today' | 'week' | 'month' | 'all',
  ): Promise<InterviewStatsDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingById(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Get statistics from interview helper service
    const stats = await this.interviewHelperService.getInterviewStatsForJob(jobId, dateRange || 'all');

    return stats;
  }
}
