# Troubleshooting Guide - Automated Workflow

This comprehensive troubleshooting guide covers common issues and solutions for the automated deployment, OpenAPI generation, and API contract validation workflow.

## Quick Reference: Common Issues

| Issue Category | Common Symptoms | Quick Fix |
|----------------|-----------------|-----------|
| **Deployment** | GitHub Actions fails, containers not starting | Check secrets, verify server connectivity |
| **OpenAPI Spec** | 404 errors, spec validation fails | Check server status, sync spec manually |
| **Client Generation** | Build fails, type errors | Validate spec, clean and rebuild |
| **Contract Tests** | Tests failing, API mismatches | Check deployment, sync client, run tests |
| **Performance** | Slow generation, timeouts | Optimize spec, check resources |

## 1. Deployment Issues

### 1.1 GitHub Actions Deployment Failures

#### Problem: Deployment workflow fails
**Symptoms**:
- GitHub Actions shows red X
- SSH connection errors
- Docker commands failing

**Diagnosis**:
```bash
# Check GitHub Actions logs
# Navigate to: Repository → Actions → Latest deployment run

# Check specific error messages
# Look for:
# - "Permission denied"
# - "Connection refused"
# - "Command not found"
# - "Exit code 1"
```

**Solutions**:

#### A. SSH Connection Issues
```bash
# Test SSH connectivity manually
ssh ${{ secrets.DEV_USER }}@${{ secrets.DEV_IP }}

# If connection fails:
# 1. Verify IP address is correct
# 2. Check SSH service is running on server
# 3. Verify credentials in GitHub secrets
# 4. Check firewall rules
```

#### B. Missing or Incorrect Secrets
```bash
# Verify required secrets exist:
# - DEV_IP
# - DEV_USER  
# - DEV_PASS
# - DEV_PATH

# Update secrets in GitHub repository:
# Repository → Settings → Secrets and variables → Actions
```

#### C. Docker Issues
```bash
# Check Docker status on server
ssh ${{ secrets.DEV_USER }}@${{ secrets.DEV_IP }}
docker --version
docker-compose --version

# If Docker not running:
sudo systemctl start docker
sudo systemctl enable docker
```

#### D. Path Issues
```bash
# Verify deployment path exists
ssh ${{ secrets.DEV_USER }}@${{ secrets.DEV_IP }}
ls -la ${{ secrets.DEV_PATH }}

# If path doesn't exist:
mkdir -p ${{ secrets.DEV_PATH }}
cd ${{ secrets.DEV_PATH }}
git clone <your-repo-url> .
```

### 1.2 Container Startup Issues

#### Problem: Containers fail to start after deployment
**Symptoms**:
- `docker-compose ps` shows exited containers
- Application not accessible
- Health checks failing

**Diagnosis**:
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs app
docker-compose logs db

# Check for port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432
```

**Solutions**:

#### A. Port Conflicts
```bash
# Stop conflicting services
sudo systemctl stop nginx    # if port 80/443 conflict
sudo systemctl stop apache2 # if port 80 conflict

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Change from 3000 to 3001
```

#### B. Resource Issues
```bash
# Check system resources
free -h
df -h
docker system df

# Clean up if needed
docker system prune -f
docker volume prune -f
```

#### C. Configuration Issues
```bash
# Check environment variables
docker-compose config

# Verify docker-compose.yml syntax
docker-compose config --quiet

# Check for missing .env file
ls -la .env
```

### 1.3 Database Connection Issues

#### Problem: Application can't connect to database
**Symptoms**:
- Database connection errors in logs
- Application fails to start
- Health checks failing

**Diagnosis**:
```bash
# Check database container
docker-compose ps db

# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec db psql -U postgres -d udaansarathi -c "SELECT 1;"
```

**Solutions**:

#### A. Database Initialization
```bash
# Restart database container
docker-compose restart db

# Wait for database to be ready
sleep 30

# Check database status
docker-compose exec db pg_isready

# Run migrations if needed
docker-compose exec app npm run migration:run
```

#### B. Connection Configuration
```bash
# Check database connection string
# Verify in .env or docker-compose.yml:
# DATABASE_URL=postgres://postgres:password@db:5432/udaansarathi

