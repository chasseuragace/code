import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CandidateJobProfile } from './candidate-job-profile.entity';
import { JobTitle } from 'src/modules/job-title/job-title.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { CandidatePreference } from './candidate-preference.entity';

function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Assume Nepal default (+977) if 10 digits starting with 9 and no country code
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+977${digits}`;
  }
  if (phone.startsWith('+')) return phone;
  // Fallback: prefix + if seems already with country code
  return `+${digits}`;
}

function validateCoordinates(addr?: { coordinates?: { lat: number; lng: number } }) {
  const c = addr?.coordinates;
  if (!c) return;
  const { lat, lng } = c;
  const latOk = typeof lat === 'number' && lat >= -90 && lat <= 90;
  const lngOk = typeof lng === 'number' && lng >= -180 && lng <= 180;
  if (!latOk || !lngOk) {
    throw new BadRequestException('Invalid coordinates: lat must be [-90,90], lng must be [-180,180]');
  }
}

function validateArrayOfObjects(arr?: any[]) {
  if (arr == null) return;
  if (!Array.isArray(arr)) throw new BadRequestException('Expected array');
  for (const item of arr) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      throw new BadRequestException('Array entries must be objects');
    }
  }
}

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly repo: Repository<Candidate>,
    @InjectRepository(CandidateJobProfile)
    private readonly jobProfiles: Repository<CandidateJobProfile>,
    @InjectRepository(CandidatePreference)
    private readonly preferences: Repository<CandidatePreference>,
    @InjectRepository(JobTitle)
    private readonly jobTitles: Repository<JobTitle>,
    @InjectRepository(JobPosting)
    private readonly jobPostings: Repository<JobPosting>,
  ) {}

  async createCandidate(input: Partial<Candidate>): Promise<Candidate> {
    const cand = new Candidate();
    cand.full_name = input.full_name!;
    cand.phone = normalizePhoneE164(input.phone!);
    cand.is_active = input.is_active ?? true;
    // validations
    validateCoordinates(input.address as any);
    validateArrayOfObjects(input.skills as any);
    validateArrayOfObjects(input.education as any);
    // assign
    cand.skills = input.skills as any;
    cand.education = input.education as any;
    cand.address = input.address as any;
    cand.passport_number = input.passport_number;
    return this.repo.save(cand);
  }

  async findById(id: string): Promise<Candidate | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateCandidate(id: string, input: Partial<Candidate>): Promise<Candidate> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Candidate not found');

    if (input.phone) existing.phone = normalizePhoneE164(input.phone);
    if (input.full_name != null) existing.full_name = input.full_name;
    if (input.is_active != null) existing.is_active = input.is_active as boolean;

    if (input.address !== undefined) {
      validateCoordinates(input.address as any);
      existing.address = input.address as any;
    }

    if (input.skills !== undefined) {
      validateArrayOfObjects(input.skills as any);
      existing.skills = input.skills as any;
    }

    if (input.education !== undefined) {
      validateArrayOfObjects(input.education as any);
      existing.education = input.education as any;
    }

    if (input.passport_number !== undefined) {
      existing.passport_number = input.passport_number;
    }

    return this.repo.save(existing);
  }

  // Job Profiles
  async addJobProfile(
    candidateId: string,
    data: { profile_blob: any; label?: string },
  ): Promise<CandidateJobProfile> {
    // ensure candidate exists
    const c = await this.repo.findOne({ where: { id: candidateId } });
    if (!c) throw new NotFoundException('Candidate not found');
    if (data == null || typeof data !== 'object') throw new BadRequestException('Invalid job profile payload');
    if (data.profile_blob === null || typeof data.profile_blob !== 'object' || Array.isArray(data.profile_blob)) {
      throw new BadRequestException('profile_blob must be an object');
    }
    // Optional validation: preferred_titles must exist and be active
    const titles = data.profile_blob?.preferred_titles;
    if (titles != null) {
      if (!Array.isArray(titles)) {
        throw new BadRequestException('preferred_titles must be an array of strings');
      }
      const names = titles.filter((t) => typeof t === 'string');
      if (names.length !== titles.length) {
        throw new BadRequestException('preferred_titles must contain only strings');
      }
      if (names.length > 0) {
        const found = await this.jobTitles.find({ where: { title: In(names), is_active: true } });
        const foundSet = new Set(found.map((r) => r.title));
        const missing = names.filter((n) => !foundSet.has(n));
        if (missing.length) {
          throw new BadRequestException(`Invalid or inactive job titles: ${missing.join(', ')}`);
        }
      }
    }

    const row = this.jobProfiles.create({
      candidate_id: candidateId,
      profile_blob: data.profile_blob,
      label: data.label,
    });
    return this.jobProfiles.save(row);
  }

  async updateJobProfile(
    id: string,
    data: { profile_blob?: any; label?: string },
  ): Promise<CandidateJobProfile> {
    const existing = await this.jobProfiles.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Job profile not found');
    if (data.profile_blob !== undefined) {
      if (data.profile_blob === null || typeof data.profile_blob !== 'object' || Array.isArray(data.profile_blob)) {
        throw new BadRequestException('profile_blob must be an object');
      }
      existing.profile_blob = data.profile_blob;
    }
    if (data.label !== undefined) existing.label = data.label;
    return this.jobProfiles.save(existing);
  }

  async listJobProfiles(candidateId: string): Promise<CandidateJobProfile[]> {
    return this.jobProfiles.find({
      where: { candidate_id: candidateId },
      order: { updated_at: 'DESC' },
    });
  }

  // Preferences
  private async reindexPreferences(candidateId: string): Promise<void> {
    const rows = await this.preferences.find({
      where: { candidate_id: candidateId },
      order: { priority: 'ASC', updated_at: 'DESC' },
    });
    for (let i = 0; i < rows.length; i++) {
      const desired = i + 1; // 1-based
      if (rows[i].priority !== desired) {
        rows[i].priority = desired;
      }
    }
    if (rows.length) {
      await this.preferences.save(rows);
    }
  }

  async listPreferences(candidateId: string): Promise<{ title: string; priority: number }[]> {
    const rows = await this.preferences.find({
      where: { candidate_id: candidateId },
      order: { priority: 'ASC', updated_at: 'DESC' },
    });
    return rows.map((r) => ({ title: r.title, priority: r.priority }));
  }

  async addPreference(candidateId: string, title: string): Promise<void> {
    // Ensure candidate exists
    const c = await this.repo.findOne({ where: { id: candidateId } });
    if (!c) throw new NotFoundException('Candidate not found');
    if (!title || typeof title !== 'string') throw new BadRequestException('Title is required');
    // Validate title exists and active
    const jt = await this.jobTitles.findOne({ where: { title, is_active: true } });
    if (!jt) throw new BadRequestException(`Invalid or inactive job title: ${title}`);

    await this.preferences.manager.transaction(async (trx) => {
      const prefRepo = trx.getRepository(CandidatePreference);
      const existingAll = await prefRepo.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
      const existing = existingAll.find((p) => p.title === title);
      if (existing) {
        // Move to top by setting priority to 0 then reindex
        existing.priority = 0;
        await prefRepo.save(existing);
      } else {
        // Append to end: set priority to current max + 1 (or 1 if none)
        const max = existingAll.length ? Math.max(...existingAll.map((p) => p.priority || 0)) : 0;
        const row = prefRepo.create({ candidate_id: candidateId, title, priority: max + 1 });
        await prefRepo.save(row);
      }
      // Re-fetch and normalize to 1..N
      const rows = await prefRepo.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC', updated_at: 'DESC' } });
      rows.forEach((r, idx) => (r.priority = idx + 1));
      await prefRepo.save(rows);
    });
  }

  async removePreference(candidateId: string, title: string): Promise<void> {
    await this.preferences.manager.transaction(async (trx) => {
      const prefRepo = trx.getRepository(CandidatePreference);
      const row = await prefRepo.findOne({ where: { candidate_id: candidateId, title } });
      if (!row) return; // idempotent
      await prefRepo.remove(row);
      const rows = await prefRepo.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC', updated_at: 'DESC' } });
      rows.forEach((r, idx) => (r.priority = idx + 1));
      if (rows.length) await prefRepo.save(rows);
    });
  }

  async getRelevantJobs(
    candidateId: string,
    opts?: {
      country?: string | string[];
      salary?: { min?: number; max?: number; currency?: string; source?: 'base' | 'converted' };
      combineWith?: 'AND' | 'OR';
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: JobPosting[]; total: number; page: number; limit: number }> {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;

    const cand = await this.repo.findOne({ where: { id: candidateId } });
    if (!cand) throw new NotFoundException('Candidate not found');
    // Prefer explicit CandidatePreferences; fallback to most recent job profile preferred_titles
    const prefRows = await this.preferences.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
    let preferred = prefRows.map((p) => p.title);
    if (!preferred.length) {
      const profile = await this.jobProfiles.findOne({
        where: { candidate_id: candidateId },
        order: { updated_at: 'DESC' },
      });
      preferred = ((profile?.profile_blob as any)?.preferred_titles as string[] | undefined) ?? [];
    } 
   if (!preferred || preferred.length === 0) {
      throw new BadRequestException('Candidate has no preferred job titles');
    }

    const qb = this.jobPostings
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      .where('jp.is_active = :active', { active: true })
      .orderBy('jp.posting_date_ad', 'DESC');

    const combineWith: 'AND' | 'OR' = (opts?.combineWith as any) === 'OR' ? 'OR' : 'AND';

    // Title predicate (from preferences)
    const titleGroup = new Brackets((qb1) => {
      qb1.where('positions.title IN (:...titles)', { titles: preferred });
    });

    // Collect dynamic params (e.g., multi-country)
    const dynamicParams: Record<string, any> = {};

    // Other filters (country, salary)
    const otherGroup = new Brackets((qb2) => {
      let hasAny = false;
      // Country filter: supports string or string[]
      if (opts?.country) {
        const c = opts.country;
        if (Array.isArray(c) && c.length > 0) {
          c.forEach((val, idx) => {
            dynamicParams[`country_${idx}`] = `%${val}%`;
          });
          qb2.where(new Brackets((cx) => {
            c.forEach((_, idx) => {
              if (idx === 0) cx.where(`jp.country ILIKE :country_${idx}`);
              else cx.orWhere(`jp.country ILIKE :country_${idx}`);
            });
          }));
        } else if (typeof c === 'string') {
          qb2.where('jp.country ILIKE :country', { country: `%${c}%` });
        }
        hasAny = true;
      }

      // Salary filter: base or converted
      const sal = opts?.salary;
      if (sal && (sal.min != null || sal.max != null)) {
        const isConverted = (sal.source ?? 'base') === 'converted';
        if (isConverted) {
          // EXISTS subquery against salary_conversions
          const parts: string[] = [];
          if (sal.currency) {
            parts.push('sc.converted_currency = :convCurrency');
            dynamicParams['convCurrency'] = sal.currency;
          }
          if (sal.min != null) {
            parts.push('sc.converted_amount >= :convMin');
            dynamicParams['convMin'] = sal.min;
          }
          if (sal.max != null) {
            parts.push('sc.converted_amount <= :convMax');
            dynamicParams['convMax'] = sal.max;
          }
          const cond = parts.length ? ' AND ' + parts.join(' AND ') : '';
          qb2[hasAny ? 'andWhere' : 'where'](
            `EXISTS (SELECT 1 FROM salary_conversions sc WHERE sc.job_position_id = positions.id${cond})`,
          );
          hasAny = true;
        } else {
          // Base salary filtering on position
          if (sal.currency) {
            qb2[hasAny ? 'andWhere' : 'where']('positions.salary_currency = :salCurrency', { salCurrency: sal.currency });
            hasAny = true;
          }
          if (sal.min != null) {
            qb2[hasAny ? 'andWhere' : 'where']('positions.monthly_salary_amount >= :salMin', { salMin: sal.min });
            hasAny = true;
          }
          if (sal.max != null) {
            qb2[hasAny ? 'andWhere' : 'where']('positions.monthly_salary_amount <= :salMax', { salMax: sal.max });
            hasAny = true;
          }
        }
      }
      // If no other filters supplied, ensure group doesn't eliminate results
      if (!hasAny) {
        // Add a tautology to avoid empty group semantics when used with OR
        qb2.where('1=1');
      }
    });

    // Combine predicates
    if (opts?.country || (opts?.salary && (opts.salary.min != null || opts.salary.max != null))) {
      if (combineWith === 'OR') {
        qb.andWhere(new Brackets((root) => {
          root.where(titleGroup).orWhere(otherGroup);
        }));
      } else {
        qb.andWhere(titleGroup).andWhere(otherGroup);
      }
    } else {
      qb.andWhere(titleGroup);
    }

    // Apply any accumulated dynamic params (e.g., multi-country)
    if (Object.keys(dynamicParams).length) {
      qb.setParameters(dynamicParams);
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit };
  }
}
