import { Controller, Get, HttpCode, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { JobPostingService, ExpenseService, InterviewService } from './domain.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class PublicJobsController {
  constructor(
    private readonly jobs: JobPostingService,
    private readonly expenses: ExpenseService,
    private readonly interviews: InterviewService,
  ) {}

  // Public job search with keyword and filters
  @Get('search')
  @ApiOperation({ summary: 'Search jobs by keyword with filters' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search across job title, position title, employer, agency' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country (ILIKE)' })
  @ApiQuery({ name: 'min_salary', required: false, type: Number, description: 'Minimum salary amount' })
  @ApiQuery({ name: 'max_salary', required: false, type: Number, description: 'Maximum salary amount' })
  @ApiQuery({ name: 'currency', required: false, description: 'Currency for salary filtering (e.g., AED, USD, NPR)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['posted_at', 'salary', 'relevance'], description: 'Sort by field (default: posted_at)' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  @HttpCode(200)
  async searchJobs(
    @Query('keyword') keyword?: string,
    @Query('country') country?: string,
    @Query('min_salary') min_salary?: string,
    @Query('max_salary') max_salary?: string,
    @Query('currency') currency?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort_by') sort_by?: 'posted_at' | 'salary' | 'relevance',
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const searchParams = {
      keyword,
      country,
      min_salary: min_salary ? parseInt(min_salary, 10) : undefined,
      max_salary: max_salary ? parseInt(max_salary, 10) : undefined,
      currency,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sort_by: sort_by || 'posted_at',
      order: order || 'desc',
    };

    const results = await this.jobs.searchJobsByKeyword(searchParams);

    // Transform results to include salary conversions and clean structure
    const transformedData = results.data.map((job: any) => ({
      id: job.id,
      posting_title: job.posting_title,
      country: job.country,
      city: job.city,
      posting_date_ad: job.posting_date_ad,
      employer: job.contracts?.[0]?.employer ? {
        company_name: job.contracts[0].employer.company_name,
        country: job.contracts[0].employer.country,
        city: job.contracts[0].employer.city,
      } : null,
      agency: job.contracts?.[0]?.agency ? {
        name: job.contracts[0].agency.name,
        license_number: job.contracts[0].agency.license_number,
      } : null,
      positions: (job.contracts?.[0]?.positions || []).map((p: any) => ({
        title: p.title,
        vacancies: { 
          male: p.male_vacancies, 
          female: p.female_vacancies, 
          total: p.total_vacancies 
        },
        salary: {
          monthly_amount: Number(p.monthly_salary_amount),
          currency: p.salary_currency,
          converted: (p.salaryConversions || []).map((c: any) => ({ 
            amount: Number(c.converted_amount), 
            currency: c.converted_currency 
          })),
        },
      })),
    }));

    return {
      data: transformedData,
      total: results.total,
      page: results.page,
      limit: results.limit,
      search: {
        keyword: results.keyword,
        filters: results.filters,
      },
    };
  }

  // Public job details for mobile app
  @Get(':id')
  @ApiOperation({ summary: 'Get public job details by ID' })
  @ApiParam({ name: 'id', description: 'Job Posting ID', required: true })
  @ApiResponse({ status: 200, description: 'Job details payload' })
  @HttpCode(200)
  async getJobDetails(@Param('id', ParseUUIDPipe) id: string) {
    const jp: any = await this.jobs.findJobPostingById(id);
    // Aggregate expenses (single rows per type in current model)
    const ex = await this.expenses.getJobPostingExpenses(id);
    const interview = await this.interviews.findInterviewByJobPosting(id);

    // Compose response roughly matching sample contract
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
    };
  }
}
