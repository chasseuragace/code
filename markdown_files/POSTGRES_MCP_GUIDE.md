# Postgres MCP - Database Verification Guide

## Overview

The Postgres MCP (Model Context Protocol) tool allows you to query your database directly from Kiro without using the command line.

## Configuration

Your MCP is configured at: `/Users/ajaydahal/.kiro/settings/mcp.json`

```json
{
  "postgres": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e",
      "DATABASE_URI",
      "crystaldba/postgres-mcp",
      "--access-mode=unrestricted"
    ],
    "env": {
      "DATABASE_URI": "postgresql://postgres:postgres@host.docker.internal:5431/app_db"
    },
    "disabled": false,
    "autoApprove": [
      "query",
      "execute",
      "list_tables",
      "describe_table",
      "get_table_schema"
    ]
  }
}
```

## How to Use

### 1. Activate the Postgres MCP

In Kiro chat, use the power system:

```
@postgres query "SELECT * FROM users LIMIT 5;"
```

Or use the MCP tools directly through the Kiro interface.

### 2. Common Queries

**Check Users Table Schema:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

**Check if fcm_token column exists:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'fcm_token';
```

**View all users:**
```sql
SELECT id, phone, full_name, role, fcm_token, created_at 
FROM users 
LIMIT 10;
```

**View test user:**
```sql
SELECT id, phone, fcm_token, created_at 
FROM users 
WHERE phone = '+9779812345678';
```

**View users with FCM tokens:**
```sql
SELECT id, phone, fcm_token, created_at 
FROM users 
WHERE fcm_token IS NOT NULL 
ORDER BY created_at DESC;
```

**Count users by role:**
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

**Check notifications table:**
```sql
SELECT id, candidate_id, notification_type, title, is_read, is_sent, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check notifications for a specific user:**
```sql
SELECT id, notification_type, title, message, is_read, is_sent, created_at 
FROM notifications 
WHERE candidate_id = (SELECT candidate_id FROM users WHERE phone = '+9779812345678')
ORDER BY created_at DESC;
```

### 3. Update Queries

**Update FCM token for test user:**
```sql
UPDATE users 
SET fcm_token = 'your-new-fcm-token-here' 
WHERE phone = '+9779812345678';
```

**Clear FCM tokens (for testing):**
```sql
UPDATE users 
SET fcm_token = NULL 
WHERE phone = '+9779812345678';
```

**Mark all notifications as read:**
```sql
UPDATE notifications 
SET is_read = true, read_at = NOW() 
WHERE is_read = false;
```

### 4. Insert Queries

**Create a new test user:**
```sql
INSERT INTO users (id, phone, full_name, role, is_active, candidate_id, fcm_token)
VALUES (
  gen_random_uuid(),
  '+9779812345679',
  'Another Test User',
  'candidate',
  true,
  gen_random_uuid(),
  'test-token-2'
);
```

### 5. Delete Queries

**Delete test user:**
```sql
DELETE FROM users 
WHERE phone = '+9779812345678';
```

---

## Database Connection Details

- **Host:** `host.docker.internal` (Docker internal DNS)
- **Port:** `5431` (mapped from container 5432)
- **Database:** `app_db`
- **Username:** `postgres`
- **Password:** `postgres`

These credentials are from your `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: nest_pg
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5431:5432"
```

---

## Troubleshooting

**Connection refused:**
- Ensure Docker containers are running: `docker ps`
- Check if Postgres is healthy: `docker ps | grep nest_pg`

**Table not found:**
- Verify database name: `app_db`
- List all tables: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

**Permission denied:**
- MCP is configured with `--access-mode=unrestricted`
- All queries should work

---

## Useful Commands

**List all tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Get table row counts:**
```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

**Check database size:**
```sql
SELECT 
  datname,
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname = 'app_db';
```

**View recent activity:**
```sql
SELECT 
  pid,
  usename,
  application_name,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE datname = 'app_db'
ORDER BY query_start DESC;
```

