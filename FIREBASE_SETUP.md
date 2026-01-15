# 🚀 GroundCTRL Firebase Setup Guide

## Overview
Complete Firebase setup for GroundCTRL with:
- **Frontend**: React → Firebase Hosting
- **Backend**: Node.js/Express → Firebase App Hosting
- **Testing**: Firebase Emulators (Auth + Firestore)
- **CI/CD**: GitHub Actions automated testing
- **Environments**: Production + Staging

---

## ✅ Completed Configuration

### 1. Root Configuration Files
- ✅ `.gitignore` - Firebase secrets protection
- ✅ `firebase.json` - Hosting + App Hosting config
- ✅ `.firebaserc` - Project aliases (prod/staging)

### 2. Backend Configuration
- ✅ `backend/firebase.json` - Emulator ports (Auth: 9099, Firestore: 8080)
- ✅ `backend/.env.sample` - Updated with emulator vars
- ✅ `backend/src/config/firebase.js` - Auto-detects emulators
- ✅ `backend/package.json` - Added emulator scripts

### 3. Frontend Configuration
- ✅ `frontend/.env.example` - React environment template

### 4. CI/CD
- ✅ `.github/workflows/firebase-emulator-test.yml` - Backend testing workflow

---

## 📋 Firebase Console Setup (Required)

### Step 1: Create Firebase Projects
```bash
1. Go to https://console.firebase.google.com
2. Create "groundctrl-prod" project
3. Create "groundctrl-staging" project
```

### Step 2: Enable Services (Both Projects)
- ✅ Authentication → Enable Email/Password
- ✅ Firestore Database → Create database
- ✅ Hosting → Get started
- ✅ App Hosting → Connect backend

### Step 3: Connect GitHub Repository
```bash
1. Firebase Console → App Hosting
2. "Connect to GitHub"
3. Select: E-Y-J/TR41-GroundCTRL
4. Authorize Firebase
5. Select backend directory: backend/
```

**Firebase Auto-Creates:**
- GitHub Secret: `FIREBASE_SERVICE_ACCOUNT_GROUNDCTRL_PROD`
- GitHub Secret: `FIREBASE_SERVICE_ACCOUNT_GROUNDCTRL_STAGING`
- Deployment workflows

---

## 🔧 Local Development Setup

### 1. Install Firebase Tools
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Copy Environment Files
```bash
# Backend
cd backend
cp .env.sample .env
# Edit .env with your actual credentials

# Frontend
cd frontend
cp .env.example .env
# Edit .env with your actual Firebase config
```

### 4. Run Tests with Emulators

**Terminal 1: Start Emulators**
```bash
cd backend
npm run emulators:start
```

**Terminal 2: Run Tests**
```bash
cd backend
npm test
```

**Or use single command:**
```bash
cd backend
npm run test:local
```

---

## 🧪 How Testing Works

### Architecture
```
Tests → Remote API (https://api.missionctrl.app/api)
     → Local Firebase Auth (localhost:9099)
     → Local Firestore (localhost:8080)
```

### Key Points
- ✅ **NO local backend server needed** for tests
- ✅ Tests hit **remote production API**
- ✅ Firebase data uses **local emulators**
- ✅ Emulators auto-detected via environment variables

### Environment Variables (Testing)
```bash
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
API_BASE_URL=https://api-staging.missionctrl.app/api
FIREBASE_PROJECT_ID=groundctrl-staging
```

---

## 🚢 Deployment Workflows

### Automatic Deployments

| Trigger | Action | Environment |
|---------|--------|-------------|
| Push to `main` (backend/**) | Run emulator tests | CI |
| Push to `main` (merged PR) | Deploy backend | Production |
| Pull Request | Deploy preview | Staging |
| Push to `main` (frontend/**) | Deploy frontend | Production |

### Manual Deployment
```bash
# Deploy everything
firebase deploy

# Deploy frontend only
firebase deploy --only hosting

# Deploy backend only
firebase deploy --only backends

# Deploy to staging
firebase use staging
firebase deploy
```

---

## 📦 Package.json Scripts

### Backend Scripts
```json
{
  "start": "node src/server.js",           // Production start
  "dev": "nodemon src/server.js",          // Development with hot reload
  "test": "jest --coverage",               // Run tests
  "test:local": "firebase emulators:exec --only auth,firestore \"npm test\"",
  "emulators:start": "firebase emulators:start --only auth,firestore",
  "lint": "eslint src/**/*.js",
  "lint:fix": "eslint src/**/*.js --fix"
}
```

---

## 🔐 Environment Variables Reference

### Backend Production (.env - NOT committed)
```bash
# Server
PORT=3001
NODE_ENV=production
CALL_SIGN=GROUNDCTRL-01

# API
API_BASE_URL=https://api.missionctrl.app/api

# Firebase (Production Credentials)
FIREBASE_PROJECT_ID=groundctrl-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@groundctrl-prod.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=AIza...

# JWT
JWT_SECRET=your-64-char-secret
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS
ALLOWED_ORIGINS=https://groundctrl.web.app,https://missionctrl.app
```

### Backend Testing (.env.local - NOT committed)
```bash
# Same as above PLUS:
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_PROJECT_ID=groundctrl-staging
API_BASE_URL=https://api-staging.missionctrl.app/api
```

### Frontend (.env - NOT committed)
```bash
REACT_APP_API_BASE_URL=https://api.missionctrl.app/api
REACT_APP_FIREBASE_PROJECT_ID=groundctrl-prod
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=groundctrl-prod.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=groundctrl-prod.appspot.com
```

---

## 🐛 Troubleshooting

### Tests Fail: "Firebase not initialized"
```bash
# Ensure emulator env vars are set
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Emulators Won't Start
```bash
# Check if ports are in use
netstat -an | findstr "9099 8080"

# Kill processes using those ports (Windows)
netstat -ano | findstr "9099"
taskkill /PID <process-id> /F
```

### Firebase Deploy Fails
```bash
# Check you're logged in
firebase login --reauth

# Check project is set
firebase use --add

# Check you have the right project selected
firebase projects:list
```

### GitHub Actions Fail
```bash
# Check GitHub Secrets are set
# Repository Settings → Secrets → Actions
# Should see: FIREBASE_SERVICE_ACCOUNT_GROUNDCTRL_PROD
# Should see: FIREBASE_SERVICE_ACCOUNT_GROUNDCTRL_STAGING
```

---

## 📚 Additional Resources

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [GitHub Actions for Firebase](https://github.com/marketplace/actions/github-action-for-firebase)

---

## ✨ Success Criteria

- ✅ `npm test` works locally (remote API + local emulators)
- ✅ GitHub Actions pass on backend PRs
- ✅ Frontend deploys to `*.web.app`
- ✅ Backend API deploys to `*.a.run.app`
- ✅ PRs get preview URLs automatically
- ✅ Separate staging environment for QA

---

**Status: ✅ CONFIGURED & READY FOR DEPLOYMENT**

Last Updated: January 14, 2026
