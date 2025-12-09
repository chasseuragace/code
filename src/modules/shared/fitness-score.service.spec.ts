import { Test, TestingModule } from '@nestjs/testing';
import { FitnessScoreService } from './fitness-score.service';
import {
  CandidateProfile,
  JobRequirements,
  FitnessScoreResult,
} from './dto/fitness-score.dto';

describe('FitnessScoreService', () => {
  let service: FitnessScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FitnessScoreService],
    }).compile();

    service = module.get<FitnessScoreService>(FitnessScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScore', () => {
    it('should return 0 when no requirements are present', () => {
      const candidate: CandidateProfile = {
        skills: ['JavaScript', 'TypeScript'],
        education: ['Bachelor in CS'],
        experience_years: 5,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      expect(result.score).toBe(0);
      expect(result.breakdown.skills_match).toBe(0);
      expect(result.breakdown.education_match).toBe(0);
      expect(result.breakdown.experience_match).toBe(0);
    });

    it('should calculate 100% skills match when all candidate skills match job requirements', () => {
      const candidate: CandidateProfile = {
        skills: ['JavaScript', 'TypeScript'],
        education: [],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: ['JavaScript', 'TypeScript'],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      expect(result.score).toBe(100);
      expect(result.breakdown.skills_match).toBe(100);
      expect(result.matched_skills).toEqual(['javascript', 'typescript']);
    });

    it('should calculate partial skills match', () => {
      const candidate: CandidateProfile = {
        skills: ['JavaScript', 'TypeScript', 'Python'],
        education: [],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: ['JavaScript', 'TypeScript', 'Go', 'Rust'],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      // 2 out of 4 required skills = 50%
      expect(result.breakdown.skills_match).toBe(50);
      expect(result.matched_skills).toEqual(['javascript', 'typescript']);
    });

    it('should calculate 100% education match when all candidate education matches job requirements', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: ['Bachelor in Computer Science', 'Master in AI'],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: ['Bachelor in Computer Science', 'Master in AI'],
      };

      const result = service.calculateScore(candidate, job);

      expect(result.score).toBe(100);
      expect(result.breakdown.education_match).toBe(100);
      expect(result.matched_education).toEqual([
        'bachelor in computer science',
        'master in ai',
      ]);
    });

    it('should calculate partial education match', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: ['Bachelor in CS', 'Diploma in Electronics'],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: ['Bachelor in CS', 'Master in CS', 'PhD in CS'],
      };

      const result = service.calculateScore(candidate, job);

      // 1 out of 3 required education = 33%
      expect(result.breakdown.education_match).toBe(33);
      expect(result.matched_education).toEqual(['bachelor in cs']);
    });

    it('should calculate experience match when within bounds', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: [],
        experience_years: 5,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
        experience_requirements: { min_years: 3, max_years: 7 },
      };

      const result = service.calculateScore(candidate, job);

      expect(result.breakdown.experience_match).toBe(100);
      expect(result.experience_ok).toBe(true);
    });

    it('should fail experience match when below minimum', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: [],
        experience_years: 2,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
        experience_requirements: { min_years: 3, max_years: 7 },
      };

      const result = service.calculateScore(candidate, job);

      expect(result.breakdown.experience_match).toBe(0);
      expect(result.experience_ok).toBe(false);
    });

    it('should fail experience match when above maximum', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: [],
        experience_years: 10,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
        experience_requirements: { min_years: 3, max_years: 7 },
      };

      const result = service.calculateScore(candidate, job);

      expect(result.breakdown.experience_match).toBe(0);
      expect(result.experience_ok).toBe(false);
    });

    it('should calculate average score across all components', () => {
      const candidate: CandidateProfile = {
        skills: ['JavaScript', 'TypeScript'],
        education: ['Bachelor in CS'],
        experience_years: 5,
      };

      const job: JobRequirements = {
        skills: ['JavaScript', 'TypeScript', 'Go'],
        education_requirements: ['Bachelor in CS', 'Master in CS'],
        experience_requirements: { min_years: 3, max_years: 7 },
      };

      const result = service.calculateScore(candidate, job);

      // Skills: 2/3 = 66.67%
      // Education: 1/2 = 50%
      // Experience: 1 = 100%
      // Average: (66.67 + 50 + 100) / 3 = 72.22% -> 72
      expect(result.score).toBe(72);
      expect(result.breakdown.skills_match).toBe(67);
      expect(result.breakdown.education_match).toBe(50);
      expect(result.breakdown.experience_match).toBe(100);
    });

    it('should be case-insensitive for skills matching', () => {
      const candidate: CandidateProfile = {
        skills: ['JAVASCRIPT', 'TypeScript'],
        education: [],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: ['javascript', 'typescript'],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      expect(result.score).toBe(100);
      expect(result.matched_skills).toEqual(['javascript', 'typescript']);
    });

    it('should be case-insensitive for education matching', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: ['BACHELOR IN CS', 'Master in AI'],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: ['bachelor in cs', 'master in ai'],
      };

      const result = service.calculateScore(candidate, job);

      expect(result.score).toBe(100);
      expect(result.matched_education).toEqual(['bachelor in cs', 'master in ai']);
    });

    it('should handle only min_years experience requirement', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: [],
        experience_years: 5,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
        experience_requirements: { min_years: 3 },
      };

      const result = service.calculateScore(candidate, job);

      expect(result.breakdown.experience_match).toBe(100);
      expect(result.experience_ok).toBe(true);
    });

    it('should handle only max_years experience requirement', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: [],
        experience_years: 5,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: [],
        experience_requirements: { max_years: 7 },
      };

      const result = service.calculateScore(candidate, job);

      expect(result.breakdown.experience_match).toBe(100);
      expect(result.experience_ok).toBe(true);
    });
  });

  describe('extractCandidateProfile', () => {
    it('should extract skills from profile blob', () => {
      const profileBlob = {
        skills: [
          { title: 'JavaScript', years: 3 },
          { title: 'TypeScript', years: 2 },
          'Python',
        ],
        education: [],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      expect(profile.skills).toEqual(['JavaScript', 'TypeScript', 'Python']);
    });

    it('should extract education from profile blob with various formats', () => {
      const profileBlob = {
        skills: [],
        education: [
          { degree: 'Bachelor in CS' },
          { title: 'Master in AI' },
          { name: 'Diploma in Electronics' },
          'Certificate in Web Dev',
        ],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      expect(profile.education).toEqual([
        'Bachelor in CS',
        'Master in AI',
        'Diploma in Electronics',
        'Certificate in Web Dev',
      ]);
    });

    it('should calculate total experience years from skills', () => {
      const profileBlob = {
        skills: [
          { title: 'JavaScript', duration_months: 36 },
          { title: 'TypeScript', years: 2 },
        ],
        education: [],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      // 36 months = 3 years + 2 years = 5 years
      expect(profile.experience_years).toBe(5);
    });

    it('should calculate total experience years from experience array', () => {
      const profileBlob = {
        skills: [],
        education: [],
        experience: [
          { duration_months: 24 },
          { years: 3 },
        ],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      // 24 months = 2 years + 3 years = 5 years
      expect(profile.experience_years).toBe(5);
    });

    it('should combine experience from both skills and experience arrays', () => {
      const profileBlob = {
        skills: [
          { title: 'JavaScript', years: 2 },
        ],
        education: [],
        experience: [
          { years: 3 },
        ],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      // 2 years from skills + 3 years from experience = 5 years
      expect(profile.experience_years).toBe(5);
    });

    it('should handle empty profile blob', () => {
      const profileBlob = {};

      const profile = service.extractCandidateProfile(profileBlob);

      expect(profile.skills).toEqual([]);
      expect(profile.education).toEqual([]);
      expect(profile.experience_years).toBe(0);
    });

    it('should filter out empty strings and invalid entries', () => {
      const profileBlob = {
        skills: [
          { title: 'JavaScript' },
          { title: '' },
          { title: '   ' },
          null,
          undefined,
        ],
        education: [],
      };

      const profile = service.extractCandidateProfile(profileBlob);

      expect(profile.skills).toEqual(['JavaScript']);
    });
  });

  describe('extractJobRequirements', () => {
    it('should extract job requirements from job posting', () => {
      const jobPosting = {
        skills: ['JavaScript', 'TypeScript'],
        education_requirements: ['Bachelor in CS'],
        experience_requirements: { min_years: 3, max_years: 7 },
      };

      const requirements = service.extractJobRequirements(jobPosting);

      expect(requirements.skills).toEqual(['JavaScript', 'TypeScript']);
      expect(requirements.education_requirements).toEqual(['Bachelor in CS']);
      expect(requirements.experience_requirements).toEqual({
        min_years: 3,
        max_years: 7,
      });
    });

    it('should handle missing fields in job posting', () => {
      const jobPosting = {
        posting_title: 'Senior Developer',
      };

      const requirements = service.extractJobRequirements(jobPosting);

      expect(requirements.skills).toEqual([]);
      expect(requirements.education_requirements).toEqual([]);
      expect(requirements.experience_requirements).toBeUndefined();
    });

    it('should handle null/undefined arrays', () => {
      const jobPosting = {
        skills: null,
        education_requirements: undefined,
      };

      const requirements = service.extractJobRequirements(jobPosting);

      expect(requirements.skills).toEqual([]);
      expect(requirements.education_requirements).toEqual([]);
    });
  });

  describe('Integration scenarios', () => {
    it('Scenario A: Rich requirements with partial matches', () => {
      const candidate: CandidateProfile = {
        skills: ['industrial-wiring', 'electrical-systems'],
        education: ['technical-diploma'],
        experience_years: 2,
      };

      const job: JobRequirements = {
        skills: ['industrial-wiring', 'electrical-systems', 'safety-protocols'],
        education_requirements: ['technical-diploma'],
        experience_requirements: { min_years: 2 },
      };

      const result = service.calculateScore(candidate, job);

      // Skills: 2/3 = 66.67% -> 67
      // Education: 1/1 = 100%
      // Experience: 1 = 100%
      // Average: (67 + 100 + 100) / 3 = 89
      expect(result.score).toBe(89);
    });

    it('Scenario B: Skills-only with partial overlap', () => {
      const candidate: CandidateProfile = {
        skills: ['industrial-wiring', 'electrical-systems'],
        education: [],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: [
          'industrial-wiring',
          'electrical-systems',
          'safety-protocols',
          'cable-management',
        ],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      // Skills: 2/4 = 50%
      expect(result.score).toBe(50);
    });

    it('Scenario C: Skills-only with full overlap', () => {
      const candidate: CandidateProfile = {
        skills: ['industrial-wiring', 'electrical-systems'],
        education: [],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: ['industrial-wiring', 'electrical-systems'],
        education_requirements: [],
      };

      const result = service.calculateScore(candidate, job);

      // Skills: 2/2 = 100%
      expect(result.score).toBe(100);
    });

    it('Scenario D: Education-only with full overlap', () => {
      const candidate: CandidateProfile = {
        skills: [],
        education: ['technical-diploma'],
        experience_years: 0,
      };

      const job: JobRequirements = {
        skills: [],
        education_requirements: ['technical-diploma'],
      };

      const result = service.calculateScore(candidate, job);

      // Education: 1/1 = 100%
      expect(result.score).toBe(100);
    });
  });
});
