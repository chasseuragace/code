import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Workflow API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let agencyId: string;
  let candidateId: string;
  let applicationId: string;
  let jobPostingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Workflow Endpoints', () => {
    beforeAll(async () => {
      // Setup: Create agency, job posting, candidate, and application
      // This assumes you have seed data or setup scripts
      
      // For now, we'll use mock IDs - in real tests, you'd create these
      agencyId = 'test-agency-id';
      candidateId = 'test-candidate-id';
      applicationId = 'test-application-id';
      jobPostingId = 'test-job-posting-id';
      
      // Get auth token (mock for now)
      authToken = 'mock-jwt-token';
    });

    describe('GET /workflow/candidates', () => {
      it('should return workflow candidates with pagination', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 15 })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('candidates');
            expect(res.body.data).toHaveProperty('pagination');
            expect(res.body.data).toHaveProperty('analytics');
            expect(Array.isArray(res.body.data.candidates)).toBe(true);
          });
      });

      it('should filter by stage', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ stage: 'shortlisted', page: 1, limit: 15 })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            // All candidates should be in shortlisted stage
            res.body.data.candidates.forEach((candidate: any) => {
              expect(candidate.application.status).toBe('shortlisted');
            });
          });
      });

      it('should filter by job posting', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ job_posting_id: jobPostingId, page: 1, limit: 15 })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            // All candidates should be for the specified job
            res.body.data.candidates.forEach((candidate: any) => {
              expect(candidate.job.id).toBe(jobPostingId);
            });
          });
      });

      it('should search candidates', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: 'John', page: 1, limit: 15 })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });

      it('should return 401 without auth token', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .expect(401);
      });

      it('should validate pagination parameters', () => {
        return request(app.getHttpServer())
          .get('/workflow/candidates')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: -1, limit: 1000 })
          .expect(400);
      });
    });

    describe('PUT /workflow/candidates/:candidateId/stage', () => {
      it('should update candidate from applied to shortlisted', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            application_id: applicationId,
            new_stage: 'shortlisted',
            notes: 'Candidate meets requirements',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.new_stage).toBe('shortlisted');
            expect(res.body.data.previous_stage).toBe('applied');
          });
      });

      it('should update candidate from shortlisted to interview-scheduled with interview details', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            application_id: applicationId,
            new_stage: 'interview-scheduled',
            notes: 'Interview scheduled',
            interview_details: {
              interview_date_ad: '2024-12-15',
              interview_time: '10:00',
              location: 'Agency Office, Kathmandu',
              duration_minutes: 60,
              contact_person: 'HR Manager',
              type: 'In-person',
            },
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.new_stage).toBe('interview-scheduled');
            expect(res.body.data.interview_id).toBeDefined();
          });
      });

      it('should reject invalid stage transition (skipping stages)', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            application_id: applicationId,
            new_stage: 'interview-passed', // Trying to skip from applied
            notes: 'Invalid transition',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Invalid stage transition');
          });
      });

      it('should reject interview-scheduled without interview details', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            application_id: applicationId,
            new_stage: 'interview-scheduled',
            notes: 'Missing interview details',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Interview details are required');
          });
      });

      it('should return 404 for non-existent candidate', () => {
        return request(app.getHttpServer())
          .put('/workflow/candidates/non-existent-id/stage')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            application_id: 'non-existent-app-id',
            new_stage: 'shortlisted',
          })
          .expect(404);
      });

      it('should return 401 without auth token', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .send({
            application_id: applicationId,
            new_stage: 'shortlisted',
          })
          .expect(401);
      });

      it('should validate DTO fields', () => {
        return request(app.getHttpServer())
          .put(`/workflow/candidates/${candidateId}/stage`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            // Missing required fields
            new_stage: 'shortlisted',
          })
          .expect(400);
      });
    });

    describe('GET /workflow/analytics', () => {
      it('should return workflow analytics', () => {
        return request(app.getHttpServer())
          .get('/workflow/analytics')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('total_candidates');
            expect(res.body.data).toHaveProperty('by_stage');
            expect(res.body.data).toHaveProperty('by_job');
            expect(res.body.data).toHaveProperty('conversion_rates');
            expect(typeof res.body.data.total_candidates).toBe('number');
            expect(typeof res.body.data.by_stage).toBe('object');
            expect(Array.isArray(res.body.data.by_job)).toBe(true);
          });
      });

      it('should filter analytics by date range', () => {
        return request(app.getHttpServer())
          .get('/workflow/analytics')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            date_from: '2024-01-01',
            date_to: '2024-12-31',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });

      it('should filter analytics by job posting', () => {
        return request(app.getHttpServer())
          .get('/workflow/analytics')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ job_posting_id: jobPostingId })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });

      it('should return 401 without auth token', () => {
        return request(app.getHttpServer())
          .get('/workflow/analytics')
          .expect(401);
      });
    });

    describe('GET /workflow/stages', () => {
      it('should return all workflow stages', () => {
        return request(app.getHttpServer())
          .get('/workflow/stages')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.stages).toHaveLength(4);
            expect(res.body.data.stages[0]).toHaveProperty('id');
            expect(res.body.data.stages[0]).toHaveProperty('label');
            expect(res.body.data.stages[0]).toHaveProperty('description');
            expect(res.body.data.stages[0]).toHaveProperty('order');
          });
      });

      it('should return stages in correct order', () => {
        return request(app.getHttpServer())
          .get('/workflow/stages')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            const stages = res.body.data.stages;
            expect(stages[0].id).toBe('applied');
            expect(stages[1].id).toBe('shortlisted');
            expect(stages[2].id).toBe('interview-scheduled');
            expect(stages[3].id).toBe('interview-passed');
          });
      });
    });
  });

  describe('Workflow Integration Tests', () => {
    it('should complete full workflow progression', async () => {
      // 1. Get initial candidates
      const initialResponse = await request(app.getHttpServer())
        .get('/workflow/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ stage: 'applied' });

      expect(initialResponse.status).toBe(200);

      // 2. Move to shortlisted
      const shortlistResponse = await request(app.getHttpServer())
        .put(`/workflow/candidates/${candidateId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          application_id: applicationId,
          new_stage: 'shortlisted',
          notes: 'Qualified candidate',
        });

      expect(shortlistResponse.status).toBe(200);
      expect(shortlistResponse.body.data.new_stage).toBe('shortlisted');

      // 3. Schedule interview
      const scheduleResponse = await request(app.getHttpServer())
        .put(`/workflow/candidates/${candidateId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          application_id: applicationId,
          new_stage: 'interview-scheduled',
          interview_details: {
            interview_date_ad: '2024-12-20',
            interview_time: '14:00',
            location: 'Main Office',
            duration_minutes: 45,
            type: 'In-person',
          },
        });

      expect(scheduleResponse.status).toBe(200);
      expect(scheduleResponse.body.data.interview_id).toBeDefined();

      // 4. Mark as passed
      const passResponse = await request(app.getHttpServer())
        .put(`/workflow/candidates/${candidateId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          application_id: applicationId,
          new_stage: 'interview-passed',
          notes: 'Excellent performance',
        });

      expect(passResponse.status).toBe(200);
      expect(passResponse.body.data.new_stage).toBe('interview-passed');

      // 5. Verify analytics updated
      const analyticsResponse = await request(app.getHttpServer())
        .get('/workflow/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.data.by_stage['interview-passed']).toBeGreaterThan(0);
    });

    it('should enforce agency scoping', async () => {
      // Try to access candidate from different agency
      const otherAgencyToken = 'other-agency-token';

      const response = await request(app.getHttpServer())
        .put(`/workflow/candidates/${candidateId}/stage`)
        .set('Authorization', `Bearer ${otherAgencyToken}`)
        .send({
          application_id: applicationId,
          new_stage: 'shortlisted',
        });

      expect(response.status).toBe(404); // Should not find candidate
    });
  });
});
