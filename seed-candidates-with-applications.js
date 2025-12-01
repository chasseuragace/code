/**
 * Candidate & Applications Seeder
 * Creates 20 candidates with profiles and applies them to random jobs
 * 
 * Usage: node seed-candidates-with-applications.js
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

const DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan',
  'Biratnagar', 'Dharan', 'Butwal', 'Hetauda', 'Janakpur'
];

async function getAvailableJobs() {
  try {
    // Get all job postings
    const response = await axios.get(`${BASE_URL}/job-postings`, {
      params: { page: 1, limit: 50 }
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }
    
    console.log('⚠️  No jobs found. Please seed agencies and jobs first.');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error.message);
    return [];
  }
}

async function seedCandidatesWithApplications() {
  console.log('🌱 Candidate & Applications Seeder');
  console.log('==========================================\n');
  console.log(`📍 API URL: ${BASE_URL}`);
  console.log(`👥 Creating 20 candidates with applications...\n`);
  
  // Get available jobs first
  const jobs = await getAvailableJobs();
  if (jobs.length === 0) {
    console.log('\n⚠️  No jobs available. Exiting...');
    return;
  }
  
  console.log(`✅ Found ${jobs.length} jobs to apply to\n`);
  
  let successCount = 0;
  let failCount = 0;
  let totalApplications = 0;
  
  for (let i = 0; i < 20; i++) {
    const phone = `98000000${String(i).padStart(2, '0')}`;
    const firstName = NEPALI_FIRST_NAMES[i % NEPALI_FIRST_NAMES.length];
    const lastName = NEPALI_LAST_NAMES[i % NEPALI_LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const gender = GENDERS[i % 2];
    const age = 20 + (i % 15); // Ages 20-34
    const district = DISTRICTS[i % DISTRICTS.length];
    
    try {
      console.log(`[${i + 1}/20] 👤 ${fullName} (${phone})`);
      
      // 1. Register candidate
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        full_name: fullName,
        phone
      });
      const devOtp = registerRes.data.dev_otp;
      console.log(`  ✓ Registered (OTP: ${devOtp})`);
      
      // 2. Verify OTP
      const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {
        phone,
        otp: devOtp
      });
      const token = verifyRes.data.token;
      const candidateId = verifyRes.data.candidate_id;
      console.log(`  ✓ Verified (ID: ${candidateId.substring(0, 8)}...)`);
      
      // 3. Update basic profile
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
      console.log(`  ✓ Profile updated (Age: ${age}, Gender: ${gender})`);
      
      // 4. Apply to random jobs (1-3 jobs per candidate)
      const numApplications = Math.floor(Math.random() * 3) + 1;
      const selectedJobs = [];
      
      // Select random jobs
      for (let j = 0; j < numApplications && j < jobs.length; j++) {
        const randomIndex = Math.floor(Math.random() * jobs.length);
        const job = jobs[randomIndex];
        
        // Avoid duplicate applications
        if (!selectedJobs.find(sj => sj.id === job.id)) {
          selectedJobs.push(job);
        }
      }
      
      let applicationsCreated = 0;
      for (const job of selectedJobs) {
        try {
          // Get job positions
          const jobDetailRes = await axios.get(`${BASE_URL}/job-postings/${job.id}`);
          const positions = jobDetailRes.data.contracts?.[0]?.positions || [];
          
          if (positions.length === 0) {
            console.log(`  ⚠️  Job ${job.posting_title} has no positions, skipping`);
            continue;
          }
          
          // Apply to first position
          const position = positions[0];
          
          await axios.post(`${BASE_URL}/applications/apply`, {
            candidate_id: candidateId,
            job_posting_id: job.id,
            position_id: position.id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          applicationsCreated++;
          totalApplications++;
          console.log(`  ✓ Applied to: ${job.posting_title} (${position.title})`);
        } catch (appError) {
          console.log(`  ⚠️  Failed to apply to ${job.posting_title}: ${appError.response?.data?.message || appError.message}`);
        }
      }
      
      console.log(`  ✅ Complete! (${applicationsCreated} applications)\n`);
      successCount++;
      
    } catch (error) {
      failCount++;
      console.error(`  ❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n==========================================');
  console.log('📊 Seeding Summary');
  console.log('==========================================');
  console.log(`✅ Success: ${successCount}/20 candidates`);
  console.log(`❌ Failed: ${failCount}/20 candidates`);
  console.log(`📝 Total Applications: ${totalApplications}`);
  console.log('\n🎉 Seeding complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Check dashboard: http://localhost:5851/dashboard');
  console.log('2. Verify analytics show updated data');
  console.log('3. Check applications page\n');
}

// Run the seeder
seedCandidatesWithApplications()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
