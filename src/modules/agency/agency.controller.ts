import { Controller, Post, HttpCode, Param, Body, Patch, Get, ParseUUIDPipe, ForbiddenException, UploadedFile, UploadedFiles, UseInterceptors, Delete, Query, UseGuards, Req, BadRequestException, ValidationPipe, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyService } from './agency.service';
import { AgencyProfileService } from './agency-profile.service';
import { JobPostingService, CreateJobPostingDto } from '../domain/domain.service';
import { CreateJobPostingWithTagsDto } from '../domain/dto/create-job-posting-with-tags.dto';
import { UpdateJobTagsDto } from '../domain/dto/update-job-tags.dto';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting } from '../domain/domain.entity';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { ExpenseService, InterviewService } from '../domain/domain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';
import { AgencyUser } from './agency-user.entity';
import { DevSmsService } from './dev-sms.service';
import * as bcrypt from 'bcryptjs';
import { 
  CreateAgencyDto, 
  AgencyCreatedDto, 
  AgencyResponseDto,
  UpdateAgencyBasicDto,
  UpdateAgencyContactDto,
  UpdateAgencyLocationDto,
  UpdateAgencySocialMediaDto,
  UpdateAgencyServicesDto,
  UpdateAgencySettingsDto
} from './dto/agency.dto';
import { ListAgencyJobPostingsQueryDto, PaginatedAgencyJobPostingsDto } from './dto/agency-job-postings.dto';
import { AgencySearchDto, PaginatedAgencyResponseDto } from './dto/agency-search.dto';
import { ImageUploadService, UploadType } from '../shared/image-upload.service';
import { UploadResponseDto } from '../candidate/dto/candidate-document.dto';
import { AgencyDashboardService } from './agency-dashboard.service';
import { AgencyDashboardAnalyticsDto, AgencyDashboardQueryDto } from './dto/agency-dashboard-analytics.dto';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+977${digits}`;
  }
  if (phone.startsWith('+')) return phone;
  return `+${digits}`;
}

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

@ApiTags('Agencies')
@Controller('agencies')
export class AgencyController {
  @Get('search/config')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Get search configuration options',
    description: 'Returns available filter options for agency search including top locations and sort options'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search configuration retrieved successfully',
    schema: {
      properties: {
        locations: { type: 'array', items: { type: 'string' }, description: 'Top 10 locations' },
        sortOptions: { type: 'array', items: { type: 'string' }, description: 'Available sort options' }
      }
    }
  })
  async getSearchConfig() {
    const locations = await this.agencyService.getTopLocations();
    const sortOptions = ['name', 'country', 'city', 'created_at'];
    return { locations, sortOptions };
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search agencies with keyword search',
    description: 'Search across agency name, description, location, and specializations with a single keyword.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated list of agencies matching the search criteria',
    type: PaginatedAgencyResponseDto 
  })
  @ApiQuery({ 
    name: 'keyword', 
    required: false, 
    description: 'Search term to look up agencies by name, description, location, or specializations',
    example: 'tech'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number', 
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Items per page (max 100)', 
    type: Number,
    example: 10
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    description: 'Field to sort by',
    enum: ['name', 'country', 'city', 'created_at'],
    example: 'name'
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc'
  })
  async searchAgencies(
    @Query(new ValidationPipe({ transform: true })) searchDto: AgencySearchDto
  ): Promise<PaginatedAgencyResponseDto> {
    return this.agencyService.searchAgencies(searchDto);
  }

  // Get agency details by ID (public endpoint for mobile users)
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Get agency details by ID',
    description: 'Returns detailed information about an agency including all profile fields, contact information, and metadata.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Agency UUID',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2'
  })
  @ApiOkResponse({ 
    description: 'Agency details retrieved successfully',
    type: AgencyResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agency not found' 
  })
  async getAgencyById(@Param('id', ParseUUIDPipe) id: string): Promise<AgencyResponseDto> {
    const agency = await this.agencyService.findAgencyById(id);
    return this.mapAgencyToResponseDto(agency);
  }

  // Get agency details by license number (public endpoint for mobile users)
  @Get('license/:license')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Get agency details by license number',
    description: 'Returns detailed information about an agency using their license number.'
  })
  @ApiParam({ 
    name: 'license', 
    description: 'Agency license number',
    example: 'LIC-AG-0001'
  })
  @ApiOkResponse({ 
    description: 'Agency details retrieved successfully',
    type: AgencyResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agency not found' 
  })
  async getAgencyByLicense(@Param('license') license: string): Promise<AgencyResponseDto> {
    const agency = await this.agencyService.findAgencyByLicense(license);
    return this.mapAgencyToResponseDto(agency);
  }

  constructor(
    private readonly agencyService: AgencyService,
    private readonly jobPostingService: JobPostingService,
    private readonly expenseService: ExpenseService,
    private readonly interviewService: InterviewService,
    @InjectRepository(JobApplication) private readonly jobAppRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting) private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(AgencyUser) private readonly agencyUserRepo: Repository<AgencyUser>,
    private readonly sms: DevSmsService,
    private readonly imageUploadService: ImageUploadService,
    private readonly agencyProfileService: AgencyProfileService,
    private readonly agencyDashboardService: AgencyDashboardService,
  ) {}

  // Owner creates their single agency and binds it to their user account
  @Post('owner/agency')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create one agency for the authenticated owner' })
  @ApiBody({ type: CreateAgencyDto })
  @ApiResponse({ status: 201, description: 'Agency created', type: AgencyCreatedDto })
  async createMyAgency(@Req() req: any, @Body() body: CreateAgencyDto) {
    const user = req.user as any;
    if (!user?.is_agency_owner) throw new ForbiddenException('Only agency owners can create agencies');
    if (user?.agency_id) throw new ForbiddenException('Owner already has an agency');
    const saved = await this.agencyService.createAgency(body);
    // bind to user
    const mgr = this.jobPostingRepo.manager;
    await mgr.getRepository(User).update({ id: user.id }, { agency_id: saved.id } as any);
    // also bind AgencyUser if exists
    await mgr.getRepository(AgencyUser).createQueryBuilder()
      .update()
      .set({ agency_id: saved.id } as any)
      .where('user_id = :uid', { uid: user.id })
      .execute();
    return { id: saved.id, license_number: saved.license_number };
  }

  // Get agency owned by the authenticated user
  @Get('owner/dashboard/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get dashboard analytics for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Dashboard analytics', type: AgencyDashboardAnalyticsDto })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering (ISO 8601)' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Filter by job ID' })
  async getMyAgencyDashboardAnalytics(
    @Req() req: any,
    @Query() query: AgencyDashboardQueryDto,
  ): Promise<AgencyDashboardAnalyticsDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    
    const agency = await this.agencyService.findAgencyById(user.agency_id);
    return this.agencyDashboardService.getDashboardAnalytics(agency.license_number, query);
  }

  @Get('owner/agency')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get agency owned by the authenticated user' })
  @ApiOkResponse({ description: 'Agency details', type: AgencyResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden if user is not an agency owner' })
  @ApiResponse({ status: 404, description: 'Not found if agency does not exist' })
  async getMyAgency(@Req() req: any) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    
    const agency = await this.agencyService.findAgencyById(user.agency_id);
    return {
      id: agency.id,
      name: agency.name,
      license_number: agency.license_number,
      address: agency.address,
      latitude: (agency as any).latitude ?? null,
      longitude: (agency as any).longitude ?? null,
      phones: agency.phones,
      emails: agency.emails,
      website: agency.website,
      description: agency.description,
      logo_url: agency.logo_url,
      banner_url: (agency as any).banner_url ?? null,
      established_year: (agency as any).established_year ?? null,
      services: (agency as any).services ?? null,
      certifications: (agency as any).certifications ?? null,
      social_media: (agency as any).social_media ?? null,
      bank_details: (agency as any).bank_details ?? null,
      contact_persons: (agency as any).contact_persons ?? null,
      operating_hours: (agency as any).operating_hours ?? null,
      target_countries: (agency as any).target_countries ?? null,
      specializations: (agency as any).specializations ?? null,
      statistics: (agency as any).statistics ?? null,
      settings: (agency as any).settings ?? null,
    };
  }

  @Patch('owner/agency/basic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update basic profile information for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencyBasic(@Req() req: any, @Body() body: UpdateAgencyBasicDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateBasicInfo(user.agency_id, {
      name: body.name,
      description: body.description,
      established_year: body.established_year,
      license_number: body.license_number,
    });
    return this.mapAgencyToResponseDto(updated);
  }

  @Patch('owner/agency/contact')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update contact information for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencyContact(@Req() req: any, @Body() body: UpdateAgencyContactDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateContact(user.agency_id, {
      phones: body.phones,
      emails: body.emails,
      website: body.website,
      contact_persons: body.contact_persons,
    });
    return this.mapAgencyToResponseDto(updated);
  }

  @Patch('owner/agency/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update location information for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencyLocation(@Req() req: any, @Body() body: UpdateAgencyLocationDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateLocation(user.agency_id, {
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
    });
    return this.mapAgencyToResponseDto(updated);
  }

  @Patch('owner/agency/social-media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update social media links for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencySocialMedia(@Req() req: any, @Body() body: UpdateAgencySocialMediaDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateSocialMedia(user.agency_id, body);
    return this.mapAgencyToResponseDto(updated);
  }

  @Patch('owner/agency/services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update services, specializations, and target countries for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencyServices(@Req() req: any, @Body() body: UpdateAgencyServicesDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateServices(user.agency_id, {
      services: body.services,
      specializations: body.specializations,
      target_countries: body.target_countries,
    });
    return this.mapAgencyToResponseDto(updated);
  }

  @Patch('owner/agency/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update settings for the authenticated owner agency' })
  @ApiOkResponse({ description: 'Updated agency profile', type: AgencyResponseDto })
  async updateMyAgencySettings(@Req() req: any, @Body() body: UpdateAgencySettingsDto): Promise<AgencyResponseDto> {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) {
      throw new ForbiddenException('User is not an agency owner or has no agency');
    }
    const updated = await this.agencyProfileService.updateSettings(user.agency_id, body);
    return this.mapAgencyToResponseDto(updated);
  }

  // --- Owner-managed Members ---
  @Post('owner/members/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Invite an agency member and set an admin-managed password' })
  @ApiBody({ schema: { properties: { full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string', enum: ['staff', 'admin', 'manager', 'recruiter', 'coordinator', 'visaOfficer', 'accountant'] } }, required: ['full_name', 'phone'] } })
  @ApiResponse({ status: 201, description: 'Member invited', schema: { properties: { id: { type: 'string', format: 'uuid' }, phone: { type: 'string' }, role: { type: 'string' }, dev_password: { type: 'string' } } } })
  async inviteMember(
    @Req() req: any,
    @Body() body: { full_name: string; phone: string; role?: 'staff' | 'admin' | 'manager' | 'recruiter' | 'coordinator' | 'visaOfficer' | 'accountant' },
  ) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can invite');
    if (!body?.full_name || !body?.phone) throw new BadRequestException('full_name and phone are required');
    const phone = normalizePhone(body.phone);

    // Upsert User with role=agency_user and link to owner agency
    const mgr = this.jobPostingRepo.manager;
    const userRepo = mgr.getRepository(User);
    let u = await userRepo.findOne({ where: { phone } });
    if (u) {
      u.role = 'agency_user';
      u.is_active = true;
      u.agency_id = user.agency_id;
      await userRepo.save(u);
    } else {
      u = userRepo.create({ phone, role: 'agency_user', is_active: true, agency_id: user.agency_id });
      await userRepo.save(u);
    }

    // Upsert AgencyUser under this agency
    let au = await this.agencyUserRepo.findOne({ where: [{ user_id: u.id }, { phone }] });
    const password = generatePassword();
    const hash = await bcrypt.hash(password, 10);
    if (au) {
      au.full_name = body.full_name;
      au.role = (body.role as any) || 'staff';
      au.phone = phone;
      au.user_id = u.id;
      au.agency_id = user.agency_id;
      au.status = 'pending';
      au.password_hash = hash;
      au.password_set_by_admin_at = new Date();
      await this.agencyUserRepo.save(au);
    } else {
      au = this.agencyUserRepo.create({
        full_name: body.full_name,
        phone,
        user_id: u.id,
        agency_id: user.agency_id,
        role: (body.role as any) || 'staff',
        status: 'pending',
        password_hash: hash,
        password_set_by_admin_at: new Date(),
      });
      await this.agencyUserRepo.save(au);
    }

    // Send SMS with login URL (OTP-based, no password)
    await this.sms.send(phone, `Welcome to your agency. Login at /member/login with your phone number and OTP.`);
    return { 
      id: au.id, 
      phone: au.phone, 
      role: au.role, 
      status: au.status,
      created_at: au.created_at
    };
  }

  @Post('owner/members/:id/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset a member password (admin-managed)' })
  @ApiResponse({ status: 200, description: 'Password reset', schema: { properties: { id: { type: 'string', format: 'uuid' }, phone: { type: 'string' }, dev_password: { type: 'string' } } } })
  async resetMemberPassword(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can reset');
    const au = await this.agencyUserRepo.findOne({ where: { id } });
    if (!au || au.agency_id !== user.agency_id) throw new ForbiddenException('Not your agency member');
    const password = generatePassword();
    au.password_hash = await bcrypt.hash(password, 10);
    au.password_set_by_admin_at = new Date();
    await this.agencyUserRepo.save(au);
    await this.sms.send(au.phone, `Your password was reset. New password: ${password}`);
    return { id: au.id, phone: au.phone, dev_password: password };
  }

  @Get('owner/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'List members of the owner\'s agency' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or phone' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'List of members', schema: { type: 'array', items: { properties: { id: { type: 'string', format: 'uuid' }, full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string' }, status: { type: 'string' }, created_at: { type: 'string', format: 'date-time' } } } } })
  async listMembers(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('role') roleFilter?: string,
    @Query('status') statusFilter?: string,
  ) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can list');
    
    let query = this.agencyUserRepo.createQueryBuilder('au')
      .where('au.agency_id = :agencyId', { agencyId: user.agency_id });
    
    // Apply search filter
    if (search) {
      query = query.andWhere(
        '(au.full_name ILIKE :search OR au.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      query = query.andWhere('au.role = :role', { role: roleFilter });
    }
    
    // Apply status filter
    if (statusFilter) {
      query = query.andWhere('au.status = :status', { status: statusFilter });
    }
    
    const rows = await query.orderBy('au.created_at', 'DESC').getMany();
    return rows.map(r => ({ 
      id: r.id, 
      full_name: r.full_name, 
      phone: r.phone, 
      role: r.role, 
      status: r.status || 'active',
      created_at: r.created_at
    }));
  }

  @Get('owner/members/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a single member details' })
  @ApiResponse({ status: 200, description: 'Member details', schema: { properties: { id: { type: 'string', format: 'uuid' }, full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string' }, status: { type: 'string' }, created_at: { type: 'string', format: 'date-time' } } } })
  async getMember(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can view');
    const member = await this.agencyUserRepo.findOne({ where: { id, agency_id: user.agency_id } });
    if (!member) throw new NotFoundException('Member not found');
    return { 
      id: member.id, 
      full_name: member.full_name, 
      phone: member.phone, 
      role: member.role, 
      status: member.status || 'active',
      created_at: member.created_at
    };
  }

  @Patch('owner/members/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update member details' })
  @ApiBody({ schema: { properties: { full_name: { type: 'string' }, role: { type: 'string' } }, required: [] } })
  @ApiResponse({ status: 200, description: 'Member updated', schema: { properties: { id: { type: 'string', format: 'uuid' }, full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string' }, status: { type: 'string' }, created_at: { type: 'string', format: 'date-time' } } } })
  async updateMember(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() body: { full_name?: string; role?: string }) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can update');
    const member = await this.agencyUserRepo.findOne({ where: { id, agency_id: user.agency_id } });
    if (!member) throw new NotFoundException('Member not found');
    
    if (body.full_name) member.full_name = body.full_name;
    if (body.role) member.role = body.role as any;
    
    await this.agencyUserRepo.save(member);
    return { 
      id: member.id, 
      full_name: member.full_name, 
      phone: member.phone, 
      role: member.role,
      status: member.status || 'active',
      created_at: member.created_at
    };
  }

  @Patch('owner/members/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update member status' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['active', 'inactive', 'pending', 'suspended'] } }, required: ['status'] } })
  @ApiResponse({ status: 200, description: 'Member status updated', schema: { properties: { id: { type: 'string', format: 'uuid' }, status: { type: 'string' } } } })
  async updateMemberStatus(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() body: { status: string }) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can update');
    if (!body.status) throw new BadRequestException('Status is required');
    
    const member = await this.agencyUserRepo.findOne({ where: { id, agency_id: user.agency_id } });
    if (!member) throw new NotFoundException('Member not found');
    
    member.status = body.status;
    await this.agencyUserRepo.save(member);
    return { id: member.id, status: member.status };
  }

  @Delete('owner/members/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted' })
  async deleteMember(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can delete');
    
    const member = await this.agencyUserRepo.findOne({ where: { id, agency_id: user.agency_id } });
    if (!member) throw new NotFoundException('Member not found');
    
    // Delete AgencyUser
    await this.agencyUserRepo.remove(member);
    
    // Optionally delete User if they have no other agency associations
    const mgr = this.jobPostingRepo.manager;
    const userRepo = mgr.getRepository(User);
    const otherMembers = await this.agencyUserRepo.find({ where: { user_id: member.user_id } });
    if (otherMembers.length === 0) {
      await userRepo.delete({ id: member.user_id });
    }
    
    return { success: true, message: 'Member deleted successfully' };
  }

  // Create agency (production-friendly controller)
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateAgencyDto })
  @ApiResponse({ status: 201, type: AgencyCreatedDto })
  async createAgency(@Body() body: CreateAgencyDto) {
    const saved = await this.agencyService.createAgency(body);
    return { id: saved.id, license_number: saved.license_number };
  }

  // Get posting detail (minimal) including cutout_url
  @Get(':license/job-postings/:id')
  @HttpCode(200)
  async getJobPosting(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }
    return { id: posting.id, posting_title: posting.posting_title, cutout_url: (posting as any).cutout_url ?? null };
  }

  // Analytics: applicants count grouped by phase, per posting for an agency
  @Get(':license/analytics/applicants-by-phase')
  @HttpCode(200)
  async getApplicantsByPhase(@Param('license') license: string) {
    // Ensure agency exists
    await this.agencyService.findAgencyByLicense(license);

    const rows = await this.jobAppRepo
      .createQueryBuilder('ja')
      .innerJoin(JobPosting, 'jp', 'jp.id = ja.job_posting_id')
      .innerJoin('jp.contracts', 'c')
      .innerJoin('c.agency', 'ag')
      .where('ag.license_number = :license', { license })
      .select('jp.id', 'posting_id')
      .addSelect('jp.posting_title', 'posting_title')
      .addSelect("SUM(CASE WHEN ja.status = 'applied' THEN 1 ELSE 0 END)", 'applied')
      .addSelect("SUM(CASE WHEN ja.status = 'shortlisted' THEN 1 ELSE 0 END)", 'shortlisted')
      .addSelect("SUM(CASE WHEN ja.status = 'interview_scheduled' THEN 1 ELSE 0 END)", 'interview_scheduled')
      .addSelect("SUM(CASE WHEN ja.status = 'interview_rescheduled' THEN 1 ELSE 0 END)", 'interview_rescheduled')
      .addSelect("SUM(CASE WHEN ja.status = 'interview_passed' THEN 1 ELSE 0 END)", 'interview_passed')
      .addSelect("SUM(CASE WHEN ja.status = 'interview_failed' THEN 1 ELSE 0 END)", 'interview_failed')
      .addSelect("SUM(CASE WHEN ja.status = 'withdrawn' THEN 1 ELSE 0 END)", 'withdrawn')
      .groupBy('jp.id')
      .addGroupBy('jp.posting_title')
      .orderBy('jp.posting_title', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      posting_id: r.posting_id,
      posting_title: r.posting_title,
      counts: {
        applied: Number(r.applied || 0),
        shortlisted: Number(r.shortlisted || 0),
        interview_scheduled: Number(r.interview_scheduled || 0),
        interview_rescheduled: Number(r.interview_rescheduled || 0),
        interview_passed: Number(r.interview_passed || 0),
        interview_failed: Number(r.interview_failed || 0),
        withdrawn: Number(r.withdrawn || 0),
      },
    }));
  }

  // SeedV1: insert dummy agencies from JSON file
  // Idempotent: relies on createAgency which reuses existing by license_number
  @Post('seedv1')
  @HttpCode(200)
  async seedV1() {
    const seedPath = path.resolve(process.cwd(), 'src/seed/agencies.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const records: CreateAgencyDto[] = JSON.parse(raw);
    if (!Array.isArray(records)) {
      throw new Error('agencies.seed.json must contain an array of agencies');
    }

    const results = [] as Array<{ license_number: string; id: string }>;
    for (const rec of records) {
      const saved = await this.agencyService.createAgency(rec);
      results.push({ license_number: saved.license_number, id: saved.id });
    }

    return {
      source: 'src/seed/agencies.seed.json',
      inserted_or_reused: results.length,
      agencies: results,
    };
  }

  // Create a job posting for an existing agency by license number.
  // The request body should contain all fields of CreateJobPostingDto except posting_agency.
  // We will infer posting_agency from the path param license.
  // Optionally accepts a 'cutout' file for the job posting image.
  @Post(':license/job-postings')
  @HttpCode(201)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data', 'application/json')
  async createJobPostingForAgency(
    @Param('license') license: string,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Ensure agency exists
    const agency = await this.agencyService.findAgencyByLicense(license);
    
    // Parse JSON data if sent as multipart
    let jobData = body;
    if (body.data && typeof body.data === 'string') {
      try {
        jobData = JSON.parse(body.data);
      } catch (e) {
        throw new BadRequestException('Invalid JSON in data field');
      }
    }
    
    const dto: CreateJobPostingDto = {
      ...jobData,
      posting_agency: {
        name: agency.name,
        license_number: agency.license_number,
        address: agency.address ?? undefined,
        phones: agency.phones ?? undefined,
        emails: agency.emails ?? undefined,
        website: agency.website ?? undefined,
      },
    } as any;
    const created = await this.jobPostingService.createJobPosting(dto);
    
    // If cutout file provided, upload it
    const cutoutFile = files?.find(f => f.fieldname === 'cutout');
    if (cutoutFile) {
      try {
        const uploadResult = await this.imageUploadService.uploadFile(
          cutoutFile,
          UploadType.JOB_CUTOUT,
          created.id
        );
        
        if (uploadResult.success && uploadResult.url) {
          await this.jobPostingService.updateCutoutUrl(created.id, uploadResult.url);
        }
      } catch (uploadErr) {
        console.error('Failed to upload cutout during job creation:', uploadErr);
        // Don't fail the job creation if image upload fails
      }
    }
    
    return {
      id: created.id,
      posting_title: created.posting_title,
      skills: (created as any).skills,
      education_requirements: (created as any).education_requirements,
      experience_requirements: (created as any).experience_requirements,
      canonical_titles: (created as any).canonical_titles ?? [],
    };
  }

  // Update tags for a job posting (ownership enforced by license match)
  @Patch(':license/job-postings/:id/tags')
  @HttpCode(200)
  async updateJobPostingTags(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateJobTagsDto,
  ) {
    // Verify ownership: posting must belong to this agency license
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot modify job posting of another agency');
    }
    const updated = await this.jobPostingService.updateJobPostingTags(id, body as any);
    return {
      id: updated.id,
      skills: (updated as any).skills,
      education_requirements: (updated as any).education_requirements,
      experience_requirements: (updated as any).experience_requirements,
      canonical_titles: (updated as any).canonical_titles ?? [],
    };
  }

  // Get tags for a job posting (ownership enforced)
  @Get(':license/job-postings/:id/tags')
  @HttpCode(200)
  async getJobPostingTags(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }
    return {
      id: posting.id,
      skills: (posting as any).skills,
      education_requirements: (posting as any).education_requirements,
      experience_requirements: (posting as any).experience_requirements,
      canonical_titles: (posting as any).canonical_titles ?? [],
    };
  }

  // Update posting core fields (details/contract subset) - ownership enforced
  @Patch(':license/job-postings/:id')
  @HttpCode(200)
  async updateJobPosting(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<CreateJobPostingDto>,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) {
      throw new ForbiddenException('Cannot modify job posting of another agency');
    }
    const updated = await this.jobPostingService.updateJobPosting(id, body);
    return { id: updated.id, posting_title: updated.posting_title };
  }

  // List job postings for an agency (enriched with counts + filters/sorting)
  @Get(':license/job-postings')
  @HttpCode(200)
  @ApiOperation({ summary: 'List job postings for an agency with filters and analytics' })
  @ApiParam({ name: 'license', description: 'Agency license number', example: 'LIC-AG-0001' })
  @ApiQuery({ name: 'q', required: false, description: 'Free-text search across title, ref ids (lt_number, chalani_number), employer, agency, position title' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by posting title (ILIKE)' })
  @ApiQuery({ name: 'refid', required: false, description: 'Filter by reference id (lt_number or chalani_number) (ILIKE)' })
  @ApiQuery({ name: 'employer_name', required: false, description: 'Filter by employer company name (ILIKE)' })
  @ApiQuery({ name: 'agency_name', required: false, description: "Filter by agency name (ILIKE). Redundant when filtering by a single license" })
  @ApiQuery({ name: 'country', required: false, description: "Filter by country (ILIKE). Uses job posting's country (not agency address). Accepts code or name" })
  @ApiQuery({ name: 'position_title', required: false, description: 'Filter by position title within posting positions (ILIKE)' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['interviews_today', 'shortlisted', 'applicants', 'posted_at'], example: 'posted_at' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({
    type: PaginatedAgencyJobPostingsDto,
    description: 'Paginated list of agency job postings with analytics',
    schema: {
      example: {
        data: [
          {
            id: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
            posting_title: 'Skilled Workers for ACME Co.',
            city: 'Dubai',
            country: 'UAE',
            employer_name: 'ACME Co.',
            agency_name: 'Global Recruiters',
            applicants_count: 156,
            shortlisted_count: 45,
            interviews_count: 32,
            interviews_today_count: 5,
            posted_at: '2025-09-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  })
  async listAgencyJobPostings(
    @Param('license') license: string,
    @Query() query: ListAgencyJobPostingsQueryDto,
  ): Promise<PaginatedAgencyJobPostingsDto> {
    return this.agencyService.listAgencyJobPostingsEnriched(license, query);
  }

  // --- Expenses Endpoints ---
  @Post(':license/job-postings/:id/expenses/medical')
  @HttpCode(201)
  async addMedicalExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { domestic?: any; foreign?: any },
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createMedicalExpense(id, body as any);
    return { id: saved.id };
  }

  @Post(':license/job-postings/:id/expenses/insurance')
  @HttpCode(201)
  async addInsuranceExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createInsuranceExpense(id, body as any);
    return { id: saved.id };
  }

  @Post(':license/job-postings/:id/expenses/travel')
  @HttpCode(201)
  async addTravelExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createTravelExpense(id, body as any);
    return { id: saved.id };
  }

  @Post(':license/job-postings/:id/expenses/visa')
  @HttpCode(201)
  async addVisaExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createVisaPermitExpense(id, body as any);
    return { id: saved.id };
  }

  @Post(':license/job-postings/:id/expenses/training')
  @HttpCode(201)
  async addTrainingExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createTrainingExpense(id, body as any);
    return { id: saved.id };
  }

  @Post(':license/job-postings/:id/expenses/welfare')
  @HttpCode(201)
  async addWelfareExpense(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const saved = await this.expenseService.createWelfareServiceExpense(id, body as any);
    return { id: saved.id };
  }

  // --- Interview Endpoints ---
  @Post(':license/job-postings/:id/interview')
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Create interview for a job posting',
    description: 'Schedules an interview. Requires job_application_id to link interview to a specific candidate application.'
  })
  async createInterview(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    // Validate that job_application_id is provided
    if (!body.job_application_id) {
      throw new BadRequestException('job_application_id is required. Interviews must be linked to a candidate application.');
    }

    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    
    // The service now requires job_application_id, so it will enforce this constraint
    const saved = await this.interviewService.createInterview(id, body as any);
    return { id: saved.id };
  }

  @Get(':license/job-postings/:id/interview')
  @HttpCode(200)
  async getInterview(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot access job posting of another agency');
    const found = await this.interviewService.findInterviewByJobPosting(id);
    return found ?? null;
  }

  @Patch(':license/job-postings/:id/interview')
  @HttpCode(200)
  async updateInterview(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const existing = await this.interviewService.findInterviewByJobPosting(id);
    if (!existing) {
      throw new ForbiddenException('No interview found to update');
    }
    const updated = await this.interviewService.updateInterview(existing.id, body as any);
    return { id: updated.id };
  }

  // --- Cutout Upload/Remove ---
  @Post(':license/job-postings/:id/cutout')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload job posting cutout image' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiParam({ name: 'id', description: 'Job posting ID', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Cutout uploaded successfully', type: UploadResponseDto })
  async uploadCutout(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');

    // Upload the file using our new service
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.JOB_CUTOUT,
      id
    );

    if (result.success && result.url) {
      // Update job posting cutout_url field
      await this.jobPostingService.updateCutoutUrl(id, result.url);
    }

    return result;
  }

  @Delete(':license/job-postings/:id/cutout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove job posting cutout image' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiParam({ name: 'id', description: 'Job posting ID', required: true })
  @ApiOkResponse({ description: 'Cutout removed successfully', type: UploadResponseDto })
  async removeCutout(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UploadResponseDto> {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');

    // Delete the file using our new service
    const result = await this.imageUploadService.deleteFile(
      UploadType.JOB_CUTOUT,
      id
    );

    if (result.success) {
      // Clear job posting cutout_url field
      await this.jobPostingService.updateCutoutUrl(id, null);
    }

    return result;
  }

  // PATCH /agencies/:license/job-postings/:id/toggle-published - Toggle published status
  @Patch(':license/job-postings/:id/toggle-published')
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle job posting published status' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiParam({ name: 'id', description: 'Job posting ID', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        is_published: { type: 'boolean', description: 'New published status' }
      },
      required: ['is_published']
    }
  })
  @ApiOkResponse({ description: 'Published status toggled successfully' })
  async togglePublished(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('is_published') isPublished: boolean,
  ): Promise<{ success: boolean; is_published: boolean; message?: string }> {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');

    // If trying to unpublish (set to false), check for applications
    if (!isPublished && posting.is_published) {
      const applicationCount = await this.jobAppRepo.count({
        where: { job_posting_id: id }
      });
      
      if (applicationCount > 0) {
        throw new BadRequestException(
          `Cannot unpublish job posting. There are ${applicationCount} application(s) already submitted.`
        );
      }
    }

    // Update the published status
    await this.jobPostingService.updatePublishedStatus(id, isPublished);

    return {
      success: true,
      is_published: isPublished,
      message: isPublished ? 'Job posting published successfully' : 'Job posting unpublished successfully'
    };
  }

  // POST /agencies/:license/logo - Upload agency logo
  @Post(':license/logo')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload agency logo' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Logo uploaded successfully', type: UploadResponseDto })
  async uploadLogo(
    @Param('license') license: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Find agency by license
    const agency = await this.agencyService.findByLicense(license);
    if (!agency) {
      throw new BadRequestException('Agency not found');
    }

    // Upload the file
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.AGENCY_LOGO,
      agency.id
    );

    if (result.success && result.url) {
      // Update agency logo_url field
      await this.agencyService.updateLogoUrl(agency.id, result.url);
    }

    return result;
  }

  // DELETE /agencies/:license/logo - Remove agency logo
  @Delete(':license/logo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove agency logo' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiOkResponse({ description: 'Logo removed successfully', type: UploadResponseDto })
  async deleteLogo(
    @Param('license') license: string,
  ): Promise<UploadResponseDto> {
    // Find agency by license
    const agency = await this.agencyService.findByLicense(license);
    if (!agency) {
      throw new BadRequestException('Agency not found');
    }

    // Delete the file
    const result = await this.imageUploadService.deleteFile(
      UploadType.AGENCY_LOGO,
      agency.id
    );

    if (result.success) {
      // Clear agency logo_url field
      await this.agencyService.updateLogoUrl(agency.id, null);
    }

    return result;
  }

  // POST /agencies/:license/banner - Upload agency banner
  @Post(':license/banner')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload agency banner' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Banner uploaded successfully', type: UploadResponseDto })
  async uploadBanner(
    @Param('license') license: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Find agency by license
    const agency = await this.agencyService.findByLicense(license);
    if (!agency) {
      throw new BadRequestException('Agency not found');
    }

    // Upload the file
    const result = await this.imageUploadService.uploadFile(
      file,
      UploadType.AGENCY_BANNER,
      agency.id
    );

    if (result.success && result.url) {
      // Update agency banner_url field
      await this.agencyService.updateBannerUrl(agency.id, result.url);
    }

    return result;
  }

  // DELETE /agencies/:license/banner - Remove agency banner
  @Delete(':license/banner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove agency banner' })
  @ApiParam({ name: 'license', description: 'Agency license number', required: true })
  @ApiOkResponse({ description: 'Banner removed successfully', type: UploadResponseDto })
  async deleteBanner(
    @Param('license') license: string,
  ): Promise<UploadResponseDto> {
    // Find agency by license
    const agency = await this.agencyService.findByLicense(license);
    if (!agency) {
      throw new BadRequestException('Agency not found');
    }

    // Delete the file
    const result = await this.imageUploadService.deleteFile(
      UploadType.AGENCY_BANNER,
      agency.id
    );

    if (result.success) {
      // Clear agency banner_url field
      await this.agencyService.updateBannerUrl(agency.id, null);
    }

    return result;
  }

  // Helper method to map PostingAgency entity to AgencyResponseDto
  private mapAgencyToResponseDto(agency: any): AgencyResponseDto {
    return {
      id: agency.id,
      name: agency.name,
      license_number: agency.license_number,
      address: agency.address,
      phones: agency.phones,
      emails: agency.emails,
      website: agency.website,
      description: agency.description,
      logo_url: agency.logo_url,
      banner_url: agency.banner_url ?? null,
      established_year: agency.established_year ?? null,
      services: agency.services ?? null,
      certifications: agency.certifications ?? null,
      social_media: agency.social_media ?? null,
      bank_details: agency.bank_details ?? null,
      contact_persons: agency.contact_persons ?? null,
      operating_hours: agency.operating_hours ?? null,
      target_countries: agency.target_countries ?? null,
      specializations: agency.specializations ?? null,
      statistics: agency.statistics ?? null,
      settings: agency.settings ?? null,
    };
  }
}
