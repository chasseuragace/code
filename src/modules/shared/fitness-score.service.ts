import { Injectable } from '@nestjs/common';
import {
  CandidateProfile,
  JobRequirements,
  FitnessScoreResult,
  FitnessScoreBreakdown,
} from './dto/fitness-score.dto';

/**
 * Unified service for calculating fitness scores (match percentage)
 * between candidates and job postings.
 *
 * Consolidates logic from:
 * - CandidateController (mobile job endpoint)
 * - CandidateService (relevant jobs)
 * - AgencyApplicationsService (priority score)
 */
@Injectable()
export class FitnessScoreService {
  /**
   * Calculate fitness score for a candidate against a job
   * @param candidate Normalized candidate profile
   * @param job Normalized job requirements
   * @returns Fitness score result with breakdown
   */
  calculateScore(
    candidate: CandidateProfile,
    job: JobRequirements,
  ): FitnessScoreResult {
    let parts = 0;
    let sumPct = 0;
    const breakdown: FitnessScoreBreakdown = {
      skills_match: 0,
      education_match: 0,
      experience_match: 0,
    };
    let matched_skills: string[] = [];
    let matched_education: string[] = [];
    let experience_ok = true;

    // 1. Skills Match
    if (job.skills && job.skills.length > 0) {
      const jobSkillsLower = job.skills.map(s => String(s).toLowerCase());
      const candidateSkillsLower = candidate.skills.map(s =>
        String(s).toLowerCase(),
      );
      matched_skills = candidateSkillsLower.filter(s =>
        jobSkillsLower.includes(s),
      );
      const pct =
        job.skills.length > 0 ? matched_skills.length / job.skills.length : 0;
      breakdown.skills_match = Math.round(pct * 100);
      parts++;
      sumPct += pct;
    }

    // 2. Education Match
    if (job.education_requirements && job.education_requirements.length > 0) {
      const jobEducationLower = job.education_requirements.map(e =>
        String(e).toLowerCase(),
      );
      const candidateEducationLower = candidate.education.map(e =>
        String(e).toLowerCase(),
      );
      matched_education = candidateEducationLower.filter(e =>
        jobEducationLower.includes(e),
      );
      const pct =
        job.education_requirements.length > 0
          ? matched_education.length / job.education_requirements.length
          : 0;
      breakdown.education_match = Math.round(pct * 100);
      parts++;
      sumPct += pct;
    }

    // 3. Experience Match
    if (
      job.experience_requirements &&
      (typeof job.experience_requirements.min_years === 'number' ||
        typeof job.experience_requirements.max_years === 'number')
    ) {
      const minOk =
        typeof job.experience_requirements.min_years === 'number'
          ? candidate.experience_years >= job.experience_requirements.min_years
          : true;
      const maxOk =
        typeof job.experience_requirements.max_years === 'number'
          ? candidate.experience_years <= job.experience_requirements.max_years
          : true;
      experience_ok = minOk && maxOk;
      const pct = experience_ok ? 1 : 0;
      breakdown.experience_match = pct * 100;
      parts++;
      sumPct += pct;
    }

    const score =
      parts > 0 ? Math.round((sumPct / parts) * 100) : 0;

    return {
      score,
      breakdown,
      matched_skills,
      matched_education,
      experience_ok,
    };
  }

  /**
   * Extract candidate profile from profile blob (raw candidate data)
   * Handles various data formats from different sources
   * @param profileBlob Raw candidate profile data
   * @returns Normalized candidate profile
   */
  extractCandidateProfile(profileBlob: any): CandidateProfile {
    // Extract skills
    const skills = this.extractSkills(profileBlob);

    // Extract education
    const education = this.extractEducation(profileBlob);

    // Extract experience years
    const experience_years = this.extractExperienceYears(profileBlob);

    return {
      skills,
      education,
      experience_years,
    };
  }

  /**
   * Extract job requirements from job posting entity
   * @param jobPosting Job posting entity
   * @returns Normalized job requirements
   */
  extractJobRequirements(jobPosting: any): JobRequirements {
    return {
      skills: Array.isArray(jobPosting.skills) ? jobPosting.skills : [],
      education_requirements: Array.isArray(
        jobPosting.education_requirements,
      )
        ? jobPosting.education_requirements
        : [],
      experience_requirements: jobPosting.experience_requirements,
    };
  }

  /**
   * Private helper: Extract skills from profile blob
   */
  private extractSkills(profileBlob: any): string[] {
    if (!Array.isArray(profileBlob.skills)) {
      return [];
    }

    return profileBlob.skills
      .map((s: any) => {
        if (typeof s === 'string') return s;
        if (typeof s?.title === 'string') return s.title;
        return null;
      })
      .filter((v: any) => typeof v === 'string' && v.trim().length > 0);
  }

  /**
   * Private helper: Extract education from profile blob
   */
  private extractEducation(profileBlob: any): string[] {
    if (!Array.isArray(profileBlob.education)) {
      return [];
    }

    return profileBlob.education
      .map((e: any) => {
        if (typeof e === 'string') return e;
        if (typeof e?.degree === 'string') return e.degree;
        if (typeof e?.title === 'string') return e.title;
        if (typeof e?.name === 'string') return e.name;
        return null;
      })
      .filter((v: any) => typeof v === 'string' && v.trim().length > 0);
  }

  /**
   * Private helper: Extract total experience years from profile blob
   * Sums up duration_months and years from skills or experience array
   */
  private extractExperienceYears(profileBlob: any): number {
    let totalYears = 0;

    // Try to extract from skills array (some profiles store duration there)
    if (Array.isArray(profileBlob.skills)) {
      totalYears += profileBlob.skills.reduce((acc: number, s: any) => {
        if (typeof s?.duration_months === 'number') {
          return acc + s.duration_months / 12;
        }
        if (typeof s?.years === 'number') {
          return acc + s.years;
        }
        return acc;
      }, 0);
    }

    // Try to extract from experience array
    if (Array.isArray(profileBlob.experience)) {
      totalYears += profileBlob.experience.reduce((acc: number, exp: any) => {
        if (typeof exp?.duration_months === 'number') {
          return acc + exp.duration_months / 12;
        }
        if (typeof exp?.years === 'number') {
          return acc + exp.years;
        }
        return acc;
      }, 0);
    }

    return totalYears;
  }
}
