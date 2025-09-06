import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobApplications20250827 implements MigrationInterface {
  name = 'CreateJobApplications20250827'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id uuid PRIMARY KEY,
        candidate_id uuid NOT NULL,
        job_posting_id uuid NOT NULL,
        status varchar NOT NULL,
        history_blob jsonb NOT NULL DEFAULT '[]'::jsonb,
        withdrawn_at timestamp with time zone NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_job_applications_candidate_posting ON job_applications (candidate_id, job_posting_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_created ON job_applications (candidate_id, created_at DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_applications_posting ON job_applications (job_posting_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_applications_posting`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_applications_candidate_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_job_applications_candidate_posting`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_applications`);
  }
}
