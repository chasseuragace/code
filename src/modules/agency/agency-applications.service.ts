import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting, JobPosition, JobContract } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
import { FitnessScoreService } from '../shared/fitness-score.service';

export interface GetAgencyApplicationsOptions {
  stage?: string;
  country?: string;
  job_posting_id?: string;
  position_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AgencyApplicationItem {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  position_id: string;
  status: string;
  priority_score: number;
  created_at: Date;
  updated_at: Date;
  withdrawn_at: Date | null;
}

export interface CandidateInfo {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  skills: string[];
  age: number | null;
  gender: string | null;
}

export interface JobInfo {
  id: string;
  posting_title: string;
  company_name: string;
  country: string;
  city: string | null;
}

export interface PositionInfo {
  id: string;
  title: string;
  monthly_salary_amount: number;
  salary_currency: string;
  total_vacancies: number;
}

export interface PaginatedAgencyApplicationsResponse {
  applications: AgencyApplicationItem[];
  candidates: Record<string, CandidateInfo>;
  jobs: Record<string, JobInfo>;
  positions: Record<string, PositionInfo>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  performance: {
    loadTime: number;
    queryTime: number;
  };
}

@Injectable()
export class AgencyApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(PostingAgency)
    private readonly agencyRepo: Repository<PostingAgency>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(CandidateJobProfile)
    private readonly candidateJobProfileRepo: Repository<CandidateJobProfile>,
    @InjectRepository(JobPosition)
    private readonly positionRepo: Repository<JobPosition>,
    @InjectRepository(JobContract)
    private readonly contractRepo: Repository<JobContract>,
    private readonly fitnessScoreService: FitnessScoreService,
  ) {}

  /**
   * Get all applications for an agency across all their job postings
   * @param license Agency license number
   * @param options Filter and pagination options
   * @returns Paginated applications with enriched data
   */
  async getAgencyApplications(
    license: string,
    options: GetAgencyApplicationsOptions = {},
  ): Promise<PaginatedAgencyApplicationsResponse> {
    const startTime = Date.now();
    
    // Validate agency exists
    const agency = await this.agencyRepo.findOne({ 
      where: { license_number: license } 
    });
    
    if (!agency) {
      throw new NotFoundException(`Agency with license ${license} not found`);
    }

    // Set defaults
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const sortBy = options.sort_by ?? 'created_at';
    const sortOrder = (options.sort_order ?? 'desc').toLowerCase() as 'asc' | 'desc';

    // Build base query to get all job postings for this agency
    const jobPostingsQuery = this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .where('jc.posting_agency_id = :agencyId', { agencyId: agency.id })
      .select('jp.id', 'id');

    const jobPostings = await jobPostingsQuery.getRawMany<{ id: string }>();
    const jobPostingIds = jobPostings.map(jp => jp.id);

    if (jobPostingIds.length === 0) {
      // Agency has no job postings
      return {
        applications: [],
        candidates: {},
        jobs: {},
        positions: {},
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        performance: {
          loadTime: Date.now() - startTime,
          queryTime: 0,
        },
      };
    }

    const queryStartTime = Date.now();

    // Build applications query
    let applicationsQuery = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.job_posting', 'jp')
      .leftJoinAndSelect('jp.contracts', 'jc')
      .leftJoinAndSelect('jc.employer', 'emp')
      .leftJoinAndSelect('jc.positions', 'pos')
      .where('app.job_posting_id IN (:...jobPostingIds)', { jobPostingIds });

    // Apply filters
    if (options.stage) {
      applicationsQuery = applicationsQuery.andWhere('app.status = :stage', { 
        stage: options.stage 
      });
    }

    if (options.job_posting_id) {
      applicationsQuery = applicationsQuery.andWhere('app.job_posting_id = :jobPostingId', { 
        jobPostingId: options.job_posting_id 
      });
    }

    if (options.position_id) {
      applicationsQuery = applicationsQuery.andWhere('app.position_id = :positionId', { 
        positionId: options.position_id 
      });
    }

    if (options.country) {
      applicationsQuery = applicationsQuery.andWhere('jp.country = :country', { 
        country: options.country 
      });
    }

    // Search filter (will be applied after fetching candidates)
    const searchTerm = options.search?.toLowerCase().trim();

    // Get total count before pagination
    const totalQuery = applicationsQuery.clone();
    const total = await totalQuery.getCount();

    // Apply sorting
    const sortField = this.mapSortField(sortBy);
    applicationsQuery = applicationsQuery.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    applicationsQuery = applicationsQuery
      .skip((page - 1) * limit)
      .take(limit);

    // Execute query
    const applications = await applicationsQuery.getMany();
    const queryTime = Date.now() - queryStartTime;

    // Fetch candidates for these applications
    const candidateIds = applications.map(app => app.candidate_id);
    
    let candidates: Candidate[] = [];
    let jobProfiles: CandidateJobProfile[] = [];
    
    if (candidateIds.length > 0) {
      candidates = await this.candidateRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...candidateIds)', { candidateIds })
        .getMany();

      // Fetch job profiles for skill data
      jobProfiles = await this.candidateJobProfileRepo
        .createQueryBuilder('cjp')
        .where('cjp.candidate_id IN (:...candidateIds)', { candidateIds })
        .orderBy('cjp.updated_at', 'DESC')
        .getMany();
    }

    // Create lookup maps
    const candidateMap = new Map(candidates.map(c => [c.id, c]));
    const profileMap = new Map<string, any>();
    
    // Get most recent profile for each candidate
    for (const profile of jobProfiles) {
      if (!profileMap.has(profile.candidate_id)) {
        profileMap.set(profile.candidate_id, profile.profile_blob);
      }
    }

    // Build lookup maps to avoid duplication
    const candidatesMap: Record<string, CandidateInfo> = {};
    const jobsMap: Record<string, JobInfo> = {};
    const positionsMap: Record<string, PositionInfo> = {};

    // Process applications and build enriched data
    const enrichedApplications: AgencyApplicationItem[] = [];

    for (const app of applications) {
      const candidate = candidateMap.get(app.candidate_id);
      if (!candidate) continue; // Skip if candidate not found

      const profileBlob = profileMap.get(app.candidate_id) || {};
      const contract = app.job_posting?.contracts?.[0];
      const position = contract?.positions?.find(p => p.id === app.position_id);

      // Extract skills from profile
      const skills = Array.isArray(profileBlob.skills)
        ? profileBlob.skills
            .map((s: any) => (typeof s === 'string' ? s : s?.title))
            .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
        : [];

      // Calculate priority score
      const priorityScore = this.calculatePriorityScore(
        app.job_posting,
        profileBlob,
        skills,
      );

      // Add to candidates map (only once per candidate)
      if (!candidatesMap[candidate.id]) {
        candidatesMap[candidate.id] = {
          id: candidate.id,
          full_name: candidate.full_name,
          phone: candidate.phone,
          email: candidate.email ?? null,
          skills,
          age: candidate.age ?? null,
          gender: candidate.gender ?? null,
        };
      }

      // Add to jobs map (only once per job)
      if (!jobsMap[app.job_posting.id]) {
        jobsMap[app.job_posting.id] = {
          id: app.job_posting.id,
          posting_title: app.job_posting.posting_title,
          company_name: contract?.employer?.company_name || 'Unknown',
          country: app.job_posting.country,
          city: app.job_posting.city ?? null,
        };
      }

      // Add to positions map (only once per position)
      if (position && !positionsMap[position.id]) {
        positionsMap[position.id] = {
          id: position.id,
          title: position.title,
          monthly_salary_amount: position.monthly_salary_amount,
          salary_currency: position.salary_currency,
          total_vacancies: position.total_vacancies,
        };
      }

      // Add application (without duplicating candidate/job/position data)
      enrichedApplications.push({
        id: app.id,
        candidate_id: app.candidate_id,
        job_posting_id: app.job_posting_id,
        position_id: app.position_id,
        status: app.status,
        priority_score: priorityScore,
        created_at: app.created_at,
        updated_at: app.updated_at,
        withdrawn_at: app.withdrawn_at ?? null,
      });
    }

    // Apply search filter if provided
    let filteredApplications = enrichedApplications;
    if (searchTerm) {
      filteredApplications = enrichedApplications.filter(app => {
        const candidate = candidatesMap[app.candidate_id];
        const job = jobsMap[app.job_posting_id];
        
        return (
          candidate.full_name.toLowerCase().includes(searchTerm) ||
          candidate.phone.includes(searchTerm) ||
          candidate.email?.toLowerCase().includes(searchTerm) ||
          job.posting_title.toLowerCase().includes(searchTerm) ||
          job.company_name.toLowerCase().includes(searchTerm) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm))
        );
      });
    }

    // Recalculate pagination after search filter
    const filteredTotal = searchTerm ? filteredApplications.length : total;
    const totalPages = Math.ceil(filteredTotal / limit);

    return {
      applications: filteredApplications,
      candidates: candidatesMap,
      jobs: jobsMap,
      positions: positionsMap,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      performance: {
        loadTime: Date.now() - startTime,
        queryTime,
      },
    };
  }

  /**
   * Calculate priority score based on job requirements and candidate profile
   * @param jobPosting Job posting with requirements
   * @param profileBlob Candidate profile data
   * @param candidateSkills Extracted candidate skills
   * @returns Priority score (0-100)
   */
  private calculatePriorityScore(
    jobPosting: JobPosting,
    profileBlob: any,
    candidateSkills: string[],
  ): number {
    const candidateProfile = this.fitnessScoreService.extractCandidateProfile(profileBlob);
    const jobRequirements = this.fitnessScoreService.extractJobRequirements(jobPosting);
    const fitnessResult = this.fitnessScoreService.calculateScore(candidateProfile, jobRequirements);
    return fitnessResult.score;
  }

  /**
   * Map sort field to database column
   * @param field Sort field from query
   * @returns Database column name
   */
  private mapSortField(field: string): string {
    const fieldMap: Record<string, string> = {
      'created_at': 'app.created_at',
      'updated_at': 'app.updated_at',
      'status': 'app.status',
      'applied_at': 'app.created_at',
    };
    return fieldMap[field] || 'app.created_at';
  }

  /**
   * Get unique countries from agency's job postings
   * @param license Agency license number
   * @returns Array of unique countries
   */
  async getAgencyJobCountries(license: string): Promise<string[]> {
    const agency = await this.agencyRepo.findOne({ 
      where: { license_number: license } 
    });
    
    if (!agency) {
      throw new NotFoundException(`Agency with license ${license} not found`);
    }

    const countries = await this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .where('jc.posting_agency_id = :agencyId', { agencyId: agency.id })
      .select('DISTINCT jp.country', 'country')
      .orderBy('jp.country', 'ASC')
      .getRawMany<{ country: string }>();

    return countries.map(c => c.country).filter(Boolean);
  }

  /**
   * Get application statistics for an agency
   * @param license Agency license number
   * @returns Statistics object
   */
  async getAgencyApplicationStatistics(license: string) {
    const agency = await this.agencyRepo.findOne({ 
      where: { license_number: license } 
    });
    
    if (!agency) {
      throw new NotFoundException(`Agency with license ${license} not found`);
    }

    // Get all job posting IDs for this agency
    const jobPostings = await this.jobPostingRepo
      .createQueryBuilder('jp')
      .innerJoin('jp.contracts', 'jc')
      .where('jc.posting_agency_id = :agencyId', { agencyId: agency.id })
      .select('jp.id', 'id')
      .getRawMany<{ id: string }>();

    const jobPostingIds = jobPostings.map(jp => jp.id);

    if (jobPostingIds.length === 0) {
      return {
        total: 0,
        by_status: {},
        by_country: {},
      };
    }

    // Get total count
    const total = await this.applicationRepo
      .createQueryBuilder('app')
      .where('app.job_posting_id IN (:...jobPostingIds)', { jobPostingIds })
      .getCount();

    // Get counts by status
    const byStatus = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.job_posting_id IN (:...jobPostingIds)', { jobPostingIds })
      .groupBy('app.status')
      .getRawMany<{ status: string; count: string }>();

    // Get counts by country
    const byCountry = await this.applicationRepo
      .createQueryBuilder('app')
      .innerJoin('app.job_posting', 'jp')
      .select('jp.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('app.job_posting_id IN (:...jobPostingIds)', { jobPostingIds })
      .groupBy('jp.country')
      .getRawMany<{ country: string; count: string }>();

    return {
      total,
      by_status: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {} as Record<string, number>),
      by_country: byCountry.reduce((acc, item) => {
        acc[item.country] = parseInt(item.count, 10);
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
