import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  Query, 
  Body, 
  HttpCode, 
  ParseUUIDPipe, 
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiOkResponse, ApiBody, ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';

import { JobPostingService } from '../domain/domain.service';
import { InterviewHelperService } from '../domain/interview-helper.service';
import { ApplicationService } from '../application/application.service';
import { CandidateService } from '../candidate/candidate.service';
import { DocumentTypeService } from '../candidate/document-type.service';
import { ImageUploadService, UploadType } from '../shared/image-upload.service';
import { FitnessScoreService } from '../shared/fitness-score.service';
import { AuditService } from '../audit/audit.service';
import { AuditActions, AuditCategories } from '../audit/audit.entity';
import { JobApplication } from '../application/job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
import { JobPosting } from '../domain/domain.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';

import {
  GetJobCandidatesQueryDto,
  GetJobCandidatesResponseDto,
  BulkShortlistDto,
  BulkRejectDto,
  BulkScheduleInterviewDto,
  MultiBatchScheduleDto,
  BulkActionResponseDto,
  JobDetailsWithAnalyticsDto,
  JobCandidateDto,
  InterviewStatsDto
} from './dto/job-candidates.dto';
import { CandidateFullDetailsDto } from './dto/candidate-full-details.dto';
import { CandidateDocumentResponseDto, UploadResponseDto } from '../candidate/dto/candidate-document.dto';
import { DocumentsWithSlotsResponseDto } from '../candidate/dto/document-type.dto';

