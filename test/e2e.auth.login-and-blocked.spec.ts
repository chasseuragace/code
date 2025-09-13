import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { BlockedPhone } from 'src/modules/auth/blocked-phone.entity';

/**
 * E2E: Auth login OTP flow and blocked phone enforcement
 */
describe('E2E: auth login + blocked phone', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers then logs in via OTP flow', async () => {
    const uniq = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
    const phone = `+97798${uniq}`;

    // register to create user/candidate
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Login Test User', phone })
      .expect(200);
    expect(typeof reg.body?.dev_otp).toBe('string');

    // start login (issues new OTP)
    const start = await request(app.getHttpServer())
      .post('/login/start')
      .send({ phone })
      .expect(200);
    expect(typeof start.body?.dev_otp).toBe('string');

    // verify login
    const ver = await request(app.getHttpServer())
      .post('/login/verify')
      .send({ phone, otp: start.body.dev_otp })
      .expect(200);
    expect(typeof ver.body?.token).toBe('string');
    expect(typeof ver.body?.user_id).toBe('string');
    expect(typeof ver.body?.candidate_id).toBe('string');
    expect(typeof ver.body?.candidate).toBe('object');
  });

  it('enforces blocked phone on register and login/start', async () => {
    const phone = '+977981234500';
    const repo = dataSource.getRepository(BlockedPhone);
    await repo.upsert({ phone, reason: 'test-block' }, ['phone']);

    await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Blocked User', phone })
      .expect(400);

    await request(app.getHttpServer())
      .post('/login/start')
      .send({ phone })
      .expect(400);
  });
});