# Test connection from app container
docker-compose exec app wget -qO- http://db:5432
```

## 2. OpenAPI Specification Issues

### 2.1 Spec Access Issues

#### Problem: Cannot access `/docs-yaml` endpoint
**Symptoms**:
- 404 errors when accessing spec
- Connection timeouts
- Empty response

**Diagnosis**:
```bash
# Test spec accessibility
curl -v http://localhost:3000/docs-yaml
curl -v http://your-server/docs-yaml

# Check server status
docker-compose ps app

# Check server logs
docker-compose logs app | grep -i error
```

**Solutions**:

#### A. Server Not Running
```bash
# Start server
docker-compose up -d app

# Wait for server to be ready
sleep 10

# Check server health
curl http://localhost:3000/health
```

#### B. Route Configuration
```bash
# Check if OpenAPI route is configured
# Look in main.ts or app.module.ts for:
# @ApiSpec() decorator or Swagger setup

# Verify route registration
curl http://localhost:3000/api  # Check if API routes work
```

#### C. Network Issues
```bash
# Check network connectivity
ping your-server

# Check firewall rules
sudo ufw status

# Check port accessibility
telnet your-server 3000
```

### 2.2 Spec Validation Issues

#### Problem: OpenAPI spec validation fails
**Symptoms**:
- Generation fails with validation errors
- Schema validation errors
- Reference resolution errors

**Diagnosis**:
```bash
# Validate spec manually
cd dev_tools/package_form_open_api
openapi-generator-cli validate -i input.yaml

# Check for common issues
python3 -c "import yaml; yaml.safe_load(open('input.yaml'))"
```

**Solutions**:

#### A. Fix Validation Errors
```bash
# Common validation fixes:
# 1. Remove duplicate operationIds
# 2. Fix $ref references
# 3. Add missing required fields
# 4. Correct data types

# Example: Fix duplicate operationId
# In controller, ensure each endpoint has unique operationId
@ApiOperation({ operationId: 'getCandidates' })
@Get('candidates')
getCandidates() { ... }
```

#### B. Schema Issues
```bash
# Check for undefined schemas
grep -n "\$ref:" input.yaml | grep "#/components/schemas/"

# Verify all referenced schemas exist
# Look in components.schemas section

# Fix missing schema definitions
components:
  schemas:
    Candidate:
      type: object
      properties:
        id:
          type: string
        # ... other properties
```

#### C. Reference Resolution
```bash
# Fix broken references
# Ensure all $ref point to valid locations
# Use relative paths correctly

# Example of correct reference:
$ref: '#/components/schemas/Candidate'

# Example of incorrect reference:
$ref: 'Candidate'  # Missing #/components/schemas/
```

### 2.3 Spec Synchronization Issues

#### Problem: Spec is not synchronized with latest code
**Symptoms**:
- Generated client doesn't match current API
- Missing new endpoints in spec
- Old endpoints still present

**Diagnosis**:
```bash
# Check spec timestamp
ls -la input.yaml

# Compare with server spec
curl http://your-server/docs-yaml > server-spec.yaml
diff input.yaml server-spec.yaml

# Check last deployment time
git log --oneline -5
```

**Solutions**:

#### A. Manual Spec Sync
```bash
# Sync spec from server
cd dev_tools/package_form_open_api
./sync-spec.sh

# Or manually sync
curl -o input.yaml http://your-server/docs-yaml

# Validate synced spec
openapi-generator-cli validate -i input.yaml
```

#### B. Force Deployment
```bash
# If server is not updated, redeploy
git tag deploy
git push origin deploy

# Wait for deployment to complete
# Check GitHub Actions status

# Then sync spec
./sync-spec.sh
```

#### C. Clear Caches
```bash
# Clear any spec caches
rm -rf .openapi-generator/
rm -rf openapi/

# Regenerate client
./build.sh
```

## 3. Client Generation Issues

### 3.1 Generation Failures

#### Problem: Client generation fails
**Symptoms**:
- Build script fails
- Docker errors
- Generation timeout

**Diagnosis**:
```bash
# Run generation with debug output
./build.sh 2>&1 | tee build.log

# Check Docker status
docker ps
docker images | grep openapi

