import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewDetail, JobContract, JobPosition, JobPosting } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';

export interface CreateAgencyDto {
  name: string;
  license_number: string;
  country?: string;
  city?: string;
  address?: string;
  phones?: string[];
  emails?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  license_valid_till?: string; // ISO date string
}
export type UpdateAgencyDto = Partial<Omit<CreateAgencyDto, 'license_number'>> & { is_active?: boolean };

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
    const entity = this.agencyRepository.create({
      ...dto,
      license_valid_till: dto.license_valid_till ? new Date(dto.license_valid_till) : undefined,
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
}
