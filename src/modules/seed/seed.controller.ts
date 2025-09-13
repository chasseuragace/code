import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiOkResponse, ApiTags, ApiProperty, ApiBody } from '@nestjs/swagger';

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
}

@ApiTags('Seed')
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
    },
  })
  @ApiOkResponse({
    description: 'Seeding completed successfully with per-category counts',
    type: SeedCountsDto,
    schema: {
      example: {
        countries: { affected: 46 },
        job_titles: { affected: 51 },
        agencies: { created: 10 },
        sample_postings: { created: 1 },
      },
    },
  })
  @HttpCode(200)
  async seedSystem(@Body() body: SeedRequestDto) {
    return this.seedService.seedSystem(body);
  }
}