# Check system resources
free -h
df -h
```

**Solutions**:

#### A. Docker Issues
```bash
# Check if Docker is running
docker --version

# Restart Docker if needed
sudo systemctl restart docker

# Pull latest generator image
docker pull openapitools/openapi-generator-cli
```

#### B. Resource Issues
```bash
# Clean up Docker resources
docker system prune -f
docker volume prune -f

# Increase Docker memory if needed
# Docker Desktop settings → Resources → Memory
```

#### C. Spec Complexity Issues
```bash
# If spec is too large, try optimizing:
# 1. Remove unused schemas
# 2. Split large specs
# 3. Use external references

# Generate with increased timeout
docker run --rm \
    -v $PWD:/local \
    openapitools/openapi-generator-cli generate \
    -i /local/input.yaml \
    -g dart-dio \
    --additional-properties=serializationLibrary=json_serializable \
    -o /local/openapi \
    --global-property=models=true,supportingFiles=true,apiTests=false,modelTests=false,apiDocs=false,modelDocs=false
```

### 3.2 Build Runner Issues

#### Problem: Dart build runner fails
**Symptoms**:
- `dart run build_runner build` fails
- Type generation errors
- Dependency conflicts

**Diagnosis**:
```bash
# Check Dart SDK version
dart --version

# Check pubspec.yaml
cd openapi
cat pubspec.yaml

# Run build runner with debug output
dart run build_runner build --verbose
```

**Solutions**:

#### A. Dart SDK Issues
```bash
# Ensure correct Dart SDK version
# Should be >=3.8.0 <4.0.0

# Update Dart SDK if needed
# (Follow Dart SDK installation guide)

# Clean and rebuild
dart run build_runner clean
dart run build_runner build --delete-conflicting-outputs
```

#### B. Dependency Issues
```bash
# Update dependencies
dart pub get

# Check for conflicting dependencies
dart pub deps

# Resolve conflicts by updating pubspec.yaml
# Example: constraint conflict resolution
dependencies:
  json_serializable: ^6.7.0  # Pin specific version
```

#### C. Generation Errors
```bash
# Fix common generation issues:
# 1. Invalid Dart identifiers in API names
# 2. Reserved keywords as field names
# 3. Circular references

# Manual fixes in generated code:
# - Edit openapi/lib/libraries.dart
# - Fix import statements
# - Resolve type conflicts
```

### 3.3 Integration Issues

#### Problem: Generated client doesn't work with Flutter app
**Symptoms**:
- Import errors
- Type mismatches
- Runtime errors

**Diagnosis**:
```bash
# Check Flutter project dependencies
cd ../your-flutter-project
cat pubspec.yaml

# Check import paths
grep -r "import.*agency_openapi" lib/

# Run Flutter analysis
flutter analyze
```

**Solutions**:

#### A. Path Configuration
```yaml
# In Flutter pubspec.yaml, ensure correct path:
dependencies:
  agency_openapi:
    path: ../dev_tools/package_form_open_api/openapi

# If using relative path, verify it's correct
# Use absolute path if relative doesn't work
```

#### B. Flutter Compatibility
```bash
# Update Flutter
flutter upgrade

# Clean Flutter project
flutter clean
flutter pub get

# Run Flutter doctor
flutter doctor
```

#### C. Version Conflicts
```yaml
# Resolve version conflicts in pubspec.yaml
# Pin specific versions if needed
dependencies:
  json_annotation: ^4.8.0
  json_serializable: ^6.7.0
  dio: ^5.3.0

# Ensure compatible versions across all packages
```

## 4. Contract Testing Issues

### 4.1 E2E Test Failures

#### Problem: E2E tests are failing
**Symptoms**:
- Test suite shows red failures
- API contract mismatches
- Authentication issues

**Diagnosis**:
```bash
# Run specific failing test
cd code
npm test -- e2e.ramesh-journey.spec.ts

# Run with verbose output
npm test -- --verbose e2e.ramesh-journey.spec.ts

# Check test coverage
npm test -- --coverage
```

**Solutions**:

#### A. Test Environment Setup
```bash
# Ensure test database is ready
docker-compose exec test-db psql -U postgres -c "SELECT 1;"

