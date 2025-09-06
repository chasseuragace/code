import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidate_preferences')
@Index(['candidate_id', 'title'], { unique: true })
export class CandidatePreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  candidate_id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'int' })
  priority!: number; // 1-based; lower means higher priority

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
