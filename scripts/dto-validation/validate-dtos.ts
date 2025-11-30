#!/usr/bin/env ts-node

import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'fast-glob';
import * as ts from 'typescript';

interface ValidationError {
  severity: 'error' | 'warning';
  file: string;
  line: number;
  column: number;
  className: string;
  propertyName: string;
  code: string;
  message: string;
  suggestion?: string;
  autoFixable: boolean;
}

interface ValidationReport {
  summary: {
    totalFiles: number;
    totalDtos: number;
    totalProperties: number;
    validProperties: number;
    invalidProperties: number;
    completionPercentage: number;
  };
  violations: ValidationError[];
  fixableCount: number;
  timestamp: string;
}

interface ValidationOptions {
  fix?: boolean;
  verbose?: boolean;
  failOnError?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
}

class DtoValidator {
  private errors: ValidationError[] = [];
  private totalProperties = 0;
  private validProperties = 0;
  private totalDtos = 0;

  async validate(options: ValidationOptions = {}): Promise<ValidationReport> {
    const {
      verbose = false,
      failOnError = true,
      includePatterns = ['src/**/*.dto.ts'],
      excludePatterns = ['node_modules/**', 'dist/**', 'coverage/**'],
    } = options;

    console.log('🔍 Scanning for DTO files...\n');

    // Find all DTO files
    const files = await glob(includePatterns, {
      ignore: excludePatterns,
      absolute: true,
      cwd: process.cwd(),
    });

    if (files.length === 0) {
      console.log('⚠️  No DTO files found matching pattern:', includePatterns);
      return this.generateReport(files.length);
    }

    console.log(`Found ${files.length} DTO file(s)\n`);

    // Validate each file
    for (const file of files) {
      if (verbose) {
        console.log(`Validating: ${path.relative(process.cwd(), file)}`);
      }
      await this.validateFile(file);
    }

    const report = this.generateReport(files.length);

    // Print report
    this.printReport(report, verbose);

    // Exit with error code if violations found and failOnError is true
    if (failOnError && report.violations.length > 0) {
      process.exit(1);
    }

    return report;
  }