# Run database migrations for tests
npm run migration:run

# Seed test data
npm run seed:test
```

#### B. API Contract Mismatches
```bash
# Check if API has changed
curl http://localhost:3000/docs-yaml > current-spec.yaml

# Compare with expected spec
diff current-spec.yaml dev_tools/package_form_open_api/input.yaml

# Regenerate client if needed
cd dev_tools/package_form_open_api
./build.sh
```

#### C. Authentication Issues
```bash
# Check authentication setup
# Verify JWT secret is configured
# Check auth endpoints are working

# Test authentication manually
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+9779812345678", "otp": "123456"}'
```

### 4.2 Test Environment Issues

#### Problem: Tests work locally but fail in CI/CD
**Symptoms**:
- Tests pass locally, fail in GitHub Actions
- Environment-specific failures
- Timing issues

**Diagnosis**:
```bash
# Check GitHub Actions logs
# Look for:
# - Environment variable issues
# - Database connection issues
# - Port conflicts
# - Timing issues

# Compare local and CI environments
# Check Docker versions, Node versions, etc.
```

**Solutions**:

#### A. Environment Configuration
```yaml
# Ensure consistent environment in GitHub Actions
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

- name: Setup Docker
  run: |
    docker --version
    docker-compose --version
```

#### B. Database Setup
```yaml
# Add database setup steps in CI
- name: Setup Test Database
  run: |
    docker-compose -f docker-compose.test.yml up -d db
    sleep 30
    docker-compose exec -T db psql -U postgres -c "CREATE DATABASE test_db;"
    npm run migration:run
    npm run seed:test
```

#### C. Timing Issues
```bash
# Add wait times for services to be ready
# In test setup:
beforeAll(async () => {
  // Wait for app to be ready
  await waitForAppReady(app, 30000); // 30 second timeout
});

// In test utilities:
export const waitForAppReady = async (app: INestApplication, timeout = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await app.getHttpAdapter().get('/health');
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('App not ready within timeout');
};
```

### 4.3 Performance Issues

#### Problem: Tests are slow or timeout
**Symptoms**:
- Tests take too long to run
- Timeout errors
- Slow API responses

**Diagnosis**:
```bash
# Measure test execution time
time npm test -- e2e.ramesh-journey.spec.ts

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health

# Monitor resource usage
docker stats
```

**Solutions**:

#### A. Test Optimization
```bash
# Run tests in parallel (if supported)
npm test -- --maxWorkers=4

# Run only specific test suites
npm test -- --testNamePattern="specific test"

# Use test isolation
# Each test should clean up after itself
```

#### B. Database Optimization
```bash
# Use test database with indexes
# Optimize test queries
# Use database transactions and rollbacks

# Example test setup with transaction:
beforeEach(async () => {
  await connection.beginTransaction();
});

afterEach(async () => {
  await connection.rollback();
});
```

#### C. API Optimization
```bash
# Add indexes to slow queries
# Optimize database queries
# Use caching where appropriate

# Monitor slow queries
docker-compose exec db psql -U postgres -d udaansarathi -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"
```

## 5. Performance Issues

### 5.1 Generation Performance

#### Problem: OpenAPI client generation is slow
**Symptoms**:
- Generation takes several minutes
- High CPU/memory usage during generation
- Generation timeouts

**Diagnosis**:
```bash
# Measure generation time
time ./build.sh

# Monitor resource usage
docker stats
top

# Check spec size
wc -l input.yaml
du -h input.yaml
```

**Solutions**:

#### A. Spec Optimization
```yaml
# Reduce spec size by:
# 1. Removing unused schemas
# 2. Using external references
# 3. Splitting large specs

# Example: Remove unused schemas
# Keep only schemas that are actually referenced
components:
  schemas:
    # Remove unused User schema if not referenced
    # User:
    #   type: object
    #   properties:
    #     id:
    #       type: string
```

#### B. Generation Optimization
```bash
# Generate with minimal options
docker run --rm \
    -v $PWD:/local \
    openapitools/openapi-generator-cli generate \
    -i /local/input.yaml \
    -g dart-dio \
    --additional-properties=serializationLibrary=json_serializable \
    -o /local/openapi \
    --global-property=models=true,supportingFiles=false,apiTests=false,modelTests=false,apiDocs=false,modelDocs=false

