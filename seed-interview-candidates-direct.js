/**
 * Direct Database Seeder for Interview Test Candidates
 * Creates test candidates (001-00n) directly in the database
 * Clones existing candidate data for consistency
 * 
 * Database: PostgreSQL in Docker container (nest_pg)
 * Connection: postgresql://postgres:postgres@localhost:5431/app_db
 * 
 * Usage: node seed-interview-candidates-direct.js [count] [jobId]
 * Example: node seed-interview-candidates-direct.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b
 */

import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5431/app_db';

// Parse command line arguments
const count = parseInt(process.argv[2]) || 10;
const jobId = process.argv[3] || '381ed0d7-5883-4898-a9d6-531aec0c409b';

const pool = new Pool({ connectionString: DB_URL });

async function getTemplateCandidate() {
  try {
    const result = await pool.query(
      `SELECT c.id, c.full_name, c.phone, c.gender, c.date_of_birth, c.address
       FROM candidates c
       WHERE c.full_name NOT LIKE 'Test Candidate%'
       ORDER BY c.created_at DESC
       LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to fetch template candidate:', error.message);
    return null;
  }
}

async function getJobPosition(jobId) {
  try {
    const result = await pool.query(
      `SELECT jp.id, jp.title, jp.monthly_salary_amount, jp.salary_currency
       FROM job_contracts jc
       JOIN job_positions jp ON jp.job_contract_id = jc.id
       WHERE jc.job_posting_id = $1
       LIMIT 1`,
      [jobId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to fetch job position:', error.message);
    return null;
  }
}

async function verifyJobExists(jobId) {
  try {
    const result = await pool.query(
      `SELECT id, posting_title FROM job_postings WHERE id = $1`,
      [jobId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to verify job:', error.message);
    return null;
  }
}

async function createTestCandidate(index, templateCandidate) {
  try {
    const testNumber = String(index).padStart(3, '0');
    const phone = `98999${String(index).padStart(5, '0')}`;
    const fullName = `Test Candidate ${testNumber}`;
    
    // Use template address
    const addressObj = templateCandidate.address || { district: 'Kathmandu' };
    
    const result = await pool.query(
      `INSERT INTO candidates (
        id, full_name, phone, gender, date_of_birth, address, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
      )
      RETURNING id`,
      [
        fullName,
        phone,
        templateCandidate.gender || 'Male',
        templateCandidate.date_of_birth || new Date('2000-01-01'),
        JSON.stringify(addressObj)
      ]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error(`❌ Failed to create candidate ${index}:`, error.message);
    return null;
  }
}

async function createJobApplication(candidateId, jobId, positionId) {
  try {
    const result = await pool.query(
      `INSERT INTO job_applications (
        id, candidate_id, job_posting_id, position_id, status, history_blob, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
      )
      RETURNING id`,
      [
        candidateId,
        jobId,
        positionId,
        'interview_scheduled',
        JSON.stringify([])
      ]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Failed to create job application:', error.message);
    return null;
  }
}

async function scheduleInterview(applicationId, jobId, interviewDate, interviewTime) {
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
  console.log('🌱 Direct Database Seeder - Interview Test Candidates');
  console.log('==========================================\n');
  console.log(`📍 Database: ${DB_URL}`);
  console.log(`👥 Creating ${count} test candidates in interview_scheduled status`);
  console.log(`🎯 Job ID: ${jobId}\n`);
  
  try {
    // Verify job exists
    const job = await verifyJobExists(jobId);
    if (!job) {
      console.log('⚠️  Job not found. Exiting...');
      await pool.end();
      return;
    }
    console.log(`✅ Job found: ${job.posting_title}\n`);
    
    // Get template candidate
    const templateCandidate = await getTemplateCandidate();
    if (!templateCandidate) {
      console.log('⚠️  No existing candidates found. Please create a candidate first.');
      await pool.end();
      return;
    }
    console.log(`✅ Template candidate: ${templateCandidate.full_name} (${templateCandidate.phone})\n`);
    
    // Get job position
    const position = await getJobPosition(jobId);
    if (!position) {
      console.log('⚠️  No positions found for this job.');
      await pool.end();
      return;
    }
    console.log(`✅ Position: ${position.title}\n`);
    
    let successCount = 0;
    let failCount = 0;
    const today = new Date();
    const createdCandidates = [];
    
    console.log('Creating candidates...\n');
    
    for (let i = 1; i <= count; i++) {
      process.stdout.write(`[${i}/${count}] Creating test candidate ${String(i).padStart(3, '0')}... `);
      
      try {
        // Create candidate
        const candidateId = await createTestCandidate(i, templateCandidate);
        if (!candidateId) {
          console.log('❌ Failed to create candidate');
          failCount++;
          continue;
        }
        
        // Create job application
        const applicationId = await createJobApplication(
          candidateId,
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
          timeStr
        );
        
        if (!interviewId) {
          console.log('❌ Failed to schedule interview');
          failCount++;
          continue;
        }
        
        createdCandidates.push({
          number: String(i).padStart(3, '0'),
          name: `Test Candidate ${String(i).padStart(3, '0')}`,
          phone: `98999${String(i).padStart(5, '0')}`,
          date: dateStr,
          time: timeStr,
          candidateId,
          applicationId,
          interviewId
        });
        
        console.log(`✅ (${dateStr} ${timeStr})`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n==========================================');
    console.log('📊 Seeding Summary');
    console.log('==========================================');
    console.log(`✅ Success: ${successCount}/${count} test candidates`);
    console.log(`❌ Failed: ${failCount}/${count} test candidates`);
    
    if (createdCandidates.length > 0) {
      console.log('\n📋 Created Candidates:');
      console.log('─'.repeat(90));
      console.log('No.  | Name                    | Phone           | Interview Date | Time');
      console.log('─'.repeat(90));
      
      createdCandidates.forEach(c => {
        console.log(
          `${c.number} | ${c.name.padEnd(23)} | ${c.phone} | ${c.date}     | ${c.time}`
        );
      });
      
      console.log('─'.repeat(90));
    }
    
    console.log('\n🎉 Seeding complete!');
    console.log('\n� Tesnt URLs:');
    console.log(`\n1. All interview_scheduled candidates:`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc`);
    console.log(`\n2. Today's interviews (interview_filter=today):`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=today`);
    console.log(`\n3. Tomorrow's interviews (interview_filter=tomorrow):`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow`);
    console.log(`\n4. Unattended interviews (interview_filter=unattended):`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended`);
    console.log(`\n5. This week's interviews (date_alias=this_week):`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/${jobId}/candidates?stage=interview_scheduled&limit=100&date_alias=this_week`);
    console.log(`\n6. Agency interviews endpoint (today):`);
    console.log(`   http://localhost:3000/agencies/12345067068/interviews?interview_filter=today&limit=100`);
    console.log(`\n7. Agency interviews endpoint (tomorrow):`);
    console.log(`   http://localhost:3000/agencies/12345067068/interviews?interview_filter=tomorrow&limit=100`);
    console.log(`\n8. Agency interviews endpoint (unattended):`);
    console.log(`   http://localhost:3000/agencies/12345067068/interviews?interview_filter=unattended&limit=100`);
    console.log(`\n9. Agency interviews endpoint (all):`);
    console.log(`   http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100\n`);
    
  } catch (error) {
    console.error('\n� sFatal error:', error);
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
