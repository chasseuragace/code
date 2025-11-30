# DTO Validation and Enforcement Guide

## Overview

This guide explains the DTO validation and enforcement system that ensures all DTOs in the backend have proper Swagger and class-validator decorators. The system prevents incomplete DTOs from being deployed by failing the build if violations are detected.

## Why DTO Validation Matters

Proper DTO decoration ensures:
- **Accurate OpenAPI Specification**: Frontend can generate correct TypeScript types
- **Runtime Validation**: Invalid requests are caught before reaching business logic
- **API Documentation**: Swagger UI shows complete, accurate API documentation
- **Type Safety**: Frontend and backend stay in sync automatically

## Quick Start

### Check Your DTOs

```bash
npm run validate:dtos
```

This will scan all DTO files and report any violations.

### Auto-Fix Common Issues

```bash
npm run validate:dtos:fix
```

This will automatically add missing decorators where possible.

### Check Controllers

```bash
npm run validate:controllers
```

This will ensure controllers properly use DTOs.

### View Metrics

```bash
npm run dto:metrics
```

This shows overall DTO quality metrics across the codebase.

## Creating Valid DTOs

### Response DTOs

Response DTOs should include "Response" in the name and have complete Swagger decorators:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgencyResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier of the agency',
    example: 'a3b5c8e2-1234-4f7a-9b0d-abcdef123456'
  })
  id: string;

  @ApiProperty({ 
    description: 'Name of the agency',
    example: 'Global Recruitment Services'
  })
  name: string;

  @ApiPropertyOptional({ 
    description: 'Agency website URL',
    example: 'https://example.com',
    nullable: true
  })
  website?: string | null;

  @ApiProperty({ 
    description: 'List of services offered',
    type: [String],
    example: ['recruitment', 'visa processing']
  })
  services: string[];
}
```

### Request DTOs

Request DTOs should include "Create", "Update", or "Query" in the name and have both Swagger and class-validator decorators:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsArray } from 'class-validator';

export class CreateAgencyDto {
  @ApiProperty({ 
    description: 'Name of the agency',
    example: 'Global Recruitment Services'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    description: 'Agency website URL',
    example: 'https://example.com'
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ 
    description: 'List of services offered',
    type: [String],
    example: ['recruitment', 'visa processing']
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}
```

### Nested DTOs

For nested objects, use `@ValidateNested` and `@Type`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  city: string;
}

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Company address',
    type: () => AddressDto
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## Validation Rules

### Required for All DTOs

1. **Class name must end with "Dto"**
   ```typescript
   export class AgencyResponseDto { } // ✅ Good
   export class Agency { }             // ❌ Bad
   ```

2. **File must be in a dto/ directory**
   ```
   src/modules/agency/dto/agency.dto.ts  // ✅ Good
   src/modules/agency/agency.dto.ts      // ⚠️  Warning
   ```

3. **Every property must have a Swagger decorator**
   ```typescript
   @ApiProperty({ description: '...', example: '...' })
   name: string;  // ✅ Good
   
   name: string;  // ❌ Bad - missing decorator
   ```

4. **Optional properties must use @ApiPropertyOptional**
   ```typescript
   @ApiPropertyOptional({ description: '...', example: '...' })
   website?: string;  // ✅ Good
   
   @ApiProperty({ description: '...', example: '...' })
   website?: string;  // ❌ Bad - should use @ApiPropertyOptional
   ```

### Required for Request DTOs

Request DTOs (Create*, Update*, Query*) must also have:

1. **Class-validator decorators on all properties**
   ```typescript
   @ApiProperty({ description: 'User email', example: 'user@example.com' })
   @IsEmail()
   @IsNotEmpty()
   email: string;  // ✅ Good
   
   @ApiProperty({ description: 'User email', example: 'user@example.com' })
   email: string;  // ❌ Bad - missing validators
   ```

2. **@IsOptional on optional properties**
   ```typescript
   @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
   @IsString()
   @IsOptional()
   phone?: string;  // ✅ Good
   ```

3. **@IsArray on array properties**
   ```typescript
   @ApiProperty({ description: 'Tags', type: [String], example: ['tag1', 'tag2'] })
   @IsArray()
   @IsString({ each: true })
   tags: string[];  // ✅ Good
   ```

4. **@ValidateNested on nested objects**
   ```typescript
   @ApiProperty({ description: 'Address', type: () => AddressDto })
   @ValidateNested()
   @Type(() => AddressDto)
   address: AddressDto;  // ✅ Good
   ```

