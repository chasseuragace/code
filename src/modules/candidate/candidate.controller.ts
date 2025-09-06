import { Controller, Get, Param, Query, ParseUUIDPipe, Post, Body, HttpCode } from '@nestjs/common';
import { CandidateService } from './candidate.service';

function toBool(val?: string): boolean | undefined {
  if (val == null) return undefined;
  return val === 'true' || val === '1';
}

@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidates: CandidateService) {}

  // Create candidate (minimal public endpoint)
  @Post()
  @HttpCode(201)
  async createCandidate(@Body() body: Partial<any>) {
    const saved = await this.candidates.createCandidate(body);
    return { id: saved.id };
  }

  // Add job profile (preferred_titles, etc.)
  @Post(':id/job-profiles')
  @HttpCode(201)
  async addJobProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { profile_blob: any; label?: string },
  ) {
    const saved = await this.candidates.addJobProfile(id, body);
    return { id: saved.id };
  }

  // Public-facing: list relevant jobs for a candidate with optional matching flags
  // GET /candidates/:id/relevant-jobs?country=UAE&combineWith=AND&useCanonicalTitles=true&includeScore=true&page=1&limit=10
  // Optional salary query params: salary_min, salary_max, salary_currency, salary_source (= base | converted)
  @Get(':id/relevant-jobs')
  async getRelevantJobs(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('country') country?: string | string[],
    @Query('combineWith') combineWith?: 'AND' | 'OR',
    @Query('useCanonicalTitles') useCanonicalTitles?: string,
    @Query('includeScore') includeScore?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('salary_min') salaryMin?: string,
    @Query('salary_max') salaryMax?: string,
    @Query('salary_currency') salaryCurrency?: string,
    @Query('salary_source') salarySource?: 'base' | 'converted',
  ) {
    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? false,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    if (salaryMin || salaryMax || salaryCurrency || salarySource) {
      opts.salary = {
        min: salaryMin ? parseFloat(salaryMin) : undefined,
        max: salaryMax ? parseFloat(salaryMax) : undefined,
        currency: salaryCurrency,
        source: salarySource === 'converted' ? 'converted' : 'base',
      };
    }

    return this.candidates.getRelevantJobs(id, opts);
  }

  // Grouped relevant jobs by preferred titles
  // GET /candidates/:id/relevant-jobs/grouped
  @Get(':id/relevant-jobs/grouped')
  async getRelevantJobsGrouped(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('country') country?: string | string[],
    @Query('combineWith') combineWith?: 'AND' | 'OR',
    @Query('useCanonicalTitles') useCanonicalTitles?: string,
    @Query('includeScore') includeScore?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('salary_min') salaryMin?: string,
    @Query('salary_max') salaryMax?: string,
    @Query('salary_currency') salaryCurrency?: string,
    @Query('salary_source') salarySource?: 'base' | 'converted',
  ) {
    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true, // default true for grouped to ensure scoring
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    if (salaryMin || salaryMax || salaryCurrency || salarySource) {
      opts.salary = {
        min: salaryMin ? parseFloat(salaryMin) : undefined,
        max: salaryMax ? parseFloat(salaryMax) : undefined,
        currency: salaryCurrency,
        source: salarySource === 'converted' ? 'converted' : 'base',
      };
    }
    return this.candidates.getRelevantJobsGrouped(id, opts);
  }
}
