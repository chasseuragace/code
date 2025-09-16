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
    description: 'Select which categories to seed. By default, countries and job titles are enabled; agencies and sample_postings are disabled.',
    type: SeedRequestDto,
    examples: {
      defaultPrimaryOnly: {
        summary: 'Primary only (default behavior if body omitted)',
        value: { countries: true, job_titles: true, agencies: false, sample_postings: false },
      },
      everything: {
        summary: 'All categories',
        value: { countries: true, job_titles: true, agencies: true, sample_postings: true },
      },
      justJobs: {
        summary: 'Only sample job postings (assumes prereqs are seeded)',
        value: { countries: false, job_titles: false, agencies: false, sample_postings: true },
      },
      devSetup: {
        summary: 'Dev: create postings per agency and tag them',
        value: {
          countries: true,
          job_titles: true,
          agencies: true,
          sample_postings: false,
          dev_agency_postings_with_tags: true,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Seeding completed successfully with per-category counts',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(SeedCountsDto) },
        example: {
          countries: { affected: 46 },
          job_titles: { affected: 51 },
          agencies: { created: 10 },
          sample_postings: { created: 1 },
          dev_agency_postings_with_tags: { created: 10, tagged: 10 },
        },
      },
    },
  })
  @HttpCode(200)
  async seedSystem(@Body() body: SeedRequestDto) {
    return this.seedService.seedSystem(body);
  }
}
