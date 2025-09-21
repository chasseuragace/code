# Team Guide: Automated API Specification Access

This guide provides team members with comprehensive instructions for accessing and working with automated API specifications in the UdaanSarathi project.

## Overview

The automated API specification system provides real-time access to OpenAPI specifications, generated client libraries, and comprehensive documentation. This ensures all team members work with consistent, up-to-date API contracts.

## Quick Start for Team Members

### 1. Accessing Live API Documentation

**Primary Access Point**: `http://your-server/docs-yaml`
- Returns complete OpenAPI 3.0 specification
- Always reflects the latest deployed API
- No authentication required for spec access

**Alternative Access Points**:
- **Local Development**: `http://localhost:3000/docs-yaml`
- **Staging Environment**: `http://staging-server/docs-yaml`
- **Production Environment**: `http://api-server/docs-yaml`

### 2. Quick API Documentation Access

The system generates comprehensive Markdown documentation for all API endpoints:

```bash
# Navigate to generated documentation
cd dev_tools/package_form_open_api/openapi

# View key documentation files
ls -la *.md

# Open specific API documentation
cat CandidatesApi.md     # Candidate management
cat AuthApi.md          # Authentication
cat AgenciesApi.md      # Agency management
```

### 3. Generated Client Library Access

**Dart/Flutter Projects**:
```yaml
# Add to pubspec.yaml
dependencies:
  agency_openapi:
    path: ../dev_tools/package_form_open_api/openapi
```

**Usage in Code**:
```dart
import 'package:agency_openapi/lib/api.dart';

// Initialize API client
final candidatesApi = CandidatesApi();
final authApi = AuthApi();
final agenciesApi = AgenciesApi();

// Example: Get candidates
final candidates = await candidatesApi.getCandidates();
```

## Role-Based Access Guide

### For Frontend Developers

#### Accessing API Contracts
1. **Live Spec Access**: Use `/docs-yaml` endpoint for real-time API contracts
2. **Generated Documentation**: Review Markdown files in `dev_tools/package_form_open_api/openapi/`
3. **Type Safety**: Use generated Dart client for type-safe API calls

#### Integration Workflow
```bash
# 1. Sync latest spec
cd dev_tools/package_form_open_api
./sync-spec.sh

# 2. Generate client
./build.sh

# 3. Update Flutter project
cd ../your-flutter-project
flutter pub get

# 4. Test integration
flutter test
```

#### Common Tasks
- **API Method Discovery**: Check generated API classes for available methods
- **Request/Response Models**: Use generated DTOs for type safety
- **Error Handling**: Review generated exception classes
- **Authentication**: Use generated auth helpers

### For Backend Developers

#### Spec Management
1. **Automatic Updates**: OpenAPI spec is automatically generated from controllers
2. **Validation**: Use built-in spec validation tools
3. **Version Control**: Track spec changes in git

#### Spec Validation Commands
```bash
# Validate current spec
cd dev_tools/package_form_open_api
openapi-generator-cli validate -i input.yaml

# Generate and validate client
./build.sh

# Run contract tests
cd ../code
npm test -- e2e.ramesh-journey.spec.ts
```

#### Best Practices
- **Controller Documentation**: Add comprehensive JSDoc comments to controllers
- **Schema Validation**: Use DTOs with proper validation decorators
- **Error Responses**: Define consistent error response schemas
- **API Versioning**: Use semantic versioning for breaking changes

### For QA Engineers

#### Contract Testing
1. **E2E Test Suite**: Run comprehensive contract validation tests
2. **API Coverage**: Verify all endpoints are tested
3. **Error Scenarios**: Test error handling and edge cases

#### Test Execution
```bash
# Run full contract test suite
cd code
npm test -- --runInBand

# Run specific contract test
npm test -- e2e.ramesh-journey.spec.ts

# Run API integration tests
npm test -- test/integration/api-contracts.spec.ts
```

#### Test Coverage Analysis
```bash
# Generate test coverage report
npm test -- --coverage

# View coverage details
cat coverage/lcov.info | grep api
```

### For DevOps Engineers

