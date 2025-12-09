import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowService, WorkflowStage } from './workflow.service';
import {
  GetWorkflowCandidatesDto,
  UpdateCandidateStageDto,
  WorkflowAnalyticsDto,
  RescheduleInterviewDto,
  WorkflowStageEnum,
} from './dto/workflow.dto';

@ApiTags('Workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('candidates')
  @ApiOperation({ 
    summary: 'Get workflow candidates for agency',
    description: 'Retrieve all candidates in workflow stages (applied, shortlisted, interview-scheduled, interview-passed) for the authenticated agency',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved workflow candidates',
    schema: {
      example: {
        success: true,
        data: {
          candidates: [
            {
              id: 'uuid',
              full_name: 'John Doe',
              phone: '+977-9841234567',
              email: 'john@example.com',
              passport_number: 'PA1234567',
              gender: 'male',
              age: 28,
              profile_image: 'https://...',
              application: {
                id: 'uuid',
                status: 'shortlisted',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                history_blob: [],
              },
              job: {
                id: 'uuid',
                posting_title: 'Security Guard - Dubai',
                country: 'UAE',
                city: 'Dubai',
              },
              position: {
                id: 'uuid',
                title: 'Security Guard',
                monthly_salary_amount: 1500,
                salary_currency: 'AED',
              },
              interview: {
                id: 'uuid',
                interview_date_ad: '2024-01-15',
                interview_time: '10:00',
                location: 'Agency Office',
                status: 'scheduled',
                result: null,
                feedback: null,
              },
              documents: [],
            },
          ],
          pagination: {
            current_page: 1,
            total_pages: 5,
            total_items: 75,
            items_per_page: 15,
          },
          analytics: {
            total_candidates: 75,
            by_stage: {
              applied: 20,
              shortlisted: 30,
              'interview-scheduled': 15,
              'interview-passed': 10,
            },
            by_job: [],
            conversion_rates: {
              applied_to_shortlisted: 60,
              shortlisted_to_scheduled: 50,
              scheduled_to_passed: 66.67,
              overall_success_rate: 13.33,
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an agency user' })
  async getWorkflowCandidates(
    @Request() req,
    @Query() filters: GetWorkflowCandidatesDto,
  ) {
    // Extract agency ID from authenticated user
    const agencyId = req.user?.agency_id;
    
    if (!agencyId) {
      throw new BadRequestException('Agency ID not found in user context');
    }

    const result = await this.workflowService.getWorkflowCandidates(agencyId, filters);

    return {
      success: true,
      data: result,
    };
  }

  @Put('candidates/:candidateId/stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update candidate workflow stage',
    description: 'Move candidate to next workflow stage. Stages must be updated sequentially: applied → shortlisted → interview-scheduled → interview-passed',
  })
  @ApiParam({ name: 'candidateId', description: 'Candidate UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully updated candidate stage',
    schema: {
      example: {
        success: true,
        message: 'Candidate moved from shortlisted to interview-scheduled',
        data: {
          application_id: 'uuid',
          previous_stage: 'shortlisted',
          new_stage: 'interview-scheduled',
          updated_at: '2024-01-02T00:00:00Z',
          interview_id: 'uuid',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid stage transition' })
  @ApiResponse({ status: 404, description: 'Not Found - Application not found or access denied' })
  async updateCandidateStage(
    @Request() req,
    @Param('candidateId') candidateId: string,
    @Body() updateDto: UpdateCandidateStageDto,
  ) {
    const agencyId = req.user?.agency_id;
    
    if (!agencyId) {
      throw new BadRequestException('Agency ID not found in user context');
    }

    // Validate interview details if moving to interview-scheduled
    if (
      updateDto.new_stage === WorkflowStageEnum.INTERVIEW_SCHEDULED &&
      !updateDto.interview_details
    ) {
      throw new BadRequestException(
        'Interview details are required when moving to interview-scheduled stage',
      );
    }

    const result = await this.workflowService.updateCandidateStage(
      agencyId,
      candidateId,
      updateDto,
    );

    return result;
  }

  @Get('analytics')
  @ApiOperation({ 
    summary: 'Get workflow analytics',
    description: 'Retrieve aggregated workflow statistics for the agency',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved analytics',
    schema: {
      example: {
        success: true,
        data: {
          total_candidates: 75,
          by_stage: {
            applied: 20,
            shortlisted: 30,
            'interview-scheduled': 15,
            'interview-passed': 10,
          },
          by_job: [
            {
              job_id: 'uuid',
              job_title: 'Security Guard - Dubai',
              country: 'UAE',
              stages: {
                applied: 10,
                shortlisted: 15,
                'interview-scheduled': 8,
                'interview-passed': 5,
              },
            },
          ],
          conversion_rates: {
            applied_to_shortlisted: 60,
            shortlisted_to_scheduled: 50,
            scheduled_to_passed: 66.67,
            overall_success_rate: 13.33,
          },
        },
      },
    },
  })
  async getAnalytics(
    @Request() req,
    @Query() filters: WorkflowAnalyticsDto,
  ) {
    const agencyId = req.user?.agency_id;
    
    if (!agencyId) {
      throw new BadRequestException('Agency ID not found in user context');
    }

    const analytics = await this.workflowService.calculateAnalytics(agencyId, filters);

    return {
      success: true,
      data: analytics,
    };
  }

  @Get('stages')
  @ApiOperation({ 
    summary: 'Get available workflow stages',
    description: 'Retrieve list of all workflow stages with descriptions',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved workflow stages',
    schema: {
      example: {
        success: true,
        data: {
          stages: [
            {
              id: 'applied',
              label: 'Applied',
              description: 'Initial application received and under review',
              order: 1,
            },
            {
              id: 'shortlisted',
              label: 'Shortlisted',
              description: 'Candidate selected for interview consideration',
              order: 2,
            },
            {
              id: 'interview-scheduled',
              label: 'Interview Scheduled',
              description: 'Interview appointment confirmed with candidate',
              order: 3,
            },
            {
              id: 'interview-passed',
              label: 'Interview Passed',
              description: 'Successfully passed interview, proceeding to next steps',
              order: 4,
            },
          ],
        },
      },
    },
  })
  async getWorkflowStages() {
    const stages = [
      {
        id: WorkflowStage.APPLIED,
        label: 'Applied',
        description: 'Initial application received and under review',
        order: 1,
      },
      {
        id: WorkflowStage.SHORTLISTED,
        label: 'Shortlisted',
        description: 'Candidate selected for interview consideration',
        order: 2,
      },
      {
        id: WorkflowStage.INTERVIEW_SCHEDULED,
        label: 'Interview Scheduled',
        description: 'Interview appointment confirmed with candidate',
        order: 3,
      },
      {
        id: WorkflowStage.INTERVIEW_RESCHEDULED,
        label: 'Interview Rescheduled',
        description: 'Interview has been rescheduled to a new date/time',
        order: 4,
      },
      {
        id: WorkflowStage.INTERVIEW_PASSED,
        label: 'Interview Passed',
        description: 'Successfully passed interview, proceeding to next steps',
        order: 5,
      },
      {
        id: WorkflowStage.INTERVIEW_FAILED,
        label: 'Interview Failed',
        description: 'Did not pass interview requirements',
        order: 6,
      },
    ];

    return {
      success: true,
      data: { stages },
    };
  }
}
