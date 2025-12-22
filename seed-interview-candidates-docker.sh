#!/bin/bash

# Direct Database Seeder for Interview Test Candidates (Docker Version)
# Creates test candidates (001-00n) directly in the containerized database
# 
# Container: nest_pg (PostgreSQL 15)
# Database: app_db
# 
# Usage: ./seed-interview-candidates-docker.sh [count] [jobId]
# Example: ./seed-interview-candidates-docker.sh 10 381ed0d7-5883-4898-a9d6-531aec0c409b

set -e

# Parse arguments
COUNT=${1:-10}
JOB_ID=${2:-381ed0d7-5883-4898-a9d6-531aec0c409b}

# Database credentials (from docker-compose.yml)
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="app_db"
CONTAINER_NAME="nest_pg"

echo "🌱 Direct Database Seeder - Interview Test Candidates (Docker)"
echo "=========================================================="
echo ""
echo "📊 Configuration:"
echo "  Count: $COUNT"
echo "  Job ID: $JOB_ID"
echo "  Container: $CONTAINER_NAME"
echo "  Database: $DB_NAME"
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container '$CONTAINER_NAME' is not running"
    echo ""
    echo "💡 Start the container with:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "✅ Container '$CONTAINER_NAME' is running"
echo ""

# Function to execute SQL in container
execute_sql() {
    local sql="$1"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql"
}

# Function to execute SQL and get result
execute_sql_result() {
    local sql="$1"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "$sql"
}

# Verify job exists
echo "🔍 Verifying job exists..."
JOB_RESULT=$(execute_sql_result "SELECT posting_title FROM job_postings WHERE id = '$JOB_ID' LIMIT 1;")

if [ -z "$JOB_RESULT" ]; then
    echo "❌ Job $JOB_ID not found"
    exit 1
fi

JOB_TITLE=$(echo "$JOB_RESULT" | xargs)
echo "✅ Job found: $JOB_TITLE"
echo ""

# Get template candidate
echo "🔍 Finding template candidate..."
TEMPLATE=$(execute_sql_result "SELECT id, full_name, phone, gender, date_of_birth, address FROM candidates WHERE full_name NOT LIKE 'Test Candidate%' ORDER BY created_at DESC LIMIT 1;")

if [ -z "$TEMPLATE" ]; then
    echo "❌ No existing candidates found"
    exit 1
fi

TEMPLATE_ID=$(echo "$TEMPLATE" | awk '{print $1}')
TEMPLATE_NAME=$(echo "$TEMPLATE" | awk '{print $2, $3}')
TEMPLATE_PHONE=$(echo "$TEMPLATE" | awk '{print $4}')

echo "✅ Template candidate: $TEMPLATE_NAME ($TEMPLATE_PHONE)"
echo ""

# Get job position
echo "🔍 Finding job position..."
POSITION=$(execute_sql_result "SELECT jp.id, jp.title FROM job_contracts jc JOIN job_positions jp ON jp.job_contract_id = jc.id WHERE jc.job_posting_id = '$JOB_ID' LIMIT 1;")

if [ -z "$POSITION" ]; then
    echo "❌ No positions found for job"
    exit 1
fi

POSITION_ID=$(echo "$POSITION" | awk '{print $1}')
POSITION_TITLE=$(echo "$POSITION" | awk '{print $2}')

echo "✅ Position: $POSITION_TITLE"
echo ""

# Get template candidate details for cloning
TEMPLATE_DETAILS=$(execute_sql_result "SELECT gender, date_of_birth, address FROM candidates WHERE id = '$TEMPLATE_ID' LIMIT 1;")
TEMPLATE_GENDER=$(echo "$TEMPLATE_DETAILS" | awk '{print $1}')
TEMPLATE_DOB=$(echo "$TEMPLATE_DETAILS" | awk '{print $2}')
TEMPLATE_ADDRESS=$(echo "$TEMPLATE_DETAILS" | awk '{print $3}')

echo "Creating candidates..."
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

# Get today's date
TODAY=$(date +%Y-%m-%d)

