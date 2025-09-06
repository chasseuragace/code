// DTOs and Types
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  JobPosting,
  PostingAgency,
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
} from './entity';

// Enums
export enum AnnouncementType {
  FULL_AD = 'full_ad',
  SHORT_AD = 'short_ad',
  UPDATE = 'update'
}

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

// DTOs
export class MoneyAmountDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;
}

export class VacanciesDto {
  @IsNumber()
  @Min(0)
  male: number;

  @IsNumber()
  @Min(0)
  female: number;
}

export class SalaryDto {
  @IsNumber()
  @Min(0)
  monthly_amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MoneyAmountDto)
  converted?: MoneyAmountDto[];
}

export class PositionDto {
  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => VacanciesDto)
  vacancies: VacanciesDto;

  @ValidateNested()
  @Type(() => SalaryDto)
  salary: SalaryDto;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(16)
  hours_per_day_override?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  days_per_week_override?: number;

  @IsOptional()
  @IsEnum(OvertimePolicy)
  overtime_policy_override?: OvertimePolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  weekly_off_days_override?: number;

  @IsOptional()
  @IsEnum(ProvisionType)
  food_override?: ProvisionType;

  @IsOptional()
  @IsEnum(ProvisionType)
  accommodation_override?: ProvisionType;

  @IsOptional()
  @IsEnum(ProvisionType)
  transport_override?: ProvisionType;

  @IsOptional()
  @IsString()
  position_notes?: string;
}

export class EmployerDto {
  @IsString()
  company_name: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class PostingAgencyDto {
  @IsString()
  name: string;

  @IsString()
  license_number: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  @IsOptional()
  @IsString()
  website?: string;
}

export class ContractDto {
  @IsNumber()
  @Min(1)
  period_years: number;

  @IsOptional()
  @IsBoolean()
  renewable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(16)
  hours_per_day?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  days_per_week?: number;

  @IsOptional()
  @IsEnum(OvertimePolicy)
  overtime_policy?: OvertimePolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  weekly_off_days?: number;

  @IsOptional()
  @IsEnum(ProvisionType)
  food?: ProvisionType;

  @IsOptional()
  @IsEnum(ProvisionType)
  accommodation?: ProvisionType;

  @IsOptional()
  @IsEnum(ProvisionType)
  transport?: ProvisionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annual_leave_days?: number;
}

export class ExpenseDto {
  @IsEnum(ExpensePayer)
  who_pays: ExpensePayer;

  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateJobPostingDto {
  // Meta information
  @IsString()
  posting_title: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  lt_number?: string;

  @IsOptional()
  @IsString()
  chalani_number?: string;

  @IsOptional()
  @IsString()
  approval_date_bs?: string;

  @IsOptional()
  @IsDateString()
  approval_date_ad?: string;

  @IsOptional()
  @IsDateString()
  posting_date_ad?: string;

  @IsOptional()
  @IsString()
  posting_date_bs?: string;

  @IsOptional()
  @IsEnum(AnnouncementType)
  announcement_type?: AnnouncementType;

  @IsOptional()
  @IsString()
  notes?: string;

  // Posting Agency
  @ValidateNested()
  @Type(() => PostingAgencyDto)
  posting_agency: PostingAgencyDto;

  // Employer and Jobs
  @ValidateNested()
  @Type(() => EmployerDto)
  employer: EmployerDto;

  @ValidateNested()
  @Type(() => ContractDto)
  contract: ContractDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  positions: PositionDto[];
}

// Service Classes
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    
    @InjectRepository(PostingAgency)
    private agencyRepository: Repository<PostingAgency>,
    
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    
    @InjectRepository(JobContract)
    private contractRepository: Repository<JobContract>,
    
    @InjectRepository(JobPosition)
    private positionRepository: Repository<JobPosition>,
    
    private dataSource: DataSource,
  ) {}

