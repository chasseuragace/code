import { Controller, Get, Param, Query, ParseUUIDPipe, Post, Body, HttpCode, Delete, Put } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { JobPostingService, ExpenseService, InterviewService } from '../domain/domain.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { PaginatedJobsResponseDto } from './dto/candidate-job-card.dto';
import { CandidateJobDetailsDto } from '../domain/dto/job-details.dto';
import { CandidateCreateDto } from './dto/candidate-create.dto';
import { PreferenceDto, AddPreferenceDto, RemovePreferenceDto, ReorderPreferencesDto } from './dto/candidate-preferences.dto';
import { AddJobProfileDto } from './dto/job-profile.dto';
import { GroupedJobsResponseDto, CandidateCreatedResponseDto, AddJobProfileResponseDto } from './dto/candidate-responses.dto';

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
  ) {}

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
    // fetch candidate and job
    const cand: any = await this.candidates.findById(id);
    const jp: any = await this.jobs.findJobPostingById(jobId);

    // Candidate skills & education normalization (same as service)
    const candSkills = Array.isArray(cand?.skills)
      ? cand.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const candSkillsLower = candSkills.map((s: string) => s.toLowerCase());
    const candEdu = Array.isArray(cand?.education)
      ? cand.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    const candEduLower = candEdu.map((e: string) => e.toLowerCase());

    // Derive candidate years from skills
    const candYears = Array.isArray(cand?.skills)
      ? cand.skills.reduce((acc: number, s: any) => {
          if (typeof s?.duration_months === 'number') return acc + s.duration_months / 12;
          if (typeof s?.years === 'number') return acc + s.years;
          return acc;
        }, 0)
      : 0;

    // Compute fitness components against this job
    let parts = 0;
    let sumPct = 0;
    // skills overlap
    const js: string[] = Array.isArray(jp.skills) ? jp.skills : [];
    if (js.length) {
      const jsLower = js.map((x) => String(x).toLowerCase());
      const inter = candSkillsLower.filter((s: string) => jsLower.includes(s));
      const pct = js.length ? inter.length / js.length : 0;
      parts++; sumPct += pct;
    }
    // education overlap
    const je: string[] = Array.isArray(jp.education_requirements) ? jp.education_requirements : [];
    if (je.length) {
      const jeLower = je.map((x) => String(x).toLowerCase());
      const inter = candEduLower.filter((e: string) => jeLower.includes(e));
      const pct = je.length ? inter.length / je.length : 0;
      parts++; sumPct += pct;
    }
    // experience boundary
    const xr = jp.experience_requirements as { min_years?: number; max_years?: number } | undefined;
    if (xr && (typeof xr.min_years === 'number' || typeof xr.max_years === 'number')) {
      const minOk = typeof xr.min_years === 'number' ? candYears >= xr.min_years : true;
      const maxOk = typeof xr.max_years === 'number' ? candYears <= xr.max_years : true;
      const pct = minOk && maxOk ? 1 : 0;
      parts++; sumPct += pct;
    }
    const fitness_score = parts > 0 ? Math.round((sumPct / parts) * 100) : undefined;

    // Aggregate expenses and interview
    const ex = await this.expenses.getJobPostingExpenses(jobId);
    const interview = await this.interviews.findInterviewByJobPosting(jobId);

    return {
      id: jp.id,
      posting_title: jp.posting_title,
      country: jp.country,
      city: jp.city,
      announcement_type: jp.announcement_type,
      posting_date_ad: jp.posting_date_ad,
      notes: jp.notes ?? null,
      agency: jp.contracts?.[0]?.agency ? {
        name: jp.contracts[0].agency.name,
        license_number: jp.contracts[0].agency.license_number,
      } : null,
      employer: jp.contracts?.[0]?.employer ? {
        company_name: jp.contracts[0].employer.company_name,
        country: jp.contracts[0].employer.country,
        city: jp.contracts[0].employer.city,
      } : null,
      contract: jp.contracts?.[0] ? {
        period_years: jp.contracts[0].period_years,
        renewable: jp.contracts[0].renewable,
        hours_per_day: jp.contracts[0].hours_per_day,
        days_per_week: jp.contracts[0].days_per_week,
        overtime_policy: jp.contracts[0].overtime_policy,
        weekly_off_days: jp.contracts[0].weekly_off_days,
        food: jp.contracts[0].food,
        accommodation: jp.contracts[0].accommodation,
        transport: jp.contracts[0].transport,
        annual_leave_days: jp.contracts[0].annual_leave_days,
      } : null,
      positions: (jp.contracts?.[0]?.positions || []).map((p: any) => ({
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
      skills: jp.skills ?? [],
      education_requirements: jp.education_requirements ?? [],
      experience_requirements: jp.experience_requirements ?? null,
      canonical_titles: (jp.canonical_titles || []).map((t: any) => t.title),
      expenses: {
        medical: ex.medical ? [ex.medical] : [],
        insurance: ex.insurance ? [ex.insurance] : [],
        travel: ex.travel ? [ex.travel] : [],
        visa_permit: ex.visa ? [ex.visa] : [],
        training: ex.training ? [ex.training] : [],
        welfare_service: ex.welfare ? [ex.welfare] : [],
      },
      interview: interview ?? null,
      cutout_url: jp.cutout_url ?? null,
      fitness_score,
    } as CandidateJobDetailsDto;
  }

  // Add job profile (skills, education, trainings, experience; NOT preferred_titles)
  @Post(':id/job-profiles')
  @ApiOperation({ summary: 'Add a job profile to candidate (skills, education, trainings, experience)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiBody({ type: AddJobProfileDto, description: 'Profile blob holds skills, education, trainings, experience. Note: preferred_titles are NOT allowed here; use /preferences.' })
  @ApiCreatedResponse({ description: 'Job profile created', type: AddJobProfileResponseDto })
  @HttpCode(201)
  async addJobProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: AddJobProfileDto,
  ) {
    const saved = await this.candidates.addJobProfile(id, body);
    return { id: saved.id };
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
  @ApiQuery({ name: 'salary_min', required: false, description: 'Minimum salary amount' })
  @ApiQuery({ name: 'salary_max', required: false, description: 'Maximum salary amount' })
  @ApiQuery({ name: 'salary_currency', required: false, description: 'Salary currency code' })
  @ApiQuery({ name: 'salary_source', required: false, description: 'base|converted', enum: ['base', 'converted'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
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
    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true,
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

    const res = await this.candidates.getRelevantJobs(id, opts);
    // Map JobPosting entity to card DTO
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
    return { data, total: res.total, page: res.page, limit: res.limit };
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
    const opts: any = {
      country,
      combineWith: combineWith === 'OR' ? 'OR' : 'AND',
      useCanonicalTitles: toBool(useCanonicalTitles) ?? false,
      includeScore: toBool(includeScore) ?? true,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      preferredOverride: title ? [title] : undefined,
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
