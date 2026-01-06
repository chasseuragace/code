import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SeedService } from './seed.service';
import { CountryService } from '../country/country.service';
import { JobTitleService } from '../job-title/job-title.service';
import { DocumentTypeService } from '../candidate/document-type.service';

@Injectable()
export class AutoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AutoSeedService.name);

  constructor(
    private readonly seedService: SeedService,
    private readonly countryService: CountryService,
    private readonly jobTitleService: JobTitleService,
    private readonly documentTypeService: DocumentTypeService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('🌱 Checking if auto-seeding is needed...');
    
    try {
      const needsSeeding = await this.checkIfSeedingNeeded();
      
      if (needsSeeding) {
        this.logger.log('🚀 Empty database detected - starting auto-seeding...');
        await this.performAutoSeeding();
        this.logger.log('✅ Auto-seeding completed successfully');
      } else {
        this.logger.log('✅ Core reference data already exists - skipping auto-seeding');
      }
    } catch (error) {
      this.logger.error('❌ Auto-seeding failed:', error.message);
      // Don't throw - let the application start even if seeding fails
      // This prevents the app from crashing on startup
    }
  }

  private async checkIfSeedingNeeded(): Promise<boolean> {
    try {
      // Check if core reference data exists
      const [countriesCount, jobTitlesCount, documentTypesCount] = await Promise.all([
        this.countryService.count(),
        this.jobTitleService.count(),
        this.documentTypeService.count(),
      ]);

      // If any core reference data is missing, we need seeding
      const needsSeeding = countriesCount === 0 || jobTitlesCount === 0 || documentTypesCount === 0;
      
      this.logger.log(`📊 Current data counts: Countries: ${countriesCount}, Job Titles: ${jobTitlesCount}, Document Types: ${documentTypesCount}`);
      
      return needsSeeding;
    } catch (error) {
      this.logger.warn('⚠️ Could not check existing data - assuming seeding is needed:', error.message);
      return true;
    }
  }

  private async performAutoSeeding(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Seed core reference data only (not agencies or candidates)
      const results = await this.seedService.seedSystem({
        countries: true,
        job_titles: true,
        document_types: true,
        agencies: false,
        sample_postings: false,
        dev_agency_postings_with_tags: false,
      });

      const duration = Date.now() - startTime;
      
      this.logger.log('📊 Auto-seeding results:');
      if (results.countries) {
        this.logger.log(`  ✅ Countries: ${results.countries.affected} records`);
      }
      if (results.job_titles) {
        this.logger.log(`  ✅ Job Titles: ${results.job_titles.affected} records`);
      }
      if (results.document_types) {
        this.logger.log(`  ✅ Document Types: ${results.document_types.affected} records`);
      }
      
      this.logger.log(`⏱️ Auto-seeding completed in ${duration}ms`);
      
      // Validate that seeding was successful
      if (duration > 5000) {
        this.logger.warn('⚠️ Auto-seeding took longer than expected (>5s)');
      }
      
    } catch (error) {
      this.logger.error('💥 Auto-seeding failed:', error.message);
      throw error;
    }
  }
}