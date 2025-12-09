import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  ParseUUIDPipe, 
  Post, 
  Body, 
  HttpCode, 
  Delete, 
  Put, 
  NotFoundException, 
  Req, 
  UseGuards, 
  BadRequestException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiResponse, 
  ApiTags, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiExtraModels,
  ApiConsumes
} from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { CandidateService } from './candidate.service';
import { ImageUploadService, UploadType } from '../shared/image-upload.service';
import { JobPostingService, InterviewService, ExpenseService } from '../domain/domain.service';
import { CurrencyConversionService } from '../currency/currency-conversion.service';
import { ApplicationService } from '../application/application.service';
import { FitnessScoreService } from '../shared/fitness-score.service';

import { PaginatedJobsResponseDto } from './dto/candidate-job-card.dto';
import { CandidateProfileDto } from './dto/candidate-profile.dto';
import { CandidateUpdateDto } from './dto/candidate-update.dto';
import { CandidateJobDetailsDto } from '../domain/dto/job-details.dto';
import { CandidateCreateDto } from './dto/candidate-create.dto';
import { 
  PreferenceDto, 
  AddPreferenceDto, 
  RemovePreferenceDto, 
  ReorderPreferencesDto 
} from './dto/candidate-preferences.dto';
import { 
  UpdateJobProfileDto, 
  CandidateJobProfileDto 
} from './dto/job-profile.dto';
import { 
  GroupedJobsResponseDto, 
  CandidateCreatedResponseDto, 
  AddJobProfileResponseDto 
} from './dto/candidate-responses.dto';
import { 
  CreateCandidateDocumentDto, 
  UpdateCandidateDocumentDto, 
  CandidateDocumentResponseDto, 
  UploadResponseDto 
} from './dto/candidate-document.dto';
import { DocumentsWithSlotsResponseDto } from './dto/document-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { 
  PaginatedInterviewsDto, 
  InterviewEnrichedDto, 
  EmployerLiteDto, 
  AgencyLiteDto, 
  PostingLiteDto, 
  InterviewExpenseDto, 
  InterviewScheduleDto 
} from '../domain/dto/interview-list.dto';
import { MobileJobPostingDto } from './dto/mobile-job.dto';

function toBool(val?: string): boolean | undefined {
  if (val == null) return undefined;
  return val === 'true' || val === '1';
}

