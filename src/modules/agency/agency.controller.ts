import { Controller, Post, HttpCode, Param, Body, Patch, Get, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { AgencyService, CreateAgencyDto } from './agency.service';
import { JobPostingService, CreateJobPostingDto } from '../domain/domain.service';
import { CreateJobPostingWithTagsDto } from '../domain/dto/create-job-posting-with-tags.dto';
import { UpdateJobTagsDto } from '../domain/dto/update-job-tags.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('agencies')
export class AgencyController {
  constructor(
    private readonly agencyService: AgencyService,
    private readonly jobPostingService: JobPostingService,
  ) {}

  // Create agency (production-friendly controller)
  @Post()
  @HttpCode(201)
  async createAgency(@Body() body: CreateAgencyDto) {
    const saved = await this.agencyService.createAgency(body);
    return { id: saved.id, license_number: saved.license_number };
  }

  // SeedV1: insert dummy agencies from JSON file
  // Idempotent: relies on createAgency which reuses existing by license_number
  @Post('seedv1')
  @HttpCode(200)
  async seedV1() {
    const seedPath = path.resolve(process.cwd(), 'src/seed/agencies.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const records: CreateAgencyDto[] = JSON.parse(raw);
    if (!Array.isArray(records)) {
      throw new Error('agencies.seed.json must contain an array of agencies');
    }

    const results = [] as Array<{ license_number: string; id: string }>;
    for (const rec of records) {
      const saved = await this.agencyService.createAgency(rec);
      results.push({ license_number: saved.license_number, id: saved.id });
    }

    return {
      source: 'src/seed/agencies.seed.json',
      inserted_or_reused: results.length,
      agencies: results,
    };
  }

  // Create a job posting for an existing agency by license number.
  // The request body should contain all fields of CreateJobPostingDto except posting_agency.
  // We will infer posting_agency from the path param license.
  @Post(':license/job-postings')
  @HttpCode(201)
  async createJobPostingForAgency(
    @Param('license') license: string,
    @Body() body: CreateJobPostingWithTagsDto,
  ) {
    // Ensure agency exists
    const agency = await this.agencyService.findAgencyByLicense(license);
    const dto: CreateJobPostingDto = {
      ...body,
      posting_agency: {
        name: agency.name,
        license_number: agency.license_number,
        address: agency.address ?? undefined,
        phones: agency.phones ?? undefined,
        emails: agency.emails ?? undefined,
        website: agency.website ?? undefined,
      },
    } as any;
    const created = await this.jobPostingService.createJobPosting(dto);
    return {
      id: created.id,
      posting_title: created.posting_title,
      skills: (created as any).skills,
      education_requirements: (created as any).education_requirements,
      experience_requirements: (created as any).experience_requirements,
      canonical_titles: (created as any).canonical_titles ?? [],
    };
  }

  // Update tags for a job posting (ownership enforced by license match)
  @Patch(':license/job-postings/:id/tags')
  @HttpCode(200)
  async updateJobPostingTags(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateJobTagsDto,
  ) {
    // Verify ownership: posting must belong to this agency license
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot modify job posting of another agency');
    }
    const updated = await this.jobPostingService.updateJobPostingTags(id, body as any);
    return {
      id: updated.id,
      skills: (updated as any).skills,
      education_requirements: (updated as any).education_requirements,
      experience_requirements: (updated as any).experience_requirements,
      canonical_titles: (updated as any).canonical_titles ?? [],
    };
  }

  // Get tags for a job posting (ownership enforced)
  @Get(':license/job-postings/:id/tags')
  @HttpCode(200)
  async getJobPostingTags(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }
    return {
      id: posting.id,
      skills: (posting as any).skills,
      education_requirements: (posting as any).education_requirements,
      experience_requirements: (posting as any).experience_requirements,
      canonical_titles: (posting as any).canonical_titles ?? [],
    };
  }
}
