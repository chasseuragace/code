/**
 * Comprehensive Test Data Seeder
 * Creates realistic test data with proper ownership relationships
 * 
 * Creates:
 * - n candidates (cloned from template)
 * - m agencies (cloned from template) with owners
 * - p job postings per agency (cloned from template)
 * - q positions per job posting (cloned from template)
 * - r job applications per candidate (randomly assigned to agencies/postings/positions)
 * 
 * Database: PostgreSQL in Docker container (nest_pg)
 * Connection: postgresql://postgres:postgres@localhost:5431/app_db
 * 
 * Usage: node seed-comprehensive-test-data.js [n] [m] [p] [q] [r]
 * Example: node seed-comprehensive-test-data.js 5 2 3 2 4
 */

import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5431/app_db';

const numCandidates = parseInt(process.argv[2]) || 5;
const numAgencies = parseInt(process.argv[3]) || 2;
const numPostingsPerAgency = parseInt(process.argv[4]) || 3;
const numPositionsPerPosting = parseInt(process.argv[5]) || 2;
const numApplicationsPerCandidate = parseInt(process.argv[6]) || 4;

const pool = new Pool({ connectionString: DB_URL });

// ============================================================================
// TEMPLATE FETCHERS
// ============================================================================

async function getTemplateCandidate() {
  const result = await pool.query(
    `SELECT id, full_name, phone, gender, date_of_birth, address
     FROM candidates
     WHERE full_name NOT LIKE 'Test Candidate%' AND full_name NOT LIKE 'Seed%'
     ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0];
}

async function getTemplateAgency() {
  const result = await pool.query(
    `SELECT id, name, license_number, country, city, address, contact_email, contact_phone
     FROM posting_agencies
     WHERE name NOT LIKE 'Test Agency%' AND name NOT LIKE 'Seed%'
     ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0];
}

async function getTemplateEmployer() {
  const result = await pool.query(
    `SELECT id, company_name, country, city
     FROM employers
     WHERE company_name NOT LIKE 'Test Employer%' AND company_name NOT LIKE 'Seed%'
     ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0];
}

async function getTemplateJobPosting() {
  const result = await pool.query(
    `SELECT id, posting_title, city, country, notes
     FROM job_postings
     WHERE posting_title NOT LIKE 'Test Job%' AND posting_title NOT LIKE 'Seed%'
     ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0];
}

async function getTemplateJobContract() {
  const result = await pool.query(
    `SELECT id, period_years, renewable, hours_per_day, days_per_week, overtime_policy, 
            weekly_off_days, food, accommodation, transport, annual_leave_days
     FROM job_contracts LIMIT 1`
  );
  return result.rows[0];
}

// ============================================================================
// CREATORS
// ============================================================================

