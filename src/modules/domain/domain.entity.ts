import { Entity, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { JobTitle } from '../job-title/job-title.entity';
import { PostingAgency } from './PostingAgency';
import { JobApplication } from '../application/job-application.entity';

import { BaseEntity, BaseEntityCreatedOnly } from './base.entity';
 


@Entity('job_postings')
export class JobPosting extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  posting_title: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lt_number?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chalani_number?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  approval_date_bs?: string;

  @Column({ type: 'date', nullable: true })
  approval_date_ad?: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  posting_date_ad: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  posting_date_bs?: string;

  @Column({
    type: 'enum',
    enum: ['full_ad', 'short_ad', 'update'],
    default: 'full_ad'
  })
  announcement_type: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Public URL to job advert cutout image (e.g., /public/<agencyId>/<jobId>/cutout.<ext>)
  @Column({ type: 'varchar', length: 1000, nullable: true })
  cutout_url?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // --- Tagging fields (optional) ---
  @Column({ type: 'jsonb', nullable: true })
  skills?: string[];

  @Column({ type: 'jsonb', nullable: true })
  education_requirements?: string[];

  @Column('jsonb', { nullable: true })
  experience_requirements?: {
    min_years?: number;
    max_years?: number;
    level?: 'fresher' | 'experienced' | 'skilled' | 'expert';
  };

  @ManyToMany(() => JobTitle)
  @JoinTable({
    name: 'job_posting_titles',
    joinColumn: { name: 'job_posting_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'job_title_id', referencedColumnName: 'id' }
  })
  canonical_titles?: JobTitle[];

  @OneToMany(() => JobContract, contract => contract.job_posting, { cascade: true })
  contracts: JobContract[];

  @OneToMany(() => MedicalExpense, expense => expense.job_posting, { cascade: true })
  medical_expenses: MedicalExpense[];

  @OneToMany(() => InsuranceExpense, expense => expense.job_posting, { cascade: true })
  insurance_expenses: InsuranceExpense[];

  @OneToMany(() => TravelExpense, expense => expense.job_posting, { cascade: true })
  travel_expenses: TravelExpense[];

  @OneToMany(() => VisaPermitExpense, expense => expense.job_posting, { cascade: true })
  visa_permit_expenses: VisaPermitExpense[];

  @OneToMany(() => TrainingExpense, expense => expense.job_posting, { cascade: true })
  training_expenses: TrainingExpense[];

  @OneToMany(() => WelfareServiceExpense, expense => expense.job_posting, { cascade: true })
  welfare_service_expenses: WelfareServiceExpense[];

  @OneToMany(() => InterviewDetail, interview => interview.job_posting, { cascade: true })
  interviews: InterviewDetail[];
}

@Entity('employers')
export class Employer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @OneToMany(() => JobContract, contract => contract.employer)
  contracts: JobContract[];
}

@Entity('job_contracts')
export class JobContract extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  @Column({ type: 'uuid' })
  employer_id: string;

  @Column({ type: 'uuid' })
  posting_agency_id: string;

  @Column({ type: 'integer' })
  period_years: number;

  @Column({ type: 'boolean', default: false })
  renewable: boolean;

  // Work schedule
  @Column({ type: 'integer', nullable: true })
  hours_per_day?: number;

  @Column({ type: 'integer', nullable: true })
  days_per_week?: number;

  @Column({
    type: 'enum',
    enum: ['as_per_company_policy', 'paid', 'unpaid', 'not_applicable'],
    nullable: true,
    default: 'as_per_company_policy'
  })
  overtime_policy?: string;

  @Column({ type: 'integer', nullable: true })
  weekly_off_days?: number;

  // Benefits
  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  food?: string;

  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  accommodation?: string;

  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  transport?: string;

  @Column({ type: 'integer', nullable: true })
  annual_leave_days?: number;

  // Relations
  @ManyToOne(() => JobPosting, posting => posting.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;

  @ManyToOne(() => Employer, employer => employer.contracts)
  @JoinColumn({ name: 'employer_id' })
  employer: Employer;

  @ManyToOne(() => PostingAgency, agency => agency.contracts)
  @JoinColumn({ name: 'posting_agency_id' })
  agency: PostingAgency;

  @OneToMany(() => JobPosition, position => position.job_contract, { cascade: true })
  positions: JobPosition[];
}

// Moved JobPosition before SalaryConversion to avoid TDZ errors from design:type
@Entity('job_positions')
export class JobPosition extends BaseEntity {
  @Column({ type: 'uuid' })
  job_contract_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'integer', default: 0 })
  male_vacancies: number;

  @Column({ type: 'integer', default: 0 })
  female_vacancies: number;

  @Column({ type: 'integer', asExpression: 'male_vacancies + female_vacancies', generatedType: 'STORED' })
  total_vacancies: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => typeof value === 'string' ? parseFloat(value) : value
    }
  })
  monthly_salary_amount: number;

  @Column({ type: 'varchar', length: 10 })
  salary_currency: string;

  // Position-specific overrides
  @Column({ type: 'integer', nullable: true })
  hours_per_day_override?: number;

  @Column({ type: 'integer', nullable: true })
  days_per_week_override?: number;

  @Column({
    type: 'enum',
    enum: ['as_per_company_policy', 'paid', 'unpaid', 'not_applicable'],
    nullable: true
  })
  overtime_policy_override?: string;

  @Column({ type: 'integer', nullable: true })
  weekly_off_days_override?: number;

  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  food_override?: string;

  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  accommodation_override?: string;

  @Column({
    type: 'enum',
    enum: ['free', 'paid', 'not_provided'],
    nullable: true
  })
  transport_override?: string;

  @Column({ type: 'text', nullable: true })
  position_notes?: string;

  // Relations
  @ManyToOne(() => JobContract, contract => contract.positions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_contract_id' })
  job_contract: JobContract;

  @OneToMany(() => SalaryConversion, conversion => conversion.job_position, { cascade: true })
  salaryConversions: SalaryConversion[];
}

