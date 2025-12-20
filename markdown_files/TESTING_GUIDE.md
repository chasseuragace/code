# Testing Guide - Draft Jobs Module

## Quick Start

### Check Docker Status
```bash
docker ps
```

You should see:
- `nest_server` - Backend (port 3000)
- `nest_pg` - PostgreSQL (port 5431)

### Run All Tests
```bash
docker exec nest_server npm test
```

### Run Specific Test File
```bash
# Basic draft CRUD tests
docker exec nest_server npm test -- --runInBand test/draft-job.create-and-publish.spec.ts

# Frontend 8-step wizard flow tests
docker exec nest_server npm test -- --runInBand test/draft-job.frontend-flow.spec.ts
```

## Test Files

### 1. `draft-job.create-and-publish.spec.ts`
Basic CRUD operations and publishing flow.

**Tests:**
- Create draft
- Update draft
- Validate draft
- Publish to job posting
- Multiple drafts management
- Delete protection for published drafts

### 2. `draft-job.frontend-flow.spec.ts`
Complete 8-step wizard flow matching frontend expectations.

**Tests:**
- Full 8-step wizard (Admin Details → Submit)
- Partial save and resume functionality
- Bulk draft creation
- Progress tracking (`is_partial`, `last_completed_step`)

## Test Structure

Each test follows this pattern:
1. **Setup**: Create user, agency, seed countries/job titles
2. **Execute**: Perform draft operations
3. **Assert**: Verify expected behavior
4. **Cleanup**: Automatic via `afterAll()`

## Important Notes

- Tests run inside Docker container (not on host machine)
- Database schema auto-updates with `synchronize: true` in dev
- Use `--runInBand` flag to prevent race conditions
- Test timeout: 60 seconds (configurable via `jest.setTimeout()`)
- Each test creates unique users/agencies to avoid conflicts

## Debugging Failed Tests

### View Container Logs
```bash
docker logs nest_server
```

### Access Container Shell
```bash
docker exec -it nest_server sh
```

### Check Database
```bash
docker exec -it nest_pg psql -U postgres -d app_db
```

### Run Tests with Verbose Output
```bash
docker exec nest_server npm test -- --verbose test/draft-job.frontend-flow.spec.ts
```

## Common Issues

### Issue: "Cannot find module"
**Solution**: Rebuild container
```bash
docker-compose down
docker-compose up --build
```

### Issue: "Connection refused"
**Solution**: Ensure database is healthy
```bash
docker ps  # Check STATUS column shows "healthy"
```

### Issue: "Duplicate key violation"
**Solution**: Tests create unique data, but if needed:
```bash
docker exec nest_server npm test -- --clearCache
```

## Test Data

Tests use:
- **Countries**: UAE, Qatar, Saudi Arabia, Kuwait, Malaysia
- **Job Titles**: Electrician, Plumber, Carpenter, Mason
- **Currencies**: AED, QAR, SAR, KWD, MYR, NPR
- **Unique phones**: Generated with timestamp to avoid conflicts

## API Endpoints Tested

- `POST /agencies/:license/draft-jobs` - Create draft
- `GET /agencies/:license/draft-jobs` - List drafts
- `GET /agencies/:license/draft-jobs/:id` - Get draft
- `PATCH /agencies/:license/draft-jobs/:id` - Update draft
- `DELETE /agencies/:license/draft-jobs/:id` - Delete draft
- `POST /agencies/:license/draft-jobs/:id/validate` - Validate
- `POST /agencies/:license/draft-jobs/:id/publish` - Publish

## Next Steps

After backend tests pass:
1. Test API endpoints with Postman/Insomnia
2. Test frontend integration with real authentication
3. Test file uploads for cutout images
4. Test full user journey in browser