@ApiTags('Agency Job Candidates')
@Controller('agencies/:license/jobs')
export class JobCandidatesController {
  constructor(
    private readonly jobPostingService: JobPostingService,
    private readonly interviewHelperService: InterviewHelperService,
    private readonly applicationService: ApplicationService,
    private readonly candidateService: CandidateService,
    private readonly documentTypeService: DocumentTypeService,
    private readonly imageUploadService: ImageUploadService,
    private readonly fitnessScoreService: FitnessScoreService,
    private readonly auditService: AuditService,
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
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
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
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { stage, limit = 10, offset = 0, skills, sort_by = 'priority_score', sort_order = 'desc', interview_filter, date_alias, date_from, date_to, search } = query;

    // Parse skills filter
    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Fetch applications for this job and stage with interview details and position data
    // When stage is 'interview_scheduled', also include 'interview_rescheduled' status
    let applications: JobApplication[];
    if (stage === 'interview_scheduled') {
      applications = await this.jobAppRepo
        .createQueryBuilder('ja')
        .leftJoinAndSelect('ja.interview_details', 'interview')
        .leftJoinAndSelect('ja.position', 'position')
        .where('ja.job_posting_id = :jobId', { jobId })
        .andWhere('(ja.status = :stage OR ja.status = :rescheduledStage)', { 
          stage: 'interview_scheduled',
          rescheduledStage: 'interview_rescheduled'
        })
        .getMany();
    } else {
      applications = await this.jobAppRepo
        .createQueryBuilder('ja')
        .leftJoinAndSelect('ja.interview_details', 'interview')
        .leftJoinAndSelect('ja.position', 'position')
        .where('ja.job_posting_id = :jobId', { jobId })
        .andWhere('ja.status = :stage', { stage })
        .getMany();
    }

    // Apply interview filtering if requested (only for interview_scheduled stage)
    if (stage === 'interview_scheduled' && interview_filter && interview_filter !== 'all') {
      // Get current time from database to ensure timezone consistency
      const dbTimeResult = await this.jobAppRepo.query('SELECT NOW() as now');
      const dbNow = new Date(dbTimeResult[0].now);
      
      // Import timezone utilities
      const { getNepalNow, getNepalToday, getNepalTomorrow, getNepalDayAfterTomorrow, parseInterviewDateTime, getInterviewEndTime, isInterviewToday, isInterviewTomorrow, isInterviewUnattended } = await import('../../shared/timezone.util');
      
      const nepalNow = getNepalNow(dbNow);
      const today = getNepalToday(nepalNow);
      const tomorrow = getNepalTomorrow(today);
      const dayAfterTomorrow = getNepalDayAfterTomorrow(tomorrow);
      
      applications = applications.filter(app => {
        const interview = app.interview_details?.[0];
        if (!interview || !interview.interview_date_ad) return false;
        
        const interviewDate = new Date(interview.interview_date_ad);
        const interviewDateTime = parseInterviewDateTime(interview.interview_date_ad, interview.interview_time);
        const endTime = getInterviewEndTime(interviewDateTime, interview.duration_minutes);
        
        switch (interview_filter) {
          case 'today':
            // Today filter: scheduled for today AND hasn't passed grace period yet
            const todayMatch = isInterviewToday(interviewDate, today, tomorrow);
            const notYetPassed = nepalNow <= endTime;
            return todayMatch && notYetPassed;
          
          case 'tomorrow':
            return isInterviewTomorrow(interviewDate, tomorrow, dayAfterTomorrow);
          
          case 'unattended':
            // Unattended: scheduled for today AND has passed grace period
            const todayUnattended = isInterviewToday(interviewDate, today, tomorrow);
            const hasPassed = isInterviewUnattended(interviewDateTime, nepalNow, interview.duration_minutes);
            return todayUnattended && hasPassed;
          
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

      // Calculate priority score using unified FitnessScoreService
      const candidateProfile = this.fitnessScoreService.extractCandidateProfile(profileBlob);
      const jobRequirements = this.fitnessScoreService.extractJobRequirements(job);
      const fitnessResult = this.fitnessScoreService.calculateScore(candidateProfile, jobRequirements);
      const priority_score = fitnessResult.score;

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

    // Fetch salary conversions for positions in paginated results
    const positionIds = paginatedResults
      .map(r => (r.application as any).position?.id)
      .filter(Boolean);
    
    const salaryConversions = positionIds.length > 0
      ? await this.jobAppRepo.query(
          `SELECT job_position_id, converted_amount, converted_currency, conversion_rate 
           FROM salary_conversions 
           WHERE job_position_id = ANY($1) 
           ORDER BY conversion_date DESC`,
          [positionIds]
        )
      : [];

    const conversionMap = new Map<string, any>();
    for (const conversion of salaryConversions) {
      if (!conversionMap.has(conversion.job_position_id)) {
        conversionMap.set(conversion.job_position_id, conversion);
      }
    }

    // Map to response DTOs
    const candidateDtos: JobCandidateDto[] = paginatedResults.map(({ application, candidate, profileBlob, priority_score }) => {
      // Extract address from candidate
      const address = candidate.address as any;
      const addressStr = address?.name || address?.municipality || address?.district || 'N/A';

      // Extract interview data if available
      const interview = application.interview_details?.[0];

      // Extract position data if available
      const position = (application as any).position;
      
      // Get salary conversion if available
      const conversion = position ? conversionMap.get(position.id) : null;

      const base: JobCandidateDto = {
        id: candidate.id,
        name: candidate.full_name,
        gender: candidate.gender || undefined,
        priority_score,
        address: addressStr,
        phone: candidate.phone,
        email: candidate.email || undefined,
        // Provide a minimal placeholder position when missing to satisfy DTO type
        position: position
          ? {
              id: position.id,
              title: position.title,
              salary: {
                amount: Number(position.monthly_salary_amount),
                currency: position.salary_currency,
                converted_amount: conversion?.converted_amount ? Number(conversion.converted_amount) : undefined,
                converted_currency: conversion?.converted_currency || undefined,
                conversion_rate: conversion?.conversion_rate ? Number(conversion.conversion_rate) : undefined,
              },
            }
          : {
              id: 'unknown',
              title: 'Unknown Position',
              salary: {
                amount: 0,
                currency: 'N/A',
              },
            },
        applied_at: application.created_at.toISOString(),
        application_id: application.id,
        status: application.status,
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
        } : null,
      };

      return base;
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    @Req() req: any,
  ): Promise<BulkActionResponseDto> {
    const user = req.user as User;
    
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const { application_ids } = body;
    const failed: string[] = [];
    const errors: Record<string, string> = {};
    let updated_count = 0;

    // Process each application
    for (const applicationId of application_ids) {
      try {
        // Find application
        const application = await this.jobAppRepo.findOne({
          where: {
            id: applicationId,
            job_posting_id: jobId,
          },
        });

        if (!application) {
          failed.push(applicationId);
          errors[applicationId] = 'Application not found';
          continue;
        }

        // Update to shortlisted using the same method as individual shortlist
        await this.applicationService.updateStatus(application.id, 'shortlisted', {
          note: 'Bulk shortlisted via agency workflow',
          updatedBy: 'agency',
        }, user?.role);

        updated_count++;
      } catch (error) {
        failed.push(applicationId);
        errors[applicationId] = error.message || 'Unknown error';
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
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    @Req() req: any,
  ): Promise<BulkActionResponseDto> {
    const user = req.user as User;
    
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
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
          },
          user?.role
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    @Req() req: any,
  ): Promise<BulkActionResponseDto> {
    const user = req.user as User;
    
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
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
          },
          user?.role
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
   * Multi-batch schedule interviews
   * POST /agencies/:license/jobs/:jobId/candidates/multi-batch-schedule
   */
  @Post(':jobId/candidates/multi-batch-schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Schedule multiple batches of interviews in a single request',
    description: 'Schedule interviews for multiple batches of candidates. Each batch can have different date/time. Only candidates in "shortlisted" stage can be scheduled.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiBody({ type: MultiBatchScheduleDto })
  @ApiOkResponse({ 
    description: 'Multi-batch schedule result',
    type: BulkActionResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid request or candidates not in "shortlisted" stage' })
  async multiBatchScheduleInterview(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() body: MultiBatchScheduleDto,
    @Req() req: any,
  ): Promise<BulkActionResponseDto> {
    const user = req.user as User;
    
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    const failed: string[] = [];
    const errors: Record<string, string> = {};
    let scheduled_count = 0;

    // Process each batch
    for (const batch of body.batches) {
      // Parse the start time for this batch
      const duration = batch.duration_minutes || 60;
      let currentTimeOffset = 0; // Minutes to add to start time

      // Process each application in the batch with incremented time
      for (let i = 0; i < batch.application_ids.length; i++) {
        const applicationId = batch.application_ids[i];
        
        try {
          // Find application by ID
          const application = await this.jobAppRepo.findOne({
            where: {
              id: applicationId,
              job_posting_id: jobId,
            },
          });

          if (!application) {
            failed.push(applicationId);
            errors[applicationId] = 'Application not found';
            continue;
          }

          // Only schedule if currently in "shortlisted" stage
          if (application.status !== 'shortlisted') {
            failed.push(applicationId);
            errors[applicationId] = `Cannot schedule from "${application.status}" stage`;
            continue;
          }

          // Calculate incremented time for this candidate
          const incrementedTime = this.addMinutesToTime(batch.interview_time, currentTimeOffset);

          // Schedule interview with batch-specific data and incremented time
          await this.applicationService.scheduleInterview(
            application.id,
            {
              interview_date_ad: batch.interview_date_ad,
              interview_date_bs: batch.interview_date_bs,
              interview_time: incrementedTime,
              duration_minutes: duration,
              location: batch.location,
              contact_person: batch.contact_person,
              required_documents: batch.required_documents,
              notes: batch.notes,
            },
            {
              note: 'Multi-batch scheduled via agency workflow',
              updatedBy: body.updatedBy || 'agency',
            },
            user?.role
          );

          scheduled_count++;
          
          // Increment time offset for next candidate in this batch
          currentTimeOffset += duration;
        } catch (error) {
          failed.push(applicationId);
          errors[applicationId] = error.message || 'Unknown error';
          // Still increment time even if this candidate failed, to maintain spacing
          currentTimeOffset += duration;
        }
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
   * GET /agencies/:license/jobs/:jobId/candidates/:candidateId/details?application_id=...
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
  @ApiQuery({ name: 'application_id', required: true, description: 'Specific application ID to fetch', example: 'app-uuid' })
  @ApiOkResponse({ 
    description: 'Complete candidate details',
    type: CandidateFullDetailsDto 
  })
  async getCandidateFullDetails(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
    @Query('application_id', ParseUUIDPipe) applicationId: string,
  ): Promise<CandidateFullDetailsDto> {
    // 1. Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
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

    // 4. Fetch specific application by ID
    const application = await this.jobAppRepo.findOne({
      where: {
        id: applicationId,
        candidate_id: candidateId,
        job_posting_id: jobId,
      },
      relations: ['interview_details', 'interview_details.expenses'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
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

    // 8. Extract and format skills with experience details
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => {
            if (typeof s === 'string') {
              return { title: s, years: undefined, duration_months: undefined, formatted: s };
            }
            const title = s?.title || 'Unknown';
            const years = s?.years || undefined;
            const duration_months = s?.duration_months || undefined;
            
            // Format: "English (1 year, 3 months)" or "English (1 year)" or "English"
            let formatted = title;
            const parts: string[] = [];
            if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
            if (duration_months) parts.push(`${duration_months} month${duration_months > 1 ? 's' : ''}`);
            if (parts.length > 0) {
              formatted = `${title} (${parts.join(', ')})`;
            }
            
            return {
              title,
              years,
              duration_months,
              formatted,
            };
          })
          .filter((v: any) => v.title && v.title.trim().length > 0)
      : [];

    // 9. Extract and format education
    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education.map((e: any) => {
          const degree = e.degree || e.title || e.name || 'Unknown';
          const institution = e.institute || e.institution || undefined;
          const year_completed = e.year_completed || undefined;
          
          // Format: "SLC from Nepal School" or just "SLC"
          let formatted = degree;
          if (institution) {
            formatted = `${degree} from ${institution}`;
          }
          
          return {
            degree,
            institution,
            year_completed,
            formatted,
          };
        })
      : [];

    // 10. Extract and format trainings
    const trainings = Array.isArray(profileBlob.trainings)
      ? profileBlob.trainings.map((t: any) => {
          const title = t.title || 'Unknown';
          const provider = t.provider || undefined;
          const hours = t.hours || undefined;
          const certificate = t.certificate || false;
          
          // Format: "Cook - Kathmandu Kitchen (40 hours)" or "Cook (40 hours)" or "Cook"
          let formatted = title;
          const parts: string[] = [];
          if (provider) parts.push(provider);
          if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
          
          if (parts.length > 0) {
            formatted = `${title} - ${parts.join(' (')}${parts.length > 1 ? ')' : ''}`;
          }
          
          return {
            title,
            provider,
            hours,
            certificate,
            formatted,
          };
        })
      : [];

    // 11. Extract and format experience
    const experience = Array.isArray(profileBlob.experience)
      ? profileBlob.experience.map((exp: any) => {
          const title = exp.title || 'Unknown';
          const employer = exp.employer || undefined;
          const start_date_ad = exp.start_date_ad || undefined;
          const end_date_ad = exp.end_date_ad || undefined;
          const months = exp.months || exp.duration_months || undefined;
          const description = exp.description || undefined;
          
          // Format: "Mason at Local Construction (1 month)" or "Mason (1 month)" or "Mason"
          let formatted = title;
          const parts: string[] = [];
          if (employer) parts.push(`at ${employer}`);
          if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
          
          if (parts.length > 0) {
            formatted = `${title} (${parts.join(', ')})`;
          }
          
          return {
            title,
            employer,
            start_date_ad,
            end_date_ad,
            months,
            description,
            formatted,
          };
        })
      : [];

    // 12. Build and return response
    return {
      candidate: {
        id: candidate.id,
        name: candidate.full_name,
        phone: candidate.phone,
        email: candidate.email || null,
        gender: candidate.gender || null,
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
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Get statistics from interview helper service
    const stats = await this.interviewHelperService.getInterviewStatsForJob(jobId, dateRange || 'all');

    return stats;
  }

  /**
   * Helper method to add minutes to a time string
   * @param timeStr - Time string in format "HH:MM AM/PM" or "HH:MM:SS"
   * @param minutesToAdd - Number of minutes to add
   * @returns New time string in same format
   */
  private addMinutesToTime(timeStr: string, minutesToAdd: number): string {
    // Parse time string (supports "10:00 AM", "10:00:00", "14:30")
    let hours = 0;
    let minutes = 0;
    let isPM = false;

    // Check if time has AM/PM
    const hasAMPM = /AM|PM/i.test(timeStr);
    if (hasAMPM) {
      isPM = /PM/i.test(timeStr);
      const timePart = timeStr.replace(/\s*(AM|PM)/i, '').trim();
      const parts = timePart.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1] || '0', 10);
      
      // Convert to 24-hour format
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      // Already in 24-hour format
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1] || '0', 10);
    }

    // Add minutes
    minutes += minutesToAdd;
    
    // Handle overflow
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24; // Wrap around midnight

    // Format back to original format
    if (hasAMPM) {
      // Convert back to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      // Keep 24-hour format
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
  }

  // ============================================
  // CANDIDATE DOCUMENT MANAGEMENT (Agency-side)
  // ============================================

  /**
   * Get candidate documents with slots
   * GET /agencies/:license/jobs/:jobId/candidates/:candidateId/documents
   */
  @Get(':jobId/candidates/:candidateId/documents')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get candidate documents with upload slots',
    description: 'Returns all document types with upload status for a candidate. Agency can view documents for candidates who applied to their jobs.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID (UUID)', example: 'candidate-uuid' })
  @ApiOkResponse({ 
    description: 'Document slots with upload status',
    type: DocumentsWithSlotsResponseDto 
  })
  async getCandidateDocuments(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
  ): Promise<DocumentsWithSlotsResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Verify candidate has applied to this job
    const application = await this.jobAppRepo.findOne({
      where: { candidate_id: candidateId, job_posting_id: jobId },
    });
    if (!application) {
      throw new NotFoundException('Candidate has not applied to this job');
    }

    return await this.candidateService.getDocumentsWithSlots(candidateId);
  }

  /**
   * Upload document for candidate (agency-side)
   * POST /agencies/:license/jobs/:jobId/candidates/:candidateId/documents
   */
  @Post(':jobId/candidates/:candidateId/documents')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload document for candidate on behalf of agency',
    description: 'Agency can upload documents for candidates who have applied to their jobs. Useful for collecting documents during interview process.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID (UUID)', example: 'candidate-uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'document_type_id', 'name'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, JPEG, PNG)',
        },
        document_type_id: {
          type: 'string',
          format: 'uuid',
          description: 'Document type ID',
        },
        name: {
          type: 'string',
          description: 'Document name',
        },
        description: {
          type: 'string',
          description: 'Document description',
        },
        notes: {
          type: 'string',
          description: 'Additional notes (e.g., "Uploaded by agency during interview")',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Document uploaded successfully', type: CandidateDocumentResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid document type or missing required fields' })
  async uploadCandidateDocument(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { document_type_id: string; name: string; description?: string; notes?: string },
    @Req() req: Request,
  ): Promise<CandidateDocumentResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Verify candidate has applied to this job
    const application = await this.jobAppRepo.findOne({
      where: { candidate_id: candidateId, job_posting_id: jobId },
    });
    if (!application) {
      throw new NotFoundException('Candidate has not applied to this job');
    }

    // Verify candidate exists
    const candidate = await this.candidateService.findById(candidateId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Validate document_type_id
    if (!body.document_type_id) {
      throw new BadRequestException('document_type_id is required');
    }

    // Check if document already exists for this type - agency cannot replace existing documents
    const existingDocs = await this.candidateService.getDocumentsWithSlots(candidateId);
    const existingDoc = existingDocs.data?.find(
      slot => slot.document_type?.id === body.document_type_id && slot.document !== null
    );
    if (existingDoc) {
      throw new BadRequestException(
        'A document already exists for this type. Agency cannot replace existing candidate documents.'
      );
    }

    // Add agency context to notes
    const agencyNote = body.notes 
      ? `${body.notes} [Uploaded by agency: ${license}]`
      : `[Uploaded by agency: ${license}]`;

    // Create document record
    const document = await this.candidateService.createDocument(candidateId, {
      document_type_id: body.document_type_id,
      name: body.name,
      description: body.description,
      notes: agencyNote,
      document_url: '',
      file_type: file.mimetype,
      file_size: file.size,
    });

    // Upload the file
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.CANDIDATE_DOCUMENT,
      candidateId,
      document.id
    );

    if (result.success && result.url) {
      await this.candidateService.updateDocumentUrl(document.id, result.url);
      document.document_url = result.url;
    } else {
      await this.candidateService.deleteDocument(document.id);
      throw new BadRequestException(result.error || 'Failed to upload document');
    }

    return document;
  }

  /**
   * Delete candidate document (agency-side)
   * DELETE /agencies/:license/jobs/:jobId/candidates/:candidateId/documents/:documentId
   */
  @Delete(':jobId/candidates/:candidateId/documents/:documentId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete candidate document',
    description: 'Agency can delete documents they uploaded for candidates.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID (UUID)', example: 'candidate-uuid' })
  @ApiParam({ name: 'documentId', description: 'Document ID (UUID)', example: 'document-uuid' })
  @ApiOkResponse({ description: 'Document deleted successfully', type: UploadResponseDto })
  async deleteCandidateDocument(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Req() req: Request,
  ): Promise<UploadResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Verify candidate has applied to this job
    const application = await this.jobAppRepo.findOne({
      where: { candidate_id: candidateId, job_posting_id: jobId },
    });
    if (!application) {
      throw new NotFoundException('Candidate has not applied to this job');
    }

    // Get document
    const document = await this.candidateService.findDocumentById(documentId);
    if (!document || document.candidate_id !== candidateId) {
      throw new NotFoundException('Document not found');
    }

    // Capture document info before deletion for audit
    const documentInfo = {
      id: document.id,
      name: document.name,
      document_type_id: document.document_type_id,
      file_type: document.file_type,
    };

    // Extract filename from URL and delete file
    const fileName = document.document_url.split('/').pop();
    await this.imageUploadService.deleteFile(
      UploadType.CANDIDATE_DOCUMENT,
      candidateId,
      fileName
    );

    // Delete document record
    await this.candidateService.deleteDocument(documentId);

    return {
      success: true,
      message: 'Document deleted successfully'
    };
  }

  /**
   * Update document verification status (agency-side)
   * PATCH /agencies/:license/jobs/:jobId/candidates/:candidateId/documents/:documentId/verify
   */
  @Post(':jobId/candidates/:candidateId/documents/:documentId/verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update document verification status',
    description: 'Agency can approve or reject candidate documents.'
  })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiParam({ name: 'jobId', description: 'Job posting ID (UUID)', example: 'job-uuid' })
  @ApiParam({ name: 'candidateId', description: 'Candidate ID (UUID)', example: 'candidate-uuid' })
  @ApiParam({ name: 'documentId', description: 'Document ID (UUID)', example: 'document-uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['approved', 'rejected'],
          description: 'New verification status',
        },
        rejection_reason: {
          type: 'string',
          description: 'Reason for rejection (required if status is rejected)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Document verification status updated', type: UploadResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid status or missing rejection reason' })
  async verifyDocument(
    @Param('license') license: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() body: { status: 'approved' | 'rejected'; rejection_reason?: string },
    @Req() req: Request,
  ): Promise<UploadResponseDto> {
    // Verify agency owns this job
    const job = await this.jobPostingService.findJobPostingByIdInternal(jobId);
    const belongs = job.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    // Verify candidate has applied to this job
    const application = await this.jobAppRepo.findOne({
      where: { candidate_id: candidateId, job_posting_id: jobId },
    });
    if (!application) {
      throw new NotFoundException('Candidate has not applied to this job');
    }

    // Validate status
    if (!['approved', 'rejected'].includes(body.status)) {
      throw new BadRequestException('Status must be "approved" or "rejected"');
    }

    // Require rejection reason if rejecting
    if (body.status === 'rejected' && !body.rejection_reason) {
      throw new BadRequestException('Rejection reason is required when rejecting a document');
    }

    // Get document
    const document = await this.candidateService.findDocumentById(documentId);
    if (!document || document.candidate_id !== candidateId) {
      throw new NotFoundException('Document not found');
    }

    const previousStatus = document.verification_status;

    // Update verification status
    await this.candidateService.updateDocumentVerification(documentId, {
      status: body.status,
      rejection_reason: body.rejection_reason,
    });

    return {
      success: true,
      message: `Document ${body.status} successfully`
    };
  }
}
