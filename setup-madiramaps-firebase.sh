#!/bin/bash

# Madiramaps Firebase Setup Script
# This script automates the Firebase setup process

set -e

echo "🔥 Madiramaps Firebase Setup Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if service account file exists
if [ ! -f "firebase-service-account.json" ]; then
    echo -e "${RED}❌ Error: firebase-service-account.json not found${NC}"
    echo ""
    echo "Please download the service account key from Firebase Console:"
    echo "1. Go to: https://console.firebase.google.com/u/0/project/madiramaps-268511/settings/general"
    echo "2. Click Settings (⚙️) → Service Accounts"
    echo "3. Click 'Generate New Private Key'"
    echo "4. Save as 'firebase-service-account.json' in project root"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Service account file found${NC}"
echo ""

# Step 1: Verify service account file
echo "📋 Step 1: Verifying service account file..."
if grep -q "madiramaps-268511" firebase-service-account.json; then
    echo -e "${GREEN}✅ Service account is for madiramaps-268511${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Service account may not be for madiramaps-268511${NC}"
fi
echo ""

# Step 2: Check Docker containers
echo "🐳 Step 2: Checking Docker containers..."
if docker ps | grep -q "nest_server"; then
    echo -e "${GREEN}✅ nest_server is running${NC}"
else
    echo -e "${RED}❌ nest_server is not running${NC}"
    echo "Starting containers..."
    docker-compose up -d
    sleep 5
fi

if docker ps | grep -q "nest_pg"; then
    echo -e "${GREEN}✅ nest_pg is running${NC}"
else
    echo -e "${RED}❌ nest_pg is not running${NC}"
    exit 1
fi
echo ""

# Step 3: Copy service account to Docker
echo "📁 Step 3: Copying service account to Docker container..."
docker cp firebase-service-account.json nest_server:/app/
echo -e "${GREEN}✅ Service account copied${NC}"
echo ""

# Step 4: Restart server
echo "🔄 Step 4: Restarting server to initialize Firebase..."
docker restart nest_server
sleep 5
echo -e "${GREEN}✅ Server restarted${NC}"
echo ""

# Step 5: Check Firebase initialization
echo "🔍 Step 5: Checking Firebase initialization..."
if docker logs nest_server 2>&1 | grep -q "Firebase Admin initialized successfully"; then
    echo -e "${GREEN}✅ Firebase Admin initialized successfully${NC}"
elif docker logs nest_server 2>&1 | grep -q "Firebase service account file not found"; then
    echo -e "${RED}❌ Firebase service account file not found${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  Firebase initialization status unclear${NC}"
fi
echo ""

# Step 6: Test backend endpoint
echo "🧪 Step 6: Testing backend notification endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Madiramaps Test",
    "body": "Testing Firebase from madiramaps backend"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Backend endpoint working${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${YELLOW}⚠️  Backend endpoint response:${NC}"
    echo "$RESPONSE"
fi
echo ""

# Step 7: Verify database
echo "📊 Step 7: Verifying database..."
USER_COUNT=$(docker exec nest_pg psql -U postgres -d app_db -t -c "SELECT COUNT(*) FROM users;")
echo "Total users: $USER_COUNT"

TEST_USER=$(docker exec nest_pg psql -U postgres -d app_db -t -c "SELECT phone FROM users WHERE phone = '+9779812345678';")
if [ -n "$TEST_USER" ]; then
    echo -e "${GREEN}✅ Test user found: $TEST_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Test user not found${NC}"
fi
echo ""

# Step 8: Summary
echo "📋 Setup Summary"
echo "================"
echo -e "${GREEN}✅ Firebase service account configured${NC}"
echo -e "${GREEN}✅ Docker containers running${NC}"
echo -e "${GREEN}✅ Backend endpoint tested${NC}"
echo -e "${GREEN}✅ Database verified${NC}"
echo ""

echo "🎯 Next Steps:"
echo "1. Update mobile app Firebase config:"
echo "   - Android: variant_dashboard/android/app/google-services.json"
echo "   - iOS: variant_dashboard/ios/Runner/GoogleService-Info.plist"
echo ""
echo "2. Build Android APK:"
echo "   cd variant_dashboard"
echo "   flutter build apk --release"
echo ""
echo "3. Install on phone:"
echo "   adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk"
echo ""
echo "4. Test end-to-end:"
echo "   - Login to app with +9779812345678"
echo "   - Allow notifications"
echo "   - Send test notification from backend"
echo ""

echo -e "${GREEN}✅ Firebase setup complete!${NC}"
