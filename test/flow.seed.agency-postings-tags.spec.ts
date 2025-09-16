import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SeedService } from 'src/modules/seed/seed.service';

/**
 * Focused E2E: Agencies -> Postings -> Tags
 *
 * Setup:
 * - Seed countries, job titles, agencies, and sample postings using SeedService.seedSystem
 * - Use AgencyController HTTP endpoints to list, tag, and verify
 * - Negative: Ensure ownership is enforced on tag updates
 */

describe('Flow: seed agencies -> postings -> tags', () => {
  let app: INestApplication;
  let http: any;
  let seed: SeedService;

  const license = 'LIC-AG-0001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    seed = app.get(SeedService);

    // Seed all required datasets (idempotent)
    await seed.seedSystem({ countries: true, job_titles: true, agencies: true, sample_postings: true });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should update and retrieve tags for a posting belonging to the agency', async () => {
    // List postings for the agency and pick the first one
    const listRes = await request(http)
      .get(`/agencies/${license}/job-postings`)
      .expect(200);

    const rows: Array<{ id: string; posting_title: string }> = Array.isArray(listRes.body) ? listRes.body : [];
    expect(rows.length).toBeGreaterThan(0);
    const postingId = rows[0].id;

    const updatePayload = {
      skills: ['seeded-welder', 'seeded-electrician'],
      education_requirements: ['seeded-diploma'],
      experience_requirements: { min_years: 1, level: 'junior' },
    } as any;

    const patchRes = await request(http)
      .patch(`/agencies/${license}/job-postings/${postingId}/tags`)
      .send(updatePayload)
      .expect(200);

    expect(patchRes.body.id).toBe(postingId);
    expect(patchRes.body.skills).toEqual(expect.arrayContaining(updatePayload.skills));

    // Verify via GET
    const getRes = await request(http)
      .get(`/agencies/${license}/job-postings/${postingId}/tags`)
      .expect(200);

    expect(getRes.body.id).toBe(postingId);
    expect(getRes.body.skills).toEqual(expect.arrayContaining(updatePayload.skills));
    expect(getRes.body.education_requirements).toEqual(expect.arrayContaining(updatePayload.education_requirements));
    expect(getRes.body.experience_requirements?.level).toBe('junior');
  });

  it('should forbid tag update with a mismatched license (ownership enforced)', async () => {
    // Find a posting under LIC-AG-0001
    const listRes = await request(http)
      .get(`/agencies/${license}/job-postings`)
      .expect(200);

    const rows: Array<{ id: string; posting_title: string }> = Array.isArray(listRes.body) ? listRes.body : [];
    expect(rows.length).toBeGreaterThan(0);
    const postingId = rows[0].id;

    // Attempt update with a different license
    const otherLicense = 'LIC-AG-0002';
    await request(http)
      .patch(`/agencies/${otherLicense}/job-postings/${postingId}/tags`)
      .send({ skills: ['should-not-apply'] })
      .expect(403);
  });
});
