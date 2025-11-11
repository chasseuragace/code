import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { InterviewDetail, JobContract, JobPosition, JobPosting } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { CreateAgencyDto, UpdateAgencyDto } from './dto/agency.dto';
import { ListAgencyJobPostingsQueryDto } from './dto/agency-job-postings.dto';
import { AgencySearchDto, AgencyCardDto, PaginatedAgencyResponseDto } from './dto/agency-search.dto';

export interface AgencyAnalytics {
  active_postings: number;
  total_postings: number;
  interviews_count: number;
  salary: Record<string, { min: number; max: number; avg: number }>;
}

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(PostingAgency) private agencyRepository: Repository<PostingAgency>,
    @InjectRepository(JobPosting) private jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(JobContract) private contractRepository: Repository<JobContract>,
    @InjectRepository(JobPosition) private positionRepository: Repository<JobPosition>,
    @InjectRepository(InterviewDetail) private interviewRepository: Repository<InterviewDetail>,
  ) {}

  async createAgency(dto: CreateAgencyDto): Promise<PostingAgency> {
    const existing = await this.agencyRepository.findOne({ where: { license_number: dto.license_number } });
    if (existing) return existing;

    // Normalize phones/emails arrays from possible single fields
    const phones = Array.from(new Set([
      ...(dto.phones || []),
      ...(dto.phone ? [dto.phone] : []),
      ...(dto.mobile ? [dto.mobile] : []),
    ].filter(Boolean))) as string[] | undefined;

    const emails = Array.from(new Set([
      ...(dto.emails || []),
      ...(dto.email ? [dto.email] : []),
      ...(dto.contact_email ? [dto.contact_email] : []),
    ].filter(Boolean))) as string[] | undefined;

    const entity = this.agencyRepository.create({
      ...dto,
      phones,
      emails,
      license_valid_till: dto.license_valid_till ? new Date(dto.license_valid_till) : undefined,
      // Pass-through of richer fields (supported by entity)
      banner_url: dto.banner_url,
      established_year: dto.established_year,
      services: dto.services,
      certifications: dto.certifications,
      social_media: dto.social_media,
      bank_details: dto.bank_details,
      contact_persons: dto.contact_persons,
      operating_hours: dto.operating_hours,
      target_countries: dto.target_countries,
      specializations: dto.specializations,
      statistics: dto.statistics,
      settings: dto.settings,
    } as Partial<PostingAgency>) as PostingAgency;
    return this.agencyRepository.save<PostingAgency>(entity as PostingAgency);
  }

  async updateAgency(id: string, dto: UpdateAgencyDto): Promise<PostingAgency> {
    const current = await this.findAgencyById(id);
    const res = await this.agencyRepository.update(id, {
      ...dto,
      license_valid_till: dto.license_valid_till ? new Date(dto.license_valid_till) : current.license_valid_till,
      updated_at: new Date(),
    } as any);
    if (res.affected === 0) throw new NotFoundException(`Agency with ID ${id} not found`);
    return this.findAgencyById(id);
  }

  async deactivateAgency(id: string): Promise<void> {
    const res = await this.agencyRepository.update(id, { is_active: false, updated_at: new Date() });
    if (res.affected === 0) throw new NotFoundException(`Agency with ID ${id} not found`);
  }

  async activateAgency(id: string): Promise<void> {
    const res = await this.agencyRepository.update(id, { is_active: true, updated_at: new Date() });
    if (res.affected === 0) throw new NotFoundException(`Agency with ID ${id} not found`);
  }

  async findAgencyById(id: string): Promise<PostingAgency> {
    const ag = await this.agencyRepository.findOne({ where: { id } });
    if (!ag) throw new NotFoundException(`Agency with ID ${id} not found`);
    return ag;
  }

  async findAgencyByLicense(license: string): Promise<PostingAgency> {
    const ag = await this.agencyRepository.findOne({ where: { license_number: license } });
    if (!ag) throw new NotFoundException(`Agency with license ${license} not found`);
    return ag;
  }

  async listAgencies(filters: { name?: string; country?: string; city?: string; license_number?: string; page?: number; limit?: number; include_inactive?: boolean; }) {
    const { name, country, city, license_number, page = 1, limit = 10, include_inactive = false } = filters || {} as any;
    const qb = this.agencyRepository.createQueryBuilder('a');
    if (!include_inactive) qb.where('a.is_active = :active', { active: true });
    if (name) qb.andWhere('a.name ILIKE :name', { name: `%${name}%` });
    if (country) qb.andWhere('a.country ILIKE :country', { country: `%${country}%` });
    if (city) qb.andWhere('a.city ILIKE :city', { city: `%${city}%` });
    if (license_number) qb.andWhere('a.license_number ILIKE :license_number', { license_number: `%${license_number}%` });
    qb.orderBy('a.updated_at', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit };
  }

  async getAgencyPostings(id: string, opts?: { active_only?: boolean; page?: number; limit?: number }) {
    const { active_only = true, page = 1, limit = 10 } = opts || {};
    const qb = this.jobPostingRepository
      .createQueryBuilder('jp')
      .leftJoin('jp.contracts', 'c')
      .where('c.posting_agency_id = :id', { id });
    if (active_only) qb.andWhere('jp.is_active = TRUE');
    qb.orderBy('jp.posting_date_ad', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit };
  }

  async getAgencyAnalytics(id: string): Promise<AgencyAnalytics> {
    const baseQb = this.jobPostingRepository
      .createQueryBuilder('jp')
      .leftJoin('jp.contracts', 'c')
      .where('c.posting_agency_id = :id', { id });
    const total_postings = await baseQb.getCount();
    const active_postings = await baseQb.andWhere('jp.is_active = TRUE').getCount();

    const interviews_count = await this.interviewRepository.createQueryBuilder('iv')
      .leftJoin('iv.job_posting', 'jp')
      .leftJoin('jp.contracts', 'c')
      .where('c.posting_agency_id = :id', { id })
      .getCount();

    const rows = await this.positionRepository.createQueryBuilder('pos')
      .select('pos.salary_currency', 'currency')
      .addSelect('MIN(pos.monthly_salary_amount)', 'min')
      .addSelect('MAX(pos.monthly_salary_amount)', 'max')
      .addSelect('AVG(pos.monthly_salary_amount)', 'avg')
      .leftJoin('pos.job_contract', 'c')
      .leftJoin('c.job_posting', 'jp')
      .where('c.posting_agency_id = :id', { id })
      .andWhere('jp.is_active = TRUE')
      .groupBy('pos.salary_currency')
      .getRawMany();
    const salary: Record<string, { min: number; max: number; avg: number }> = {};
    for (const r of rows) {
      salary[r.currency] = { min: Number(r.min), max: Number(r.max), avg: Number(r.avg) };
    }

    return { active_postings, total_postings, interviews_count, salary };
  }

  // Enriched list of job postings for an agency by license with filters and analytics counts
  async listAgencyJobPostingsEnriched(license: string, query: ListAgencyJobPostingsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const sortBy = query.sort_by ?? 'posted_at';
    const order: 'ASC' | 'DESC' = (query.order ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Base count query (for total)
    const countQb = this.jobPostingRepository.createQueryBuilder('jp')
      .innerJoin('job_contracts', 'jc', 'jc.job_posting_id = jp.id')
      .innerJoin('posting_agencies', 'ag', 'ag.id = jc.posting_agency_id')
      .leftJoin('employers', 'em', 'em.id = jc.employer_id')
      .leftJoin('job_positions', 'pos', 'pos.job_contract_id = jc.id')
      .where('ag.license_number = :license', { license });

    if (query.country) countQb.andWhere('jp.country ILIKE :country', { country: `%${query.country}%` });
    if (query.title) countQb.andWhere('jp.posting_title ILIKE :title', { title: `%${query.title}%` });
    if (query.refid) countQb.andWhere('(jp.lt_number ILIKE :refid OR jp.chalani_number ILIKE :refid)', { refid: `%${query.refid}%` });
    if (query.employer_name) countQb.andWhere('em.company_name ILIKE :employer', { employer: `%${query.employer_name}%` });
    if (query.agency_name) countQb.andWhere('ag.name ILIKE :agency', { agency: `%${query.agency_name}%` });
    if (query.position_title) countQb.andWhere('pos.title ILIKE :posTitle', { posTitle: `%${query.position_title}%` });
    if (query.q) {
      countQb.andWhere(
        `(
          jp.posting_title ILIKE :q OR
          jp.lt_number ILIKE :q OR
          jp.chalani_number ILIKE :q OR
          em.company_name ILIKE :q OR
          ag.name ILIKE :q OR
          pos.title ILIKE :q
        )`,
        { q: `%${query.q}%` },
      );
    }

    const totalRaw = await countQb.select('COUNT(DISTINCT jp.id)', 'cnt').getRawOne<{ cnt: string }>();
    const total = Number(totalRaw?.cnt || 0);

    // Data query with analytics counts
    const qb = this.jobPostingRepository.createQueryBuilder('jp')
      .select([
        'jp.id AS id',
        'jp.posting_title AS posting_title',
        'jp.city AS city',
        'jp.country AS country',
        'jp.posting_date_ad AS posted_at',
        'em.company_name AS employer_name',
        'ag.name AS agency_name',
      ])
      .innerJoin('job_contracts', 'jc', 'jc.job_posting_id = jp.id')
      .innerJoin('posting_agencies', 'ag', 'ag.id = jc.posting_agency_id')
      .leftJoin('employers', 'em', 'em.id = jc.employer_id')
      .leftJoin('job_positions', 'pos', 'pos.job_contract_id = jc.id')
      .where('ag.license_number = :license', { license });

    if (query.country) qb.andWhere('jp.country ILIKE :country', { country: `%${query.country}%` });
    if (query.title) qb.andWhere('jp.posting_title ILIKE :title', { title: `%${query.title}%` });
    if (query.refid) qb.andWhere('(jp.lt_number ILIKE :refid OR jp.chalani_number ILIKE :refid)', { refid: `%${query.refid}%` });
    if (query.employer_name) qb.andWhere('em.company_name ILIKE :employer', { employer: `%${query.employer_name}%` });
    if (query.agency_name) qb.andWhere('ag.name ILIKE :agency', { agency: `%${query.agency_name}%` });
    if (query.position_title) qb.andWhere('pos.title ILIKE :posTitle', { posTitle: `%${query.position_title}%` });
    if (query.q) {
      qb.andWhere(
        `(
          jp.posting_title ILIKE :q OR
          jp.lt_number ILIKE :q OR
          jp.chalani_number ILIKE :q OR
          em.company_name ILIKE :q OR
          ag.name ILIKE :q OR
          pos.title ILIKE :q
        )`,
        { q: `%${query.q}%` },
      );
    }

    // Add counts via subqueries to avoid row multiplication
    qb.addSelect(
      (sub) =>
        sub
          .select('COUNT(*)')
          .from('job_applications', 'app')
          .where('app.job_posting_id = jp.id'),
      'applicants_count',
    );
    qb.addSelect(
      (sub) =>
        sub
          .select("COUNT(*)")
          .from('job_applications', 'app2')
          .where("app2.job_posting_id = jp.id AND app2.status = 'shortlisted'"),
      'shortlisted_count',
    );
    qb.addSelect(
      (sub) =>
        sub
          .select('COUNT(*)')
          .from('interview_details', 'iv')
          .where('iv.job_posting_id = jp.id'),
      'interviews_count',
    );
    qb.addSelect(
      (sub) =>
        sub
          .select('COUNT(*)')
          .from('interview_details', 'ivt')
          .where("ivt.job_posting_id = jp.id AND ivt.interview_date_ad = CURRENT_DATE"),
      'interviews_today_count',
    );

    // Sorting
    if (sortBy === 'posted_at') {
      qb.orderBy('jp.posting_date_ad', order);
    } else if (sortBy === 'applicants') {
      qb.orderBy('applicants_count', order as any);
    } else if (sortBy === 'shortlisted') {
      qb.orderBy('shortlisted_count', order as any);
    } else if (sortBy === 'interviews_today') {
      qb.orderBy('interviews_today_count', order as any);
    } else {
      qb.orderBy('jp.posting_date_ad', 'DESC');
    }

    const rows = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .groupBy('jp.id')
      .addGroupBy('em.company_name')
      .addGroupBy('ag.name')
      .getRawMany<any>();

    const data = rows.map((r: any) => ({
      id: r.id,
      posting_title: r.posting_title,
      city: r.city ?? null,
      country: r.country,
      employer_name: r.employer_name ?? null,
      agency_name: r.agency_name ?? null,
      applicants_count: Number(r.applicants_count || 0),
      shortlisted_count: Number(r.shortlisted_count || 0),
      interviews_count: Number(r.interviews_count || 0),
      interviews_today_count: Number(r.interviews_today_count || 0),
      posted_at: r.posted_at ? new Date(r.posted_at).toISOString() : null,
    }));

    return { data, total, page, limit };
  }

  async searchAgencies(dto: AgencySearchDto): Promise<PaginatedAgencyResponseDto> {
    const { 
      keyword, 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC' 
    } = dto;

    const skip = (page - 1) * limit;

    // Create query builder with proper relations
    const queryBuilder = this.agencyRepository
      .createQueryBuilder('agency')
      .leftJoin('agency.contracts', 'contract')
      .loadRelationCountAndMap('agency.job_posting_count', 'agency.contracts', 'contract', qb => 
        qb.andWhere('contract.job_posting_id IS NOT NULL')
      )
      .where('agency.is_active = :isActive', { isActive: true });

    // Add keyword search if provided
    if (keyword) {
      const searchTerm = `%${keyword.toLowerCase()}%`;
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(agency.name) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(agency.license_number) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(agency.description) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(agency.city) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(agency.country) LIKE :searchTerm', { searchTerm })
            .orWhere('EXISTS (SELECT 1 FROM unnest(COALESCE(agency.specializations, \'{}\')) AS spec WHERE LOWER(spec) LIKE :searchTerm)')
            .orWhere('EXISTS (SELECT 1 FROM unnest(COALESCE(agency.target_countries, \'{}\')) AS country WHERE LOWER(country) LIKE :searchTerm)');
        })
      ).setParameter('searchTerm', searchTerm);
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    const sortField = this.mapSortField(sortBy);
    const sortDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    
    const agencies = await queryBuilder
      .orderBy(sortField, sortDirection)
      .skip(skip)
      .take(limit)
      .getMany();

    // Map to DTO
    const data = agencies.map(agency => {
      const dto = new AgencyCardDto();
      dto.id = agency.id;
      dto.name = agency.name;
      dto.license_number = agency.license_number;
      dto.logo_url = agency.logo_url;
      dto.description = agency.description;
      dto.city = agency.city;
      dto.country = agency.country;
      dto.website = agency.website;
      dto.is_active = agency.is_active;
      dto.specializations = agency.specializations;
      dto.created_at = agency.created_at;
      dto.job_posting_count = (agency as any).job_posting_count || 0;
      return dto;
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private mapSortField(field: string): string {
    const fieldMap: Record<string, string> = {
      'name': 'agency.name',
      'country': 'agency.country',
      'city': 'agency.city',
      'created_at': 'agency.created_at',
      'job_posting_count': 'job_posting_count'
    };
    return fieldMap[field] || 'agency.name';
  }

  // Image management methods
  async findByLicense(licenseNumber: string): Promise<PostingAgency | null> {
    return await this.agencyRepository.findOne({ where: { license_number: licenseNumber } });
  }

  async updateLogoUrl(agencyId: string, logoUrl: string | null): Promise<void> {
    const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }
    agency.logo_url = logoUrl;
    await this.agencyRepository.save(agency);
  }

  async updateBannerUrl(agencyId: string, bannerUrl: string | null): Promise<void> {
    const agency = await this.agencyRepository.findOne({ where: { id: agencyId } });
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }
    agency.banner_url = bannerUrl;
    await this.agencyRepository.save(agency);
  }
}
