// NestJS Controller Classes
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    ParseUUIDPipe,
    ParseIntPipe,
    ParseBoolPipe,
    ValidationPipe,
    HttpStatus,
    HttpCode
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiQuery,
    ApiBody
  } from '@nestjs/swagger';
  
  // Import services and DTOs
  import { 
    JobPostingService, 
    ExpenseService, 
    InterviewService, 
    AgencyService, 
    ReportingService 
  } from './services';
  import { 
    CreateJobPostingDto, 
    PostingAgencyDto, 
    ExpenseDto, 
    ExpenseType,
    ExpensePayer,
    TicketType
  } from './dto';
  
  @ApiTags('job-postings')
  @Controller('api/v1/job-postings')
  export class JobPostingController {
    constructor(
      private readonly jobPostingService: JobPostingService,
      private readonly expenseService: ExpenseService,
      private readonly interviewService: InterviewService
    ) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new job posting' })
    @ApiResponse({ status: 201, description: 'Job posting created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @HttpCode(HttpStatus.CREATED)
    async createJobPosting(@Body(ValidationPipe) createJobPostingDto: CreateJobPostingDto) {
      return await this.jobPostingService.createJobPosting(createJobPostingDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all job postings with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status (default: true)' })
    @ApiResponse({ status: 200, description: 'Job postings retrieved successfully' })
    async getAllJobPostings(
      @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
      @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
      @Query('country') country?: string,
      @Query('isActive', new ParseBoolPipe({ optional: true })) isActive: boolean = true
    ) {
      return await this.jobPostingService.findAllJobPostings(page, limit, country, isActive);
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Search job postings with advanced filters' })
    @ApiQuery({ name: 'country', required: false, type: String })
    @ApiQuery({ name: 'position_title', required: false, type: String })
    @ApiQuery({ name: 'min_salary', required: false, type: Number })
    @ApiQuery({ name: 'max_salary', required: false, type: Number })
    @ApiQuery({ name: 'currency', required: false, type: String })
    @ApiQuery({ name: 'employer_name', required: false, type: String })
    @ApiQuery({ name: 'agency_name', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
    async searchJobPostings(
      @Query('country') country?: string,
      @Query('position_title') position_title?: string,
      @Query('min_salary', new ParseIntPipe({ optional: true })) min_salary?: number,
      @Query('max_salary', new ParseIntPipe({ optional: true })) max_salary?: number,
      @Query('currency') currency?: string,
      @Query('employer_name') employer_name?: string,
      @Query('agency_name') agency_name?: string,
      @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
      @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
    ) {
      return await this.jobPostingService.searchJobPostings({
        country,
        position_title,
        min_salary,
        max_salary,
        currency,
        employer_name,
        agency_name,
        page,
        limit
      });
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get job posting by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 200, description: 'Job posting retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Job posting not found' })
    async getJobPostingById(@Param('id', ParseUUIDPipe) id: string) {
      return await this.jobPostingService.findJobPostingById(id);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 200, description: 'Job posting updated successfully' })
    @ApiResponse({ status: 404, description: 'Job posting not found' })
    async updateJobPosting(
      @Param('id', ParseUUIDPipe) id: string,
      @Body(ValidationPipe) updateDto: Partial<CreateJobPostingDto>
    ) {
      return await this.jobPostingService.updateJobPosting(id, updateDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 204, description: 'Job posting deactivated successfully' })
    @ApiResponse({ status: 404, description: 'Job posting not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deactivateJobPosting(@Param('id', ParseUUIDPipe) id: string) {
      await this.jobPostingService.deactivateJobPosting(id);
    }
  
    // Expense management endpoints
    @Post(':id/expenses/medical')
    @ApiOperation({ summary: 'Add medical expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 201, description: 'Medical expenses added successfully' })
    async addMedicalExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: {
        domestic?: ExpenseDto & { notes?: string };
        foreign?: ExpenseDto & { notes?: string };
      }
    ) {
      return await this.expenseService.createMedicalExpense(id, expenseData);
    }
  
    @Post(':id/expenses/insurance')
    @ApiOperation({ summary: 'Add insurance expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    async addInsuranceExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: ExpenseDto & {
        coverage_amount?: number;
        coverage_currency?: string;
      }
    ) {
      return await this.expenseService.createInsuranceExpense(id, expenseData);
    }
  
    @Post(':id/expenses/travel')
    @ApiOperation({ summary: 'Add travel expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    async addTravelExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: ExpenseDto & {
        ticket_type?: TicketType;
      }
    ) {
      return await this.expenseService.createTravelExpense(id, expenseData);
    }
  
    @Post(':id/expenses/visa')
    @ApiOperation({ summary: 'Add visa/permit expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    async addVisaPermitExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: ExpenseDto & {
        refundable?: boolean;
      }
    ) {
      return await this.expenseService.createVisaPermitExpense(id, expenseData);
    }
  
    @Post(':id/expenses/training')
    @ApiOperation({ summary: 'Add training expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    async addTrainingExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: ExpenseDto & {
        duration_days?: number;
        mandatory?: boolean;
      }
    ) {
      return await this.expenseService.createTrainingExpense(id, expenseData);
    }
  
    @Post(':id/expenses/welfare-service')
    @ApiOperation({ summary: 'Add welfare and service expenses to job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    async addWelfareServiceExpense(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() expenseData: {
        welfare?: ExpenseDto & { fund_purpose?: string; refundable?: boolean };
        service?: ExpenseDto & { service_type?: string; refundable?: boolean };
      }
    ) {
      return await this.expenseService.createWelfareServiceExpense(id, expenseData);
    }
  
    @Get(':id/expenses')
    @ApiOperation({ summary: 'Get all expenses for a job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
    async getJobPostingExpenses(@Param('id', ParseUUIDPipe) id: string) {
      return await this.expenseService.getJobPostingExpenses(id);
    }
  
    // Interview management endpoints
    @Post(':id/interview')
    @ApiOperation({ summary: 'Create interview details for job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 201, description: 'Interview details created successfully' })
    async createInterview(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() interviewData: {
        interview_date_ad?: string;
        interview_date_bs?: string;
        interview_time?: string;
        location?: string;
        contact_person?: string;
        required_documents?: string[];
        notes?: string;
        expenses?: Array<{
          expense_type: ExpenseType;
          who_pays: ExpensePayer;
          is_free?: boolean;
          amount?: number;
          currency?: string;
          refundable?: boolean;
          notes?: string;
        }>;
      }
    ) {
      return await this.interviewService.createInterview(id, interviewData);
    }
  
    @Get(':id/interview')
    @ApiOperation({ summary: 'Get interview details for job posting' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job posting UUID' })
    @ApiResponse({ status: 200, description: 'Interview details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async getJobPostingInterview(@Param('id', ParseUUIDPipe) id: string) {
      return await this.interviewService.findInterviewByJobPosting(id);
    }
  }
  
  @ApiTags('agencies')
  @Controller('api/v1/agencies')
  export class AgencyController {
    constructor(private readonly agencyService: AgencyService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new posting agency' })
    @ApiResponse({ status: 201, description: 'Agency created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data or license number already exists' })
    @HttpCode(HttpStatus.CREATED)
    async createAgency(@Body(ValidationPipe) agencyData: PostingAgencyDto) {
      return await this.agencyService.createAgency(agencyData);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all agencies with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: 200, description: 'Agencies retrieved successfully' })
    async getAllAgencies(
      @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
      @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
    ) {
      return await this.agencyService.findAllAgencies(page, limit);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get agency by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Agency UUID' })
    @ApiResponse({ status: 200, description: 'Agency retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Agency not found' })
    async getAgencyById(@Param('id', ParseUUIDPipe) id: string) {
      return await this.agencyService.findAgencyById(id);
    }
  
    @Get('license/:licenseNumber')
    @ApiOperation({ summary: 'Get agency by license number' })
    @ApiParam({ name: 'licenseNumber', type: 'string', description: 'Agency license number' })
    @ApiResponse({ status: 200, description: 'Agency retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Agency not found' })
    async getAgencyByLicense(@Param('licenseNumber') licenseNumber: string) {
      return await this.agencyService.findAgencyByLicense(licenseNumber);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update agency information' })
    @ApiParam({ name: 'id', type: 'string', description: 'Agency UUID' })
    @ApiResponse({ status: 200, description: 'Agency updated successfully' })
    @ApiResponse({ status: 404, description: 'Agency not found' })
    async updateAgency(
      @Param('id', ParseUUIDPipe) id: string,
      @Body(ValidationPipe) updateData: Partial<PostingAgencyDto>
    ) {
      return await this.agencyService.updateAgency(id, updateData);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate agency' })
    @ApiParam({ name: 'id', type: 'string', description: 'Agency UUID' })
    @ApiResponse({ status: 204, description: 'Agency deactivated successfully' })
    @ApiResponse({ status: 404, description: 'Agency not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deactivateAgency(@Param('id', ParseUUIDPipe) id: string) {
      await this.agencyService.deactivateAgency(id);
    }
  
    @Get(':id/job-postings')
    @ApiOperation({ summary: 'Get job postings for an agency' })
    @ApiParam({ name: 'id', type: 'string', description: 'Agency UUID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Agency job postings retrieved successfully' })
    async getAgencyJobPostings(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
      @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
    ) {
      return await this.agencyService.getAgencyJobPostings(id, page, limit);
    }
  }
  @ApiTags('interviews')
@Controller('api/v1/interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get interview details by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Interview UUID' })
  @ApiResponse({ status: 200, description: 'Interview details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.interviewService.findInterviewById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update interview details' })
  @ApiParam({ name: 'id', type: 'string', description: 'Interview UUID' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async updateInterview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<{
      interview_date_ad: string;
      interview_date_bs: string;
      interview_time: string;
      location: string;
      contact_person: string;
      required_documents: string[];
      notes: string;
    }>
  ) {
    return await this.interviewService.updateInterview(id, updateData);
  }
}

@ApiTags('reports')
@Controller('api/v1/reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get job posting statistics and analytics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getJobPostingStats() {
    return await this.reportingService.getJobPostingStats();
  }

  @Get('salary-analysis')
  @ApiOperation({ summary: 'Get salary analysis report' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' })
  @ApiResponse({ status: 200, description: 'Salary analysis retrieved successfully' })
  async getSalaryAnalysis(@Query('country') country?: string) {
    return await this.reportingService.getSalaryAnalysis(country);
  }
}