  private async validateFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    this.visitNode(sourceFile, filePath);
  }

  private visitNode(node: ts.Node, filePath: string): void {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;
      
      // Check if this is a DTO class
      if (className.endsWith('Dto')) {
        this.totalDtos++;
        this.validateDtoClass(node, className, filePath);
      }
    }

    ts.forEachChild(node, (child) => this.visitNode(child, filePath));
  }

  private validateDtoClass(
    classNode: ts.ClassDeclaration,
    className: string,
    filePath: string
  ): void {
    // Validate naming conventions
    if (!className.endsWith('Dto')) {
      this.addError({
        severity: 'error',
        file: filePath,
        line: this.getLineNumber(classNode),
        column: 0,
        className,
        propertyName: '',
        code: 'DTO001',
        message: `Class name must end with "Dto" suffix`,
        autoFixable: false,
      });
    }

    // Check if file is in dto/ directory
    if (!filePath.includes('/dto/')) {
      this.addError({
        severity: 'warning',
        file: filePath,
        line: this.getLineNumber(classNode),
        column: 0,
        className,
        propertyName: '',
        code: 'DTO002',
        message: `DTO file should be in a dto/ directory`,
        autoFixable: false,
      });
    }

    const isRequestDto = this.isRequestDto(className);

    // Validate each property
    classNode.members.forEach((member) => {
      if (ts.isPropertyDeclaration(member) && member.name) {
        const propertyName = member.name.getText();
        this.totalProperties++;
        
        const isValid = this.validateProperty(
          member,
          propertyName,
          className,
          filePath,
          isRequestDto
        );

        if (isValid) {
          this.validProperties++;
        }
      }
    });
  }

  private validateProperty(
    property: ts.PropertyDeclaration,
    propertyName: string,
    className: string,
    filePath: string,
    isRequestDto: boolean
  ): boolean {
    let isValid = true;
    const line = this.getLineNumber(property);
    const isOptional = property.questionToken !== undefined;

    // Check for Swagger decorators
    const decorators = this.getDecorators(property);
    const hasApiProperty = decorators.some((d) => d.includes('ApiProperty'));
    const hasApiPropertyOptional = decorators.some((d) =>
      d.includes('ApiPropertyOptional')
    );
    const hasSwaggerDecorator = hasApiProperty || hasApiPropertyOptional;

    if (!hasSwaggerDecorator) {
      this.addError({
        severity: 'error',
        file: filePath,
        line,
        column: 0,
        className,
        propertyName,
        code: 'DTO003',
        message: `Property "${propertyName}" must have @ApiProperty or @ApiPropertyOptional decorator`,
        suggestion: `Add ${isOptional ? '@ApiPropertyOptional' : '@ApiProperty'}({ description: '...', example: '...' })`,
        autoFixable: true,
      });
      isValid = false;
    } else {
      // Validate correct decorator for optionality
      if (isOptional && hasApiProperty && !hasApiPropertyOptional) {
        this.addError({
          severity: 'error',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO004',
          message: `Optional property "${propertyName}" must use @ApiPropertyOptional instead of @ApiProperty`,
          suggestion: 'Replace @ApiProperty with @ApiPropertyOptional',
          autoFixable: true,
        });
        isValid = false;
      }

      // Check for description in decorator
      const swaggerDecorator = decorators.find(
        (d) => d.includes('ApiProperty') || d.includes('ApiPropertyOptional')
      );
      if (swaggerDecorator && !swaggerDecorator.includes('description')) {
        this.addError({
          severity: 'warning',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO005',
          message: `@ApiProperty for "${propertyName}" should include a description`,
          suggestion: 'Add description: "..." to decorator options',
          autoFixable: true,
        });
      }
    }

    // Validate class-validator decorators for request DTOs
    if (isRequestDto) {
      const hasValidator = decorators.some(
        (d) =>
          d.includes('IsString') ||
          d.includes('IsNumber') ||
          d.includes('IsBoolean') ||
          d.includes('IsDate') ||
          d.includes('IsArray') ||
          d.includes('IsObject') ||
          d.includes('IsEnum') ||
          d.includes('IsEmail') ||
          d.includes('IsUrl') ||
          d.includes('IsUUID') ||
          d.includes('ValidateNested') ||
          d.includes('IsOptional')
      );

      if (!hasValidator) {
        this.addError({
          severity: 'error',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO006',
          message: `Property "${propertyName}" in request DTO must have class-validator decorator`,
          suggestion: 'Add appropriate validator like @IsString(), @IsNumber(), etc.',
          autoFixable: true,
        });
        isValid = false;
      }

      // Check for @IsOptional on optional properties
      if (isOptional && !decorators.some((d) => d.includes('IsOptional'))) {
        this.addError({
          severity: 'error',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO007',
          message: `Optional property "${propertyName}" must have @IsOptional decorator`,
          suggestion: 'Add @IsOptional() decorator',
          autoFixable: true,
        });
        isValid = false;
      }

      // Check for @IsArray on array properties
      if (this.isArrayType(property) && !decorators.some((d) => d.includes('IsArray'))) {
        this.addError({
          severity: 'error',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO008',
          message: `Array property "${propertyName}" must have @IsArray decorator`,
          suggestion: 'Add @IsArray() decorator',
          autoFixable: true,
        });
        isValid = false;
      }

      // Check for @ValidateNested on object properties
      if (this.isObjectType(property) && !decorators.some((d) => d.includes('ValidateNested'))) {
        this.addError({
          severity: 'error',
          file: filePath,
          line,
          column: 0,
          className,
          propertyName,
          code: 'DTO009',
          message: `Nested object property "${propertyName}" must have @ValidateNested and @Type decorators`,
          suggestion: 'Add @ValidateNested() and @Type(() => NestedDto) decorators',
          autoFixable: false,
        });
        isValid = false;
      }
    }

    return isValid;
  }

  private getDecorators(node: ts.PropertyDeclaration): string[] {
    const decorators: string[] = [];
    
    if (node.modifiers) {
      node.modifiers.forEach((modifier) => {
        if (ts.isDecorator(modifier)) {
          decorators.push(modifier.getText());
        }
      });
    }

    // TypeScript 5.0+ uses decorators property
    if ((node as any).decorators) {
      (node as any).decorators.forEach((decorator: any) => {
        decorators.push(decorator.getText());
      });
    }

    return decorators;
  }

  private isRequestDto(className: string): boolean {
    return (
      className.includes('Create') ||
      className.includes('Update') ||
      className.includes('Query') ||
      className.includes('Input')
    );
  }

  private isArrayType(property: ts.PropertyDeclaration): boolean {
    if (!property.type) return false;
    return ts.isArrayTypeNode(property.type);
  }

  private isObjectType(property: ts.PropertyDeclaration): boolean {
    if (!property.type) return false;
    if (ts.isTypeReferenceNode(property.type)) {
      const typeName = property.type.typeName.getText();
      return typeName !== 'Date' && typeName !== 'String' && typeName !== 'Number' && typeName !== 'Boolean';
    }
    return false;
  }

  private getLineNumber(node: ts.Node): number {
    const sourceFile = node.getSourceFile();
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return line + 1;
  }

  private addError(error: ValidationError): void {
    this.errors.push(error);
  }

  private generateReport(totalFiles: number): ValidationReport {
    const fixableCount = this.errors.filter((e) => e.autoFixable).length;

    return {
      summary: {
        totalFiles,
        totalDtos: this.totalDtos,
        totalProperties: this.totalProperties,
        validProperties: this.validProperties,
        invalidProperties: this.totalProperties - this.validProperties,
        completionPercentage:
          this.totalProperties > 0
            ? Math.round((this.validProperties / this.totalProperties) * 100)
            : 100,
      },
      violations: this.errors,
      fixableCount,
      timestamp: new Date().toISOString(),
    };
  }

  private printReport(report: ValidationReport, verbose: boolean): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DTO Validation Report');
    console.log('='.repeat(80) + '\n');

    // Summary
    console.log('Summary:');
    console.log(`  Total Files:      ${report.summary.totalFiles}`);
    console.log(`  Total DTOs:       ${report.summary.totalDtos}`);
    console.log(`  Total Properties: ${report.summary.totalProperties}`);
    console.log(`  Valid Properties: ${report.summary.validProperties}`);
    console.log(`  Invalid Properties: ${report.summary.invalidProperties}`);
    console.log(`  Completion:       ${report.summary.completionPercentage}%`);
    console.log(`  Fixable Violations: ${report.fixableCount}\n`);

    if (report.violations.length === 0) {
      console.log('✅ All DTOs are valid!\n');
      return;
    }

    // Group violations by file
    const violationsByFile = new Map<string, ValidationError[]>();
    report.violations.forEach((violation) => {
      const file = path.relative(process.cwd(), violation.file);
      if (!violationsByFile.has(file)) {
        violationsByFile.set(file, []);
      }
      violationsByFile.get(file)!.push(violation);
    });

    console.log(`❌ Found ${report.violations.length} violation(s) in ${violationsByFile.size} file(s):\n`);

    // Print violations by file
    violationsByFile.forEach((violations, file) => {
      console.log(`📄 ${file}`);
      violations.forEach((violation) => {
        const icon = violation.severity === 'error' ? '  ❌' : '  ⚠️ ';
        console.log(`${icon} Line ${violation.line}: [${violation.code}] ${violation.message}`);
        if (violation.className) {
          console.log(`     Class: ${violation.className}`);
        }
        if (violation.propertyName) {
          console.log(`     Property: ${violation.propertyName}`);
        }
        if (violation.suggestion && verbose) {
          console.log(`     💡 Suggestion: ${violation.suggestion}`);
        }
        if (violation.autoFixable) {
          console.log(`     🔧 Auto-fixable`);
        }
        console.log('');
      });
    });

    console.log('='.repeat(80));
    console.log(`\n💡 To auto-fix violations, run: npm run validate:dtos:fix\n`);
  }
}

// Main execution
async function main() {
  const validator = new DtoValidator();
  
  const options: ValidationOptions = {
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
    failOnError: !process.argv.includes('--no-fail'),
  };

  try {
    await validator.validate(options);
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DtoValidator, ValidationOptions, ValidationReport, ValidationError };
