# Firebase Push Notifications - Quick Start

## Current Status ✅

- ✅ Docker containers running (nest_server, nest_pg)
- ✅ firebase-admin package installed
- ✅ fcm_token column added to users table
- ✅ Test user created: `+9779812345678`
- ✅ Notification API endpoints ready
- ❌ Firebase service account file missing
- ❌ Mobile app Firebase config needs update

---

## Next Steps (In Order)

### Step 1: Get Firebase Service Account (5 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Settings (⚙️) → Service Accounts
4. Click "Generate New Private Key"
5. Save as `firebase-service-account.json` in project root

### Step 2: Copy to Docker Container (1 min)

```bash
docker cp firebase-service-account.json nest_server:/app/
docker restart nest_server
```

Verify:
```bash
docker logs nest_server | grep -i firebase
```

Should see: `✅ Firebase Admin initialized successfully`

### Step 3: Test Backend Notification (2 min)

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Backend Test",
    "body": "Testing Firebase from backend"
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "...",
  "user": {
    "id": "...",
    "phone": "+9779812345678"
  }
}
```

### Step 4: Get Mobile App Firebase Credentials (5 min)

Extract from your existing mobile app config:

**Android:**
```bash
cat variant_dashboard/android/app/google-services.json | jq '.project_info.project_id'
```

**iOS:**
```bash
cat variant_dashboard/ios/Runner/GoogleService-Info.plist | grep -A 2 "PROJECT_ID"
```

### Step 5: Update Mobile App Firebase Config (if needed)

If using a different Firebase project:

1. Go to Firebase Console → Your Project
2. Add Android app: `com.udaansarathi.app`
3. Download `google-services.json` → Replace `variant_dashboard/android/app/google-services.json`
4. Add iOS app: `com.udaansarathi.app`
5. Download `GoogleService-Info.plist` → Replace `variant_dashboard/ios/Runner/GoogleService-Info.plist`

### Step 6: Build Android APK (10 min)

```bash
cd variant_dashboard
flutter clean
flutter pub get
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Step 7: Install on Phone (2 min)

```bash
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk
```

### Step 8: Test End-to-End (5 min)

1. Open app on phone
2. Login with: `+9779812345678`
3. Allow notification permissions
4. App will send FCM token to backend

Verify token was saved:
```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT phone, fcm_token FROM users WHERE phone = '+9779812345678';"
```

### Step 9: Send Real Notification (1 min)

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Hello from Backend!",
    "body": "This is a real push notification"
  }'
```

Check your phone - notification should appear!

---

## Database Queries

**Check test user:**
```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT id, phone, fcm_token FROM users WHERE phone = '+9779812345678';"
```

**Check all users with FCM tokens:**
```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT phone, fcm_token FROM users WHERE fcm_token IS NOT NULL;"
```

**Update FCM token manually (for testing):**
```bash
docker exec nest_pg psql -U postgres -d app_db -c \
  "UPDATE users SET fcm_token = 'your-test-token' WHERE phone = '+9779812345678';"
```

---

## Troubleshooting

**Firebase not initialized:**
- Check if `firebase-service-account.json` exists in project root
- Verify it was copied to container: `docker exec nest_server ls -la /app/firebase-service-account.json`
- Restart server: `docker restart nest_server`

**No FCM token found:**
- User hasn't logged in to mobile app yet
- Mobile app hasn't sent token to backend
- Check database for token: `SELECT fcm_token FROM users WHERE phone = '+9779812345678';`

**Notification not appearing on phone:**
- Check if notifications are enabled in app settings
- Verify Firebase project ID matches in mobile app
- Check server logs: `docker logs nest_server | tail -50`

**Docker issues:**
- Restart containers: `docker-compose down && docker-compose up -d`
- Check status: `docker ps`

---

## Estimated Total Time: ~30 minutes

1. Get Firebase credentials: 5 min
2. Setup backend: 3 min
3. Test backend: 2 min
4. Update mobile config: 5 min
5. Build APK: 10 min
6. Install & test: 5 min

