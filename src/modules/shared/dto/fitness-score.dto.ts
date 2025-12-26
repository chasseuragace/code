/**
 * DTOs for Fitness Score calculation
 */

export interface CandidateProfile {
  skills: string[];
  education: string[];
  experience_years: number;
}

export interface JobRequirements {
  skills: string[];
  education_requirements: string[];
  experience_requirements?: {
    min_years?: number;
    max_years?: number;
  };
}

export interface FitnessScoreBreakdown {
  skills_match: number;
  education_match: number;
  experience_match: number;
}

export interface FitnessScoreResult {
  score: number;
  breakdown: FitnessScoreBreakdown;
  matched_skills: string[];
  matched_education: string[];
  experience_ok: boolean;
}
