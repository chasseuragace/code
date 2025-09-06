import { Controller, Post, HttpCode } from '@nestjs/common';
import { JobPostingService, CreateJobPostingDto } from './domain.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('jobs')
export class DomainController {
  constructor(private readonly jobPostingService: JobPostingService) {}

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
