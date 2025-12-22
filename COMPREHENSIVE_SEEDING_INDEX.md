# Comprehensive Seeding - Complete Index

## 📋 Quick Navigation

### For Quick Start
1. **COMPREHENSIVE_SEEDING_QUICK_START.md** - One-liner examples and quick reference
2. **seed-comprehensive-test-data.js** - The seeding script

### For Understanding
1. **COMPREHENSIVE_SEEDING_SUMMARY.md** - Complete overview and data structure
2. **COMPREHENSIVE_SEEDING_GUIDE.md** - Detailed guide with examples

### For Reference
1. **DATABASE_INFO.md** - Database connection and SQL queries
2. **INTERVIEW_TESTING_SUMMARY.md** - Testing and filter reference

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start database
docker-compose up -d

# 2. Create test data (5 candidates, 2 agencies, 3 postings, 2 positions, 4 apps)
node seed-comprehensive-test-data.js 5 2 3 2 4

# 3. Test endpoint
curl http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

---

## 📊 What Gets Created

```
node seed-comprehensive-test-data.js [n] [m] [p] [q] [r]

n = candidates
m = agencies
p = postings per agency
q = positions per posting
r = applications per candidate

Total Postings = m × p
Total Positions = m × p × q
Total Applications = n × r
Total Interviews = n × r
```

---

## 📁 Files in This Package

### Seeding Scripts
- **seed-comprehensive-test-data.js** - Main comprehensive seeder

### Documentation
- **COMPREHENSIVE_SEEDING_QUICK_START.md** - Quick reference and examples
- **COMPREHENSIVE_SEEDING_GUIDE.md** - Detailed guide with SQL queries
- **COMPREHENSIVE_SEEDING_SUMMARY.md** - Complete technical summary
- **COMPREHENSIVE_SEEDING_INDEX.md** - This file

### Related Documentation
- **DATABASE_INFO.md** - Database connection details
- **INTERVIEW_TESTING_SUMMARY.md** - Testing and filters
- **INTERVIEW_FILTERS_DOCUMENTATION.md** - Complete filter reference
- **TEST_URLS.md** - Example test URLs

---

## 🎯 Common Use Cases

### Test Small Set
```bash
node seed-comprehensive-test-data.js 5 2 3 2 4
```
Creates: 5 candidates, 2 agencies, 6 postings, 12 positions, 20 applications

### Test Medium Set
```bash
node seed-comprehensive-test-data.js 10 3 2 3 5
```
Creates: 10 candidates, 3 agencies, 6 postings, 18 positions, 50 applications

### Test Large Set
```bash
node seed-comprehensive-test-data.js 20 5 4 2 3
```
Creates: 20 candidates, 5 agencies, 20 postings, 40 positions, 60 applications

### Test Heavy Load
```bash
node seed-comprehensive-test-data.js 50 10 5 3 10
```
Creates: 50 candidates, 10 agencies, 50 postings, 150 positions, 500 applications

---

## 🔗 Data Relationships

```
Candidate (n)
  ↓
Job Application (n × r)
  ├── candidate_id → Candidate
  ├── job_posting_id → Job Posting
  └── position_id → Job Position
      ↓
      Job Position (m × p × q)
        ↓
        job_contract_id → Job Contract
          ├── job_posting_id → Job Posting (m × p)
          ├── employer_id → Employer (m × p)
          └── posting_agency_id → Agency (m)
```

---

## ✅ Verification

