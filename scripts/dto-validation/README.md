# DTO Validation Scripts

This directory contains scripts for validating and enforcing DTO quality in the NestJS backend.

## Scripts

### validate-dtos.ts

Scans all DTO files and reports violations.

**Usage:**
```bash
npm run validate:dtos
npm run validate:dtos -- --verbose
npm run validate:dtos -- --no-fail  # Don't exit with error code
```

**What it checks:**
- All properties have @ApiProperty or @ApiPropertyOptional
- Optional properties use @ApiPropertyOptional
- Request DTOs have class-validator decorators
- Decorators include descriptions
- Proper naming conventions

**Output:**
- Summary statistics
- List of violations by file
- Suggestions for fixes
- Count of auto-fixable violations

### fix-dtos.ts

Automatically fixes common DTO violations.

**Usage:**
```bash
npm run validate:dtos:fix
npm run validate:dtos:fix -- --dry-run  # Preview without applying
npm run validate:dtos:fix -- --no-descriptions  # Skip description generation
```

**What it fixes:**
- Adds missing @ApiProperty/@ApiPropertyOptional decorators
- Replaces wrong decorator for optional properties
- Adds class-validator decorators for request DTOs
- Adds @IsOptional for optional properties
- Adds @IsArray for array properties
- Ensures proper imports

**What it doesn't fix:**
- @ValidateNested for nested objects (requires manual Type specification)
- Complex validation rules
- Custom decorators

### validate-controllers.ts

Validates that controllers properly use DTOs.

**Usage:**
```bash
npm run validate:controllers
```

**What it checks:**
- POST/PUT/PATCH methods have @Body() with DTO type
- All methods have @ApiResponse decorators
- Query parameters use DTOs for complex queries
- Referenced DTOs exist and are valid

### dto-metrics.ts

Generates DTO quality metrics.

**Usage:**
```bash
npm run dto:metrics
npm run dto:metrics -- --json  # Output as JSON
npm run dto:metrics -- --markdown  # Output as Markdown
npm run dto:metrics -- --threshold 80  # Fail if below 80%
npm run dto:metrics -- --compare previous-metrics.json  # Compare with previous
```

**Output:**
- Overall completion percentage
- Per-module statistics
- Trend comparison (if previous metrics provided)
- Progress bars

## Error Codes

| Code | Description |
|------|-------------|
| DTO001 | Class name must end with "Dto" |
| DTO002 | DTO file should be in dto/ directory |
| DTO003 | Property missing Swagger decorator |
| DTO004 | Wrong decorator for optional property |
| DTO005 | Swagger decorator missing description |
| DTO006 | Request DTO property missing validator |
| DTO007 | Optional property missing @IsOptional |
| DTO008 | Array property missing @IsArray |
| DTO009 | Nested object missing @ValidateNested |

## Integration

### Build Process

Validation runs automatically during build:

```json
{
  "scripts": {
    "build": "npm run validate:dtos && tsc -p tsconfig.build.json"
  }
}
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run validate:dtos
```

### CI/CD

Add to your CI pipeline:

```yaml
- name: Validate DTOs
  run: npm run validate:dtos

- name: Check DTO Quality
  run: npm run dto:metrics -- --threshold 80
```

## Development Workflow

1. **Write DTO**: Create your DTO with properties
2. **Run validation**: `npm run validate:dtos`
3. **Auto-fix**: `npm run validate:dtos:fix`
4. **Manual fixes**: Fix any remaining violations
5. **Verify**: `npm run validate:dtos` should pass
6. **Commit**: Changes are validated automatically

## Examples

### Check specific module

```bash
npm run validate:dtos -- --verbose | grep "agency"
```

### Fix and review changes

```bash
npm run validate:dtos:fix -- --dry-run
# Review the changes
npm run validate:dtos:fix
```

### Track progress

```bash
# Save current metrics
npm run dto:metrics -- --json > metrics-before.json

# Make fixes
npm run validate:dtos:fix

# Compare
npm run dto:metrics -- --compare metrics-before.json
```

## Troubleshooting

### "Cannot find module"

Make sure dependencies are installed:
```bash
npm install
```

### "No DTO files found"

Check that you're running from the project root and DTOs exist in `src/**/*.dto.ts`

### "TypeScript compilation errors"

Fix TypeScript errors first:
```bash
npm run build
```

### "Auto-fix not working"

Some violations require manual fixes:
- @ValidateNested requires specifying the Type
- Complex validation rules
- Custom decorators

## Contributing

When adding new validation rules:

1. Add error code to the list above
2. Update validation logic in `validate-dtos.ts`
3. Add auto-fix logic in `fix-dtos.ts` if possible
4. Update documentation
5. Add tests

## See Also

- [DTO Validation Guide](../../docs/DTO_VALIDATION_GUIDE.md) - Complete guide for developers
- [NestJS Validation](https://docs.nestjs.com/techniques/validation) - Official NestJS docs
- [Swagger Decorators](https://docs.nestjs.com/openapi/decorators) - Swagger decorator reference
