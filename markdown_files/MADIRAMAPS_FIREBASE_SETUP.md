# Madiramaps Firebase Setup Guide

**Project ID:** `madiramaps-268511`  
**Status:** Setting up new Firebase project for push notifications

---

## Step 1: Download Service Account Key

### Via Firebase Console (Recommended)

1. Go to [Firebase Console - Madiramaps Project](https://console.firebase.google.com/u/0/project/madiramaps-268511/settings/general)
2. Click **Settings** (⚙️ icon) → **Service Accounts**
3. Click **Generate New Private Key**
4. Save the downloaded JSON file as `firebase-service-account.json` in project root

### File Location
```
/Volumes/shared_code/code_shared/portal/agency_research/code/firebase-service-account.json
```

---

## Step 2: Verify Service Account File

Once downloaded, verify it contains:
```json
{
  "type": "service_account",
  "project_id": "madiramaps-268511",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Step 3: Copy to Docker Container

```bash
# Copy the service account file to the running container
docker cp firebase-service-account.json nest_server:/app/

# Verify it was copied
docker exec nest_server ls -la /app/firebase-service-account.json

# Restart the server to initialize Firebase
docker restart nest_server

# Check logs for Firebase initialization
docker logs nest_server | grep -i firebase
```

**Expected output:**
```
✅ Firebase Admin initialized successfully
```

---

## Step 4: Test Backend Notification Endpoint

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Madiramaps Test",
    "body": "Testing Firebase from madiramaps backend"
  }'
```

**Expected response:**
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

---

## Step 5: Update Mobile App Firebase Config

### For Android

1. Go to [Firebase Console - Madiramaps](https://console.firebase.google.com/u/0/project/madiramaps-268511/settings/general/android:com.example.testfirebaseperformance)
2. Click **Add App** → **Android**
3. Enter package name: `com.madiramaps.app` (or your actual package name)
4. Download `google-services.json`
5. Replace: `variant_dashboard/android/app/google-services.json`

### For iOS

1. Go to [Firebase Console - Madiramaps](https://console.firebase.google.com/u/0/project/madiramaps-268511/settings/general)
2. Click **Add App** → **iOS**
3. Enter bundle ID: `com.madiramaps.app` (or your actual bundle ID)
4. Download `GoogleService-Info.plist`
5. Replace: `variant_dashboard/ios/Runner/GoogleService-Info.plist`

---

## Step 6: Build Android APK with Madiramaps Firebase

```bash
cd variant_dashboard

# Clean previous build
flutter clean

# Get dependencies
flutter pub get

# Build APK with madiramaps Firebase config
flutter build apk --release

# Output location
# build/app/outputs/flutter-apk/app-release.apk
```

---

## Step 7: Install APK on Phone

```bash
# Connect Android phone via USB
adb devices

# Install the APK
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk

# Or use flutter directly
flutter install --release
```

---

## Step 8: Test End-to-End

### On Mobile App
1. Open the app
2. Login with test phone: `+9779812345678`
3. Allow notification permissions when prompted
4. App will register FCM token with backend

### Verify FCM Token in Database

```bash
# Query the database
docker exec nest_pg psql -U postgres -d app_db -c \
  "SELECT id, phone, fcm_token FROM users WHERE phone = '+9779812345678';"
```

**Expected output:**
```
                  id                  |     phone      |         fcm_token
--------------------------------------+----------------+---------------------------
b67463b1-9bf1-45a2-9f41-2981f32f661e | +9779812345678 | eXXXXXXXXXXXXXXXXXXXXXXX...
```

### Send Test Notification

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9779812345678",
    "title": "Hello from Madiramaps!",
    "body": "This is a real push notification"
  }'
```

### Check Phone
- Look at notification center
- Notification should appear with title and body
- Tap to open app

---

## Step 9: Monitor with Postgres MCP

### Check Notifications Sent

```sql
SELECT id, notification_type, title, is_sent, sent_at, created_at 
FROM notifications 
WHERE candidate_id = (SELECT candidate_id FROM users WHERE phone = '+9779812345678')
ORDER BY created_at DESC 
LIMIT 5;
```

### Check All Users with FCM Tokens

```sql
SELECT id, phone, fcm_token, created_at 
FROM users 
WHERE fcm_token IS NOT NULL 
ORDER BY created_at DESC;
```

### Update FCM Token (for testing)

```sql
UPDATE users 
SET fcm_token = 'new-test-token' 
WHERE phone = '+9779812345678';
```

---

## Troubleshooting

### Firebase Not Initialized
```bash
# Check if file exists in container
docker exec nest_server ls -la /app/firebase-service-account.json

# Check server logs
docker logs nest_server | grep -i firebase

# Restart server
docker restart nest_server
```

### No FCM Token Found
- User hasn't logged in to mobile app yet
- Mobile app hasn't sent token to backend
- Check database: `SELECT fcm_token FROM users WHERE phone = '+9779812345678';`

### Notification Not Appearing
- Check if notifications are enabled in app settings
- Verify Firebase project ID matches in mobile app
- Check server logs: `docker logs nest_server | tail -50`

### Docker Issues
```bash
# Restart containers
docker-compose down
docker-compose up -d

# Check status
docker ps
```

---

## Quick Reference

### Project Details
- **Firebase Project ID:** `madiramaps-268511`
- **Backend Database:** `app_db` (PostgreSQL)
- **Backend Port:** `3000`
- **Database Port:** `5431`
- **Test User Phone:** `+9779812345678`

### Key Files
- Service Account: `firebase-service-account.json` (project root)
- Android Config: `variant_dashboard/android/app/google-services.json`
- iOS Config: `variant_dashboard/ios/Runner/GoogleService-Info.plist`

### Key Endpoints
- Test Notification: `POST /notifications/test`
- Get Notifications: `GET /notifications?candidateId=uuid`
- Mark as Read: `PATCH /notifications/:id/read`

### Key Commands
```bash
# Copy service account to Docker
docker cp firebase-service-account.json nest_server:/app/

# Restart server
docker restart nest_server

# Check Firebase initialization
docker logs nest_server | grep -i firebase

# Test endpoint
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"phone":"+9779812345678","title":"Test","body":"Test"}'

# Build APK
cd variant_dashboard && flutter build apk --release

# Install APK
adb install -r variant_dashboard/build/app/outputs/flutter-apk/app-release.apk
```

---

## Timeline

| Step | Task | Time |
|------|------|------|
| 1 | Download service account | 2 min |
| 2 | Verify file | 1 min |
| 3 | Copy to Docker | 1 min |
| 4 | Test backend | 2 min |
| 5 | Update mobile config | 5 min |
| 6 | Build APK | 10 min |
| 7 | Install on phone | 2 min |
| 8 | Test end-to-end | 5 min |
| 9 | Monitor | ongoing |
| **Total** | | **~30 min** |

---

## Next Steps

1. ✅ Download `firebase-service-account.json` from Firebase Console
2. ✅ Copy to Docker container
3. ✅ Verify Firebase initialization
4. ✅ Test backend endpoint
5. ✅ Update mobile app Firebase config
6. ✅ Build and install APK
7. ✅ Test end-to-end
8. ✅ Monitor notifications

