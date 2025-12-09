import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddViewCountToJobPostings1733700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'job_postings',
      new TableColumn({
        name: 'view_count',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('job_postings', 'view_count');
  }
}
