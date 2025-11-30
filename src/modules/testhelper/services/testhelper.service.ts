import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../candidate/candidate.entity';
import { JobApplication } from '../../application/job-application.entity';
import { JobPosting, JobContract } from '../../domain/domain.entity';
import { PostingAgency } from '../../domain/PostingAgency';
import { User } from '../../user/user.entity';

@Injectable()
export class TesthelperService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(JobContract)
    private readonly jobContractRepository: Repository<JobContract>,
    @InjectRepository(PostingAgency)
    private readonly postingAgencyRepository: Repository<PostingAgency>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findTestSuiteWorkflowPrerequisites() {
  // Step 1: Find the most recently created candidate named Ramesh
  const candidate = await this.candidateRepository
    .createQueryBuilder('candidate')
    .where('candidate.full_name ILIKE :name', { name: '%ramesh%' })
    .orderBy('candidate.created_at', 'DESC')
    .getOne();

  if (!candidate) {
    throw new NotFoundException('No candidate found with name containing "Ramesh"');
  }

  // Step 2: Find all applications for this candidate
  const applications = await this.applicationRepository
    .createQueryBuilder('application')
    .where('application.candidate_id = :candidateId', { candidateId: candidate.id })
    .orderBy('application.created_at', 'DESC')
    .getMany();

  if (!applications || applications.length === 0) {
    throw new NotFoundException('No applications found for the candidate');
  }

  // Map to application IDs
  const applicationIds = applications.map(app => app.id);

  // Use the most recent job posting (or optionally handle all job postings)
  const jobPosting = await this.jobPostingRepository.findOne({
    where: { id: applications[0].job_posting_id },
  });

  if (!jobPosting) {
    throw new NotFoundException('Job posting not found for application');
  }

  const jobContract = await this.jobContractRepository
    .createQueryBuilder('contract')
    .where('contract.job_posting_id = :jobPostingId', { jobPostingId: jobPosting.id })
    .orderBy('contract.created_at', 'DESC')
    .getOne();

  if (!jobContract?.posting_agency_id) {
    throw new NotFoundException('No posting agency linked to job posting');
  }

  const postingAgency = await this.postingAgencyRepository.findOne({
    where: { id: jobContract.posting_agency_id },
  });

  if (!postingAgency) {
    throw new NotFoundException('Posting agency not found');
  }

  const agencyOwner = await this.userRepository.findOne({
    where: {
      agency_id: postingAgency.id,
      is_agency_owner: true,
    },
    order: { created_at: 'DESC' },
  });

  if (!agencyOwner) {
    throw new NotFoundException('Agency owner not found for posting agency');
  }

  return {
    candidatePhone: candidate.phone,
    candidateId: candidate.id,
    applicationIds, // <-- now a list of all application IDs
    postingAgencyId: postingAgency.id,
    agencyOwnerPhone: agencyOwner.phone,
  };
}

  async getAgenciesAnalytics() {
    // Get all agencies with their owners
    const agencies = await this.postingAgencyRepository
      .createQueryBuilder('agency')
      .orderBy('agency.created_at', 'DESC')
      .getMany();

    const result: any[] = [];
    
    for (const agency of agencies) {
      // Find owner
      const owner = await this.userRepository.findOne({
        where: {
          agency_id: agency.id,
          is_agency_owner: true,
        },
        order: { created_at: 'DESC' },
      });

      // Count job postings
      const jobCount = await this.jobContractRepository
        .createQueryBuilder('contract')
        .where('contract.posting_agency_id = :agencyId', { agencyId: agency.id })
        .getCount();

      // Count applications
      const applicationCount = await this.applicationRepository
        .createQueryBuilder('app')
        .innerJoin(JobContract, 'contract', 'contract.job_posting_id = app.job_posting_id')
        .where('contract.posting_agency_id = :agencyId', { agencyId: agency.id })
        .getCount();

      result.push({
        id: agency.id,
        name: agency.name,
        license_number: agency.license_number,
        owner_phone: owner?.phone || null,
        owner_id: owner?.id || null,
        analytics: {
          job_count: jobCount,
          application_count: applicationCount,
        },
      });
    }

    return result;
  }

  async getCandidates(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [candidates, total] = await this.candidateRepository.findAndCount({
      select: ['id', 'phone', 'full_name'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: candidates,
      total,
      page,
      limit,
    };
  }
}
