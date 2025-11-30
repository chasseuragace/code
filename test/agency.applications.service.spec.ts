import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyApplicationsService } from '../src/modules/agency/agency-applications.service';
import { JobApplication } from '../src/modules/application/job-application.entity';
import { JobPosting, JobPosition, JobContract } from '../src/modules/domain/domain.entity';
import { PostingAgency } from '../src/modules/domain/PostingAgency';
import { Candidate } from '../src/modules/candidate/candidate.entity';
import { CandidateJobProfile } from '../src/modules/candidate/candidate-job-profile.entity';
import { DataSource } from 'typeorm';

/**
 * Integration test for AgencyApplicationsService
 * 
 * This test suite validates the service layer for agency-wide application management.
 * It tests against a real database with actual data.
 * 
 * USAGE:
 * 1. Set the AGENCY_LICENSE environment variable to your test agency license
 * 2. Run: npm test -- agency.applications.service.spec.ts
 * 
 * Example:
 * AGENCY_LICENSE="LIC-AG-0001" npm test -- agency.applications.service.spec.ts
 */

describe('AgencyApplicationsService (Integration)', () => {
  let service: AgencyApplicationsService;
  let module: TestingModule;
  let dataSource: DataSource;

  // Get agency license from environment or use default
  const AGENCY_LICENSE = process.env.AGENCY_LICENSE || 'LIC-AG-0001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'udaan_sarathi',
          entities: [
            JobApplication,
            JobPosting,
            PostingAgency,
            Candidate,
            CandidateJobProfile,
            JobPosition,
            JobContract,
          ],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([
          JobApplication,
          JobPosting,
          PostingAgency,
          Candidate,
          CandidateJobProfile,
          JobPosition,
          JobContract,
        ]),
      ],
      providers: [AgencyApplicationsService],
    }).compile();

    service = module.get<AgencyApplicationsService>(AgencyApplicationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe('getAgencyApplications', () => {
    it('should fetch all applications for the agency', async () => {
      console.log(`\n🔍 Testing with agency license: ${AGENCY_LICENSE}\n`);

      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 1,
        limit: 10,
      });

      console.log('📊 Results:');
      console.log(`  Total applications: ${result.pagination.total}`);
      console.log(`  Page: ${result.pagination.page}/${result.pagination.totalPages}`);
      console.log(`  Load time: ${result.performance.loadTime}ms`);
      console.log(`  Query time: ${result.performance.queryTime}ms`);

      expect(result).toBeDefined();
      expect(result.applications).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThanOrEqual(0);

      if (result.applications.length > 0) {
        const firstApp = result.applications[0];
        console.log('\n📝 Sample Application:');
        console.log(`  ID: ${firstApp.id}`);
        console.log(`  Candidate: ${firstApp.candidate.full_name}`);
        console.log(`  Job: ${firstApp.job.posting_title}`);
        console.log(`  Company: ${firstApp.job.company_name}`);
        console.log(`  Status: ${firstApp.status}`);
        console.log(`  Priority Score: ${firstApp.priority_score}`);
        console.log(`  Skills: ${firstApp.candidate.skills.join(', ')}`);

        // Validate structure
        expect(firstApp.id).toBeDefined();
        expect(firstApp.candidate).toBeDefined();
        expect(firstApp.candidate.full_name).toBeDefined();
        expect(firstApp.job).toBeDefined();
        expect(firstApp.job.posting_title).toBeDefined();
        expect(firstApp.position).toBeDefined();
        expect(typeof firstApp.priority_score).toBe('number');
      }
    });

    it('should filter by status/stage', async () => {
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        stage: 'applied',
        page: 1,
        limit: 10,
      });

      console.log(`\n🔍 Filter by stage='applied':`);
      console.log(`  Found: ${result.applications.length} applications`);

      expect(result.applications).toBeInstanceOf(Array);
      result.applications.forEach(app => {
        expect(app.status).toBe('applied');
      });
    });

    it('should filter by country', async () => {
      // First, get available countries
      const countries = await service.getAgencyJobCountries(AGENCY_LICENSE);
      console.log(`\n🌍 Available countries: ${countries.join(', ')}`);

      if (countries.length > 0) {
        const testCountry = countries[0];
        const result = await service.getAgencyApplications(AGENCY_LICENSE, {
          country: testCountry,
          page: 1,
          limit: 10,
        });

        console.log(`\n🔍 Filter by country='${testCountry}':`);
        console.log(`  Found: ${result.applications.length} applications`);

        result.applications.forEach(app => {
          expect(app.job.country).toBe(testCountry);
        });
      }
    });

    it('should search across candidates and jobs', async () => {
      const searchTerm = 'a'; // Common letter to find matches

      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        search: searchTerm,
        page: 1,
        limit: 5,
      });

      console.log(`\n🔍 Search for '${searchTerm}':`);
      console.log(`  Found: ${result.applications.length} applications`);

      if (result.applications.length > 0) {
        console.log('  Matches:');
        result.applications.forEach(app => {
          console.log(`    - ${app.candidate.full_name} → ${app.job.posting_title}`);
        });
      }

      expect(result.applications).toBeInstanceOf(Array);
    });

    it('should paginate results correctly', async () => {
      const page1 = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 1,
        limit: 5,
      });

      const page2 = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 2,
        limit: 5,
      });

      console.log(`\n📄 Pagination test:`);
      console.log(`  Page 1: ${page1.applications.length} items`);
      console.log(`  Page 2: ${page2.applications.length} items`);
      console.log(`  Total: ${page1.pagination.total} items`);

      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);

      if (page1.pagination.total > 5) {
        expect(page1.pagination.hasNext).toBe(true);
        expect(page2.pagination.hasPrev).toBe(true);
      }
    });

    it('should sort by created_at descending (newest first)', async () => {
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        limit: 10,
      });

      console.log(`\n📅 Sort by created_at (desc):`);
      if (result.applications.length > 1) {
        const dates = result.applications.map(app => app.created_at.getTime());
        const isSorted = dates.every((date, i) => i === 0 || dates[i - 1] >= date);
        
        console.log(`  First: ${result.applications[0].created_at.toISOString()}`);
        console.log(`  Last: ${result.applications[result.applications.length - 1].created_at.toISOString()}`);
        console.log(`  Correctly sorted: ${isSorted ? '✅' : '❌'}`);

        expect(isSorted).toBe(true);
      }
    });

    it('should handle non-existent agency gracefully', async () => {
      await expect(
        service.getAgencyApplications('INVALID-LICENSE', {})
      ).rejects.toThrow('Agency with license INVALID-LICENSE not found');
    });

    it('should return empty results for agency with no jobs', async () => {
      // This test assumes there might be agencies with no job postings
      // If your test agency always has jobs, this test will be skipped
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        job_posting_id: '00000000-0000-0000-0000-000000000000', // Non-existent job
      });

      expect(result.applications).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getAgencyJobCountries', () => {
    it('should return unique countries from agency job postings', async () => {
      const countries = await service.getAgencyJobCountries(AGENCY_LICENSE);

      console.log(`\n🌍 Agency job countries:`);
      console.log(`  ${countries.join(', ')}`);

      expect(countries).toBeInstanceOf(Array);
      expect(countries.length).toBeGreaterThanOrEqual(0);

      // Check uniqueness
      const uniqueCountries = [...new Set(countries)];
      expect(countries.length).toBe(uniqueCountries.length);
    });
  });

  describe('getAgencyApplicationStatistics', () => {
    it('should return application statistics', async () => {
      const stats = await service.getAgencyApplicationStatistics(AGENCY_LICENSE);

      console.log(`\n📊 Application Statistics:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  By Status:`);
      Object.entries(stats.by_status).forEach(([status, count]) => {
        console.log(`    ${status}: ${count}`);
      });
      console.log(`  By Country:`);
      Object.entries(stats.by_country).forEach(([country, count]) => {
        console.log(`    ${country}: ${count}`);
      });

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(stats.by_status).toBeDefined();
      expect(stats.by_country).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should load applications in under 2 seconds', async () => {
      const startTime = Date.now();
      
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 1,
        limit: 50,
      });

      const totalTime = Date.now() - startTime;

      console.log(`\n⚡ Performance Test:`);
      console.log(`  Total time: ${totalTime}ms`);
      console.log(`  Query time: ${result.performance.queryTime}ms`);
      console.log(`  Processing time: ${totalTime - result.performance.queryTime}ms`);
      console.log(`  Applications loaded: ${result.applications.length}`);

      expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds
    });

    it('should handle large page sizes efficiently', async () => {
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 1,
        limit: 100,
      });

      console.log(`\n📦 Large page size test:`);
      console.log(`  Requested: 100 items`);
      console.log(`  Received: ${result.applications.length} items`);
      console.log(`  Load time: ${result.performance.loadTime}ms`);

      expect(result.performance.loadTime).toBeLessThan(3000);
    });
  });

  describe('Priority Score Calculation', () => {
    it('should calculate priority scores for all applications', async () => {
      const result = await service.getAgencyApplications(AGENCY_LICENSE, {
        page: 1,
        limit: 10,
      });

      console.log(`\n🎯 Priority Score Distribution:`);
      
      if (result.applications.length > 0) {
        const scores = result.applications.map(app => app.priority_score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        console.log(`  Average: ${avgScore.toFixed(2)}`);
        console.log(`  Max: ${maxScore}`);
        console.log(`  Min: ${minScore}`);

        result.applications.forEach(app => {
          expect(app.priority_score).toBeGreaterThanOrEqual(0);
          expect(app.priority_score).toBeLessThanOrEqual(100);
        });
      }
    });
  });
});
