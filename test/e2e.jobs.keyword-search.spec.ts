import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Public job keyword search functionality
 * Tests the new GET /jobs/search endpoint with keyword and filters
 */
describe('E2E: Public Job Keyword Search', () => {
  let app: INestApplication;
  let jobIdElectrician: string;
  let jobIdWelder: string;
  let jobIdPlumber: string;

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

  it('creates test job postings with diverse data for keyword search', async () => {
    // Create agencies first
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'ElectroTech Agency', license_number: 'LIC-ELECTRO' })
      .expect(201);
    
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'WeldMaster Recruiters', license_number: 'LIC-WELD' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'PlumbPro Solutions', license_number: 'LIC-PLUMB' })
      .expect(201);

    // Get job titles
    const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
    const allTitles = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    const welder = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'welder');
    const plumber = allTitles.find((r: any) => (r.title || '').toLowerCase() === 'plumber');

    // Job 1: Electrician in UAE with ACME Corp
    const bodyElectrician = {
      posting_title: 'Senior Electrical Technician - Dubai Project',
      country: 'UAE',
      city: 'Dubai',
      posting_agency: { name: 'ElectroTech Agency', license_number: 'LIC-ELECTRO' },
      employer: { company_name: 'ACME Engineering Corp', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Electrician', 
          vacancies: { male: 3, female: 1 }, 
          salary: { 
            monthly_amount: 2500, 
            currency: 'AED',
            converted: [
              { amount: 680, currency: 'USD' },
              { amount: 90000, currency: 'NPR' }
            ]
          } 
        },
      ],
      canonical_title_ids: [electrician?.id].filter(Boolean),
      skills: ['electrical-wiring', 'industrial-systems'],
      education_requirements: ['technical-diploma'],
    } as any;

    const resElectrician = await request(app.getHttpServer())
      .post('/agencies/LIC-ELECTRO/job-postings')
      .send(bodyElectrician)
      .expect(201);
    jobIdElectrician = resElectrician.body.id;

    // Job 2: Welder in Qatar with Beta Industries
    const bodyWelder = {
      posting_title: 'Skilled Welder for Construction',
      country: 'Qatar',
      city: 'Doha',
      posting_agency: { name: 'WeldMaster Recruiters', license_number: 'LIC-WELD' },
      employer: { company_name: 'Beta Construction Ltd', country: 'Qatar', city: 'Doha' },
      contract: { period_years: 3, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Welder', 
          vacancies: { male: 5, female: 0 }, 
          salary: { 
            monthly_amount: 3000, 
            currency: 'QAR',
            converted: [
              { amount: 825, currency: 'USD' },
              { amount: 110000, currency: 'NPR' }
            ]
          } 
        },
      ],
      canonical_title_ids: [welder?.id].filter(Boolean),
      skills: ['arc-welding', 'mig-welding'],
    } as any;

    const resWelder = await request(app.getHttpServer())
      .post('/agencies/LIC-WELD/job-postings')
      .send(bodyWelder)
      .expect(201);
    jobIdWelder = resWelder.body.id;

    // Job 3: Plumber in UAE with ACME Corp (same employer as electrician)
    const bodyPlumber = {
      posting_title: 'Plumbing Specialist - ACME Projects',
      country: 'UAE',
      city: 'Abu Dhabi',
      posting_agency: { name: 'PlumbPro Solutions', license_number: 'LIC-PLUMB' },
      employer: { company_name: 'ACME Engineering Corp', country: 'UAE', city: 'Abu Dhabi' },
      contract: { period_years: 2, hours_per_day: 8, days_per_week: 6 },
      positions: [
        { 
          title: 'Plumber', 
          vacancies: { male: 2, female: 0 }, 
          salary: { 
            monthly_amount: 2000, 
            currency: 'AED',
            converted: [
              { amount: 545, currency: 'USD' },
              { amount: 72000, currency: 'NPR' }
            ]
          } 
        },
      ],
      canonical_title_ids: [plumber?.id].filter(Boolean),
      skills: ['pipe-fitting', 'drainage-systems'],
    } as any;

    const resPlumber = await request(app.getHttpServer())
      .post('/agencies/LIC-PLUMB/job-postings')
      .send(bodyPlumber)
      .expect(201);
    jobIdPlumber = resPlumber.body.id;
  });

  it('searches jobs by keyword: "electrician" should find electrician job', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ keyword: 'electrician' })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.search.keyword).toBe('electrician');
    
    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdElectrician);
    expect(ids).not.toContain(jobIdWelder);
    expect(ids).not.toContain(jobIdPlumber);
  });

  it('searches jobs by keyword: "ACME" should find both ACME jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ keyword: 'ACME' })
      .expect(200);

    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdElectrician);
    expect(ids).toContain(jobIdPlumber);
    expect(ids).not.toContain(jobIdWelder);
    
    // Verify employer information - check for our specific ACME jobs
    const ourAcmeJobs = res.body.data.filter((job: any) => 
      job.employer?.company_name === 'ACME Engineering Corp'
    );
    expect(ourAcmeJobs.length).toBeGreaterThanOrEqual(2);
  });

  it('searches jobs by keyword: "WeldMaster" should find welder job by agency name', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ keyword: 'WeldMaster' })
      .expect(200);

    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdWelder);
    expect(ids).not.toContain(jobIdElectrician);
    expect(ids).not.toContain(jobIdPlumber);
  });

  it('filters jobs by country: UAE should return our UAE jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ country: 'UAE' })
      .expect(200);

    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdElectrician);
    expect(ids).toContain(jobIdPlumber);
    expect(ids).not.toContain(jobIdWelder);
    
    // Verify that all returned jobs are from UAE
    const uaeJobs = res.body.data.filter((job: any) => job.country === 'UAE');
    expect(uaeJobs.length).toBe(res.body.data.length);
    
    expect(res.body.search.filters.country).toBe('UAE');
  });

  it('filters jobs by salary range: min 2200 AED should return electrician job', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ 
        min_salary: 2200,
        currency: 'AED'
      })
      .expect(200);

    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdElectrician); // 2500 AED
    expect(ids).not.toContain(jobIdPlumber); // 2000 AED
    expect(ids).not.toContain(jobIdWelder); // QAR currency
  });

  it('combines keyword and filters: "ACME" + UAE should return both ACME jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ 
        keyword: 'ACME',
        country: 'UAE'
      })
      .expect(200);

    const ids = res.body.data.map((job: any) => job.id);
    expect(ids).toContain(jobIdElectrician);
    expect(ids).toContain(jobIdPlumber);
    expect(ids).not.toContain(jobIdWelder);
    
    expect(res.body.search.keyword).toBe('ACME');
    expect(res.body.search.filters.country).toBe('UAE');
  });

  it('sorts jobs by salary descending', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ 
        sort_by: 'salary',
        order: 'desc'
      })
      .expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    
    // Check that salaries are in descending order (within same currency)
    const aedJobs = res.body.data.filter((job: any) => 
      job.positions?.[0]?.salary?.currency === 'AED'
    );
    
    if (aedJobs.length > 1) {
      for (let i = 0; i < aedJobs.length - 1; i++) {
        const current = aedJobs[i].positions[0].salary.monthly_amount;
        const next = aedJobs[i + 1].positions[0].salary.monthly_amount;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it('includes salary conversions in search results', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ keyword: 'electrician' })
      .expect(200);

    const electricianJob = res.body.data.find((job: any) => job.id === jobIdElectrician);
    expect(electricianJob).toBeDefined();
    expect(electricianJob.positions[0].salary.converted).toBeDefined();
    expect(Array.isArray(electricianJob.positions[0].salary.converted)).toBe(true);
    
    const conversions = electricianJob.positions[0].salary.converted;
    const usdConversion = conversions.find((c: any) => c.currency === 'USD');
    const nprConversion = conversions.find((c: any) => c.currency === 'NPR');
    
    expect(usdConversion?.amount).toBe(680);
    expect(nprConversion?.amount).toBe(90000);
  });

  it('handles pagination correctly', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ 
        page: 1,
        limit: 2
      })
      .expect(200);

    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
  });

  it('returns empty results for non-matching keyword', async () => {
    const res = await request(app.getHttpServer())
      .get('/jobs/search')
      .query({ keyword: 'nonexistent' })
      .expect(200);

    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.search.keyword).toBe('nonexistent');
  });
});
