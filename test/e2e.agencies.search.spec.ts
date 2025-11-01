import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Agency search functionality
 * Tests the GET /agencies/search endpoint with keyword search and filters
 */
describe('E2E: Agency Search', () => {
  let app: INestApplication;
  let testAgencies: Array<{ id: string; name: string; license_number: string }> = [];

  beforeAll(async () => {
    // Skip pre-test cleanup as per user request
    
    // Create test agencies with all fields populated
    const timestamp = Date.now();
    const testAgenciesData = [
      {
        name: 'Tech Recruiters Nepal',
        license_number: `TECH-${timestamp}-1`,
        description: 'Leading IT recruitment agency in Nepal specializing in tech talent placement',
        city: 'Kathmandu',
        country: 'Nepal',
        website: 'https://tech-recruiters.com',
        logo_url: 'https://tech-recruiters.com/logo.png',
        banner_url: 'https://tech-recruiters.com/banner.jpg',
        established_year: 2018,
        phone: '+977-1-1234567',
        mobile: '+977-9876543210',
        email: 'info@tech-recruiters.com',
        address: 'Durbar Marg, Kathmandu',
        postal_code: '44600',
        latitude: 27.7131,
        longitude: 85.3170,
        is_active: true,
        services: ['IT Recruitment', 'Staff Augmentation', 'Tech Training'],
        social_media: {
          facebook: 'https://facebook.com/techrecruiters',
          linkedin: 'https://linkedin.com/company/techrecruiters',
          twitter: 'https://twitter.com/techrecruiters',
          instagram: 'https://instagram.com/techrecruiters'
        },
        bank_details: {
          bank_name: 'Nepal Investment Bank',
          account_name: 'Tech Recruiters Nepal Pvt. Ltd.',
          account_number: '1234567890',
          swift_code: 'NIBLNPKT'
        },
        contact_persons: [
          {
            name: 'Rajesh Sharma',
            position: 'Recruitment Manager',
            phone: '+977-9876543211',
            email: 'rajesh@tech-recruiters.com',
            is_primary: true
          }
        ],
        operating_hours: {
          weekdays: '09:00 AM - 06:00 PM',
          saturday: '09:00 AM - 01:00 PM',
          sunday: 'Closed'
        },
        specializations: ['IT', 'Software Development', 'AI/ML', 'Cloud Computing'],
        target_countries: ['Nepal', 'USA', 'Australia', 'UK'],
        statistics: {
          total_placements: 1200,
          active_since: '2018-01-15',
          success_rate: 94.5
        },
        settings: {
          currency: 'USD',
          timezone: 'Asia/Kathmandu',
          notification_preferences: {
            email: true,
            sms: true,
            push: true
          }
        }
      },
      {
        name: 'Global Manpower Solutions',
        license_number: `GMS-${timestamp}-2`,
        description: 'Global recruitment for construction and engineering professionals',
        city: 'Doha',
        country: 'Qatar',
        website: 'https://globalmanpower.qa',
        logo_url: 'https://globalmanpower.qa/logo.png',
        banner_url: 'https://globalmanpower.qa/banner.jpg',
        established_year: 2015,
        phone: '+974-12345678',
        mobile: '+974-98765432',
        email: 'contact@globalmanpower.qa',
        address: 'West Bay, Doha',
        postal_code: '12345',
        latitude: 25.3158,
        longitude: 51.5308,
        is_active: true,
        services: ['Overseas Recruitment', 'Visa Processing', 'Training'],
        social_media: {
          facebook: 'https://facebook.com/globalmanpower',
          linkedin: 'https://linkedin.com/company/globalmanpower',
          twitter: 'https://twitter.com/globalmanpower',
          instagram: 'https://instagram.com/globalmanpower'
        },
        bank_details: {
          bank_name: 'Qatar National Bank',
          account_name: 'Global Manpower Solutions WLL',
          account_number: '9876543210',
          swift_code: 'QNBQQASD'
        },
        contact_persons: [
          {
            name: 'Ahmed Al-Mansoori',
            position: 'Operations Director',
            phone: '+974-98765433',
            email: 'ahmed@globalmanpower.qa',
            is_primary: true
          }
        ],
        operating_hours: {
          weekdays: '08:00 AM - 05:00 PM',
          saturday: '08:00 AM - 01:00 PM',
          sunday: 'Closed'
        },
        specializations: ['Construction', 'Engineering', 'Oil & Gas', 'Infrastructure'],
        target_countries: ['Qatar', 'UAE', 'Saudi Arabia', 'Oman'],
        statistics: {
          total_placements: 8500,
          active_since: '2015-05-10',
          success_rate: 97.2
        },
        settings: {
          currency: 'QAR',
          timezone: 'Asia/Qatar',
          notification_preferences: {
            email: true,
            sms: true,
            push: false
          }
        }
      },
      {
        name: 'Healthcare Recruiters International',
        license_number: `HCR-${timestamp}-3`,
        description: 'Specialized in healthcare professionals placement worldwide',
        city: 'Dubai',
        country: 'UAE',
        website: 'https://healthcarerecruiters.ae',
        logo_url: 'https://healthcarerecruiters.ae/logo.png',
        banner_url: 'https://healthcarerecruiters.ae/banner.jpg',
        established_year: 2017,
        phone: '+971-4-1234567',
        mobile: '+971-501234567',
        email: 'info@healthcarerecruiters.ae',
        address: 'Dubai Healthcare City',
        postal_code: '12345',
        latitude: 25.2048,
        longitude: 55.2708,
        is_active: true,
        services: ['Healthcare Recruitment', 'Nursing Staffing', 'Medical Training'],
        social_media: {
          facebook: 'https://facebook.com/healthcarerecruiters',
          linkedin: 'https://linkedin.com/company/healthcarerecruiters',
          twitter: 'https://twitter.com/hcrecruiters',
          instagram: 'https://instagram.com/healthcarerecruiters'
        },
        bank_details: {
          bank_name: 'Emirates NBD',
          account_name: 'Healthcare Recruiters International FZ-LLC',
          account_number: '1122334455',
          swift_code: 'EBILAEAD'
        },
        contact_persons: [
          {
            name: 'Dr. Sarah Al-Mansoori',
            position: 'Medical Director',
            phone: '+971-501234568',
            email: 'sarah@healthcarerecruiters.ae',
            is_primary: true
          },
          {
            name: 'James Wilson',
            position: 'Recruitment Manager',
            phone: '+971-501234569',
            email: 'james@healthcarerecruiters.ae',
            is_primary: false
          }
        ],
        operating_hours: {
          weekdays: '08:30 AM - 06:30 PM',
          saturday: '09:00 AM - 02:00 PM',
          sunday: 'Closed'
        },
        specializations: ['Nursing', 'Doctors', 'Allied Health', 'Pharmacy'],
        target_countries: ['UAE', 'Qatar', 'Oman', 'Saudi Arabia'],
        statistics: {
          total_placements: 3200,
          active_since: '2017-03-20',
          success_rate: 95.8
        },
        settings: {
          currency: 'AED',
          timezone: 'Asia/Dubai',
          notification_preferences: {
            email: true,
            sms: false,
            push: true
          }
        }
      }
    ];
    
    // Now create our test app
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Skip cleanup as per user request
    await app?.close();
  });

  // Define interface for test agency data
  interface ContactPerson {
    name: string;
    position: string;
    phone: string;
    email: string;
    is_primary: boolean;
  }

  interface SocialMedia {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: string | undefined;
  }

  interface BankDetails {
    bank_name: string;
    account_name: string;
    account_number: string;
    swift_code: string;
  }

  interface OperatingHours {
    weekdays: string;
    saturday?: string;
    sunday?: string;
    [key: string]: string | undefined;
  }

  interface Statistics {
    total_placements: number;
    active_since: string;
    success_rate: number;
  }

  interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
  }

  interface AgencySettings {
    currency: string;
    timezone: string;
    notification_preferences: NotificationPreferences;
  }

  interface TestAgencyData {
    name: string;
    license_number: string;
    description: string;
    city: string;
    country: string;
    website: string;
    logo_url: string;
    banner_url?: string;
    established_year?: number;
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    services?: string[];
    social_media?: SocialMedia;
    bank_details?: BankDetails;
    contact_persons?: ContactPerson[];
    operating_hours?: OperatingHours;
    specializations: string[];
    target_countries: string[];
    statistics?: Statistics;
    settings?: AgencySettings;
  }

  // Helper function to create a test agency with comprehensive data
  const createTestAgency = async (data: Partial<TestAgencyData> = {}) => {
    const timestamp = Date.now();
    const defaultData: TestAgencyData = {
      name: `Test Agency ${timestamp}`,
      license_number: `TEST-${timestamp}`,
      description: 'Comprehensive test agency with all fields populated',
      city: 'Test City', 'country': 'Test Country',
      website: 'https://test-agency.com',
      logo_url: 'https://test-agency.com/logo.png',
      banner_url: 'https://test-agency.com/banner.jpg',
      established_year: 2020,
      phone: '+977-1-1234567',
      mobile: '+977-9876543210',
      email: `test+${timestamp}@agency.com`,
      address: '123 Test Street, Test Area',
      postal_code: '44600',
      latitude: 27.7172,
      longitude: 85.3240,
      is_active: true,
      services: ['Recruitment', 'Visa Processing', 'Training'],
      social_media: {
        facebook: 'https://facebook.com/testagency',
        linkedin: 'https://linkedin.com/company/testagency',
        twitter: 'https://twitter.com/testagency',
        instagram: 'https://instagram.com/testagency'
      },
      bank_details: {
        bank_name: 'Test Bank',
        account_name: 'Test Agency Pvt. Ltd.',
        account_number: '1234567890',
        swift_code: 'TESTNPKA'
      },
      contact_persons: [
        {
          name: 'Test Manager',
          position: 'Operations Manager',
          phone: '+977-9876543211',
          email: 'manager@test-agency.com',
          is_primary: true
        }
      ],
      operating_hours: {
        weekdays: '09:00 AM - 06:00 PM',
        saturday: '09:00 AM - 02:00 PM',
        sunday: 'Closed'
      },
      specializations: ['IT', 'Engineering', 'Healthcare'],
      target_countries: ['Nepal', 'Qatar', 'UAE', 'Malaysia'],
      statistics: {
        total_placements: 1500,
        active_since: '2020-01-01',
        success_rate: 92.5
      },
      settings: {
        currency: 'USD',
        timezone: 'Asia/Kathmandu',
        notification_preferences: {
          email: true,
          sms: true,
          push: true
        }
      }
    };

    const agencyData = { ...defaultData, ...data };

    const res = await request(app.getHttpServer())
      .post('/agencies')
      .send(agencyData)
      .expect(201);
    
    if (res.body?.id) {
      testAgencies.push({
        id: res.body.id,
        name: agencyData.name,
        license_number: agencyData.license_number,
      });
      return res.body;
    }
    return null;
  }

  it('creates test agencies with diverse data for searching', async () => {
    // Clear any existing test agencies
    testAgencies = [];
    
    // Create test agencies from the predefined data
    const testAgenciesData = [
      {
        name: 'Tech Recruiters Nepal',
        license_number: `TECH-${Date.now()}-1`,
        description: 'Leading IT recruitment agency in Nepal',
        city: 'Kathmandu',
        country: 'Nepal',
        website: 'https://tech-recruiters.com',
        logo_url: 'https://tech-recruiters.com/logo.png',
        specializations: ['IT', 'Software Development'],
        target_countries: ['Nepal', 'USA', 'Australia'],
        is_active: true
      },
      {
        name: 'Global Manpower Solutions',
        license_number: `GMS-${Date.now()}-2`,
        description: 'Global recruitment for construction and engineering',
        city: 'Doha',
        country: 'Qatar',
        website: 'https://globalmanpower.qa',
        logo_url: 'https://globalmanpower.qa/logo.png',
        specializations: ['Construction', 'Engineering'],
        target_countries: ['Qatar', 'UAE', 'Saudi Arabia'],
        is_active: true
      },
      {
        name: 'Healthcare Recruiters',
        license_number: `HCR-${Date.now()}-3`,
        description: 'Specialized in healthcare professionals placement',
        city: 'Dubai',
        country: 'UAE',
        website: 'https://healthcarerecruiters.ae',
        logo_url: 'https://healthcarerecruiters.ae/logo.png',
        specializations: ['Healthcare', 'Nursing'],
        target_countries: ['UAE', 'Qatar', 'Oman'],
        is_active: true
      }
    ];

    for (const agencyData of testAgenciesData) {
      await createTestAgency(agencyData);
    }

    expect(testAgencies.length).toBe(3);
  });

  it('searches agencies by keyword: "tech" should find tech-related agencies', async () => {
    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'tech' })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toBeInstanceOf(Array);
    
    // Should find both active tech agencies
    const foundAgencies: string[] = res.body.data.map((a: any) => a.name);
    expect(foundAgencies).toContain('Tech Recruiters Nepal');
    // expect(foundAgencies).not.toContain('IT Recruiters'); // Should be filtered out (inactive)
  });

  it('searches agencies by location: "Kathmandu"', async () => {
    // First, create a unique agency for this test
    const testAgency = await createTestAgency({
      name: 'Kathmandu Test Agency',
      license_number: `KT-${Date.now()}`,
      description: 'Test agency in Kathmandu',
      city: 'Kathmandu',
      country: 'Nepal',
      specializations: ['Testing'],
      target_countries: ['Nepal'],
      is_active: true,
    });

    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'Kathmandu' })
      .expect(200);

    // We should find at least our test agency
    const foundAgencies: string[] = res.body.data.map((a: any) => a.name);
    expect(foundAgencies).toContain('Kathmandu Test Agency');
  });

  it('searches agencies by specialization: "construction"', async () => {
    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'construction' })
      .expect(200);

    const foundAgencies: string[] = res.body.data.map((a: any) => a.name);
    // Check for the test agencies we created in this test run
    expect(foundAgencies).toContain('Global Manpower Solutions');
    // Don't check exact length as there might be other agencies in the database
  });

  it('searches agencies by target country: "Qatar"', async () => {
    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'Qatar' })
      .expect(200);

    const foundAgencies: string[] = res.body.data.map((a: any) => a.name);
    // Check for the test agency we created in this test run
    expect(foundAgencies).toContain('Global Manpower Solutions');
    // Don't check exact length as there might be other agencies in the database
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'nonexistentkeyword123' })
      .expect(200);

    expect(res.body.data).toEqual([]);
  });

  it('supports pagination', async () => {
    // Create a unique prefix for this test run to avoid conflicts
    const testPrefix = `PAG-${Date.now()}`;
    const testAgencies: any[] = [];
    
    // Create 3 test agencies for this specific test
    for (let i = 0; i < 3; i++) {
      testAgencies.push(await createTestAgency({
        name: `${testPrefix} Agency ${i}`,
        license_number: `${testPrefix}-${i}`,
        description: `Test agency ${i}`,
        city: 'Test City',
        country: 'Test Country',
        specializations: ['Testing'],
        target_countries: ['Testland'],
        is_active: true,
      }));
    }

    // First page
    const page1 = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ 
        keyword: testPrefix, // Use the unique prefix to only find our test agencies
        page: 1, 
        limit: 1 
      })
      .expect(200);

    expect(page1.body.data).toHaveLength(1);
    
    // Get the total count from the response
    const { total, totalPages } = page1.body.meta;
    
    // Verify pagination metadata makes sense
    expect(page1.body.meta).toMatchObject({
      page: 1,
      limit: 1,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
    
    // Verify the math works out
    expect(totalPages).toBe(Math.ceil(total / 1));
    
    // We should have exactly 3 test agencies matching our search
    expect(total).toBe(3);

    // Second page
    const page2 = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ page: 2, limit: 1 })
      .expect(200);

    expect(page2.body.data).toHaveLength(1);
    expect(page2.body.meta.page).toBe(2);
  });

  it('sorts results by name in ascending order', async () => {
    // Create a unique prefix for this test run to avoid conflicts
    const testPrefix = `SORT-${Date.now()}`;
    const testNames = ['Zeta Agency', 'Alpha Solutions', 'Beta Recruiters'];
    
    // Create test agencies with known names for this test
    for (const name of testNames) {
      await createTestAgency({
        name: `${testPrefix} ${name}`,
        license_number: `${testPrefix}-${name.replace(/\s+/g, '-').toLowerCase()}`,
        description: 'Test agency for sorting',
        city: 'Test City',
        country: 'Test Country',
        specializations: ['Testing'],
        target_countries: ['Testland'],
        is_active: true,
      });
    }

    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ 
        keyword: testPrefix, // Only find our test agencies
        sortBy: 'name', 
        sortOrder: 'asc',
        limit: 10 // Make sure we get all results
      })
      .expect(200);

    // Verify we got exactly 3 results
    expect(res.body.data).toHaveLength(3);
    
    // Get just the names and remove the test prefix for comparison
    const resultNames = res.body.data
      .map((a: any) => a.name.replace(`${testPrefix} `, ''));
      
    // Should be sorted alphabetically
    const expectedOrder = [...testNames].sort();
    expect(resultNames).toEqual(expectedOrder);
  });

  it('validates query parameters', async () => {
    // Test invalid sortBy
    await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ sortBy: 'invalid_field' })
      .expect(400);

    // Test invalid sortOrder
    await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ sortOrder: 'invalid_direction' })
      .expect(400);

    // Test invalid page
    await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ page: 0 })
      .expect(400);

    // Test invalid limit (too high)
    await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ limit: 101 })
      .expect(400);
  });

  it('agencies starting with "Sur" should have more than one job posting', async () => {
    // Search for agencies starting with 'Suresh'
    const res = await request(app.getHttpServer())
      .get('/agencies/search')
      .query({ keyword: 'Suresh' })
      .expect(200);

    // Find the Suresh agency in the results
    const sureshAgency = res.body.data.find(
      (a: any) => a.name === 'Suresh International Recruitment Pvt. Ltd' && 
                  a.id === '7eff7573-e4b3-4f1d-9c24-922c670c17c6'
    );
    
    // Verify the agency exists and has job postings
    expect(sureshAgency).toBeDefined();
    
    // Debug output
    console.log(`Agency found: ${sureshAgency.name} (ID: ${sureshAgency.id})`);
    console.log(`Job posting count: ${sureshAgency.job_posting_count}`);
    
    // Verify the job posting count is greater than 1
    expect(sureshAgency.job_posting_count).toBeGreaterThan(1);
  });
});
