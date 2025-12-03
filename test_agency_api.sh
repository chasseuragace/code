#!/bin/bash

# Agency Profile API Test - Matches Frontend Format
# This tests the exact format that the frontend sends

BASE_URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MTQ4ZGVjNC0xNWQ3LTRiYjctYTU4Yi1lMTg5YWEyZWYxNjEiLCJpYXQiOjE3NjQ2NDQ3OTMsImV4cCI6MTc2NDY0ODM5M30.VIZinoUlLJSOFSP9UfteoQvCMlpw10Mf3o3eN4OHEYA"

echo "========================================="
echo "Agency Profile API Test"
echo "Testing exact frontend format"
echo "========================================="
echo ""

# Helper function
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "-------------------------------------------"
    echo "TEST: $description"
    echo "URL: $BASE_URL$endpoint"
    if [ -n "$data" ]; then
        echo "Payload:"
        echo "$data" | jq '.' 2>/dev/null || echo "$data"
    fi
    echo ""
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN")
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    echo "Status: $http_status"
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    
    if [ "$http_status" != "200" ] && [ "$http_status" != "201" ]; then
        echo "❌ FAILED"
    else
        echo "✅ SUCCESS"
    fi
    echo ""
}

# 1. Get initial state
echo "========================================="
echo "1. GET CURRENT PROFILE"
echo "========================================="
call_api "GET" "/agencies/owner/agency" "" "Get current agency profile"

# 2. Update Basic Info
echo "========================================="
echo "2. UPDATE BASIC INFO"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/basic" '{
  "name": "Ram Recruitment Services",
  "description": "Leading recruitment agency in Kathmandu",
  "established_year": 2020
}' "Update basic information"

# 3. Update Contact (Frontend Format)
echo "========================================="
echo "3. UPDATE CONTACT (Frontend Format)"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/contact" '{
  "phone": "+9779810000111",
  "mobile": "+9779810000222",
  "email": "contact@ramrecruitment.com",
  "website": "https://www.ramrecruitment.com"
}' "Update contact - frontend sends phone, mobile, email"

# Verify contact saved as arrays
echo "Verifying contact saved correctly..."
response=$(curl -s -X GET "$BASE_URL/agencies/owner/agency" \
    -H "Authorization: Bearer $TOKEN")
phones=$(echo "$response" | jq -r '.phones')
emails=$(echo "$response" | jq -r '.emails')
echo "Phones in DB: $phones"
echo "Emails in DB: $emails"
if [[ "$phones" == *"9779810000111"* ]] && [[ "$phones" == *"9779810000222"* ]]; then
    echo "✅ Phones saved correctly as array"
else
    echo "❌ Phones NOT saved correctly"
fi
if [[ "$emails" == *"contact@ramrecruitment.com"* ]]; then
    echo "✅ Email saved correctly as array"
else
    echo "❌ Email NOT saved correctly"
fi
echo ""

# 4. Update Location
echo "========================================="
echo "4. UPDATE LOCATION"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/location" '{
  "address": "Thamel, Kathmandu, Nepal",
  "latitude": 27.7172,
  "longitude": 85.3240
}' "Update location"

# 5. Update Social Media (Frontend Format)
echo "========================================="
echo "5. UPDATE SOCIAL MEDIA (Frontend Format)"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/social-media" '{
  "social_media": {
    "facebook": "https://facebook.com/ramrecruitment",
    "instagram": "https://instagram.com/ramrecruitment",
    "linkedin": "https://linkedin.com/company/ramrecruitment",
    "twitter": "https://twitter.com/ramrecruitment"
  }
}' "Update social media - frontend sends nested object"

# Verify social media NOT nested
echo "Verifying social media saved correctly..."
response=$(curl -s -X GET "$BASE_URL/agencies/owner/agency" \
    -H "Authorization: Bearer $TOKEN")
social=$(echo "$response" | jq -r '.social_media')
echo "Social Media in DB: $social"
# Check if it's nested (bad)
if echo "$social" | jq -e '.social_media' > /dev/null 2>&1; then
    echo "❌ Social media is NESTED (bug still exists)"
else
    echo "✅ Social media is FLAT (correct)"
fi
echo ""

# 6. Update Services
echo "========================================="
echo "6. UPDATE SERVICES"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/services" '{
  "services": ["Recruitment", "Visa Processing", "Training"],
  "specializations": ["Construction", "Hospitality", "Healthcare"],
  "target_countries": ["Saudi Arabia", "UAE", "Qatar"]
}' "Update services, specializations, target countries"

# 7. Update Settings (Frontend Format)
echo "========================================="
echo "7. UPDATE SETTINGS (Frontend Format)"
echo "========================================="
call_api "PATCH" "/agencies/owner/agency/settings" '{
  "settings": {
    "currency": "NPR",
    "timezone": "Asia/Kathmandu",
    "language": "en",
    "date_format": "YYYY-MM-DD",
    "notifications": {
      "email": true,
      "push": true
    },
    "features": {
      "darkMode": true
    }
  }
}' "Update settings - frontend sends nested object"

# Verify settings NOT nested
echo "Verifying settings saved correctly..."
response=$(curl -s -X GET "$BASE_URL/agencies/owner/agency" \
    -H "Authorization: Bearer $TOKEN")
settings=$(echo "$response" | jq -r '.settings')
echo "Settings in DB: $settings"
# Check if it's nested (bad)
if echo "$settings" | jq -e '.settings' > /dev/null 2>&1; then
    echo "❌ Settings are NESTED (bug still exists)"
else
    echo "✅ Settings are FLAT (correct)"
fi
echo ""

# 8. Final verification
echo "========================================="
echo "8. FINAL VERIFICATION"
echo "========================================="
response=$(curl -s -X GET "$BASE_URL/agencies/owner/agency" \
    -H "Authorization: Bearer $TOKEN")

echo "Final Profile Structure:"
echo "$response" | jq '{
  name: .name,
  phones: .phones,
  emails: .emails,
  website: .website,
  address: .address,
  social_media: .social_media,
  services: .services,
  specializations: .specializations,
  target_countries: .target_countries,
  settings: .settings
}' 2>/dev/null || echo "$response"

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo ""
echo "✅ All endpoints should return 200"
echo "✅ Contact: phone+mobile → phones[], email → emails[]"
echo "✅ Social Media: NOT nested, flat object"
echo "✅ Settings: NOT nested, flat object"
echo "✅ All updates REPLACE data (no merging)"
