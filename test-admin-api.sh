#!/bin/bash

# Admin Job API Test Script
# Tests the admin job endpoints to ensure they're working

echo "🧪 Testing Admin Job API Endpoints"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"
FAILED=0
PASSED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        PASSED=$((PASSED + 1))
        
        # Show first 200 chars of response
        if [ ${#body} -gt 200 ]; then
            echo "   Response: ${body:0:200}..."
        else
            echo "   Response: $body"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED=$((FAILED + 1))
        echo "   Response: $body"
    fi
    echo ""
}

# Test 1: Get all jobs
test_endpoint "GET /admin/jobs (all jobs)" \
    "$BASE_URL/admin/jobs"

# Test 2: Get jobs with pagination
test_endpoint "GET /admin/jobs (with pagination)" \
    "$BASE_URL/admin/jobs?page=1&limit=5"

# Test 3: Search for jobs
test_endpoint "GET /admin/jobs (search)" \
    "$BASE_URL/admin/jobs?search=cook"

# Test 4: Filter by country
test_endpoint "GET /admin/jobs (filter by country)" \
    "$BASE_URL/admin/jobs?country=UAE"

# Test 5: Sort by applications
test_endpoint "GET /admin/jobs (sort by applications)" \
    "$BASE_URL/admin/jobs?sort_by=applications&order=desc"

# Test 6: Sort by shortlisted
test_endpoint "GET /admin/jobs (sort by shortlisted)" \
    "$BASE_URL/admin/jobs?sort_by=shortlisted&order=desc"

# Test 7: Sort by interviews
test_endpoint "GET /admin/jobs (sort by interviews)" \
    "$BASE_URL/admin/jobs?sort_by=interviews&order=desc"

# Test 8: Get country distribution
test_endpoint "GET /admin/jobs/statistics/countries" \
    "$BASE_URL/admin/jobs/statistics/countries"

# Test 9: Combined filters
test_endpoint "GET /admin/jobs (combined filters)" \
    "$BASE_URL/admin/jobs?search=cook&country=UAE&sort_by=applications"

# Summary
echo "=================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
