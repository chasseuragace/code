#!/bin/bash

# Workflow API Test Script
# Tests the workflow endpoints with real API calls

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

echo -e "${YELLOW}=== Workflow API Test Suite ===${NC}\n"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install jq to run this script.${NC}"
    exit 1
fi

# Function to make API call
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint")
    fi
    
    echo "$response" | jq '.'
    
    # Check if response has success field
    success=$(echo "$response" | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✓ Test passed${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Test failed${NC}\n"
        return 1
    fi
}

# Test counter
total_tests=0
passed_tests=0

# Test 1: Get workflow stages
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/stages" "" "Get workflow stages"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 2: Get workflow candidates (all stages)
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/candidates?page=1&limit=15" "" "Get all workflow candidates"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 3: Get workflow candidates (shortlisted only)
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/candidates?stage=shortlisted&page=1&limit=15" "" "Get shortlisted candidates"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 4: Get workflow candidates (with search)
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/candidates?search=John&page=1&limit=15" "" "Search candidates by name"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 5: Get workflow analytics
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/analytics" "" "Get workflow analytics"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 6: Get workflow analytics with date filter
total_tests=$((total_tests + 1))
if api_call "GET" "/workflow/analytics?date_from=2024-01-01&date_to=2024-12-31" "" "Get analytics with date filter"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 7: Update candidate stage (applied to shortlisted)
# Note: Replace CANDIDATE_ID and APPLICATION_ID with actual values
CANDIDATE_ID="${TEST_CANDIDATE_ID:-test-candidate-id}"
APPLICATION_ID="${TEST_APPLICATION_ID:-test-application-id}"

update_data='{
  "application_id": "'$APPLICATION_ID'",
  "new_stage": "shortlisted",
  "notes": "Candidate meets all requirements"
}'

total_tests=$((total_tests + 1))
if api_call "PUT" "/workflow/candidates/$CANDIDATE_ID/stage" "$update_data" "Update candidate to shortlisted"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 8: Update candidate stage with interview details
interview_data='{
  "application_id": "'$APPLICATION_ID'",
  "new_stage": "interview-scheduled",
  "notes": "Interview scheduled for next week",
  "interview_details": {
    "interview_date_ad": "2024-12-20",
    "interview_time": "10:00",
    "location": "Agency Office, Kathmandu",
    "duration_minutes": 60,
    "contact_person": "HR Manager",
    "type": "In-person"
  }
}'

total_tests=$((total_tests + 1))
if api_call "PUT" "/workflow/candidates/$CANDIDATE_ID/stage" "$interview_data" "Schedule interview"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 9: Invalid stage transition (should fail)
invalid_data='{
  "application_id": "'$APPLICATION_ID'",
  "new_stage": "interview-passed",
  "notes": "Trying to skip stages"
}'

total_tests=$((total_tests + 1))
echo -e "${YELLOW}Testing: Invalid stage transition (should fail)${NC}"
response=$(curl -s -X "PUT" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$invalid_data" \
    "$API_BASE_URL/workflow/candidates/$CANDIDATE_ID/stage")

echo "$response" | jq '.'

# This should fail, so we check for error
if echo "$response" | jq -e '.message' > /dev/null; then
    echo -e "${GREEN}✓ Test passed (correctly rejected invalid transition)${NC}\n"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}✗ Test failed (should have rejected invalid transition)${NC}\n"
fi

# Test 10: Missing interview details (should fail)
missing_interview_data='{
  "application_id": "'$APPLICATION_ID'",
  "new_stage": "interview-scheduled",
  "notes": "Missing interview details"
}'

total_tests=$((total_tests + 1))
echo -e "${YELLOW}Testing: Missing interview details (should fail)${NC}"
response=$(curl -s -X "PUT" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$missing_interview_data" \
    "$API_BASE_URL/workflow/candidates/$CANDIDATE_ID/stage")

echo "$response" | jq '.'

# This should fail, so we check for error
if echo "$response" | jq -e '.message' > /dev/null; then
    echo -e "${GREEN}✓ Test passed (correctly rejected missing interview details)${NC}\n"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}✗ Test failed (should have rejected missing interview details)${NC}\n"
fi

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "Total tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $((total_tests - passed_tests))${NC}"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed ✗${NC}"
    exit 1
fi
