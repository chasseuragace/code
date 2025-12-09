import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJobsService } from './admin-jobs.service';
import { AdminJobFiltersDto, AdminJobListResponseDto } from './dto/admin-job-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly adminJobsService: AdminJobsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for admin module' })
  async healthCheck() {
    return { status: 'ok', module: 'admin', version: '1.0.1', timestamp: new Date().toISOString() };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get job listings for admin panel with statistics (Agency-scoped)',
    description: 'Returns paginated job listings filtered by the authenticated user\'s agency. Includes application statistics, shortlisted counts, and interview counts. Supports filtering by search term, country. Supports sorting by published date, applications, shortlisted, or interviews.'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search across job title, company, ID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['published_date', 'applications', 'shortlisted', 'interviews'], description: 'Sort by field' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiOkResponse({ 
    status: 200, 
    description: 'Job listings with statistics (filtered by user\'s agency)',
    type: AdminJobListResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 'uuid-v4-string',
            title: 'Cook',
            company: 'Al Manara Restaurant',
            country: 'UAE',
            city: 'Dubai',
            created_at: '2025-08-23T10:30:00.000Z',
            published_at: '2025-08-25T10:30:00.000Z',
            salary: '1200 AED',
            currency: 'AED',
            salary_amount: 1200,
            applications_count: 45,
            shortlisted_count: 12,
            interviews_today: 2,
            total_interviews: 8,
            view_count: 0,
            category: 'Cook',
            tags: ['cooking', 'arabic cuisine'],
            requirements: ['Experience: 2+ years', 'Language: Basic English'],
            description: 'Looking for experienced cook...',
            working_hours: '8 hours/day',
            accommodation: 'free',
            food: 'free',
            visa_status: 'Company will provide',
            contract_duration: '2 years',
            agency: {
              id: 'uuid',
              name: 'Inspire International',
              license_number: 'LIC-001'
            }
          }
        ],
        total: 42,
        page: 1,
        limit: 10,
        filters: {
          search: 'cook',
          country: 'UAE'
        }
      }
    }
  })
  async getAdminJobs(
    @Req() req: any,
    @Query() filters: AdminJobFiltersDto
  ): Promise<AdminJobListResponseDto> {
    try {
      // Extract agency ID from JWT (set by JwtStrategy)
      const agencyId = req.user?.agency_id;
      
      if (!agencyId) {
        console.warn('[AdminJobsController] No agency_id in JWT, user might not be an agency owner/member');
        // Return empty result if user has no agency
        return {
          data: [],
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          filters: {
            search: filters.search,
            country: filters.country,
            agency_id: undefined,
          },
        };
      }

      // Filter by user's agency
      filters.agency_id = agencyId;

      return await this.adminJobsService.getAdminJobList(filters);
    } catch (error) {
      console.error('[AdminJobsController] Error:', error);
      throw error;
    }
  }

  @Get('statistics/countries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get job distribution by country',
    description: 'Returns the count of active jobs per country. Defaults to the authenticated user\'s agency; can be overridden by providing agency_id explicitly.'
  })
  @ApiQuery({ name: 'agency_id', required: false, description: 'Filter by agency ID' })
  @ApiOkResponse({ 
    status: 200, 
    description: 'Job count by country',
    schema: {
      example: {
        'UAE': 15,
        'Qatar': 8,
        'Saudi Arabia': 5,
        'Kuwait': 3,
        'Oman': 2
      }
    }
  })
  async getCountryDistribution(
    @Req() req: any,
    @Query('agency_id') agencyId?: string
  ): Promise<Record<string, number>> {
    const effectiveAgencyId = agencyId || req.user?.agency_id;
    return await this.adminJobsService.getCountryDistribution(effectiveAgencyId);
  }
}