  async createJobPosting(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create or get posting agency
      let agency = await queryRunner.manager.findOne(PostingAgency, {
        where: { license_number: createJobPostingDto.posting_agency.license_number }
      });

      if (!agency) {
        agency = queryRunner.manager.create(PostingAgency, createJobPostingDto.posting_agency);
        agency = await queryRunner.manager.save(agency);
      }

      // Create or get employer
      let employer = await queryRunner.manager.findOne(Employer, {
        where: {
          company_name: createJobPostingDto.employer.company_name,
          country: createJobPostingDto.employer.country,
          city: createJobPostingDto.employer.city || null
        }
      });

      if (!employer) {
        employer = queryRunner.manager.create(Employer, createJobPostingDto.employer);
        employer = await queryRunner.manager.save(employer);
      }

      // Create job posting
      const jobPosting = queryRunner.manager.create(JobPosting, {
        posting_title: createJobPostingDto.posting_title,
        country: createJobPostingDto.country,
        city: createJobPostingDto.city,
        lt_number: createJobPostingDto.lt_number,
        chalani_number: createJobPostingDto.chalani_number,
        approval_date_bs: createJobPostingDto.approval_date_bs,
        approval_date_ad: createJobPostingDto.approval_date_ad ? new Date(createJobPostingDto.approval_date_ad) : null,
        posting_date_ad: createJobPostingDto.posting_date_ad ? new Date(createJobPostingDto.posting_date_ad) : new Date(),
        posting_date_bs: createJobPostingDto.posting_date_bs,
        announcement_type: createJobPostingDto.announcement_type || AnnouncementType.FULL_AD,
        notes: createJobPostingDto.notes
      });

      const savedJobPosting = await queryRunner.manager.save(jobPosting);

      // Create job contract
      const jobContract = queryRunner.manager.create(JobContract, {
        job_posting_id: savedJobPosting.id,
        employer_id: employer.id,
        posting_agency_id: agency.id,
        period_years: createJobPostingDto.contract.period_years,
        renewable: createJobPostingDto.contract.renewable || false,
        hours_per_day: createJobPostingDto.contract.hours_per_day,
        days_per_week: createJobPostingDto.contract.days_per_week,
        overtime_policy: createJobPostingDto.contract.overtime_policy,
        weekly_off_days: createJobPostingDto.contract.weekly_off_days,
        food: createJobPostingDto.contract.food,
        accommodation: createJobPostingDto.contract.accommodation,
        transport: createJobPostingDto.contract.transport,
        annual_leave_days: createJobPostingDto.contract.annual_leave_days
      });

      const savedContract = await queryRunner.manager.save(jobContract);

      // Create job positions
      for (const positionDto of createJobPostingDto.positions) {
        const position = queryRunner.manager.create(JobPosition, {
          job_contract_id: savedContract.id,
          title: positionDto.title,
          male_vacancies: positionDto.vacancies.male,
          female_vacancies: positionDto.vacancies.female,
          monthly_salary_amount: positionDto.salary.monthly_amount,
          salary_currency: positionDto.salary.currency,
          hours_per_day_override: positionDto.hours_per_day_override,
          days_per_week_override: positionDto.days_per_week_override,
          overtime_policy_override: positionDto.overtime_policy_override,
          weekly_off_days_override: positionDto.weekly_off_days_override,
          food_override: positionDto.food_override,
          accommodation_override: positionDto.accommodation_override,
          transport_override: positionDto.transport_override,
          position_notes: positionDto.position_notes
        });

        const savedPosition = await queryRunner.manager.save(position);

        // Create salary conversions if provided
        if (positionDto.salary.converted && positionDto.salary.converted.length > 0) {
          for (const conversion of positionDto.salary.converted) {
            const salaryConversion = queryRunner.manager.create(SalaryConversion, {
              job_position_id: savedPosition.id,
              converted_amount: conversion.amount,
              converted_currency: conversion.currency,
              conversion_date: new Date()
            });
            await queryRunner.manager.save(salaryConversion);
          }
        }
      }

      await queryRunner.commitTransaction();
      
      return this.findJobPostingById(savedJobPosting.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findJobPostingById(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id },
      relations: ['contracts', 'contracts.employer', 'contracts.agency', 'contracts.positions', 'contracts.positions.salaryConversions']
    });

