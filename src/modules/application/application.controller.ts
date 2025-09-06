import { Controller, Post, Body, HttpCode, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly apps: ApplicationService) {}

  // Apply to a job posting
  @Post()
  @HttpCode(201)
  async apply(
    @Body() body: { candidate_id: string; job_posting_id: string; note?: string | null; updatedBy?: string | null },
  ) {
    const saved = await this.apps.apply(body.candidate_id, body.job_posting_id, { note: body.note, updatedBy: body.updatedBy });
    return { id: saved.id, status: saved.status };
  }

  // List applications for a candidate
  @Get('/candidates/:id')
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
}
