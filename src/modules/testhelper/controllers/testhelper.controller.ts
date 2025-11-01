import { Controller, Get } from '@nestjs/common';
import { TesthelperService } from '../services/testhelper.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface TestSuitePrerequisites {
  candidatePhone: string;
  applicationId: string;
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
}