async function createCandidate(index, template) {
  const testNumber = String(index).padStart(3, '0');
  const timestamp = Date.now();
  const phone = `98999${timestamp.toString().slice(-5)}${String(index).padStart(2, '0')}`;
  const fullName = `Seed Candidate ${testNumber}`;
  
  const result = await pool.query(
    `INSERT INTO candidates (id, full_name, phone, gender, date_of_birth, address, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [
      fullName,
      phone,
      template.gender || 'Male',
      template.date_of_birth || new Date('2000-01-01'),
      JSON.stringify(template.address || { district: 'Kathmandu' })
    ]
  );
  return result.rows[0].id;
}

async function createAgency(index, template) {
  const testNumber = String(index).padStart(2, '0');
  const licenseNumber = `SEED${Date.now()}${String(index).padStart(4, '0')}`;
  const name = `Seed Agency ${testNumber}`;
  
  const result = await pool.query(
    `INSERT INTO posting_agencies (
      id, name, license_number, country, city, address, contact_email, contact_phone,
      is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()
    )
    RETURNING id`,
    [
      name,
      licenseNumber,
      template.country || 'Nepal',
      template.city || 'Kathmandu',
      template.address || 'Test Address',
      `agency${index}@test.com`,
      `+977-${String(index).padStart(10, '0')}`
    ]
  );
  return result.rows[0].id;
}

async function createAgencyOwner(agencyId, index, ownerPhoneRaw) {
  const ownerName = `Seed Owner ${String(index).padStart(2, '0')}`;
  // Format phone with +977 prefix - MUST include prefix for login to work
  // Extract last 10 digits and prepend +977
  const phoneDigits = ownerPhoneRaw.replace(/\D/g, '').slice(-10);
  const ownerPhone = `+977${phoneDigits}`;
  
  const result = await pool.query(
    `INSERT INTO users (
      id, phone, full_name, role, is_active, agency_id, is_agency_owner, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, true, $4, true, NOW(), NOW()
    )
    RETURNING id`,
    [
      ownerPhone,
      ownerName,
      'owner',
      agencyId
    ]
  );
  return result.rows[0].id;
}

async function createEmployer(index, template) {
  const testNumber = String(index).padStart(2, '0');
  const companyName = `Seed Employer ${testNumber}`;
  
  const result = await pool.query(
    `INSERT INTO employers (id, company_name, country, city, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
     RETURNING id`,
    [
      companyName,
      template.country || 'UAE',
      template.city || 'Dubai'
    ]
  );
  return result.rows[0].id;
}

async function createJobPosting(index, template) {
  const testNumber = String(index).padStart(3, '0');
  const postingTitle = `Seed Job ${testNumber}`;
  
  const result = await pool.query(
    `INSERT INTO job_postings (
      id, posting_title, city, country, notes, is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW()
    )
    RETURNING id`,
    [
      postingTitle,
      template.city || 'Dubai',
      template.country || 'UAE',
      template.notes || 'Test job posting'
    ]
  );
  return result.rows[0].id;
}

async function createJobContract(jobPostingId, employerId, agencyId, template) {
  const result = await pool.query(
    `INSERT INTO job_contracts (
      id, job_posting_id, employer_id, posting_agency_id, period_years, renewable,
      hours_per_day, days_per_week, overtime_policy, weekly_off_days, food,
      accommodation, transport, annual_leave_days, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    )
    RETURNING id`,
    [
      jobPostingId,
      employerId,
      agencyId,
      template.period_years || 2,
      template.renewable || false,
      template.hours_per_day || 8,
      template.days_per_week || 6,
      template.overtime_policy || 'as_per_company_policy',
      template.weekly_off_days || 1,
      template.food || 'provided',
      template.accommodation || 'provided',
      template.transport || 'provided',
      template.annual_leave_days || 20
    ]
  );
  return result.rows[0].id;
}

async function createJobPosition(index, contractId) {
  const testNumber = String(index).padStart(2, '0');
  const title = `Seed Position ${testNumber}`;
  
  const result = await pool.query(
    `INSERT INTO job_positions (
      id, job_contract_id, title, male_vacancies, female_vacancies,
      monthly_salary_amount, salary_currency, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
    )
    RETURNING id`,
    [
      contractId,
      title,
      2,
      1,
      2500 + (index * 100),
      'AED'
    ]
  );
  return result.rows[0].id;
}

async function createJobApplication(candidateId, jobPostingId, positionId) {
  const result = await pool.query(
    `INSERT INTO job_applications (
      id, candidate_id, job_posting_id, position_id, status, history_blob, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
    )
    RETURNING id`,
    [
      candidateId,
      jobPostingId,
      positionId,
      'interview_scheduled',
      JSON.stringify([])
    ]
  );
  return result.rows[0].id;
}

async function scheduleInterview(applicationId, jobPostingId, interviewIndex, totalInterviews, dbNow) {
  const currentHour = dbNow.getHours();
  const currentMinute = dbNow.getMinutes();
  
  // Distribute interviews across: unattended (today past), today (future), tomorrow
  const distribution = interviewIndex % 3;
  let interviewDate = new Date(dbNow);
  let hour, minute;
  
  if (distribution === 0) {
    // Unattended: today with past time (guaranteed to be past grace period)
    // Schedule between 6 AM and 3 hours before current time
    interviewDate.setDate(interviewDate.getDate());
    const maxPastHour = Math.max(6, currentHour - 3);
    hour = 6 + (interviewIndex % (maxPastHour - 6 + 1)); // 6 to maxPastHour
    minute = 0;
  } else if (distribution === 1) {
    // Today: future time
    interviewDate.setDate(interviewDate.getDate());
    hour = currentHour + 2 + (interviewIndex % 4); // 2+ hours in the future
    minute = (interviewIndex % 4) * 15;
  } else {
    // Tomorrow
    interviewDate.setDate(interviewDate.getDate() + 1);
    hour = 9 + (interviewIndex % 8);
    minute = (interviewIndex % 4) * 15;
  }
  
  // Ensure hour is within valid range
  hour = Math.max(0, Math.min(23, hour));
  
  const dateStr = interviewDate.toISOString().split('T')[0];
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  
  const result = await pool.query(
    `INSERT INTO interview_details (
      id, job_posting_id, job_application_id, interview_date_ad, interview_time,
      duration_minutes, location, contact_person, status, type, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
    )
    RETURNING id`,
    [
      jobPostingId,
      applicationId,
      dateStr,
      timeStr,
      60,
      'Test Office',
      'HR Manager',
      'scheduled',
      'In-person'
    ]
  );
  return result.rows[0].id;
}

// ============================================================================
// MAIN SEEDER
// ============================================================================

async function seedComprehensiveTestData() {
  console.log('🌱 Comprehensive Test Data Seeder');
  console.log('==========================================\n');
  console.log(`📊 Configuration:`);
  console.log(`  Candidates: ${numCandidates}`);
  console.log(`  Agencies: ${numAgencies}`);
  console.log(`  Postings per Agency: ${numPostingsPerAgency}`);
  console.log(`  Positions per Posting: ${numPositionsPerPosting}`);
  console.log(`  Applications per Candidate: ${numApplicationsPerCandidate}\n`);
  
  const totalPostings = numAgencies * numPostingsPerAgency;
  const totalPositions = totalPostings * numPositionsPerPosting;
  const totalApplications = numCandidates * numApplicationsPerCandidate;
  
  console.log(`📈 Total Records:`);
  console.log(`  Total Postings: ${totalPostings}`);
  console.log(`  Total Positions: ${totalPositions}`);
  console.log(`  Total Applications: ${totalApplications}\n`);
  
  try {
    // Fetch templates
    console.log('🔍 Fetching templates...');
    const templateCandidate = await getTemplateCandidate();
    const templateAgency = await getTemplateAgency();
    const templateEmployer = await getTemplateEmployer();
    const templateJobPosting = await getTemplateJobPosting();
    const templateJobContract = await getTemplateJobContract();
    
    if (!templateCandidate || !templateAgency || !templateEmployer || !templateJobPosting) {
      console.error('❌ Missing required templates');
      await pool.end();
      return;
    }
    
    console.log(`✅ Templates found\n`);
    
    // Create candidates
    console.log(`👥 Creating ${numCandidates} candidates...`);
    const candidates = [];
    for (let i = 1; i <= numCandidates; i++) {
      const candidateId = await createCandidate(i, templateCandidate);
      candidates.push(candidateId);
      process.stdout.write(`\r  [${i}/${numCandidates}] Created`);
    }
    console.log(`\n✅ Candidates created\n`);
    
    // Create agencies with postings and positions
    console.log(`🏢 Creating ${numAgencies} agencies with postings and positions...`);
    const agencyPostingPositions = [];
    const createdAgencies = [];
    
    for (let a = 1; a <= numAgencies; a++) {
      const agencyId = await createAgency(a, templateAgency);
      const agencyPhone = `+977-${String(a).padStart(10, '0')}`;
      
      // Create agency owner with proper phone format
      // Generate a unique 10-digit phone number
      const timestamp = Date.now();
      const ownerPhoneRaw = `98988${timestamp.toString().slice(-4)}${String(a).padStart(3, '0')}`;
      const ownerPhone = `+977${ownerPhoneRaw.slice(-10)}`; // Format: +977XXXXXXXXXX
      const ownerId = await createAgencyOwner(agencyId, a, ownerPhoneRaw);
      
      createdAgencies.push({
        id: agencyId,
        name: `Seed Agency ${String(a).padStart(2, '0')}`,
        phone: agencyPhone,
        ownerId,
        ownerPhone
      });
      console.log(`\n  Agency ${a}/${numAgencies}: ${agencyId.substring(0, 8)}... (${agencyPhone})`);
      
      for (let p = 1; p <= numPostingsPerAgency; p++) {
        const employerId = await createEmployer(a * 100 + p, templateEmployer);
        const jobPostingId = await createJobPosting(a * 100 + p, templateJobPosting);
        const contractId = await createJobContract(jobPostingId, employerId, agencyId, templateJobContract);
        
        const positions = [];
        for (let q = 1; q <= numPositionsPerPosting; q++) {
          const positionId = await createJobPosition(q, contractId);
          positions.push(positionId);
        }
        
        agencyPostingPositions.push({
          agencyId,
          jobPostingId,
          positions
        });
        
        process.stdout.write(`\r    Posting ${p}/${numPostingsPerAgency} with ${numPositionsPerPosting} positions`);
      }
    }
    console.log(`\n✅ Agencies, postings, and positions created\n`);
    
    // Create job applications
    console.log(`📝 Creating ${totalApplications} job applications...`);
    let appCount = 0;
    
    // Get current time from database for accurate scheduling
    const dbTimeResult = await pool.query('SELECT NOW() as now');
    const dbNow = new Date(dbTimeResult.rows[0].now);
    
    for (let c = 0; c < candidates.length; c++) {
      const candidateId = candidates[c];
      
      for (let a = 0; a < numApplicationsPerCandidate; a++) {
        // Randomly select an agency/posting/position
        const randomIndex = Math.floor(Math.random() * agencyPostingPositions.length);
        const { agencyId, jobPostingId, positions } = agencyPostingPositions[randomIndex];
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        
        // Create application
        const applicationId = await createJobApplication(candidateId, jobPostingId, randomPosition);
        
        // Schedule interview with distribution across unattended/today/tomorrow
        await scheduleInterview(applicationId, jobPostingId, appCount, totalApplications, dbNow);
        
        appCount++;
        process.stdout.write(`\r  [${appCount}/${totalApplications}] Created`);
      }
    }
    console.log(`\n✅ Job applications created\n`);
    
    // Summary
    console.log('==========================================');
    console.log('📊 Seeding Summary');
    console.log('==========================================');
    console.log(`✅ Candidates: ${numCandidates}`);
    console.log(`✅ Agencies: ${numAgencies}`);
    console.log(`✅ Agency Owners: ${numAgencies}`);
    console.log(`✅ Job Postings: ${totalPostings}`);
    console.log(`✅ Positions: ${totalPositions}`);
    console.log(`✅ Job Applications: ${totalApplications}`);
    console.log(`✅ Interviews Scheduled: ${totalApplications}`);
    
    console.log('\n📋 Created Agencies with Owners:');
    createdAgencies.forEach(agency => {
      console.log(`   - ${agency.name}: ${agency.phone}`);
      console.log(`     Owner Phone: ${agency.ownerPhone} (ID: ${agency.ownerId.substring(0, 8)}...)`);
    });
    
    console.log('\n📋 Agency Job Postings (for testing):');
    agencyPostingPositions.forEach((item, idx) => {
      const agency = createdAgencies.find(a => a.id === item.agencyId);
      console.log(`   Posting ${idx + 1}: ${item.jobPostingId.substring(0, 8)}...`);
      console.log(`     Agency: ${agency.name} (License: ${agency.phone})`);
      console.log(`     Positions: ${item.positions.length}`);
    });
    
    console.log('\n🎉 Seeding complete!');
    
    // Test URLs
    console.log('\n� Teest URLs:');
    console.log(`\n1. All interview_scheduled candidates:`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100`);
    console.log(`\n2. Today's interviews:`);
    console.log(`   http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100`);
    console.log(`\n3. Agency interviews (all):`);
    console.log(`   http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100\n`);
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedComprehensiveTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
