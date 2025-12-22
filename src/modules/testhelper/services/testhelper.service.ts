import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../candidate/candidate.entity';
import { PostingAgency } from '../../domain/PostingAgency';
import { JobApplication } from '../../application/job-application.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class TesthelperService {
  constructor(
    @InjectRepository(Candidate) private candidateRepo: Repository<Candidate>,
    @InjectRepository(PostingAgency) private agencyRepo: Repository<PostingAgency>,
    @InjectRepository(JobApplication) private jobAppRepo: Repository<JobApplication>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findTestSuiteWorkflowPrerequisites() {
    const candidate = await this.candidateRepo.findOne({ order: { created_at: 'DESC' } });
    if (!candidate) throw new Error('No candidate found');

    const applications = await this.jobAppRepo.find({
      where: { candidate_id: candidate.id },
      take: 5,
    });

    const agency = await this.agencyRepo.findOne({ order: { created_at: 'DESC' } });
    const owner = await this.userRepo.findOne({
      where: { agency_id: agency?.id, is_agency_owner: true },
    });

    return {
      candidatePhone: candidate.phone,
      candidateId: candidate.id,
      applicationIds: applications.map(a => a.id),
      postingAgencyId: agency?.id || '',
      agencyOwnerPhone: owner?.phone || '',
    };
  }

  async getAgenciesAnalytics() {
    const agencies = await this.agencyRepo.find();
    return Promise.all(
      agencies.map(async (agency) => {
        const owner = await this.userRepo.findOne({
          where: { agency_id: agency.id, is_agency_owner: true },
        });
        return {
          id: agency.id,
          name: agency.name,
          license_number: agency.license_number,
          ownerPhone: owner?.phone || null,
        };
      }),
    );
  }

  async getCandidates(page: number, limit: number) {
    const [data, total] = await this.candidateRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: data.map(c => ({
        id: c.id,
        phone: c.phone,
        full_name: c.full_name,
      })),
      total,
      page,
      limit,
    };
  }
}
