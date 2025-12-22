import { Controller, Post, Patch, HttpCode, Param, Body, ParseUUIDPipe, NotFoundException, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiOkResponse, ApiNotFoundResponse, ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JobPostingService, CreateJobPostingDto } from './domain.service';
import { AgencyAuthGuard } from '../auth/agency-auth.guard';
import { ApplicationService } from '../application/application.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('jobs')
@Controller('jobs')
export class DomainController {
  constructor(
    private readonly jobPostingService: JobPostingService,
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService
  ) {}

  // Toggle job posting status (close with rejection or reopen)
  @UseGuards(AgencyAuthGuard)
  @Patch(':id/toggle')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle job posting status (close with rejection or reopen)',
    description: 'Atomically toggles job posting status. When closing (is_active=false), automatically rejects all candidates with "applied" status. When reopening (is_active=true), simply reactivates the posting. Requires authentication and agency ownership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job Posting UUID (v4)',
    example: '3553cc6c-816a-43ce-be32-e52e93177425',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['is_active'],
      properties: {
        is_active: { 
          type: 'boolean', 
          description: 'Set to false to close posting (with automatic rejection of applied candidates), true to reopen',
          example: false
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Job posting status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Job posting ID' },
        is_active: { type: 'boolean', description: 'Updated status' },
        rejected_count: { type: 'number', description: 'Number of applications rejected (only when closing)' },
        rejected_application_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of rejected applications (only when closing)' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to modify this job posting',
  })
  @ApiNotFoundResponse({
    description: 'Job posting not found',
  })
  async toggleJobPostingStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { is_active: boolean },
    @GetUser() user?: User,
  ) {
    return this.jobPostingService.toggleJobPostingStatus(
      id, 
      body.is_active,
      this.applicationService,
      user?.role
    );
  }

  // SeedV1: create job postings (with agencies/employer/contract/positions)
  // Reads from src/seed/jobs-to-agencies.seed.json
  @Post('seedv1')
  @HttpCode(200)
  async seedV1() {
    const seedPath = path.resolve(process.cwd(), 'src/seed/jobs-to-agencies.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const rows: CreateJobPostingDto[] = JSON.parse(raw);
    if (!Array.isArray(rows)) {
      throw new Error('jobs-to-agencies.seed.json must contain an array');
    }

    const results = [] as Array<{ id: string; posting_title: string }>; 
    for (const rec of rows) {
      const created = await this.jobPostingService.createJobPosting(rec);
      results.push({ id: created.id, posting_title: created.posting_title });
    }

    return {
      source: 'src/seed/jobs-to-agencies.seed.json',
      created: results.length,
      postings: results,
    };
  }
}
