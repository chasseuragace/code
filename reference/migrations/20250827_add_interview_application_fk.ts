import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewApplicationFk1756339200000 implements MigrationInterface {
  name = 'AddInterviewApplicationFk1756339200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Execute only if both base tables exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.interview_details') IS NOT NULL AND to_regclass('public.job_applications') IS NOT NULL THEN
          -- 1) Add nullable column if not exists
          ALTER TABLE interview_details
          ADD COLUMN IF NOT EXISTS job_application_id uuid NULL;

          -- 2) Create index to speed up lookups
          CREATE INDEX IF NOT EXISTS idx_interview_details_job_application
          ON interview_details (job_application_id);

          -- 3) Add FK with ON DELETE SET NULL to decouple deletions
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_interview_details_job_application'
          ) THEN
            ALTER TABLE interview_details
            ADD CONSTRAINT fk_interview_details_job_application
            FOREIGN KEY (job_application_id)
            REFERENCES job_applications(id)
            ON DELETE SET NULL;
          END IF;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE interview_details
      DROP CONSTRAINT IF EXISTS fk_interview_details_job_application
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_interview_details_job_application
    `);
    await queryRunner.query(`
      ALTER TABLE interview_details
      DROP COLUMN IF EXISTS job_application_id
    `);
  }
}
