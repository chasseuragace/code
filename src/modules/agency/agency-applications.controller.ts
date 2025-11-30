import { Controller, Get, Param, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AgencyApplicationsService } from './agency-applications.service';
import {
  GetAgencyApplicationsQueryDto,
  GetAgencyApplicationsResponseDto,
  AgencyApplicationStatisticsDto,
  AgencyJobCountriesResponseDto,
} from './dto/agency-applications.dto';

@ApiTags('Agency Applications')
@Controller('agencies/:license/applications')
export class AgencyApplicationsController {
  constructor(
    private readonly agencyAppsService: AgencyApplicationsService,
  ) {}

  /**
   * Get all applications for an agency across all their job postings
   * GET /agencies/:license/applications
   */
  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all applications for an agency',
    description: `
      Returns a paginated list of all candidate applications across all job postings owned by the agency.
      
      **Key Features:**
      - Optimized data structure to avoid duplication (candidates, jobs, and positions are in separate lookup maps)
      - Filter by status, country, job, or position
      - Search across candidate names, phones, emails, job titles, and skills
      - Priority scoring based on candidate-job match
      - Pagination support
      
      **Data Structure:**
      - \`applications\`: Array of application records (just IDs and metadata)
      - \`candidates\`: Lookup map of candidate details (key: candidate_id)
      - \`jobs\`: Lookup map of job details (key: job_posting_id)
      - \`positions\`: Lookup map of position details (key: position_id)
      
      This structure significantly reduces payload size when candidates have applied to multiple positions.
    `,
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'REG-2025-793487',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved applications',
    type: GetAgencyApplicationsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Agency not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Agency with license REG-2025-793487 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: ['page must be a positive number', 'limit must not be greater than 100'],
        error: 'Bad Request',
      },
    },
  })
  async getApplications(
    @Param('license') license: string,
    @Query() query: GetAgencyApplicationsQueryDto,
  ): Promise<GetAgencyApplicationsResponseDto> {
    return this.agencyAppsService.getAgencyApplications(license, query);
  }

  /**
   * Get unique countries from agency's job postings
   * GET /agencies/:license/applications/countries
   */
  @Get('countries')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get available countries for filtering',
    description: `
      Returns a list of unique countries from all job postings owned by the agency.
      Useful for populating country filter dropdowns in the UI.
    `,
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'REG-2025-793487',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved countries',
    type: AgencyJobCountriesResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Agency not found',
  })
  async getCountries(
    @Param('license') license: string,
  ): Promise<AgencyJobCountriesResponseDto> {
    const countries = await this.agencyAppsService.getAgencyJobCountries(license);
    return { countries };
  }

  /**
   * Get application statistics for an agency
   * GET /agencies/:license/applications/statistics
   */
  @Get('statistics')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get application statistics',
    description: `
      Returns aggregated statistics about applications for the agency:
      - Total number of applications
      - Breakdown by application status (applied, shortlisted, etc.)
      - Breakdown by job country
      
      Useful for dashboard analytics and overview displays.
    `,
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'REG-2025-793487',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved statistics',
    type: AgencyApplicationStatisticsDto,
  })
  @ApiNotFoundResponse({
    description: 'Agency not found',
  })
  async getStatistics(
    @Param('license') license: string,
  ): Promise<AgencyApplicationStatisticsDto> {
    return this.agencyAppsService.getAgencyApplicationStatistics(license);
  }
}
