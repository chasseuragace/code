import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, In } from 'typeorm';
import { MobileJobPostingDto, MobileJobPositionDto, MobileContractTermsDto } from '../candidate/dto/mobile-job.dto';
import {
  JobPosting,
  Employer,
  JobContract,
  JobPosition,
  SalaryConversion,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
  InterviewDetail,
  InterviewExpense,
} from './domain.entity';
import { PostingAgency } from './PostingAgency';
import { Country } from '../country/country.entity';
import { JobTitle } from '../job-title/job-title.entity';

// Minimal DTOs mirrored from reference/service.ts
export enum AnnouncementType {
  FULL_AD = 'full_ad',
  SHORT_AD = 'short_ad',
  UPDATE = 'update'
}

// AgencyService moved to src/modules/agency/agency.service.ts
export enum ProvisionType {
  FREE = 'free',
  PAID = 'paid',
  NOT_PROVIDED = 'not_provided'
}
export enum OvertimePolicy {
  AS_PER_COMPANY_POLICY = 'as_per_company_policy',
  PAID = 'paid',
  UNPAID = 'unpaid',
  NOT_APPLICABLE = 'not_applicable'
}
export enum ExpensePayer {
  COMPANY = 'company',
  WORKER = 'worker',
  SHARED = 'shared',
  NOT_APPLICABLE = 'not_applicable',
  AGENCY = 'agency'
}
export enum TicketType {
  ONE_WAY = 'one_way',
  ROUND_TRIP = 'round_trip',
  RETURN_ONLY = 'return_only'
}
export enum ExpenseType {
  VISA_FEE = 'visa_fee',
  WORK_PERMIT = 'work_permit',
  MEDICAL_EXAM = 'medical_exam',
  INSURANCE = 'insurance',
  AIR_TICKET = 'air_ticket',
  ORIENTATION_TRAINING = 'orientation_training',
  DOCUMENT_PROCESSING = 'document_processing',
  SERVICE_CHARGE = 'service_charge',
  WELFARE_FUND = 'welfare_fund',
  OTHER = 'other'
}

