# How to Run CampusBite Platform

## 🚀 Quick Start Guide

### Option 1: Run with Firebase Emulators (Recommended for Development)

This runs the app with local Firebase emulators (Auth, Firestore, Functions, Storage).

#### Step 1: Install Firebase Tools (if not already installed)
```bash
npm install -g firebase-tools
```

#### Step 2: Start Firebase Emulators
```bash
# This will start all emulators configured in firebase.json
firebase emulators:start
```

This will start:
- Auth Emulator: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Storage: http://localhost:9199
- UI: http://localhost:4000

Keep this terminal running.

#### Step 3: Open a New Terminal and Start the React App
```bash
cd /Users/apple/Desktop/campusbite-platform
npm start
```

The app will open at http://localhost:3000

---

### Option 2: Run Production Build (Local)

```bash
npm run build    # Build the app
npm run start    # Start the production build
```

---

### Option 3: Run with Real Firebase (Production Mode)

If you have Firebase project configured:

1. Make sure you have `.env.local` file with your Firebase credentials:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

2. Deploy Cloud Functions:
```bash
cd functions
npm install  # if not already done
cd ..
firebase deploy --only functions
```

3. Start the app:
```bash
npm start
```

---

## 📝 Available Commands

```bash
# Development
npm start          # Start development server (port 3000)
npm run build      # Build for production
npm test           # Run tests

# Firebase
firebase emulators:start        # Start all emulators locally
firebase deploy                 # Deploy to Firebase
firebase deploy --only functions  # Deploy only functions
```

---

## 🔐 Demo Login Credentials

### Student Account
- **Email**: `student@hitam.org`
- **Password**: `password123`

### Admin Account  
- **Email**: `admin@hitam.org`
- **Password**: `password123`

---

## ⚠️ Important Notes

1. **For Development**: Use Firebase Emulators (Option 1) - no real Firebase project needed
2. **For Production**: You need a Firebase project configured
3. The app automatically connects to emulators when running on localhost
4. All data in emulators is temporary and cleared when emulators restart

---

## 🐛 Troubleshooting

### Port already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill Firebase emulators
lsof -ti:4000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:9099 | xargs kill -9
```

### Firebase CLI not found?
```bash
npm install -g firebase-tools
```

### Functions not working?
```bash
cd functions
npm install
cd ..
npm start
```

