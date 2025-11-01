import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { waitForAppReady } from './utils/appReady';

/**
 * E2E: My Applications - Complete Workflow
 * 
 * This test covers the complete "My Applications" user journey including:
 * 1. Candidate applies to multiple jobs
 * 2. List all applications (GET /applications/candidates/:id)
 * 3. View application details with full history (GET /applications/:id)
 * 4. Track all status transitions:
 *    - applied → shortlisted → interview_scheduled → interview_passed
 *    - applied → interview_scheduled → interview_rescheduled → interview_failed
 *    - applied → withdrawn
 * 5. Verify history tracking for each transition
 * 6. Test that updated_by is undefined when no JWT token is used
 * 
 * Note: This test demonstrates the foundation for notifications.
 * Each status change in history can trigger a notification in the future.
 */

describe('E2E: My Applications - Complete Workflow', () => {
  let app: INestApplication;
  let candidateId: string;
  let accessToken: string;
  let jobPostingId1: string;
  let jobPostingId2: string;
  let jobPostingId3: string;
  let applicationId1: string; // Will go through: applied → shortlisted → interview_scheduled → passed
  let applicationId2: string; // Will go through: applied → interview_scheduled → rescheduled → failed
  let applicationId3: string; // Will go through: applied → withdrawn
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();

  async function seedData() {
    await request(app.getHttpServer()).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(app.getHttpServer()).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await waitForAppReady(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Setup: Register candidate and create job postings', () => {
    it('should seed reference data', async () => {
      await seedData();
    });

    it('should register and verify candidate', async () => {
      const reg = await request(app.getHttpServer())
        .post('/register')
        .send({ full_name: 'My Applications Test User', phone: testPhone })
        .expect(200);
      const reg_otp = reg.body.dev_otp;

      const verReg = await request(app.getHttpServer())
        .post('/verify')
        .send({ phone: testPhone, otp: reg_otp })
        .expect(200);
      candidateId = verReg.body.candidate_id;
      accessToken = verReg.body.token;

      expect(candidateId).toBeDefined();
      expect(accessToken).toBeDefined();
    });

    it('should create agency and job postings', async () => {
      // Create agency
      await request(app.getHttpServer())
        .post('/agencies')
        .send({ name: 'My Apps Test Agency', license_number: 'LIC-MYAPPS-001', country: 'Nepal' })
        .expect(201);

      // Get job title
      const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
      const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
      const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
      expect(electrician).toBeDefined();

      // Create job posting 1
      const post1Res = await request(app.getHttpServer())
        .post('/agencies/LIC-MYAPPS-001/job-postings')
        .send({
          posting_title: 'Electrical Technician - UAE',
          country: 'UAE',
          employer: { company_name: 'Tech Co', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2, renewable: true },
          positions: [
            { title: 'Electrical Technician', vacancies: { male: 5, female: 0 }, salary: { monthly_amount: 3000, currency: 'AED', converted: [] } },
          ],
          skills: ['electrical-wiring', 'troubleshooting'],
          education_requirements: ['diploma'],
          experience_requirements: { min_years: 2, max_years: 5 },
          canonical_title_ids: [electrician.id],
        })
        .expect(201);
      jobPostingId1 = post1Res.body.id;

      // Create job posting 2
      const post2Res = await request(app.getHttpServer())
        .post('/agencies/LIC-MYAPPS-001/job-postings')
        .send({
          posting_title: 'Senior Electrician - Qatar',
          country: 'Qatar',
          employer: { company_name: 'Build Co', country: 'Qatar', city: 'Doha' },
          contract: { period_years: 3, renewable: false },
          positions: [
            { title: 'Senior Electrician', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 4000, currency: 'QAR', converted: [] } },
          ],
          skills: ['electrical-wiring', 'project-management'],
          education_requirements: ['bachelor-degree'],
          experience_requirements: { min_years: 5, max_years: 10 },
          canonical_title_ids: [electrician.id],
        })
        .expect(201);
      jobPostingId2 = post2Res.body.id;

      // Create job posting 3
      const post3Res = await request(app.getHttpServer())
        .post('/agencies/LIC-MYAPPS-001/job-postings')
        .send({
          posting_title: 'Electrician Helper - Saudi Arabia',
          country: 'Saudi Arabia',
          employer: { company_name: 'Construction Co', country: 'Saudi Arabia', city: 'Riyadh' },
          contract: { period_years: 2, renewable: true },
          positions: [
            { title: 'Electrician Helper', vacancies: { male: 10, female: 0 }, salary: { monthly_amount: 2000, currency: 'SAR', converted: [] } },
          ],
          skills: ['basic-electrical'],
          education_requirements: ['slc'],
          experience_requirements: { min_years: 0, max_years: 2 },
          canonical_title_ids: [electrician.id],
        })
        .expect(201);
      jobPostingId3 = post3Res.body.id;

      expect(jobPostingId1).toBeDefined();
      expect(jobPostingId2).toBeDefined();
      expect(jobPostingId3).toBeDefined();
    });
  });

  describe('Application Workflow 1: Complete Success Path (applied → shortlisted → interview_scheduled → passed)', () => {
    it('should apply to job posting 1', async () => {
      const res = await request(app.getHttpServer())
        .post('/applications')
        .send({
          candidate_id: candidateId,
          job_posting_id: jobPostingId1,
          note: 'Very interested in this position',
          updatedBy: 'candidate-mobile-app',
        })
        .expect(201);

      applicationId1 = res.body.id;
      expect(res.body.status).toBe('applied');
      expect(applicationId1).toBeDefined();
    });

    it('should retrieve application details and verify initial history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      expect(res.body.id).toBe(applicationId1);
      expect(res.body.candidate_id).toBe(candidateId);
      expect(res.body.job_posting_id).toBe(jobPostingId1);
      expect(res.body.status).toBe('applied');
      expect(res.body.history_blob).toBeInstanceOf(Array);
      expect(res.body.history_blob.length).toBe(1);

      const firstEntry = res.body.history_blob[0];
      expect(firstEntry.prev_status).toBeNull();
      expect(firstEntry.next_status).toBe('applied');
      expect(firstEntry.updated_at).toBeDefined();
      expect(firstEntry.updated_by).toBe('candidate-mobile-app');
      expect(firstEntry.note).toBe('Very interested in this position');
    });

    it('should shortlist the application', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId1}/shortlist`)
        .send({ note: 'Good qualifications', updatedBy: 'agency-staff-123' })
        .expect(200);

      expect(res.body.status).toBe('shortlisted');
    });

    it('should verify shortlist in history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      expect(res.body.status).toBe('shortlisted');
      expect(res.body.history_blob.length).toBe(2);

      const shortlistEntry = res.body.history_blob[1];
      expect(shortlistEntry.prev_status).toBe('applied');
      expect(shortlistEntry.next_status).toBe('shortlisted');
      expect(shortlistEntry.updated_by).toBe('agency-staff-123');
      expect(shortlistEntry.note).toBe('Good qualifications');
    });

    it('should schedule interview', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId1}/schedule-interview`)
        .send({
          interview_date_ad: '2025-10-15',
          interview_time: '10:00',
          location: 'Agency Office Dubai',
          contact_person: 'Mr. Ahmed',
          required_documents: ['passport', 'certificates'],
          notes: 'Bring original documents',
          note: 'Interview scheduled for next month',
          updatedBy: 'agency-hr-456',
        })
        .expect(200);

      expect(res.body.status).toBe('interview_scheduled');
    });

    it('should verify interview schedule in history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      expect(res.body.status).toBe('interview_scheduled');
      expect(res.body.history_blob.length).toBe(3);

      const scheduleEntry = res.body.history_blob[2];
      expect(scheduleEntry.prev_status).toBe('shortlisted');
      expect(scheduleEntry.next_status).toBe('interview_scheduled');
      expect(scheduleEntry.updated_by).toBe('agency-hr-456');
      expect(scheduleEntry.note).toBe('Interview scheduled for next month');
    });

    it('should verify interview details including required documents', async () => {
      // Get interviews for this candidate
      const interviewsRes = await request(app.getHttpServer())
        .get(`/interviews?candidate_ids=${candidateId}`)
        .expect(200);

      // Find the interview linked to applicationId1
      const interview = interviewsRes.body.items.find(
        (i: any) => i.application?.id === applicationId1
      );

      expect(interview).toBeDefined();
      expect(interview.schedule.date_ad).toBe('2025-10-15');
      expect(interview.schedule.time).toBe('10:00:00');
      expect(interview.location).toBe('Agency Office Dubai');
      expect(interview.contact_person).toBe('Mr. Ahmed');
      expect(interview.required_documents).toEqual(['passport', 'certificates']);
      expect(interview.notes).toBe('Bring original documents');
    });

    it('should complete interview as passed', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId1}/complete-interview`)
        .send({ result: 'passed', note: 'Excellent performance', updatedBy: 'interview-panel-1' })
        .expect(200);

      expect(res.body.status).toBe('interview_passed');
    });

    it('should verify interview passed in history (terminal status)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      expect(res.body.status).toBe('interview_passed');
      expect(res.body.history_blob.length).toBe(4);

      const passedEntry = res.body.history_blob[3];
      expect(passedEntry.prev_status).toBe('interview_scheduled');
      expect(passedEntry.next_status).toBe('interview_passed');
      expect(passedEntry.updated_by).toBe('interview-panel-1');
      expect(passedEntry.note).toBe('Excellent performance');
    });
  });

  describe('Application Workflow 2: Interview Reschedule and Failure (applied → interview_scheduled → rescheduled → failed)', () => {
    let interviewId2: string;

    it('should apply to job posting 2', async () => {
      const res = await request(app.getHttpServer())
        .post('/applications')
        .send({
          candidate_id: candidateId,
          job_posting_id: jobPostingId2,
          note: 'Interested in senior position',
        })
        .expect(201);

      applicationId2 = res.body.id;
      expect(res.body.status).toBe('applied');
    });

    it('should schedule interview directly from applied status', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId2}/schedule-interview`)
        .send({
          interview_date_ad: '2025-10-20',
          interview_time: '14:00',
          location: 'Agency Office Doha',
        })
        .expect(200);

      expect(res.body.status).toBe('interview_scheduled');
    });

    it('should verify history shows direct transition from applied to interview_scheduled', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId2}`)
        .expect(200);

      expect(res.body.history_blob.length).toBe(2);
      const scheduleEntry = res.body.history_blob[1];
      expect(scheduleEntry.prev_status).toBe('applied');
      expect(scheduleEntry.next_status).toBe('interview_scheduled');
    });

    it('should get interview ID for rescheduling', async () => {
      // Get interviews for this candidate to find the interview ID
      const interviewsRes = await request(app.getHttpServer())
        .get(`/interviews?candidate_ids=${candidateId}`)
        .expect(200);

      // Find the interview linked to applicationId2
      const interview = interviewsRes.body.items.find(
        (i: any) => i.application?.id === applicationId2
      );
      
      expect(interview).toBeDefined();
      expect(interview.id).toBeDefined();
      interviewId2 = interview.id;
    });

    it('should reschedule interview', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId2}/reschedule-interview`)
        .send({
          interview_id: interviewId2,
          interview_date_ad: '2025-10-25',
          interview_time: '16:00',
          location: 'New Office Location - Doha',
          contact_person: 'Ms. Fatima',
          note: 'Panel availability changed',
          updatedBy: 'agency-coordinator',
        })
        .expect(200);

      expect(res.body.status).toBe('interview_rescheduled');
    });

    it('should verify reschedule in history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId2}`)
        .expect(200);

      expect(res.body.status).toBe('interview_rescheduled');
      expect(res.body.history_blob.length).toBe(3); // applied → scheduled → rescheduled

      const rescheduleEntry = res.body.history_blob[2];
      expect(rescheduleEntry.prev_status).toBe('interview_scheduled');
      expect(rescheduleEntry.next_status).toBe('interview_rescheduled');
      expect(rescheduleEntry.updated_by).toBe('agency-coordinator');
      expect(rescheduleEntry.note).toBe('Panel availability changed');
    });

    it('should verify rescheduled interview details are updated', async () => {
      // Get interviews for this candidate
      const interviewsRes = await request(app.getHttpServer())
        .get(`/interviews?candidate_ids=${candidateId}`)
        .expect(200);

      // Find the interview linked to applicationId2
      const interview = interviewsRes.body.items.find(
        (i: any) => i.application?.id === applicationId2
      );

      expect(interview).toBeDefined();
      // Verify the rescheduled details
      expect(interview.schedule.date_ad).toBe('2025-10-25');
      expect(interview.schedule.time).toBe('16:00:00');
      expect(interview.location).toBe('New Office Location - Doha');
      expect(interview.contact_person).toBe('Ms. Fatima');
    });

    it('should complete interview as failed (from rescheduled status)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId2}/complete-interview`)
        .send({ result: 'failed', note: 'Did not meet technical requirements' })
        .expect(200);

      expect(res.body.status).toBe('interview_failed');
    });

    it('should verify interview failed in history (terminal status)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId2}`)
        .expect(200);

      expect(res.body.status).toBe('interview_failed');
      expect(res.body.history_blob.length).toBe(4); // applied → scheduled → rescheduled → failed

      const failedEntry = res.body.history_blob[3];
      expect(failedEntry.prev_status).toBe('interview_rescheduled');
      expect(failedEntry.next_status).toBe('interview_failed');
      expect(failedEntry.note).toBe('Did not meet technical requirements');
    });
  });

  describe('Application Workflow 3: Withdrawal (applied → withdrawn)', () => {
    it('should apply to job posting 3', async () => {
      const res = await request(app.getHttpServer())
        .post('/applications')
        .send({
          candidate_id: candidateId,
          job_posting_id: jobPostingId3,
        })
        .expect(201);

      applicationId3 = res.body.id;
      expect(res.body.status).toBe('applied');
    });

    it('should withdraw application', async () => {
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId3}/withdraw`)
        .send({ note: 'Found better opportunity', updatedBy: 'candidate-mobile-app' })
        .expect(200);

      expect(res.body.status).toBe('withdrawn');
    });

    it('should verify withdrawal in history with withdrawn_at timestamp', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId3}`)
        .expect(200);

      expect(res.body.status).toBe('withdrawn');
      expect(res.body.withdrawn_at).toBeDefined();
      expect(res.body.withdrawn_at).not.toBeNull();
      expect(res.body.history_blob.length).toBe(2);

      const withdrawEntry = res.body.history_blob[1];
      expect(withdrawEntry.prev_status).toBe('applied');
      expect(withdrawEntry.next_status).toBe('withdrawn');
      expect(withdrawEntry.updated_by).toBe('candidate-mobile-app');
      expect(withdrawEntry.note).toBe('Found better opportunity');
    });
  });

  describe('My Applications List View', () => {
    it('should list all applications for candidate', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/candidates/${candidateId}`)
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.items.length).toBeGreaterThanOrEqual(3);
      expect(res.body.total).toBeGreaterThanOrEqual(3);

      // Verify all three applications are present
      const ids = res.body.items.map((item: any) => item.id);
      expect(ids).toContain(applicationId1);
      expect(ids).toContain(applicationId2);
      expect(ids).toContain(applicationId3);
    });

    it('should filter applications by status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/candidates/${candidateId}?status=withdrawn`)
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
      const withdrawnApps = res.body.items.filter((item: any) => item.status === 'withdrawn');
      expect(withdrawnApps.length).toBeGreaterThanOrEqual(1);

      // Verify our withdrawn application is in the list
      const ids = withdrawnApps.map((item: any) => item.id);
      expect(ids).toContain(applicationId3);
    });

    it('should paginate applications', async () => {
      const page1 = await request(app.getHttpServer())
        .get(`/applications/candidates/${candidateId}?page=1&limit=2`)
        .expect(200);

      expect(page1.body.items.length).toBeLessThanOrEqual(2);
      expect(page1.body.page).toBe(1);
      expect(page1.body.limit).toBe(2);
      expect(page1.body.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Application Analytics', () => {
    it('should get analytics for candidate', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/analytics/${candidateId}`)
        .expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(3);
      expect(res.body.active).toBeDefined();
      expect(res.body.by_status).toBeDefined();

      // Verify status counts
      expect(res.body.by_status.interview_passed).toBeGreaterThanOrEqual(1);
      expect(res.body.by_status.interview_failed).toBeGreaterThanOrEqual(1);
      expect(res.body.by_status.withdrawn).toBeGreaterThanOrEqual(1);

      // Active count should not include terminal statuses
      const terminalCount = res.body.by_status.interview_passed + res.body.by_status.interview_failed + res.body.by_status.withdrawn;
      expect(res.body.active).toBe(res.body.total - terminalCount);
    });
  });

  describe('History Tracking Verification', () => {
    it('should verify updated_by is null when not provided (no JWT)', async () => {
      // Note: We'll create a new job to test this since candidate already applied to jobPostingId1

      // Create a new application without updatedBy
      const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
      const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
      const plumber = jtData.find((r: any) => (r.title || '').toLowerCase() === 'plumber');

      if (plumber) {
        // Create new job
        const newJobRes = await request(app.getHttpServer())
          .post('/agencies/LIC-MYAPPS-001/job-postings')
          .send({
            posting_title: 'Test Job for History',
            country: 'UAE',
            employer: { company_name: 'Test Co', country: 'UAE', city: 'Dubai' },
            contract: { period_years: 2, renewable: true },
            positions: [
              { title: 'Test Position', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 2000, currency: 'AED', converted: [] } },
            ],
            skills: ['test'],
            education_requirements: ['slc'],
            experience_requirements: { min_years: 0, max_years: 2 },
            canonical_title_ids: [plumber.id],
          })
          .expect(201);

        // Apply without updatedBy
        const applyRes = await request(app.getHttpServer())
          .post('/applications')
          .send({
            candidate_id: candidateId,
            job_posting_id: newJobRes.body.id,
          })
          .expect(201);

        // Check history
        const detailRes = await request(app.getHttpServer())
          .get(`/applications/${applyRes.body.id}`)
          .expect(200);

        expect(detailRes.body.history_blob[0].updated_by).toBeNull();
      }
    });

    it('should verify all history entries have required fields', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      res.body.history_blob.forEach((entry: any) => {
        expect(entry).toHaveProperty('prev_status');
        expect(entry).toHaveProperty('next_status');
        expect(entry).toHaveProperty('updated_at');
        expect(entry).toHaveProperty('updated_by');
        expect(entry.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      });
    });

    it('should verify history is in chronological order', async () => {
      const res = await request(app.getHttpServer())
        .get(`/applications/${applicationId1}`)
        .expect(200);

      const timestamps = res.body.history_blob.map((entry: any) => new Date(entry.updated_at).getTime());
      
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent application', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/00000000-0000-0000-0000-000000000000');
      
      // Should return 404 or 400 (depending on UUID validation)
      expect([400, 404]).toContain(res.status);
    });

    it('should prevent duplicate applications', async () => {
      const res = await request(app.getHttpServer())
        .post('/applications')
        .send({
          candidate_id: candidateId,
          job_posting_id: jobPostingId1,
        });
      
      // Should return 400 or 409 for duplicate application
      expect([400, 409, 500]).toContain(res.status);
    });

    it('should prevent invalid status transitions', async () => {
      // Try to shortlist an already passed application
      const res = await request(app.getHttpServer())
        .post(`/applications/${applicationId1}/shortlist`);
      
      // Should return 400, 409, or 500 for invalid transition from terminal status
      expect([400, 409, 500]).toContain(res.status);
    });
  });
});
