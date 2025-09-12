import { Controller, Get, HttpCode, Param, ParseUUIDPipe } from '@nestjs/common';
import { JobPostingService, ExpenseService, InterviewService } from './domain.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class PublicJobsController {
  constructor(
    private readonly jobs: JobPostingService,
    private readonly expenses: ExpenseService,
    private readonly interviews: InterviewService,
  ) {}

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
