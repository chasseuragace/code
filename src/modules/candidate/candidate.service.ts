import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CandidateJobProfile } from './candidate-job-profile.entity';
import { JobTitle } from 'src/modules/job-title/job-title.entity';
import { JobPosting } from 'src/modules/domain/domain.entity';
import { CandidatePreference } from './candidate-preference.entity';

function normalizePhoneE164(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new BadRequestException('Phone number is required');
  }

  const digits = phone.replace(/\D/g, '');

  // Reject if no digits at all
  if (digits.length === 0) {
    throw new BadRequestException('Invalid phone number format');
  }

  // Assume Nepal default (+977) if 10 digits starting with 9 and no country code
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+977${digits}`;
  }

  if (phone.startsWith('+')) {
    // Validate that it has at least a country code and some digits
    if (digits.length < 7) { // minimum: +country code (1-3 digits) + local number (4+ digits)
      throw new BadRequestException('Invalid phone number format');
    }
    return phone;
  }

  // Fallback: prefix + if seems already with country code
  if (digits.length < 7) {
    throw new BadRequestException('Invalid phone number format');
  }

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

  async createCandidate(input: Partial<any>): Promise<Candidate> {
    const cand = new Candidate();
    cand.full_name = input.full_name!;
    cand.phone = normalizePhoneE164(input.phone!);
    cand.is_active = input.is_active ?? true;
    // validations
    validateCoordinates(input.address as any);
    // assign
    cand.address = input.address as any;
    cand.passport_number = input.passport_number;
    return this.repo.save(cand);
  }

  async findById(id: string): Promise<Candidate | null> {
    if (!id) return null; // Handle null/undefined/empty string
    return this.repo.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<Candidate | null> {
    return this.repo.findOne({ where: { phone: normalizePhoneE164(phone) } });
  }

  async updateCandidate(id: string, input: Partial<Candidate>): Promise<Candidate> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Candidate not found');

    if (input.full_name != null) existing.full_name = input.full_name;
    if (input.is_active != null) existing.is_active = input.is_active as boolean;

    if (input.address !== undefined) {
      validateCoordinates(input.address as any);
      existing.address = input.address as any;
    }

    if (input.passport_number !== undefined) {
      existing.passport_number = input.passport_number;
    }

    return this.repo.save(existing);
  }

  // Job Profiles - simplified with auto-creation support
  // Removed addJobProfile: use updateJobProfile which auto-creates if not exists

  async updateJobProfile(
    candidateId: string,  // Added candidateId parameter
    data: { profile_blob?: any; label?: string },
  ): Promise<CandidateJobProfile> {
    // Auto-create if no profile exists
    const existing = await this.jobProfiles.findOne({ 
      where: { candidate_id: candidateId },
      order: { updated_at: 'DESC' } // Get most recent
    });
    
    if (!existing) {
      // Validate candidate exists
      const c = await this.repo.findOne({ where: { id: candidateId } });
      if (!c) throw new NotFoundException('Candidate not found');
      // For creation, profile_blob is required
      if (data.profile_blob === undefined) {
        throw new BadRequestException('profile_blob is required when creating a new job profile');
      }
      // Validate profile_blob
      if (data.profile_blob === null || typeof data.profile_blob !== 'object' || Array.isArray(data.profile_blob)) {
        throw new BadRequestException('profile_blob must be a non-array object');
      }
      // Forbid preferred_titles in profile_blob
      if (data.profile_blob?.preferred_titles !== undefined) {
        throw new BadRequestException(
          'preferred_titles are managed separately; use /candidates/:id/preferences endpoint'
        );
      }
      // Create new profile
      const created = this.jobProfiles.create({
        candidate_id: candidateId,
        profile_blob: data.profile_blob,
        label: data.label,
      });
      return this.jobProfiles.save(created);
    }

    // Validate updates
    if (data.profile_blob !== undefined) {
      if (data.profile_blob === null || typeof data.profile_blob !== 'object' || Array.isArray(data.profile_blob)) {
        throw new BadRequestException('profile_blob must be a non-array object');
      }
      if (data.profile_blob.preferred_titles !== undefined) {
        throw new BadRequestException(
          'preferred_titles are managed separately; use /candidates/:id/preferences endpoint'
        );
      }
      // Merge with existing profile_blob to preserve nodes not included in update
      existing.profile_blob = { ...existing.profile_blob, ...data.profile_blob };
    }
    
    if (data.label !== undefined) {
      existing.label = data.label;
    }
    
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

  // Ensure legacy preferences have job_title_id linked by title (active or inactive)
  private async ensurePreferenceJobTitleIds(candidateId: string): Promise<void> {
    const rows = await this.preferences.find({ where: { candidate_id: candidateId } });
    const toFix = rows.filter((r) => !r.job_title_id);
    if (!toFix.length) return;
    // Fetch all titles at once
    const needed = Array.from(new Set(toFix.map((r) => r.title)));
    const found = await this.jobTitles.find({ where: { title: In(needed) } });
    const byTitle = new Map(found.map((jt) => [jt.title, jt.id] as const));
    let changed = false;
    for (const r of toFix) {
      const jtId = byTitle.get(r.title);
      if (jtId) {
        r.job_title_id = jtId;
        changed = true;
      }
    }
    if (changed) {
      await this.preferences.save(toFix);
    }
  }

  async listPreferences(candidateId: string): Promise<{ title: string; priority: number }[]> {
    // Ensure legacy rows have job_title_id
    await this.ensurePreferenceJobTitleIds(candidateId);
    const rows = await this.preferences.find({
      where: { candidate_id: candidateId },
      order: { priority: 'ASC', updated_at: 'DESC' },
    });
    return rows.map((r) => ({ title: r.title, priority: r.priority }));
  }

  // Full rows (including id) - useful for frontend reordering by row IDs
  async listPreferenceRows(candidateId: string): Promise<CandidatePreference[]> {
    await this.ensurePreferenceJobTitleIds(candidateId);
    return this.preferences.find({
      where: { candidate_id: candidateId },
      order: { priority: 'ASC', updated_at: 'DESC' },
    });
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
        // Backfill job_title_id if not present
        if (!existing.job_title_id) {
          existing.job_title_id = jt.id;
        }
        await prefRepo.save(existing);
      } else {
        // Append to end: set priority to current max + 1 (or 1 if none)
        const max = existingAll.length ? Math.max(...existingAll.map((p) => p.priority || 0)) : 0;
        const row = prefRepo.create({ candidate_id: candidateId, title, priority: max + 1, job_title_id: jt.id });
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

  // Reorder preferences given a complete ordered list of titles
  // Enforces: provided titles must be a permutation of existing titles for the candidate
  async reorderPreferences(candidateId: string, orderedTitles: string[]): Promise<void> {
    if (!Array.isArray(orderedTitles) || orderedTitles.length === 0) {
      throw new BadRequestException('orderedTitles must be a non-empty array of strings');
    }
    const unique = new Set<string>();
    for (const t of orderedTitles) {
      if (typeof t !== 'string' || !t.trim()) {
        throw new BadRequestException('orderedTitles must contain only non-empty strings');
      }
      const key = t.trim();
      if (unique.has(key)) throw new BadRequestException('orderedTitles must not contain duplicates');
      unique.add(key);
    }

    await this.preferences.manager.transaction(async (trx) => {
      const prefRepo = trx.getRepository(CandidatePreference);
      const existing = await prefRepo.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
      const existingSet = new Set(existing.map((p) => p.title));

      // Validate same set of titles
      if (existing.length !== orderedTitles.length) {
        throw new BadRequestException('orderedTitles must include all existing preferences');
      }
      for (const t of orderedTitles) {
        if (!existingSet.has(t)) {
          throw new BadRequestException(`Title not found in candidate preferences: ${t}`);
        }
      }

      // Apply new priorities 1..N according to given order
      const map = new Map<string, CandidatePreference>(existing.map((p) => [p.title, p] as const));
      const reordered: CandidatePreference[] = [];
      orderedTitles.forEach((title, idx) => {
        const row = map.get(title)!;
        row.priority = idx + 1;
        reordered.push(row);
      });
      await prefRepo.save(reordered);
    });
  }

  // Reorder by row IDs (preferred for stable drag-and-drop in frontend)
  async reorderPreferencesByIds(candidateId: string, orderedIds: string[]): Promise<void> {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new BadRequestException('orderedIds must be a non-empty array of UUID strings');
    }
    const unique = new Set<string>();
    for (const id of orderedIds) {
      if (typeof id !== 'string' || !id.trim()) {
        throw new BadRequestException('orderedIds must contain only non-empty UUID strings');
      }
      const key = id.trim();
      if (unique.has(key)) throw new BadRequestException('orderedIds must not contain duplicates');
      unique.add(key);
    }

    await this.preferences.manager.transaction(async (trx) => {
      const prefRepo = trx.getRepository(CandidatePreference);
      const existing = await prefRepo.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
      const existingIds = existing.map((p) => p.id);
      const existingSet = new Set(existingIds);

      if (existing.length !== orderedIds.length) {
        throw new BadRequestException('orderedIds must include all existing preferences');
      }
      for (const id of orderedIds) {
        if (!existingSet.has(id)) {
          throw new BadRequestException(`Preference id not found for candidate: ${id}`);
        }
      }

      const map = new Map<string, CandidatePreference>(existing.map((p) => [p.id, p] as const));
      const reordered: CandidatePreference[] = [];
      orderedIds.forEach((id, idx) => {
        const row = map.get(id)!;
        row.priority = idx + 1;
        reordered.push(row);
      });
      await prefRepo.save(reordered);
    });
  }

  async getRelevantJobs(
    candidateId: string,
    opts?: {
      country?: string | string[];
      salary?: { min?: number; max?: number; currency?: string; source?: 'base' | 'converted' };
      combineWith?: 'AND' | 'OR';
      useCanonicalTitles?: boolean; // default: false
      includeScore?: boolean; // default: false
      preferredOverride?: string[]; // deprecated: titles (kept for backward internal use)
      preferredOverrideIds?: string[]; // internal: use specific job_title_ids instead of computing
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: JobPosting[]; total: number; page: number; limit: number }> {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;
    // Fetch candidate and most recent job profile
    const cand = await this.repo.findOne({ where: { id: candidateId } });
    if (!cand) throw new NotFoundException('Candidate not found');
    
    // Get the most recent job profile
    const jobProfile = await this.jobProfiles.findOne({
      where: { candidate_id: candidateId },
      order: { updated_at: 'DESC' },
    });
    
    // Extract skills and education from job profile blob
    const profileBlob = jobProfile?.profile_blob as any || {};
    const candSkills = Array.isArray(profileBlob.skills)
      ? profileBlob.skills
          .map((s: any) => (typeof s === 'string' ? s : s?.title))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];
    
    const candEdu = Array.isArray(profileBlob.education)
      ? profileBlob.education
          .map((e: any) => (typeof e === 'string' ? e : (e?.degree ?? e?.title ?? e?.name)))
          .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      : [];

    // Prefer explicit CandidatePreferences; no string fallback; match by job_title_id only
    await this.ensurePreferenceJobTitleIds(candidateId);
    const prefRows = await this.preferences.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
    let preferredIds: string[] = prefRows.map((p) => p.job_title_id!).filter((v): v is string => typeof v === 'string' && v.length > 0);
    // Allow internal override by IDs first; titles override is deprecated and will be resolved to IDs
    if (opts?.preferredOverrideIds && opts.preferredOverrideIds.length) {
      preferredIds = opts.preferredOverrideIds;
    } else if (opts?.preferredOverride && opts.preferredOverride.length) {
      // Resolve titles to IDs
      const found = await this.jobTitles.find({ where: { title: In(opts.preferredOverride) } });
      const byTitle = new Map(found.map((jt) => [jt.title, jt.id] as const));
      preferredIds = opts.preferredOverride.map((t) => byTitle.get(t)).filter((id): id is string => typeof id === 'string');
    }
    // If no preferences set, show all jobs (better UX for new users)
    const hasPreferences = preferredIds && preferredIds.length > 0;

    const qb = this.jobPostings
      .createQueryBuilder('jp')
      .leftJoinAndSelect('jp.contracts', 'contracts')
      .leftJoinAndSelect('contracts.positions', 'positions')
      .leftJoinAndSelect('positions.salaryConversions', 'salaryConversions')
      .leftJoinAndSelect('contracts.employer', 'employer')
      .leftJoinAndSelect('contracts.agency', 'agency')
      // Explicitly select JSONB requirement fields used for scoring
      .addSelect(['jp.skills', 'jp.education_requirements', 'jp.experience_requirements'])
      .where('jp.is_active = :active', { active: true })
      .orderBy('jp.posting_date_ad', 'DESC');

    const combineWith: 'AND' | 'OR' = (opts?.combineWith as any) === 'OR' ? 'OR' : 'AND';

    // Title match group (ID-based): job_posting_titles -> job_titles by IDs
    // Only apply if candidate has preferences set
    const titleGroup = new Brackets((qb1) => {
      if (hasPreferences) {
        qb1.where(
          `EXISTS (
            SELECT 1 FROM job_posting_titles jpt
            WHERE jpt.job_posting_id = jp.id AND jpt.job_title_id IN (:...preferredIds)
          )`,
          { preferredIds },
        );
      } else {
        // No preferences - make this group always true so it doesn't filter anything
        qb1.where('1=1');
      }
    });

    // Tag-aware predicate: skills/education overlap and optional canonical title match
    // Compute simple fitness score per posting: average of present requirement matches in [%]
    // Components: skills overlap, education overlap, experience numeric compatibility
    // Experience years heuristic: sum of candidate skill durations (duration_months/12) or 'years' property
    const candYears = Array.isArray(profileBlob.skills)
      ? profileBlob.skills.reduce((acc: number, s: any) => {
          if (typeof s?.duration_months === 'number') return acc + s.duration_months / 12;
          if (typeof s?.years === 'number') return acc + s.years;
          return acc;
        }, 0)
      : 0;

    // Extract candidate skills as array of strings
    const candSkillsLower = candSkills.map((s: string) => s.toLowerCase());

    // Extract candidate education strings from objects (degree/title/name)
    const candEduLower = candEdu.map((e: string) => e.toLowerCase());

    const tagsGroup = new Brackets((qbT) => {
      let applied = false;
      if (candSkillsLower.length) {
        // EXISTS (SELECT 1 FROM jsonb_array_elements_text(jp.skills) AS s(value) WHERE LOWER(s.value) = ANY(:candSkillsLower))
        qbT.where(
          `EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(jp.skills) AS s(value)
            WHERE LOWER(s.value) = ANY(:candSkillsLower)
          )`,
          { candSkillsLower },
        );
        applied = true;
      }
      if (candEduLower.length) {
        // OR education overlap: jp.education_requirements contains any candidate education token
        qbT[applied ? 'orWhere' : 'where'](
          `EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(jp.education_requirements) AS ed(value)
            WHERE LOWER(ed.value) = ANY(:candEduLower)
          )`,
          { candEduLower },
        );
        applied = true;
      }
      if (opts?.useCanonicalTitles && preferredIds.length) {
        // OR canonical title match against preferred IDs
        qbT[applied ? 'orWhere' : 'where'](
          `EXISTS (
            SELECT 1
            FROM job_posting_titles jpt
            WHERE jpt.job_posting_id = jp.id AND jpt.job_title_id IN (:...preferredIds)
          )`,
          { preferredIds },
        );
        applied = true;
      }
      if (!applied) {
        // If no tag predicates available, behavior depends on whether user has preferences
        if (hasPreferences) {
          // User has preferences but no matching skills/education - be restrictive
          qbT.where('1=0'); // no tags -> group false so it doesn't accidentally include
        } else {
          // User has no preferences - show all jobs (better UX for new users)
          qbT.where('1=1'); // no tags but no preferences -> show everything
        }
      }
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

    // Combine predicates: base match is title OR tags (skills overlap)
    const baseMatch = new Brackets((root) => {
      root.where(titleGroup).orWhere(tagsGroup);
    });

    if (opts?.country || (opts?.salary && (opts.salary.min != null || opts.salary.max != null))) {
      if (combineWith === 'OR') {
        qb.andWhere(new Brackets((root) => {
          root.where(baseMatch).orWhere(otherGroup);
        }));
      } else {
        qb.andWhere(baseMatch).andWhere(otherGroup);
      }
    } else {
      qb.andWhere(baseMatch);
    }

    // Apply any accumulated dynamic params (e.g., multi-country)
    if (Object.keys(dynamicParams).length) {
      qb.setParameters(dynamicParams);
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    if (opts?.includeScore) {
      // Compute simple fitness score per posting: average of present requirement matches in [%]
      // Components: skills overlap, education overlap, experience numeric compatibility
      for (const p of data as any[]) {
        let parts = 0;
        let sumPct = 0;
        // skills
        const js: string[] = Array.isArray(p.skills) ? p.skills : [];
        if (js.length) {
          const jsLower = js.map((x) => String(x).toLowerCase());
          const inter = candSkillsLower.filter((s) => jsLower.includes(s));
          const pct = js.length ? inter.length / js.length : 0;
          parts++;
          sumPct += pct;
        }
        // education
        const je: string[] = Array.isArray(p.education_requirements) ? p.education_requirements : [];
        if (je.length) {
          const jeLower = je.map((x) => String(x).toLowerCase());
          const inter = candEduLower.filter((e) => jeLower.includes(e));
          const pct = je.length ? inter.length / je.length : 0;
          parts++;
          sumPct += pct;
        }
        // experience numeric
        const xr = p.experience_requirements as { min_years?: number; max_years?: number } | undefined;
        if (xr && (typeof xr.min_years === 'number' || typeof xr.max_years === 'number')) {
          const minOk = typeof xr.min_years === 'number' ? candYears >= xr.min_years : true;
          const maxOk = typeof xr.max_years === 'number' ? candYears <= xr.max_years : true;
          const pct = minOk && maxOk ? 1 : 0;
          parts++;
          sumPct += pct;
        }
        if (parts > 0) {
          p.fitness_score = Math.round((sumPct / parts) * 100);
        }
      }
    }

    return { data, total, page, limit };
  }

  // Group relevant jobs by each preferred title; jobs ordered by fitness_score desc
  async getRelevantJobsGrouped(
    candidateId: string,
    opts?: {
      country?: string | string[];
      salary?: { min?: number; max?: number; currency?: string; source?: 'base' | 'converted' };
      combineWith?: 'AND' | 'OR';
      useCanonicalTitles?: boolean;
      includeScore?: boolean;
      page?: number;
      limit?: number;
      preferredOverride?: string[];
    },
  ): Promise<{ groups: { title: string; jobs: JobPosting[] }[] }> {
    const prefs = await this.preferences.find({ where: { candidate_id: candidateId }, order: { priority: 'ASC' } });
    let preferred: string[] = [];
    if (prefs.length) {
      preferred = prefs.map((p) => p.title);
    } else {
      // fallback to most recent job profile
      const jp = await this.jobProfiles.findOne({ where: { candidate_id: candidateId }, order: { updated_at: 'DESC' } });
      const blob = jp?.profile_blob as any;
      if (blob && Array.isArray(blob.preferred_titles)) {
        preferred = blob.preferred_titles.filter((t: any) => typeof t === 'string');
      }
    }
    if (opts?.preferredOverride && opts.preferredOverride.length) {
      preferred = opts.preferredOverride;
    }

    const groups: { title: string; jobs: JobPosting[] }[] = [];
    for (const title of preferred) {
      const res = await this.getRelevantJobs(candidateId, {
        ...opts,
        includeScore: true, // ensure scoring for ordering
        preferredOverride: [title],
      });
      // order by fitness_score desc when present
      const ordered = (res.data as any[]).slice().sort((a, b) => ((b.fitness_score ?? 0) - (a.fitness_score ?? 0)));
      groups.push({ title, jobs: ordered as any });
    }
    return { groups };
  }
}
