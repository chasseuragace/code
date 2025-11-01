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
import { User } from '../user/user.entity';
import { AgencyUser } from '../agency/agency-user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly countryService: CountryService,
    private readonly jobTitleService: JobTitleService,
    private readonly agencyService: AgencyService,
    private readonly jobPostingService: JobPostingService,
    @InjectRepository(JobPosting) private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AgencyUser) private readonly agencyUserRepo: Repository<AgencyUser>,
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

  private async createOwnerUser(phone: string, agencyId: string): Promise<User> {
    const user = this.userRepo.create({
      id: uuidv4(),
      phone,
      role: 'owner',
      is_active: true,
      is_agency_owner: true,
      agency_id: agencyId,
    });
    return this.userRepo.save(user);
  }

  private async createAgencyUser(userId: string, fullName: string, phone: string, agencyId: string): Promise<AgencyUser> {
    const agencyUser = this.agencyUserRepo.create({
      id: uuidv4(),
      full_name: fullName,
      phone,
      user_id: userId,
      agency_id: agencyId,
      role: 'owner',
    });
    return this.agencyUserRepo.save(agencyUser);
  }

  async seedOwners(): Promise<{ created: number } | null> {
    const agencies = await this.agencyService.listAgencies({});
    if (!agencies?.data?.length) {
      this.logger.warn('No agencies found to create owners for');
      return null;
    }

    let created = 0;
    for (const agency of agencies.data) {
      // Skip if agency already has an owner
      const existingOwner = await this.userRepo.findOne({ 
        where: { 
          agency_id: agency.id, 
          is_agency_owner: true 
        } 
      });
      
      if (existingOwner) continue;

      // Create owner user
      const phone = `+9779800000${String(created + 1).padStart(3, '0')}`;
      const user = await this.createOwnerUser(phone, agency.id);
      
      // Create agency user
      await this.createAgencyUser(
        user.id, 
        `Owner of ${agency.name}`, 
        phone,
        agency.id
      );
      
      created++;
    }
    
    return { created };
  }

  async seedAgencies(createOwners: boolean = false): Promise<{ created: number } | null> {
    const rows = this.readJson<Array<CreateAgencyDto & { owner_phone?: string }>>(`src/seed/agencies.seed.json`);
    if (!rows?.length) return null;
    
    let created = 0;
    for (const r of rows) {
      // Only create if license_number does not exist
      try {
        await this.agencyService.findAgencyByLicense(r.license_number);
        // exists -> skip creating, do not increment
      } catch {
        const { owner_phone, ...agencyData } = r;
        const agency = await this.agencyService.createAgency(agencyData);
        created++;

        // Create owner if requested and phone is provided
        if (createOwners && owner_phone) {
          try {
            const user = await this.createOwnerUser(owner_phone, agency.id);
            await this.createAgencyUser(
              user.id, 
              `Owner of ${agency.name}`, 
              owner_phone,
              agency.id
            );
          } catch (error) {
            this.logger.error(`Failed to create owner for agency ${agency.id}: ${error.message}`);
          }
        }
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

  async seedSystem(options?: { countries?: boolean; job_titles?: boolean; agencies?: boolean; sample_postings?: boolean; dev_agency_postings_with_tags?: boolean; }) {
    const opts = {
      countries: true,
      job_titles: true,
      agencies: false,
      sample_postings: false,
      dev_agency_postings_with_tags: false,
      ...(options || {}),
    };
    const results: any = {};
    if (opts.countries) results.countries = await this.seedCountries();
    if (opts.job_titles) results.job_titles = await this.seedJobTitles();
    if (opts.agencies) results.agencies = await this.seedAgencies();
    if (opts.sample_postings) results.sample_postings = await this.seedSamplePostings();
    if (opts.dev_agency_postings_with_tags) {
      // Ensure agencies exist before creating postings for them
      if (!results.agencies && !opts.agencies) {
        // try to upsert from seed file silently
        await this.seedAgencies();
      }
      results.dev_agency_postings_with_tags = await this.seedDevAgencyPostingsWithTags();
    }
    return results;
  }

  /**
   * Dev utility: For each seeded agency, create a simple job posting if one does not already exist,
   * and tag it with basic skills/education for frontend consumption.
   */
  async seedDevAgencyPostingsWithTags(): Promise<{ created: number; tagged: number }> {
    type CreateDto = Parameters<JobPostingService['createJobPosting']>[0];
    const agencies = this.readJson<CreateAgencyDto[]>(`src/seed/agencies.seed.json`) || [];
    let created = 0;
    let tagged = 0;

    // Preload a pool of job titles to attach as canonical titles
    let canonicalIds: string[] = [];
    try {
      const jt = await this.jobTitleService.listAll({ limit: 20 });
      const titles = Array.isArray(jt?.data) ? jt.data : [];
      canonicalIds = titles.map((t: any) => t.id).filter(Boolean);
    } catch (e) {
      this.logger.warn(`Unable to preload job titles for canonical tags: ${e instanceof Error ? e.message : e}`);
    }

    for (const ag of agencies) {
      if (!ag?.license_number) continue;
      // Ensure agency exists (no-op if already there)
      try {
        await this.agencyService.findAgencyByLicense(ag.license_number);
      } catch {
        await this.agencyService.createAgency(ag);
      }

      // Stable unique title per agency
      const title = `Sample Job for ${ag.name}`;
      let posting = await this.jobPostingRepo.findOne({ where: { posting_title: title } });
      if (!posting) {
        const dto: CreateDto = {
          posting_title: title,
          country: 'UAE',
          employer: { company_name: 'Dev Employer', country: 'UAE', city: 'Dubai' } as any,
          posting_agency: {
            name: ag.name,
            license_number: ag.license_number,
            address: ag.address as any,
            phones: ag.phones as any,
            emails: ag.emails as any,
            website: (ag as any).website,
          } as any,
          contract: { period_years: 1, renewable: true } as any,
          positions: [
            {
              title: 'General Worker',
              vacancies: { male: 2, female: 0 } as any,
              salary: { monthly_amount: 1000, currency: 'AED', converted: [{ amount: 36000, currency: 'NPR' }] } as any,
            } as any,
            {
              title: 'Different Job',
              vacancies: { male: 2, female: 0 } as any,
              salary: { monthly_amount: 1000, currency: 'AED', converted: [{ amount: 26000, currency: 'NPR' }] } as any,
            } as any,
            {
              title: 'Unique Job',
              vacancies: { male: 2, female: 0 } as any,
              salary: { monthly_amount: 1000, currency: 'AED', converted: [{ amount: 16000, currency: 'NPR' }] } as any,
            } as any,
          ],
        } as any;
        const createdPosting = await this.jobPostingService.createJobPosting(dto);
        posting = await this.jobPostingService.findJobPostingById(createdPosting.id);
        created++;
      }

      // Tag the posting with simple defaults
      try {
        // Pick up to 2 random canonical ids if available
        const pickCanonical = (() => {
          if (!canonicalIds.length) return [] as string[];
          const shuffled = [...canonicalIds].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, Math.min(2, shuffled.length));
        })();
        await this.jobPostingService.updateJobPostingTags(posting.id, {
          skills: ['seed-basic', 'seed-tagged'],
          education_requirements: ['seed-education'],
          experience_requirements: { min_years: 0, level: 'entry' } as any,
          canonical_title_ids: pickCanonical,
        } as any);
        tagged++;
      } catch {
        // ignore tagging failures to keep loop resilient
      }
    }

    return { created, tagged };
  }

  _seedJobPostingToAgencies(){
    // find agencies that have be inserted to db using the seed. 
    // since we donth have the ids of ageniceis that were seeded beforehand ,
    //  we will get names form seed eg: in seed  "name": "Karnali Recruiters",
    // find agencies with names in [names froms seed ]
    // now we need to seed n job posting for each agencies 
    // well use the structure provided in hte /Users/code_shared/portal/agency_research/code/src/seed/jobs-to-agencies.seed.json
    // not the exact data 
    // the posting will be such that we can tell which job is posted by which agency 
    // eg:  "posting_title": "Job 1 from Karnali Recruiters",
    // now we need  to tag the jobs positings  what we  just created 
    //  @Patch(':license/job-postings/:id/tags')
    // Users/ajaydahal/portal/agency_research/code/src/modules/agency/agency.controller.ts

    // this way we have the use case flow
    // agencies exist 
    // agencies have jobs posting 
    // job postings have tags 

    // but first well check what test cases already exists relevant to this flow to understand the code better 
    // understand what already exists 
    // and plan hte implementation for the seed 
    
  }
}
