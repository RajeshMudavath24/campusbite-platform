#!/usr/bin/env node

/**
 * Setup test users for CampusBite platform
 * Run with: node setup-users.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD2ENvKW-PQEZYGXr_aAY5o_XyZ6nivjQU",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "campusbite-fc843.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "campusbite-fc843",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "campusbite-fc843.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "256690053262",
  appId: process.env.FIREBASE_APP_ID || "1:256690053262:web:abdf41c97f5c7bdbfb29df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testUsers = [
  {
    email: 'admin@hitam.org',
    password: 'password123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'student@hitam.org', 
    password: 'password123',
    role: 'student',
    name: 'John Doe'
  }
];

async function createTestUsers() {
  console.log('🔐 Setting up test users...');
  
  for (const user of testUsers) {
    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;
      
      // Update displayName in Auth (if supported)
      try {
        await updateProfile(userCredential.user, {
          displayName: user.name
        });
      } catch (updateError) {
        console.warn(`⚠️  Could not update displayName for ${user.email}:`, updateError.message);
      }
      
      // Update user document in Firestore with name and role
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          uid: uid,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: serverTimestamp(),
        }, { merge: true });
        console.log(`✅ Created user: ${user.email} (${user.role}) - Name: ${user.name}`);
      } catch (firestoreError) {
        console.warn(`⚠️  Could not update Firestore for ${user.email}:`, firestoreError.message);
        console.log(`✅ Created user: ${user.email} (${user.role}) - Name will be set by server function`);
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️  User already exists: ${user.email}`);
        // Try to update the existing user's name in Firestore
        try {
          // Sign in to get the user's UID
          const signInCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          const uid = signInCredential.user.uid;
          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, {
            name: user.name,
            role: user.role,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          console.log(`✅ Updated user profile: ${user.email} - Name: ${user.name}`);
        } catch (updateError) {
          console.warn(`⚠️  Could not update existing user ${user.email}:`, updateError.message);
        }
      } else {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Test users setup complete!');
  console.log('\nYou can now login with:');
  console.log('  Admin: admin@hitam.org / password123 (Name: Admin User)');
  console.log('  Student: student@hitam.org / password123 (Name: John Doe)');
}

createTestUsers().catch(console.error);
