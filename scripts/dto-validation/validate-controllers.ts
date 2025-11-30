#!/usr/bin/env ts-node

import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'fast-glob';
import * as ts from 'typescript';

interface ControllerViolation {
  file: string;
  className: string;
  methodName: string;
  issue: 'missing-body-dto' | 'missing-response-dto' | 'type-mismatch' | 'missing-query-dto';
  message: string;
}

class ControllerValidator {
  private violations: ControllerViolation[] = [];

  async validate(): Promise<ControllerViolation[]> {
    console.log('🔍 Scanning for controller files...\n');

    // Find all controller files
    const files = await glob(['src/**/*.controller.ts'], {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      absolute: true,
      cwd: process.cwd(),
    });

    if (files.length === 0) {
      console.log('⚠️  No controller files found');
      return [];
    }

    console.log(`Found ${files.length} controller file(s)\n`);

    // Validate each file
    for (const file of files) {
      await this.validateFile(file);
    }

    // Print report
    this.printReport();

    return this.violations;
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
      
      // Check if this is a controller class
      if (className.endsWith('Controller')) {
        this.validateController(node, className, filePath);
      }
    }

    ts.forEachChild(node, (child) => this.visitNode(child, filePath));
  }

  private validateController(
    classNode: ts.ClassDeclaration,
    className: string,
    filePath: string
  ): void {
    // Validate each method
    classNode.members.forEach((member) => {
      if (ts.isMethodDeclaration(member) && member.name) {
        const methodName = member.name.getText();
        this.validateControllerMethod(member, className, methodName, filePath);
      }
    });
  }

  private validateControllerMethod(
    method: ts.MethodDeclaration,
    className: string,
    methodName: string,
    filePath: string
  ): void {
    const decorators = this.getDecorators(method);
    const httpMethods = ['Post', 'Put', 'Patch', 'Get', 'Delete'];
    
    const hasHttpDecorator = decorators.some((d) =>
      httpMethods.some((http) => d.includes(`@${http}`))
    );

    if (!hasHttpDecorator) return;

    const isModifyingMethod = decorators.some((d) =>
      ['@Post', '@Put', '@Patch'].some((http) => d.includes(http))
    );

    // Check for @Body() parameter on modifying methods
    if (isModifyingMethod) {
      const hasBodyParam = method.parameters.some((param) => {
        const paramDecorators = this.getDecorators(param);
        return paramDecorators.some((d) => d.includes('@Body'));
      });

      if (!hasBodyParam) {
        this.addViolation({
          file: filePath,
          className,
          methodName,
          issue: 'missing-body-dto',
          message: `Method "${methodName}" should have @Body() parameter with DTO type`,
        });
      } else {
        // Check if Body parameter has DTO type
        const bodyParam = method.parameters.find((param) => {
          const paramDecorators = this.getDecorators(param);
          return paramDecorators.some((d) => d.includes('@Body'));
        });

        if (bodyParam && bodyParam.type) {
          const typeText = bodyParam.type.getText();
          if (!typeText.includes('Dto')) {
            this.addViolation({
              file: filePath,
              className,
              methodName,
              issue: 'missing-body-dto',
              message: `@Body() parameter in "${methodName}" should use a DTO type (got: ${typeText})`,
            });
          }
        }
      }
    }

    // Check for @Query() parameter
    const hasQueryParam = method.parameters.some((param) => {
      const paramDecorators = this.getDecorators(param);
      return paramDecorators.some((d) => d.includes('@Query'));
    });

    if (hasQueryParam) {
      const queryParam = method.parameters.find((param) => {
        const paramDecorators = this.getDecorators(param);
        return paramDecorators.some((d) => d.includes('@Query'));
      });

      if (queryParam && queryParam.type) {
        const typeText = queryParam.type.getText();
        // Query params can be simple types or DTOs
        if (typeText !== 'string' && typeText !== 'number' && !typeText.includes('Dto')) {
          this.addViolation({
            file: filePath,
            className,
            methodName,
            issue: 'missing-query-dto',
            message: `@Query() parameter in "${methodName}" should use a DTO type for complex queries`,
          });
        }
      }
    }

    // Check for @ApiResponse decorator
    const hasApiResponse = decorators.some((d) => 
      d.includes('@ApiResponse') || 
      d.includes('@ApiOkResponse') || 
      d.includes('@ApiCreatedResponse') ||
      d.includes('@ApiBadRequestResponse') ||
      d.includes('@ApiNotFoundResponse')
    );
    
    if (!hasApiResponse) {
      this.addViolation({
        file: filePath,
        className,
        methodName,
        issue: 'missing-response-dto',
        message: `Method "${methodName}" should have @ApiResponse decorator with DTO type`,
      });
    }
  }

  private getDecorators(node: ts.Node): string[] {
    const decorators: string[] = [];
    
    if ('modifiers' in node && node.modifiers) {
      (node.modifiers as ts.NodeArray<ts.ModifierLike>).forEach((modifier) => {
        if (ts.isDecorator(modifier)) {
          decorators.push(modifier.getText());
        }
      });
    }

    // TypeScript 5.0+ uses decorators property
    if ('decorators' in node && (node as any).decorators) {
      (node as any).decorators.forEach((decorator: any) => {
        decorators.push(decorator.getText());
      });
    }

    return decorators;
  }

  private addViolation(violation: ControllerViolation): void {
    this.violations.push(violation);
  }

  private printReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 Controller Validation Report');
    console.log('='.repeat(80) + '\n');

    if (this.violations.length === 0) {
      console.log('✅ All controllers are properly configured!\n');
      return;
    }

    console.log(`❌ Found ${this.violations.length} violation(s):\n`);

    // Group by file
    const violationsByFile = new Map<string, ControllerViolation[]>();
    this.violations.forEach((violation) => {
      const file = path.relative(process.cwd(), violation.file);
      if (!violationsByFile.has(file)) {
        violationsByFile.set(file, []);
      }
      violationsByFile.get(file)!.push(violation);
    });

    violationsByFile.forEach((violations, file) => {
      console.log(`📄 ${file}`);
      violations.forEach((violation) => {
        console.log(`  ❌ ${violation.className}.${violation.methodName}`);
        console.log(`     Issue: ${violation.issue}`);
        console.log(`     ${violation.message}\n`);
      });
    });

    console.log('='.repeat(80) + '\n');
  }
}

// Main execution
async function main() {
  const validator = new ControllerValidator();

  try {
    const violations = await validator.validate();
    
    if (violations.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ControllerValidator, ControllerViolation };
