/**
 * Interview Test Candidates Seeder
 * Creates test candidates (001-00n) all in interview_scheduled status
 * Clones existing candidates to ensure consistent data for testing filters
 * 
 * Usage: node seed-interview-test-candidates.js [count] [jobId] [agencyLicense]
 * Example: node seed-interview-test-candidates.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b 12345067068
 */

import axios from 'axios';
import { Pool } from 'pg';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madiramaps_dev';

// Parse command line arguments
const count = parseInt(process.argv[2]) || 10;
const jobId = process.argv[3] || '381ed0d7-5883-4898-a9d6-531aec0c409b';
const agencyLicense = process.argv[4] || '12345067068';

const pool = new Pool({ connectionString: DB_URL });

async function getExistingCandidate() {
  try {
    const result = await pool.query(
      `SELECT c.id, c.full_name, c.phone, c.gender, c.age, c.address
       FROM candidates c
       LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to fetch existing candidate:', error.message);
    return null;
  }
}

async function getJobPositions(jobId) {
  try {
    const result = await pool.query(
      `SELECT jp.id, jp.title, jp.monthly_salary_amount, jp.salary_currency
       FROM job_positions jp
       WHERE jp.job_posting_id = $1
       LIMIT 1`,
      [jobId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to fetch job positions:', error.message);
    return null;
  }
}

async function createTestCandidate(index, templateCandidate) {
  try {
    const testNumber = String(index).padStart(3, '0');
    const phone = `98999${String(index).padStart(5, '0')}`;
    const fullName = `Test Candidate ${testNumber}`;
    
    // 1. Register candidate
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      full_name: fullName,
      phone
    });
    const devOtp = registerRes.data.dev_otp;
    
    // 2. Verify OTP
    const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {
      phone,
      otp: devOtp
    });
    const token = verifyRes.data.token;
    const candidateId = verifyRes.data.candidate_id;
    
    // 3. Update profile with template data
    await axios.patch(`${BASE_URL}/candidates/${candidateId}`, {
      full_name: fullName,
      age: templateCandidate?.age || 25,
      gender: templateCandidate?.gender || 'male',
      address: templateCandidate?.address || { district: 'Kathmandu' }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return { candidateId, token, fullName, phone };
  } catch (error) {
    console.error(`❌ Failed to create test candidate ${index}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createJobApplication(candidateId, jobId, positionId) {
  try {
    const result = await pool.query(
      `INSERT INTO job_applications (id, candidate_id, job_posting_id, position_id, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [candidateId, jobId, positionId, 'interview_scheduled']
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Failed to create job application:', error.message);
    return null;
  }
}

async function scheduleInterview(applicationId, jobId, interviewDate, interviewTime, index) {
  try {
    const result = await pool.query(
      `INSERT INTO interview_details (
        id, job_posting_id, job_application_id, interview_date_ad, interview_time,
        duration_minutes, location, contact_person, status, type, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING id`,
      [
        jobId,
        applicationId,
        interviewDate,
        interviewTime,
        60, // duration_minutes
        'Test Office',
        'HR Manager',
        'scheduled',
        'In-person'
      ]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Failed to schedule interview:', error.message);
    return null;
  }
}

async function seedInterviewTestCandidates() {
  console.log('🌱 Interview Test Candidates Seeder');
  console.log('==========================================\n');
  console.log(`📍 API URL: ${BASE_URL}`);
  console.log(`📍 Database: ${DB_URL.split('@')[1]}`);
  console.log(`👥 Creating ${count} test candidates in interview_scheduled status`);
  console.log(`🎯 Job ID: ${jobId}`);
  console.log(`🏢 Agency License: ${agencyLicense}\n`);
  
  try {
    // Get template candidate
    const templateCandidate = await getExistingCandidate();
    if (!templateCandidate) {
      console.log('⚠️  No existing candidates found. Please seed candidates first.');
      await pool.end();
      return;
    }
    console.log(`✅ Using template candidate: ${templateCandidate.full_name}\n`);
    
    // Get job position
    const position = await getJobPositions(jobId);
    if (!position) {
      console.log('⚠️  No positions found for this job.');
      await pool.end();
      return;
    }
    console.log(`✅ Using position: ${position.title}\n`);
    
    let successCount = 0;
    let failCount = 0;
    const today = new Date();
    
    for (let i = 1; i <= count; i++) {
      process.stdout.write(`[${i}/${count}] Creating test candidate ${String(i).padStart(3, '0')}... `);
      
      try {
        // Create candidate
        const candidateData = await createTestCandidate(i, templateCandidate);
        if (!candidateData) {
          console.log('❌ Failed to create candidate');
          failCount++;
          continue;
        }
        
        // Create job application
        const applicationId = await createJobApplication(
          candidateData.candidateId,
          jobId,
          position.id
        );
        if (!applicationId) {
          console.log('❌ Failed to create application');
          failCount++;
          continue;
        }
        
        // Schedule interview with varied dates for testing filters
        // Distribute interviews across: today, tomorrow, next 7 days
        const daysOffset = i % 8; // 0-7 days from today
        const interviewDate = new Date(today);
        interviewDate.setDate(interviewDate.getDate() + daysOffset);
        
        // Format date as YYYY-MM-DD
        const dateStr = interviewDate.toISOString().split('T')[0];
        
        // Vary interview times
        const hour = 9 + (i % 8); // 9 AM to 4 PM
        const minute = (i % 4) * 15; // 0, 15, 30, 45 minutes
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        
        const interviewId = await scheduleInterview(
          applicationId,
          jobId,
          dateStr,
          timeStr,
          i
        );
        
        if (!interviewId) {
          console.log('❌ Failed to schedule interview');
          failCount++;
          continue;
        }
        
        console.log(`✅ (${dateStr} ${timeStr})`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ ${error.message}`);
        failCount++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('\n==========================================');
    console.log('📊 Seeding Summary');
    console.log('==========================================');
    console.log(`✅ Success: ${successCount}/${count} test candidates`);
    console.log(`❌ Failed: ${failCount}/${count} test candidates`);
    console.log('\n🎉 Seeding complete!');
    console.log('\n📝 Test URLs:');
    console.log(`\n1. All interview_scheduled candidates:`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc`);
    console.log(`\n2. Today's interviews (interview_filter=today):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=today`);
    console.log(`\n3. Tomorrow's interviews (interview_filter=tomorrow):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow`);
    console.log(`\n4. Unattended interviews (interview_filter=unattended):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended`);
    console.log(`\n5. All interviews endpoint (today):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/interviews?interview_filter=today&limit=100`);
    console.log(`\n6. All interviews endpoint (tomorrow):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/interviews?interview_filter=tomorrow&limit=100`);
    console.log(`\n7. All interviews endpoint (unattended):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/interviews?interview_filter=unattended&limit=100`);
    console.log(`\n8. All interviews endpoint (all):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/interviews?interview_filter=all&limit=100`);
    console.log(`\n9. Date range filter (custom dates):`);
    console.log(`   http://localhost:3000/agencies/${agencyLicense}/interviews?date_from=2025-12-21&date_to=2025-12-21&limit=100\n`);
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedInterviewTestCandidates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
