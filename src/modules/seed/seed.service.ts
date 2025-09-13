import { Injectable, Logger } from '@nestjs/common';
import { CountryService, CountrySeedDto } from '../country/country.service';
import { JobTitleService, JobTitleSeedDto } from '../job-title/job-title.service';
import { AgencyService, CreateAgencyDto } from '../agency/agency.service';
import { JobPostingService, AnnouncementType, OvertimePolicy, ProvisionType, ExpensePayer, ExpenseType } from '../domain/domain.service';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from '../domain/domain.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly countryService: CountryService,
    private readonly jobTitleService: JobTitleService,
    private readonly agencyService: AgencyService,
    private readonly jobPostingService: JobPostingService,
    @InjectRepository(JobPosting) private readonly jobPostingRepo: Repository<JobPosting>,
  ) {}

  private readJson<T = any>(relPath: string): T | null {
    try {
      const file = path.resolve(process.cwd(), relPath);
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (e: any) {
      this.logger.warn(`Seed file '${relPath}' missing or invalid: ${e?.message || e}`);
      return null;
    }
  }

  async seedCountries(): Promise<{ affected: number } | null> {
    const rows = this.readJson<CountrySeedDto[]>(`src/seed/countries.seed.json`);
    if (!rows?.length) return null;
    return this.countryService.upsertMany(rows);
  }

  async seedJobTitles(): Promise<{ affected: number } | null> {
    const rows = this.readJson<JobTitleSeedDto[]>(`src/seed/jobs.seed.json`);
    if (!rows?.length) return null;
    return this.jobTitleService.upsertMany(rows);
  }

  async seedAgencies(): Promise<{ created: number } | null> {
    const rows = this.readJson<CreateAgencyDto[]>(`src/seed/agencies.seed.json`);
    if (!rows?.length) return null;
    let created = 0;
    for (const r of rows) {
      // Only create if license_number does not exist
      try {
        await this.agencyService.findAgencyByLicense(r.license_number);
        // exists -> skip creating, do not increment
      } catch {
        await this.agencyService.createAgency(r);
        created++;
      }
    }
    return { created };
  }

  async seedSamplePostings(): Promise<{ created: number } | null> {
    type PostingSeed = Parameters<JobPostingService['createJobPosting']>[0];
    const rows = this.readJson<PostingSeed[]>(`src/seed/jobs-to-agencies.seed.json`);
    if (!rows?.length) return null;
    let created = 0;
    for (const r of rows) {
      // Check existence by (lt_number + posting_title) or (chalani_number + posting_title)
      const where: any[] = [];
      if (r.lt_number) where.push({ lt_number: r.lt_number, posting_title: r.posting_title });
      if (r.chalani_number) where.push({ chalani_number: r.chalani_number, posting_title: r.posting_title });
      let exists: JobPosting | null = null;
      if (where.length) {
        exists = await this.jobPostingRepo.findOne({ where });
      } else {
        // Fallback: try title + country + employer name proximity by searching latest posting with same title
        exists = await this.jobPostingRepo.findOne({ where: { posting_title: r.posting_title, country: r.country } });
      }
      if (exists) {
        continue; // skip creating duplicates
      }
      // Map string enums to typed enums where applicable
      const mapped: PostingSeed = {
        ...r,
        announcement_type: (r.announcement_type as any) as AnnouncementType,
        contract: {
          ...r.contract,
          overtime_policy: (r.contract.overtime_policy as any) as OvertimePolicy,
          food: (r.contract.food as any) as ProvisionType,
          accommodation: (r.contract.accommodation as any) as ProvisionType,
          transport: (r.contract.transport as any) as ProvisionType,
        },
        positions: r.positions.map((p) => ({
          ...p,
          overtime_policy_override: (p.overtime_policy_override as any) as OvertimePolicy,
          food_override: (p.food_override as any) as ProvisionType,
          accommodation_override: (p.accommodation_override as any) as ProvisionType,
          transport_override: (p.transport_override as any) as ProvisionType,
        })),
      } as any;
      await this.jobPostingService.createJobPosting(mapped);
      created++;
    }
    return { created };
  }

  async seedSystem(options?: { countries?: boolean; job_titles?: boolean; agencies?: boolean; sample_postings?: boolean; }) {
    const opts = {
      countries: true,
      job_titles: true,
      agencies: false,
      sample_postings: false,
      ...(options || {}),
    };
    const results: any = {};
    if (opts.countries) results.countries = await this.seedCountries();
    if (opts.job_titles) results.job_titles = await this.seedJobTitles();
    if (opts.agencies) results.agencies = await this.seedAgencies();
    if (opts.sample_postings) results.sample_postings = await this.seedSamplePostings();
    return results;
  }
}
