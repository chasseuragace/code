# Type Generation Infrastructure Setup

This document describes the type generation infrastructure set up for the API contract synchronization system.

## Overview

The project is configured to automatically generate TypeScript types from the backend OpenAPI specification, ensuring the frontend and backend remain in sync.

## Directory Structure

```
UdaanSarathi3/
├── scripts/                    # Automation scripts
│   ├── README.md              # Scripts documentation
│   ├── generate-types.js      # Type generation script (to be created)
│   ├── watch-types.js         # Watch mode script (to be created)
│   └── validate-types.js      # CI validation script (to be created)
├── src/
│   └── api/
│       ├── generated/         # Auto-generated types
│       │   ├── README.md      # Generated types documentation
│       │   ├── types.ts       # Main generated types file
│       │   └── index.ts       # Barrel export
│       ├── types/             # Type helper utilities
│       │   ├── README.md      # Type helpers documentation
│       │   └── helpers.ts     # Type utility functions (to be created)
│       └── index.ts           # API module barrel export
├── tsconfig.json              # Root TypeScript config
├── tsconfig.app.json          # App TypeScript config (with path aliases)
├── tsconfig.node.json         # Node scripts TypeScript config
└── vite.config.ts             # Vite config (with path aliases)
```

## Installed Packages

- `openapi-typescript` - Generates TypeScript types from OpenAPI specifications

## TypeScript Configuration

### Path Aliases

The following path aliases are configured in both `tsconfig.app.json` and `vite.config.ts`:

- `@/*` - Maps to `./src/*`
- `@api/*` - Maps to `./src/api/*`
- `@api/generated` - Maps to `./src/api/generated`
- `@api/types/*` - Maps to `./src/api/types/*`

### Usage Example

```typescript
// Import generated types
import type { paths, components } from '@api/generated';

// Import type helpers (once created)
import type { RequestBody, Response } from '@api/types/helpers';

// Use in your code
type AgencyProfile = Response<'/agencies/owner/agency', 'get'>;
```

## Generated Types Structure

The generated types follow the OpenAPI structure:

```typescript
export interface paths {
  '/api/endpoint': {
    get: { /* operation details */ };
    post: { /* operation details */ };
  };
}

export interface components {
  schemas: {
    MyDto: { /* schema definition */ };
  };
}

export interface operations {
  operationId: { /* operation details */ };
}
```

## Next Steps

The following components need to be implemented:

1. **Type Generation Script** (`scripts/generate-types.js`)
   - Fetch OpenAPI spec from backend
   - Run openapi-typescript generator
   - Generate types to `src/api/generated/types.ts`

2. **Type Helper Utilities** (`src/api/types/helpers.ts`)
   - RequestBody type extractor
   - Response type extractor
   - Schema type accessor

3. **Watch Mode Script** (`scripts/watch-types.js`)
   - Poll backend for spec changes
   - Auto-regenerate types on changes

4. **CI Validation Script** (`scripts/validate-types.js`)
   - Validate committed types match backend
   - Fail build on mismatch

5. **NPM Scripts** (in `package.json`)
   - `generate:types` - Run type generation
   - `generate:types:watch` - Watch mode
   - `validate:types` - CI validation

## Configuration

Type generation can be configured via environment variables:

- `BACKEND_URL` - Backend server URL (default: http://localhost:3000)
- `OPENAPI_ENDPOINT` - OpenAPI spec endpoint (default: /docs-yaml)
- `POLL_INTERVAL` - Watch mode poll interval in ms (default: 5000)

## Verification

To verify the setup is working:

1. TypeScript compilation: `npm run build`
2. Path aliases: Check `src/test-types.ts` imports
3. Type generation: Run `npm run generate:types` (once script is created)

## Status

✅ **Completed:**
- Installed `openapi-typescript` package
- Created scripts directory structure
- Set up TypeScript configuration with path aliases
- Configured Vite with path aliases
- Created API directory structure
- Created placeholder generated types
- Verified TypeScript compilation works
- Verified path aliases work

⏳ **Pending:**
- Implement type generation script
- Implement type helper utilities
- Implement watch mode script
- Implement CI validation script
- Add npm scripts to package.json
- Test with real backend OpenAPI spec
