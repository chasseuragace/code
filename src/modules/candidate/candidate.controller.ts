import { Controller, Get, Param, Query, ParseUUIDPipe, Post, Body, HttpCode, Delete, Put, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { JobPostingService, ExpenseService, InterviewService } from '../domain/domain.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { PaginatedJobsResponseDto } from './dto/candidate-job-card.dto';
import { CandidateProfileDto } from './dto/candidate-profile.dto';
import { CandidateUpdateDto } from './dto/candidate-update.dto';
import { CandidateJobDetailsDto } from '../domain/dto/job-details.dto';
import { CandidateCreateDto } from './dto/candidate-create.dto';
import { PreferenceDto, AddPreferenceDto, RemovePreferenceDto, ReorderPreferencesDto } from './dto/candidate-preferences.dto';
import { UpdateJobProfileDto, CandidateJobProfileDto } from './dto/job-profile.dto';
import { GroupedJobsResponseDto, CandidateCreatedResponseDto, AddJobProfileResponseDto } from './dto/candidate-responses.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

function toBool(val?: string): boolean | undefined {
  if (val == null) return undefined;
  return val === 'true' || val === '1';
}

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidates: CandidateService,
    private readonly jobs: JobPostingService,
    private readonly expenses: ExpenseService,
    private readonly interviews: InterviewService,
    private readonly auth: AuthService,
  ) {}

  // Get candidate profile
  // GET /candidates/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get candidate profile by ID' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ status: 200, description: 'Candidate profile', type: CandidateProfileDto })
  async getCandidateProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CandidateProfileDto> {
    const cand = await this.candidates.findById(id);
    if (!cand) throw new NotFoundException('Candidate not found');
    // Direct mapping: entity fields align with DTO properties
    return cand as unknown as CandidateProfileDto;
  }

  // Update candidate profile
  // PUT /candidates/:id
  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update candidate profile by ID' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ type: CandidateUpdateDto })
  @ApiOkResponse({ status: 200, description: 'Updated candidate profile', type: CandidateProfileDto })
  async updateCandidateProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: CandidateUpdateDto,
  ): Promise<CandidateProfileDto> {
    const updated = await this.candidates.updateCandidate(id, body as any);
    return updated as unknown as CandidateProfileDto;
  }

  // Create candidate (minimal public endpoint)
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a candidate' })
  @ApiBody({ type: CandidateCreateDto })
  @ApiCreatedResponse({ description: 'Candidate created', type: CandidateCreatedResponseDto })
  async createCandidate(@Body() body: Partial<any>) {
    const saved = await this.candidates.createCandidate(body);
    return { id: saved.id };
  }

  // Candidate-context job details with fitness_score
  // GET /candidates/:id/jobs/:jobId
  @Get(':id/jobs/:jobId')
  @ApiOperation({ summary: 'Get job details with candidate-specific fitness score' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiParam({ name: 'jobId', description: 'Job Posting ID', required: true })
  @ApiOkResponse({ description: 'Job details with fitness_score', type: CandidateJobDetailsDto })
  async getJobDetailsWithFitness(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('jobId', new ParseUUIDPipe({ version: '4' })) jobId: string,
  ): Promise<CandidateJobDetailsDto> {
    // Fetch candidate and most recent job profile (candidate-context)
    const cand: any = await this.candidates.findById(id);
    if (!cand) throw new NotFoundException('Candidate not found');
    const jobProfiles = await this.candidates.listJobProfiles(id);
    const mostRecentJobProfile = jobProfiles[0]; // ordered by updated_at DESC
    const profileBlob = (mostRecentJobProfile?.profile_blob as any) || {};

    // Load the actual job posting by ID
    const job = await this.jobs.findJobPostingById(jobId);

    // Extract candidate-side attributes
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const skillsLower = skills.map((s: string) => s.toLowerCase());

    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const educationLower = education.map((e: string) => e.toLowerCase());

    // Candidate years derived from skills
    const years = Array.isArray(profileBlob.skills)
      ? profileBlob.skills.reduce((acc: number, s: any) => {
          if (typeof s?.duration_months === 'number') return acc + s.duration_months / 12;
          if (typeof s?.years === 'number') return acc + s.years;
          return acc;
        }, 0)
      : 0;

    // Compute fitness against the real job's requirements
    let parts = 0;
    let sumPct = 0;

    // Job skills overlap
    const js: string[] = Array.isArray(job.skills) ? job.skills : [];
    if (js.length) {
      const jsLower = js.map((x) => String(x).toLowerCase());
      const inter = skillsLower.filter((s: string) => jsLower.includes(s));
      const pct = js.length ? inter.length / js.length : 0;
      parts++;
      sumPct += pct;
    }

    // Job education overlap
    const je: string[] = Array.isArray(job.education_requirements) ? job.education_requirements : [];
    if (je.length) {
      const jeLower = je.map((x) => String(x).toLowerCase());
      const inter = educationLower.filter((e: string) => jeLower.includes(e));
      const pct = je.length ? inter.length / je.length : 0;
      parts++;
      sumPct += pct;
    }

    // Job experience boundary
    const xr = job.experience_requirements as { min_years?: number; max_years?: number } | undefined;
    if (xr && (typeof xr.min_years === 'number' || typeof xr.max_years === 'number')) {
      const minOk = typeof xr.min_years === 'number' ? years >= xr.min_years : true;
      const maxOk = typeof xr.max_years === 'number' ? years <= xr.max_years : true;
      const pct = minOk && maxOk ? 1 : 0;
      parts++;
      sumPct += pct;
    }
    const fitness_score = parts > 0 ? Math.round((sumPct / parts) * 100) : undefined;

    // Aggregate expenses and interview
    const ex = await this.expenses.getJobPostingExpenses(jobId);
    const interview = await this.interviews.findInterviewByJobPosting(jobId);

    // Build response from the real job entity
    const contract = Array.isArray(job.contracts) ? job.contracts[0] : undefined;
    const positions = contract?.positions || [];
    return {
      id: job.id,
      posting_title: job.posting_title,
      country: job.country,
      city: job.city ?? null,
      announcement_type: job.announcement_type,
      posting_date_ad: job.posting_date_ad,
      notes: job.notes ?? null,
      agency: contract?.agency
        ? {
            name: contract.agency.name,
            license_number: contract.agency.license_number,
          }
        : null,
      employer: contract?.employer
        ? {
            company_name: contract.employer.company_name,
            country: contract.employer.country,
            city: contract.employer.city,
          }
        : null,
      contract: contract
        ? {
            period_years: contract.period_years,
            renewable: contract.renewable,
            hours_per_day: contract.hours_per_day,
            days_per_week: contract.days_per_week,
            overtime_policy: contract.overtime_policy,
            weekly_off_days: contract.weekly_off_days,
            food: contract.food,
            accommodation: contract.accommodation,
            transport: contract.transport,
            annual_leave_days: contract.annual_leave_days,
          }
        : null,
      positions: positions.map((p: any) => ({
        title: p.title,
        vacancies: { male: p.male_vacancies, female: p.female_vacancies, total: p.total_vacancies },
        salary: {
          monthly_amount: Number(p.monthly_salary_amount),
          currency: p.salary_currency,
          converted: (p.salaryConversions || []).map((c: any) => ({ amount: Number(c.converted_amount), currency: c.converted_currency })),
        },
        overrides: {
          hours_per_day: p.hours_per_day_override ?? null,
          days_per_week: p.days_per_week_override ?? null,
          overtime_policy: p.overtime_policy_override ?? null,
          weekly_off_days: p.weekly_off_days_override ?? null,
          food: p.food_override ?? null,
          accommodation: p.accommodation_override ?? null,
          transport: p.transport_override ?? null,
        },
      })),
      skills: job.skills ?? [],
      education_requirements: job.education_requirements ?? [],
      experience_requirements: (job.experience_requirements as any) ?? null,
      canonical_titles: (job.canonical_titles || []).map((t: any) => t.title),
      expenses: {
        medical: ex.medical ? [ex.medical] : [],
        insurance: ex.insurance ? [ex.insurance] : [],
        travel: ex.travel ? [ex.travel] : [],
        visa_permit: ex.visa ? [ex.visa] : [],
        training: ex.training ? [ex.training] : [],
        welfare_service: ex.welfare ? [ex.welfare] : [],
      },
      interview: interview ?? null,
      cutout_url: job.cutout_url ?? null,
      fitness_score,
    } as CandidateJobDetailsDto;
  }

  // Removed: Add job profile endpoint. Use updateJobProfile which auto-creates when none exists.

  // Update job profile (auto-creates if not exists)
  @Put(':id/job-profiles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update the candidate job profile (auto-creates if not exists)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ 
    type: UpdateJobProfileDto, 
    description: 'Partial update to job profile. Will create profile if none exists.' 
  })
  @ApiOkResponse({ 
    description: 'Job profile updated or created', 
    type: AddJobProfileResponseDto 
  })
  async updateJobProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateJobProfileDto,
  ) {
    const saved = await this.candidates.updateJobProfile(id, body);
    return { id: saved.id };
  }

  // List job profiles for a candidate ordered by updated_at DESC
  // GET /candidates/:id/job-profiles
  @Get(':id/job-profiles')
  @ApiOperation({ summary: 'List candidate job profiles (ordered by updated_at desc)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ status: 200, description: 'Candidate job profiles', type: CandidateJobProfileDto, isArray: true })
  async listJobProfiles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CandidateJobProfileDto[]> {
    const rows = await this.candidates.listJobProfiles(id);
    // Directly return; entity shape matches DTO fields used for documentation
    return rows as unknown as CandidateJobProfileDto[];
  }

  // Public-facing: list relevant jobs for a candidate with optional matching flags
  // GET /candidates/:id/relevant-jobs?country=UAE&combineWith=AND&useCanonicalTitles=true&includeScore=true&page=1&limit=10
  // Optional salary query params: salary_min, salary_max, salary_currency, salary_source (= base | converted)
  @Get(':id/relevant-jobs')
  @ApiOperation({ summary: 'List relevant jobs for a candidate (fitness_score included by default)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiQuery({ name: 'country', required: false, description: 'Single or multiple (CSV/array) country filter' })
  @ApiQuery({ name: 'combineWith', required: false, description: 'AND|OR combination with preferences', enum: ['AND', 'OR'] })
  @ApiQuery({ name: 'useCanonicalTitles', required: false, description: 'true|false' })
  @ApiQuery({ name: 'includeScore', required: false, description: 'true|false (defaults to true)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'salary_min', required: false, description: 'Minimum salary amount' })
  @ApiQuery({ name: 'salary_max', required: false, description: 'Maximum salary amount' })
  @ApiQuery({ name: 'salary_currency', required: false, description: 'Salary currency code' })
  @ApiQuery({ name: 'salary_source', required: false, description: 'base|converted', enum: ['base', 'converted'] })
  @ApiOkResponse({ status: 200, description: 'Paginated relevant jobs with fitness_score', type: PaginatedJobsResponseDto })
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
  ): Promise<PaginatedJobsResponseDto> {
    const jobProfile = await this.candidates.listJobProfiles(id);
    const mostRecentJobProfile = jobProfile[0]; // ordered by updated_at DESC
    const profileBlob = mostRecentJobProfile?.profile_blob as any || {};

    // Extract skills and education from job profile blob
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const skillsLower = skills.map((s: string) => s.toLowerCase());

    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const educationLower = education.map((e: string) => e.toLowerCase());

    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      skills,
      education,
    };
    if (salaryMin || salaryMax || salaryCurrency || salarySource) {
      opts.salary = {
        min: salaryMin ? parseFloat(salaryMin) : undefined,
        max: salaryMax ? parseFloat(salaryMax) : undefined,
        currency: salaryCurrency,
        source: salarySource === 'converted' ? 'converted' : 'base',
      };
    }

    const res = await this.candidates.getRelevantJobs(id, opts);
    // Map JobPosting entity to CandidateJobCardDto shape, similar to getRelevantJobsByTitle
    const data = (res.data || []).map((jp: any) => {
      const contract = Array.isArray(jp.contracts) ? jp.contracts[0] : undefined;
      const positions = contract?.positions || [];
      const titles = Array.from(new Set(positions.map((p: any) => p.title).filter(Boolean))) as string[];
      // base salary min/max within same currency if consistent; fallback to first
      let monthly_min: number | null = null;
      let monthly_max: number | null = null;
      let currency: string | null = null;
      if (positions.length) {
        currency = positions[0].salary_currency || null;
        const amounts = positions
          .filter((p: any) => p.salary_currency === currency)
          .map((p: any) => Number(p.monthly_salary_amount))
          .filter((n: any) => !isNaN(n));
        if (amounts.length) {
          monthly_min = Math.min(...amounts);
          monthly_max = Math.max(...amounts);
        }
      }
      const converted = positions[0]?.salaryConversions?.map((c: any) => ({ amount: Number(c.converted_amount), currency: c.converted_currency })) || [];
      return {
        id: jp.id,
        posting_title: jp.posting_title,
        country: jp.country,
        city: jp.city ?? null,
        primary_titles: titles,
        salary: { monthly_min, monthly_max, currency, converted },
        agency: contract?.agency ? { name: contract.agency.name, license_number: contract.agency.license_number } : undefined,
        employer: contract?.employer ? { company_name: contract.employer.company_name, country: contract.employer.country, city: contract.employer.city } : undefined,
        posting_date_ad: jp.posting_date_ad ?? null,
        cutout_url: jp.cutout_url ?? null,
        fitness_score: (jp as any).fitness_score,
      };
    });
    // Order by fitness_score desc when available
    const ordered = data.slice().sort((a: any, b: any) => ((b.fitness_score ?? 0) - (a.fitness_score ?? 0)));
    return { data: ordered, total: res.total, page: res.page, limit: res.limit };
  }

  // Grouped relevant jobs by preferred titles
  // GET /candidates/:id/relevant-jobs/grouped
  @Get(':id/relevant-jobs/grouped')
  @ApiOperation({ summary: 'Relevant jobs grouped by each preferred title (includes fitness_score)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'combineWith', required: false, enum: ['AND', 'OR'] })
  @ApiQuery({ name: 'useCanonicalTitles', required: false })
  @ApiQuery({ name: 'includeScore', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'salary_min', required: false })
  @ApiQuery({ name: 'salary_max', required: false })
  @ApiQuery({ name: 'salary_currency', required: false })
  @ApiQuery({ name: 'salary_source', required: false, enum: ['base', 'converted'] })
  @ApiOkResponse({ status: 200, description: 'Grouped relevant jobs with fitness_score', type: GroupedJobsResponseDto })
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
    const jobProfile = await this.candidates.listJobProfiles(id);
    const mostRecentJobProfile = jobProfile[0]; // ordered by updated_at DESC
    const profileBlob = mostRecentJobProfile?.profile_blob as any || {};

    // Extract skills and education from job profile blob
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const skillsLower = skills.map((s: string) => s.toLowerCase());

    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const educationLower = education.map((e: string) => e.toLowerCase());

    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true, // default true for grouped to ensure scoring
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      skills,
      education,
    };
    if (salaryMin || salaryMax || salaryCurrency || salarySource) {
      opts.salary = {
        min: salaryMin ? parseFloat(salaryMin) : undefined,
        max: salaryMax ? parseFloat(salaryMax) : undefined,
        currency: salaryCurrency,
        source: salarySource === 'converted' ? 'converted' : 'base',
      };
    }

    const res = await this.candidates.getRelevantJobsGrouped(id, opts);
    // Map domain JobPosting to CandidateJobCardDto shape, similar to getRelevantJobsByTitle
    const groups = (res.groups || []).map((g: any) => {
      const jobs = (g.jobs || []).map((jp: any) => {
        const contract = Array.isArray(jp.contracts) ? jp.contracts[0] : undefined;
        const positions = contract?.positions || [];
        const titles = Array.from(new Set(positions.map((p: any) => p.title).filter(Boolean))) as string[];
        let monthly_min: number | null = null;
        let monthly_max: number | null = null;
        let currency: string | null = null;
        if (positions.length) {
          currency = positions[0].salary_currency || null;
          const amounts = positions
            .filter((p: any) => p.salary_currency === currency)
            .map((p: any) => Number(p.monthly_salary_amount))
            .filter((n: any) => !isNaN(n));
          if (amounts.length) {
            monthly_min = Math.min(...amounts);
            monthly_max = Math.max(...amounts);
          }
        }
        const converted = positions[0]?.salaryConversions?.map((c: any) => ({ amount: Number(c.converted_amount), currency: c.converted_currency })) || [];
        return {
          id: jp.id,
          posting_title: jp.posting_title,
          country: jp.country,
          city: jp.city ?? null,
          primary_titles: titles,
          salary: { monthly_min, monthly_max, currency, converted },
          agency: contract?.agency ? { name: contract.agency.name, license_number: contract.agency.license_number } : undefined,
          employer: contract?.employer ? { company_name: contract.employer.company_name, country: contract.employer.country, city: contract.employer.city } : undefined,
          posting_date_ad: jp.posting_date_ad ?? null,
          cutout_url: jp.cutout_url ?? null,
          fitness_score: (jp as any).fitness_score,
        };
      });
      return { title: g.title, jobs };
    });
    return { groups } as GroupedJobsResponseDto;
  }

  // Relevant jobs for a single preferred title (paginated)
  // GET /candidates/:id/relevant-jobs/by-title?title=Electrician&page=1&limit=10&useCanonicalTitles=true&includeScore=true
  @Get(':id/relevant-jobs/by-title')
  @ApiOperation({ summary: 'Relevant jobs for one preferred title (fitness_score included by default)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiQuery({ name: 'title', required: true })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'combineWith', required: false, enum: ['AND', 'OR'] })
  @ApiQuery({ name: 'useCanonicalTitles', required: false })
  @ApiQuery({ name: 'includeScore', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'salary_min', required: false })
  @ApiQuery({ name: 'salary_max', required: false })
  @ApiQuery({ name: 'salary_currency', required: false })
  @ApiQuery({ name: 'salary_source', required: false, enum: ['base', 'converted'] })
  @ApiResponse({ status: 200, description: 'Paginated relevant jobs for a single title with fitness_score', type: PaginatedJobsResponseDto })
  async getRelevantJobsByTitle(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('title') title: string,
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
  ): Promise<PaginatedJobsResponseDto> {
    const jobProfile = await this.candidates.listJobProfiles(id);
    const mostRecentJobProfile = jobProfile[0]; // ordered by updated_at DESC
    const profileBlob = mostRecentJobProfile?.profile_blob as any || {};

    // Extract skills and education from job profile blob
    const skills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const skillsLower = skills.map((s: string) => s.toLowerCase());

    const education = Array.isArray(profileBlob.education)
      ? profileBlob.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const educationLower = education.map((e: string) => e.toLowerCase());

    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      preferredOverride: title ? [title] : undefined,
      skills,
      education,
    };
    if (salaryMin || salaryMax || salaryCurrency || salarySource) {
      opts.salary = {
        min: salaryMin ? parseFloat(salaryMin) : undefined,
        max: salaryMax ? parseFloat(salaryMax) : undefined,
        currency: salaryCurrency,
        source: salarySource === 'converted' ? 'converted' : 'base',
      };
    }
    const res = await this.candidates.getRelevantJobs(id, opts);
    const data = (res.data || []).map((jp: any) => {
      const contract = Array.isArray(jp.contracts) ? jp.contracts[0] : undefined;
      const positions = contract?.positions || [];
      const titles = Array.from(new Set(positions.map((p: any) => p.title).filter(Boolean))) as string[];
      let monthly_min: number | null = null;
      let monthly_max: number | null = null;
      let currency: string | null = null;
      if (positions.length) {
        currency = positions[0].salary_currency || null;
        const amounts = positions
          .filter((p: any) => p.salary_currency === currency)
          .map((p: any) => Number(p.monthly_salary_amount))
          .filter((n: any) => !isNaN(n));
        if (amounts.length) {
          monthly_min = Math.min(...amounts);
          monthly_max = Math.max(...amounts);
        }
      }
      const converted = positions[0]?.salaryConversions?.map((c: any) => ({ amount: Number(c.converted_amount), currency: c.converted_currency })) || [];
      return {
        id: jp.id,
        posting_title: jp.posting_title,
        country: jp.country,
        city: jp.city ?? null,
        primary_titles: titles,
        salary: { monthly_min, monthly_max, currency, converted },
        agency: contract?.agency ? { name: contract.agency.name, license_number: contract.agency.license_number } : undefined,
        employer: contract?.employer ? { company_name: contract.employer.company_name, country: contract.employer.country, city: contract.employer.city } : undefined,
        posting_date_ad: jp.posting_date_ad ?? null,
        cutout_url: jp.cutout_url ?? null,
        fitness_score: (jp as any).fitness_score,
      };
    });
    return { data, total: res.total, page: res.page, limit: res.limit };
  }

  // List interviews for a candidate
  @Get(':id/interviews')
  @ApiOperation({ summary: 'List interviews for a candidate' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiQuery({ 
    name: 'only_upcoming', 
    required: false, 
    description: 'If true, returns only upcoming interviews (default: true). If false, returns all interviews.',
    type: Boolean,
    example: true
  })
  @ApiQuery({ 
    name: 'order', 
    required: false, 
    description: 'Order of interviews. "upcoming" orders by date ascending (closest first), "recent" orders by date descending (most recent first).',
    enum: ['upcoming', 'recent'],
    example: 'upcoming'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number for pagination (default: 1)',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Number of items per page (default: 10, max: 100)',
    type: Number,
    example: 10
  })
  @ApiOkResponse({ description: 'Paginated list of interviews', type: Object })
  async listInterviews(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('only_upcoming') onlyUpcoming: string = 'true',
    @Query('order') order: 'upcoming' | 'recent' = 'upcoming',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const res = await this.interviews.listByCandidate({ 
      candidateId: id, 
      only_upcoming: onlyUpcoming === 'true', 
      order,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res;
  }

  // Preferences CRUD
  // GET /candidates/:id/preferences
  @Get(':id/preferences')
  @ApiOperation({ summary: 'List candidate preferences (id, title, priority)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ description: 'Ordered preferences', type: PreferenceDto, isArray: true })
  async listPreferences(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const rows = await this.candidates.listPreferenceRows(id);
    return rows.map((r) => ({ id: r.id, title: r.title, priority: r.priority, job_title_id: r.job_title_id ?? null }));
  }

  // POST /candidates/:id/preferences { title }
  @Post(':id/preferences')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a preference (validated against active JobTitle)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ type: AddPreferenceDto })
  @ApiCreatedResponse({ description: 'Preference added or moved to top', type: PreferenceDto, isArray: true })
  async addPreference(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: AddPreferenceDto,
  ) {
    await this.candidates.addPreference(id, body?.title);
    const rows = await this.candidates.listPreferenceRows(id);
    return rows.map((r) => ({ id: r.id, title: r.title, priority: r.priority, job_title_id: r.job_title_id ?? null }));
  }

  // DELETE /candidates/:id/preferences { title }
  // Alternatively, you can adapt to DELETE /candidates/:id/preferences?title=...
  @Delete(':id/preferences')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove a preference by title (idempotent)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ type: RemovePreferenceDto })
  @ApiOkResponse({ description: 'Updated preferences after removal', type: PreferenceDto, isArray: true })
  async removePreference(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: RemovePreferenceDto,
  ) {
    await this.candidates.removePreference(id, body?.title);
    const rows = await this.candidates.listPreferenceRows(id);
    return rows.map((r) => ({ id: r.id, title: r.title, priority: r.priority, job_title_id: r.job_title_id ?? null }));
  }

  // PUT /candidates/:id/preferences/order { orderedIds?: string[]; orderedTitles?: string[] }
  // Frontend should prefer orderedIds for stability.
  @Put(':id/preferences/order')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reorder preferences by IDs (preferred) or titles' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ type: ReorderPreferencesDto })
  @ApiOkResponse({ status: 200, description: 'Updated ordered preferences', type: PreferenceDto, isArray: true })
  async reorderPreferences(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: ReorderPreferencesDto,
  ) {
    if (Array.isArray(body?.orderedIds) && body.orderedIds.length > 0) {
      await this.candidates.reorderPreferencesByIds(id, body.orderedIds);
    } else if (Array.isArray(body?.orderedTitles) && body.orderedTitles.length > 0) {
      await this.candidates.reorderPreferences(id, body.orderedTitles);
    } else {
      // No-op if nothing provided; but better to signal bad request
      throw new Error('Provide orderedIds (preferred) or orderedTitles');
    }
    const rows = await this.candidates.listPreferenceRows(id);
    return rows.map((r) => ({ id: r.id, title: r.title, priority: r.priority, job_title_id: r.job_title_id ?? null }));
  }
}
