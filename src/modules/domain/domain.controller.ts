import { Controller, Post, Patch, HttpCode, Param, Body, ParseUUIDPipe, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags, ApiBody, ApiOkResponse, ApiNotFoundResponse, ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JobPostingService, CreateJobPostingDto } from './domain.service';
import { AgencyAuthGuard } from '../auth/agency-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('jobs')
@Controller('jobs')
export class DomainController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  // Update job posting status (close/reopen)
  @UseGuards(AgencyAuthGuard)
  @Patch(':id/status')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update job posting status',
    description: 'Update the is_active status of a job posting. Used to close or reopen job postings. Requires authentication and agency ownership.',
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
          description: 'Set to false to close posting, true to reopen',
          example: false
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Job posting status updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        is_active: { type: 'boolean' }
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
  async updateJobPostingStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { is_active: boolean },
  ) {
    const updated = await this.jobPostingService.updateJobPostingStatus(id, body.is_active);
    if (!updated) {
      throw new NotFoundException('Job posting not found');
    }
    return { id: updated.id, is_active: updated.is_active };
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
