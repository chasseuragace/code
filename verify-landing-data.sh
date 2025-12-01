#!/bin/bash

# Verification script for landing page data
# Tests that the seeded data is accessible via API

BASE_URL="http://localhost:3000"

echo "🔍 UdaanSarathi Landing Page Data Verification"
echo "=============================================="
echo ""

# Test 1: Search API
echo "📊 Test 1: Search API (Top 6 agencies)"
echo "GET /agencies/search?page=1&limit=6"
echo ""

SEARCH_RESPONSE=$(curl -s "${BASE_URL}/agencies/search?page=1&limit=6")
AGENCY_COUNT=$(echo $SEARCH_RESPONSE | jq '.data | length' 2>/dev/null || echo "0")

if [ "$AGENCY_COUNT" -ge "6" ]; then
  echo "✅ PASS: Found $AGENCY_COUNT agencies"
  echo ""
  echo "Sample agencies:"
  echo $SEARCH_RESPONSE | jq '.data[0:3] | .[] | {name, city, specializations, job_posting_count}' 2>/dev/null || echo "  (jq not installed - raw response)"
else
  echo "❌ FAIL: Expected at least 6 agencies, found $AGENCY_COUNT"
fi

echo ""
echo "---"
echo ""

# Test 2: Check job counts
echo "📈 Test 2: Job Posting Counts"
echo ""

TOTAL_JOBS=$(echo $SEARCH_RESPONSE | jq '[.data[].job_posting_count] | add' 2>/dev/null || echo "0")

if [ "$TOTAL_JOBS" -gt "0" ]; then
  echo "✅ PASS: Total jobs across agencies: $TOTAL_JOBS"
else
  echo "❌ FAIL: No jobs found"
fi

echo ""
echo "---"
echo ""

# Test 3: Pagination
echo "📄 Test 3: Pagination Metadata"
echo ""

TOTAL=$(echo $SEARCH_RESPONSE | jq '.meta.total' 2>/dev/null || echo "0")
PAGES=$(echo $SEARCH_RESPONSE | jq '.meta.totalPages' 2>/dev/null || echo "0")

if [ "$TOTAL" -ge "40" ]; then
  echo "✅ PASS: Total agencies: $TOTAL (expected 40)"
  echo "✅ PASS: Total pages: $PAGES"
else
  echo "❌ FAIL: Expected 40 agencies, found $TOTAL"
fi

echo ""
echo "---"
echo ""

# Test 4: Data quality
echo "🎯 Test 4: Data Quality Check"
echo ""

HAS_NAMES=$(echo $SEARCH_RESPONSE | jq '.data[0].name' 2>/dev/null)
HAS_CITY=$(echo $SEARCH_RESPONSE | jq '.data[0].city' 2>/dev/null)
HAS_SPEC=$(echo $SEARCH_RESPONSE | jq '.data[0].specializations' 2>/dev/null)

if [ ! -z "$HAS_NAMES" ] && [ "$HAS_NAMES" != "null" ]; then
  echo "✅ PASS: Agencies have names"
else
  echo "❌ FAIL: Missing agency names"
fi

if [ ! -z "$HAS_CITY" ] && [ "$HAS_CITY" != "null" ]; then
  echo "✅ PASS: Agencies have cities"
else
  echo "❌ FAIL: Missing city data"
fi

if [ ! -z "$HAS_SPEC" ] && [ "$HAS_SPEC" != "null" ]; then
  echo "✅ PASS: Agencies have specializations"
else
  echo "❌ FAIL: Missing specializations"
fi

echo ""
echo "=============================================="
echo "📊 Verification Complete"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Update UdaanSarathi2 landing page to use real API"
echo "2. Test frontend with: cd admin_panel/UdaanSarathi2 && npm run dev"
echo "3. Open http://localhost:5173 (or your frontend port)"
echo ""

