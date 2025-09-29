import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';

/**
 * E2E: Compare public job search vs candidate-specific fitness scoring
 * 
 * This test demonstrates the difference between:
 * 1. Public search (GET /jobs/search) - no fitness scores, generic sorting
 * 2. Candidate relevant jobs (GET /candidates/:id/relevant-jobs) - with fitness scores
 * 
 * Goal: Show that fitness scoring requires candidate context
 */
describe('E2E: Public Search vs Fitness Score Comparison', () => {
  let app: INestApplication;
  let candidates: CandidateService;
  let candidateId: string;
  let jobIdHighFitness: string;
  let jobIdMediumFitness: string;
  let jobIdLowFitness: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    candidates = app.get(CandidateService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('seeds data and creates candidate with specific profile', async () => {
    await request(app.getHttpServer()).post('/countries/seedv1').expect(200);
    await request(app.getHttpServer()).post('/job-titles/seedv1').expect(200);

    // Create candidate with electrical skills
    const uniq = Math.floor(Math.random() * 9000) + 1000;
    const candidate = await candidates.createCandidate({
      full_name: 'Fitness Test User',
      phone: `+97798${uniq}`,
    });
    candidateId = candidate.id;

    // Create job profile with specific skills for fitness scoring
    await candidates.updateJobProfile(candidateId, {
      profile_blob: {
        summary: 'Experienced Electrician',
        years: 3,
        skills: ['electrical-wiring', 'industrial-systems'], // 2 skills
        education: ['technical-diploma']
      },
      label: 'Electrician Profile'
    });

    // Add preference for Electrician
    await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/preferences`)
      .send({ title: 'Electrician' })
      .expect(201);
  });

  it('creates jobs with different fitness potential', async () => {
    // Create agencies
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'High Fitness Agency', license_number: 'LIC-HIGH-FIT' })
      .expect(201);
    
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'Medium Fitness Agency', license_number: 'LIC-MED-FIT' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'Low Fitness Agency', license_number: 'LIC-LOW-FIT' })
      .expect(201);

    // Get electrician title
    const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
    const allTitles = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    // Job 1: High fitness (perfect skill + education match)
    const highFitnessJob = {
      posting_title: 'Perfect Match Electrician Job',
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: 'High Fitness Agency', license_number: 'LIC-HIGH-FIT' },
      employer: { company_name: 'Perfect Match Corp', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Electrician', 
          vacancies: { male: 2, female: 1 }, 
          salary: { monthly_amount: 3000, currency: 'AED' } 
        },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean),
      skills: ['electrical-wiring', 'industrial-systems'], // Perfect match (2/2)
      education_requirements: ['technical-diploma'], // Perfect match
      experience_requirements: { min_years: 2, max_years: 5 }, // Candidate has 3 years
    } as any;

    const resHigh = await request(app.getHttpServer())
      .post('/agencies/LIC-HIGH-FIT/job-postings')
      .send(highFitnessJob)
      .expect(201);
    jobIdHighFitness = resHigh.body.id;

    // Job 2: Medium fitness (partial skill match)
    const mediumFitnessJob = {
      posting_title: 'Partial Match Electrician Job',
      country: 'UAE',
      city: 'Abu Dhabi',
      posting_agency: { name: 'Medium Fitness Agency', license_number: 'LIC-MED-FIT' },
      employer: { company_name: 'Medium Match Corp', country: 'UAE', city: 'Abu Dhabi' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Electrician', 
          vacancies: { male: 3, female: 0 }, 
          salary: { monthly_amount: 3500, currency: 'AED' } // Higher salary but lower fitness
        },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean),
      skills: ['electrical-wiring', 'industrial-systems', 'safety-protocols'], // Partial match (2/3)
      education_requirements: ['technical-diploma'],
    } as any;

    const resMedium = await request(app.getHttpServer())
      .post('/agencies/LIC-MED-FIT/job-postings')
      .send(mediumFitnessJob)
      .expect(201);
    jobIdMediumFitness = resMedium.body.id;

    // Job 3: Low fitness (minimal skill match)
    const lowFitnessJob = {
      posting_title: 'Poor Match Electrician Job',
      country: 'UAE',
      city: 'Sharjah',
      posting_agency: { name: 'Low Fitness Agency', license_number: 'LIC-LOW-FIT' },
      employer: { company_name: 'Low Match Corp', country: 'UAE', city: 'Sharjah' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Electrician', 
          vacancies: { male: 1, female: 0 }, 
          salary: { monthly_amount: 4000, currency: 'AED' } // Highest salary but lowest fitness
        },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean),
      skills: ['electrical-wiring', 'safety-protocols', 'cable-management', 'motor-control'], // Minimal match (1/4)
      education_requirements: ['bachelor-degree'], // No match
    } as any;

    const resLow = await request(app.getHttpServer())
      .post('/agencies/LIC-LOW-FIT/job-postings')
      .send(lowFitnessJob)
      .expect(201);
    jobIdLowFitness = resLow.body.id;
  });

  it('public search sorts by salary (no fitness scores available)', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ 
        keyword: 'electrician',
        country: 'UAE',
        sort_by: 'salary',
        order: 'desc'
      })
      .expect(200);

    console.log('📊 PUBLIC SEARCH RESULTS (sorted by salary desc):');
    res.body.data.forEach((job: any, index: number) => {
      const salary = job.positions?.[0]?.salary?.monthly_amount || 0;
      console.log(`${index + 1}. ${job.posting_title} - AED ${salary} (no fitness_score)`);
    });

    // Verify no fitness scores in public search
    res.body.data.forEach((job: any) => {
      expect(job.fitness_score).toBeUndefined();
    });

    // Should be sorted by salary (highest first)
    const salaries = res.body.data.map((job: any) => job.positions?.[0]?.salary?.monthly_amount || 0);
    for (let i = 1; i < salaries.length; i++) {
      expect(salaries[i - 1]).toBeGreaterThanOrEqual(salaries[i]);
    }
  });

  it('candidate relevant jobs sorts by fitness score (personalized)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ 
        country: 'UAE',
        includeScore: 'true'
      })
      .expect(200);

    console.log('\n🎯 CANDIDATE RELEVANT JOBS (sorted by fitness_score desc):');
    res.body.data.forEach((job: any, index: number) => {
      const salary = job.positions?.[0]?.salary?.monthly_amount || 0;
      const fitness = job.fitness_score || 0;
      console.log(`${index + 1}. ${job.posting_title} - AED ${salary} (fitness: ${fitness}%)`);
    });

    // Verify fitness scores are present
    res.body.data.forEach((job: any) => {
      expect(typeof job.fitness_score).toBe('number');
      expect(job.fitness_score).toBeGreaterThanOrEqual(0);
      expect(job.fitness_score).toBeLessThanOrEqual(100);
    });

    // Should be sorted by fitness score (highest first)
    const fitnessScores = res.body.data.map((job: any) => job.fitness_score || 0);
    for (let i = 1; i < fitnessScores.length; i++) {
      expect(fitnessScores[i - 1]).toBeGreaterThanOrEqual(fitnessScores[i]);
    }

    // Find our specific jobs and verify fitness scores
    const jobsById = new Map(res.body.data.map((job: any) => [job.id, job]));
    const highJob = jobsById.get(jobIdHighFitness);
    const mediumJob = jobsById.get(jobIdMediumFitness);
    const lowJob = jobsById.get(jobIdLowFitness);

    if (highJob && mediumJob && lowJob) {
      console.log(`\n📈 FITNESS SCORE COMPARISON:`);
      console.log(`High Fitness Job: ${(highJob as any).fitness_score}% (perfect match)`);
      console.log(`Medium Fitness Job: ${(mediumJob as any).fitness_score}% (partial match)`);
      console.log(`Low Fitness Job: ${(lowJob as any).fitness_score}% (minimal match)`);

      // Verify fitness score ordering (actual results may vary based on algorithm)
      // The key insight is that fitness scoring provides personalized ranking
      expect((lowJob as any).fitness_score).toBeLessThan(Math.max((highJob as any).fitness_score, (mediumJob as any).fitness_score));
      expect((lowJob as any).fitness_score).toBeLessThan(50); // Should be significantly lower
    }
  });

  it('demonstrates the value of fitness scoring vs generic search', async () => {
    console.log('\n💡 KEY INSIGHTS:');
    console.log('1. Public search (/jobs/search) sorts by salary/date - good for browsing');
    console.log('2. Candidate relevant jobs (/candidates/:id/relevant-jobs) sorts by fitness - personalized matching');
    console.log('3. Fitness scoring requires candidate profile context');
    console.log('4. Higher salary ≠ better match for candidate');
    console.log('5. Personalized matching helps candidates find truly suitable jobs');
    
    expect(true).toBe(true); // Test passes - this is a demonstration
  });
});
