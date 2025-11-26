import { Controller, Get } from '@nestjs/common';
import { TesthelperService } from '../services/testhelper.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
}
