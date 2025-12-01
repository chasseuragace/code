#!/bin/bash

# Test the new dashboard analytics endpoint
# Make sure you have a valid JWT token for an agency owner

echo "Testing Dashboard Analytics Endpoint"
echo "====================================="
echo ""

# Replace with your actual JWT token
TOKEN="your-jwt-token-here"

# Test 1: Get analytics without filters
echo "Test 1: Get analytics without filters"
curl -X GET "http://localhost:3000/agencies/owner/dashboard/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""

# Test 2: Get analytics with date range (last 7 days)
echo "Test 2: Get analytics with date range (last 7 days)"
START_DATE=$(date -u -v-7d +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || date -u -d "7 days ago" +"%Y-%m-%dT00:00:00.000Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

curl -X GET "http://localhost:3000/agencies/owner/dashboard/analytics?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""

# Test 3: Get analytics filtered by country
echo "Test 3: Get analytics filtered by country (Saudi Arabia)"
curl -X GET "http://localhost:3000/agencies/owner/dashboard/analytics?country=Saudi%20Arabia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "====================================="
echo "Tests completed!"
