import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApiOperation, ApiParam, ApiTags, ApiOkResponse, ApiQuery, ApiBody, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ApplyJobDto, ApplyJobResponseDto } from './dto/apply-job.dto';
import { ApplicationAnalyticsDto } from './dto/application-analytics.dto';
import { PaginatedJobApplicationsDto } from './dto/paginated-job-applications.dto';
import { ApplicationDetailDto } from './dto/application-detail.dto';
import { ApplicationDetailsDto } from './dto/application-details.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly apps: ApplicationService) {}

  // Apply to a job posting
  @Post()
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Apply for a job posting',
    description: 'Submit a job application for a candidate to a specific job posting. Each candidate can only apply once per job posting.'
  })
  @ApiBody({ 
    type: ApplyJobDto,
    description: 'Job application details including candidate ID, job posting ID, and optional note'
  })
  @ApiCreatedResponse({ 
    description: 'Application submitted successfully',
    type: ApplyJobResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request - candidate not found, job posting not found, job posting inactive, or candidate already applied',
    example: {
      statusCode: 400,
      message: 'Candidate has already applied to this posting',
      error: 'Bad Request'
    }
  })
  async apply(@Body() body: ApplyJobDto): Promise<ApplyJobResponseDto> {
    const saved = await this.apps.apply(
      body.candidate_id, 
      body.job_posting_id,
      body.position_id,
      { note: body.note, updatedBy: body.updatedBy }
    );
    return { id: saved.id, status: saved.status };
  }

  // List applications for a candidate
  @Get('/candidates/:id')
  @ApiOperation({
    summary: 'List job applications for a candidate',
    description:
      'Returns a paginated list of job applications submitted by the candidate. By default all statuses are included.'
  })
  @ApiParam({
    name: 'id',
    description: 'Candidate UUID (v4)',
    example: '7103d484-19b0-4c62-ae96-256da67a49a4',
  })
  @ApiOkResponse({
    description: 'Paginated list of candidate applications',
    type: PaginatedJobApplicationsDto,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Optional application status filter. Allowed values: applied, shortlisted, interview_scheduled, interview_rescheduled, interview_passed, interview_failed, withdrawn',
    example: 'applied',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based). Defaults to 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size (1-100). Defaults to 20.',
    example: 20,
  })
  async listForCandidate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const res = await this.apps.listApplied(id, {
      status: status as any,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return {
      items: res.items.map((item) => ({
        id: item.id,
        candidate_id: item.candidate_id,
        job_posting_id: item.job_posting_id,
        status: item.status,
        agency_name: item.agency_name,
        interview: item.interview,
        job_posting: item.job_posting, // Include job_posting in the response
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
      total: res.total,
      page: res.page,
      limit: res.limit,
    } satisfies PaginatedJobApplicationsDto;
  }

  // Shortlist an application
  @Post(':id/shortlist')
  @HttpCode(200)
  async shortlist(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { note?: string | null; updatedBy?: string | null },
  ) {
    const saved = await this.apps.updateStatus(id, 'shortlisted', { note: body?.note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // Schedule an interview for an application
  @Post(':id/schedule-interview')
  @HttpCode(200)
  async scheduleInterview(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body()
    body: {
      interview_date_ad?: string;
      interview_date_bs?: string;
      interview_time?: string;
      duration_minutes?: number;
      location?: string;
      contact_person?: string;
      required_documents?: string[];
      notes?: string;
      note?: string | null;
      updatedBy?: string | null;
    },
  ) {
    const saved = await this.apps.scheduleInterview(id, body, { note: body?.note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status, interview: (saved as any).interview };
  }

  // Reschedule an interview for an application
  @Post(':id/reschedule-interview')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reschedule an interview',
    description: 'Updates interview details and changes application status to interview_rescheduled',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  async rescheduleInterview(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body()
    body: {
      interview_id: string;
      interview_date_ad?: string;
      interview_date_bs?: string;
      interview_time?: string;
      duration_minutes?: number;
      location?: string;
      contact_person?: string;
      required_documents?: string[];
      notes?: string;
      note?: string | null;
      updatedBy?: string | null;
    },
  ) {
    // Extract only interview-related fields for the update
    const interviewUpdates = {
      interview_date_ad: body.interview_date_ad,
      interview_date_bs: body.interview_date_bs,
      interview_time: body.interview_time,
      duration_minutes: body.duration_minutes,
      location: body.location,
      contact_person: body.contact_person,
      required_documents: body.required_documents,
      notes: body.notes,
    };
    
    const saved = await this.apps.rescheduleInterview(id, body.interview_id, interviewUpdates, { note: body?.note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // Complete interview with pass/fail result
  @Post(':id/complete-interview')
  @HttpCode(200)
  async completeInterview(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { result: 'passed' | 'failed'; note?: string | null; updatedBy?: string | null },
  ) {
    const note = body?.note ?? `Interview ${body.result} via agency workflow`;
    const saved = await this.apps.completeInterview(id, body.result, { note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // Withdraw an application
  @Post(':id/withdraw')
  @HttpCode(200)
  async withdraw(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { note?: string | null; updatedBy?: string | null },
  ) {
    // Fetch application by id, then call withdraw using candidate_id and job_posting_id
    const app = await this.apps.getById(id);
    if (!app) {
      throw new Error('Application not found');
    }
    const saved = await this.apps.withdraw(app.candidate_id, app.job_posting_id, { note: body?.note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // Get comprehensive application details for frontend
  @Get(':id/details')
  @ApiOperation({
    summary: 'Get comprehensive application details',
    description: 'Returns detailed application information formatted for frontend consumption, including job details, interview info, employer details, and documents.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  @ApiOkResponse({
    description: 'Comprehensive application details',
    type: ApplicationDetailsDto,
  })
  @ApiNotFoundResponse({
    description: 'Application not found',
    example: {
      statusCode: 404,
      message: 'Application not found',
      error: 'Not Found',
    },
  })
  async getApplicationDetails(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ApplicationDetailsDto> {
    const details = await this.apps.getApplicationDetails(id);
    if (!details) {
      throw new NotFoundException('Application not found');
    }
    return details;
  }

  // Get single application details with full history
  @Get(':id')
  @ApiOperation({
    summary: 'Get application details by ID',
    description: 'Returns complete application details including full status change history timeline. Used for "My Applications" detail view and notifications.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  @ApiOkResponse({
    description: 'Application details with complete history',
    type: ApplicationDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Application not found',
    example: {
      statusCode: 404,
      message: 'Application not found',
      error: 'Not Found',
    },
  })
  async getApplicationById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ApplicationDetailDto> {
    const app = await this.apps.getById(id);
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    return {
      id: app.id,
      candidate_id: app.candidate_id,
      job_posting_id: app.job_posting_id,
      status: app.status,
      history_blob: app.history_blob,
      withdrawn_at: app.withdrawn_at ?? null,
      created_at: app.created_at,
      updated_at: app.updated_at,
    };
  }

  // Candidate analytics: totals and per-status counts
  // GET /applications/analytics/:id
  @Get('analytics/:id')
  @ApiOperation({ summary: 'Get candidate application analytics' })
  @ApiParam({ name: 'id', description: 'Candidate ID (UUID v4)', required: true })
  @ApiOkResponse({ description: 'Analytics summary for the candidate', type: ApplicationAnalyticsDto })
  async analytics(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.apps.getAnalytics(id);
  }
}
