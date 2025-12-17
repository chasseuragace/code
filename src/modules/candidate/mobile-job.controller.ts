import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JobPostingService, InterviewService, ExpenseService } from '../domain/domain.service';
import { CurrencyConversionService } from '../currency/currency-conversion.service';
import { ApplicationService } from '../application/application.service';
import { FitnessScoreService } from '../shared/fitness-score.service';
import { CandidateService } from './candidate.service';

import { MobileJobPostingDto } from './dto/mobile-job.dto';

@ApiTags('mobile-jobs')
@Controller('mobile-jobs')
export class MobileJobController {
  constructor(
    private readonly candidates: CandidateService,
    private readonly jobPostingService: JobPostingService,
    private readonly currencyConversionService: CurrencyConversionService,
    private readonly interviewService: InterviewService,
    private readonly applicationService: ApplicationService,
    private readonly fitnessScoreService: FitnessScoreService,
    private readonly expenseService: ExpenseService,
  ) {}

  // Mobile-friendly job details including match percentage
  // GET /mobile-jobs/:jobId
  // Works with or without authentication - skips user-dependent activities if no token
  @Get(':jobId')
  @ApiOperation({
    summary: 'Get mobile-optimized job details by ID (includes match percentage if authenticated)',
    description: 'Returns job details optimized for mobile display. If authenticated, includes fitness score and application status.',
  })
  @ApiParam({ name: 'jobId', description: 'Job Posting ID', required: true })
  @ApiOkResponse({ description: 'Mobile job projection', type: MobileJobPostingDto })
  async getJobMobile(
    @Req() req: Request,
    @Param('jobId', new ParseUUIDPipe({ version: '4' })) jobId: string,
  ): Promise<MobileJobPostingDto> {
    // Extract user ID from token if available (optional)
    const user = (req as any).user;
    const id = user?.id;

    // Base mobile projection with salary conversions preference NPR > USD > first
    const mobile = await this.jobPostingService.jobbyidmobile(jobId);

    // Compute match percentage only if user is authenticated
    if (id) {
      try {
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
      } catch (error) {
        // Log error but don't fail - return base data without user-specific enrichment
        console.error('Error computing user-specific job details:', error);
      }
    }

    // Get total applications count for this job posting (available to all)
    const applicationsCount = await this.applicationService.countApplicationsByJobPosting(jobId);
    mobile.applications = applicationsCount;

    // Fetch and include expenses (available to all)
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
}
