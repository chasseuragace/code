import { Controller, Get, Query } from '@nestjs/common';
import { TesthelperService } from '../services/testhelper.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

interface TestSuitePrerequisites {
  candidatePhone: string;
  candidateId: string;
  applicationIds: string[];
  postingAgencyId: string;
  agencyOwnerPhone: string;
}

@ApiTags('test-helper')
@Controller('test-helper')
export class TesthelperController {
  constructor(private readonly testhelperService: TesthelperService) {}

  @Get('find-test-suite-prerequisites')
  @ApiOperation({ summary: 'Find test suite prerequisites for Ramesh workflow' })
  @ApiResponse({
    status: 200,
    description: 'Returns test suite prerequisites',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Required data not found',
  })
  async findTestSuiteWorkflowPrerequisites(): Promise<TestSuitePrerequisites> {
    return this.testhelperService.findTestSuiteWorkflowPrerequisites();
  }

  @Get('platform-owner/agencies-analytics')
  @ApiOperation({ summary: 'Get all agencies with owner phone numbers for platform owner' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of agencies with analytics',
    type: Array,
  })
  async getAgenciesAnalytics() {
    return this.testhelperService.getAgenciesAnalytics();
  }

  @Get('candidates')
  @ApiOperation({ summary: 'Get paginated list of all candidates (id, phone, name)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of candidates',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              phone: { type: 'string' },
              full_name: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getCandidates(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.testhelperService.getCandidates(pageNum, limitNum);
  }
}
