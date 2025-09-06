import { Controller, Post, HttpCode, Get, Query } from '@nestjs/common';
import { JobTitleService } from './job-title.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('job-titles')
export class JobTitleController {
  constructor(private readonly jobTitleService: JobTitleService) {}

  @Get()
  async listAll(
    @Query('is_active') is_active?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
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
