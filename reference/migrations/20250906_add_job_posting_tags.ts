import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobPostingTags1693999999999 implements MigrationInterface {
  name = 'AddJobPostingTags1693999999999'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS skills JSONB`);
    await queryRunner.query(`ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS education_requirements JSONB`);
    await queryRunner.query(`ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS experience_requirements JSONB`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS job_posting_titles (
        job_posting_id UUID NOT NULL,
        job_title_id UUID NOT NULL,
        CONSTRAINT pk_job_posting_titles PRIMARY KEY (job_posting_id, job_title_id),
        CONSTRAINT fk_jpt_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
        CONSTRAINT fk_jpt_title FOREIGN KEY (job_title_id) REFERENCES job_titles(id) ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_postings_skills ON job_postings USING GIN (skills)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_postings_education ON job_postings USING GIN (education_requirements)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_posting_titles_posting_id ON job_posting_titles (job_posting_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_posting_titles_title_id ON job_posting_titles (job_title_id)`);

    await queryRunner.query(`COMMENT ON COLUMN job_postings.skills IS 'Array of skill tags for the job posting'`);
    await queryRunner.query(`COMMENT ON COLUMN job_postings.education_requirements IS 'Array of education requirement tags'`);
    await queryRunner.query(`COMMENT ON COLUMN job_postings.experience_requirements IS 'Experience requirements object with min/max years and level'`);
    await queryRunner.query(`COMMENT ON TABLE job_posting_titles IS 'Many-to-many relationship between job postings and canonical job titles'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posting_titles_title_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posting_titles_posting_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_postings_education`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_postings_skills`);

    await queryRunner.query(`DROP TABLE IF EXISTS job_posting_titles`);

    await queryRunner.query(`ALTER TABLE job_postings DROP COLUMN IF EXISTS experience_requirements`);
    await queryRunner.query(`ALTER TABLE job_postings DROP COLUMN IF EXISTS education_requirements`);
    await queryRunner.query(`ALTER TABLE job_postings DROP COLUMN IF EXISTS skills`);
  }
}
