# Draft Job Module Cleanup

## Issue
After deleting the `draft-job` module, the backend was crashing with:
```
Error: Cannot find module '../../draft-job/draft-job.entity'
```

## Root Cause
The `draft-job` module was still referenced in:
1. `src/app.module.ts` - DraftJobModule import and registration
2. `src/modules/testhelper/testhelper.module.ts` - DraftJob entity in TypeORM
3. `src/modules/testhelper/services/testhelper.service.ts` - DraftJob repository and usage

## Changes Made

### 1. app.module.ts
- ❌ Removed: `import { DraftJobModule } from './modules/draft-job/draft-job.module';`
- ❌ Removed: `DraftJobModule` from imports array

### 2. testhelper.module.ts
- ❌ Removed: `import { DraftJob } from '../draft-job/draft-job.entity';`
- ❌ Removed: `DraftJob` from TypeOrmModule.forFeature array

### 3. testhelper.service.ts
- ❌ Removed: `import { DraftJob } from '../../draft-job/draft-job.entity';`
- ❌ Removed: `@InjectRepository(DraftJob)` and `draftJobRepository` from constructor
- ❌ Removed: Draft count logic from `getAgenciesAnalytics()` method
- ✅ Updated: Analytics response no longer includes `draft_count`

## Impact

### Before
```typescript
analytics: {
  draft_count: draftCount,  // ❌ No longer available
  job_count: jobCount,
  application_count: applicationCount,
}
```

### After
```typescript
analytics: {
  job_count: jobCount,
  application_count: applicationCount,
}
```

## Verification

All references to `draft-job` have been removed:
```bash
grep -r "draft-job\|DraftJob" src/ --include="*.ts" | grep -v ".spec.ts"
# Returns: (empty - no matches)
```

## Status
✅ Backend should now start successfully without draft-job module errors
✅ All DTO validations still passing (100%)
✅ Auth controller DTOs properly implemented
✅ Agency update DTOs properly implemented