# Enable generation caching
export OPENAPI_GENERATOR_CACHE_DIR=/tmp/openapi-cache
```

#### C. Resource Optimization
```bash
# Increase Docker memory limits
# Docker Desktop → Settings → Resources → Memory → 4GB+

# Use SSD storage for better I/O performance
# Ensure sufficient disk space (20GB+ free)

# Close unnecessary applications during generation
```

### 5.2 Runtime Performance

#### Problem: Generated client is slow at runtime
**Symptoms**:
- Slow API calls
- High memory usage
- Poor app performance

**Diagnosis**:
```bash
# Profile API calls
# Add timing to client calls

# Monitor memory usage
# Use Flutter performance tools

# Check network performance
# Monitor API response times
```

**Solutions**:

#### A. Client Optimization
```dart
// Use connection pooling
final dio = Dio();
dio.httpClientAdapter = HttpClientAdapter();
dio.options.connectTimeout = Duration(seconds: 5);
dio.options.receiveTimeout = Duration(seconds: 15);

// Implement caching
final dio = Dio();
dio.interceptors.add(DioCacheInterceptor(
  options: CacheOptions(
    store: MemCacheStore(),
    policy: CachePolicy.requestFirst,
  ),
));

// Use batch operations where possible
Future<List<Candidate>> getCandidatesBatch(List<String> ids) async {
  return await Future.wait(
    ids.map((id) => candidatesApi.getCandidateById(id))
  );
}
```

#### B. API Optimization
```bash
# Add database indexes
# Optimize queries
# Implement response caching

# Example: Add index to frequently queried field
CREATE INDEX idx_candidates_phone ON candidates(phone);

# Implement Redis caching
# Use response compression
```

#### C. Network Optimization
```bash
# Use CDN for static assets
# Implement HTTP/2
# Use connection keep-alive

# Monitor network performance
# Use tools like ping, traceroute, mtr
```

## 6. Security Issues

### 6.1 Spec Security

#### Problem: Sensitive information exposed in spec
**Symptoms**:
- API keys in spec
- Internal endpoints exposed
- Sensitive data models visible

**Diagnosis**:
```bash
# Check spec for sensitive information
grep -i "api.*key" input.yaml
grep -i "password" input.yaml
grep -i "secret" input.yaml

# Check for internal endpoints
grep -E "internal|admin|system" input.yaml
```

**Solutions**:

#### A. Remove Sensitive Information
```yaml
# Remove sensitive fields from schemas
# Use internal decorators to hide endpoints

# Example: Hide internal endpoint
@ApiExcludeEndpoint()
@Get('internal/admin-only')
internalAdminOnly() { ... }

# Remove sensitive fields from responses
@ApiResponse({
  status: 200,
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      # Remove sensitive fields like password, ssn, etc.
    }
  }
})
```

#### B. Access Control
```bash
# Restrict spec access
# Add authentication to spec endpoint

# Example: Add auth middleware to spec endpoint
@UseGuards(AuthGuard)
@Get('docs-yaml')
getApiSpec() { ... }

# Or use environment-based access
if (process.env.NODE_ENV === 'production') {
  // Require authentication for spec access
}
```

### 6.2 Client Security

#### Problem: Security vulnerabilities in generated client
**Symptoms**:
- Insecure data transmission
- Improper error handling
- Authentication issues

**Diagnosis**:
```bash
# Check client for security issues
# Review generated code for:
# - HTTPS usage
# - Input validation
# - Error handling
# - Authentication implementation
```

**Solutions**:

#### A. Secure Implementation
```dart
// Always use HTTPS
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: Duration(seconds: 5),
  receiveTimeout: Duration(seconds: 15),
));

// Implement proper authentication
dio.interceptors.add(AuthInterceptor());

// Validate inputs
void validateCandidate(Candidate candidate) {
  if (candidate.phone == null || candidate.phone.isEmpty) {
    throw ArgumentError('Phone number is required');
  }
}