export interface MoneyAmountDto { amount: number; currency: string; }
export interface VacanciesDto { male: number; female: number; }
export interface SalaryDto { monthly_amount: number; currency: string; converted?: MoneyAmountDto[] }
export interface PositionDto {
  title: string;
  vacancies: VacanciesDto;
  salary: SalaryDto;
  hours_per_day_override?: number;
  days_per_week_override?: number;
  overtime_policy_override?: OvertimePolicy;
  weekly_off_days_override?: number;
  food_override?: ProvisionType;
  accommodation_override?: ProvisionType;
  transport_override?: ProvisionType;
  position_notes?: string;
}
export interface EmployerDto { company_name: string; country: string; city?: string }
export interface PostingAgencyDto { name: string; license_number: string; address?: string; phones?: string[]; emails?: string[]; website?: string }
export interface ContractDto {
  period_years: number;
  renewable?: boolean;
  hours_per_day?: number;
  days_per_week?: number;
  overtime_policy?: OvertimePolicy;
  weekly_off_days?: number;
  food?: ProvisionType;
  accommodation?: ProvisionType;
  transport?: ProvisionType;
  annual_leave_days?: number;
}
export interface ExpenseDto { who_pays: ExpensePayer; is_free?: boolean; amount?: number; currency?: string; notes?: string }
export interface CreateJobPostingDto {
  posting_title: string;
  country: string;
  city?: string;
  lt_number?: string;
  chalani_number?: string;
  approval_date_bs?: string;
  approval_date_ad?: string;
  posting_date_ad?: string;
  posting_date_bs?: string;
  announcement_type?: AnnouncementType;
  notes?: string;
  posting_agency: PostingAgencyDto;
  employer: EmployerDto;
  contract: ContractDto;
  positions: PositionDto[];
}

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting) private jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(PostingAgency) private agencyRepository: Repository<PostingAgency>,
    @InjectRepository(Employer) private employerRepository: Repository<Employer>,
    @InjectRepository(JobContract) private contractRepository: Repository<JobContract>,
    @InjectRepository(JobPosition) private positionRepository: Repository<JobPosition>,
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    @InjectRepository(JobTitle) private jobTitleRepository: Repository<JobTitle>,
    private dataSource: DataSource,
  ) {}

  async createJobPosting(dto: CreateJobPostingDto): Promise<JobPosting> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Validate country exists in countries table (accepts code or name, case-insensitive)
      const country = await this.countryRepository.findOne({
        where: [
          { country_code: dto.country.toUpperCase() },
          { country_name: ILike(dto.country) },
        ],
      });
      if (!country) {
        throw new BadRequestException(`Unknown country '${dto.country}'. Seed countries first or use a valid code/name.`);
      }

      // Agency
      let agency = await qr.manager.findOne(PostingAgency, { where: { license_number: dto.posting_agency.license_number } });
      if (!agency) {
        agency = qr.manager.create(PostingAgency, dto.posting_agency);
        agency = await qr.manager.save(agency);
      }

      // Employer
      let employer = await qr.manager.findOne(Employer, { where: { company_name: dto.employer.company_name, country: dto.employer.country, city: dto.employer.city ?? undefined } });
      if (!employer) {
        employer = qr.manager.create(Employer, dto.employer);
        employer = await qr.manager.save(employer);
      }

      // Posting (with optional tags)
      const extra: any = {};
      const anyDto = dto as any;
      if (anyDto.skills !== undefined) extra.skills = anyDto.skills;
      if (anyDto.education_requirements !== undefined) extra.education_requirements = anyDto.education_requirements;
      if (anyDto.experience_requirements !== undefined) extra.experience_requirements = anyDto.experience_requirements;

      const jp = qr.manager.create(JobPosting, {
        posting_title: dto.posting_title,
        country: dto.country,
        city: dto.city,
        lt_number: dto.lt_number,
        chalani_number: dto.chalani_number,
        approval_date_bs: dto.approval_date_bs,
        approval_date_ad: dto.approval_date_ad ? new Date(dto.approval_date_ad) : undefined,
        posting_date_ad: dto.posting_date_ad ? new Date(dto.posting_date_ad) : new Date(),
        posting_date_bs: dto.posting_date_bs,
        announcement_type: dto.announcement_type || AnnouncementType.FULL_AD,
        notes: dto.notes,
        ...extra,
      });
      const savedJP = await qr.manager.save(jp);

      // Optional: canonical titles many-to-many
      const canonicalIds: string[] | undefined = anyDto.canonical_title_ids;
      const canonicalNames: string[] | undefined = anyDto.canonical_title_names;
      if ((canonicalIds && canonicalIds.length) || (canonicalNames && canonicalNames.length)) {
        const titles = await this.validateCanonicalTitles(canonicalIds, canonicalNames, qr.manager);
        // set relation
        savedJP.canonical_titles = titles;
        await qr.manager.save(savedJP);
      }

      // Contract
      const contract = qr.manager.create(JobContract, {
        job_posting_id: savedJP.id,
        employer_id: employer.id,
        posting_agency_id: agency.id,
        period_years: dto.contract.period_years,
        renewable: dto.contract.renewable || false,
        hours_per_day: dto.contract.hours_per_day,
        days_per_week: dto.contract.days_per_week,
        overtime_policy: dto.contract.overtime_policy,
        weekly_off_days: dto.contract.weekly_off_days,
        food: dto.contract.food,
        accommodation: dto.contract.accommodation,
        transport: dto.contract.transport,
        annual_leave_days: dto.contract.annual_leave_days,
      });
      const savedContract = await qr.manager.save(contract);

      // Positions
      for (const p of dto.positions) {
        const pos = qr.manager.create(JobPosition, {
          job_contract_id: savedContract.id,
          title: p.title,
          male_vacancies: p.vacancies.male,
          female_vacancies: p.vacancies.female,
          monthly_salary_amount: p.salary.monthly_amount,
          salary_currency: p.salary.currency,
          hours_per_day_override: p.hours_per_day_override,
          days_per_week_override: p.days_per_week_override,
          overtime_policy_override: p.overtime_policy_override,
          weekly_off_days_override: p.weekly_off_days_override,
          food_override: p.food_override,
          accommodation_override: p.accommodation_override,
          transport_override: p.transport_override,
          position_notes: p.position_notes,
        });
        const savedPos = await qr.manager.save(pos);

        if (p.salary.converted?.length) {
          for (const conv of p.salary.converted) {
            const sc = qr.manager.create(SalaryConversion, {
              job_position_id: savedPos.id,
              converted_amount: conv.amount,
              converted_currency: conv.currency,
              conversion_date: new Date(),
            });
            await qr.manager.save(sc);
          }
        }
      }

      await qr.commitTransaction();
      return this.findJobPostingById(savedJP.id);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findJobPostingById(id: string): Promise<JobPosting> {
    const jp = await this.jobPostingRepository.findOne({
      where: { id },
      relations: ['canonical_titles', 'contracts', 'contracts.employer', 'contracts.agency', 'contracts.positions', 'contracts.positions.salaryConversions'],
    });
    if (!jp) throw new NotFoundException(`Job posting with ID ${id} not found`);
    return jp;
  }

  // Mobile-optimized projection of a job posting by ID
  async jobbyidmobile(id: string): Promise<MobileJobPostingDto> {
    const job = await this.findJobPostingById(id);
    const contract = Array.isArray(job.contracts) ? job.contracts[0] : undefined;
    const positions = contract?.positions || [];

    // Helper: format salary
    const formatMoney = (amount?: number, currency?: string): string | undefined => {
      if (amount == null || !currency) return undefined;
      return `${currency} ${amount}`;
    };

    // Map positions
    const positionDtos: MobileJobPositionDto[] = positions.map((p: any) => {
      const baseAmount = Number(p.monthly_salary_amount);
      const currency = p.salary_currency as string | undefined;

      const preferredConv =
        p.salaryConversions?.find((c: any) => String(c.converted_currency).toUpperCase() === 'NPR') ||
        p.salaryConversions?.find((c: any) => String(c.converted_currency).toUpperCase() === 'USD') ||
        p.salaryConversions?.[0];

      return {
        id: p.id,
        title: p.title,
        baseSalary: formatMoney(baseAmount, currency),
        convertedSalary: formatMoney(
          preferredConv?.converted_amount ? Number(preferredConv.converted_amount) : undefined,
          preferredConv?.converted_currency,
        ),
        currency,
        requirements: p.position_notes ? [p.position_notes] : undefined,
      };
    });

    // Contract terms mapping (safe defaults for missing fields)
    const contractTerms: MobileContractTermsDto | null = contract
      ? {
          type: 'Full-time', // Default value since contract_type doesn't exist in JobContract
          duration: contract.period_years ? `${contract.period_years} years` : 'Not specified',
          salary: undefined, // not in backend yet
          isRenewable: contract.renewable ?? undefined,
          noticePeriod: undefined, // notice_period_days doesn't exist in JobContract
          workingHours: undefined, // working_hours_weekly doesn't exist in JobContract
          probationPeriod: undefined, // probation_period_months doesn't exist in JobContract
          benefits: undefined, // not in backend yet
        }
      : null;

    // Job-level salary summary (from positions)
    let salarySummary: string | undefined;
    if (positions.length) {
      const salaryCurrency = positions[0].salary_currency;
      const amounts = positions
        .filter((p: any) => p.salary_currency === salaryCurrency)
        .map((p: any) => Number(p.monthly_salary_amount))
        .filter((n: number) => !isNaN(n));
      if (amounts.length) {
        const min = Math.min(...amounts);
        const max = Math.max(...amounts);
        salarySummary = `${salaryCurrency} ${min} - ${salaryCurrency} ${max}`;
      }
    }

    // Experience summary
    const xr = (job as any).experience_requirements as { min_years?: number; max_years?: number } | undefined;
    const experience = xr && (xr.min_years != null || xr.max_years != null)
      ? `${xr.min_years ?? 0}${xr.max_years != null ? '-' + xr.max_years : '+'} years`
      : undefined;

    // preferenceText: prefer canonical titles, then top skills, else undefined
    const canonicalTitles = Array.isArray(job.canonical_titles) 
      ? (job.canonical_titles as any[]).map(t => t.title).filter(Boolean) 
      : [];
    const skills = Array.isArray((job as any).skills) 
      ? ((job as any).skills as string[]).filter(Boolean) 
      : [];
    const preferenceText = canonicalTitles.length 
      ? canonicalTitles.join(', ') 
      : (skills.slice(0, 2).join(', ') || undefined);

    return {
      id: job.id,
      postingTitle: job.posting_title,
      country: job.country,
      city: job.city || null,
      agency: contract?.agency?.name,
      employer: contract?.employer?.company_name,
      positions: positionDtos,
      description: job.notes || undefined,
      contractTerms,
      isActive: job.is_active ?? true,
      postedDate: job.posting_date_ad ? new Date(job.posting_date_ad).toISOString() : undefined,
      preferencePriority: undefined,
      preferenceText,
      location: job.city && job.country ? `${job.city}, ${job.country}` : job.city || job.country,
      experience,
      salary: salarySummary,
      type: 'Full-time', // Default value since contract_type doesn't exist in JobContract
      isRemote: false,
      isFeatured: false,
      companyLogo: contract?.employer?.logo_url,
      matchPercentage: '0', // Will be overridden by controller
      convertedSalary: undefined, // not mapped yet
      applications: 0, // default until implemented
      policy: undefined, // not mapped yet
    };
  }

  // Validate canonical titles by IDs and/or names (active-only)
  private async validateCanonicalTitles(titleIds?: string[], titleNames?: string[], manager?: import('typeorm').EntityManager): Promise<JobTitle[]> {
    const repo = manager ? manager.getRepository(JobTitle) : this.jobTitleRepository;
    const results: JobTitle[] = [];
    if (titleIds && titleIds.length) {
      const byId = await repo.find({ where: { id: In(titleIds), is_active: true } });
      if (byId.length !== titleIds.length) {
        const found = new Set(byId.map(t => t.id));
        const missing = titleIds.filter(id => !found.has(id));
        throw new BadRequestException(`Invalid or inactive job title IDs: ${missing.join(', ')}`);
      }
      results.push(...byId);
    }
    if (titleNames && titleNames.length) {
      const byName = await repo.find({ where: { title: In(titleNames), is_active: true } });
      if (byName.length !== titleNames.length) {
        const found = new Set(byName.map(t => t.title));
        const missing = titleNames.filter(n => !found.has(n));
        throw new BadRequestException(`Invalid or inactive job titles: ${missing.join(', ')}`);
      }
      results.push(...byName);
    }
    return results;
  }

  // Update only tags (ownership check should be in controller via license, but we also return entity with canonical_titles)
  async updateJobPostingTags(id: string, dto: any): Promise<JobPosting> {
    // tags: skills, education_requirements, experience_requirements, canonical_title_ids
    const jp = await this.jobPostingRepository.findOne({ where: { id }, relations: ['canonical_titles'] });
    if (!jp) throw new NotFoundException('Job posting not found');

    const updates: Partial<JobPosting> = {};
    if (dto.skills !== undefined) updates.skills = dto.skills;
    if (dto.education_requirements !== undefined) updates.education_requirements = dto.education_requirements;
    if (dto.experience_requirements !== undefined) updates.experience_requirements = dto.experience_requirements;
    if (dto.canonical_title_ids?.length) {
      const titles = await this.validateCanonicalTitles(dto.canonical_title_ids, undefined);
      jp.canonical_titles = titles;
    }
    Object.assign(jp, updates);
    await this.jobPostingRepository.save(jp);
    return this.findJobPostingById(id);
  }

  async updateCutoutUrl(id: string, cutoutUrl: string | null): Promise<JobPosting> {
    if (cutoutUrl === null) {
      // Force NULL in DB for cutout_url
      const qbRes = await this.jobPostingRepository.createQueryBuilder()
        .update()
        .set({ cutout_url: (null as unknown) as any, updated_at: new Date() as any })
        .where({ id })
        .execute();
      if (qbRes.affected === 0) throw new NotFoundException(`Job posting with ID ${id} not found`);
    } else {
      const res = await this.jobPostingRepository.update(id, { cutout_url: cutoutUrl, updated_at: new Date() as any });
      if (res.affected === 0) throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
    return this.findJobPostingById(id);
  }

  async findOneWithTags(id: string): Promise<JobPosting> {
    const jp = await this.jobPostingRepository.findOne({ where: { id }, relations: ['canonical_titles'] });
    if (!jp) throw new NotFoundException('Job posting not found');
    return jp;
  }

  async findAllJobPostings(page = 1, limit = 10, country?: string, isActive = true) {
    const qb = this.jobPostingRepository
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .where('jp.is_active = :isActive', { isActive })
      .orderBy('jp.posting_date_ad', 'DESC');
    if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit };
  }

  async updateJobPosting(id: string, updateDto: Partial<CreateJobPostingDto>): Promise<JobPosting> {
    const _ = await this.findJobPostingById(id);
    const res = await this.jobPostingRepository.update(id, {
      posting_title: updateDto.posting_title,
      country: updateDto.country,
      city: updateDto.city,
      lt_number: updateDto.lt_number,
      chalani_number: updateDto.chalani_number,
      approval_date_bs: updateDto.approval_date_bs,
      approval_date_ad: updateDto.approval_date_ad ? new Date(updateDto.approval_date_ad) : undefined,
      posting_date_bs: updateDto.posting_date_bs,
      announcement_type: updateDto.announcement_type,
      notes: updateDto.notes,
      updated_at: new Date(),
    });
    if (res.affected === 0) throw new NotFoundException(`Job posting with ID ${id} not found`);
    return this.findJobPostingById(id);
  }

  async deactivateJobPosting(id: string): Promise<void> {
    const res = await this.jobPostingRepository.update(id, { is_active: false, updated_at: new Date() });
    if (res.affected === 0) throw new NotFoundException(`Job posting with ID ${id} not found`);
  }

  async searchJobPostings(params: {
    country?: string;
    position_title?: string;
    min_salary?: number;
    max_salary?: number;
    currency?: string;
    employer_name?: string;
    agency_name?: string;
    page?: number;
    limit?: number;
  }) {
    const { country, position_title, min_salary, max_salary, currency, employer_name, agency_name, page = 1, limit = 10 } = params;
    const qb = this.jobPostingRepository
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .where('jp.is_active = :isActive', { isActive: true });
    if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
    if (position_title) qb.andWhere('positions.title ILIKE :position_title', { position_title: `%${position_title}%` });
    if (min_salary && currency) qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
    if (max_salary && currency) qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
    if (employer_name) qb.andWhere('employer.company_name ILIKE :employer_name', { employer_name: `%${employer_name}%` });
    if (agency_name) qb.andWhere('agency.name ILIKE :agency_name', { agency_name: `%${agency_name}%` });
    qb.orderBy('jp.posting_date_ad', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit };
  }

  // Public keyword-based job search (for candidates/public use)
  async searchJobsByKeyword(params: {
    keyword?: string;
    country?: string;
    min_salary?: number;
    max_salary?: number;
    currency?: string;
    page?: number;
    limit?: number;
    sort_by?: 'posted_at' | 'salary' | 'relevance';
    order?: 'asc' | 'desc';
  }) {
    const { 
      keyword, 
      country, 
      min_salary, 
      max_salary, 
      currency, 
      page = 1, 
      limit = 10,
      sort_by = 'posted_at',
      order = 'desc'
    } = params;

    const qb = this.jobPostingRepository
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .leftJoinAndSelect('positions.salaryConversions', 'salaryConversions')
      .where('jp.is_active = :isActive', { isActive: true });

    // Keyword search across multiple fields using OR logic
    if (keyword) {
      qb.andWhere(`(
        jp.posting_title ILIKE :keyword OR
        positions.title ILIKE :keyword OR
        employer.company_name ILIKE :keyword OR
        agency.name ILIKE :keyword
      )`, { keyword: `%${keyword}%` });
    }

    // Other filters
    if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
    if (min_salary && currency) {
      qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
    }
    if (max_salary && currency) {
      qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
    }

    // Sorting
    switch (sort_by) {
      case 'salary':
        qb.orderBy('positions.monthly_salary_amount', order.toUpperCase() as 'ASC' | 'DESC');
        break;
      case 'relevance':
        // For relevance, we could add more sophisticated scoring later
        // For now, just use posting date as fallback
        qb.orderBy('jp.posting_date_ad', 'DESC');
        break;
      case 'posted_at':
      default:
        qb.orderBy('jp.posting_date_ad', order.toUpperCase() as 'ASC' | 'DESC');
        break;
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    
    return { data, total, page, limit, keyword, filters: { country, min_salary, max_salary, currency } };
  }
}

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(MedicalExpense) private medicalExpenseRepository: Repository<MedicalExpense>,
    @InjectRepository(InsuranceExpense) private insuranceExpenseRepository: Repository<InsuranceExpense>,
    @InjectRepository(TravelExpense) private travelExpenseRepository: Repository<TravelExpense>,
    @InjectRepository(VisaPermitExpense) private visaPermitExpenseRepository: Repository<VisaPermitExpense>,
    @InjectRepository(TrainingExpense) private trainingExpenseRepository: Repository<TrainingExpense>,
    @InjectRepository(WelfareServiceExpense) private welfareServiceExpenseRepository: Repository<WelfareServiceExpense>,
  ) {}

  async createMedicalExpense(jobPostingId: string, expenseData: { domestic?: ExpenseDto & { notes?: string }; foreign?: ExpenseDto & { notes?: string } }): Promise<MedicalExpense> {
    const entity = this.medicalExpenseRepository.create({
      job_posting_id: jobPostingId,
      domestic_who_pays: expenseData.domestic?.who_pays,
      domestic_is_free: expenseData.domestic?.is_free || false,
      domestic_amount: expenseData.domestic?.amount,
      domestic_currency: expenseData.domestic?.currency,
      domestic_notes: expenseData.domestic?.notes,
      foreign_who_pays: expenseData.foreign?.who_pays,
      foreign_is_free: expenseData.foreign?.is_free || false,
      foreign_amount: expenseData.foreign?.amount,
      foreign_currency: expenseData.foreign?.currency,
      foreign_notes: expenseData.foreign?.notes,
    });
    return this.medicalExpenseRepository.save(entity);
  }

  async createInsuranceExpense(jobPostingId: string, expenseData: ExpenseDto & { coverage_amount?: number; coverage_currency?: string; }): Promise<InsuranceExpense> {
    const entity = this.insuranceExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      coverage_amount: expenseData.coverage_amount,
      coverage_currency: expenseData.coverage_currency,
      notes: expenseData.notes,
    });
    return this.insuranceExpenseRepository.save(entity);
  }

  async createTravelExpense(jobPostingId: string, expenseData: ExpenseDto & { ticket_type?: TicketType }): Promise<TravelExpense> {
    const entity = this.travelExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_provides: expenseData.who_pays,
      ticket_type: (expenseData as any).ticket_type,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      notes: expenseData.notes,
    });
    return this.travelExpenseRepository.save(entity);
  }

  async createVisaPermitExpense(jobPostingId: string, expenseData: ExpenseDto & { refundable?: boolean }): Promise<VisaPermitExpense> {
    const entity = this.visaPermitExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      refundable: (expenseData as any).refundable || false,
      notes: expenseData.notes,
    });
    return this.visaPermitExpenseRepository.save(entity);
  }

  async createTrainingExpense(jobPostingId: string, expenseData: ExpenseDto & { duration_days?: number; mandatory?: boolean }): Promise<TrainingExpense> {
    const entity = this.trainingExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      duration_days: (expenseData as any).duration_days,
      mandatory: (expenseData as any).mandatory !== undefined ? (expenseData as any).mandatory : true,
      notes: expenseData.notes,
    });
    return this.trainingExpenseRepository.save(entity);
  }

  async createWelfareServiceExpense(jobPostingId: string, expenseData: { welfare?: ExpenseDto & { fund_purpose?: string; refundable?: boolean }; service?: ExpenseDto & { service_type?: string; refundable?: boolean } }): Promise<WelfareServiceExpense> {
    const entity = this.welfareServiceExpenseRepository.create({
      job_posting_id: jobPostingId,
      welfare_who_pays: expenseData.welfare?.who_pays,
      welfare_is_free: expenseData.welfare?.is_free || false,
      welfare_amount: expenseData.welfare?.amount,
      welfare_currency: expenseData.welfare?.currency,
      welfare_fund_purpose: (expenseData.welfare as any)?.fund_purpose,
      welfare_refundable: (expenseData.welfare as any)?.refundable || false,
      welfare_notes: expenseData.welfare?.notes,
      service_who_pays: expenseData.service?.who_pays,
      service_is_free: expenseData.service?.is_free || false,
      service_amount: expenseData.service?.amount,
      service_currency: expenseData.service?.currency,
      service_type: (expenseData.service as any)?.service_type,
      service_refundable: (expenseData.service as any)?.refundable || false,
      service_notes: expenseData.service?.notes,
    });
    return this.welfareServiceExpenseRepository.save(entity);
  }

  async getJobPostingExpenses(jobPostingId: string) {
    const [medical, insurance, travel, visa, training, welfare] = await Promise.all([
      this.medicalExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.insuranceExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.travelExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.visaPermitExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.trainingExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.welfareServiceExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
    ]);
    return { medical, insurance, travel, visa, training, welfare };
  }
}

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewDetail) private interviewRepository: Repository<InterviewDetail>,
    @InjectRepository(InterviewExpense) private interviewExpenseRepository: Repository<InterviewExpense>,
  ) {}

  async createInterview(jobPostingId: string, interviewData: {
    interview_date_ad?: string;
    interview_date_bs?: string;
    interview_time?: string;
    location?: string;
    contact_person?: string;
    required_documents?: string[];
    notes?: string;
    job_application_id?: string | null;
    expenses?: Array<{ expense_type: ExpenseType; who_pays: ExpensePayer; is_free?: boolean; amount?: number; currency?: string; refundable?: boolean; notes?: string; }>;
  }): Promise<InterviewDetail> {
    const interview = this.interviewRepository.create({
      job_posting_id: jobPostingId,
      job_application_id: interviewData.job_application_id ?? null,
      interview_date_ad: interviewData.interview_date_ad ? new Date(interviewData.interview_date_ad) : undefined,
      interview_date_bs: interviewData.interview_date_bs,
      interview_time: interviewData.interview_time,
      location: interviewData.location,
      contact_person: interviewData.contact_person,
      required_documents: interviewData.required_documents,
      notes: interviewData.notes,
    });
    const saved = await this.interviewRepository.save(interview);

    if (interviewData.expenses?.length) {
      for (const e of interviewData.expenses) {
        const exp = this.interviewExpenseRepository.create({
          interview_id: saved.id,
          expense_type: e.expense_type,
          who_pays: e.who_pays,
          is_free: e.is_free || false,
          amount: e.amount,
          currency: e.currency,
          refundable: e.refundable || false,
          notes: e.notes,
        });
        await this.interviewExpenseRepository.save(exp);
      }
    }
    return this.findInterviewById(saved.id);
  }

  async findInterviewById(id: string): Promise<InterviewDetail> {
    const itv = await this.interviewRepository.findOne({ where: { id }, relations: ['expenses'] });
    if (!itv) throw new NotFoundException(`Interview with ID ${id} not found`);
    return itv;
  }

  async findInterviewByJobPosting(jobPostingId: string): Promise<InterviewDetail | null> {
    return this.interviewRepository.findOne({ where: { job_posting_id: jobPostingId }, relations: ['expenses'] });
  }

  async updateInterview(id: string, updateData: Partial<{ interview_date_ad: string; interview_date_bs: string; interview_time: string; location: string; contact_person: string; required_documents: string[]; notes: string; }>): Promise<InterviewDetail> {
    const res = await this.interviewRepository.update(id, { ...updateData, interview_date_ad: updateData.interview_date_ad ? new Date(updateData.interview_date_ad) : undefined, updated_at: new Date() });
    if (res.affected === 0) throw new NotFoundException(`Interview with ID ${id} not found`);
    return this.findInterviewById(id);
  }

  // List interviews by candidate IDs with upcoming-first ordering and pagination
  async listByCandidates(params: {
    candidateIds: string[];
    page?: number;
    limit?: number;
    only_upcoming?: boolean;
    order?: 'upcoming' | 'recent';
  }): Promise<{ items: Array<InterviewDetail & { job_posting: any; expenses: any[]; _app_id: string; _app_status: string; _agency: any; _employer: any }>; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const onlyUpcoming = params.only_upcoming !== false; // default true
    const orderMode = params.order ?? 'upcoming';

    const qb = this.interviewRepository.createQueryBuilder('int')
      .innerJoin('job_applications', 'app', 'app.id = int.job_application_id AND app.candidate_id IN (:...cids)', { cids: params.candidateIds })
      .leftJoinAndSelect('int.job_posting', 'jp')
      .leftJoinAndSelect('int.expenses', 'iexp')
      // join a single contract to fetch employer and agency context; may duplicate rows if multiple contracts
      .leftJoin('job_contracts', 'jc', 'jc.job_posting_id = jp.id')
      .leftJoin('employers', 'em', 'em.id = jc.employer_id')
      .leftJoin('posting_agencies', 'ag', 'ag.id = jc.posting_agency_id')
      .addSelect(['app.id AS _app_id', 'app.status AS _app_status'])
      .addSelect(['ag.id AS _ag_id', 'ag.name AS _ag_name', 'ag.license_number AS _ag_license', 'ag.phones AS _ag_phones', 'ag.emails AS _ag_emails', 'ag.website AS _ag_website'])
      .addSelect(['em.id AS _em_id', 'em.company_name AS _em_company', 'em.country AS _em_country', 'em.city AS _em_city']);

    if (onlyUpcoming) {
      qb.andWhere('int.interview_date_ad IS NULL OR int.interview_date_ad >= CURRENT_DATE');
    }

    // Ordering key (date only for now). Use NULLS LAST for upcoming, DESC for recent
    const orderExpr = "int.interview_date_ad";
    if (orderMode === 'upcoming') {
      qb.orderBy(orderExpr, 'ASC', 'NULLS LAST');
    } else {
      qb.orderBy(orderExpr, 'DESC', 'NULLS LAST');
    }

    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    // Map entity + raw selections
    const items = rows.entities.map((ent, idx) => {
      const raw = rows.raw[idx] as any;
      const agency = {
        id: raw._ag_id,
        name: raw._ag_name,
        license_number: raw._ag_license,
        phones: raw._ag_phones ?? null,
        emails: raw._ag_emails ?? null,
        website: raw._ag_website ?? null,
      };
      const employer = {
        id: raw._em_id,
        company_name: raw._em_company,
        country: raw._em_country,
        city: raw._em_city ?? null,
      };
      return Object.assign(ent, { _app_id: raw._app_id, _app_status: raw._app_status, _agency: agency, _employer: employer });
    });

    return { items, total, page, limit };
  }

  // List interviews by a single candidate ID
  async listByCandidate(params: {
    candidateId: string;
    page?: number;
    limit?: number;
    only_upcoming?: boolean;
    order?: 'upcoming' | 'recent';
  }): Promise<{ items: Array<InterviewDetail & { job_posting: any; expenses: any[]; _app_id: string; _app_status: string; _agency: any; _employer: any }>; total: number; page: number; limit: number }> {
    return this.listByCandidates({ ...params, candidateIds: [params.candidateId] });
  }
}
