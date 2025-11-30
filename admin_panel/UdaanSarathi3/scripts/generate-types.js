#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import openapiTS, { astToString } from 'openapi-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration for type generation
 */
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  specEndpoint: '/docs-yaml',
  outputPath: '../src/api/generated/types.ts',
  barrelPath: '../src/api/generated/index.ts',
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch OpenAPI spec from backend with retry logic
 */
async function fetchOpenAPISpec(url, retries = config.maxRetries) {
  const fullUrl = `${url}${config.specEndpoint}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[${attempt}/${retries}] Fetching OpenAPI spec from ${fullUrl}...`);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Accept': 'application/yaml, text/yaml, application/x-yaml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const spec = await response.text();
      
      if (!spec || spec.trim().length === 0) {
        throw new Error('Received empty OpenAPI specification');
      }

      console.log('✓ Successfully fetched OpenAPI spec');
      return spec;
      
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (isLastAttempt) {
        console.error(`✗ Failed to fetch OpenAPI spec after ${retries} attempts`);
        throw new Error(
          `Failed to fetch OpenAPI spec from ${fullUrl}: ${error.message}\n` +
          `Make sure the backend is running at ${url}`
        );
      }
      
      // Exponential backoff
      const delay = config.retryDelay * Math.pow(2, attempt - 1);
      console.warn(`  Attempt ${attempt} failed: ${error.message}`);
      console.warn(`  Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Validate OpenAPI spec structure
 */
function validateOpenAPISpec(spec) {
  console.log('Validating OpenAPI spec structure...');
  
  // Basic validation - check for required OpenAPI fields
  const requiredFields = ['openapi', 'info', 'paths'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!spec.includes(field + ':')) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(
      `Invalid OpenAPI specification: missing required fields: ${missingFields.join(', ')}`
    );
  }
  
  // Check for OpenAPI version
  const versionMatch = spec.match(/openapi:\s*['"]?(\d+\.\d+\.\d+)['"]?/);
  if (!versionMatch) {
    throw new Error('Invalid OpenAPI specification: could not determine OpenAPI version');
  }
  
  const version = versionMatch[1];
  const majorVersion = parseInt(version.split('.')[0]);
  
  if (majorVersion < 3) {
    throw new Error(
      `Unsupported OpenAPI version: ${version}. This tool requires OpenAPI 3.x`
    );
  }
  
  console.log(`✓ Valid OpenAPI ${version} specification`);
  return true;
}

/**
 * Generate TypeScript types from OpenAPI spec
 */
async function generateTypes(specUrl, outputPath) {
  console.log('Generating TypeScript types...');
  
  try {
    // Use openapi-typescript to generate types directly from URL
    // In v7, openapiTS returns an AST that needs to be converted to string
    const ast = await openapiTS(new URL(specUrl), {
      // Configuration options for openapi-typescript v7
      exportType: true,
      immutable: false,
      defaultNonNullable: false,
      pathParamsAsTypes: false,
    });
    
    // Convert AST to TypeScript string
    const types = astToString(ast);
    
    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    await mkdir(outputDir, { recursive: true });
    
    // Write generated types to file
    await writeFile(outputPath, types, 'utf-8');
    
    console.log(`✓ Types generated successfully at ${outputPath}`);
    return true;
    
  } catch (error) {
    console.error('✗ Type generation failed');
    throw new Error(`Failed to generate types: ${error.message}`);
  }
}

/**
 * Create barrel export file
 */
async function createBarrelExport(barrelPath) {
  console.log('Creating barrel export file...');
  
  const barrelContent = `/**
 * Generated API Types
 * 
 * This file exports all TypeScript types generated from the OpenAPI specification.
 * These types provide compile-time type safety for API requests and responses.
 * 
 * @module api/generated
 * @see {@link https://github.com/drwpow/openapi-typescript|openapi-typescript}
 */

export * from './types.js';
`;
  
  try {
    await writeFile(barrelPath, barrelContent, 'utf-8');
    console.log(`✓ Barrel export created at ${barrelPath}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to create barrel export');
    throw new Error(`Failed to create barrel export: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== OpenAPI Type Generation ===\n');
  
  try {
    // Step 1: Fetch OpenAPI spec (for validation)
    const spec = await fetchOpenAPISpec(config.backendUrl);
    
    // Step 2: Validate spec structure
    validateOpenAPISpec(spec);
    
    // Step 3: Generate TypeScript types (pass URL directly to openapiTS)
    const specUrl = `${config.backendUrl}${config.specEndpoint}`;
    const outputPath = new URL(config.outputPath, import.meta.url).pathname;
    await generateTypes(specUrl, outputPath);
    
    // Step 4: Create barrel export
    const barrelPath = new URL(config.barrelPath, import.meta.url).pathname;
    await createBarrelExport(barrelPath);
    
    console.log('\n✓ Type generation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Type generation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fetchOpenAPISpec, validateOpenAPISpec, generateTypes, createBarrelExport };
