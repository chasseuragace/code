#!/usr/bin/env ts-node

import { Project, SourceFile, PropertyDeclaration, SyntaxKind } from 'ts-morph';
import * as glob from 'fast-glob';
import * as path from 'path';

interface Fix {
  file: string;
  line: number;
  originalCode: string;
  fixedCode: string;
  decoratorAdded: string;
}

interface FixOptions {
  dryRun?: boolean;
  preserveFormatting?: boolean;
  addDescriptions?: boolean;
}

class DtoFixer {
  private project: Project;
  private fixes: Fix[] = [];

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });
  }

  async fix(options: FixOptions = {}): Promise<Fix[]> {
    const {
      dryRun = false,
      preserveFormatting = true,
      addDescriptions = true,
    } = options;

    console.log('🔧 Scanning for fixable DTO violations...\n');

    // Find all DTO files
    const files = await glob(['src/**/*.dto.ts'], {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      absolute: true,
      cwd: process.cwd(),
    });

    if (files.length === 0) {
      console.log('⚠️  No DTO files found');
      return [];
    }

    console.log(`Found ${files.length} DTO file(s)\n`);

    // Add files to project
    files.forEach((file) => {
      this.project.addSourceFileAtPath(file);
    });

    // Fix each file
    const sourceFiles = this.project.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      await this.fixFile(sourceFile, addDescriptions);
    }

    // Save changes if not dry run
    if (!dryRun && this.fixes.length > 0) {
      console.log('💾 Saving changes...\n');
      await this.project.save();
      console.log('✅ Changes saved successfully\n');
    }

    // Print summary
    this.printSummary(dryRun);

    return this.fixes;
  }

  private async fixFile(sourceFile: SourceFile, addDescriptions: boolean): Promise<void> {
    const classes = sourceFile.getClasses();

    for (const classDecl of classes) {
      const className = classDecl.getName();
      if (!className || !className.endsWith('Dto')) continue;

      const isRequestDto = this.isRequestDto(className);

      // Fix each property
      const properties = classDecl.getProperties();
      for (const property of properties) {
        await this.fixProperty(property, className, isRequestDto, addDescriptions);
      }
    }
  }

  private async fixProperty(
    property: PropertyDeclaration,
    className: string,
    isRequestDto: boolean,
    addDescriptions: boolean
  ): Promise<void> {
    const propertyName = property.getName();
    const isOptional = property.hasQuestionToken();
    const originalCode = property.getText();

    // Get existing decorators
    const decorators = property.getDecorators();
    const decoratorNames = decorators.map((d) => d.getName());

    const hasApiProperty = decoratorNames.includes('ApiProperty');
    const hasApiPropertyOptional = decoratorNames.includes('ApiPropertyOptional');
    const hasSwaggerDecorator = hasApiProperty || hasApiPropertyOptional;

    let modified = false;

    // Add missing Swagger decorator
    if (!hasSwaggerDecorator) {
      const decoratorName = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
      const description = addDescriptions
        ? this.generateDescription(propertyName)
        : propertyName.replace(/_/g, ' ');
      const example = this.generateExample(property);

      const decoratorText = `@${decoratorName}({ description: '${description}', example: ${example} })`;
      
      property.addDecorator({
        name: decoratorName,
        arguments: [`{ description: '${description}', example: ${example} }`],
      });

      this.addFix({
        file: property.getSourceFile().getFilePath(),
        line: property.getStartLineNumber(),
        originalCode,
        fixedCode: property.getText(),
        decoratorAdded: decoratorText,
      });

      modified = true;

      // Ensure import exists
      this.ensureImport(property.getSourceFile(), decoratorName, '@nestjs/swagger');
    }

    // Add description to existing Swagger decorator if missing
    if (hasSwaggerDecorator && addDescriptions) {
      const swaggerDecorator = decorators.find(
        (d) => d.getName() === 'ApiProperty' || d.getName() === 'ApiPropertyOptional'
      );
      
      if (swaggerDecorator) {
        const args = swaggerDecorator.getArguments();
        const description = this.generateDescription(propertyName);
        const example = this.generateExample(property);
        
        // Check if description is missing
        let needsDescription = false;
        let newArgText = '';
        
        if (args.length === 0) {
          // No arguments at all - add description and example
          needsDescription = true;
          newArgText = `{ description: '${description}', example: ${example} }`;
        } else {
          const argText = args[0].getText();
          if (!argText.includes('description:')) {
            needsDescription = true;
            // Parse existing options and add description
            if (argText === '{}') {
              newArgText = `{ description: '${description}', example: ${example} }`;
            } else {
              // Add description as first property
              newArgText = argText.replace(/^\{/, `{ description: '${description}',`);
            }
          }
        }
        
        if (needsDescription) {
          // Get decorator name BEFORE removing
          const decoratorName = swaggerDecorator.getName();
          swaggerDecorator.remove();
          property.addDecorator({
            name: decoratorName,
            arguments: [newArgText],
          });
          
          this.addFix({
            file: property.getSourceFile().getFilePath(),
            line: property.getStartLineNumber(),
            originalCode,
            fixedCode: property.getText(),
            decoratorAdded: `Added description to ${decoratorName}`,
          });
          
          modified = true;
        }
      }
    }

    // Fix wrong decorator for optional property
    if (isOptional && hasApiProperty && !hasApiPropertyOptional) {
      const apiPropertyDecorator = decorators.find((d) => d.getName() === 'ApiProperty');
      if (apiPropertyDecorator) {
        // Get arguments BEFORE removing the decorator
        const args = apiPropertyDecorator.getArguments().map((a) => a.getText());
        apiPropertyDecorator.remove();
        property.addDecorator({
          name: 'ApiPropertyOptional',
          arguments: args,
        });

        this.addFix({
          file: property.getSourceFile().getFilePath(),
          line: property.getStartLineNumber(),
          originalCode,
          fixedCode: property.getText(),
          decoratorAdded: 'Replaced @ApiProperty with @ApiPropertyOptional',
        });

        modified = true;

        this.ensureImport(property.getSourceFile(), 'ApiPropertyOptional', '@nestjs/swagger');
      }
    }

    // Add class-validator decorators for request DTOs
    if (isRequestDto) {
      const typeText = property.getType().getText();

      // Add @IsOptional for optional properties
      if (isOptional && !decoratorNames.includes('IsOptional')) {
        property.addDecorator({ name: 'IsOptional', arguments: [] });
        this.ensureImport(property.getSourceFile(), 'IsOptional', 'class-validator');
        modified = true;
      }

      // Add type-specific validators
      if (!this.hasTypeValidator(decoratorNames)) {
        const validator = this.inferValidator(typeText);
        if (validator) {
          property.addDecorator({ name: validator, arguments: [] });
          this.ensureImport(property.getSourceFile(), validator, 'class-validator');
          modified = true;
        }
      }

      // Add @IsArray for array types
      if (typeText.includes('[]') && !decoratorNames.includes('IsArray')) {
        property.addDecorator({ name: 'IsArray', arguments: [] });
        this.ensureImport(property.getSourceFile(), 'IsArray', 'class-validator');
        modified = true;
      }

      if (modified) {
        this.addFix({
          file: property.getSourceFile().getFilePath(),
          line: property.getStartLineNumber(),
          originalCode,
          fixedCode: property.getText(),
          decoratorAdded: 'Added class-validator decorators',
        });
      }
    }
  }

  private hasTypeValidator(decoratorNames: string[]): boolean {
    const typeValidators = [
      'IsString',
      'IsNumber',
      'IsBoolean',
      'IsDate',
      'IsArray',
      'IsObject',
      'IsEnum',
      'IsEmail',
      'IsUrl',
      'IsUUID',
      'ValidateNested',
    ];
    return decoratorNames.some((name) => typeValidators.includes(name));
  }

  private inferValidator(typeText: string): string | null {
    if (typeText.includes('string')) return 'IsString';
    if (typeText.includes('number')) return 'IsNumber';
    if (typeText.includes('boolean')) return 'IsBoolean';
    if (typeText.includes('Date')) return 'IsDate';
    if (typeText.includes('[]')) return 'IsArray';
    return null;
  }

  private generateDescription(propertyName: string): string {
    // Convert snake_case or camelCase to readable text
    const words = propertyName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();
    
    // Capitalize first letter
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  private generateExample(property: PropertyDeclaration): string {
    const typeText = property.getType().getText();

    if (typeText.includes('string')) {
      const name = property.getName();
      if (name.includes('email')) return "'user@example.com'";
      if (name.includes('url') || name.includes('link')) return "'https://example.com'";
      if (name.includes('phone')) return "'+1234567890'";
      if (name.includes('name')) return "'Example Name'";
      return "'example'";
    }

    if (typeText.includes('number')) {
      const name = property.getName();
      if (name.includes('age')) return '25';
      if (name.includes('year')) return '2024';
      if (name.includes('count') || name.includes('total')) return '10';
      return '0';
    }

    if (typeText.includes('boolean')) return 'true';
    if (typeText.includes('Date')) return "new Date('2024-01-01')";
    if (typeText.includes('[]')) return '[]';

    return 'null';
  }

  private isRequestDto(className: string): boolean {
    return (
      className.includes('Create') ||
      className.includes('Update') ||
      className.includes('Query') ||
      className.includes('Input')
    );
  }

  private ensureImport(sourceFile: SourceFile, name: string, moduleSpecifier: string): void {
    const existingImport = sourceFile.getImportDeclaration(moduleSpecifier);

    if (existingImport) {
      const namedImports = existingImport.getNamedImports();
      const hasImport = namedImports.some((ni) => ni.getName() === name);
      
      if (!hasImport) {
        existingImport.addNamedImport(name);
      }
    } else {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [name],
      });
    }
  }

  private addFix(fix: Fix): void {
    this.fixes.push(fix);
  }

  private printSummary(dryRun: boolean): void {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 Auto-Fix Summary');
    console.log('='.repeat(80) + '\n');

    if (this.fixes.length === 0) {
      console.log('✅ No fixable violations found\n');
      return;
    }

    console.log(`${dryRun ? '🔍 Would fix' : '✅ Fixed'} ${this.fixes.length} violation(s):\n`);

    // Group by file
    const fixesByFile = new Map<string, Fix[]>();
    this.fixes.forEach((fix) => {
      const file = path.relative(process.cwd(), fix.file);
      if (!fixesByFile.has(file)) {
        fixesByFile.set(file, []);
      }
      fixesByFile.get(file)!.push(fix);
    });

    fixesByFile.forEach((fixes, file) => {
      console.log(`📄 ${file}`);
      fixes.forEach((fix) => {
        console.log(`  ✓ Line ${fix.line}: ${fix.decoratorAdded}`);
      });
      console.log('');
    });

    if (dryRun) {
      console.log('💡 Run without --dry-run to apply these fixes\n');
    }

    console.log('='.repeat(80) + '\n');
  }
}

// Main execution
async function main() {
  const fixer = new DtoFixer();

  const options: FixOptions = {
    dryRun: process.argv.includes('--dry-run'),
    addDescriptions: !process.argv.includes('--no-descriptions'),
  };

  try {
    await fixer.fix(options);
  } catch (error) {
    console.error('❌ Auto-fix failed with error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DtoFixer, FixOptions, Fix };