### Count All Seed Data
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 
    (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
    (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
    (SELECT COUNT(*) FROM job_postings WHERE posting_title LIKE 'Seed Job%') as postings,
    (SELECT COUNT(*) FROM job_applications ja 
     JOIN candidates c ON ja.candidate_id = c.id 
     WHERE c.full_name LIKE 'Seed Candidate%') as applications;
"
```

### Verify Ownership
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 
    c.full_name, jp.posting_title, jpos.title, pa.name
  FROM job_applications ja
  JOIN candidates c ON ja.candidate_id = c.id
  JOIN job_postings jp ON ja.job_posting_id = jp.id
  JOIN job_positions jpos ON ja.position_id = jpos.id
  JOIN job_contracts jc ON jpos.job_contract_id = jc.id
  JOIN posting_agencies pa ON jc.posting_agency_id = pa.id
  WHERE c.full_name LIKE 'Seed Candidate%'
  LIMIT 10;
"
```

---

## 🧪 Test Endpoints

### All interview_scheduled candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

### Today's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100
```

### Tomorrow's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=tomorrow&limit=100
```

### Unattended interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=unattended&limit=100
```

### Agency interviews (all)
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```

---

## 🗑️ Cleanup

### Delete All Seed Data
```bash
docker exec -it nest_pg psql -U postgres -d app_db << 'EOF'
DELETE FROM interview_details WHERE job_application_id IN (
  SELECT ja.id FROM job_applications ja
  JOIN candidates c ON ja.candidate_id = c.id
  WHERE c.full_name LIKE 'Seed Candidate%'
);
DELETE FROM job_applications WHERE candidate_id IN (
  SELECT id FROM candidates WHERE full_name LIKE 'Seed Candidate%'
);
DELETE FROM job_positions WHERE job_contract_id IN (
  SELECT id FROM job_contracts WHERE posting_agency_id IN (
    SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
  )
);
DELETE FROM job_contracts WHERE posting_agency_id IN (
  SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
);
DELETE FROM job_postings WHERE posting_title LIKE 'Seed Job%';
DELETE FROM employers WHERE company_name LIKE 'Seed Employer%';
DELETE FROM posting_agencies WHERE name LIKE 'Seed Agency%';
DELETE FROM candidates WHERE full_name LIKE 'Seed Candidate%';
EOF
```

---

## 📚 Documentation Map

### Getting Started
1. This file (COMPREHENSIVE_SEEDING_INDEX.md)
2. COMPREHENSIVE_SEEDING_QUICK_START.md
3. seed-comprehensive-test-data.js

### Understanding the Data
1. COMPREHENSIVE_SEEDING_SUMMARY.md
2. COMPREHENSIVE_SEEDING_GUIDE.md

### Testing & Verification
1. INTERVIEW_TESTING_SUMMARY.md
2. TEST_URLS.md
3. DATABASE_INFO.md

### Filter Reference
1. INTERVIEW_FILTERS_DOCUMENTATION.md
2. INTERVIEW_FILTERS_QUICK_REFERENCE.md

---

## 🔑 Key Concepts

### Ownership Matters
- Each job application is linked to a specific candidate, posting, and position
- Each position is linked to a specific contract
- Each contract links a posting to an employer and agency
- Ownership relationships are maintained correctly

### Random Assignment
- Applications are randomly assigned to agencies/postings/positions
- This creates realistic test scenarios
- All relationships remain valid

### Cloning from Templates
- All data is cloned from existing templates
- Ensures consistency and realism
- Templates are identified by NOT containing "Seed" prefix

### Scalability
- Create any number of records
- Run multiple times to create more data
- No data is deleted or modified

---

## 🎯 Performance Guide

| Scenario | Command | Time | Use Case |
|----------|---------|------|----------|
| Quick test | `2 1 1 1 1` | ~2s | Verify script works |
| Small test | `5 2 3 2 4` | ~5-10s | Basic testing |
| Medium test | `10 3 2 3 5` | ~10-20s | Comprehensive testing |
| Large test | `20 5 4 2 3` | ~20-40s | Load testing |
| Heavy load | `50 10 5 3 10` | ~60-120s | Stress testing |

---

## 🛠️ Troubleshooting

### Container not running
```bash
docker-compose up -d
docker-compose ps
```

### Connection refused
```bash
docker port nest_pg
# Should show: 5432/tcp -> 0.0.0.0:5431
```

### No template data
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT COUNT(*) FROM candidates WHERE full_name NOT LIKE 'Seed%';
"
```

### Verify created data
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 
    (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
    (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
    (SELECT COUNT(*) FROM job_applications ja 
     JOIN candidates c ON ja.candidate_id = c.id 
     WHERE c.full_name LIKE 'Seed Candidate%') as applications;
"
```

---

## 📝 Notes

- All test data is identified by the "Seed" prefix
- Relationships are maintained correctly (ownership matters)
- Interviews are distributed across 8 days for comprehensive testing
- Applications are randomly assigned to agencies/postings/positions
- The seeder is idempotent - run multiple times to create more candidates
- No existing data is modified or deleted
- All data can be easily cleaned up using the cleanup script

---

## ✨ Features

✅ Creates realistic test data with proper ownership relationships
✅ Clones existing templates for consistency
✅ Randomly assigns applications to agencies/postings/positions
✅ Schedules interviews with varied dates and times
✅ Maintains referential integrity
✅ Scalable - create any number of records
✅ Idempotent - run multiple times
✅ Non-destructive - no existing data is modified
✅ Easy to verify and clean up

---

## 🚀 Next Steps

1. **Setup**: `docker-compose up -d`
2. **Create Data**: `node seed-comprehensive-test-data.js 5 2 3 2 4`
3. **Verify**: Run verification queries above
4. **Test**: Use test URLs above
5. **Explore**: Check database relationships
6. **Clean**: Use cleanup script when done

---

**Last Updated:** December 22, 2025
**Version:** 1.0
**Status:** Ready for use
