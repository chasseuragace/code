import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Candidate relevant jobs over HTTP and public job details
 */
describe('E2E: candidate relevant jobs + public job details', () => {
  let app: INestApplication;
  let jobIdA: string;
  let jobIdB: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('seeds countries and job titles', async () => {
    await request(app.getHttpServer())
      .post('/countries/seedv1')
      .expect(200);

    await request(app.getHttpServer())
      .post('/job-titles/seedv1')
      .expect(200);
  });

  it('creates two postings across countries', async () => {
    // Create agencies first (required by AgencyController)
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'A Agency', license_number: 'LIC-HTTP-A' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'B Agency', license_number: 'LIC-HTTP-B' })
      .expect(201);

    // Resolve canonical title ids for Welder and Electrician
    const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
    const allTitles = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const welder = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'welder');
    const electrician = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    const bodyA = {
      posting_title: 'UAE-Welder-High',
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: 'A Agency', license_number: 'LIC-HTTP-A' },
      employer: { company_name: 'A Co', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6, overtime_policy: 'paid', weekly_off_days: 1 },
      positions: [
        { title: 'Welder', vacancies: { male: 5, female: 0 }, salary: { monthly_amount: 1500, currency: 'AED', converted: [{ amount: 410, currency: 'USD' }, { amount: 55000, currency: 'NPR' }] } },
      ],
      canonical_title_ids: [welder?.id].filter(Boolean),
      skills: ['industrial-wiring', 'electrical-systems'],
      education_requirements: ['technical-diploma'],
      experience_requirements: { min_years: 2 },
    } as any;
    const resA = await request(app.getHttpServer())
      .post('/agencies/LIC-HTTP-A/job-postings')
      .send(bodyA)
      .expect(201);
    jobIdA = resA.body.id;

    const bodyB = {
      posting_title: 'Qatar-Electrician',
      country: 'Qatar',
      city: 'Doha',
      posting_agency: { name: 'B Agency', license_number: 'LIC-HTTP-B' },
      employer: { company_name: 'B Co', country: 'Qatar', city: 'Doha' },
      contract: { period_years: 2 },
      positions: [
        { title: 'Electrician', vacancies: { male: 2, female: 1 }, salary: { monthly_amount: 1000, currency: 'QAR', converted: [{ amount: 275, currency: 'USD' }, { amount: 35000, currency: 'NPR' }] } },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean),
    } as any;
    const resB = await request(app.getHttpServer())
      .post('/agencies/LIC-HTTP-B/job-postings')
      .send(bodyB)
      .expect(201);
    jobIdB = resB.body.id;
  });

  it('creates candidate and job profile, then fetches relevant jobs (UAE filter)', async () => {
    // create candidate
    const uniq = Math.floor(Math.random() * 9000) + 1000; // 4 digits
    const create = await request(app.getHttpServer())
      .post('/candidates')
      .send({ full_name: 'HTTP User', phone: `+9779808${uniq}` })
      .expect(201);
    const candidateId = create.body.id;

    // add preferences via API
    await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/preferences`)
      .send({ title: 'Welder' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/preferences`)
      .send({ title: 'Electrician' })
      .expect(201);

    // fetch relevant jobs filtered by country=UAE
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ country: 'UAE' })
      .expect(200);

    const ids: string[] = res.body.data.map((p: any) => p.id);
    expect(ids).toContain(jobIdA);
    // Qatar job should be filtered out by country
    expect(ids).not.toContain(jobIdB);
  });

  it('fetches public job details and matches core fields', async () => {
    const res = await request(app.getHttpServer())
      .get(`/jobs/${jobIdA}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', jobIdA);
    expect(res.body).toHaveProperty('posting_title', 'UAE-Welder-High');
    expect(res.body).toHaveProperty('country', 'UAE');
    expect(Array.isArray(res.body.positions)).toBe(true);
    const pos = res.body.positions[0];
    expect(pos.title).toBe('Welder');
    expect(pos.salary.currency).toBe('AED');
  });

  it('fetches candidate-context job details with fitness_score', async () => {
    // Create a candidate with overlapping skills/education/experience
    const uniq = Math.floor(Math.random() * 9000) + 1000;
    const create = await request(app.getHttpServer())
      .post('/candidates')
      .send({
        full_name: 'Fit User',
        phone: `+9779807${uniq}`,
        skills: [{ title: 'industrial-wiring', duration_months: 36 }, { title: 'electrical-systems', duration_months: 12 }],
        education: [{ degree: 'technical-diploma' }],
      })
      .expect(201);
    const candidateId = create.body.id;

    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/jobs/${jobIdA}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', jobIdA);
    expect(typeof res.body.fitness_score === 'number').toBe(true);
  });
});
