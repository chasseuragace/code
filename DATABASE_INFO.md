# Database Connection Information

## Docker Container Details

**From docker-compose.yml:**

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
    volumes:
      - pg_data:/var/lib/postgresql/data
```

---

## Connection Details

| Property | Value |
|----------|-------|
| **Container Name** | `nest_pg` |
| **Image** | `postgres:15-alpine` |
| **Host** | `localhost` |
| **Port** | `5431` |
| **Database** | `app_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Volume** | `pg_data:/var/lib/postgresql/data` |

---

## Connection Strings

### PostgreSQL CLI
```bash
psql -h localhost -p 5431 -U postgres -d app_db
```

### Docker Exec
```bash
docker exec -it nest_pg psql -U postgres -d app_db
```

### Node.js (pg module)
```javascript
const connectionString = 'postgresql://postgres:postgres@localhost:5431/app_db';
const pool = new Pool({ connectionString });
```

### Python (psycopg2)
```python
import psycopg2
conn = psycopg2.connect(
    host="localhost",
    port=5431,
    database="app_db",
    user="postgres",
    password="postgres"
)
```

### Environment Variable
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5431/app_db
```

---

## From .env File

```properties
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=app_db
```

**Note:** Inside Docker network, use `db:5432`. From host machine, use `localhost:5431`.

---

## Verify Connection

### Check if container is running
```bash
docker ps | grep nest_pg
```

### Check port mapping
```bash
docker port nest_pg
```

Should output:
```
5432/tcp -> 0.0.0.0:5431
```

### Test connection
```bash
docker exec -it nest_pg pg_isready -U postgres
```

Should output:
```
accepting connections
```

---

## Database Schema

### Schemas
- `public` - User schema (contains all application tables)
- `information_schema` - System schema
- `pg_catalog` - System schema
- `pg_toast` - System schema

### Key Tables in `public` Schema

```
candidates
├── id (UUID, PK)
├── full_name (VARCHAR)
├── phone (VARCHAR, UNIQUE)
├── gender (VARCHAR)
├── date_of_birth (DATE)
├── address (JSONB)
└── ...

job_postings
├── id (UUID, PK)
├── posting_title (VARCHAR)
└── ...

job_contracts
├── id (UUID, PK)
├── job_posting_id (UUID, FK)
└── ...

job_positions
├── id (UUID, PK)
├── job_contract_id (UUID, FK)
├── title (VARCHAR)
├── monthly_salary_amount (NUMERIC)
├── salary_currency (VARCHAR)
└── ...

job_applications
├── id (UUID, PK)
├── candidate_id (UUID, FK)
├── job_posting_id (UUID, FK)
├── position_id (UUID, FK)
├── status (VARCHAR)
└── ...

interview_details
├── id (UUID, PK)
├── job_posting_id (UUID, FK)
├── job_application_id (UUID, FK)
├── interview_date_ad (DATE)
├── interview_time (TIME)
├── duration_minutes (INTEGER)
├── location (TEXT)
├── contact_person (VARCHAR)
├── status (VARCHAR)
└── ...
```

---

## Useful SQL Queries

### List all tables
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Count records in each table
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View test candidates
```sql
SELECT id, full_name, phone, gender, date_of_birth
FROM candidates
WHERE full_name LIKE 'Test Candidate%'
ORDER BY full_name;
```

### View test interviews
```sql
SELECT 
  id,
  interview_date_ad,
  interview_time,
  location,
  contact_person
FROM interview_details
WHERE location = 'Test Office'
ORDER BY interview_date_ad, interview_time;
```

### Count test data
```sql
SELECT 
  (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Test Candidate%') as test_candidates,
  (SELECT COUNT(*) FROM job_applications WHERE status = 'interview_scheduled') as scheduled_interviews,
  (SELECT COUNT(*) FROM interview_details WHERE location = 'Test Office') as test_interviews;
```

### View job details
```sql
SELECT 
  jp.id,
  jp.posting_title,
  jc.id as contract_id,
  jpos.id as position_id,
  jpos.title as position_title
FROM job_postings jp
LEFT JOIN job_contracts jc ON jc.job_posting_id = jp.id
LEFT JOIN job_positions jpos ON jpos.job_contract_id = jc.id
WHERE jp.id = '381ed0d7-5883-4898-a9d6-531aec0c409b';
```

---

## Docker Commands

### Start database
```bash
docker-compose up -d db
```

### Stop database
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f db
```

### Connect to database
```bash
docker exec -it nest_pg psql -U postgres -d app_db
```

### Backup database
```bash
docker exec nest_pg pg_dump -U postgres app_db > backup.sql
```

### Restore database
```bash
docker exec -i nest_pg psql -U postgres app_db < backup.sql
```

### Check database size
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT pg_size_pretty(pg_database_size('app_db'));"
```

---

## Troubleshooting

### Port already in use
```bash
# Find process using port 5431
lsof -i :5431

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
# Change "5431:5432" to "5432:5432" or another available port
```

### Connection refused
```bash
# Check if container is running
docker ps | grep nest_pg

# Start container if not running
docker-compose up -d db

# Check port mapping
docker port nest_pg
```

### Database locked
```bash
# Restart container
docker-compose restart db

# Or kill all connections and restart
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'app_db' AND pid <> pg_backend_pid();"
```

### Out of disk space
```bash
# Check volume size
docker volume ls
docker volume inspect pg_data

# Clean up old data
docker volume prune
```

---

## Performance Tips

### Enable query logging
```sql
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### Check slow queries
```sql
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Create indexes
```sql
CREATE INDEX idx_candidates_phone ON candidates(phone);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_interview_details_date ON interview_details(interview_date_ad);
```

### Analyze query plan
```sql
EXPLAIN ANALYZE
SELECT * FROM candidates WHERE phone = '+9779862146250';
```

---

## Backup & Recovery

### Automated backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec nest_pg pg_dump -U postgres app_db > $BACKUP_DIR/app_db_$TIMESTAMP.sql
echo "Backup created: $BACKUP_DIR/app_db_$TIMESTAMP.sql"
EOF

chmod +x backup.sh

# Schedule with cron
0 2 * * * /path/to/backup.sh
```

### Point-in-time recovery
```bash
# Enable WAL archiving in docker-compose.yml
# Then restore from backup and replay WAL files
```

---

## Security Notes

⚠️ **Development Only**
- Default credentials are used (postgres:postgres)
- No authentication required from localhost
- Not suitable for production

🔒 **For Production**
- Change default password
- Use strong credentials
- Enable SSL/TLS
- Restrict network access
- Use environment variables for secrets
- Enable audit logging
- Regular backups
- Monitor access logs
