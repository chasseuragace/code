import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // ISO 3166-1 alpha-2 or alpha-3 country code
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 3 })
  country_code: string;

  @Column({ type: 'varchar', length: 100 })
  country_name: string;

  // ISO 4217 currency code and human-readable currency name
  @Column({ type: 'varchar', length: 3 })
  currency_code: string;

  @Column({ type: 'varchar', length: 100 })
  currency_name: string;

  // FX rate multiplier to NPR (1 unit of currency_code -> npr_multiplier NPR)
  @Column({ type: 'decimal', precision: 14, scale: 6 })
  npr_multiplier: string; // stored as string per TypeORM decimal best practice
}