#### Deployment Integration
1. **Automated Workflows**: GitHub Actions handles spec sync and client generation
2. **Environment Management**: Different spec access points for each environment
3. **Monitoring**: Track spec generation success/failure rates

#### Deployment Commands
```bash
# Deploy with automatic spec generation
git tag deploy
git push origin deploy

# Monitor deployment
# Check GitHub Actions for deployment status
# Verify spec access: curl http://staging-server/docs-yaml
```

#### Health Monitoring
```bash
# Check spec accessibility
curl -f http://your-server/docs-yaml

# Monitor generation logs
docker-compose logs | grep openapi

# Check client generation status
cd dev_tools/package_form_open_api && ls -la openapi/
```

## Detailed Workflows

### 1. New Feature Development Workflow

#### For Backend Developers
```bash
# 1. Develop new API endpoint
# Add controller methods with proper documentation

# 2. Test locally
npm run start:dev
curl http://localhost:3000/docs-yaml

# 3. Validate spec
cd dev_tools/package_form_open_api
./sync-spec.sh
openapi-generator-cli validate -i input.yaml

# 4. Update client
./build.sh

# 5. Run contract tests
cd ../code
npm test -- e2e.ramesh-journey.spec.ts

# 6. Commit and deploy
git add .
git commit -m "feat: add new API endpoint"
git push origin main
git tag deploy
git push origin deploy
```

#### For Frontend Developers
```bash
# 1. Wait for deployment notification
# Check Slack/email for deployment completion

# 2. Sync latest client
cd dev_tools/package_form_open_api
./sync-spec.sh
./build.sh

# 3. Update Flutter project
cd ../your-flutter-project
flutter pub get

# 4. Implement new feature
# Use generated API client for new endpoints

# 5. Test integration
flutter test
flutter run
```

### 2. Bug Fix Workflow

#### API Contract Bug
```bash
# 1. Identify the issue
# Check error logs and test failures

# 2. Fix backend code
# Update controllers and DTOs

# 3. Validate fix
npm test -- e2e.ramesh-journey.spec.ts

# 4. Regenerate client
cd dev_tools/package_form_open_api
./build.sh

# 5. Test frontend integration
cd ../your-flutter-project
flutter test

# 6. Deploy fix
git tag deploy
git push origin deploy
```

### 3. API Version Management

#### When to Version
- **Breaking Changes**: New required fields, removed endpoints, changed response formats
- **Non-Breaking Changes**: New optional fields, new endpoints, deprecation notices

#### Versioning Process
```bash
# 1. Create version branch
git checkout -b feature/api-v2

# 2. Update API version in controllers
# Add version prefixes or headers

# 3. Generate versioned spec
# Update spec generation to include version

# 4. Deploy alongside v1
# Both versions run simultaneously

# 5. Migrate clients gradually
# Update frontend to use v2 endpoints
```

## Tools and Utilities

### 1. Spec Management Tools

#### OpenAPI Validator
```bash
# Install validator
npm install -g @openapitools/openapi-generator-cli

# Validate spec
openapi-generator-cli validate -i input.yaml
```

#### Spec Diff Tool
```bash
# Compare two spec versions
diff old-spec.yaml new-spec.yaml

# Or use specialized tools
npm install -g openapi-diff
openapi-diff old-spec.yaml new-spec.yaml
```

### 2. Client Generation Tools

#### Dart Client Generation
```bash
# Generate client with custom options
docker run --rm \
    -v $PWD:/local openapitools/openapi-generator-cli generate \
    -i /local/input.yaml \
    -g dart-dio \
    --additional-properties=serializationLibrary=json_serializable,pubName=agency_openapi \
    -o /local/openapi
```

#### Other Language Support
```bash
# Generate TypeScript client
docker run --rm \
    -v $PWD:/local openapitools/openapi-generator-cli generate \
    -i /local/input.yaml \
    -g typescript-axios \
    -o /local/typescript-client

# Generate Python client
docker run --rm \
    -v $PWD:/local openapitools/openapi-generator-cli generate \
    -i /local/input.yaml \
    -g python \
    -o /local/python-client
```

### 3. Testing Tools

