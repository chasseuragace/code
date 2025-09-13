import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Auth register/verify for candidate with dev OTP
 */
describe('E2E: auth register + verify (dev OTP)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers a candidate and returns dev_otp, then verifies and returns token+ids', async () => {
    const uniq = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
    const phone = `+97798${uniq}`;

    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Auth Test User', phone })
      .expect(200);

    expect(typeof reg.body?.dev_otp).toBe('string');
    const dev_otp = reg.body.dev_otp as string;

    const ver = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone, otp: dev_otp })
      .expect(200);

    expect(typeof ver.body?.token).toBe('string');
    expect(typeof ver.body?.user_id).toBe('string');
    expect(typeof ver.body?.candidate_id).toBe('string');
  });
});
