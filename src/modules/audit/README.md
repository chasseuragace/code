# Audit Logging Module

## Overview

The Audit Logging module captures security-relevant actions in the UdaanSarathi recruitment portal. It provides a structured way to track **who did what, to which resource, how, and when**.

## Architecture

### Three Framing Layers

Every audit event is structured with three framing layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     AUDIT EVENT                              │
├─────────────────────────────────────────────────────────────┤
│  1. REQUEST FRAME                                           │
│     - method (POST, PUT, PATCH, DELETE)                     │
│     - path (/applications/123/shortlist)                    │
│     - correlation_id (for tracing)                          │
│     - origin_ip, user_agent                                 │
├─────────────────────────────────────────────────────────────┤
│  2. IDENTITY FRAME (extracted from Bearer token)            │
│     - user_id (who performed the action)                    │
│     - user_role (candidate, owner, agency_user)             │
│     - agency_id (for agency-scoped actions)                 │
│     - client_id (web-app, mobile-app)                       │
├─────────────────────────────────────────────────────────────┤
│  3. ACTIVITY FRAME (what happened)                          │
│     - action (apply_job, shortlist_candidate, etc.)         │
│     - category (auth, application, interview, etc.)         │
│     - resource_type (job_application, job_posting)          │
│     - resource_id (UUID of affected resource)               │
│     - state_change ({ status: ['applied', 'shortlisted'] }) │
│     - outcome (success, failure, denied)                    │
└─────────────────────────────────────────────────────────────┘
```

## Domain Categories

Audit events are categorized by domain concepts relevant to the recruitment portal:

| Category | Description | Example Actions |
|----------|-------------|-----------------|
| `auth` | Authentication events | register, login_start, login_verify |
| `application` | Job application workflow | apply_job, shortlist_candidate, withdraw |
| `interview` | Interview scheduling | schedule_interview, reschedule, complete |
| `job_posting` | Job posting management | create, update, close, update_tags |
| `agency` | Agency management | create_agency, add_team_member |
| `candidate` | Candidate profile | create_profile, update_job_profile |
| `admin` | Admin operations | bulk_reject, view_admin_jobs |

## Flow: How Requests Become Audit Logs

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Request    │────▶│  AuditMiddleware │────▶│ Business Logic  │
│   arrives    │     │                  │     │                 │
└──────────────┘     │ 1. Extract Bearer│     │ Performs action │
                     │ 2. Parse identity│     │                 │
                     │ 3. Create context│     └────────┬────────┘
                     └────────┬─────────┘              │
                              │                        │
                              ▼                        ▼
                     ┌──────────────────┐     ┌─────────────────┐
                     │  Response sent   │◀────│   Response      │
                     │                  │     │   generated     │
                     │ 4. Match route   │     └─────────────────┘
                     │ 5. Log audit     │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   AuditService   │
                     │                  │
                     │ Persist to DB    │
                     └──────────────────┘
```

## API Endpoints

### Query Audit Logs
```
GET /audit/logs
  ?category=application
  &action=apply_job
  &start_date=2025-12-01
  &end_date=2025-12-05
  &page=1
  &limit=50
```

### Get Timeline (Recent Activity)
```
GET /audit/timeline?limit=20
```

### Get Category Summary
```
GET /audit/summary
  ?start_date=2025-12-01
  &end_date=2025-12-05
```

### Get Resource History
```
GET /audit/resources/job_application/app-uuid
```

### Get User Activity
```
GET /audit/users/user-uuid
  ?start_date=2025-12-01
  &limit=100
```

## Use Cases for Domain Observers

### Agency Admin: "Who applied to our jobs today?"
```
GET /audit/logs?category=application&action=apply_job&start_date=2025-12-05
```

### Agency Admin: "What happened to application X?"
```
GET /audit/resources/job_application/app-uuid
```

### System Admin: "Show all failed login attempts"
```
GET /audit/logs?category=auth&outcome=failure
```

### Candidate: "What actions have I taken?"
```
GET /audit/users/my-user-id
```

## What Gets Audited

### Audited (State-Changing Operations)
- POST, PUT, PATCH, DELETE requests
- Authentication events (register, login, verify)
- Application workflow (apply, shortlist, schedule, complete, withdraw)
- Job posting management (create, update, close)
- Agency operations (create, add/remove members)

### NOT Audited
- GET requests (read-only, logged as access logs if needed)
- Health check endpoints
- Static assets
- Swagger documentation

### GET Chaining Note
While GETs are not audited individually, they can be traced via `correlation_id` when part of a workflow:
```
GET /jobs/123          (access log, corr-id: abc)
GET /candidates/me     (access log, corr-id: abc)
POST /applications     (AUDIT LOG, corr-id: abc)
```

## Example Audit Log Entry

```json
{
  "id": "audit-uuid",
  "created_at": "2025-12-05T10:30:00.000Z",
  
  "method": "POST",
  "path": "/applications/app-123/shortlist",
  "correlation_id": "corr-abc-123",
  "origin_ip": "192.168.1.10",
  
  "user_id": "user-uuid",
  "user_role": "agency_user",
  "agency_id": "agency-uuid",
  "client_id": "web-app",
  
  "action": "shortlist_candidate",
  "category": "application",
  "resource_type": "job_application",
  "resource_id": "app-123",
  "state_change": {
    "status": ["applied", "shortlisted"]
  },
  
  "outcome": "success",
  "status_code": 200,
  "duration_ms": 45
}
```

## Security & Scoping

Audit log access is scoped based on the observer's role:

| Role | Can See |
|------|---------|
| `candidate` | Only their own activity |
| `agency_user` | Their agency's activity |
| `owner` | Their agency's activity |
| `admin` | All activity |

## Database Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request Frame
  method VARCHAR(10),
  path VARCHAR(500),
  correlation_id VARCHAR(50),
  origin_ip VARCHAR(50),
  user_agent VARCHAR(500),
  
  -- Identity Frame
  user_id UUID,
  user_email VARCHAR(100),
  user_role VARCHAR(50),
  agency_id UUID,
  client_id VARCHAR(100),
  
  -- Activity Frame
  action VARCHAR(100),
  category VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  state_change JSONB,
  metadata JSONB,
  
  -- Outcome
  outcome VARCHAR(20),
  status_code INT,
  error_message TEXT,
  duration_ms INT
);

-- Indexes for common queries
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_agency_id ON audit_logs(agency_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_category ON audit_logs(category);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_resource_type ON audit_logs(resource_type);
```

## Integration

The audit module is automatically applied via middleware. No changes needed to existing controllers.

To manually log an audit event from a service:

```typescript
import { AuditService, AuditCategories, AuditActions } from '../audit';

@Injectable()
export class MyService {
  constructor(private readonly auditService: AuditService) {}

  async doSomething() {
    // ... business logic ...

    await this.auditService.log(
      {
        method: 'POST',
        path: '/custom/action',
        userId: 'user-uuid',
        userRole: 'admin',
      },
      {
        action: 'custom_action',
        category: AuditCategories.SYSTEM,
        resourceType: 'custom_resource',
        resourceId: 'resource-uuid',
      },
      {
        outcome: 'success',
        statusCode: 200,
      }
    );
  }
}
```