// Handle errors securely
try {
  final candidate = await api.getCandidate(id);
} on DioException catch (e) {
  // Handle specific error types
  if (e.response?.statusCode == 401) {
    // Handle unauthorized
  } else if (e.response?.statusCode == 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

#### B. Certificate Validation
```dart
// Enable certificate validation
final dio = Dio(BaseOptions(
  validateCertificate: true,
));

// Or use custom certificate validation
dio.httpClientAdapter = HttpClientAdapter();
```

## 7. Monitoring and Logging

### 7.1 Setting Up Monitoring

#### Problem: Need to monitor automated workflow health
**Symptoms**:
- No visibility into workflow status
- Difficult to diagnose issues
- No performance metrics

**Solutions**:

#### A. Logging Setup
```bash
# Add comprehensive logging to deployment script
# In .github/workflows/docker-image.yml:

- name: Deploy with logging
  run: |
    echo "🚀 Starting deployment at $(date)"
    # ... deployment commands ...
    echo "✅ Deployment completed at $(date)"

# Add logging to client generation
# In build.sh:
#!/bin/bash
set -e  # Exit on error
exec > >(tee -a build.log) 2>&1  # Log all output

echo "Starting OpenAPI client generation..."
# ... generation commands ...
echo "Generation completed successfully"
```

#### B. Health Checks
```bash
# Add health check endpoints
# In your application:

@Get('health')
getHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    database: 'connected', // Check DB connection
    openapi: 'available'   // Check OpenAPI spec
  };
}

# Create health check script
#!/bin/bash
# health-check.sh
echo "Checking system health..."

# Check server health
curl -f http://localhost:3000/health || exit 1

# Check OpenAPI spec
curl -f http://localhost:3000/docs-yaml > /dev/null || exit 1

# Check database
docker-compose exec db pg_isready || exit 1

echo "All systems healthy"
```

#### C. Performance Monitoring
```bash
# Add performance monitoring
# Use tools like Prometheus, Grafana, or New Relic

# Example: Add metrics endpoint
@Get('metrics')
getMetrics() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    responseTime: this.averageResponseTime,
    activeConnections: this.activeConnections
  };
}
```

### 7.2 Alert Setup

#### Problem: Need alerts for workflow failures
**Symptoms**:
- Silent failures
- Delayed issue detection
- No notification system

**Solutions**:

#### A. Slack Notifications
```yaml
# Add to GitHub Actions workflow
- name: Notify Slack on failure
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    text: 'Deployment failed! Check logs for details.'
```

#### B. Email Notifications
```yaml
# Add email notifications
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: 'Deployment Failed'
    body: |
      Deployment failed at ${{ github.workflow }} on ${{ github.repository }}
      Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    to: ${{ secrets.TEAM_EMAIL }}
    from: ${{ secrets.EMAIL_USERNAME }}
```

#### C. PagerDuty Integration
```yaml
# Add PagerDuty for critical failures
- name: PagerDuty Alert
  if: failure()
  uses: PagerDuty/pd-action@v1
  with:
    pagerduty_integration_key: ${{ secrets.PAGERDUTY_KEY }}
    pagerduty_event_source: 'github_actions'
    pagerduty_service_id: ${{ secrets.PAGERDUTY_SERVICE_ID }}
    pagerduty_severity: 'error'
    pagerduty_event_summary: 'Deployment workflow failed'
```

## 8. Advanced Troubleshooting

### 8.1 Debug Mode

#### Problem: Need detailed debugging information
**Solutions**:

#### A. Enable Debug Logging
```bash
# Enable verbose logging in deployment
export DEBUG=*
export NODE_OPTIONS="--inspect"

# Run with debug output
npm run start:dev -- --verbose

# Docker debug mode
docker-compose logs --tail=100 --follow
```

#### B. API Debugging
```bash
# Use API debugging tools
# Install and use:
# - Postman
# - Insomnia
# - curl with verbose output

curl -v http://localhost:3000/docs-yaml

# Use Wireshark for network debugging
# Monitor HTTP traffic
```

#### C. Database Debugging
```bash
# Enable database query logging
# In your ORM configuration:
logging: true
logger: 'advanced'

# Monitor database queries
docker-compose exec db psql -U postgres -d udaansarathi -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY total_time DESC 
  LIMIT 10;
"
```

### 8.2 Rollback Procedures

#### Problem: Need to rollback failed deployment
**Solutions**:

#### A. Git Rollback
```bash
# Find last good commit
git log --oneline -10

# Reset to last good commit
git reset --hard <commit-hash>

# Force push (careful!)
git push --force origin main

# Redeploy
git tag deploy
git push origin deploy
```

#### B. Database Rollback
```bash
# If you have migration rollback
npm run migration:revert

# Or manual database restore
docker-compose exec db pg_dump -U postgres udaansarathi > backup.sql
docker-compose exec db psql -U postgres udaansarathi < backup.sql
```

#### C. Client Rollback
```bash
# Rollback to previous client version
cd dev_tools/package_form_open_api
git checkout input.yaml~1  # Previous version
./build.sh
```

### 8.3 Disaster Recovery

#### Problem: Complete system failure
**Solutions**:

#### A. Backup and Restore
```bash
# Create comprehensive backup
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec db pg_dump -U postgres udaansarathi > $BACKUP_DIR/database.sql

# Backup configuration
cp -r .env $BACKUP_DIR/
cp -r docker-compose.yml $BACKUP_DIR/

# Backup generated client
cp -r dev_tools/package_form_openapi/openapi $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
```

#### B. System Restore
```bash
# Restore from backup
#!/bin/bash
# restore.sh
BACKUP_DIR=$1

# Restore database
docker-compose exec -T db psql -U postgres udaansarathi < $BACKUP_DIR/database.sql

# Restore configuration
cp $BACKUP_DIR/.env .
cp $BACKUP_DIR/docker-compose.yml .

# Restart services
docker-compose down
docker-compose up -d

echo "Restore completed from: $BACKUP_DIR"
```

## 9. Prevention and Best Practices

### 9.1 Preventive Measures

#### A. Regular Maintenance
```bash
# Create maintenance script
#!/bin/bash
# maintenance.sh

echo "Starting system maintenance..."

# Update dependencies
npm update

# Clean up Docker
docker system prune -f

# Run health checks
./health-check.sh

# Regenerate client
cd dev_tools/package_form_open_api
./build.sh

echo "Maintenance completed"
```

#### B. Monitoring Setup
```bash
# Set up continuous monitoring
# Use tools like:
# - UptimeRobot for endpoint monitoring
# - Prometheus for metrics
# - Grafana for dashboards
# - ELK stack for logging
```

#### C. Testing Strategy
```bash
# Implement comprehensive testing
# Unit tests, integration tests, E2E tests
# Performance testing, security testing
# Contract testing with Ramesh's journey test
```

### 9.2 Documentation

#### A. Keep Documentation Updated
- Update this troubleshooting guide regularly
- Document new issues and solutions
- Add team learnings and best practices
- Create runbooks for common scenarios

#### B. Knowledge Sharing
- Conduct regular troubleshooting sessions
- Share lessons learned from incidents
- Create decision logs for architectural decisions
- Maintain a team knowledge base

### 9.3 Team Training

#### A. Onboarding
- Create comprehensive onboarding guide
- Include troubleshooting training
- Provide hands-on practice with common issues
- Assign mentor for new team members

#### B. Skill Development
- Regular training sessions on new tools
- Cross-training between team roles
- Encourage certification and learning
- Share industry best practices

---

## Emergency Contact and Escalation

### When to Escalate
- **Critical**: Production down, data loss, security breach
- **High**: Major functionality broken, performance degradation
- **Medium**: Minor functionality issues, documentation gaps
- **Low**: Improvements, optimizations, questions

### Contact Information
- **Team Lead**: [Contact information]
- **DevOps**: [Contact information]
- **Backend Lead**: [Contact information]
- **Frontend Lead**: [Contact information]
- **QA Lead**: [Contact information]

### Escalation Process
1. **Immediate**: Contact on-call engineer
2. **15 minutes**: Escalate to team lead
3. **30 minutes**: Escalate to engineering manager
4. **1 hour**: Escalate to CTO/VP Engineering

This troubleshooting guide should be regularly updated with new issues, solutions, and team learnings. All team members should contribute to keeping this guide comprehensive and useful.