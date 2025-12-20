# Firebase Push Notifications - Complete Setup & Testing Guide

## Overview
This guide walks through setting up Firebase push notifications for the agency portal, testing with the backend, and deploying to a mobile app.

---

## Phase 1: Backend Setup & Database Configuration

### 1.1 Install Firebase Admin SDK in Docker

The Docker container needs to rebuild to include `firebase-admin`. Run:

```bash
docker-compose down
docker-compose up -d --build
```

Wait for the server to start. Check logs:
```bash
docker logs nest_server -f
```

You should see: `✅ Firebase Admin initialized successfully` (or a warning if service account is missing)

### 1.2 Database Migration - Add FCM Token Column

The `fcm_token` column has been added to the User entity. Run migration:

```bash
# Inside the container
docker exec nest_server npm run typeorm migration:generate -- -n AddFcmTokenToUser
docker exec nest_server npm run typeorm migration:run
```

Or if `synchronize: true` is enabled, just restart:
```bash
docker restart nest_server
```

**Verify the column was added:**
```bash
docker exec nest_pg psql -U postgres -d app_db -c "\d users;"
```

Look for the `fcm_token` column in the output.

### 1.3 Firebase Service Account Setup

You need a Firebase service account JSON file. Get it from Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to **Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `firebase-service-account.json` in your project root

**Current Status:**
```
⚠️ Firebase service account file not found at: /app/firebase-service-account.json
```

**For Docker:**
```bash
# Copy the file into the container
docker cp firebase-service-account.json nest_server:/app/
```

Or mount it in `docker-compose.yml`:
```yaml
volumes:
  - ./firebase-service-account.json:/app/firebase-service-account.json
```

Restart the server:
```bash
docker restart nest_server
```

Check logs:
```bash
docker logs nest_server | grep -i firebase
```

**Expected output after setup:**
```
✅ Firebase Admin initialized successfully
```

---

## Phase 2: Database Verification with Postgres MCP

### 2.1 Enable Postgres MCP

The MCP config has been updated at `/Users/ajaydahal/.kiro/settings/mcp.json` with:
- Docker-based Postgres MCP
- Connection: `postgresql://postgres:postgres@host.docker.internal:5431/app_db`
- Auto-approved tools for querying

### 2.2 Query the Database

Use the Postgres MCP to verify the schema and check for test users:

**Check Users Table:**
```sql
SELECT id, phone, fcm_token, created_at FROM users LIMIT 5;
```

**Check if fcm_token column exists:**
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'fcm_token';
```

**Create a test user (if needed):**
```sql
INSERT INTO users (id, phone, full_name, role, is_active, candidate_id, fcm_token)
VALUES (
  gen_random_uuid(),
  '+9779812345678',
  'Test User',
  'candidate',
  true,
  gen_random_uuid(),
  'test-fcm-token-placeholder'
);
```

---

## Phase 3: Test Notification Endpoint

### 3.1 Test Without FCM Token

First, test the endpoint without a real FCM token to verify the API works:

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Test Notification",
    "body": "This is a test message from the backend"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "message-id-from-firebase",
  "user": {
    "id": "user-uuid",
    "phone": "+9779812345678"
  }
}
```

### 3.2 Check Server Logs

```bash
docker logs nest_server | tail -50
```

Look for:
- `✅ Notification sent to user` (success)
- `No FCM token found for candidate` (expected if token is placeholder)
- `Firebase not initialized` (if service account is missing)

---

## Phase 4: Mobile App Setup

### 4.1 Get Firebase Credentials from Mobile Config

Your mobile app already has Firebase configured. Extract the credentials:

**Android:**
```bash
cat variant_dashboard/android/app/google-services.json | jq '.project_info.project_id'
```

**iOS:**
```bash
cat variant_dashboard/ios/Runner/GoogleService-Info.plist | grep -A 2 "PROJECT_ID"
```

### 4.2 Update Mobile App Firebase Config (if needed)

If you need to use a different Firebase project:

