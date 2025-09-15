import { Controller, Post, HttpCode, Get, Query, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CountryService } from './country.service';
import * as fs from 'fs';
import * as path from 'path';
import { CountryResponseDto, SeedCountriesResponseDto, CountryQueryParamsDto } from './dto/country.dto';

@ApiTags('Countries')
@Controller('countries')
@UseInterceptors(ClassSerializerInterceptor)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({ summary: 'List all countries', description: 'Retrieve a list of all countries with their details' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved countries',
    type: [CountryResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Internal server error' 
  })
  @ApiQuery({ 
    name: 'search', 
    required: false,
    description: 'Search by country name or code',
    type: String 
  })
  async list(@Query() query: CountryQueryParamsDto): Promise<CountryResponseDto[]> {
    if (query.search) {
      return this.countryService.findByNameOrCode(query.search);
    }
    return this.countryService.listAll();
  }

  // SeedV1: upsert countries from JSON file
  @Post('seedv1')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Seed countries', 
    description: 'Seed the database with countries from a JSON file' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully seeded countries',
    type: SeedCountriesResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid seed data or file not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Internal server error during seeding' 
  })
  async seedV1(): Promise<SeedCountriesResponseDto> {
    const seedPath = path.resolve(process.cwd(), 'src/seed/countries.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const rows = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    if (!Array.isArray(rows)) {
      throw new Error('countries.seed.json must contain an array');
    }
    const res = await this.countryService.upsertMany(rows);
    return { 
      source: 'src/seed/countries.seed.json', 
      affected: res.affected 
    };
  }
}
