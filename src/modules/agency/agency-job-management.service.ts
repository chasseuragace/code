import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import {
  JobPosting,
  JobContract,
  JobPosition,
  Employer,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
} from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { Country } from '../country/country.entity';
import { JobTitle } from '../job-title/job-title.entity';
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
  EditableEmployerDto,
  EditableContractDto,
  EditablePositionDto,
  EditableTagsDto,
  EditableExpensesDto,
  EditableExperienceRequirementsDto,
  JobPostingUpdatedDto,
  PositionResponseDto,
  TEMPLATE_DEFAULTS,
} from './dto/job-management.dto';

@Injectable()
export class AgencyJobManagementService {
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
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(JobTitle)
    private jobTitleRepository: Repository<JobTitle>,
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
    private dataSource: DataSource,
  ) {}

  /**
   * Verify that a job posting belongs to the specified agency.
   * @throws ForbiddenException if ownership check fails
   */
  async verifyOwnership(jobPostingId: string, agencyLicense: string): Promise<boolean> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts', 'contracts.agency'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const belongs = posting.contracts?.some(
      (c) => c.agency?.license_number === agencyLicense,
    );

    if (!belongs) {
      throw new ForbiddenException('Cannot access job posting of another agency');
    }

    return true;
  }

  /**
   * Validate that a country exists in the system.
   * @throws BadRequestException if country is invalid
   */
  private async validateCountry(country: string): Promise<Country> {
    const found = await this.countryRepository.findOne({
      where: [
        { country_code: country.toUpperCase() },
        { country_name: ILike(country) },
      ],
    });

    if (!found) {
      throw new BadRequestException(
        `Unknown country '${country}'. Use a valid country code or name.`,
      );
    }

    return found;
  }

  /**
   * Create a template job posting with minimal input and sensible defaults.
   * Creates: JobPosting, Employer, JobContract, and one JobPosition.
   */
  async createTemplateJobPosting(
    agencyLicense: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateCreatedDto> {
    // Validate agency exists
    const agency = await this.agencyRepository.findOne({
      where: { license_number: agencyLicense },
    });
    if (!agency) {
      throw new NotFoundException(`Agency with license ${agencyLicense} not found`);
    }

    // Validate country
    await this.validateCountry(dto.country);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Create employer with placeholder values
      const employer = qr.manager.create(Employer, {
        company_name: TEMPLATE_DEFAULTS.employer.company_name,
        country: dto.country,
        city: dto.city || undefined,
      });
      const savedEmployer = await qr.manager.save(employer);

      // 2. Create job posting
      const jobPosting = qr.manager.create(JobPosting, {
        posting_title: dto.posting_title,
        country: dto.country,
        city: dto.city,
        posting_date_ad: new Date(),
        announcement_type: 'full_ad',
        is_active: true,
      });
      const savedJobPosting = await qr.manager.save(jobPosting);

      // 3. Create contract with default terms
      const contract = qr.manager.create(JobContract, {
        job_posting_id: savedJobPosting.id,
        employer_id: savedEmployer.id,
        posting_agency_id: agency.id,
        period_years: TEMPLATE_DEFAULTS.contract.period_years,
        renewable: TEMPLATE_DEFAULTS.contract.renewable,
        hours_per_day: TEMPLATE_DEFAULTS.contract.hours_per_day,
        days_per_week: TEMPLATE_DEFAULTS.contract.days_per_week,
        overtime_policy: TEMPLATE_DEFAULTS.contract.overtime_policy,
        weekly_off_days: TEMPLATE_DEFAULTS.contract.weekly_off_days,
        food: TEMPLATE_DEFAULTS.contract.food,
        accommodation: TEMPLATE_DEFAULTS.contract.accommodation,
        transport: TEMPLATE_DEFAULTS.contract.transport,
        annual_leave_days: TEMPLATE_DEFAULTS.contract.annual_leave_days,
      });
      const savedContract = await qr.manager.save(contract);

      // 4. Create one default position with zero vacancies
      const position = qr.manager.create(JobPosition, {
        job_contract_id: savedContract.id,
        title: TEMPLATE_DEFAULTS.position.title,
        male_vacancies: TEMPLATE_DEFAULTS.position.male_vacancies,
        female_vacancies: TEMPLATE_DEFAULTS.position.female_vacancies,
        monthly_salary_amount: TEMPLATE_DEFAULTS.position.monthly_salary_amount,
        salary_currency: TEMPLATE_DEFAULTS.position.salary_currency,
      });
      await qr.manager.save(position);

      await qr.commitTransaction();

      return {
        id: savedJobPosting.id,
        posting_title: savedJobPosting.posting_title,
        country: savedJobPosting.country,
        city: savedJobPosting.city || null,
        created_at: savedJobPosting.created_at.toISOString(),
      };
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }


  /**
   * Get full job posting details in an editable format.
   * Includes all fields (even if null) to support frontend form binding.
   */
  async getEditableJobDetails(jobPostingId: string): Promise<EditableJobDetailsDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: [
        'canonical_titles',
        'contracts',
        'contracts.employer',
        'contracts.agency',
        'contracts.positions',
      ],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contract = posting.contracts?.[0];
    const employer = contract?.employer;
    const positions = contract?.positions || [];

    // Fetch expenses (use find and take first, as there may be none)
    const [medicalArr, insuranceArr, travelArr, visaPermitArr, trainingArr, welfareServiceArr] =
      await Promise.all([
        this.medicalExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
        this.insuranceExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
        this.travelExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
        this.visaPermitExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
        this.trainingExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
        this.welfareServiceExpenseRepository.find({
          where: { job_posting_id: jobPostingId },
          take: 1,
        }),
      ]);

    const medical = medicalArr[0] || null;
    const insurance = insuranceArr[0] || null;
    const travel = travelArr[0] || null;
    const visaPermit = visaPermitArr[0] || null;
    const training = trainingArr[0] || null;
    const welfareService = welfareServiceArr[0] || null;

    // Build employer DTO
    const employerDto: EditableEmployerDto | null = employer
      ? {
          id: employer.id,
          company_name: employer.company_name,
          country: employer.country,
          city: employer.city || null,
        }
      : null;

    // Build contract DTO
    const contractDto: EditableContractDto | null = contract
      ? {
          id: contract.id,
          period_years: contract.period_years ?? null,
          renewable: contract.renewable ?? false,
          hours_per_day: contract.hours_per_day ?? null,
          days_per_week: contract.days_per_week ?? null,
          overtime_policy: contract.overtime_policy ?? null,
          weekly_off_days: contract.weekly_off_days ?? null,
          food: contract.food ?? null,
          accommodation: contract.accommodation ?? null,
          transport: contract.transport ?? null,
          annual_leave_days: contract.annual_leave_days ?? null,
        }
      : null;

    // Build positions array
    const positionsDto: EditablePositionDto[] = positions.map((p) => ({
      id: p.id,
      title: p.title,
      male_vacancies: p.male_vacancies,
      female_vacancies: p.female_vacancies,
      total_vacancies: p.total_vacancies,
      monthly_salary_amount: Number(p.monthly_salary_amount),
      salary_currency: p.salary_currency,
      hours_per_day_override: p.hours_per_day_override ?? null,
      days_per_week_override: p.days_per_week_override ?? null,
      overtime_policy_override: p.overtime_policy_override ?? null,
      weekly_off_days_override: p.weekly_off_days_override ?? null,
      food_override: p.food_override ?? null,
      accommodation_override: p.accommodation_override ?? null,
      transport_override: p.transport_override ?? null,
      position_notes: p.position_notes ?? null,
    }));

    // Build experience requirements
    const expReq = (posting as any).experience_requirements as
      | { min_years?: number; max_years?: number; level?: string }
      | undefined;
    const experienceRequirementsDto: EditableExperienceRequirementsDto | null =
      expReq
        ? {
            min_years: expReq.min_years ?? null,
            max_years: expReq.max_years ?? null,
            level: expReq.level ?? null,
          }
        : null;

    // Build tags DTO
    const tagsDto: EditableTagsDto = {
      skills: (posting as any).skills || [],
      education_requirements: (posting as any).education_requirements || [],
      experience_requirements: experienceRequirementsDto,
      canonical_titles: (posting.canonical_titles || []).map((t: any) => ({
        id: t.id,
        title: t.title,
      })),
    };

    // Build expenses DTO
    const expensesDto: EditableExpensesDto = {
      medical: medical || null,
      insurance: insurance || null,
      travel: travel || null,
      visa_permit: visaPermit || null,
      training: training || null,
      welfare_service: welfareService || null,
    };

    return {
      id: posting.id,
      posting_title: posting.posting_title,
      country: posting.country,
      city: posting.city || null,
      lt_number: posting.lt_number || null,
      chalani_number: posting.chalani_number || null,
      approval_date_bs: posting.approval_date_bs || null,
      approval_date_ad: posting.approval_date_ad
        ? (posting.approval_date_ad instanceof Date 
            ? posting.approval_date_ad.toISOString().split('T')[0]
            : String(posting.approval_date_ad).split('T')[0])
        : null,
      posting_date_ad: posting.posting_date_ad
        ? (posting.posting_date_ad instanceof Date
            ? posting.posting_date_ad.toISOString().split('T')[0]
            : String(posting.posting_date_ad).split('T')[0])
        : null,
      posting_date_bs: posting.posting_date_bs || null,
      announcement_type: posting.announcement_type || null,
      notes: posting.notes || null,
      is_active: posting.is_active,
      cutout_url: posting.cutout_url || null,
      employer: employerDto,
      contract: contractDto,
      positions: positionsDto,
      tags: tagsDto,
      expenses: expensesDto,
      created_at: posting.created_at.toISOString(),
      updated_at: posting.updated_at.toISOString(),
    };
  }

  /**
   * Update basic job posting information.
   * Uses PATCH semantics - only provided fields are updated.
   */
  async updateBasicInfo(
    jobPostingId: string,
    dto: UpdateBasicInfoDto,
  ): Promise<JobPostingUpdatedDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    // Validate country if provided
    if (dto.country) {
      await this.validateCountry(dto.country);
    }

    // Build update object with only provided fields
    const updates: Partial<JobPosting> = {};
    if (dto.posting_title !== undefined) updates.posting_title = dto.posting_title;
    if (dto.country !== undefined) updates.country = dto.country;
    if (dto.city !== undefined) updates.city = dto.city;
    if (dto.lt_number !== undefined) updates.lt_number = dto.lt_number;
    if (dto.chalani_number !== undefined) updates.chalani_number = dto.chalani_number;
    if (dto.approval_date_ad !== undefined) {
      updates.approval_date_ad = new Date(dto.approval_date_ad);
    }
    if (dto.posting_date_ad !== undefined) {
      updates.posting_date_ad = new Date(dto.posting_date_ad);
    }
    if (dto.announcement_type !== undefined) {
      updates.announcement_type = dto.announcement_type;
    }
    if (dto.notes !== undefined) updates.notes = dto.notes;

    if (Object.keys(updates).length > 0) {
      await this.jobPostingRepository.update(jobPostingId, {
        ...updates,
        updated_at: new Date(),
      });
    }

    const updated = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    return {
      id: updated!.id,
      updated_at: updated!.updated_at.toISOString(),
    };
  }

  /**
   * Update employer information for a job posting.
   */
  async updateEmployerInfo(
    jobPostingId: string,
    dto: UpdateEmployerDto,
  ): Promise<JobPostingUpdatedDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts', 'contracts.employer'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contract = posting.contracts?.[0];
    if (!contract) {
      throw new BadRequestException(
        'Job posting has no contract. Create template first.',
      );
    }

    const employer = contract.employer;
    if (!employer) {
      throw new BadRequestException(
        'Job posting has no employer. Create template first.',
      );
    }

    // Build update object with only provided fields
    const updates: Partial<Employer> = {};
    if (dto.company_name !== undefined) updates.company_name = dto.company_name;
    if (dto.country !== undefined) updates.country = dto.country;
    if (dto.city !== undefined) updates.city = dto.city;

    if (Object.keys(updates).length > 0) {
      await this.employerRepository.update(employer.id, {
        ...updates,
        updated_at: new Date(),
      });
    }

    // Update job posting timestamp
    await this.jobPostingRepository.update(jobPostingId, {
      updated_at: new Date(),
    });

    const updated = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    return {
      id: updated!.id,
      updated_at: updated!.updated_at.toISOString(),
    };
  }

  /**
   * Update contract terms for a job posting.
   */
  async updateContractTerms(
    jobPostingId: string,
    dto: UpdateContractDto,
  ): Promise<JobPostingUpdatedDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contract = posting.contracts?.[0];
    if (!contract) {
      throw new BadRequestException(
        'Job posting has no contract. Create template first.',
      );
    }

    // Build update object with only provided fields
    const updates: Partial<JobContract> = {};
    if (dto.period_years !== undefined) updates.period_years = dto.period_years;
    if (dto.renewable !== undefined) updates.renewable = dto.renewable;
    if (dto.hours_per_day !== undefined) updates.hours_per_day = dto.hours_per_day;
    if (dto.days_per_week !== undefined) updates.days_per_week = dto.days_per_week;
    if (dto.overtime_policy !== undefined) updates.overtime_policy = dto.overtime_policy;
    if (dto.weekly_off_days !== undefined) updates.weekly_off_days = dto.weekly_off_days;
    if (dto.food !== undefined) updates.food = dto.food;
    if (dto.accommodation !== undefined) updates.accommodation = dto.accommodation;
    if (dto.transport !== undefined) updates.transport = dto.transport;
    if (dto.annual_leave_days !== undefined) updates.annual_leave_days = dto.annual_leave_days;

    if (Object.keys(updates).length > 0) {
      await this.contractRepository.update(contract.id, {
        ...updates,
        updated_at: new Date(),
      });
    }

    // Update job posting timestamp
    await this.jobPostingRepository.update(jobPostingId, {
      updated_at: new Date(),
    });

    const updated = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    return {
      id: updated!.id,
      updated_at: updated!.updated_at.toISOString(),
    };
  }


  /**
   * Add a new position to a job posting.
   */
  async addPosition(
    jobPostingId: string,
    dto: CreatePositionDto,
  ): Promise<PositionResponseDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contract = posting.contracts?.[0];
    if (!contract) {
      throw new BadRequestException(
        'Job posting has no contract. Create template first.',
      );
    }

    const position = this.positionRepository.create({
      job_contract_id: contract.id,
      title: dto.title,
      male_vacancies: dto.vacancies.male,
      female_vacancies: dto.vacancies.female,
      monthly_salary_amount: dto.salary.monthly_amount,
      salary_currency: dto.salary.currency,
      hours_per_day_override: dto.hours_per_day_override,
      days_per_week_override: dto.days_per_week_override,
      overtime_policy_override: dto.overtime_policy_override,
      weekly_off_days_override: dto.weekly_off_days_override,
      food_override: dto.food_override,
      accommodation_override: dto.accommodation_override,
      transport_override: dto.transport_override,
      position_notes: dto.position_notes,
    });

    const saved = await this.positionRepository.save(position);

    // Update job posting timestamp
    await this.jobPostingRepository.update(jobPostingId, {
      updated_at: new Date(),
    });

    return {
      id: saved.id,
      title: saved.title,
      male_vacancies: saved.male_vacancies,
      female_vacancies: saved.female_vacancies,
      total_vacancies: saved.total_vacancies,
      monthly_salary_amount: Number(saved.monthly_salary_amount),
      salary_currency: saved.salary_currency,
    };
  }

  /**
   * Update an existing position.
   */
  async updatePosition(
    positionId: string,
    dto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    const position = await this.positionRepository.findOne({
      where: { id: positionId },
      relations: ['job_contract'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    // Build update object with only provided fields
    const updates: Partial<JobPosition> = {};
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.vacancies !== undefined) {
      updates.male_vacancies = dto.vacancies.male;
      updates.female_vacancies = dto.vacancies.female;
    }
    if (dto.salary !== undefined) {
      updates.monthly_salary_amount = dto.salary.monthly_amount;
      updates.salary_currency = dto.salary.currency;
    }
    if (dto.hours_per_day_override !== undefined) {
      updates.hours_per_day_override = dto.hours_per_day_override;
    }
    if (dto.days_per_week_override !== undefined) {
      updates.days_per_week_override = dto.days_per_week_override;
    }
    if (dto.overtime_policy_override !== undefined) {
      updates.overtime_policy_override = dto.overtime_policy_override;
    }
    if (dto.weekly_off_days_override !== undefined) {
      updates.weekly_off_days_override = dto.weekly_off_days_override;
    }
    if (dto.food_override !== undefined) {
      updates.food_override = dto.food_override;
    }
    if (dto.accommodation_override !== undefined) {
      updates.accommodation_override = dto.accommodation_override;
    }
    if (dto.transport_override !== undefined) {
      updates.transport_override = dto.transport_override;
    }
    if (dto.position_notes !== undefined) {
      updates.position_notes = dto.position_notes;
    }

    if (Object.keys(updates).length > 0) {
      await this.positionRepository.update(positionId, {
        ...updates,
        updated_at: new Date(),
      });
    }

    const updated = await this.positionRepository.findOne({
      where: { id: positionId },
    });

    return {
      id: updated!.id,
      title: updated!.title,
      male_vacancies: updated!.male_vacancies,
      female_vacancies: updated!.female_vacancies,
      total_vacancies: updated!.total_vacancies,
      monthly_salary_amount: Number(updated!.monthly_salary_amount),
      salary_currency: updated!.salary_currency,
    };
  }

  /**
   * Remove a position from a job posting.
   */
  async removePosition(positionId: string): Promise<void> {
    const position = await this.positionRepository.findOne({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    await this.positionRepository.delete(positionId);
  }

  /**
   * Update job posting tags (skills, education, experience, canonical titles).
   */
  async updateTags(
    jobPostingId: string,
    dto: UpdateTagsDto,
  ): Promise<JobPostingUpdatedDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['canonical_titles'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    // Build update object
    const updates: Partial<JobPosting> = {};

    if (dto.skills !== undefined) {
      (updates as any).skills = dto.skills;
    }
    if (dto.education_requirements !== undefined) {
      (updates as any).education_requirements = dto.education_requirements;
    }
    if (dto.experience_requirements !== undefined) {
      (updates as any).experience_requirements = dto.experience_requirements;
    }

    // Handle canonical titles
    if (dto.canonical_title_ids?.length || dto.canonical_title_names?.length) {
      const titles = await this.validateCanonicalTitles(
        dto.canonical_title_ids,
        dto.canonical_title_names,
      );
      posting.canonical_titles = titles;
    }

    // Apply updates
    Object.assign(posting, updates);
    posting.updated_at = new Date();
    await this.jobPostingRepository.save(posting);

    return {
      id: posting.id,
      updated_at: posting.updated_at.toISOString(),
    };
  }

  /**
   * Update job posting expenses.
   * Uses PATCH semantics - only provided expense categories are updated.
   * Creates expense records if they don't exist, updates if they do.
   */
  async updateExpenses(
    jobPostingId: string,
    dto: UpdateExpensesDto,
  ): Promise<JobPostingUpdatedDto> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    // Helper to upsert expense record
    const upsertExpense = async <T extends { job_posting_id: string }>(
      repository: Repository<T>,
      data: Partial<T> | undefined,
    ) => {
      if (!data || Object.keys(data).length === 0) return;

      const existing = await repository.findOne({
        where: { job_posting_id: jobPostingId } as any,
      });

      if (existing) {
        await repository.update((existing as any).id, {
          ...data,
          updated_at: new Date(),
        } as any);
      } else {
        const newRecord = repository.create({
          job_posting_id: jobPostingId,
          ...data,
        } as any);
        await repository.save(newRecord);
      }
    };

    // Update each expense category if provided
    if (dto.medical) {
      await upsertExpense(this.medicalExpenseRepository, dto.medical);
    }
    if (dto.insurance) {
      await upsertExpense(this.insuranceExpenseRepository, dto.insurance);
    }
    if (dto.travel) {
      await upsertExpense(this.travelExpenseRepository, dto.travel);
    }
    if (dto.visa_permit) {
      await upsertExpense(this.visaPermitExpenseRepository, dto.visa_permit);
    }
    if (dto.training) {
      await upsertExpense(this.trainingExpenseRepository, dto.training);
    }
    if (dto.welfare_service) {
      await upsertExpense(this.welfareServiceExpenseRepository, dto.welfare_service);
    }

    // Update job posting timestamp
    await this.jobPostingRepository.update(jobPostingId, {
      updated_at: new Date(),
    });

    const updated = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
    });

    return {
      id: updated!.id,
      updated_at: updated!.updated_at.toISOString(),
    };
  }

  /**
   * Validate canonical titles by IDs and/or names.
   * @throws BadRequestException if any title is invalid or inactive
   */
  private async validateCanonicalTitles(
    titleIds?: string[],
    titleNames?: string[],
  ): Promise<JobTitle[]> {
    const results: JobTitle[] = [];

    if (titleIds && titleIds.length) {
      const byId = await this.jobTitleRepository.find({
        where: titleIds.map((id) => ({ id, is_active: true })),
      });
      if (byId.length !== titleIds.length) {
        const found = new Set(byId.map((t) => t.id));
        const missing = titleIds.filter((id) => !found.has(id));
        throw new BadRequestException(
          `Invalid or inactive job title IDs: ${missing.join(', ')}`,
        );
      }
      results.push(...byId);
    }

    if (titleNames && titleNames.length) {
      const byName = await this.jobTitleRepository.find({
        where: titleNames.map((title) => ({ title, is_active: true })),
      });
      if (byName.length !== titleNames.length) {
        const found = new Set(byName.map((t) => t.title));
        const missing = titleNames.filter((n) => !found.has(n));
        throw new BadRequestException(
          `Invalid or inactive job titles: ${missing.join(', ')}`,
        );
      }
      results.push(...byName);
    }

    return results;
  }

  /**
   * Get the contract ID for a job posting (helper for position operations).
   */
  async getContractIdForJobPosting(jobPostingId: string): Promise<string> {
    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contract = posting.contracts?.[0];
    if (!contract) {
      throw new BadRequestException(
        'Job posting has no contract. Create template first.',
      );
    }

    return contract.id;
  }

  /**
   * Verify that a position belongs to a job posting.
   */
  async verifyPositionOwnership(
    positionId: string,
    jobPostingId: string,
  ): Promise<boolean> {
    const position = await this.positionRepository.findOne({
      where: { id: positionId },
      relations: ['job_contract'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const posting = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['contracts'],
    });

    if (!posting) {
      throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
    }

    const contractIds = posting.contracts?.map((c) => c.id) || [];
    if (!contractIds.includes(position.job_contract_id)) {
      throw new ForbiddenException(
        'Position does not belong to this job posting',
      );
    }

    return true;
  }
}
