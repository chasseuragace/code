import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiOkResponse, ApiTags, ApiProperty, ApiBody, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

class SeedCountsDto {
  // number of upserted/created rows per category
  @ApiProperty({ required: false, nullable: true, description: 'Number of country rows upserted', example: { affected: 46 } })
  countries?: { affected: number } | null;

  @ApiProperty({ required: false, nullable: true, description: 'Number of job title rows upserted', example: { affected: 51 } })
  job_titles?: { affected: number } | null;

  @ApiProperty({ required: false, nullable: true, description: 'Number of agencies created (skips existing by license)', example: { created: 10 } })
  agencies?: { created: number } | null;

  @ApiProperty({ required: false, nullable: true, description: 'Number of agency owners created', example: { created: 5 } })
  agency_owners?: { created: number } | null;

  @ApiProperty({ required: false, nullable: true, description: 'Number of sample postings created', example: { created: 1 } })
  sample_postings?: { created: number } | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Dev: Number of postings created and tagged across seeded agencies',
    example: { created: 10, tagged: 10 },
  })
  dev_agency_postings_with_tags?: { created: number; tagged: number } | null;
}

class SeedRequestDto {
  @ApiProperty({ description: 'Seed countries (primary). Default: true', required: false, default: true })
  countries?: boolean;


  @ApiProperty({ description: 'Seed job titles (primary). Default: true', required: false, default: true })
  job_titles?: boolean;

  @ApiProperty({ description: 'Seed agencies (secondary). Default: false', required: false, default: false })
  agencies?: boolean;

  @ApiProperty({ description: 'Seed sample job postings (secondary). Default: false', required: false, default: false })
  sample_postings?: boolean;

  @ApiProperty({
    description: 'Dev: create at least one posting per seeded agency and tag them for frontend testing. Default: false',
    required: false,
    default: false,
  })
  dev_agency_postings_with_tags?: boolean;
}

@ApiTags('Seed')
@ApiExtraModels(SeedCountsDto)
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  
  // POST /seed/seedSystem
  @Post('seedSystem')
  @ApiOperation({
    summary: 'Seed system with core data',
    description:
      'Idempotently seeds base reference data such as countries, job titles, agencies, and a sample job posting for smoke testing. Safe to run multiple times.',
  })
  @ApiBody({
    description:
      'Select which categories to seed. By default, countries and job titles are enabled; agencies and sample_postings are disabled.',
    type: SeedRequestDto,
    examples: {
      defaultPrimaryOnly: {
        summary: 'Primary only (default behavior if body omitted)',
        value: { countries: true, job_titles: true, agencies: false, sample_postings: false ,},
      },
      everything: {
        summary: 'All ',
        value: { countries: true, job_titles: true, agencies: true,
          
          sample_postings: true, dev_agency_postings_with_tags: true },
      },
    
    },
  })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Seed operation completed', type: SeedCountsDto })
  async seedSystem(@Body() body: SeedRequestDto) {
    const result: SeedCountsDto = {};
    if (body.countries !== false) result.countries = await this.seedService.seedCountries();
    if (body.job_titles !== false) result.job_titles = await this.seedService.seedJobTitles();
    if (body.agencies !== false) {
      result.agencies = await this.seedService.seedAgencies(true);
    }
    if (body.sample_postings !== false) result.sample_postings = await this.seedService.seedSamplePostings();
    if (body.dev_agency_postings_with_tags !== false) {
      result.dev_agency_postings_with_tags = await this.seedService.seedDevAgencyPostingsWithTags();
    }
    return result;
  }

  
}
