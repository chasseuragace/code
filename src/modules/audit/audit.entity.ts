import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Audit Log Entry - Captures security-relevant actions in the system
 * 
 * Framing Layers:
 * 1. Request Frame: HTTP context (method, path, correlation_id)
 * 2. Identity Frame: Who performed the action (user_id, role, agency_id)
 * 3. Activity Frame: What happened (action, resource_type, resource_id, outcome)
 */
@Entity('audit_logs')
@Index(['user_id'])
@Index(['action'])
@Index(['resource_type'])
@Index(['created_at'])
@Index(['agency_id'])
@Index(['category'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === Request Frame ===
  @Column({ type: 'varchar', length: 10 })
  method: string; // GET, POST, PUT, PATCH, DELETE

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  correlation_id: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  origin_ip: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string | null;

  // === Identity Frame ===
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_role: string | null; // candidate, owner, agency_user, admin

  @Column({ type: 'uuid', nullable: true })
  agency_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  client_id: string | null; // frontend-app, mobile-app, api-client

  // === Activity Frame ===
  @Column({ type: 'varchar', length: 100 })
  action: string; // e.g., 'apply_job', 'shortlist_candidate', 'schedule_interview'

  @Column({ type: 'varchar', length: 50 })
  category: string; // auth, application, job_posting, agency, candidate, interview

  @Column({ type: 'varchar', length: 50, nullable: true })
  resource_type: string | null; // job_application, job_posting, candidate, interview

  @Column({ type: 'uuid', nullable: true })
  resource_id: string | null;

  @Column({ type: 'jsonb', nullable: true })
  state_change: Record<string, any> | null; // { field: [old_value, new_value] }

  @Column({ type: 'varchar', length: 20 })
  outcome: string; // success, failure, denied

  @Column({ type: 'int', nullable: true })
  status_code: number | null;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  // === Metadata ===
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null; // Additional context

  @Column({ type: 'int', nullable: true })
  duration_ms: number | null; // Request duration

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}

/**
 * Domain-specific action categories for the recruitment portal
 */
export const AuditCategories = {
  AUTH: 'auth',
  APPLICATION: 'application',
  JOB_POSTING: 'job_posting',
  AGENCY: 'agency',
  CANDIDATE: 'candidate',
  INTERVIEW: 'interview',
  ADMIN: 'admin',
  SYSTEM: 'system',
} as const;

/**
 * Domain actions mapped to human-readable descriptions
 */
export const AuditActions = {
  // Auth
  REGISTER: 'register',
  LOGIN_START: 'login_start',
  LOGIN_VERIFY: 'login_verify',
  LOGOUT: 'logout',
  
  // Application workflow
  APPLY_JOB: 'apply_job',
  SHORTLIST_CANDIDATE: 'shortlist_candidate',
  SCHEDULE_INTERVIEW: 'schedule_interview',
  RESCHEDULE_INTERVIEW: 'reschedule_interview',
  COMPLETE_INTERVIEW: 'complete_interview',
  WITHDRAW_APPLICATION: 'withdraw_application',
  REJECT_APPLICATION: 'reject_application',
  
  // Job posting
  CREATE_JOB_POSTING: 'create_job_posting',
  UPDATE_JOB_POSTING: 'update_job_posting',
  CLOSE_JOB_POSTING: 'close_job_posting',
  UPDATE_JOB_TAGS: 'update_job_tags',
  TOGGLE_JOB_POSTING_DRAFT: 'toggle_job_posting_draft',
  
  // Agency
  CREATE_AGENCY: 'create_agency',
  UPDATE_AGENCY: 'update_agency',
  ADD_TEAM_MEMBER: 'add_team_member',
  REMOVE_TEAM_MEMBER: 'remove_team_member',
  
  // Candidate
  CREATE_PROFILE: 'create_profile',
  UPDATE_PROFILE: 'update_profile',
  UPDATE_JOB_PROFILE: 'update_job_profile',
  
  // Candidate Documents
  UPLOAD_DOCUMENT: 'upload_document',
  DELETE_DOCUMENT: 'delete_document',
  VERIFY_DOCUMENT: 'verify_document',
  
  // Admin
  VIEW_ADMIN_JOBS: 'view_admin_jobs',
  BULK_REJECT: 'bulk_reject',
  
  // Application Notes
  CREATE_NOTE: 'create_note',
  UPDATE_NOTE: 'update_note',
  DELETE_NOTE: 'delete_note',
} as const;

export type AuditCategory = typeof AuditCategories[keyof typeof AuditCategories];
export type AuditAction = typeof AuditActions[keyof typeof AuditActions];

/**
 * Human-readable descriptions for audit actions (for frontend display)
 */
export const AuditActionDescriptions: Record<string, string> = {
  // Auth
  [AuditActions.REGISTER]: 'New account registered',
  [AuditActions.LOGIN_START]: 'Login initiated',
  [AuditActions.LOGIN_VERIFY]: 'Login completed',
  [AuditActions.LOGOUT]: 'Logged out',
  
  // Application workflow
  [AuditActions.APPLY_JOB]: 'Applied for a job position',
  [AuditActions.SHORTLIST_CANDIDATE]: 'Candidate shortlisted for interview',
  [AuditActions.SCHEDULE_INTERVIEW]: 'Interview scheduled',
  [AuditActions.RESCHEDULE_INTERVIEW]: 'Interview rescheduled',
  [AuditActions.COMPLETE_INTERVIEW]: 'Interview completed',
  [AuditActions.WITHDRAW_APPLICATION]: 'Application withdrawn',
  [AuditActions.REJECT_APPLICATION]: 'Application rejected',
  
  // Job posting
  [AuditActions.CREATE_JOB_POSTING]: 'New job posting created',
  [AuditActions.UPDATE_JOB_POSTING]: 'Job posting updated',
  [AuditActions.CLOSE_JOB_POSTING]: 'Job posting closed',
  [AuditActions.UPDATE_JOB_TAGS]: 'Job requirements updated',
  [AuditActions.TOGGLE_JOB_POSTING_DRAFT]: 'Job posting draft status toggled',
  
  // Agency
  [AuditActions.CREATE_AGENCY]: 'Agency profile created',
  [AuditActions.UPDATE_AGENCY]: 'Agency profile updated',
  [AuditActions.ADD_TEAM_MEMBER]: 'Team member added',
  [AuditActions.REMOVE_TEAM_MEMBER]: 'Team member removed',
  
  // Candidate
  [AuditActions.CREATE_PROFILE]: 'Candidate profile created',
  [AuditActions.UPDATE_PROFILE]: 'Profile information updated',
  [AuditActions.UPDATE_JOB_PROFILE]: 'Job preferences updated',
  
  // Candidate Documents
  [AuditActions.UPLOAD_DOCUMENT]: 'Document uploaded for candidate',
  [AuditActions.DELETE_DOCUMENT]: 'Document deleted from candidate',
  [AuditActions.VERIFY_DOCUMENT]: 'Document verification status updated',
  
  // Admin
  [AuditActions.VIEW_ADMIN_JOBS]: 'Viewed admin job listings',
  [AuditActions.BULK_REJECT]: 'Bulk rejection performed',
  
  // Notes
  [AuditActions.CREATE_NOTE]: 'Note added to application',
  [AuditActions.UPDATE_NOTE]: 'Application note updated',
  [AuditActions.DELETE_NOTE]: 'Application note deleted',
};

/**
 * Category labels for frontend display
 */
export const AuditCategoryLabels: Record<string, string> = {
  [AuditCategories.AUTH]: 'Authentication',
  [AuditCategories.APPLICATION]: 'Job Applications',
  [AuditCategories.JOB_POSTING]: 'Job Postings',
  [AuditCategories.AGENCY]: 'Agency Management',
  [AuditCategories.CANDIDATE]: 'Candidate Profiles',
  [AuditCategories.INTERVIEW]: 'Interviews',
  [AuditCategories.ADMIN]: 'Administration',
  [AuditCategories.SYSTEM]: 'System',
};
