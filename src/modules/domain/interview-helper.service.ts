import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewDetail } from './domain.entity';

/**
 * Interview Helper Service
 * 
 * Focused service for interview-specific operations including:
 * - Status and result tracking
 * - Completion and cancellation logic
 * - Interview history management
 * 
 * Keeps interview logic separate from the main InterviewService
 */

export interface CompleteInterviewInput {
  result: 'pass' | 'fail';
  feedback?: string;
  score?: number; // 0-10
  recommendation?: string;
  notes?: string;
}

export interface CancelInterviewInput {
  rejection_reason?: string;
  notes?: string;
}

export interface RescheduleInterviewInput {
  interview_date_ad?: string;
  interview_date_bs?: string;
  interview_time?: string;
  duration_minutes?: number;
  location?: string;
  contact_person?: string;
  required_documents?: string[];
  notes?: string;
}

@Injectable()
export class InterviewHelperService {
  constructor(
    @InjectRepository(InterviewDetail)
    private readonly interviewRepo: Repository<InterviewDetail>,
  ) {}

  /**
   * Find the latest interview for an application
   */
  async findLatestInterviewForApplication(applicationId: string): Promise<InterviewDetail | null> {
    return this.interviewRepo.findOne({
      where: { job_application_id: applicationId },
      order: { created_at: 'DESC' },
      relations: ['expenses'],
    });
  }

  /**
   * Complete an interview with result and feedback
   */
  async completeInterview(
    interviewId: string,
    input: CompleteInterviewInput,
  ): Promise<InterviewDetail> {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Validate status
    if (interview.status !== 'scheduled') {
      throw new Error(`Cannot complete interview with status "${interview.status}"`);
    }

    // Validate score if provided
    if (input.score !== undefined && (input.score < 0 || input.score > 10)) {
      throw new Error('Interview score must be between 0 and 10');
    }

    // Update interview
    interview.status = 'completed';
    interview.result = input.result;
    interview.completed_at = new Date();
    
    if (input.feedback) {
      interview.feedback = input.feedback;
    }
    
    if (input.score !== undefined) {
      interview.score = input.score;
    }
    
    if (input.recommendation) {
      interview.recommendation = input.recommendation;
    }
    
    // Append notes if provided
    if (input.notes) {
      const timestamp = new Date().toISOString();
      const noteEntry = `\n[${timestamp}] Interview completed: ${input.notes}`;
      interview.notes = (interview.notes || '') + noteEntry;
    }

    return this.interviewRepo.save(interview);
  }

  /**
   * Cancel an interview (for rejection or withdrawal)
   */
  async cancelInterview(
    interviewId: string,
    input: CancelInterviewInput,
  ): Promise<InterviewDetail> {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Update interview
    interview.status = 'cancelled';
    interview.result = 'rejected';
    interview.cancelled_at = new Date();
    
    if (input.rejection_reason) {
      interview.rejection_reason = input.rejection_reason;
    }
    
    // Append notes if provided
    if (input.notes) {
      const timestamp = new Date().toISOString();
      const noteEntry = `\n[${timestamp}] Interview cancelled: ${input.notes}`;
      interview.notes = (interview.notes || '') + noteEntry;
    }

    return this.interviewRepo.save(interview);
  }

  /**
   * Reschedule an interview
   */
  async rescheduleInterview(
    interviewId: string,
    input: RescheduleInterviewInput,
  ): Promise<InterviewDetail> {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Validate status
    if (interview.status !== 'scheduled') {
      throw new Error(`Cannot reschedule interview with status "${interview.status}"`);
    }

    // Update interview details
    if (input.interview_date_ad) {
      interview.interview_date_ad = new Date(input.interview_date_ad);
    }
    
    if (input.interview_date_bs) {
      interview.interview_date_bs = input.interview_date_bs;
    }
    
    if (input.interview_time) {
      interview.interview_time = input.interview_time;
    }
    
    if (input.duration_minutes !== undefined) {
      interview.duration_minutes = input.duration_minutes;
    }
    
    if (input.location) {
      interview.location = input.location;
    }
    
    if (input.contact_person) {
      interview.contact_person = input.contact_person;
    }
    
    if (input.required_documents) {
      interview.required_documents = input.required_documents;
    }
    
    // Set rescheduled timestamp
    interview.rescheduled_at = new Date();
    
    // Append notes if provided
    if (input.notes) {
      const timestamp = new Date().toISOString();
      const noteEntry = `\n[${timestamp}] Interview rescheduled: ${input.notes}`;
      interview.notes = (interview.notes || '') + noteEntry;
    }

    return this.interviewRepo.save(interview);
  }

