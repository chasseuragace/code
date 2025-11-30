#!/usr/bin/env ts-node

import { DtoValidator, ValidationReport } from './validate-dtos';
import * as path from 'path';
import * as fs from 'fs';

interface ModuleMetrics {
  totalDtos: number;
  validDtos: number;
  completionPercentage: number;
  totalProperties: number;
  validProperties: number;
}

interface DtoMetrics {
  timestamp: string;
  totalDtos: number;
  completelyValidDtos: number;
  partiallyValidDtos: number;
  invalidDtos: number;
  completionPercentage: number;
  byModule: Record<string, ModuleMetrics>;
}

interface MetricsOptions {
  outputFormat?: 'json' | 'markdown' | 'console';
  threshold?: number;
  compareWith?: string;
}

class MetricsReporter {
  async generateMetrics(options: MetricsOptions = {}): Promise<DtoMetrics> {
    const {
      outputFormat = 'console',
      threshold = 0,
      compareWith,
    } = options;

    console.log('📊 Generating DTO quality metrics...\n');

    // Run validation
    const validator = new DtoValidator();
    const report = await validator.validate({ failOnError: false, verbose: false });

    // Calculate metrics
    const metrics = this.calculateMetrics(report);

    // Load previous metrics if provided
    let previousMetrics: DtoMetrics | null = null;
    if (compareWith && fs.existsSync(compareWith)) {
      previousMetrics = JSON.parse(fs.readFileSync(compareWith, 'utf-8'));
    }

    // Output metrics
    switch (outputFormat) {
      case 'json':
        this.outputJson(metrics);
        break;
      case 'markdown':
        this.outputMarkdown(metrics, previousMetrics);
        break;
      default:
        this.outputConsole(metrics, previousMetrics);
    }

    // Check threshold
    if (threshold > 0 && metrics.completionPercentage < threshold) {
      console.error(`\n❌ Quality below threshold: ${metrics.completionPercentage}% < ${threshold}%`);
      process.exit(1);
    }

    return metrics;
  }

  private calculateMetrics(report: ValidationReport): DtoMetrics {
    // Group violations by module
    const moduleStats = new Map<string, { total: number; valid: number; totalProps: number; validProps: number }>();

    // Initialize module stats from violations
    report.violations.forEach((violation) => {
      const moduleName = this.extractModuleName(violation.file);
      if (!moduleStats.has(moduleName)) {
        moduleStats.set(moduleName, { total: 0, valid: 0, totalProps: 0, validProps: 0 });
      }
    });

    // Calculate per-module metrics
    const byModule: Record<string, ModuleMetrics> = {};
    
    moduleStats.forEach((stats, moduleName) => {
      byModule[moduleName] = {
        totalDtos: stats.total,
        validDtos: stats.valid,
        completionPercentage: stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 100,
        totalProperties: stats.totalProps,
        validProperties: stats.validProps,
      };
    });

    // Calculate overall metrics
    const completelyValidDtos = report.summary.totalDtos - 
      new Set(report.violations.map(v => `${v.file}:${v.className}`)).size;

    return {
      timestamp: new Date().toISOString(),
      totalDtos: report.summary.totalDtos,
      completelyValidDtos,
      partiallyValidDtos: 0, // Would need more detailed tracking
      invalidDtos: report.summary.totalDtos - completelyValidDtos,
      completionPercentage: report.summary.completionPercentage,
      byModule,
    };
  }

  private extractModuleName(filePath: string): string {
    const parts = filePath.split('/');
    const srcIndex = parts.indexOf('src');
    if (srcIndex >= 0 && srcIndex + 2 < parts.length) {
      return parts[srcIndex + 2]; // e.g., src/modules/agency -> agency
    }
    return 'unknown';
  }

  private outputConsole(metrics: DtoMetrics, previousMetrics: DtoMetrics | null): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DTO Quality Metrics');
    console.log('='.repeat(80) + '\n');

    console.log('Overall Statistics:');
    console.log(`  Total DTOs:           ${metrics.totalDtos}`);
    console.log(`  Completely Valid:     ${metrics.completelyValidDtos}`);
    console.log(`  Invalid:              ${metrics.invalidDtos}`);
    console.log(`  Completion:           ${metrics.completionPercentage}%`);

    if (previousMetrics) {
      const delta = metrics.completionPercentage - previousMetrics.completionPercentage;
      const icon = delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️';
      console.log(`  Change:               ${icon} ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`);
    }

    console.log('\nBy Module:');
    Object.entries(metrics.byModule)
      .sort(([, a], [, b]) => b.completionPercentage - a.completionPercentage)
      .forEach(([module, stats]) => {
        const bar = this.createProgressBar(stats.completionPercentage);
        console.log(`  ${module.padEnd(20)} ${bar} ${stats.completionPercentage}% (${stats.validDtos}/${stats.totalDtos})`);
      });

    console.log('\n' + '='.repeat(80) + '\n');
  }

  private outputJson(metrics: DtoMetrics): void {
    console.log(JSON.stringify(metrics, null, 2));
  }

  private outputMarkdown(metrics: DtoMetrics, previousMetrics: DtoMetrics | null): void {
    console.log('# DTO Quality Metrics\n');
    console.log(`Generated: ${new Date(metrics.timestamp).toLocaleString()}\n`);

    console.log('## Overall Statistics\n');
    console.log('| Metric | Value |');
    console.log('|--------|-------|');
    console.log(`| Total DTOs | ${metrics.totalDtos} |`);
    console.log(`| Completely Valid | ${metrics.completelyValidDtos} |`);
    console.log(`| Invalid | ${metrics.invalidDtos} |`);
    console.log(`| Completion | ${metrics.completionPercentage}% |`);

    if (previousMetrics) {
      const delta = metrics.completionPercentage - previousMetrics.completionPercentage;
      console.log(`| Change | ${delta > 0 ? '+' : ''}${delta.toFixed(1)}% |`);
    }

    console.log('\n## By Module\n');
    console.log('| Module | Completion | Valid/Total |');
    console.log('|--------|------------|-------------|');
    Object.entries(metrics.byModule)
      .sort(([, a], [, b]) => b.completionPercentage - a.completionPercentage)
      .forEach(([module, stats]) => {
        console.log(`| ${module} | ${stats.completionPercentage}% | ${stats.validDtos}/${stats.totalDtos} |`);
      });
  }

  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }
}

// Main execution
async function main() {
  const reporter = new MetricsReporter();

  const options: MetricsOptions = {
    outputFormat: process.argv.includes('--json') ? 'json' :
                  process.argv.includes('--markdown') ? 'markdown' : 'console',
    threshold: process.argv.includes('--threshold') ? 
      parseInt(process.argv[process.argv.indexOf('--threshold') + 1]) : 0,
    compareWith: process.argv.includes('--compare') ?
      process.argv[process.argv.indexOf('--compare') + 1] : undefined,
  };

  try {
    await reporter.generateMetrics(options);
  } catch (error) {
    console.error('❌ Metrics generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { MetricsReporter, DtoMetrics, ModuleMetrics, MetricsOptions };