1. Go to Firebase Console → Create/Select Project
2. Add Android app: `com.udaansarathi.app` (or your package name)
3. Download `google-services.json` → Replace `variant_dashboard/android/app/google-services.json`
4. Add iOS app: `com.udaansarathi.app`
5. Download `GoogleService-Info.plist` → Replace `variant_dashboard/ios/Runner/GoogleService-Info.plist`

### 4.3 Build Android APK

```bash
cd variant_dashboard

# Clean build
flutter clean

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### 4.4 Install on Phone

```bash
# Connect your Android phone via USB
adb devices

# Install APK
adb install -r build/app/outputs/flutter-apk/app-release.apk

# Or use flutter
flutter install --release
```

---

## Phase 5: End-to-End Testing

### 5.1 Login to Mobile App

1. Open the app on your phone
2. Login with a test account (phone number: `+9779812345678`)
3. The app will request notification permissions - **Allow**
4. The app will generate an FCM token and send it to the backend

### 5.2 Verify FCM Token in Database

Check if the token was saved:

```sql
SELECT id, phone, fcm_token FROM users WHERE phone = '+9779812345678';
```

You should see a long FCM token string (not the placeholder).

### 5.3 Send Test Notification

From your backend, send a test notification:

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Hello from Backend!",
    "body": "This is a real push notification"
  }'
```

### 5.4 Check Phone for Notification

- Look at your phone's notification center
- You should see the notification appear
- Tap it to open the app

### 5.5 Check Server Logs

```bash
docker logs nest_server | grep -i "notification sent"
```

You should see: `✅ Notification sent to user [user-id] ([phone])`

---

## Phase 6: Trigger Notifications from Application Events

### 6.1 Shortlist Notification

When an agency shortlists a candidate:

```bash
# This should trigger a notification automatically
curl -X POST http://localhost:3000/applications/shortlist \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app-uuid",
    "agencyId": "agency-uuid"
  }'
```

### 6.2 Interview Scheduled Notification

When an interview is scheduled:

```bash
curl -X POST http://localhost:3000/interviews/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app-uuid",
    "date": "2025-01-20",
    "time": "10:00",
    "location": "Office"
  }'
```

---

## Troubleshooting

### Issue: "Firebase not initialized"
- Check if `firebase-service-account.json` exists in project root
- Check Docker logs: `docker logs nest_server | grep -i firebase`
- Verify file permissions: `ls -la firebase-service-account.json`

### Issue: "No FCM token found for candidate"
- User hasn't logged in to mobile app yet
- Mobile app hasn't sent FCM token to backend
- Check database: `SELECT fcm_token FROM users WHERE phone = '+9779812345678';`

### Issue: Notification not appearing on phone
- Check if notifications are enabled in app settings
- Check if Firebase project ID matches in mobile app
- Check server logs for errors: `docker logs nest_server | tail -100`

### Issue: Docker container won't start
- Rebuild: `docker-compose down && docker-compose up -d --build`
- Check logs: `docker logs nest_server`
- Ensure port 3000 is not in use: `lsof -i :3000`

---

## Quick Reference Commands

```bash
# Rebuild Docker
docker-compose down && docker-compose up -d --build

# Check server logs
docker logs nest_server -f

# Check database logs
docker logs nest_pg -f

# Test notification endpoint
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"phone":"+9779812345678","title":"Test","body":"Test message"}'

# Query users with FCM tokens
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT id, phone, fcm_token FROM users WHERE fcm_token IS NOT NULL;"

# Build Android APK
cd variant_dashboard && flutter build apk --release

# Install APK
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk
```

---

## Next Steps

1. ✅ Rebuild Docker container with firebase-admin
2. ✅ Add firebase-service-account.json to project
3. ✅ Verify fcm_token column in database
4. ✅ Test notification endpoint
5. ✅ Build and install Android APK
6. ✅ Login to mobile app and verify FCM token is saved
7. ✅ Send test notification and verify it appears on phone
8. ✅ Test notifications from application events (shortlist, interview, etc.)

