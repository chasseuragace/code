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

    // Step 2: Find the most recent application for this candidate
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.candidate_id = :candidateId', { candidateId: candidate.id })
      .orderBy('application.created_at', 'DESC')
      .getOne();

    if (!application) {
      throw new NotFoundException('No application found for the candidate');
    }

    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id: application.job_posting_id },
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
      applicationId: application.id,
      postingAgencyId: postingAgency.id,
      agencyOwnerPhone: agencyOwner.phone,
    };
  }
}