@ApiTags('candidates')
@ApiExtraModels(PaginatedInterviewsDto, InterviewEnrichedDto, EmployerLiteDto, AgencyLiteDto, PostingLiteDto, InterviewExpenseDto, InterviewScheduleDto)
@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly candidates: CandidateService,
    private readonly jobPostingService: JobPostingService,
    private readonly currencyConversionService: CurrencyConversionService,
    private readonly interviewService: InterviewService,
    private readonly applicationService: ApplicationService,
    private readonly imageUploadService: ImageUploadService,
    private readonly fitnessScoreService: FitnessScoreService,
    private readonly expenseService: ExpenseService,
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

  // Mobile-friendly job details including match percentage (candidate-context)
  // GET /candidates/:id/jobs/:jobId/mobile
  @Get(':id/jobs/:jobId/mobile')
  @ApiOperation({ summary: 'Get mobile-optimized job details by ID (includes match percentage)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiParam({ name: 'jobId', description: 'Job Posting ID', required: true })
  @ApiOkResponse({ description: 'Mobile job projection', type: MobileJobPostingDto })
  async getJobMobile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('jobId', new ParseUUIDPipe({ version: '4' })) jobId: string,
  ): Promise<MobileJobPostingDto> {
    // Base mobile projection with salary conversions preference NPR > USD > first
    const mobile = await this.jobPostingService.jobbyidmobile(jobId);

    // Compute match percentage using unified FitnessScoreService
    const jp = await this.jobPostingService.findJobPostingById(jobId);
    const jobProfiles = await this.candidates.listJobProfiles(id);
    const mostRecentJobProfile = jobProfiles[0]; // ordered by updated_at DESC
    const profileBlob = (mostRecentJobProfile?.profile_blob as any) || {};

    const candidateProfile = this.fitnessScoreService.extractCandidateProfile(profileBlob);
    const jobRequirements = this.fitnessScoreService.extractJobRequirements(jp);
    const fitnessResult = this.fitnessScoreService.calculateScore(candidateProfile, jobRequirements);
    
    if (fitnessResult.score > 0) {
      mobile.matchPercentage = String(fitnessResult.score);
    }

    // Add hasApplied flag to positions
    const positionIds = mobile.positions?.map(p => p.id) || [];
    const appliedPositionIds = await this.applicationService.getAppliedPositionIds(id, positionIds);
    
    if (mobile.positions) {
      mobile.positions = mobile.positions.map(pos => ({
        ...pos,
        hasApplied: appliedPositionIds.has(pos.id)
      }));
    }

    // Get total applications count for this job posting
    const applicationsCount = await this.applicationService.countApplicationsByJobPosting(jobId);
    mobile.applications = applicationsCount;

    // Fetch and include expenses
    const expensesData = await this.expenseService.getJobPostingExpenses(jobId);
    mobile.expenses = {
      medical: expensesData.medical ? {
        domestic_who_pays: expensesData.medical.domestic_who_pays,
        domestic_is_free: expensesData.medical.domestic_is_free,
        domestic_amount: expensesData.medical.domestic_amount ? Number(expensesData.medical.domestic_amount) : undefined,
        domestic_currency: expensesData.medical.domestic_currency,
        foreign_who_pays: expensesData.medical.foreign_who_pays,
        foreign_is_free: expensesData.medical.foreign_is_free,
        foreign_amount: expensesData.medical.foreign_amount ? Number(expensesData.medical.foreign_amount) : undefined,
        foreign_currency: expensesData.medical.foreign_currency,
      } : null,
      insurance: expensesData.insurance ? {
        who_pays: expensesData.insurance.who_pays,
        is_free: expensesData.insurance.is_free,
        amount: expensesData.insurance.amount ? Number(expensesData.insurance.amount) : undefined,
        currency: expensesData.insurance.currency,
        coverage_amount: expensesData.insurance.coverage_amount ? Number(expensesData.insurance.coverage_amount) : undefined,
        coverage_currency: expensesData.insurance.coverage_currency,
      } : null,
      travel: expensesData.travel ? {
        who_provides: expensesData.travel.who_provides,
        ticket_type: expensesData.travel.ticket_type,
        is_free: expensesData.travel.is_free,
        amount: expensesData.travel.amount ? Number(expensesData.travel.amount) : undefined,
        currency: expensesData.travel.currency,
      } : null,
      visa_permit: expensesData.visa ? {
        who_pays: expensesData.visa.who_pays,
        is_free: expensesData.visa.is_free,
        amount: expensesData.visa.amount ? Number(expensesData.visa.amount) : undefined,
        currency: expensesData.visa.currency,
        refundable: expensesData.visa.refundable,
      } : null,
      training: expensesData.training ? {
        who_pays: expensesData.training.who_pays,
        is_free: expensesData.training.is_free,
        amount: expensesData.training.amount ? Number(expensesData.training.amount) : undefined,
        currency: expensesData.training.currency,
        duration_days: expensesData.training.duration_days,
        mandatory: expensesData.training.mandatory,
      } : null,
      welfare_service: expensesData.welfare ? {
        welfare_who_pays: expensesData.welfare.welfare_who_pays,
        welfare_is_free: expensesData.welfare.welfare_is_free,
        welfare_amount: expensesData.welfare.welfare_amount ? Number(expensesData.welfare.welfare_amount) : undefined,
        welfare_currency: expensesData.welfare.welfare_currency,
        service_who_pays: expensesData.welfare.service_who_pays,
        service_is_free: expensesData.welfare.service_is_free,
        service_amount: expensesData.welfare.service_amount ? Number(expensesData.welfare.service_amount) : undefined,
        service_currency: expensesData.welfare.service_currency,
      } : null,
    };

    return mobile as MobileJobPostingDto;
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
    const job = await this.jobPostingService.findJobPostingById(jobId);

    // Compute fitness using unified FitnessScoreService
    const candidateProfile = this.fitnessScoreService.extractCandidateProfile(profileBlob);
    const jobRequirements = this.fitnessScoreService.extractJobRequirements(job);
    const fitnessResult = this.fitnessScoreService.calculateScore(candidateProfile, jobRequirements);
    const fitness_score = fitnessResult.score > 0 ? fitnessResult.score : undefined;

    // Aggregate interview
    const interview = await this.interviewService.findInterviewByJobPosting(jobId);

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
      positions: await Promise.all(positions.map(async (p: any) => {
        // 🔥 RUNTIME CONVERSION - Replace stored conversions with live calculation
        let converted: Array<{ amount: number; currency: string }> = [];
        const baseAmount = Number(p.monthly_salary_amount);
        const currency = p.salary_currency;
        
        if (baseAmount && currency) {
          const conversions = await this.currencyConversionService.convertSalary(
            baseAmount,
            currency,
            ['NPR', 'USD']
          );
          converted = conversions;
        }

        return {
          title: p.title,
          vacancies: { male: p.male_vacancies, female: p.female_vacancies, total: p.total_vacancies },
          salary: {
            monthly_amount: baseAmount,
            currency: currency,
            converted: converted,
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
        };
      })),
      skills: job.skills ?? [],
      education_requirements: job.education_requirements ?? [],
      experience_requirements: (job.experience_requirements as any) ?? null,
      canonical_titles: (job.canonical_titles || []).map((t: any) => t.title),
      expenses: {
        medical: [],
        insurance: [],
        travel: [],
        visa_permit: [],
        training: [],
        welfare_service: [],
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
    const data = await Promise.all((res.data || []).map(async (jp: any) => {
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
      // 🔥 RUNTIME CONVERSION - Replace stored conversions with live calculation
      let converted: Array<{ amount: number; currency: string }> = [];
      if (positions.length && monthly_min && currency) {
        const conversions = await this.currencyConversionService.convertSalary(
          monthly_min,
          currency,
          ['NPR', 'USD']
        );
        converted = conversions;
      }
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
    }));
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
    
    // Collect all position IDs from all jobs for batch query
    const allPositionIds: string[] = [];
    for (const group of res.groups || []) {
      for (const job of group.jobs || []) {
        const contract = Array.isArray(job.contracts) ? job.contracts[0] : undefined;
        const positions = contract?.positions || [];
        allPositionIds.push(...positions.map((p: any) => p.id));
      }
    }
    
    // Batch query for applications
    const appliedPositionIds = await this.applicationService.getAppliedPositionIds(id, allPositionIds);
    
    // Map domain JobPosting to CandidateJobCardDto shape, similar to getRelevantJobsByTitle
    const groups = await Promise.all((res.groups || []).map(async (g: any) => {
      const jobs = await Promise.all((g.jobs || []).map(async (jp: any) => {
        const contract = Array.isArray(jp.contracts) ? jp.contracts[0] : undefined;
        const positions = contract?.positions || [];
        const titles = Array.from(new Set(positions.map((p: any) => p.title).filter(Boolean))) as string[];
        
        // Process positions for the response
        const positionDtos = await Promise.all(positions.map(async (position: any) => {
          let convertedSalaries: Array<{ amount: number; currency: string }> = [];
          
          // Convert salary to other currencies if needed
          if (position.monthly_salary_amount && position.salary_currency) {
            const conversions = await this.currencyConversionService.convertSalary(
              position.monthly_salary_amount,
              position.salary_currency,
              ['NPR', 'USD']
            );
            convertedSalaries = conversions;
          }
          
          return {
            id: position.id,
            title: position.title,
            male_vacancies: position.male_vacancies || 0,
            female_vacancies: position.female_vacancies || 0,
            total_vacancies: position.total_vacancies || 0,
            monthly_salary_amount: position.monthly_salary_amount,
            salary_currency: position.salary_currency,
            salary_display: `${position.monthly_salary_amount} ${position.salary_currency}`,
            converted_salaries: convertedSalaries,
            notes: position.position_notes,
            has_applied: appliedPositionIds.has(position.id)
          };
        }));
        
        // Calculate salary range for the job card
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
        // 🔥 RUNTIME CONVERSION - Replace stored conversions with live calculation
        let converted: Array<{ amount: number; currency: string }> = [];
        if (positions.length && monthly_min && currency) {
          const conversions = await this.currencyConversionService.convertSalary(
            monthly_min,
            currency,
            ['NPR', 'USD']
          );
          converted = conversions;
        }
        return {
          id: jp.id,
          posting_title: jp.posting_title,
          country: jp.country,
          city: jp.city ?? null,
          primary_titles: titles,
          salary: { monthly_min, monthly_max, currency, converted },
          agency: contract?.agency ? { name: contract.agency.name, license_number: contract.agency.license_number } : undefined,
          employer: contract?.employer ? { 
            company_name: contract.employer.company_name, 
            country: contract.employer.country, 
            city: contract.employer.city 
          } : undefined,
          posting_date_ad: jp.posting_date_ad ?? null,
          cutout_url: jp.cutout_url ?? null,
          fitness_score: (jp as any).fitness_score,
          positions: positionDtos,
        };
      }));
      return { title: g.title, jobs };
    }));
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
    const data = await Promise.all((res.data || []).map(async (jp: any) => {
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
          .map((p: any) => {
            // Ensure monthly_salary_amount is a number
            const amount = typeof p.monthly_salary_amount === 'string' 
              ? parseFloat(p.monthly_salary_amount) 
              : p.monthly_salary_amount;
            return typeof amount === 'number' ? amount : 0;
          })
          .filter((n: number) => !isNaN(n) && isFinite(n));
        if (amounts.length) {
          monthly_min = Math.min(...amounts);
          monthly_max = Math.max(...amounts);
        }
      }
      // 🔥 RUNTIME CONVERSION - Replace stored conversions with live calculation
      let converted: Array<{ amount: number; currency: string }> = [];
      if (positions.length && monthly_min && currency) {
        const conversions = await this.currencyConversionService.convertSalary(
          monthly_min,
          currency,
          ['NPR', 'USD']
        );
        converted = conversions;
      }
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
    }));
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
  @ApiOkResponse({ description: 'Paginated list of interviews', type: PaginatedInterviewsDto })
  async listInterviews(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('only_upcoming') onlyUpcoming: string = 'true',
    @Query('order') order: 'upcoming' | 'recent' = 'upcoming',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<PaginatedInterviewsDto> {
    const res = await this.interviewService.listByCandidate({ 
      candidateId: id, 
      only_upcoming: onlyUpcoming === 'true', 
      order,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    // Map to InterviewEnrichedDto shape to match Swagger contract
    const items: InterviewEnrichedDto[] = res.items.map((it: any) => ({
      id: it.id,
      schedule: {
        date_ad: it.interview_date_ad ? new Date(it.interview_date_ad).toISOString().slice(0, 10) : null,
        date_bs: it.interview_date_bs ?? null,
        time: it.interview_time ?? null,
      },
      location: it.location ?? null,
      contact_person: it.contact_person ?? null,
      required_documents: it.required_documents ?? null,
      notes: it.notes ?? null,
      application: it.job_application_id ? { id: it._app_id, status: it._app_status } : null,
      posting: {
        id: it.job_posting?.id,
        posting_title: it.job_posting?.posting_title,
        country: it.job_posting?.country,
        city: it.job_posting?.city ?? null,
      },
      agency: it._agency,
      employer: it._employer,
      expenses: (it.expenses || []).map((e: any) => ({
        expense_type: e.expense_type,
        who_pays: e.who_pays,
        is_free: !!e.is_free,
        amount: e.amount != null ? Number(e.amount) : undefined,
        currency: e.currency ?? undefined,
        refundable: !!e.refundable,
        notes: e.notes ?? undefined,
      })),
    }));

    return { page: res.page, limit: res.limit, total: res.total, items };
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

  // POST /candidates/:id/profile-image - Upload candidate profile image
  @Post(':id/profile-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload candidate profile image' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Profile image uploaded successfully', type: UploadResponseDto })
  async uploadProfileImage(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Upload the file
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.CANDIDATE_PROFILE,
      id
    );

    if (result.success && result.url) {
      // Update candidate profile_image field
      await this.candidates.updateProfileImage(id, result.url);
    }

    return result;
  }

  // DELETE /candidates/:id/profile-image - Remove candidate profile image
  @Delete(':id/profile-image')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove candidate profile image' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ description: 'Profile image removed successfully', type: UploadResponseDto })
  async deleteProfileImage(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UploadResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Delete the file
    const result = await this.imageUploadService.deleteFile(
      UploadType.CANDIDATE_PROFILE,
      id
    );

    if (result.success) {
      // Clear candidate profile_image field
      await this.candidates.updateProfileImage(id, null);
    }

    return result;
  }

  // POST /candidates/:id/media - Upload file to candidate's media manager
  @Post(':id/media')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to candidate media manager (images and documents)' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (Images: JPEG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX) - Max 10MB',
        },
      },
    },
  })
  @ApiCreatedResponse({ 
    description: 'File uploaded to media manager successfully', 
    type: UploadResponseDto 
  })
  async uploadMediaFile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Upload the file to mediamanager folder
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.CANDIDATE_MEDIA,
      id
    );

    return result;
  }

  // GET /candidates/:id/media - List all media files for candidate
  @Get(':id/media')
  @ApiOperation({ summary: 'List all media files for candidate' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ 
    description: 'List of media files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fileName: { type: 'string' },
              url: { type: 'string' },
              size: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async listMediaImages(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.imageUploadService.listMediaFiles(id);
  }

  // POST /candidates/:id/documents - Upload candidate document
  @Post(':id/documents')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload candidate document' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'document_type_id', 'name'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        document_type_id: {
          type: 'string',
          format: 'uuid',
          description: 'Document type ID',
        },
        name: {
          type: 'string',
          description: 'Document name',
        },
        description: {
          type: 'string',
          description: 'Document description',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Document uploaded successfully', type: CandidateDocumentResponseDto })
  async uploadDocument(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCandidateDocumentDto,
  ): Promise<CandidateDocumentResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Validate document_type_id is provided
    if (!body.document_type_id) {
      throw new BadRequestException('document_type_id is required');
    }

    // Create document record first to get ID
    const document = await this.candidates.createDocument(id, {
      document_type_id: body.document_type_id,
      name: body.name,
      description: body.description,
      notes: body.notes,
      document_url: '', // Will be updated after upload
      file_type: file.mimetype,
      file_size: file.size,
    });

    // Upload the file with document ID
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.CANDIDATE_DOCUMENT,
      id,
      document.id
    );

    if (result.success && result.url) {
      // Update document with the actual URL
      await this.candidates.updateDocumentUrl(document.id, result.url);
      document.document_url = result.url;
    } else {
      // If upload failed, delete the document record
      await this.candidates.deleteDocument(document.id);
      throw new BadRequestException(result.error || 'Failed to upload document');
    }

    return document;
  }

  // GET /candidates/:id/documents - List candidate documents with slots
  @Get(':id/documents')
  @ApiOperation({ 
    summary: 'List candidate documents with slots',
    description: 'Returns all document types with upload status for the candidate'
  })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiOkResponse({ 
    description: 'Document slots with upload status and summary', 
    type: DocumentsWithSlotsResponseDto 
  })
  async listDocuments(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DocumentsWithSlotsResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return await this.candidates.getDocumentsWithSlots(id);
  }

  // DELETE /candidates/:id/documents/:documentId - Remove candidate document
  @Delete(':id/documents/:documentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove candidate document' })
  @ApiParam({ name: 'id', description: 'Candidate ID', required: true })
  @ApiParam({ name: 'documentId', description: 'Document ID', required: true })
  @ApiOkResponse({ description: 'Document removed successfully', type: UploadResponseDto })
  async deleteDocument(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('documentId', new ParseUUIDPipe({ version: '4' })) documentId: string,
  ): Promise<UploadResponseDto> {
    // Verify candidate exists
    const candidate = await this.candidates.findById(id);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Get document to find file name
    const document = await this.candidates.findDocumentById(documentId);
    if (!document || document.candidate_id !== id) {
      throw new NotFoundException('Document not found');
    }

    // Extract filename from URL
    const fileName = document.document_url.split('/').pop();

    // Delete the file
    const result = await this.imageUploadService.deleteFile(
      UploadType.CANDIDATE_DOCUMENT,
      id,
      fileName
    );

    // Delete document record regardless of file deletion result
    await this.candidates.deleteDocument(documentId);

    return {
      success: true,
      message: 'Document removed successfully'
    };
  }
}
