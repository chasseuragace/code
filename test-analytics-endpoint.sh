#!/bin/bash

# Test the analytics endpoint
echo "Testing analytics endpoint..."
echo ""

BASE_URL="http://localhost:3000"

echo "GET ${BASE_URL}/analytics/landing-stats"
echo ""

curl -X GET "${BASE_URL}/analytics/landing-stats" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "✅ Test complete!"
echo ""
echo "Expected response format:"
echo "{"
echo "  \"registered_agencies\": <number>,"
echo "  \"active_job_openings\": <number>,"
echo "  \"cities_covered\": <number>,"
echo "  \"total_interviews\": <number>,"
echo "  \"new_jobs_this_week\": <number>,"
echo "  \"successful_placements\": 0,"
echo "  \"generated_at\": \"<ISO timestamp>\""
echo "}"
