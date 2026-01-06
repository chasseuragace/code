/**
 * Enhanced Comprehensive Test Data Seeder
 * Creates realistic test data with proper ownership relationships
 * 
 * Features:
 * - Uses existing data as templates when available
 * - Falls back to realistic data generation when templates are missing
 * - Maintains cultural authenticity and business logic
 * 
 * Creates:
 * - n candidates (cloned from template or generated)
 * - m agencies (cloned from template or generated) with owners
 * - p job postings per agency (cloned from template or generated)
 * - q positions per job posting (cloned from template or generated)
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
// REALISTIC DATA GENERATORS (FALLBACKS)
// ============================================================================

const NEPALI_NAMES = {
  male: [
    'Ram Bahadur', 'Hari Prasad', 'Krishna Bahadur', 'Bikash Kumar', 'Rajesh Bahadur',
    'Shyam Bahadur', 'Gopal Krishna', 'Narayan Prasad', 'Dipak Kumar', 'Suresh Bahadur',
    'Mahesh Kumar', 'Ramesh Prasad', 'Kiran Bahadur', 'Sanjay Kumar', 'Prakash Bahadur'
  ],
  female: [
    'Sita Kumari', 'Maya Devi', 'Gita Rani', 'Sunita Devi', 'Kamala Devi',
    'Rita Kumari', 'Laxmi Devi', 'Saraswati Kumari', 'Parvati Devi', 'Radha Kumari',
    'Mina Kumari', 'Shanti Devi', 'Indira Kumari', 'Geeta Devi', 'Sushila Kumari'
  ],
  surnames: [
    'Thapa', 'Sharma', 'Poudel', 'Gurung', 'Magar', 'Shrestha', 'Rai', 'Tamang', 
    'Karki', 'Adhikari', 'Khadka', 'Ghimire', 'Subedi', 'Regmi', 'Acharya'
  ]
};

const AGENCY_NAMES = [
  'Global Manpower Services', 'Himalayan Overseas Employment', 'Nepal Gulf Manpower',
  'Everest Recruitment Agency', 'Sagarmatha Employment Services', 'Annapurna Manpower Solutions',
  'Kanchenjunga Overseas', 'Lumbini Employment Agency', 'Chitwan Manpower Services',
  'Makalu International', 'Dhaulagiri Recruitment', 'Manaslu Employment Services'
];

const NEPALI_CITIES = [
  'Kathmandu', 'Pokhara', 'Biratnagar', 'Dharan', 'Butwal', 'Bharatpur',
  'Hetauda', 'Janakpur', 'Nepalgunj', 'Birgunj'
];

const NEPALI_ADDRESSES = [
  'Thamel, Kathmandu', 'New Baneshwor, Kathmandu', 'Putalisadak, Kathmandu',
  'Maharajgunj, Kathmandu', 'Kamaladi, Kathmandu', 'Lakeside, Pokhara',
  'Main Road, Biratnagar', 'BP Chowk, Dharan', 'Traffic Chowk, Butwal',
  'Narayangadh, Chitwan'
];

const DESTINATION_COUNTRIES = [
  { country: 'UAE', city: 'Dubai', currency: 'AED' },
  { country: 'Saudi Arabia', city: 'Riyadh', currency: 'SAR' },
  { country: 'Qatar', city: 'Doha', currency: 'QAR' },
  { country: 'Kuwait', city: 'Kuwait City', currency: 'KWD' },
  { country: 'Oman', city: 'Muscat', currency: 'OMR' },
  { country: 'Bahrain', city: 'Manama', currency: 'BHD' },
  { country: 'Malaysia', city: 'Kuala Lumpur', currency: 'MYR' }
];

const EMPLOYER_COMPANIES = [
  'Al Habtoor Group', 'SABIC', 'Qatar Airways', 'Kuwait Oil Company',
  'Petroleum Development Oman', 'Genting Group', 'Alba International',
  'Emirates Group', 'Saudi Aramco', 'Ooredoo Group'
];

const JOB_TITLES = [
  'Construction Worker', 'Security Guard', 'Housemaid', 'Driver', 'Cook',
  'Waiter', 'Cleaner', 'Electrician', 'Plumber', 'Carpenter', 'Welder',
  'Mechanic', 'Hotel Staff', 'Factory Worker', 'Farm Worker'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRealisticCandidate(index) {
  const gender = Math.random() > 0.3 ? 'Male' : 'Female'; // 70% male (realistic for foreign employment)
  const firstName = getRandomElement(NEPALI_NAMES[gender.toLowerCase()]);
  const surname = getRandomElement(NEPALI_NAMES.surnames);
  const fullName = `${firstName} ${surname}`;
  
  // Generate realistic birth date (18-45 years old)
  const age = 18 + Math.floor(Math.random() * 27);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const dateOfBirth = new Date(birthYear, birthMonth - 1, birthDay);
  
  // Generate realistic Nepali phone number
  const timestamp = Date.now();
  const phone = `98${Math.floor(Math.random() * 10)}${timestamp.toString().slice(-6)}${String(index).padStart(2, '0')}`;
  
  // Generate realistic address
  const district = getRandomElement(['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Morang', 'Sunsari', 'Rupandehi', 'Chitwan']);
  const address = {
    district: district,
    municipality: `${district} Municipality`,
    ward: Math.floor(Math.random() * 32) + 1
  };
  
  return {
    full_name: fullName,
    phone: phone,
    gender: gender,
    date_of_birth: dateOfBirth,
    address: address
  };
}

function generateRealisticAgency(index) {
  const name = getRandomElement(AGENCY_NAMES);
  const city = getRandomElement(NEPALI_CITIES);
  const address = getRandomElement(NEPALI_ADDRESSES);
  
  // Generate realistic license number
  const licenseNumber = `LIC-${String(index).padStart(3, '0')}-${new Date().getFullYear()}`;
  
  return {
    name: `${name} ${index > 1 ? index : ''}`.trim(),
    license_number: licenseNumber,
    country: 'Nepal',
    city: city,
    address: address,
    contact_email: `info@${name.toLowerCase().replace(/\s+/g, '')}${index}.com`,
    contact_phone: `+977-1-${String(4000000 + index).slice(-7)}`
  };
}

function generateRealisticEmployer(index) {
  const destination = getRandomElement(DESTINATION_COUNTRIES);
  const companyName = getRandomElement(EMPLOYER_COMPANIES);
  
  return {
    company_name: `${companyName} ${index > 1 ? `Branch ${index}` : ''}`.trim(),
    country: destination.country,
    city: destination.city
  };
}

function generateRealisticJobPosting(index) {
  const destination = getRandomElement(DESTINATION_COUNTRIES);
  const jobTitle = getRandomElement(JOB_TITLES);
  
  return {
    posting_title: `${jobTitle} - ${destination.country}`,
    city: destination.city,
    country: destination.country,
    notes: `Seeking experienced ${jobTitle.toLowerCase()} for ${destination.country}. Good salary and benefits provided.`
  };
}

function generateRealisticJobContract() {
  return {
    period_years: Math.random() > 0.7 ? 3 : 2, // Mostly 2 years, some 3 years
    renewable: Math.random() > 0.6, // 40% renewable
    hours_per_day: 8,
    days_per_week: 6,
    overtime_policy: getRandomElement(['as_per_company_policy', 'paid']), // Valid enum values only
    weekly_off_days: 1,
    food: getRandomElement(['free', 'paid']), // Valid enum values
    accommodation: getRandomElement(['free', 'paid']), // Valid enum values
    transport: getRandomElement(['free', 'paid']), // Valid enum values
    annual_leave_days: Math.random() > 0.5 ? 30 : 21 // 30 or 21 days
  };
}

// ============================================================================
// ENHANCED TEMPLATE FETCHERS WITH FALLBACKS
// ============================================================================

async function getTemplateCandidate() {
  try {
    const result = await pool.query(
      `SELECT id, full_name, phone, gender, date_of_birth, address
       FROM candidates
       WHERE full_name NOT LIKE 'Test Candidate%' AND full_name NOT LIKE 'Seed%'
       ORDER BY created_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.log('⚠️ Could not fetch candidate template, will use realistic data generation');
    return null;
  }
}

async function getTemplateAgency() {
  try {
    const result = await pool.query(
      `SELECT id, name, license_number, country, city, address, contact_email, contact_phone
       FROM posting_agencies
       WHERE name NOT LIKE 'Test Agency%' AND name NOT LIKE 'Seed%'
       ORDER BY created_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.log('⚠️ Could not fetch agency template, will use realistic data generation');
    return null;
  }
}

async function getTemplateEmployer() {
  try {
    const result = await pool.query(
      `SELECT id, company_name, country, city
       FROM employers
       WHERE company_name NOT LIKE 'Test Employer%' AND company_name NOT LIKE 'Seed%'
       ORDER BY created_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.log('⚠️ Could not fetch employer template, will use realistic data generation');
    return null;
  }
}

async function getTemplateJobPosting() {
  try {
    const result = await pool.query(
      `SELECT id, posting_title, city, country, notes
       FROM job_postings
       WHERE posting_title NOT LIKE 'Test Job%' AND posting_title NOT LIKE 'Seed%'
       ORDER BY created_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.log('⚠️ Could not fetch job posting template, will use realistic data generation');
    return null;
  }
}

async function getTemplateJobContract() {
  try {
    const result = await pool.query(
      `SELECT id, period_years, renewable, hours_per_day, days_per_week, overtime_policy, 
              weekly_off_days, food, accommodation, transport, annual_leave_days
       FROM job_contracts LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    console.log('⚠️ Could not fetch job contract template, will use realistic data generation');
    return null;
  }
}

// ============================================================================
// ENHANCED CREATORS WITH TEMPLATE FALLBACKS
// ============================================================================

async function createCandidate(index, template) {
  let candidateData;
  
  if (template) {
    // Use template-based generation
    const testNumber = String(index).padStart(3, '0');
    const timestamp = Date.now();
    const phone = `98999${timestamp.toString().slice(-5)}${String(index).padStart(2, '0')}`;
    const fullName = `Seed Candidate ${testNumber}`;
    
    candidateData = {
      full_name: fullName,
      phone: phone,
      gender: template.gender || 'Male',
      date_of_birth: template.date_of_birth || new Date('2000-01-01'),
      address: JSON.stringify(template.address || { district: 'Kathmandu' })
    };
  } else {
    // Use realistic data generation
    const realistic = generateRealisticCandidate(index);
    candidateData = {
      full_name: realistic.full_name,
      phone: realistic.phone,
      gender: realistic.gender,
      date_of_birth: realistic.date_of_birth,
      address: JSON.stringify(realistic.address)
    };
  }
  
  const result = await pool.query(
    `INSERT INTO candidates (id, full_name, phone, gender, date_of_birth, address, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [candidateData.full_name, candidateData.phone, candidateData.gender, candidateData.date_of_birth, candidateData.address]
  );
  return result.rows[0].id;
}

async function createAgency(index, template) {
  let agencyData;
  
  if (template) {
    // Use template-based generation
    const testNumber = String(index).padStart(2, '0');
    const licenseNumber = `SEED${Date.now()}${String(index).padStart(4, '0')}`;
    const name = `Seed Agency ${testNumber}`;
    
    agencyData = {
      name: name,
      license_number: licenseNumber,
      country: template.country || 'Nepal',
      city: template.city || 'Kathmandu',
      address: template.address || 'Test Address',
      contact_email: `agency${index}@test.com`,
      contact_phone: `+977-${String(index).padStart(10, '0')}`
    };
  } else {
    // Use realistic data generation
    const realistic = generateRealisticAgency(index);
    agencyData = realistic;
  }
  
  const result = await pool.query(
    `INSERT INTO posting_agencies (
      id, name, license_number, country, city, address, contact_email, contact_phone,
      is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()
    )
    RETURNING id`,
    [agencyData.name, agencyData.license_number, agencyData.country, agencyData.city, 
     agencyData.address, agencyData.contact_email, agencyData.contact_phone]
  );
  return result.rows[0].id;
}

async function createAgencyOwner(agencyId, index, ownerPhoneRaw) {
  const ownerName = `Seed Owner ${String(index).padStart(2, '0')}`;
  // Format phone with +977 prefix - MUST include prefix for login to work
  // Extract last 10 digits and prepend +977
  const phoneDigits = ownerPhoneRaw.replace(/\D/g, '').slice(-10);
  const ownerPhone = `+977${phoneDigits}`;
  
  // Create the user record
  const userResult = await pool.query(
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
  
  const userId = userResult.rows[0].id;
  
  // Create the agency_users record (required for auth service)
  await pool.query(
    `INSERT INTO agency_users (
      id, full_name, phone, user_id, agency_id, role, status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
    )`,
    [
      ownerName,
      ownerPhone,
      userId,
      agencyId,
      'owner',
      'active'
    ]
  );
  
  return userId;
}

async function createEmployer(index, template) {
  let employerData;
  
  if (template) {
    // Use template-based generation
    const testNumber = String(index).padStart(2, '0');
    const companyName = `Seed Employer ${testNumber}`;
    
    employerData = {
      company_name: companyName,
      country: template.country || 'UAE',
      city: template.city || 'Dubai'
    };
  } else {
    // Use realistic data generation
    employerData = generateRealisticEmployer(index);
  }
  
  const result = await pool.query(
    `INSERT INTO employers (id, company_name, country, city, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
     RETURNING id`,
    [employerData.company_name, employerData.country, employerData.city]
  );
  return result.rows[0].id;
}

async function createJobPosting(index, template) {
  let postingData;
  
  if (template) {
    // Use template-based generation
    const testNumber = String(index).padStart(3, '0');
    const postingTitle = `Seed Job ${testNumber}`;
    
    postingData = {
      posting_title: postingTitle,
      city: template.city || 'Dubai',
      country: template.country || 'UAE',
      notes: template.notes || 'Test job posting'
    };
  } else {
    // Use realistic data generation
    postingData = generateRealisticJobPosting(index);
  }
  
  const result = await pool.query(
    `INSERT INTO job_postings (
      id, posting_title, city, country, notes, is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW()
    )
    RETURNING id`,
    [postingData.posting_title, postingData.city, postingData.country, postingData.notes]
  );
  return result.rows[0].id;
}

async function createJobContract(jobPostingId, employerId, agencyId, template) {
  let contractData;
  
  if (template) {
    // Use template-based generation
    contractData = {
      period_years: template.period_years || 2,
      renewable: template.renewable || false,
      hours_per_day: template.hours_per_day || 8,
      days_per_week: template.days_per_week || 6,
      overtime_policy: template.overtime_policy || 'as_per_company_policy',
      weekly_off_days: template.weekly_off_days || 1,
      food: template.food || 'free',
      accommodation: template.accommodation || 'free',
      transport: template.transport || 'free',
      annual_leave_days: template.annual_leave_days || 20
    };
  } else {
    // Use realistic data generation
    contractData = generateRealisticJobContract();
  }
  
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
      jobPostingId, employerId, agencyId,
      contractData.period_years, contractData.renewable,
      contractData.hours_per_day, contractData.days_per_week, contractData.overtime_policy,
      contractData.weekly_off_days, contractData.food, contractData.accommodation,
      contractData.transport, contractData.annual_leave_days
    ]
  );
  return result.rows[0].id;
}

async function createJobPosition(index, contractId) {
  const testNumber = String(index).padStart(2, '0');
  const title = `Seed Position ${testNumber}`;
  
  // Generate realistic salary based on destination country
  const baseSalary = 2000 + (index * 200); // Base salary range
  const currency = getRandomElement(['AED', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD', 'MYR']);
  
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
      Math.floor(Math.random() * 3) + 1, // 1-3 male vacancies
      Math.floor(Math.random() * 2), // 0-1 female vacancies
      baseSalary,
      currency
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
  console.log('🌱 Enhanced Comprehensive Test Data Seeder');
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
    // Fetch templates (will return null if missing)
    console.log('🔍 Fetching templates...');
    const templateCandidate = await getTemplateCandidate();
    const templateAgency = await getTemplateAgency();
    const templateEmployer = await getTemplateEmployer();
    const templateJobPosting = await getTemplateJobPosting();
    const templateJobContract = await getTemplateJobContract();
    
    // Report template availability
    const templatesFound = [templateCandidate, templateAgency, templateEmployer, templateJobPosting, templateJobContract].filter(Boolean).length;
    console.log(`✅ Templates found: ${templatesFound}/5`);
    
    if (templatesFound === 0) {
      console.log('🎯 No templates found - using realistic data generation');
    } else if (templatesFound < 5) {
      console.log('🔄 Some templates missing - using hybrid approach (templates + realistic data)');
    } else {
      console.log('�r All templates found - using template-based generation');
    }
    console.log('');
    
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
        name: `${templateAgency ? 'Seed Agency' : 'Realistic Agency'} ${String(a).padStart(2, '0')}`,
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
    
    console.log('\n📋 Data Generation Method:');
    if (templatesFound === 0) {
      console.log('   🎯 100% Realistic data generation (no templates available)');
    } else if (templatesFound < 5) {
      console.log(`   🔄 Hybrid approach (${templatesFound}/5 templates used, rest realistic)`);
    } else {
      console.log('   📋 Template-based generation (all templates available)');
    }
    
    console.log('\n📋 Created Agencies with Owners:');
    createdAgencies.forEach(agency => {
      console.log(`   - ${agency.name}: ${agency.phone}`);
      console.log(`     Owner Phone: ${agency.ownerPhone} (ID: ${agency.ownerId.substring(0, 8)}...)`);
    });
    
    console.log('\n📋 Agency Job Postings (for testing):');
    agencyPostingPositions.forEach((item, idx) => {
      const agency = createdAgencies.find(a => a.id === item.agencyId);
      console.log(`   Posting ${idx + 1}: ${item.jobPostingId.substring(0, 8)}...`);
      console.log(`     Agency: ${agency.name}`);
      console.log(`     Positions: ${item.positions.length}`);
    });
    
    console.log('\n🎉 Seeding complete!');
    
    // Test URLs
    console.log('\n🔗 Test URLs:');
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
