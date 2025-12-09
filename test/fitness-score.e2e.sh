#!/bin/bash

# Fitness Score E2E Test Script
# Tests the unified FitnessScoreService across all endpoints
# Uses realistic candidate and job data similar to Ramesh happy path test
#
# Prerequisites:
#   - Backend running on http://localhost:3000
#   - Database seeded with candidates and jobs
#   - Admin token available
#
# Usage:
#   ./test/fitness-score.e2e.sh
#   ./test/fitness-score.e2e.sh <admin_token>

set -e

BASE_URL="http://localhost:3000"
ADMIN_TOKEN="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fitness Score E2E Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Helper function to make requests
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4

  if [ -z "$token" ]; then
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  fi
}

# Helper to extract ID from response
extract_id() {
  echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# Helper to extract fitness_score from response
extract_fitness_score() {
  echo "$1" | grep -o '"fitness_score":[0-9]*' | cut -d':' -f2
}

# Helper to extract matchPercentage from response
extract_match_percentage() {
  echo "$1" | grep -o '"matchPercentage":"[^"]*"' | cut -d'"' -f4
}

echo -e "${YELLOW}Step 1: Seed test data${NC}"
echo "Creating test candidate with Ramesh-like profile..."

# Create candidate
CANDIDATE_RESPONSE=$(make_request POST "/candidates" '{
  "full_name": "Ramesh Sharma",
  "phone": "+977-982-1234567",
  "email": "ramesh@example.com",
  "gender": "male",
  "age": 35,
  "address": {
    "country": "Nepal",
    "city": "Kathmandu"
  }
}')

CANDIDATE_ID=$(extract_id "$CANDIDATE_RESPONSE")
echo -e "${GREEN}✅ Candidate created: $CANDIDATE_ID${NC}"

# Add job profile with skills, education, experience
echo "Adding job profile with skills, education, and experience..."

JOB_PROFILE_RESPONSE=$(make_request POST "/candidates/$CANDIDATE_ID/job-profiles" '{
  "label": "Default",
  "profile_blob": {
    "skills": [
      {
        "title": "Electrical Wiring",
        "years": 5,
        "duration_months": 0
      },
      {
        "title": "Industrial Maintenance",
        "years": 3,
        "duration_months": 0
      },
      {
        "title": "Circuit Installation",
        "years": 4,
        "duration_months": 0
      },
      {
        "title": "Nepali (Language)",
        "years": 0,
        "duration_months": 0
      },
      {
        "title": "Hindi (Language)",
        "years": 0,
        "duration_months": 0
      },
      {
        "title": "English (Language)",
        "years": 0,
        "duration_months": 0
      }
    ],
    "education": [
      {
        "degree": "Diploma in Electrical Engineering",
        "institute": "Nepal Technical Institute"
      }
    ],
    "experience": [
      {
        "title": "Electrical Technician",
        "employer": "Local Construction Company",
        "months": 60,
        "description": "Electrical wiring and maintenance work"
      }
    ]
  }
}')

echo -e "${GREEN}✅ Job profile created${NC}"

# Create test jobs with different requirement combinations
echo ""
echo -e "${YELLOW}Step 2: Create test jobs with varying requirements${NC}"

# Job A: Rich requirements (skills + education + experience)
JOB_A_RESPONSE=$(make_request POST "/agencies/LIC-TEST-001/job-postings" '{
  "posting_title": "Senior Electrician - Full Requirements",
  "country": "UAE",
  "employer": {
    "company_name": "Elite Construction",
    "country": "UAE",
    "city": "Dubai"
  },
  "contract": {
    "period_years": 2,
    "hours_per_day": 8,
    "days_per_week": 6
  },
  "positions": [
    {
      "title": "Senior Electrician",
      "vacancies": {"male": 2, "female": 0},
      "salary": {
        "monthly_amount": 2500,
        "currency": "AED",
        "converted": []
      }
    }
  ],
  "skills": ["Electrical Wiring", "Industrial Maintenance", "Safety Protocols"],
  "education_requirements": ["Diploma in Electrical Engineering"],
  "experience_requirements": {
    "min_years": 2,
    "max_years": 10
  }
}')

JOB_A_ID=$(extract_id "$JOB_A_RESPONSE")
echo -e "${GREEN}✅ Job A created (rich requirements): $JOB_A_ID${NC}"

# Job B: Skills-only with partial overlap
JOB_B_RESPONSE=$(make_request POST "/agencies/LIC-TEST-001/job-postings" '{
  "posting_title": "Electrician - Skills Focus",
  "country": "UAE",
  "employer": {
    "company_name": "Tech Solutions",
    "country": "UAE",
    "city": "Abu Dhabi"
  },
  "contract": {
    "period_years": 2,
    "hours_per_day": 8,
    "days_per_week": 6
  },
  "positions": [
    {
      "title": "Electrician",
      "vacancies": {"male": 1, "female": 0},
      "salary": {
        "monthly_amount": 2000,
        "currency": "AED",
        "converted": []
      }
    }
  ],
  "skills": ["Electrical Wiring", "Industrial Maintenance", "Circuit Installation", "Cable Management"]
}')

JOB_B_ID=$(extract_id "$JOB_B_RESPONSE")
echo -e "${GREEN}✅ Job B created (skills-only, partial overlap): $JOB_B_ID${NC}"

# Job C: Skills-only with full overlap
JOB_C_RESPONSE=$(make_request POST "/agencies/LIC-TEST-001/job-postings" '{
  "posting_title": "Electrician - Perfect Match",
  "country": "UAE",
  "employer": {
    "company_name": "Perfect Match Co",
    "country": "UAE",
    "city": "Sharjah"
  },
  "contract": {
    "period_years": 2,
    "hours_per_day": 8,
    "days_per_week": 6
  },
  "positions": [
    {
      "title": "Electrician",
      "vacancies": {"male": 1, "female": 0},
      "salary": {
        "monthly_amount": 1800,
        "currency": "AED",
        "converted": []
      }
    }
  ],
  "skills": ["Electrical Wiring", "Industrial Maintenance"]
}')

JOB_C_ID=$(extract_id "$JOB_C_RESPONSE")
echo -e "${GREEN}✅ Job C created (skills-only, full overlap): $JOB_C_ID${NC}"

# Job D: Education-only with full overlap
JOB_D_RESPONSE=$(make_request POST "/agencies/LIC-TEST-001/job-postings" '{
  "posting_title": "Technician - Education Focus",
  "country": "UAE",
  "employer": {
    "company_name": "Education First",
    "country": "UAE",
    "city": "Ajman"
  },
  "contract": {
    "period_years": 2,
    "hours_per_day": 8,
    "days_per_week": 6
  },
  "positions": [
    {
      "title": "Technician",
      "vacancies": {"male": 1, "female": 0},
      "salary": {
        "monthly_amount": 1500,
        "currency": "AED",
        "converted": []
      }
    }
  ],
  "education_requirements": ["Diploma in Electrical Engineering"]
}')

JOB_D_ID=$(extract_id "$JOB_D_RESPONSE")
echo -e "${GREEN}✅ Job D created (education-only, full overlap): $JOB_D_ID${NC}"

echo ""
echo -e "${YELLOW}Step 3: Test fitness score calculations${NC}"

# Test 3.1: Mobile job endpoint (matchPercentage)
echo ""
echo -e "${BLUE}Test 3.1: Mobile job endpoint - GET /candidates/:id/jobs/:jobId/mobile${NC}"

MOBILE_A=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_A_ID/mobile" "")
MATCH_A=$(extract_match_percentage "$MOBILE_A")
echo "Job A (rich requirements) matchPercentage: $MATCH_A"
echo "Expected: ~89 (2/3 skills + 1/1 education + 1 experience = avg 88.67 ≈ 89)"

MOBILE_B=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_B_ID/mobile" "")
MATCH_B=$(extract_match_percentage "$MOBILE_B")
echo "Job B (partial skills) matchPercentage: $MATCH_B"
echo "Expected: 50 (2/4 skills = 50%)"

MOBILE_C=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_C_ID/mobile" "")
MATCH_C=$(extract_match_percentage "$MOBILE_C")
echo "Job C (full skills match) matchPercentage: $MATCH_C"
echo "Expected: 100 (2/2 skills = 100%)"

MOBILE_D=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_D_ID/mobile" "")
MATCH_D=$(extract_match_percentage "$MOBILE_D")
echo "Job D (full education match) matchPercentage: $MATCH_D"
echo "Expected: 100 (1/1 education = 100%)"

# Test 3.2: Job details endpoint (fitness_score)
echo ""
echo -e "${BLUE}Test 3.2: Job details endpoint - GET /candidates/:id/jobs/:jobId${NC}"

DETAILS_A=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_A_ID" "")
FITNESS_A=$(extract_fitness_score "$DETAILS_A")
echo "Job A fitness_score: $FITNESS_A"
echo "Expected: 89"

DETAILS_B=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_B_ID" "")
FITNESS_B=$(extract_fitness_score "$DETAILS_B")
echo "Job B fitness_score: $FITNESS_B"
echo "Expected: 50"

DETAILS_C=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_C_ID" "")
FITNESS_C=$(extract_fitness_score "$DETAILS_C")
echo "Job C fitness_score: $FITNESS_C"
echo "Expected: 100"

DETAILS_D=$(make_request GET "/candidates/$CANDIDATE_ID/jobs/$JOB_D_ID" "")
FITNESS_D=$(extract_fitness_score "$DETAILS_D")
echo "Job D fitness_score: $FITNESS_D"
echo "Expected: 100"

# Test 3.3: Relevant jobs endpoint (sorted by fitness_score)
echo ""
echo -e "${BLUE}Test 3.3: Relevant jobs endpoint - GET /candidates/:id/relevant-jobs${NC}"

RELEVANT=$(make_request GET "/candidates/$CANDIDATE_ID/relevant-jobs?includeScore=true" "")
echo "Response (first 500 chars):"
echo "$RELEVANT" | head -c 500
echo ""

# Test 3.4: Relevant jobs grouped endpoint
echo ""
echo -e "${BLUE}Test 3.4: Relevant jobs grouped - GET /candidates/:id/relevant-jobs/grouped${NC}"

GROUPED=$(make_request GET "/candidates/$CANDIDATE_ID/relevant-jobs/grouped" "")
echo "Response (first 500 chars):"
echo "$GROUPED" | head -c 500
echo ""

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ E2E Test Suite Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary of fitness scores:"
echo "  Job A (rich requirements): $MATCH_A (expected: 89)"
echo "  Job B (partial skills): $MATCH_B (expected: 50)"
echo "  Job C (full skills): $MATCH_C (expected: 100)"
echo "  Job D (full education): $MATCH_D (expected: 100)"
echo ""
echo "All scores should be consistent across endpoints (mobile, details, relevant-jobs)"
echo ""
