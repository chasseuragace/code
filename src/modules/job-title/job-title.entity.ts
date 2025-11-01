import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('job_titles')
export class JobTitle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, unique: true })
  title: string;

  @Column({ type: 'integer' })
  rank: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty?: string;

  @Column({ type: 'text', nullable: true })
  skills_summary?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
