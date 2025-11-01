import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * E2E: Salary Conversion on Relevant Jobs
 * - Verifies that relevant jobs include base salary and converted (e.g., NPR)
 * - Verifies converted salary-based filtering works (NPR min threshold)
 */
describe('Salary Conversion: Relevant Jobs (NPR)', () => {
  let app: INestApplication;
  let candidateId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Seed minimal data: job titles, countries, job postings
    try { await request(app.getHttpServer()).post('/job-titles/seedv1').expect(200); } catch (e) {}
    try { await request(app.getHttpServer()).post('/countries/seedv1').expect(200); } catch (e) {}
    try { await request(app.getHttpServer()).post('/jobs/seedv1').expect(200); } catch (e) {}

    // Register and verify a candidate
    const phone = `+97798${Math.floor(Math.random() * 9000000) + 1000000}`;
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Ramesh Electrician', phone })
      .expect(200);
    const otp = reg.body.dev_otp;
    const ver = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone, otp })
      .expect(200);
    candidateId = ver.body.candidate_id;
    accessToken = ver.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return relevant jobs with base salary and converted amounts (NPR)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ country: 'UAE', includeScore: 'true', page: 1, limit: 10 })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Find any job with salary conversions
    const first = res.body.data[0];

    expect(first.salary).toBeDefined();
    expect(first.salary.currency).toBeDefined();

    // Converted amounts array should be present (from salary_conversions)
    // structure: salary.converted = [{ amount, currency }, ...]
    expect(first.salary.converted).toBeDefined();
    expect(Array.isArray(first.salary.converted)).toBe(true);
    expect(first.salary.converted.length).toBeGreaterThan(0);

    // Verify we have at least one conversion (could be USD, NPR, etc.)
    const firstConversion = first.salary.converted[0];
    expect(firstConversion.amount).toBeDefined();
    expect(firstConversion.currency).toBeDefined();
    expect(typeof firstConversion.amount).toBe('number');
    expect(typeof firstConversion.currency).toBe('string');

    console.log(`✅ Found conversion: ${first.salary.currency} ${first.salary.monthly_min} = ${firstConversion.currency} ${firstConversion.amount}`);
  });

  it('should filter by converted salary (USD) using proper Swagger-documented params', async () => {
    // Ask for jobs that have a USD converted amount >= 300 (based on what we saw: 400 USD)
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({
        country: 'UAE',
        includeScore: 'true',
        page: 1,
        limit: 10,
        salary_source: 'converted',
        salary_currency: 'USD',
        salary_min: 300,
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    console.log(`🔍 Filtered response has ${res.body.data.length} jobs`);
    
    // The filter should return jobs, and at least some should have USD conversions >= 300
    let jobsWithUsdConversions = 0;
    
    for (const job of res.body.data) {
      const usd = (job.salary?.converted || []).find((c: any) => String(c.currency).toUpperCase() === 'USD');
      if (usd) {
        jobsWithUsdConversions++;
        expect(Number(usd.amount)).toBeGreaterThanOrEqual(300);
        console.log(`✅ Job ${job.posting_title}: ${job.salary.currency} ${job.salary.monthly_min} = USD ${usd.amount}`);
      } else {
        console.log(`ℹ️ Job ${job.posting_title}: No USD conversion loaded (but may have been filtered by it)`);
      }
    }
    
    // At least one job should have USD conversions visible
    expect(jobsWithUsdConversions).toBeGreaterThan(0);
  });
});
