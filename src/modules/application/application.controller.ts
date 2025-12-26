import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, HttpCode, NotFoundException, UseGuards, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { ApiOperation, ApiParam, ApiTags, ApiOkResponse, ApiQuery, ApiBody, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApplyJobDto, ApplyJobResponseDto } from './dto/apply-job.dto';
import { ApplicationAnalyticsDto } from './dto/application-analytics.dto';
import { PaginatedJobApplicationsDto } from './dto/paginated-job-applications.dto';
import { ApplicationDetailDto } from './dto/application-detail.dto';
import { ApplicationDetailsDto } from './dto/application-details.dto';
import { AgencyAuthGuard } from '../auth/agency-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import { CandidateService } from '../candidate/candidate.service';
import { ImageUploadService, UploadType } from '../shared/image-upload.service';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly apps: ApplicationService,
    private readonly candidates: CandidateService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

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
    try {
      const saved = await this.apps.apply(
        body.candidate_id, 
        body.job_posting_id,
        body.position_id,
        { note: body.note, updatedBy: body.updatedBy }
      );
      return { id: saved.id, status: saved.status };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
        position: item.position, // Include position information
        job_posting: item.job_posting, // Include job_posting in the response
        history_blob: item.history_blob, // Include application history with notes
        public_notes: item.public_notes, // Include public notes
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async shortlist(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { note?: string | null; updatedBy?: string | null },
    @GetUser() user?: User,
  ) {
    const saved = await this.apps.updateStatus(id, 'shortlisted', { note: body?.note, updatedBy: body?.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status };
  }

  // Schedule an interview for an application
  @Post(':id/schedule-interview')
  @UseGuards(JwtAuthGuard)
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
    @GetUser() user?: User,
  ) {
    const saved = await this.apps.scheduleInterview(id, body, { note: body?.note, updatedBy: body?.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status, interview: (saved as any).interview };
  }

  // Reschedule an interview for an application
  @Post(':id/reschedule-interview')
  @UseGuards(JwtAuthGuard)
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
    @GetUser() user?: User,
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
    
    const saved = await this.apps.rescheduleInterview(id, interviewUpdates, { note: body?.note, updatedBy: body?.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status };
  }

  // Complete interview with pass/fail result
  @Post(':id/complete-interview')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async completeInterview(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { result: 'passed' | 'failed'; note?: string | null; updatedBy?: string | null },
    @GetUser() user?: User,
  ) {
    const note = body?.note ?? `Interview ${body.result} via agency workflow`;
    const saved = await this.apps.completeInterview(id, body.result, { note, updatedBy: body?.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status };
  }

  // Withdraw an application
  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async withdraw(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { note?: string | null; updatedBy?: string | null },
    @GetUser() user?: User,
  ) {
    // Fetch application by id, then call withdraw using candidate_id and job_posting_id
    const app = await this.apps.getById(id);
    if (!app) {
      throw new Error('Application not found');
    }
    const saved = await this.apps.withdraw(app.candidate_id, app.job_posting_id, { note: body?.note, updatedBy: body?.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status };
  }

  // Reject an application with reason
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reject an application',
    description: 'Rejects an application with a required reason. Application status will be set to interview_failed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string', description: 'Rejection reason (required)', example: 'Does not meet experience requirements' },
        updatedBy: { type: 'string', nullable: true, description: 'User who performed the rejection' }
      }
    }
  })
  async rejectApplication(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { reason: string; updatedBy?: string | null },
    @GetUser() user?: User,
  ) {
    if (!body.reason || body.reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    const saved = await this.apps.rejectApplication(id, body.reason, { updatedBy: body.updatedBy }, user?.role);
    return { id: saved.id, status: saved.status };
  }

  // Bulk reject applications for a job posting
  @UseGuards(AgencyAuthGuard)
  @Post('job-postings/:jobPostingId/bulk-reject')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk reject applications',
    description: 'Rejects all applications with status "applied" for a specific job posting. Used when closing a job posting. Requires authentication and agency ownership.',
  })
  @ApiParam({
    name: 'jobPostingId',
    description: 'Job Posting UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string', description: 'Rejection reason (required)', example: 'Job posting closed - no longer accepting applications' },
        updatedBy: { type: 'string', nullable: true, description: 'User who performed the bulk rejection' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to modify applications for this job posting',
  })
  async bulkRejectApplications(
    @Param('jobPostingId', new ParseUUIDPipe({ version: '4' })) jobPostingId: string,
    @Body() body: { reason: string; updatedBy?: string | null },
    @GetUser() user?: User,
  ) {
    if (!body.reason || body.reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    const result = await this.apps.bulkRejectApplicationsForJobPosting(jobPostingId, body.reason, { updatedBy: body.updatedBy }, user?.role);
    return result;
  }

  // Get comprehensive application details for frontend
  // Simplified endpoint: GET /applications/:id/details
  // Takes only application ID, infers agency from JWT token
  // Returns combined candidate + application data for S2 component
  @Get(':id/details')
  @ApiOperation({
    summary: 'Get comprehensive application details',
    description: 'Returns detailed application information formatted for frontend consumption, including candidate profile, job details, interview info, employer details, and documents. Agency is inferred from JWT token.',
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
  ): Promise<any> {
    const app = await this.apps.getApplicationDetailsWithCandidate(applicationId);
    
    if (!app) {
      throw new NotFoundException('Application not found');
    }

    return app;
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

  // Document endpoints - derive job, position, candidate from application ID
  // Documents are now included in the /details endpoint
  @Get(':id/documents')
  @ApiOperation({
    summary: 'Get documents for an application (DEPRECATED)',
    description: 'DEPRECATED: Use GET /applications/:id/details instead. Documents are now included in the details response.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  async getApplicationDocuments(
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
  ) {
    const app = await this.apps.getById(applicationId);
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    // Return documents from details endpoint
    const details = await this.apps.getApplicationDetailsWithCandidate(applicationId);
    return { documents: details.documents, slots: details.slots };
  }

  @Post(':id/documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  @ApiOperation({
    summary: 'Upload document for an application',
    description: 'Upload a document for a candidate in an application. Server derives job, position, and candidate from application ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  async uploadApplicationDocument(
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @GetUser() user?: User,
  ) {
    const app = await this.apps.getById(applicationId);
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!body.document_type_id) {
      throw new BadRequestException('document_type_id is required');
    }

    const candidateId = app.candidate_id;

    // Create document record first to get ID
    const document = await this.candidates.createDocument(candidateId, {
      document_type_id: body.document_type_id,
      name: body.name || file.originalname,
      description: body.description,
      notes: body.notes,
      document_url: '', // Will be updated after upload
      file_type: file.mimetype,
      file_size: file.size,
    });

    // Upload the file with document ID
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.CANDIDATE_DOCUMENT,
      candidateId,
      document.id
    );

    if (result.success && result.url) {
      // Update document with the actual URL
      await this.candidates.updateDocumentUrl(document.id, result.url);
      document.document_url = result.url;
    } else {
      // If upload failed, delete the document record
      await this.candidates.deleteDocument(document.id);
      throw new BadRequestException(result.error || 'Failed to upload document');
    }

    return document;
  }

  @Post(':id/documents/:documentId/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify (approve/reject) a document for an application',
    description: 'Approve or reject a document for a candidate in an application. Server derives job, position, and candidate from application ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Application UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document UUID (v4)',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
  })
  async verifyApplicationDocument(
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
    @Param('documentId', new ParseUUIDPipe({ version: '4' })) documentId: string,
    @Body() body: { status: 'approved' | 'rejected'; rejection_reason?: string },
    @GetUser() user?: User,
  ) {
    const app = await this.apps.getById(applicationId);
    if (!app) {
      throw new NotFoundException('Application not found');
    }

    // Verify the document exists and belongs to the candidate
    const document = await this.candidates.findDocumentById(documentId);
    if (!document || document.candidate_id !== app.candidate_id) {
      throw new NotFoundException('Document not found');
    }

    // Update document verification status
    const verificationStatus = body.status === 'approved' ? 'approved' : 'rejected';
    await this.candidates.updateDocumentVerification(documentId, {
      status: verificationStatus,
      rejection_reason: body.rejection_reason,
    });

    return { success: true, status: verificationStatus };
  }
}