    if (!jobPosting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }

    return jobPosting;
  }

  async findAllJobPostings(
    page: number = 1,
    limit: number = 10,
    country?: string,
    isActive: boolean = true
  ): Promise<{ data: JobPosting[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.jobPostingRepository.createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .where('jp.is_active = :isActive', { isActive })
      .orderBy('jp.posting_date_ad', 'DESC');

    if (country) {
      queryBuilder.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async updateJobPosting(id: string, updateDto: Partial<CreateJobPostingDto>): Promise<JobPosting> {
    const existingJobPosting = await this.findJobPostingById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update job posting basic info
      await queryRunner.manager.update(JobPosting, id, {
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
        updated_at: new Date()
      });

      await queryRunner.commitTransaction();
      
      return this.findJobPostingById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivateJobPosting(id: string): Promise<void> {
    const result = await this.jobPostingRepository.update(id, { 
      is_active: false,
      updated_at: new Date()
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
  }

  async searchJobPostings(searchParams: {
    country?: string;
    position_title?: string;
    min_salary?: number;
    max_salary?: number;
    currency?: string;
    employer_name?: string;
    agency_name?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: JobPosting[]; total: number; page: number; limit: number }> {
    const { 
      country, 
      position_title, 
      min_salary, 
      max_salary, 
      currency, 
      employer_name, 
      agency_name,
      page = 1, 
      limit = 10 
    } = searchParams;

    const queryBuilder = this.jobPostingRepository.createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .where('jp.is_active = :isActive', { isActive: true });

    if (country) {
      queryBuilder.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
    }

    if (position_title) {
      queryBuilder.andWhere('positions.title ILIKE :position_title', { position_title: `%${position_title}%` });
    }

    if (min_salary && currency) {
      queryBuilder.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', 
        { min_salary, currency });
    }

    if (max_salary && currency) {
      queryBuilder.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', 
        { max_salary, currency });
    }

    if (employer_name) {
      queryBuilder.andWhere('employer.company_name ILIKE :employer_name', { employer_name: `%${employer_name}%` });
    }

    if (agency_name) {
      queryBuilder.andWhere('agency.name ILIKE :agency_name', { agency_name: `%${agency_name}%` });
    }

    queryBuilder.orderBy('jp.posting_date_ad', 'DESC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }
}

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(MedicalExpense)
    private medicalExpenseRepository: Repository<MedicalExpense>,
    
    @InjectRepository(InsuranceExpense)
    private insuranceExpenseRepository: Repository<InsuranceExpense>,
    
    @InjectRepository(TravelExpense)
    private travelExpenseRepository: Repository<TravelExpense>,
    
    @InjectRepository(VisaPermitExpense)
    private visaPermitExpenseRepository: Repository<VisaPermitExpense>,
    
    @InjectRepository(TrainingExpense)
    private trainingExpenseRepository: Repository<TrainingExpense>,
    
    @InjectRepository(WelfareServiceExpense)
    private welfareServiceExpenseRepository: Repository<WelfareServiceExpense>,
  ) {}

  async createMedicalExpense(jobPostingId: string, expenseData: {
    domestic?: ExpenseDto & { notes?: string };
    foreign?: ExpenseDto & { notes?: string };
  }): Promise<MedicalExpense> {
    const medicalExpense = this.medicalExpenseRepository.create({
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
      foreign_notes: expenseData.foreign?.notes
    });

    return await this.medicalExpenseRepository.save(medicalExpense);
  }

  async createInsuranceExpense(jobPostingId: string, expenseData: ExpenseDto & {
    coverage_amount?: number;
    coverage_currency?: string;
  }): Promise<InsuranceExpense> {
    const insuranceExpense = this.insuranceExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      coverage_amount: expenseData.coverage_amount,
      coverage_currency: expenseData.coverage_currency,
      notes: expenseData.notes
    });

    return await this.insuranceExpenseRepository.save(insuranceExpense);
  }

  async createTravelExpense(jobPostingId: string, expenseData: ExpenseDto & {
    ticket_type?: TicketType;
  }): Promise<TravelExpense> {
    const travelExpense = this.travelExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_provides: expenseData.who_pays,
      ticket_type: expenseData.ticket_type,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      notes: expenseData.notes
    });

    return await this.travelExpenseRepository.save(travelExpense);
  }

  async createVisaPermitExpense(jobPostingId: string, expenseData: ExpenseDto & {
    refundable?: boolean;
  }): Promise<VisaPermitExpense> {
    const visaExpense = this.visaPermitExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      refundable: expenseData.refundable || false,
      notes: expenseData.notes
    });

    return await this.visaPermitExpenseRepository.save(visaExpense);
  }

  async createTrainingExpense(jobPostingId: string, expenseData: ExpenseDto & {
    duration_days?: number;
    mandatory?: boolean;
  }): Promise<TrainingExpense> {
    const trainingExpense = this.trainingExpenseRepository.create({
      job_posting_id: jobPostingId,
      who_pays: expenseData.who_pays,
      is_free: expenseData.is_free || false,
      amount: expenseData.amount,
      currency: expenseData.currency,
      duration_days: expenseData.duration_days,
      mandatory: expenseData.mandatory !== undefined ? expenseData.mandatory : true,
      notes: expenseData.notes
    });

    return await this.trainingExpenseRepository.save(trainingExpense);
  }

  async createWelfareServiceExpense(jobPostingId: string, expenseData: {
    welfare?: ExpenseDto & { fund_purpose?: string; refundable?: boolean };
    service?: ExpenseDto & { service_type?: string; refundable?: boolean };
  }): Promise<WelfareServiceExpense> {
    const welfareServiceExpense = this.welfareServiceExpenseRepository.create({
      job_posting_id: jobPostingId,
      welfare_who_pays: expenseData.welfare?.who_pays,
      welfare_is_free: expenseData.welfare?.is_free || false,
      welfare_amount: expenseData.welfare?.amount,
      welfare_currency: expenseData.welfare?.currency,
      welfare_fund_purpose: expenseData.welfare?.fund_purpose,
      welfare_refundable: expenseData.welfare?.refundable || false,
      welfare_notes: expenseData.welfare?.notes,
      service_who_pays: expenseData.service?.who_pays,
      service_is_free: expenseData.service?.is_free || false,
      service_amount: expenseData.service?.amount,
      service_currency: expenseData.service?.currency,
      service_type: expenseData.service?.service_type,
      service_refundable: expenseData.service?.refundable || false,
      service_notes: expenseData.service?.notes
    });

    return await this.welfareServiceExpenseRepository.save(welfareServiceExpense);
  }

  async getJobPostingExpenses(jobPostingId: string): Promise<{
    medical?: MedicalExpense;
    insurance?: InsuranceExpense;
    travel?: TravelExpense;
    visa?: VisaPermitExpense;
    training?: TrainingExpense;
    welfare?: WelfareServiceExpense;
  }> {
    const [medical, insurance, travel, visa, training, welfare] = await Promise.all([
      this.medicalExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.insuranceExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.travelExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.visaPermitExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.trainingExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } }),
      this.welfareServiceExpenseRepository.findOne({ where: { job_posting_id: jobPostingId } })
    ]);

    return { medical, insurance, travel, visa, training, welfare };
  }
}

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewDetail)
    private interviewRepository: Repository<InterviewDetail>,
    
    @InjectRepository(InterviewExpense)
    private interviewExpenseRepository: Repository<InterviewExpense>,
  ) {}

  async createInterview(jobPostingId: string, interviewData: {
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
  }): Promise<InterviewDetail> {
    const interview = this.interviewRepository.create({
      job_posting_id: jobPostingId,
      interview_date_ad: interviewData.interview_date_ad ? new Date(interviewData.interview_date_ad) : null,
      interview_date_bs: interviewData.interview_date_bs,
      interview_time: interviewData.interview_time,
      location: interviewData.location,
      contact_person: interviewData.contact_person,
      required_documents: interviewData.required_documents,
      notes: interviewData.notes
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Create interview expenses if provided
    if (interviewData.expenses && interviewData.expenses.length > 0) {
      for (const expenseData of interviewData.expenses) {
        const expense = this.interviewExpenseRepository.create({
          interview_id: savedInterview.id,
          expense_type: expenseData.expense_type,
          who_pays: expenseData.who_pays,
          is_free: expenseData.is_free || false,
          amount: expenseData.amount,
          currency: expenseData.currency,
          refundable: expenseData.refundable || false,
          notes: expenseData.notes
        });
        await this.interviewExpenseRepository.save(expense);
      }
    }

    return this.findInterviewById(savedInterview.id);
  }

  async findInterviewById(id: string): Promise<InterviewDetail> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['expenses']
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async findInterviewByJobPosting(jobPostingId: string): Promise<InterviewDetail | null> {
    return await this.interviewRepository.findOne({
      where: { job_posting_id: jobPostingId },
      relations: ['expenses']
    });
  }

  async updateInterview(id: string, updateData: Partial<{
    interview_date_ad: string;
    interview_date_bs: string;
    interview_time: string;
    location: string;
    contact_person: string;
    required_documents: string[];
    notes: string;
  }>): Promise<InterviewDetail> {
    const result = await this.interviewRepository.update(id, {
      ...updateData,
      interview_date_ad: updateData.interview_date_ad ? new Date(updateData.interview_date_ad) : undefined,
      updated_at: new Date()
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return this.findInterviewById(id);
  }
}

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(PostingAgency)
    private agencyRepository: Repository<PostingAgency>,
  ) {}

  async createAgency(agencyData: PostingAgencyDto): Promise<PostingAgency> {
    // Check if license number already exists
    const existingAgency = await this.agencyRepository.findOne({
      where: { license_number: agencyData.license_number }
    });

    if (existingAgency) {
      throw new BadRequestException(`Agency with license number ${agencyData.license_number} already exists`);
    }

    const agency = this.agencyRepository.create(agencyData);
    return await this.agencyRepository.save(agency);
  }

  async findAgencyById(id: string): Promise<PostingAgency> {
    const agency = await this.agencyRepository.findOne({
      where: { id, is_active: true }
    });

    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    return agency;
  }

  async findAgencyByLicense(licenseNumber: string): Promise<PostingAgency> {
    const agency = await this.agencyRepository.findOne({
      where: { license_number: licenseNumber, is_active: true }
    });

    if (!agency) {
      throw new NotFoundException(`Agency with license number ${licenseNumber} not found`);
    }

    return agency;
  }

  async findAllAgencies(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: PostingAgency[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.agencyRepository.findAndCount({
      where: { is_active: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total, page, limit };
  }

  async updateAgency(id: string, updateData: Partial<PostingAgencyDto>): Promise<PostingAgency> {
    const result = await this.agencyRepository.update(id, {
      ...updateData,
      updated_at: new Date()
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }

    return this.findAgencyById(id);
  }

  async deactivateAgency(id: string): Promise<void> {
    const result = await this.agencyRepository.update(id, {
      is_active: false,
      updated_at: new Date()
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }
  }

  async getAgencyJobPostings(agencyId: string, page: number = 1, limit: number = 10): Promise<{
    data: JobPosting[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.agencyRepository
      .createQueryBuilder('agency')
      .leftJoinAndSelect('agency.contracts', 'contracts')
      .leftJoinAndSelect('contracts.job_posting', 'job_posting')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .where('agency.id = :agencyId', { agencyId })
      .andWhere('job_posting.is_active = :isActive', { isActive: true })
      .orderBy('job_posting.posting_date_ad', 'DESC');

    const total = await queryBuilder.getCount();
    const result = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getOne();

    const data = result?.contracts?.map(contract => contract.job_posting) || [];

    return { data, total, page, limit };
  }
}

// Additional utility service for statistics and reporting
@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    
    @InjectRepository(JobPosition)
    private positionRepository: Repository<JobPosition>,
    
    private dataSource: DataSource,
  ) {}

  async getJobPostingStats(): Promise<{
    total_postings: number;
    active_postings: number;
    total_positions: number;
    total_vacancies: number;
    by_country: Array<{ country: string; count: number }>;
    by_month: Array<{ month: string; count: number }>;
  }> {
    const [totalPostings, activePostings] = await Promise.all([
      this.jobPostingRepository.count(),
      this.jobPostingRepository.count({ where: { is_active: true } })
    ]);

    const [totalPositions, totalVacancies] = await Promise.all([
      this.positionRepository.count(),
      this.positionRepository
        .createQueryBuilder('position')
        .select('SUM(position.male_vacancies + position.female_vacancies)', 'total')
        .getRawOne()
        .then(result => parseInt(result.total) || 0)
    ]);

    const byCountry = await this.jobPostingRepository
      .createQueryBuilder('jp')
      .select('jp.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('jp.is_active = :isActive', { isActive: true })
      .groupBy('jp.country')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byMonth = await this.jobPostingRepository
      .createQueryBuilder('jp')
      .select("TO_CHAR(jp.posting_date_ad, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('jp.posting_date_ad >= :sixMonthsAgo', { sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) })
      .groupBy("TO_CHAR(jp.posting_date_ad, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .getRawMany();

    return {
      total_postings: totalPostings,
      active_postings: activePostings,
      total_positions: totalPositions,
      total_vacancies: totalVacancies,
      by_country: byCountry,
      by_month: byMonth
    };
  }

  async getSalaryAnalysis(country?: string): Promise<{
    average_salary: number;
    median_salary: number;
    min_salary: number;
    max_salary: number;
    currency_distribution: Array<{ currency: string; count: number; avg_amount: number }>;
  }> {
    let queryBuilder = this.positionRepository
      .createQueryBuilder('position')
      .leftJoin('position.job_contract', 'contract')
      .leftJoin('contract.job_posting', 'posting')
      .where('posting.is_active = :isActive', { isActive: true });

    if (country) {
      queryBuilder = queryBuilder.andWhere('posting.country = :country', { country });
    }

    const salaryStats = await queryBuilder
      .select([
        'AVG(position.monthly_salary_amount) as average_salary',
        'MIN(position.monthly_salary_amount) as min_salary',
        'MAX(position.monthly_salary_amount) as max_salary'
      ])
      .getRawOne();

    const currencyDistribution = await queryBuilder
      .select('position.salary_currency', 'currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(position.monthly_salary_amount)', 'avg_amount')
      .groupBy('position.salary_currency')
      .getRawMany();

    // Calculate median (requires a separate query)
    const medianResult = await queryBuilder
      .select('position.monthly_salary_amount')
      .orderBy('position.monthly_salary_amount', 'ASC')
      .getRawMany();

    const medianSalary = this.calculateMedian(medianResult.map(r => parseFloat(r.monthly_salary_amount)));

    return {
      average_salary: parseFloat(salaryStats.average_salary) || 0,
      median_salary: medianSalary,
      min_salary: parseFloat(salaryStats.min_salary) || 0,
      max_salary: parseFloat(salaryStats.max_salary) || 0,
      currency_distribution: currencyDistribution.map(item => ({
        currency: item.currency,
        count: parseInt(item.count),
        avg_amount: parseFloat(item.avg_amount)
      }))
    };
  }

  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }
}