## Controller Requirements

Controllers must properly use DTOs:

1. **POST/PUT/PATCH methods must have @Body() with DTO**
   ```typescript
   @Post()
   async create(@Body() createDto: CreateAgencyDto) {  // ✅ Good
     // ...
   }
   
   @Post()
   async create(@Body() data: any) {  // ❌ Bad - not using DTO
     // ...
   }
   ```

2. **All methods should have @ApiResponse**
   ```typescript
   @Get(':id')
   @ApiResponse({ type: AgencyResponseDto })
   async findOne(@Param('id') id: string) {  // ✅ Good
     // ...
   }
   ```

3. **Query parameters should use DTOs for complex queries**
   ```typescript
   @Get()
   async findAll(@Query() query: AgencyQueryDto) {  // ✅ Good
     // ...
   }
   ```

## Common Patterns

### Pagination DTOs

```typescript
export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
```

### Enum Properties

```typescript
enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'Status',
    enum: Status,
    example: Status.ACTIVE
  })
  @IsEnum(Status)
  status: Status;
}
```

### Date Properties

```typescript
export class CreateEventDto {
  @ApiProperty({ 
    description: 'Event date',
    type: Date,
    example: '2024-01-01T00:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  eventDate: Date;
}
```

## Troubleshooting

### "Property must have @ApiProperty decorator"

**Problem**: Property is missing Swagger decorator

**Solution**: Add `@ApiProperty` or `@ApiPropertyOptional`:
```typescript
@ApiProperty({ description: 'Property description', example: 'example value' })
propertyName: string;
```

### "Optional property must use @ApiPropertyOptional"

**Problem**: Using `@ApiProperty` on optional property

**Solution**: Replace with `@ApiPropertyOptional`:
```typescript
@ApiPropertyOptional({ description: '...', example: '...' })
optionalProperty?: string;
```

### "Property in request DTO must have class-validator decorator"

**Problem**: Request DTO property lacks validation

**Solution**: Add appropriate validator:
```typescript
@ApiProperty({ description: '...', example: '...' })
@IsString()  // Add this
@IsNotEmpty()  // And this if required
propertyName: string;
```

### "requestBody?: never in OpenAPI spec"

**Problem**: Controller method missing @Body() parameter or DTO

**Solution**: Add @Body() with proper DTO:
```typescript
@Post()
async create(@Body() createDto: CreateAgencyDto) {
  // ...
}
```

## Build Integration

The validation runs automatically during build:

```bash
npm run build
```

If violations are found, the build will fail with a detailed report.

To skip validation (not recommended):
```bash
tsc -p tsconfig.build.json
```

## IDE Integration

ESLint will show DTO violations in real-time in your IDE. Make sure ESLint is enabled in your editor.

### VS Code

Install the ESLint extension and it will automatically highlight DTO issues.

### Other IDEs

Most modern IDEs support ESLint. Check your IDE's documentation for setup instructions.

## Best Practices

1. **Always add descriptions**: They appear in Swagger UI and help frontend developers
2. **Provide realistic examples**: They're used in API documentation and testing
3. **Use specific validators**: `@IsEmail()` is better than `@IsString()`
4. **Document nullable fields**: Use `nullable: true` in @ApiProperty
5. **Keep DTOs focused**: One DTO per use case (Create, Update, Response)
6. **Reuse nested DTOs**: Don't duplicate nested object definitions
7. **Run validation before committing**: `npm run validate:dtos`

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run validate:dtos` | Validate all DTOs and report violations |
| `npm run validate:dtos:fix` | Auto-fix common violations |
| `npm run validate:dtos:fix -- --dry-run` | Preview fixes without applying |
| `npm run validate:controllers` | Validate controller DTO usage |
| `npm run dto:metrics` | Show DTO quality metrics |
| `npm run dto:metrics -- --json` | Output metrics as JSON |
| `npm run lint` | Run ESLint (includes DTO validation) |

## Getting Help

If you encounter issues:

1. Run `npm run validate:dtos -- --verbose` for detailed error messages
2. Check this guide for common patterns
3. Look at existing DTOs in the codebase for examples
4. Ask the team for help

## Summary

- All DTOs must have proper Swagger decorators
- Request DTOs must also have class-validator decorators
- Controllers must use DTOs for request/response types
- Run `npm run validate:dtos:fix` to auto-fix common issues
- Build will fail if violations exist
