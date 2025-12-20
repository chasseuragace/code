# Quick Test Guide - Application Reapplication Logic

## Running the Tests

### Prerequisites
- Docker containers running (nest_server and nest_pg)
- API accessible at http://localhost:3000
- Existing job postings in database

### Run the Test Suite
```bash
bash test-reapplication-simple.sh
```

### Expected Output
```
═══════════════════════════════════════════════════════════
🧪 APPLICATION REAPPLICATION WORKFLOW TEST
═══════════════════════════════════════════════════════════

✅ Test 1: Candidate Registration & Login
✅ Test 2: Admin Login
✅ Test 3: Get Job & Position
✅ Test 4: Apply for Job (First Application)
✅ Test 5: Attempt Duplicate Application (Should Fail)
✅ Test 6: Withdraw Application
✅ Test 7: Reapply After Withdrawal (Should Succeed)
✅ Test 8: Admin Shortlist
✅ Test 9: Attempt Reapply While Shortlisted (Should Fail)
✅ Test 10: Admin Schedule Interview
✅ Test 11: Attempt Reapply While Interview Scheduled (Should Fail)
✅ Test 12: Admin Mark Interview Passed
✅ Test 13: Attempt Reapply After Interview Passed (Should Fail)
✅ Test 14: Final Withdraw & Reapply

═══════════════════════════════════════════════════════════
✨ ALL 14 TESTS PASSED! ✨
═══════════════════════════════════════════════════════════
```

## Manual Testing with curl

### 1. Register Candidate
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "phone": "98765432100"
  }'
```

Response:
```json
{
  "dev_otp": "123456"
}
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "98765432100",
    "otp": "123456"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "candidate_id": "uuid",
  "candidate": {...}
}
```

### 3. Apply for Job
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidate_id": "candidate-uuid",
    "job_posting_id": "job-uuid",
    "position_id": "position-uuid",
    "note": "Applying for this position"
  }'
```

Response (Success):
```json
{
  "id": "application-uuid",
  "status": "applied"
}
```

### 4. Try Duplicate Application (Should Fail)
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidate_id": "candidate-uuid",
    "job_posting_id": "job-uuid",
    "position_id": "position-uuid",
    "note": "Duplicate attempt"
  }'
```

Response (Error):
```json
{
  "statusCode": 400,
  "message": "Candidate has already applied to this position",
  "error": "Bad Request"
}
```

### 5. Withdraw Application
```bash
curl -X POST http://localhost:3000/applications/application-uuid/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "note": "Withdrawing my application"
  }'
```

Response:
```json
{
  "id": "application-uuid",
  "status": "withdrawn"
}
```

### 6. Reapply After Withdrawal (Should Succeed)
```bash
curl -X POST http://localhost:3000/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidate_id": "candidate-uuid",
    "job_posting_id": "job-uuid",
    "position_id": "position-uuid",
    "note": "Reapplying after withdrawal"
  }'
```

Response (Success):
```json
{
  "id": "new-application-uuid",
  "status": "applied"
}
```

## Database Queries for Verification

### Check All Applications for a Candidate
```sql
SELECT id, status, created_at 
FROM job_applications 
WHERE candidate_id = 'candidate-uuid'
ORDER BY created_at DESC;
```

### Check Applications for a Job
```sql
SELECT id, candidate_id, status, created_at 
FROM job_applications 
WHERE job_posting_id = 'job-uuid'
ORDER BY created_at DESC;
```

### Check Latest Application for Candidate/Job/Position
```sql
SELECT id, status, created_at 
FROM job_applications 
WHERE candidate_id = 'candidate-uuid' 
  AND job_posting_id = 'job-uuid'
  AND position_id = 'position-uuid'
ORDER BY created_at DESC
LIMIT 1;
```

## Troubleshooting

### Test Fails at Step 4 (First Application)
**Issue**: "Position not found"
- Verify position_id exists in database
- Check that position belongs to the job posting

### Test Fails at Step 5 (Duplicate Check)
**Issue**: Duplicate not blocked
- Restart server: `docker restart nest_server`
- Wait 5 seconds for server to reload
- Run test again

### Test Fails at Step 7 (Reapply After Withdrawal)
**Issue**: "Candidate has already applied to this position"
- Check database for withdrawn application
- Verify latest application has status "withdrawn"
- Check server logs for debug messages

### API Returns 500 Error
**Issue**: Internal server error
- Check server logs: `docker logs nest_server`
- Verify all required fields in request body
- Ensure tokens are valid and not expired

## Performance Testing

### Load Test (Optional)
```bash
# Run test 10 times
for i in {1..10}; do
  echo "Run $i"
  bash test-reapplication-simple.sh > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ Pass"
  else
    echo "❌ Fail"
  fi
done
```

## Key Test Data

### Default Test Values
- **Candidate Phone**: 98765432{random}
- **Candidate Name**: Test Reapply User
- **Admin Phone**: +9779862146252
- **Job ID**: 3997ff66-6eea-462f-8587-98a48aaae70d
- **Position ID**: 5e73bc5e-5da6-43fd-9b8a-67cc4a06f232

### Modifying Test Data
Edit `test-reapplication-simple.sh`:
```bash
# Line 20-21
CANDIDATE_PHONE="98765432$(date +%s | tail -c 4)"
CANDIDATE_NAME="Test Reapply User"

# Line 22
ADMIN_PHONE="+9779862146252"

# Line 27-28
JOB_ID="3997ff66-6eea-462f-8587-98a48aaae70d"
POSITION_ID="5e73bc5e-5da6-43fd-9b8a-67cc4a06f232"
```

## Success Criteria

All tests should pass with:
- ✅ 14/14 tests passing
- ✅ All duplicate checks working
- ✅ All reapplication scenarios working
- ✅ All error messages correct
- ✅ All status transitions correct

## Next Steps

1. ✅ Run the test suite
2. ✅ Verify all 14 tests pass
3. ✅ Check database for application records
4. ✅ Review server logs for any warnings
5. ✅ Deploy to production

## Support

For issues or questions:
1. Check the test output for specific error messages
2. Review server logs: `docker logs nest_server`
3. Check database records for data integrity
4. Verify API endpoints are accessible
5. Ensure all required fields are provided in requests
