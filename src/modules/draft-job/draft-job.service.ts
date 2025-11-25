import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DraftJob, DraftStatus } from './draft-job.entity';
import { CreateDraftJobDto } from './dto/create-draft-job.dto';
import { UpdateDraftJobDto } from './dto/update-draft-job.dto';
import { JobPostingService } from '../domain/domain.service';

@Injectable()
export class DraftJobService {
  constructor(
    @InjectRepository(DraftJob)
    private readonly draftJobRepo: Repository<DraftJob>,
    private readonly jobPostingService: JobPostingService,
  ) {}

  async create(
    agencyId: string,
    userId: string,
    createDto: CreateDraftJobDto,
  ): Promise<DraftJob> {
    const draft = this.draftJobRepo.create({
      posting_agency_id: agencyId,
      created_by: userId,
      status: DraftStatus.DRAFT,
      ...createDto,
    });

    return await this.draftJobRepo.save(draft);
  }

  async findAll(agencyId: string, userId: string, includePublished = false): Promise<DraftJob[]> {
    const where: any = {
      posting_agency_id: agencyId,
      created_by: userId,
    };

    // Exclude published drafts unless explicitly requested
    if (!includePublished) {
      where.status = DraftStatus.DRAFT;
    }

    return await this.draftJobRepo.find({
      where,
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: string, agencyId: string, userId: string): Promise<DraftJob> {
    const draft = await this.draftJobRepo.findOne({
      where: {
        id,
        posting_agency_id: agencyId,
        created_by: userId,
      },
    });

    if (!draft) {
      throw new NotFoundException(`Draft job with ID ${id} not found`);
    }

    return draft;
  }

  async update(
    id: string,
    agencyId: string,
    userId: string,
    updateDto: UpdateDraftJobDto,
  ): Promise<DraftJob> {
    const draft = await this.findOne(id, agencyId, userId);

    // Prevent updating published drafts
    if (draft.status === DraftStatus.PUBLISHED) {
      throw new BadRequestException('Cannot update a published draft');
    }

    Object.assign(draft, updateDto);
    return await this.draftJobRepo.save(draft);
  }

  async remove(id: string, agencyId: string, userId: string): Promise<void> {
    const draft = await this.findOne(id, agencyId, userId);

    // Prevent deleting published drafts
    if (draft.status === DraftStatus.PUBLISHED) {
      throw new BadRequestException('Cannot delete a published draft');
    }

    await this.draftJobRepo.remove(draft);
  }

  /**
   * Validate if draft has all required fields for publishing
   */
  validateDraftForPublishing(draft: DraftJob): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if marked as complete or ready to publish
    if (draft.is_complete || draft.ready_to_publish) {
      // If marked complete, do minimal validation
      if (!draft.posting_title) errors.push('posting_title is required');
      if (!draft.country) errors.push('country is required');
      return {
        valid: errors.length === 0,
        errors,
      };
    }

    // Full validation for non-marked drafts
    // Required basic fields
    if (!draft.posting_title) errors.push('posting_title is required');
    if (!draft.country) errors.push('country is required');
    if (!draft.approval_date_ad) errors.push('approval_date_ad is required');
    if (!draft.posting_date_ad) errors.push('posting_date_ad is required');
    if (!draft.announcement_type) errors.push('announcement_type is required');

    // Employer validation
    if (!draft.employer) {
      errors.push('employer is required');
    } else {
      if (!draft.employer.company_name) errors.push('employer.company_name is required');
      if (!draft.employer.country) errors.push('employer.country is required');
    }

    // Contract validation
    if (!draft.contract) {
      errors.push('contract is required');
    } else {
      if (!draft.contract.period_years) errors.push('contract.period_years is required');
      if (draft.contract.renewable === undefined) errors.push('contract.renewable is required');
    }

    // Positions validation
    if (!draft.positions || draft.positions.length === 0) {
      errors.push('At least one position is required');
    } else {
      draft.positions.forEach((pos, idx) => {
        if (!pos.title) errors.push(`positions[${idx}].title is required`);
        if (!pos.vacancies || (pos.vacancies.male === undefined && pos.vacancies.female === undefined)) {
          errors.push(`positions[${idx}].vacancies is required`);
        }
        if (!pos.salary || !pos.salary.monthly_amount || !pos.salary.currency) {
          errors.push(`positions[${idx}].salary is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert draft to actual job posting
   */
  async publishDraft(
    id: string,
    agencyId: string,
    userId: string,
    licenseNumber: string,
  ): Promise<any> {
    const draft = await this.findOne(id, agencyId, userId);

    // Validate draft
    const validation = this.validateDraftForPublishing(draft);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Draft is incomplete',
        errors: validation.errors,
      });
    }

    // Check if already published
    if (draft.status === DraftStatus.PUBLISHED) {
      throw new BadRequestException('Draft has already been published');
    }

    // Get agency by license number to include in payload
    const agency = await this.jobPostingService['agencyRepository'].findOne({
      where: { license_number: licenseNumber },
    });

    if (!agency) {
      throw new BadRequestException(`Agency with license ${licenseNumber} not found`);
    }

    // Transform draft to job posting payload
    const jobPostingPayload = {
      posting_title: draft.posting_title,
      country: draft.country,
      city: draft.city,
      lt_number: draft.lt_number,
      chalani_number: draft.chalani_number,
      approval_date_bs: draft.approval_date_bs,
      approval_date_ad: draft.approval_date_ad,
      posting_date_ad: draft.posting_date_ad,
      posting_date_bs: draft.posting_date_bs,
      announcement_type: draft.announcement_type,
      notes: draft.notes,
      posting_agency: {
        name: agency.name,
        license_number: agency.license_number,
        address: agency.address,
        phones: agency.phones,
        emails: agency.emails,
        website: agency.website,
      },
      employer: draft.employer,
      contract: draft.contract,
      positions: draft.positions,
      skills: draft.skills,
      education_requirements: draft.education_requirements,
      experience_requirements: draft.experience_requirements,
      canonical_title_names: draft.canonical_title_names,
    };

    // Create the actual job posting
    const jobPosting = await this.jobPostingService.createJobPosting(
      jobPostingPayload as any,
    );

    // Update draft status and link to published job
    draft.status = DraftStatus.PUBLISHED;
    draft.published_job_id = jobPosting.id;
    await this.draftJobRepo.save(draft);

    return {
      draft_id: draft.id,
      job_posting_id: jobPosting.id,
      job_posting: jobPosting,
    };
  }
}
