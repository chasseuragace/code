import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blocked_phones')
export class BlockedPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  phone: string; // E.164

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string | null;
}
