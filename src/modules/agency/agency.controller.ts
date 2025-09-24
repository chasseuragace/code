import { Controller, Post, HttpCode, Param, Body, Patch, Get, ParseUUIDPipe, ForbiddenException, UploadedFile, UseInterceptors, Delete, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyService } from './agency.service';
import { JobPostingService, CreateJobPostingDto } from '../domain/domain.service';
import { CreateJobPostingWithTagsDto } from '../domain/dto/create-job-posting-with-tags.dto';
import { UpdateJobTagsDto } from '../domain/dto/update-job-tags.dto';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting } from '../domain/domain.entity';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { ExpenseService, InterviewService } from '../domain/domain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';
import { AgencyUser } from './agency-user.entity';
import { DevSmsService } from './dev-sms.service';
import * as bcrypt from 'bcryptjs';
import { CreateAgencyDto, AgencyCreatedDto, AgencyResponseDto } from './dto/agency.dto';

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
  constructor(
    private readonly agencyService: AgencyService,
    private readonly jobPostingService: JobPostingService,
    private readonly expenseService: ExpenseService,
    private readonly interviewService: InterviewService,
    @InjectRepository(JobApplication) private readonly jobAppRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting) private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(AgencyUser) private readonly agencyUserRepo: Repository<AgencyUser>,
    private readonly sms: DevSmsService,
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

  // --- Owner-managed Members ---
  @Post('owner/members/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Invite an agency member and set an admin-managed password' })
  @ApiBody({ schema: { properties: { full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string', enum: ['staff', 'owner'] } }, required: ['full_name', 'phone'] } })
  @ApiResponse({ status: 201, description: 'Member invited', schema: { properties: { id: { type: 'string', format: 'uuid' }, phone: { type: 'string' }, role: { type: 'string' }, dev_password: { type: 'string' } } } })
  async inviteMember(
    @Req() req: any,
    @Body() body: { full_name: string; phone: string; role?: 'staff' },
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
        password_hash: hash,
        password_set_by_admin_at: new Date(),
      });
      await this.agencyUserRepo.save(au);
    }

    // Send SMS with login URL and password
    await this.sms.send(phone, `Welcome to ${user.agency_id}. Login at /member/login with password: ${password}`);
    return { id: au.id, phone: au.phone, role: au.role, dev_password: password };
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
  @ApiResponse({ status: 200, description: 'List of members', schema: { type: 'array', items: { properties: { id: { type: 'string', format: 'uuid' }, full_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string' } } } } })
  async listMembers(@Req() req: any) {
    const user = req.user as any;
    if (!user?.is_agency_owner || !user?.agency_id) throw new ForbiddenException('Only owners with an agency can list');
    const rows = await this.agencyUserRepo.find({ where: { agency_id: user.agency_id } });
    return rows.map(r => ({ id: r.id, full_name: r.full_name, phone: r.phone, role: r.role }));
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
  @Post(':license/job-postings')
  @HttpCode(201)
  async createJobPostingForAgency(
    @Param('license') license: string,
    @Body() body: CreateJobPostingWithTagsDto,
  ) {
    // Ensure agency exists
    const agency = await this.agencyService.findAgencyByLicense(license);
    const dto: CreateJobPostingDto = {
      ...body,
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

  // List job postings for an agency (basic)
  @Get(':license/job-postings')
  @HttpCode(200)
  async listAgencyJobPostings(@Param('license') license: string) {
    const rows = await this.jobPostingRepo
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'c')
      .leftJoinAndSelect('c.agency', 'ag')
      .where('ag.license_number = :license', { license })
      .orderBy('jp.posting_date_ad', 'DESC')
      .getMany();
    return rows.map(r => ({ id: r.id, posting_title: r.posting_title }));
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
  async createInterview(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const license = req.params.license;
        const id = req.params.id;
        const dest = path.resolve(process.cwd(), 'public', license, id);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.bin';
        cb(null, `cutout${ext}`);
      }
    })
  }))
  async uploadCutout(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const rel = `/public/${license}/${id}/${file.filename}`;
    const updated = await this.jobPostingService.updateCutoutUrl(id, rel);
    return { id: updated.id, cutout_url: rel };
  }

  @Delete(':license/job-postings/:id/cutout')
  @HttpCode(200)
  async removeCutout(
    @Param('license') license: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('deleteFile') deleteFile?: string,
  ) {
    const posting = await this.jobPostingService.findJobPostingById(id);
    const belongs = posting.contracts?.some(c => c.agency?.license_number === license);
    if (!belongs) throw new ForbiddenException('Cannot modify job posting of another agency');
    const currentUrl = (posting as any).cutout_url as string | undefined;
    const shouldDelete = (deleteFile || '').toLowerCase() === 'true';
    if (shouldDelete && currentUrl) {
      const absPath = path.resolve(process.cwd(), currentUrl.replace(/^\//, ''));
      try { if (fs.existsSync(absPath)) fs.unlinkSync(absPath); } catch { /* ignore */ }
    }
    const updated = await this.jobPostingService.updateCutoutUrl(id, null);
    return { id: updated.id, cutout_url: null };
  }
}