  /**
   * Add remarks/notes to an interview without changing status
   */
  async addInterviewRemarks(
    interviewId: string,
    remarks: string,
    updatedBy?: string,
  ): Promise<InterviewDetail> {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const timestamp = new Date().toISOString();
    const noteEntry = `\n[${timestamp}]${updatedBy ? ` (${updatedBy})` : ''} ${remarks}`;
    interview.notes = (interview.notes || '') + noteEntry;

    return this.interviewRepo.save(interview);
  }

  /**
   * Check if interview is unattended (no-show)
   * Returns true if interview time + duration + 30min grace period has passed
   * and status is still 'scheduled'
   */
  isInterviewUnattended(interview: InterviewDetail): boolean {
    if (interview.status !== 'scheduled') {
      return false;
    }

    if (!interview.interview_date_ad || !interview.interview_time) {
      return false;
    }

    const now = new Date();
    const interviewDate = new Date(interview.interview_date_ad);
    
    // Parse time (format: "HH:MM:SS" or "HH:MM")
    const timeParts = interview.interview_time.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    interviewDate.setHours(hours, minutes, 0, 0);
    
    // Add duration + 30min grace period
    const duration = interview.duration_minutes || 60;
    const gracePeriod = 30; // minutes
    const endTime = new Date(interviewDate);
    endTime.setMinutes(endTime.getMinutes() + duration + gracePeriod);
    
    return now > endTime;
  }

  /**
   * Get interview statistics for a job
   */
  async getInterviewStatsForJob(
    jobId: string,
    dateRange?: 'today' | 'week' | 'month' | 'all',
  ): Promise<{
    total_scheduled: number;
    today: number;
    tomorrow: number;
    unattended: number;
    completed: number;
    passed: number;
    failed: number;
    cancelled: number;
  }> {
    const qb = this.interviewRepo
      .createQueryBuilder('int')
      .innerJoin('job_applications', 'app', 'app.id = int.job_application_id')
      .where('app.job_posting_id = :jobId', { jobId });

    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateRange === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        qb.andWhere('int.interview_date_ad >= :today AND int.interview_date_ad < :tomorrow', {
          today: today.toISOString(),
          tomorrow: tomorrow.toISOString(),
        });
      } else if (dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        qb.andWhere('int.interview_date_ad >= :weekAgo', {
          weekAgo: weekAgo.toISOString(),
        });
      } else if (dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        qb.andWhere('int.interview_date_ad >= :monthAgo', {
          monthAgo: monthAgo.toISOString(),
        });
      }
    }

    const interviews = await qb.getMany();

    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const stats = {
      total_scheduled: 0,
      today: 0,
      tomorrow: 0,
      unattended: 0,
      completed: 0,
      passed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const interview of interviews) {
      // Count by status
      if (interview.status === 'scheduled') {
        stats.total_scheduled++;
        
        // Check if unattended
        if (this.isInterviewUnattended(interview)) {
          stats.unattended++;
        }
        
        // Count today/tomorrow
        if (interview.interview_date_ad) {
          const interviewDate = new Date(interview.interview_date_ad);
          if (interviewDate >= today && interviewDate < tomorrow) {
            stats.today++;
          } else if (interviewDate >= tomorrow && interviewDate < dayAfterTomorrow) {
            stats.tomorrow++;
          }
        }
      } else if (interview.status === 'completed') {
        stats.completed++;
        
        // Count by result
        if (interview.result === 'pass') {
          stats.passed++;
        } else if (interview.result === 'fail') {
          stats.failed++;
        }
      } else if (interview.status === 'cancelled') {
        stats.cancelled++;
      }
    }

    return stats;
  }
}
