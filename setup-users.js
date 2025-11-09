#!/usr/bin/env node

/**
 * Setup test users for CampusBite platform
 * Run with: node setup-users.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

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

const testUsers = [
  {
    email: 'admin@hitam.org',
    password: 'password123',
    role: 'admin'
  },
  {
    email: 'student@hitam.org', 
    password: 'password123',
    role: 'student'
  }
];

async function createTestUsers() {
  console.log('🔐 Setting up test users...');
  
  for (const user of testUsers) {
    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️  User already exists: ${user.email}`);
      } else {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Test users setup complete!');
  console.log('\nYou can now login with:');
  console.log('  Admin: admin@hitam.org / password123');
  console.log('  Student: student@hitam.org / password123');
}

createTestUsers().catch(console.error);