for i in $(seq 1 $COUNT); do
    TEST_NUMBER=$(printf "%03d" $i)
    PHONE="98999$(printf "%05d" $i)"
    FULL_NAME="Test Candidate $TEST_NUMBER"
    
    # Calculate interview date (distribute across 0-7 days)
    DAYS_OFFSET=$((i % 8))
    INTERVIEW_DATE=$(date -d "+$DAYS_OFFSET days" +%Y-%m-%d 2>/dev/null || date -v+${DAYS_OFFSET}d +%Y-%m-%d)
    
    # Calculate interview time (9 AM to 4 PM, varying by 15 min intervals)
    HOUR=$((9 + (i % 8)))
    MINUTE=$(((i % 4) * 15))
    INTERVIEW_TIME=$(printf "%02d:%02d:00" $HOUR $MINUTE)
    
    printf "[$i/$COUNT] Creating test candidate $TEST_NUMBER... "
    
    # Create candidate
    CANDIDATE_ID=$(execute_sql_result "
        INSERT INTO candidates (id, full_name, phone, gender, date_of_birth, address, created_at, updated_at)
        VALUES (gen_random_uuid(), '$FULL_NAME', '$PHONE', '$TEMPLATE_GENDER', '$TEMPLATE_DOB', '$TEMPLATE_ADDRESS', NOW(), NOW())
        RETURNING id;
    " | tr -d ' ')
    
    if [ -z "$CANDIDATE_ID" ]; then
        echo "❌ Failed to create candidate"
        ((FAIL_COUNT++))
        continue
    fi
    
    # Create job application
    APPLICATION_ID=$(execute_sql_result "
        INSERT INTO job_applications (id, candidate_id, job_posting_id, position_id, status, history_blob, created_at, updated_at)
        VALUES (gen_random_uuid(), '$CANDIDATE_ID', '$JOB_ID', '$POSITION_ID', 'interview_scheduled', '[]', NOW(), NOW())
        RETURNING id;
    " | tr -d ' ')
    
    if [ -z "$APPLICATION_ID" ]; then
        echo "❌ Failed to create application"
        ((FAIL_COUNT++))
        continue
    fi
    
    # Schedule interview
    INTERVIEW_ID=$(execute_sql_result "
        INSERT INTO interview_details (id, job_posting_id, job_application_id, interview_date_ad, interview_time, duration_minutes, location, contact_person, status, type, created_at, updated_at)
        VALUES (gen_random_uuid(), '$JOB_ID', '$APPLICATION_ID', '$INTERVIEW_DATE', '$INTERVIEW_TIME', 60, 'Test Office', 'HR Manager', 'scheduled', 'In-person', NOW(), NOW())
        RETURNING id;
    " | tr -d ' ')
    
    if [ -z "$INTERVIEW_ID" ]; then
        echo "❌ Failed to schedule interview"
        ((FAIL_COUNT++))
        continue
    fi
    
    echo "✅ ($INTERVIEW_DATE $INTERVIEW_TIME)"
    ((SUCCESS_COUNT++))
done

echo ""
echo "=========================================================="
echo "📊 Seeding Summary"
echo "=========================================================="
echo "✅ Success: $SUCCESS_COUNT/$COUNT test candidates"
echo "❌ Failed: $FAIL_COUNT/$COUNT test candidates"
echo ""
echo "🎉 Seeding complete!"
echo ""
echo "📝 Test URLs:"
echo ""
echo "1. All interview_scheduled candidates:"
echo "   http://localhost:3000/agencies/12345067068/jobs/$JOB_ID/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc"
echo ""
echo "2. Today's interviews:"
echo "   http://localhost:3000/agencies/12345067068/jobs/$JOB_ID/candidates?stage=interview_scheduled&limit=100&interview_filter=today"
echo ""
echo "3. Tomorrow's interviews:"
echo "   http://localhost:3000/agencies/12345067068/jobs/$JOB_ID/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow"
echo ""
echo "4. Unattended interviews:"
echo "   http://localhost:3000/agencies/12345067068/jobs/$JOB_ID/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended"
echo ""
echo "5. This week's interviews:"
echo "   http://localhost:3000/agencies/12345067068/jobs/$JOB_ID/candidates?stage=interview_scheduled&limit=100&date_alias=this_week"
echo ""
echo "6. Agency interviews (today):"
echo "   http://localhost:3000/agencies/12345067068/interviews?interview_filter=today&limit=100"
echo ""
echo "7. Agency interviews (tomorrow):"
echo "   http://localhost:3000/agencies/12345067068/interviews?interview_filter=tomorrow&limit=100"
echo ""
echo "8. Agency interviews (unattended):"
echo "   http://localhost:3000/agencies/12345067068/interviews?interview_filter=unattended&limit=100"
echo ""
echo "9. Agency interviews (all):"
echo "   http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100"
echo ""
