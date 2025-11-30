import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AgencyApplicationsService } from './src/modules/agency/agency-applications.service';

/**
 * Simple test script for AgencyApplicationsService
 * Run with: npm run start:dev (in another terminal) then:
 * docker exec nest_server npx ts-node test-agency-applications-simple.ts
 */

const AGENCY_LICENSE = 'REG-2025-793487';

async function testAgencyApplications() {
  console.log('🚀 Testing AgencyApplicationsService\n');
  console.log(`📋 Agency License: ${AGENCY_LICENSE}\n`);

  try {
    // Bootstrap the application
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    // Get the service
    const service = app.get(AgencyApplicationsService);

    console.log('✅ Service initialized\n');

    // Test 1: Get all applications
    console.log('📊 Test 1: Fetching all applications...');
    const result = await service.getAgencyApplications(AGENCY_LICENSE, {
      page: 1,
      limit: 10,
    });

    console.log(`  Total applications: ${result.pagination.total}`);
    console.log(`  Page: ${result.pagination.page}/${result.pagination.totalPages}`);
    console.log(`  Applications returned: ${result.applications.length}`);
    console.log(`  Unique candidates: ${Object.keys(result.candidates).length}`);
    console.log(`  Unique jobs: ${Object.keys(result.jobs).length}`);
    console.log(`  Unique positions: ${Object.keys(result.positions).length}`);
    console.log(`  Load time: ${result.performance.loadTime}ms`);
    console.log(`  Query time: ${result.performance.queryTime}ms\n`);

    if (result.applications.length > 0) {
      const firstApp = result.applications[0];
      const candidate = result.candidates[firstApp.candidate_id];
      const job = result.jobs[firstApp.job_posting_id];
      const position = result.positions[firstApp.position_id];

      console.log('📝 Sample Application:');
      console.log(`  Application ID: ${firstApp.id}`);
      console.log(`  Candidate: ${candidate.full_name} (${candidate.phone})`);
      console.log(`  Job: ${job.posting_title}`);
      console.log(`  Company: ${job.company_name}`);
      console.log(`  Position: ${position?.title || 'N/A'}`);
      console.log(`  Status: ${firstApp.status}`);
      console.log(`  Priority Score: ${firstApp.priority_score}`);
      console.log(`  Skills: ${candidate.skills.slice(0, 3).join(', ')}${candidate.skills.length > 3 ? '...' : ''}`);
      console.log(`  Applied: ${firstApp.created_at.toISOString()}\n`);
    }

    // Test 2: Filter by status
    console.log('📊 Test 2: Filtering by status="applied"...');
    const appliedResult = await service.getAgencyApplications(AGENCY_LICENSE, {
      stage: 'applied',
      page: 1,
      limit: 5,
    });
    console.log(`  Found: ${appliedResult.applications.length} applications\n`);

    // Test 3: Get countries
    console.log('📊 Test 3: Getting available countries...');
    const countries = await service.getAgencyJobCountries(AGENCY_LICENSE);
    console.log(`  Countries: ${countries.join(', ')}\n`);

    // Test 4: Get statistics
    console.log('📊 Test 4: Getting application statistics...');
    const stats = await service.getAgencyApplicationStatistics(AGENCY_LICENSE);
    console.log(`  Total: ${stats.total}`);
    console.log(`  By Status:`);
    Object.entries(stats.by_status).forEach(([status, count]) => {
      console.log(`    ${status}: ${count}`);
    });
    console.log(`  By Country:`);
    Object.entries(stats.by_country).forEach(([country, count]) => {
      console.log(`    ${country}: ${count}`);
    });
    console.log('');

    // Test 5: Search
    if (result.applications.length > 0) {
      const firstCandidate = result.candidates[result.applications[0].candidate_id];
      const searchTerm = firstCandidate.full_name.split(' ')[0];
      
      console.log(`📊 Test 5: Searching for "${searchTerm}"...`);
      const searchResult = await service.getAgencyApplications(AGENCY_LICENSE, {
        search: searchTerm,
        page: 1,
        limit: 5,
      });
      console.log(`  Found: ${searchResult.applications.length} applications\n`);
    }

    // Test 6: Pagination
    console.log('📊 Test 6: Testing pagination...');
    const page1 = await service.getAgencyApplications(AGENCY_LICENSE, {
      page: 1,
      limit: 3,
    });
    const page2 = await service.getAgencyApplications(AGENCY_LICENSE, {
      page: 2,
      limit: 3,
    });
    console.log(`  Page 1: ${page1.applications.length} items`);
    console.log(`  Page 2: ${page2.applications.length} items`);
    console.log(`  Has next: ${page1.pagination.hasNext}`);
    console.log(`  Has prev (page 2): ${page2.pagination.hasPrev}\n`);

    console.log('✅ All tests completed successfully!');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAgencyApplications();