#### Contract Testing
```bash
# Run comprehensive contract tests
npm test -- e2e.ramesh-journey.spec.ts

# Run specific endpoint tests
npm test -- test/integration/candidate-api.spec.ts

# Run performance tests
npm test -- test/performance/api-performance.spec.ts
```

#### API Monitoring
```bash
# Monitor API health
curl -f http://your-server/health

# Monitor spec accessibility
curl -f http://your-server/docs-yaml

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s http://your-server/docs-yaml
```

## Troubleshooting Common Issues

### 1. Spec Access Issues

#### Problem: Cannot access `/docs-yaml`
```bash
# Check server status
docker-compose ps

# Check server logs
docker-compose logs app

# Test accessibility
curl -v http://your-server/docs-yaml

# Check network connectivity
ping your-server
```

#### Solution:
- Verify server is running and accessible
- Check firewall rules
- Ensure proper DNS resolution
- Verify port configuration

### 2. Client Generation Issues

#### Problem: Generation fails with validation errors
```bash
# Validate spec manually
openapi-generator-cli validate -i input.yaml

# Check spec syntax
python3 -c "import yaml; yaml.safe_load(open('input.yaml'))"

# Fix common issues
# Check for duplicate operation IDs
# Verify all $ref references are valid
# Ensure all schemas are properly defined
```

#### Solution:
- Fix spec validation errors
- Ensure all references are valid
- Check for duplicate operation IDs
- Verify schema definitions

### 3. Integration Issues

#### Problem: Generated client doesn't match server API
```bash
# Sync latest spec
./sync-spec.sh

# Regenerate client
./build.sh

# Run contract tests
cd ../code
npm test -- e2e.ramesh-journey.spec.ts
```

#### Solution:
- Ensure spec is synchronized with latest server
- Regenerate client after spec updates
- Run contract tests to validate integration
- Check for deployment synchronization issues

## Best Practices

### 1. Spec Management

- **Keep Specs Current**: Always sync specs before making changes
- **Validate Early**: Validate specs before committing changes
- **Version Control**: Track spec changes in git
- **Document Changes**: Add comments for breaking changes

### 2. Client Integration

- **Use Generated Clients**: Always use generated clients for type safety
- **Update Regularly**: Sync clients after each deployment
- **Test Integration**: Run integration tests after client updates
- **Handle Errors**: Use generated error classes for proper error handling

### 3. Testing

- **Comprehensive Coverage**: Test all API endpoints
- **Contract Validation**: Use E2E tests for contract validation
- **Performance Testing**: Monitor API response times
- **Error Scenarios**: Test error handling and edge cases

### 4. Collaboration

- **Communicate Changes**: Notify team of API changes
- **Review Specs**: Review spec changes in pull requests
- **Document Decisions**: Document API design decisions
- **Share Knowledge**: Share learnings with the team

## Team Communication

### 1. Change Notifications

#### When to Notify
- **Breaking Changes**: Always notify team members
- **New Features**: Notify relevant team members
- **Bug Fixes**: Notify if fix affects integration
- **Deprecations**: Notify well in advance

#### Notification Channels
- **Slack**: Use dedicated `api-changes` channel
- **Email**: Send detailed change notifications
- **Documentation**: Update API documentation
- **Meetings**: Discuss major changes in team meetings

### 2. Review Process

#### Spec Review Checklist
- [ ] All endpoints are properly documented
- [ ] Request/response schemas are valid
- [ ] Error responses are defined
- [ ] Authentication requirements are clear
- [ ] Rate limiting is documented
- [ ] Examples are provided

#### Code Review Checklist
- [ ] Controller methods follow conventions
- [ ] DTOs have proper validation
- [ ] Error handling is consistent
- [ ] Tests are updated
- [ ] Documentation is updated

### 3. Knowledge Sharing

#### Documentation Standards
- **API Documentation**: Use OpenAPI/Swagger standards
- **Code Comments**: Add comprehensive JSDoc comments
- **Change Logs**: Maintain detailed change logs
- **User Guides**: Create user guides for complex features

