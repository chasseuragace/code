import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCandidateFilterIndexes20250820 implements MigrationInterface {
  name = 'AddCandidateFilterIndexes20250820'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_postings_active_date ON job_postings (is_active, posting_date_ad DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_postings_country ON job_postings (country)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_positions_contract ON job_positions (job_contract_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_positions_salary ON job_positions (job_contract_id, monthly_salary_amount, salary_currency)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_positions_title_lower ON job_positions (LOWER(title))`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_salary_conversions_position ON salary_conversions (job_position_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_salary_conversions_currency_amount ON salary_conversions (converted_currency, converted_amount)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_salary_conversions_currency_amount`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_salary_conversions_position`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_positions_title_lower`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_positions_salary`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_positions_contract`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_postings_country`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_postings_active_date`);
  }
}
