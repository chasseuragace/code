#!/bin/bash

# Test the upgraded dashboard analytics endpoint
# This script tests all new features added in the API upgrade

set -e

BASE_URL="http://localhost:3000"
ENDPOINT="/agencies/owner/dashboard/analytics"

echo "=========================================="
echo "Dashboard API Upgrade Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install jq to run this test.${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Step 1: Get or create a test token
echo "Step 1: Getting authentication token..."
echo "----------------------------------------"

# Try to login with test credentials
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+977-9841234567",
    "password": "test123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${YELLOW}Warning: Could not login with test credentials${NC}"
    echo "Please provide a valid JWT token for an agency owner:"
    read -p "JWT Token: " TOKEN
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}Error: No token provided. Exiting.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Token obtained${NC}"
echo ""

# Step 2: Test basic endpoint (no filters)
echo "Test 1: Basic Analytics (No Filters)"
echo "----------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Endpoint accessible"
    
    # Check for new fields in response
    HAS_OPEN_IN_TIMEFRAME=$(echo "$BODY" | jq -e '.jobs.openInTimeframe' > /dev/null 2>&1 && echo "yes" || echo "no")
    HAS_CREATED_IN_TIMEFRAME=$(echo "$BODY" | jq -e '.jobs.createdInTimeframe' > /dev/null 2>&1 && echo "yes" || echo "no")
    HAS_DRAFT_IN_TIMEFRAME=$(echo "$BODY" | jq -e '.jobs.draftInTimeframe' > /dev/null 2>&1 && echo "yes" || echo "no")
    HAS_BY_STATUS_IN_TIMEFRAME=$(echo "$BODY" | jq -e '.applications.byStatusInTimeframe' > /dev/null 2>&1 && echo "yes" || echo "no")
    HAS_PASS_RATE=$(echo "$BODY" | jq -e '.interviews.passRate' > /dev/null 2>&1 && echo "yes" || echo "no")
    HAS_TODAY_STATUS=$(echo "$BODY" | jq -e '.interviews.todayStatus' > /dev/null 2>&1 && echo "yes" || echo "no")
    
    [ "$HAS_OPEN_IN_TIMEFRAME" == "yes" ] && print_result 0 "jobs.openInTimeframe field exists" || print_result 1 "jobs.openInTimeframe field missing"
    [ "$HAS_CREATED_IN_TIMEFRAME" == "yes" ] && print_result 0 "jobs.createdInTimeframe field exists" || print_result 1 "jobs.createdInTimeframe field missing"
    [ "$HAS_DRAFT_IN_TIMEFRAME" == "yes" ] && print_result 0 "jobs.draftInTimeframe field exists" || print_result 1 "jobs.draftInTimeframe field missing"
    [ "$HAS_BY_STATUS_IN_TIMEFRAME" == "yes" ] && print_result 0 "applications.byStatusInTimeframe field exists" || print_result 1 "applications.byStatusInTimeframe field missing"
    [ "$HAS_PASS_RATE" == "yes" ] && print_result 0 "interviews.passRate field exists" || print_result 1 "interviews.passRate field missing"
    [ "$HAS_TODAY_STATUS" == "yes" ] && print_result 0 "interviews.todayStatus field exists" || print_result 1 "interviews.todayStatus field missing"
    
    echo ""
    echo "Response Summary:"
    echo "$BODY" | jq '{
      jobs: {
        total: .jobs.total,
        openInTimeframe: .jobs.openInTimeframe,
        createdInTimeframe: .jobs.createdInTimeframe,
        draftInTimeframe: .jobs.draftInTimeframe
      },
      applications: {
        total: .applications.total,
        byStatusInTimeframe: .applications.byStatusInTimeframe
      },
      interviews: {
        total: .interviews.total,
        passRate: .interviews.passRate,
        todayStatus: .interviews.todayStatus
      }
    }'
else
    print_result 1 "Endpoint returned HTTP $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo ""

# Step 3: Test with date range (This Week)
echo "Test 2: Analytics with Date Range (This Week)"
echo "----------------------------------------"

# Calculate this week's date range
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    START_DATE=$(date -u -v-7d +"%Y-%m-%dT00:00:00.000Z")
else
    # Linux
    START_DATE=$(date -u -d "7 days ago" +"%Y-%m-%dT00:00:00.000Z")
fi
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

echo "Date Range: $START_DATE to $END_DATE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$ENDPOINT?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Date range filter works"
    
    # Check if time-scoped metrics are different from total
    TOTAL_JOBS=$(echo "$BODY" | jq -r '.jobs.total')
    CREATED_IN_TIMEFRAME=$(echo "$BODY" | jq -r '.jobs.createdInTimeframe')
    
    echo "Total Jobs (all time): $TOTAL_JOBS"
    echo "Jobs Created in Timeframe: $CREATED_IN_TIMEFRAME"
    
    if [ "$CREATED_IN_TIMEFRAME" != "null" ]; then
        print_result 0 "Time-scoped metrics calculated"
    else
        print_result 1 "Time-scoped metrics not calculated"
    fi
    
    echo ""
    echo "Time-Scoped Metrics:"
    echo "$BODY" | jq '{
      jobs: {
        total: .jobs.total,
        openInTimeframe: .jobs.openInTimeframe,
        createdInTimeframe: .jobs.createdInTimeframe
      },
      applications: {
        byStatusInTimeframe: .applications.byStatusInTimeframe
      },
      interviews: {
        recentInRange: .interviews.recentInRange
      }
    }'
