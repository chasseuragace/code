import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Param,
  Body,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AgencyJobManagementService } from './agency-job-management.service';
import {
  CreateTemplateDto,
  UpdateBasicInfoDto,
  UpdateEmployerDto,
  UpdateContractDto,
  CreatePositionDto,
  UpdatePositionDto,
  UpdateTagsDto,
  UpdateExpensesDto,
  TemplateCreatedDto,
  EditableJobDetailsDto,
  JobPostingUpdatedDto,
  PositionResponseDto,
} from './dto/job-management.dto';

@ApiTags('Agency Job Management')
@Controller('agencies/:license/job-management')
export class AgencyJobManagementController {
  constructor(
    private readonly jobManagementService: AgencyJobManagementService,
  ) {}

  // ============================================
  // Template Creation
  // ============================================

  @Post('template')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a template job posting',
    description:
      'Creates a new job posting with minimal input and sensible defaults. ' +
      'Auto-generates employer, contract, and one position with placeholder values.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiBody({ type: CreateTemplateDto })
  @ApiCreatedResponse({
    description: 'Template job posting created successfully',
    type: TemplateCreatedDto,
  })
  @ApiNotFoundResponse({ description: 'Agency not found' })
  @ApiBadRequestResponse({ description: 'Invalid country' })
  async createTemplateJobPosting(
    @Param('license') license: string,
    @Body(new ValidationPipe({ transform: true })) dto: CreateTemplateDto,
  ): Promise<TemplateCreatedDto> {
    return this.jobManagementService.createTemplateJobPosting(license, dto);
  }

  // ============================================
  // Get Editable Details
  // ============================================

  @Get(':id/editable')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get full job posting details for editing',
    description:
      'Returns all job posting fields (including null values) in a format suitable for frontend form binding.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiParam({
    name: 'id',
    description: 'Job posting ID (UUID)',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
  })
  @ApiOkResponse({
    description: 'Editable job details retrieved successfully',
    type: EditableJobDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot access job posting of another agency' })
  async getEditableJobDetails(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<EditableJobDetailsDto> {
    // Verify ownership first
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.getEditableJobDetails(id);
  }

  // ============================================
  // Basic Info Update
  // ============================================

  @Patch(':id/basic')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update basic job posting information',
    description:
      'Updates basic fields (title, country, city, dates, notes). Uses PATCH semantics.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: UpdateBasicInfoDto })
  @ApiOkResponse({
    description: 'Basic info updated successfully',
    type: JobPostingUpdatedDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  @ApiBadRequestResponse({ description: 'Invalid country' })
  async updateBasicInfo(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateBasicInfoDto,
  ): Promise<JobPostingUpdatedDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.updateBasicInfo(id, dto);
  }

  // ============================================
  // Employer Update
  // ============================================

  @Patch(':id/employer')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update employer information',
    description: 'Updates employer fields (company_name, country, city). Uses PATCH semantics.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: UpdateEmployerDto })
  @ApiOkResponse({
    description: 'Employer info updated successfully',
    type: JobPostingUpdatedDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  @ApiBadRequestResponse({ description: 'Job posting has no contract' })
  async updateEmployerInfo(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateEmployerDto,
  ): Promise<JobPostingUpdatedDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.updateEmployerInfo(id, dto);
  }

  // ============================================
  // Contract Update
  // ============================================

  @Patch(':id/contract')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update contract terms',
    description:
      'Updates contract fields (period, hours, benefits, etc.). Uses PATCH semantics.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: UpdateContractDto })
  @ApiOkResponse({
    description: 'Contract terms updated successfully',
    type: JobPostingUpdatedDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  @ApiBadRequestResponse({ description: 'Job posting has no contract' })
  async updateContractTerms(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateContractDto,
  ): Promise<JobPostingUpdatedDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.updateContractTerms(id, dto);
  }


  // ============================================
  // Position Management
  // ============================================

  @Post(':id/positions')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add a new position',
    description: 'Creates a new position linked to the job posting contract.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: CreatePositionDto })
  @ApiCreatedResponse({
    description: 'Position created successfully',
    type: PositionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  @ApiBadRequestResponse({ description: 'Job posting has no contract' })
  async addPosition(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: CreatePositionDto,
  ): Promise<PositionResponseDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.addPosition(id, dto);
  }

  @Patch(':id/positions/:positionId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update a position',
    description: 'Updates position fields. Uses PATCH semantics.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiParam({ name: 'positionId', description: 'Position ID (UUID)' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiOkResponse({
    description: 'Position updated successfully',
    type: PositionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting or position not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  async updatePosition(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('positionId', new ParseUUIDPipe({ version: '4' })) positionId: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    await this.jobManagementService.verifyPositionOwnership(positionId, id);
    return this.jobManagementService.updatePosition(positionId, dto);
  }

  @Delete(':id/positions/:positionId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove a position',
    description: 'Deletes a position from the job posting.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiParam({ name: 'positionId', description: 'Position ID (UUID)' })
  @ApiOkResponse({ description: 'Position removed successfully' })
  @ApiNotFoundResponse({ description: 'Job posting or position not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  async removePosition(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('positionId', new ParseUUIDPipe({ version: '4' })) positionId: string,
  ): Promise<{ success: boolean }> {
    await this.jobManagementService.verifyOwnership(id, license);
    await this.jobManagementService.verifyPositionOwnership(positionId, id);
    await this.jobManagementService.removePosition(positionId);
    return { success: true };
  }

  // ============================================
  // Tags Update
  // ============================================

  @Patch(':id/tags')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update job posting tags',
    description:
      'Updates tags (skills, education, experience, canonical titles). Uses PATCH semantics.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: UpdateTagsDto })
  @ApiOkResponse({
    description: 'Tags updated successfully',
    type: JobPostingUpdatedDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  @ApiBadRequestResponse({ description: 'Invalid canonical title ID or name' })
  async updateTags(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateTagsDto,
  ): Promise<JobPostingUpdatedDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.updateTags(id, dto);
  }

  // ============================================
  // Expenses Update
  // ============================================

  @Patch(':id/expenses')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update job posting expenses',
    description:
      'Updates expense categories (medical, insurance, travel, visa/permit, training, welfare/service). ' +
      'Uses PATCH semantics - only provided categories are updated. Creates records if they don\'t exist.',
  })
  @ApiParam({ name: 'license', description: 'Agency license number' })
  @ApiParam({ name: 'id', description: 'Job posting ID (UUID)' })
  @ApiBody({ type: UpdateExpensesDto })
  @ApiOkResponse({
    description: 'Expenses updated successfully',
    type: JobPostingUpdatedDto,
  })
  @ApiNotFoundResponse({ description: 'Job posting not found' })
  @ApiForbiddenResponse({ description: 'Cannot modify job posting of another agency' })
  async updateExpenses(
    @Param('license') license: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateExpensesDto,
  ): Promise<JobPostingUpdatedDto> {
    await this.jobManagementService.verifyOwnership(id, license);
    return this.jobManagementService.updateExpenses(id, dto);
  }
}
