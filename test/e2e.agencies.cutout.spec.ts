import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import { join } from 'path';
import { AppModule } from 'src/app.module';

/**
 * E2E: Upload/remove cutout image for a job posting
 */
describe('E2E: agencies cutout upload/remove', () => {
  let app: INestApplication;
  let postingId: string;
  const license = 'LIC-E2E-CUTOUT-0001';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Serve static files for testing cutout public URLs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NestExpressApplication } = require('@nestjs/platform-express');
    (app as unknown as InstanceType<typeof NestExpressApplication>)?.useStaticAssets?.(join(process.cwd(), 'public'), { prefix: '/public/' });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('creates agency', async () => {
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'Cutout Agency', license_number: license })
      .expect(201);
  });

  it('creates job posting to receive cutout', async () => {
    const body = {
      posting_title: 'Cutout Posting',
      country: 'UAE',
      employer: { company_name: 'Cutout Co', country: 'UAE' },
      contract: { period_years: 1 },
      positions: [ { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } } ],
    };
    const res = await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings`)
      .send(body)
      .expect(201);
    postingId = res.body.id;
  });

  let lastCutoutUrl: string | undefined;
  let postingId2: string | undefined;
  let lastCutoutUrl2: string | undefined;

  it('uploads cutout image and updates cutout_url', async () => {
    const filePath = path.resolve(process.cwd(), 'reference', 'logo.svg');
    const res = await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings/${postingId}/cutout`)
      .attach('file', filePath)
      .expect(201);
    expect(res.body).toHaveProperty('cutout_url');

    const getRes = await request(app.getHttpServer())
      .get(`/agencies/${license}/job-postings/${postingId}`)
      .expect(200);
    expect(getRes.body.cutout_url).toBeTruthy();
    lastCutoutUrl = getRes.body.cutout_url as string;
  });

  it('removes cutout and clears cutout_url', async () => {
    await request(app.getHttpServer())
      .delete(`/agencies/${license}/job-postings/${postingId}/cutout`)
      .expect(200);

    const getRes = await request(app.getHttpServer())
      .get(`/agencies/${license}/job-postings/${postingId}`)
      .expect(200);
    expect(getRes.body.cutout_url).toBeNull();

    // Since we did not pass deleteFile=true, the file should still be present on disk
    if (lastCutoutUrl) {
      const relPath = lastCutoutUrl.replace(/^\//, '');
      const absPath = path.resolve(process.cwd(), relPath);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      expect(fs.existsSync(absPath)).toBe(true);
    }
  });

  it('creates second posting, uploads cutout, then permanently deletes file', async () => {
    // Create second posting
    const body = {
      posting_title: 'Cutout Posting 2',
      country: 'UAE',
      employer: { company_name: 'Cutout Co 2', country: 'UAE' },
      contract: { period_years: 1 },
      positions: [ { title: 'Worker', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED' } } ],
    };
    const resCreate = await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings`)
      .send(body)
      .expect(201);
    postingId2 = resCreate.body.id;

    // Upload cutout for second posting
    const filePath = path.resolve(process.cwd(), 'reference', 'logo.svg');
    await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings/${postingId2}/cutout`)
      .attach('file', filePath)
      .expect(201);

    const getRes2 = await request(app.getHttpServer())
      .get(`/agencies/${license}/job-postings/${postingId2}`)
      .expect(200);
    lastCutoutUrl2 = getRes2.body.cutout_url as string;
    expect(lastCutoutUrl2).toBeTruthy();

    // Permanently delete the file (deleteFile=true)
    await request(app.getHttpServer())
      .delete(`/agencies/${license}/job-postings/${postingId2}/cutout?deleteFile=true`)
      .expect(200);

    // DB field cleared
    const getAfterDelete = await request(app.getHttpServer())
      .get(`/agencies/${license}/job-postings/${postingId2}`)
      .expect(200);
    expect(getAfterDelete.body.cutout_url).toBeNull();

    // File should be gone
    if (lastCutoutUrl2) {
      await request(app.getHttpServer())
        .get(lastCutoutUrl2)
        .expect(404);
    }
  });
});
