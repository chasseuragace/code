# Madiramaps Firebase Setup - COMPLETE ✅

**Date:** December 18, 2025  
**Status:** 🟢 READY FOR MOBILE APP TESTING

---

## ✅ Completed Setup

### 1. Firebase Service Account ✅
- **File:** `firebase-service-account.json`
- **Project ID:** `madiramaps-268511`
- **Status:** Mounted in Docker container
- **Location:** `/app/firebase-service-account.json`

### 2. Firebase Admin SDK ✅
- **Package:** `firebase-admin@13.6.0`
- **Status:** ✅ Initialized successfully
- **Log:** `✅ Firebase Admin initialized successfully`

### 3. Docker Setup ✅
- **Container:** `nest_server` (running)
- **Database:** `nest_pg` (healthy)
- **Volume Mount:** `./firebase-service-account.json:/app/firebase-service-account.json`
- **Status:** All containers healthy

### 4. Database Schema ✅
- **fcm_token Column:** Present in users table
- **Notifications Table:** Ready
- **Test User:** Created at `+9779812345678`
- **Status:** All tables verified

### 5. API Endpoints ✅
- **Test Endpoint:** `POST /notifications/test`
- **Status:** Working (Firebase responding)
- **Error Handling:** Proper validation of FCM tokens

### 6. Postgres MCP ✅
- **Status:** Connected and working
- **Database:** `app_db` accessible
- **Queries:** All working

---

## System Status

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  ✅ Firebase Admin SDK initialized                          │
│  ✅ Service account mounted                                 │
│  ✅ Notification endpoints ready                            │
│  ✅ Database connected                                      │
│  ✅ API responding                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Cloud Messaging (FCM)                  │
│  ✅ Service account authenticated                           │
│  ✅ Ready to send notifications                             │
│  ✅ Waiting for valid FCM tokens from mobile app            │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Results

### Backend Endpoint Test
```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Madiramaps Firebase Test",
    "body": "Testing Firebase push notifications"
  }'
```

**Result:** ✅ Firebase responding (error is expected with placeholder token)

**Server Log:**
```
✅ Firebase Admin initialized successfully
ERROR: The registration token is not a valid FCM registration token
```

This is **EXPECTED** because the test user has a placeholder token. Once the mobile app sends a real FCM token, notifications will be sent successfully.

### Database Verification
```
Total Users: 11
Users with FCM Token: 1
Test User: +9779812345678
FCM Token: test-fcm-token-placeholder
```

---

## Docker Configuration

### docker-compose.yml Updated
```yaml
volumes:
  - ./src:/app/src
  - ./test:/app/test
  - ./tsconfig.json:/app/tsconfig.json
  - ./tsconfig.build.json:/app/tsconfig.build.json
  - ./jest.config.js:/app/jest.config.js
  - ./package.json:/app/package.json
  - ./reference:/app/reference
  - ./public:/app/public
  - ./firebase-service-account.json:/app/firebase-service-account.json  # ✅ NEW
```

---

## Next Steps: Mobile App Setup

### Step 1: Get Mobile App Firebase Config

Extract from your existing mobile app:

**Android:**
```bash
cat variant_dashboard/android/app/google-services.json | jq '.project_info'
```

**iOS:**
```bash
cat variant_dashboard/ios/Runner/GoogleService-Info.plist | grep -A 2 "PROJECT_ID"
```

### Step 2: Update Mobile App (if using different Firebase project)

If you want to use the madiramaps Firebase project for the mobile app:

1. Go to [Firebase Console - Madiramaps](https://console.firebase.google.com/u/0/project/madiramaps-268511/settings/general)
2. Add Android app: `com.madiramaps.app`
3. Download `google-services.json` → Replace `variant_dashboard/android/app/google-services.json`
4. Add iOS app: `com.madiramaps.app`
5. Download `GoogleService-Info.plist` → Replace `variant_dashboard/ios/Runner/GoogleService-Info.plist`

### Step 3: Build Android APK

```bash
cd variant_dashboard
flutter clean
flutter pub get
flutter build apk --release
```

### Step 4: Install on Phone

```bash
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk
```

### Step 5: Test End-to-End

1. Open app on phone
2. Login with: `+9779812345678`
3. Allow notification permissions
4. App will send FCM token to backend

### Step 6: Verify FCM Token in Database

```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT phone, fcm_token FROM users WHERE phone = '+9779812345678';"
```

You should see a real FCM token (not the placeholder).

### Step 7: Send Real Notification

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Hello from Madiramaps!",
    "body": "This is a real push notification"
  }'
```

### Step 8: Check Phone

- Notification should appear in notification center
- Tap to open app

---

## Quick Reference Commands

### Check Firebase Status
```bash
docker logs nest_server | grep -i firebase
```

### Test Notification Endpoint
```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"phone":"+9779812345678","title":"Test","body":"Test"}'
```

### Check Database
```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT phone, fcm_token FROM users WHERE phone = '+9779812345678';"
```

### View Server Logs
```bash
docker logs nest_server -f
```

### Restart Containers
```bash
docker-compose down
docker-compose up -d
```

### Build APK
```bash
cd variant_dashboard
flutter build apk --release
```

### Install APK
```bash
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk
```

---

## Files Created/Modified

### Created
- `firebase-service-account.json` - Firebase service account (mounted in Docker)
- `MADIRAMAPS_FIREBASE_SETUP.md` - Setup guide
- `MADIRAMAPS_FIREBASE_SETUP_COMPLETE.md` - This file

### Modified
- `docker-compose.yml` - Added Firebase service account volume mount

---

## Architecture

```
Mobile App (Flutter)
    ↓ (Login + FCM Token)
Backend (NestJS)
    ↓ (Firebase Admin SDK)
Firebase Cloud Messaging
    ↓ (Push Notification)
Mobile Device
```

---

## Success Criteria

✅ **Backend Ready:**
- Firebase Admin SDK initialized
- Service account mounted
- API endpoints working
- Database schema correct

✅ **Firebase Ready:**
- Service account authenticated
- Ready to send notifications
- Error handling working

⏳ **Mobile Ready:**
- APK built and installed
- App login working
- FCM token registered
- Notification received

---

## Troubleshooting

### Firebase Not Initialized
```bash
# Check if file is mounted
docker exec nest_server ls -la /app/firebase-service-account.json

# Check logs
docker logs nest_server | grep -i firebase

# Restart
docker restart nest_server
```

### No FCM Token Found
- User hasn't logged in to mobile app
- Mobile app hasn't sent token to backend
- Check database for token

### Notification Not Appearing
- Check if notifications enabled in app settings
- Verify Firebase project ID matches in mobile app
- Check server logs for errors

### Docker Issues
```bash
docker-compose down
docker-compose up -d
docker ps
```

---

## Summary

🟢 **Backend Firebase setup is COMPLETE and WORKING**

- ✅ Firebase service account configured
- ✅ Docker containers running
- ✅ API endpoints ready
- ✅ Database verified
- ✅ Postgres MCP working

**Next:** Build and install mobile APK, then test end-to-end.

**Estimated time to complete:** ~30 minutes