@Entity('salary_conversions')
export class SalaryConversion extends BaseEntityCreatedOnly {
  @Column({ type: 'uuid' })
  job_position_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  converted_amount: number;

  @Column({ type: 'varchar', length: 10 })
  converted_currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  conversion_rate?: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  conversion_date: Date;

  @ManyToOne(() => JobPosition, position => position.salaryConversions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_position_id' })
  job_position: JobPosition;
}

@Entity('medical_expenses')
export class MedicalExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  // Domestic medical
  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  domestic_who_pays?: string;

  @Column({ type: 'boolean', default: false })
  domestic_is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  domestic_amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  domestic_currency?: string;

  @Column({ type: 'text', nullable: true })
  domestic_notes?: string;

  // Foreign medical
  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  foreign_who_pays?: string;

  @Column({ type: 'boolean', default: false })
  foreign_is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  foreign_amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  foreign_currency?: string;

  @Column({ type: 'text', nullable: true })
  foreign_notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.medical_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('insurance_expenses')
export class InsuranceExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  who_pays?: string;

  @Column({ type: 'boolean', default: false })
  is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  coverage_amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  coverage_currency?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.insurance_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('travel_expenses')
export class TravelExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  who_provides?: string;

  @Column({
    type: 'enum',
    enum: ['one_way', 'round_trip', 'return_only'],
    nullable: true
  })
  ticket_type?: string;

  @Column({ type: 'boolean', default: false })
  is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.travel_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('visa_permit_expenses')
export class VisaPermitExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  who_pays?: string;

  @Column({ type: 'boolean', default: false })
  is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'boolean', default: false })
  refundable: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.visa_permit_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('training_expenses')
export class TrainingExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  who_pays?: string;

  @Column({ type: 'boolean', default: false })
  is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'integer', nullable: true })
  duration_days?: number;

  @Column({ type: 'boolean', default: true })
  mandatory: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.training_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('welfare_service_expenses')
export class WelfareServiceExpense extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  // Welfare fund fields
  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  welfare_who_pays?: string;

  @Column({ type: 'boolean', default: false })
  welfare_is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  welfare_amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  welfare_currency?: string;

  @Column({ type: 'text', nullable: true })
  welfare_fund_purpose?: string;

  @Column({ type: 'boolean', default: false })
  welfare_refundable: boolean;

  @Column({ type: 'text', nullable: true })
  welfare_notes?: string;

  // Service charge fields
  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'],
    nullable: true
  })
  service_who_pays?: string;

  @Column({ type: 'boolean', default: false })
  service_is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  service_amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  service_currency?: string;

  @Column({ type: 'text', nullable: true })
  service_type?: string;

  @Column({ type: 'boolean', default: false })
  service_refundable: boolean;

  @Column({ type: 'text', nullable: true })
  service_notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.welfare_service_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;
}

@Entity('interview_details')
export class InterviewDetail extends BaseEntity {
  @Column({ type: 'uuid' })
  job_posting_id: string;

  // Required link to a specific candidate application
  // Interviews can only be scheduled for candidates who have applied
  // FK and index created via migration; kept as plain column here to avoid circular deps
  @Column({ type: 'uuid' })
  job_application_id: string;

  @Column({ type: 'date', nullable: true })
  interview_date_ad?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  interview_date_bs?: string;

  @Column({ type: 'time', nullable: true })
  interview_time?: string;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_person?: string;

  @Column({ type: 'text', array: true, nullable: true })
  required_documents?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, posting => posting.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;

  @ManyToOne(() => JobApplication, application => application.interview_details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_application_id' })
  job_application: JobApplication;

  @OneToMany(() => InterviewExpense, expense => expense.interview, { cascade: true })
  expenses: InterviewExpense[];
}

@Entity('interview_expenses')
export class InterviewExpense extends BaseEntityCreatedOnly {
  @Column({ type: 'uuid' })
  interview_id: string;

  @Column({
    type: 'enum',
    enum: ['visa_fee', 'work_permit', 'medical_exam', 'insurance', 'air_ticket', 'orientation_training', 'document_processing', 'service_charge', 'welfare_fund', 'other']
  })
  expense_type: string;

  @Column({
    type: 'enum',
    enum: ['company', 'worker', 'shared', 'not_applicable', 'agency']
  })
  who_pays: string;

  @Column({ type: 'boolean', default: false })
  is_free: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'boolean', default: false })
  refundable: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => InterviewDetail, interview => interview.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interview_id' })
  interview: InterviewDetail;
}

 
