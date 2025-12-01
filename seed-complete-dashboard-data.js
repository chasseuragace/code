/**
 * Complete Dashboard Data Seeder
 * 1. Creates agency with jobs
 * 2. Creates 20 candidates with profiles
 * 3. Applies candidates to random jobs
 * 
 * Usage: node seed-complete-dashboard-data.js
 */

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

const NEPALI_FIRST_NAMES = [
  'Ram', 'Shyam', 'Hari', 'Krishna', 'Sita', 'Gita', 'Laxmi', 'Saraswati',
  'Ganesh', 'Bishnu', 'Prakash', 'Rajesh', 'Suresh', 'Dinesh', 'Mahesh',
  'Ramesh', 'Naresh', 'Umesh', 'Yogesh', 'Mukesh'
];

const NEPALI_LAST_NAMES = [
  'Sharma', 'Thapa', 'Gurung', 'Rai', 'Limbu', 'Tamang', 'Magar', 'Shrestha',
  'Karki', 'Adhikari', 'Poudel', 'Khadka', 'Bhandari', 'Subedi', 'Pandey'
];

const GENDERS = ['male', 'female'];
const DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'];

// Job data
const JOB_TITLES = [
  'Construction Worker', 'Electrician', 'Plumber', 'Carpenter', 'Welder',
  'Security Guard', 'Cleaner', 'Driver', 'Cook', 'Waiter'
];

const COUNTRIES = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Malaysia'];

async function createAgencyWithJobs() {
  console.log('\n🏢 Step 1: Creating Agency with Jobs');
  console.log('==========================================\n');
  
  const ownerPhone = '9800000099';
  
  try {
    // 1. Register owner
    const registerRes = await axios.post(`${BASE_URL}/agency/register-owner`, {
      full_name: 'Test Agency Owner',
      phone: ownerPhone
    });
    const devOtp = registerRes.data.dev_otp;
    console.log(`✓ Owner registered (OTP: ${devOtp})`);
    
    // 2. Verify owner
    await axios.post(`${BASE_URL}/agency/verify-owner`, {
      phone: ownerPhone,
      otp: devOtp
    });
    console.log(`✓ Owner verified`);
    
    // 3. Login
    const loginStartRes = await axios.post(`${BASE_URL}/agency/login/start-owner`, {
      phone: ownerPhone
    });
    const loginOtp = loginStartRes.data.dev_otp;
    
    const loginVerifyRes = await axios.post(`${BASE_URL}/agency/login/verify-owner`, {
      phone: ownerPhone,
      otp: loginOtp
    });
    const token = loginVerifyRes.data.token;
    console.log(`✓ Owner logged in`);
    
    // 4. Create agency
    const agencyRes = await axios.post(`${BASE_URL}/agencies/owner/agency`, {
      name: 'Test Recruitment Services',
      license_number: `LIC-TEST-${Date.now()}`,
      description: 'Test agency for dashboard analytics',
      address: 'Kathmandu, Nepal',
      phones: ['+977-1-4445566'],
      emails: ['test@recruitment.com']
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const agencyId = agencyRes.data.id;
    const license = agencyRes.data.license_number;
    console.log(`✓ Agency created (License: ${license})`);
    
    // 5. Create 10 jobs
    const createdJobs = [];
    for (let i = 0; i < 10; i++) {
      const jobTitle = JOB_TITLES[i % JOB_TITLES.length];
      const country = COUNTRIES[i % COUNTRIES.length];
      
      const jobRes = await axios.post(`${BASE_URL}/agencies/${license}/job-postings`, {
        posting_title: `${jobTitle} - ${country}`,
        country: country,
        city: 'Riyadh',
        posting_agency: license,
        employer: {
          company_name: `${country} Construction Co.`,
          country: country
        },
        contract: {
          duration_months: 24,
          contract_type: 'fixed_term'
        },
        positions: [{
          title: jobTitle,
          total_vacancies: 5,
          monthly_salary_amount: 1500 + (i * 100),
          salary_currency: 'USD',
          experience_required: `${1 + (i % 3)} years`
        }]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      createdJobs.push(jobRes.data);
      console.log(`✓ Job ${i + 1}/10: ${jobTitle} - ${country}`);
    }
    
    console.log(`\n✅ Created agency with ${createdJobs.length} jobs\n`);
    return { license, token, jobs: createdJobs };
    
  } catch (error) {
    console.error('❌ Failed to create agency:', error.response?.data || error.message);
    throw error;
  }
}

async function createCandidatesWithApplications(jobs) {
  console.log('\n👥 Step 2: Creating 20 Candidates with Applications');
  console.log('==========================================\n');
  
  let successCount = 0;
  let totalApplications = 0;
  
  for (let i = 0; i < 20; i++) {
    const phone = `98000000${String(i).padStart(2, '0')}`;
    const firstName = NEPALI_FIRST_NAMES[i % NEPALI_FIRST_NAMES.length];
    const lastName = NEPALI_LAST_NAMES[i % NEPALI_LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const gender = GENDERS[i % 2];
    const age = 20 + (i % 15);
    const district = DISTRICTS[i % DISTRICTS.length];
    
    try {
      console.log(`[${i + 1}/20] 👤 ${fullName} (${phone})`);
      
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
      
      // 3. Update profile
      await axios.patch(`${BASE_URL}/candidates/${candidateId}`, {
        full_name: fullName,
        age: age,
        gender: gender,
        district: district,
        municipality: `${district} Metro`,
        ward: Math.floor(Math.random() * 32) + 1,
        tole: `Tole ${Math.floor(Math.random() * 10) + 1}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 4. Apply to 1-3 random jobs
      const numApplications = Math.floor(Math.random() * 3) + 1;
      let applicationsCreated = 0;
      
      for (let j = 0; j < numApplications && j < jobs.length; j++) {
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        const position = randomJob.contracts?.[0]?.positions?.[0];
        
        if (!position) continue;
        
        try {
          await axios.post(`${BASE_URL}/applications/apply`, {
            candidate_id: candidateId,
            job_posting_id: randomJob.id,
            position_id: position.id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          applicationsCreated++;
          totalApplications++;
        } catch (appError) {
          // Skip if already applied
        }
      }
      
      console.log(`  ✓ Profile updated, ${applicationsCreated} applications`);
      successCount++;
      
    } catch (error) {
      console.error(`  ❌ Failed: ${error.response?.data?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n✅ Created ${successCount}/20 candidates with ${totalApplications} applications\n`);
  return { successCount, totalApplications };
}

async function main() {
  console.log('🌱 Complete Dashboard Data Seeder');
  console.log('==========================================');
  console.log(`📍 API URL: ${BASE_URL}\n`);
  
  try {
    // Step 1: Create agency with jobs
    const { license, token, jobs } = await createAgencyWithJobs();
    
    // Step 2: Create candidates and apply to jobs
    const { successCount, totalApplications } = await createCandidatesWithApplications(jobs);
    
    // Summary
    console.log('\n==========================================');
    console.log('📊 Seeding Complete!');
    console.log('==========================================');
    console.log(`🏢 Agency: ${license}`);
    console.log(`💼 Jobs: ${jobs.length}`);
    console.log(`👥 Candidates: ${successCount}/20`);
    console.log(`📝 Applications: ${totalApplications}`);
    console.log('\n📝 Next steps:');
    console.log('1. Login as agency owner: +9779800000099');
    console.log('2. Check dashboard: http://localhost:5851/dashboard');
    console.log('3. Verify analytics show real data\n');
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
