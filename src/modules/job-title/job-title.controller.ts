import { Controller, Post, HttpCode, Get, Query } from '@nestjs/common';
import { JobTitleService } from './job-title.service';
import * as fs from 'fs';
import * as path from 'path';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobTitleListResponseDto, JobTitleSeedResponseDto } from './dto/job-title.dto';

@ApiTags('job-titles')
@Controller('job-titles')
export class JobTitleController {
  constructor(private readonly jobTitleService: JobTitleService) {}

  @Get()
  @ApiOperation({ summary: 'List job titles with optional filters' })
  @ApiQuery({ name: 'is_active', required: false, description: 'true|false' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by title (ILIKE)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max rows to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, type: JobTitleListResponseDto })
  async listAll(
    @Query('is_active') is_active?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<JobTitleListResponseDto> {
    const res = await this.jobTitleService.listAll({
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      q,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return res;
  }

  // SeedV1: upsert job titles from JSON file
  @Post('seedv1')
  @HttpCode(200)
  @ApiOperation({ summary: 'Seed job titles from src/seed/jobs.seed.json (upsert by title)' })
  @ApiResponse({ status: 200, type: JobTitleSeedResponseDto })
  async seedV1() {
    const seedPath = path.resolve(process.cwd(), 'src/seed/jobs.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) {
      throw new Error('jobs.seed.json must contain an array');
    }
    const res = await this.jobTitleService.upsertMany(rows);
    return { source: 'src/seed/jobs.seed.json', upserted: res.affected };
  }
}
