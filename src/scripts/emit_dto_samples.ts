import * as fs from 'fs';
import * as path from 'path';

// Output directory inside src (mounted into the container)
const OUT_DIR = path.resolve(__dirname, '..', 'resource', 'sample', 'data');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(fileName: string, data: unknown) {
  ensureDir(OUT_DIR);
  const fullPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(process.cwd(), fullPath)}`);
}

function main() {
  // Job Posting Create DTO sample
  const jobPostingCreateSample = {
    posting_title: 'Waiter/Waitress',
    country: 'AE',
    city: 'Dubai',
    lt_number: 'LT-2025-0001',
    chalani_number: 'CH-7788',
    approval_date_bs: '2082-05-10',
    approval_date_ad: '2025-08-26',
    posting_date_ad: '2025-09-11',
    posting_date_bs: '2082-05-26',
    announcement_type: 'full_ad',
    notes: 'Immediate hiring for reputable hotel group',
    posting_agency: {
      name: 'Udaan Recruitment',
      license_number: 'LIC-12345',
      address: 'Kathmandu, Nepal',
      phones: ['+977-1-5550000'],
      emails: ['info@udaan.example'],
      website: 'https://udaan.example'
    },
    employer: {
      company_name: 'Gulf Hospitality LLC',
      country: 'AE',
      city: 'Dubai'
    },
    contract: {
      period_years: 2,
      renewable: true,
      hours_per_day: 8,
      days_per_week: 6,
      overtime_policy: 'paid',
      weekly_off_days: 1,
      food: 'free',
      accommodation: 'free',
      transport: 'free',
      annual_leave_days: 21
    },
    positions: [
      {
        title: 'Waiter',
        vacancies: { male: 10, female: 5 },
        salary: {
          monthly_amount: 1800,
          currency: 'AED',
          converted: [
            { amount: 650, currency: 'USD' }
          ]
        },
        hours_per_day_override: 8,
        days_per_week_override: 6,
        overtime_policy_override: 'paid',
        weekly_off_days_override: 1,
        food_override: 'free',
        accommodation_override: 'free',
        transport_override: 'free',
        position_notes: 'Hotel dining service'
      }
    ],
    // Optional tagging support used by CreateJobPostingWithTagsDto
    skills: ['customer service', 'english communication'],
    education_requirements: ['High School Diploma'],
    experience_requirements: {
      min_years: 1,
      preferred_years: 2,
      domains: ['hospitality']
    },
    // Optional canonical titles (names or ids)
    canonical_title_names: ['Waiter', 'Waitress']
  };

  // Job Posting tag update sample (subset for PATCH-like flows)
  const jobPostingUpdateTagsSample = {
    skills: ['customer service', 'english communication', 'POS handling'],
    education_requirements: ['High School Diploma'],
    experience_requirements: { min_years: 1, preferred_years: 3, domains: ['hospitality'] },
    canonical_title_ids: ['11111111-1111-1111-1111-111111111111']
  };

  // Job Title entity sample
  const jobTitleSample = {
    id: '00000000-0000-0000-0000-000000000000',
    title: 'Waiter',
    rank: 10,
    is_active: true,
    difficulty: 'entry',
    skills_summary: 'Customer service, communication, basic POS',
    description: 'Provides table service in hospitality environments.',
    created_at: '2025-09-11T10:00:00.000Z',
    updated_at: '2025-09-11T10:00:00.000Z'
  };

  // Candidate Preference entity sample
  const candidatePreferenceSample = {
    id: '22222222-2222-2222-2222-222222222222',
    candidate_id: '33333333-3333-3333-3333-333333333333',
    title: 'Waiter',
    priority: 1,
    created_at: '2025-09-11T10:00:00.000Z',
    updated_at: '2025-09-11T10:00:00.000Z'
  };

  writeJson('jobs.create.sample.json', jobPostingCreateSample);
  writeJson('jobs.update-tags.sample.json', jobPostingUpdateTagsSample);
  writeJson('job-titles.sample.json', jobTitleSample);
  writeJson('candidate-preferences.sample.json', candidatePreferenceSample);
}

main();