#### Training Resources
- **Onboarding**: Create onboarding guides for new team members
- **Workshops**: Conduct API design workshops
- **Code Reviews**: Regular code review sessions
- **Knowledge Base**: Maintain team knowledge base

## Performance Optimization

### 1. Spec Generation Performance

#### Optimization Techniques
```bash
# Use spec caching
export OPENAPI_CACHE_DIR=/tmp/openapi-cache

# Minimize spec size
# Remove unused schemas
# Use external $ref references
# Optimize large arrays

# Parallel generation
# Use multiple workers for large specs
```

#### Monitoring
```bash
# Track generation time
time ./build.sh

# Monitor resource usage
docker stats

# Check spec size
wc -l input.yaml
du -h input.yaml
```

### 2. Client Performance

#### Optimization Techniques
- **Lazy Loading**: Load API clients only when needed
- **Connection Pooling**: Use HTTP connection pooling
- **Caching**: Implement response caching where appropriate
- **Batching**: Batch API calls when possible

#### Monitoring
```bash
# Monitor client performance
# Track API response times
# Monitor memory usage
# Check error rates
```

## Security Considerations

### 1. Spec Security

#### Access Control
- **Public Specs**: Ensure public specs don't expose sensitive information
- **Authentication**: Use authentication for sensitive API documentation
- **Rate Limiting**: Implement rate limiting for spec access
- **Audit Logging**: Log spec access for security monitoring

#### Data Protection
- **Sensitive Data**: Remove sensitive data from public specs
- **PII**: Ensure no personally identifiable information in specs
- **Credentials**: Never include credentials in specs
- **Keys**: Remove API keys and secrets from specs

### 2. Client Security

#### Secure Implementation
- **Authentication**: Use secure authentication methods
- **Authorization**: Implement proper authorization checks
- **Input Validation**: Validate all inputs
- **Error Handling**: Handle errors securely

#### Best Practices
- **HTTPS**: Always use HTTPS for API calls
- **Certificate Validation**: Validate SSL certificates
- **Token Management**: Store tokens securely
- **Session Management**: Implement proper session management

## Future Enhancements

### 1. Planned Features

#### Real-time Spec Updates
- **WebSocket Integration**: Real-time spec updates
- **Change Notifications**: Instant notifications for spec changes
- **Live Documentation**: Interactive API documentation
- **Version Management**: Advanced version control features

#### Enhanced Testing
- **Automated Test Generation**: Generate tests from specs
- **Performance Testing**: Integrated performance testing
- **Security Testing**: Automated security testing
- **Contract Testing**: Enhanced contract validation

### 2. Integration Opportunities

#### API Gateway Integration
- **Kong**: Integration with Kong API Gateway
- **AWS API Gateway**: Integration with AWS services
- **Azure API Management**: Integration with Azure services
- **Google Cloud Endpoints**: Integration with Google Cloud

#### Monitoring and Analytics
- **Prometheus**: Integration with Prometheus monitoring
- **Grafana**: Integration with Grafana dashboards
- **ELK Stack**: Integration with ELK stack
- **Datadog**: Integration with Datadog monitoring

---

## Quick Reference Commands

### Common Commands
```bash
# Sync spec from server
./sync-spec.sh

# Generate client
./build.sh

# Validate spec
openapi-generator-cli validate -i input.yaml

# Run contract tests
cd ../code && npm test -- e2e.ramesh-journey.spec.ts

# Check server health
curl http://your-server/health

# Access live spec
curl http://your-server/docs-yaml
```

### File Locations
- **Spec Input**: `dev_tools/package_form_open_api/input.yaml`
- **Generated Client**: `dev_tools/package_form_open_api/openapi/`
- **Contract Tests**: `code/test/e2e.ramesh-journey.spec.ts`
- **Deployment Config**: `.github/workflows/docker-image.yml`
- **Main Documentation**: `code/docs/guide.md`

### Access URLs
- **Live Spec**: `http://your-server/docs-yaml`
- **Health Check**: `http://your-server/health`
- **API Base**: `http://your-server/api`
- **Documentation**: `http://your-server/api-docs`

This guide should be referenced by all team members when working with API specifications and generated clients. Regular updates and team feedback will help keep this guide current and useful.