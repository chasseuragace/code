import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JobPostingService, ExpenseService, InterviewService, AnnouncementType, OvertimePolicy, ProvisionType, ExpensePayer, ExpenseType } from '../modules/domain/domain.service';
import { JobTitle } from '../modules/job-title/job-title.entity';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jobSvc = app.get(JobPostingService);
  const expSvc = app.get(ExpenseService);
  const intSvc = app.get(InterviewService);
  const dataSource = app.get(DataSource);

  // Seed Job Titles from src/seed/jobs.seed.json
  try {
    const seedFile = path.resolve(process.cwd(), 'src/seed/jobs.seed.json');
    const raw = fs.readFileSync(seedFile, 'utf-8');
    const rows: Array<{ title: string; rank: number; is_active?: boolean; difficulty?: string; skills_summary?: string; description?: string; }> = JSON.parse(raw);
    if (!Array.isArray(rows)) throw new Error('jobs.seed.json must contain an array');
    const repo = dataSource.getRepository(JobTitle);
    // Upsert on unique title
    await repo.upsert(
      rows.map(r => repo.create({
        title: r.title,
        rank: r.rank,
        is_active: r.is_active ?? true,
        difficulty: r.difficulty,
        skills_summary: r.skills_summary,
        description: r.description,
      })),
      ['title'],
    );
    console.log(`Seeded job_titles: ${rows.length}`);
  } catch (e) {
    console.warn('Job titles seeding skipped or failed:', e instanceof Error ? e.message : e);
  }

  // Create a single end-to-end JobPosting -> Contract -> Positions (+ conversions)
  const posting = await jobSvc.createJobPosting({
    posting_title: 'Skilled Workers for ACME Co.',
    country: 'UAE',
    city: 'Dubai',
    lt_number: 'LT-001',
    chalani_number: 'CH-2025-08',
    approval_date_bs: '2082-05-05',
    approval_date_ad: new Date().toISOString().slice(0, 10),
    posting_date_ad: new Date().toISOString().slice(0, 10),
    posting_date_bs: '2082-05-10',
    announcement_type: AnnouncementType.FULL_AD,
    notes: 'Seeded job posting for smoke testing',
    posting_agency: {
      name: 'Global Recruiters',
      license_number: 'LIC-12345',
      address: 'Kathmandu',
      phones: ['+977-1-5555555'],
      emails: ['contact@globalrecruiters.example.com'],
      website: 'https://globalrecruiters.example.com',
    },
    employer: {
      company_name: 'ACME Co.',
      country: 'UAE',
      city: 'Dubai',
    },
    contract: {
      period_years: 2,
      renewable: true,
      hours_per_day: 8,
      days_per_week: 6,
      overtime_policy: OvertimePolicy.PAID,
      weekly_off_days: 1,
      food: ProvisionType.FREE,
      accommodation: ProvisionType.FREE,
      transport: ProvisionType.PAID,
      annual_leave_days: 14,
    },
    positions: [
      {
        title: 'Welder',
        vacancies: { male: 5, female: 0 },
        salary: {
          monthly_amount: 1500,
          currency: 'AED',
          converted: [
            { amount: 54000, currency: 'NPR' },
          ],
        },
        hours_per_day_override: 8,
        days_per_week_override: 6,
        overtime_policy_override: OvertimePolicy.PAID,
        weekly_off_days_override: 1,
        food_override: ProvisionType.FREE,
        accommodation_override: ProvisionType.FREE,
        transport_override: ProvisionType.PAID,
        position_notes: 'Hot work PPE mandatory',
      },
      {
        title: 'Electrician',
        vacancies: { male: 3, female: 1 },
        salary: {
          monthly_amount: 1600,
          currency: 'AED',
          converted: [
            { amount: 57600, currency: 'NPR' },
          ],
        },
      },
    ],
  });

  // Add expenses for the posting
  await expSvc.createMedicalExpense(posting.id, {
    domestic: { who_pays: ExpensePayer.WORKER, is_free: false, amount: 2000, currency: 'NPR', notes: 'Pre-departure check' },
    foreign: { who_pays: ExpensePayer.COMPANY, is_free: true, notes: 'On-arrival screening' },
  });
  await expSvc.createInsuranceExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true, coverage_amount: 100000, coverage_currency: 'AED', notes: 'Health insurance' });
  await expSvc.createTravelExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true, amount: 1200, currency: 'AED' });
  await expSvc.createVisaPermitExpense(posting.id, { who_pays: ExpensePayer.COMPANY, is_free: true, refundable: false, notes: 'Work permit and visa covered' });
  await expSvc.createTrainingExpense(posting.id, { who_pays: ExpensePayer.AGENCY, is_free: false, amount: 5000, currency: 'NPR', duration_days: 3, mandatory: true });
  await expSvc.createWelfareServiceExpense(posting.id, { welfare: { who_pays: ExpensePayer.WORKER, amount: 1500, currency: 'NPR', refundable: false, notes: 'Welfare fund' }, service: { who_pays: ExpensePayer.AGENCY, amount: 3000, currency: 'NPR', service_type: 'Processing', refundable: false } });

  // Note: Interviews require a job_application_id (candidate must apply first)
  // Skipping interview creation in seed for now

  console.log('Seed complete (domain smoke).');
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