else
    print_result 1 "Date range filter returned HTTP $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo ""

# Step 4: Test with country filter
echo "Test 3: Analytics with Country Filter"
echo "----------------------------------------"

# Get available countries first
COUNTRIES=$(echo "$BODY" | jq -r '.availableCountries[0] // empty')

if [ ! -z "$COUNTRIES" ]; then
    echo "Testing with country: $COUNTRIES"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$ENDPOINT?country=$(echo $COUNTRIES | sed 's/ /%20/g')" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" == "200" ]; then
        print_result 0 "Country filter works"
        
        echo ""
        echo "Filtered Results:"
        echo "$BODY" | jq '{
          jobs: .jobs,
          availableCountries: .availableCountries
        }'
    else
        print_result 1 "Country filter returned HTTP $HTTP_CODE"
    fi
else
    echo -e "${YELLOW}⊘ SKIP: No countries available to test${NC}"
fi

echo ""
echo ""

# Step 5: Test backward compatibility
echo "Test 4: Backward Compatibility Check"
echo "----------------------------------------"

RESPONSE=$(curl -s -X GET "$BASE_URL$ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Check that all old fields still exist
HAS_TOTAL=$(echo "$RESPONSE" | jq -e '.jobs.total' > /dev/null 2>&1 && echo "yes" || echo "no")
HAS_ACTIVE=$(echo "$RESPONSE" | jq -e '.jobs.active' > /dev/null 2>&1 && echo "yes" || echo "no")
HAS_BY_STATUS=$(echo "$RESPONSE" | jq -e '.applications.byStatus' > /dev/null 2>&1 && echo "yes" || echo "no")
HAS_COMPLETED=$(echo "$RESPONSE" | jq -e '.interviews.completed' > /dev/null 2>&1 && echo "yes" || echo "no")

[ "$HAS_TOTAL" == "yes" ] && print_result 0 "Old field jobs.total exists" || print_result 1 "Old field jobs.total missing"
[ "$HAS_ACTIVE" == "yes" ] && print_result 0 "Old field jobs.active exists" || print_result 1 "Old field jobs.active missing"
[ "$HAS_BY_STATUS" == "yes" ] && print_result 0 "Old field applications.byStatus exists" || print_result 1 "Old field applications.byStatus missing"
[ "$HAS_COMPLETED" == "yes" ] && print_result 0 "Old field interviews.completed exists" || print_result 1 "Old field interviews.completed missing"

echo ""
echo ""

# Step 6: Test pass rate calculation
echo "Test 5: Pass Rate Calculation"
echo "----------------------------------------"

PASS_RATE=$(echo "$RESPONSE" | jq -r '.interviews.passRate')
PASSED=$(echo "$RESPONSE" | jq -r '.interviews.passed')
COMPLETED=$(echo "$RESPONSE" | jq -r '.interviews.completed')

echo "Passed: $PASSED"
echo "Completed: $COMPLETED"
echo "Pass Rate: $PASS_RATE%"

if [ "$COMPLETED" != "0" ] && [ "$COMPLETED" != "null" ]; then
    EXPECTED_RATE=$(echo "scale=1; ($PASSED / $COMPLETED) * 100" | bc)
    echo "Expected Rate: $EXPECTED_RATE%"
    
    # Allow for rounding differences
    DIFF=$(echo "$PASS_RATE - $EXPECTED_RATE" | bc | tr -d '-')
    if (( $(echo "$DIFF < 1" | bc -l) )); then
        print_result 0 "Pass rate calculation is correct"
    else
        print_result 1 "Pass rate calculation mismatch"
    fi
else
    echo -e "${YELLOW}⊘ SKIP: No completed interviews to test${NC}"
fi

echo ""
echo ""

# Step 7: Test today's status
echo "Test 6: Today's Interview Status"
echo "----------------------------------------"

TODAY_PASS=$(echo "$RESPONSE" | jq -r '.interviews.todayStatus.pass')
TODAY_FAIL=$(echo "$RESPONSE" | jq -r '.interviews.todayStatus.fail')

echo "Today's Pass: $TODAY_PASS"
echo "Today's Fail: $TODAY_FAIL"

if [ "$TODAY_PASS" != "null" ] && [ "$TODAY_FAIL" != "null" ]; then
    print_result 0 "Today's status is calculated"
else
    print_result 1 "Today's status is missing"
fi

echo ""
echo ""

# Final Summary
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Full Response Structure:"
echo "$RESPONSE" | jq '.'

echo ""
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Next Steps:"
echo "1. Verify all new fields are present in the response"
echo "2. Check that time-scoped metrics change with date filters"
echo "3. Confirm pass rate calculation is accurate"
echo "4. Test with real data in different scenarios"
