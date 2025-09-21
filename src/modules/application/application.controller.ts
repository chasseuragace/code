import { Controller, Post, Body, HttpCode, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiBody, ApiResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { ApplicationAnalyticsDto } from './dto/application-analytics.dto';
import { ApplyJobDto, ApplyJobResponseDto } from './dto/apply-job.dto';

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
    type: ApplyJobResponseDto,
    example: {
      id: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
      status: 'applied'
    }
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
    const saved = await this.apps.apply(body.candidate_id, body.job_posting_id, { note: body.note, updatedBy: body.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // List applications for a candidate
  @Get('/candidates/:id')
  @ApiOperation({ 
    summary: 'List job applications for a candidate',
    description: 'Get a paginated list of all job applications submitted by a specific candidate, with optional status filtering.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Candidate UUID',
    example: '7103d484-19b0-4c62-ae96-256da67a49a4'
  })
  @ApiOkResponse({ 
    description: 'List of candidate applications',
    example: {
      data: [
        {
          id: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
          status: 'applied',
          job_posting: {
            id: '1e8c9c1a-352c-485d-ac9a-767cbbca4a4c',
            posting_title: 'Electrician - Dubai',
            country: 'UAE',
            city: 'Dubai'
          },
          applied_at: '2025-09-21T10:30:00Z'
        }
      ],
      total: 5,
      page: 1,
      limit: 10
    }
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
    return res;
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
      location?: string;
      contact_person?: string;
      required_documents?: string[];
      notes?: string;
      note?: string | null;
      updatedBy?: string | null;
    },
  ) {
    const saved = await this.apps.scheduleInterview(id, body, { note: body?.note, updatedBy: body?.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // Complete interview with pass/fail result
  @Post(':id/complete-interview')
  @HttpCode(200)
  async completeInterview(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { result: 'passed' | 'failed'; note?: string | null; updatedBy?: string | null },
  ) {
    const saved = await this.apps.completeInterview(id, body.result, { note: body?.note, updatedBy: body?.updatedBy });
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
