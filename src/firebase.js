import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD2ENvKW-PQEZYGXr_aAY5o_XyZ6nivjQU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "campusbite-fc843.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "campusbite-fc843",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "campusbite-fc843.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "256690053262",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:256690053262:web:abdf41c97f5c7bdbfb29df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Connect to emulators if running locally
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  // Auth, Firestore, Functions, and Storage emulators
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch {}
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch {}
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch {}
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch {}
}

export { app, auth, db, functions, storage };
export default app;