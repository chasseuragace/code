#!/usr/bin/env node

import { createHash } from 'crypto';
import { fetchOpenAPISpec, validateOpenAPISpec, generateTypes, createBarrelExport } from './generate-types.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration for watch mode
 */
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  specEndpoint: '/docs-yaml',
  outputPath: '../src/api/generated/types.ts',
  barrelPath: '../src/api/generated/index.ts',
  pollInterval: parseInt(process.env.POLL_INTERVAL || '5000', 10), // Default 5 seconds
  verbose: process.env.VERBOSE === 'true',
};

/**
 * State management
 */
let currentSpecHash = null;
let lastGenerationTime = null;
let isGenerating = false;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Calculate hash of OpenAPI spec for change detection
 */
function calculateSpecHash(spec) {
  return createHash('sha256').update(spec).digest('hex');
}

/**
 * Log with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '  ',
    success: '✓ ',
    error: '✗ ',
    warn: '⚠ ',
  }[level] || '  ';
  
  console.log(`[${timestamp}] ${prefix}${message}`);
}

/**
 * Verbose log (only shown if VERBOSE=true)
 */
function vlog(message) {
  if (config.verbose) {
    log(message, 'info');
  }
}

/**
 * Check for spec changes and regenerate if needed
 */
async function checkAndRegenerate() {
  if (isGenerating) {
    vlog('Generation already in progress, skipping check');
    return;
  }

  try {
    vlog('Checking for OpenAPI spec changes...');
    
    // Fetch current spec
    const spec = await fetchOpenAPISpec(config.backendUrl, 1); // Single attempt in watch mode
    const specHash = calculateSpecHash(spec);
    
    // Check if spec has changed
    if (currentSpecHash === null) {
      // First run
      log('Initial spec detected, generating types...', 'info');
      currentSpecHash = specHash;
      await regenerateTypes(spec);
    } else if (specHash !== currentSpecHash) {
      // Spec changed
      log('OpenAPI spec changed, regenerating types...', 'warn');
      currentSpecHash = specHash;
      await regenerateTypes(spec);
    } else {
      vlog('No changes detected');
    }
    
    // Reset error counter on success
    consecutiveErrors = 0;
    
  } catch (error) {
    consecutiveErrors++;
    
    if (consecutiveErrors === 1) {
      log(`Error checking spec: ${error.message}`, 'error');
    } else if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      log(`Failed ${consecutiveErrors} times. Backend might be down.`, 'error');
      log('Will keep trying...', 'warn');
    }
    
    // Don't exit, keep watching
  }
}

/**
 * Regenerate types from spec
 */
async function regenerateTypes(spec) {
  isGenerating = true;
  const startTime = Date.now();
  
  try {
    // Validate spec
    validateOpenAPISpec(spec);
    
    // Generate types
    const specUrl = `${config.backendUrl}${config.specEndpoint}`;
    const outputPath = new URL(config.outputPath, import.meta.url).pathname;
    await generateTypes(specUrl, outputPath);
    
    // Create barrel export
    const barrelPath = new URL(config.barrelPath, import.meta.url).pathname;
    await createBarrelExport(barrelPath);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    lastGenerationTime = duration;
    
    log(`Types regenerated successfully in ${duration}s`, 'success');
    
  } catch (error) {
    log(`Type generation failed: ${error.message}`, 'error');
    throw error;
  } finally {
    isGenerating = false;
  }
}

/**
 * Debounce utility to prevent rapid regenerations
 */
let debounceTimer = null;

function debounce(func, delay) {
  return function (...args) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => func(...args), delay);
  };
}

/**
 * Debounced check function
 */
const debouncedCheck = debounce(checkAndRegenerate, 1000);

/**
 * Start watching for changes
 */
async function startWatching() {
  console.log('=== OpenAPI Type Generation - Watch Mode ===\n');
  log(`Backend URL: ${config.backendUrl}`);
  log(`Poll interval: ${config.pollInterval}ms`);
  log(`Verbose logging: ${config.verbose ? 'enabled' : 'disabled'}`);
  console.log();
  log('Watching for OpenAPI spec changes... (Press Ctrl+C to stop)');
  console.log();
  
  // Initial check
  await checkAndRegenerate();
  
  // Set up polling
  const intervalId = setInterval(async () => {
    await debouncedCheck();
  }, config.pollInterval);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n');
    log('Stopping watch mode...', 'warn');
    clearInterval(intervalId);
    
    if (lastGenerationTime) {
      log(`Last generation took ${lastGenerationTime}s`, 'info');
    }
    
    log('Watch mode stopped', 'success');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    clearInterval(intervalId);
    process.exit(0);
  });
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  startWatching().catch((error) => {
    console.error('\n✗ Watch mode failed to start:');
    console.error(error.message);
    process.exit(1);
  });
}

export { checkAndRegenerate, calculateSpecHash };
