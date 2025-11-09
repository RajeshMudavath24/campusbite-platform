#!/usr/bin/env node

/**
 * Firebase Database Viewer Script
 * 
 * This script demonstrates how to programmatically access your Firebase database
 * Run with: node database-viewer.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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
const db = getFirestore(app);

async function viewCollection(collectionName) {
  console.log(`\n📁 Collection: ${collectionName}`);
  console.log('=' .repeat(50));
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log('   No documents found');
      return;
    }
    
    querySnapshot.forEach((doc) => {
      console.log(`\n📄 Document ID: ${doc.id}`);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
    
    console.log(`\n   Total documents: ${querySnapshot.size}`);
  } catch (error) {
    console.error(`   Error fetching ${collectionName}:`, error.message);
  }
}

async function viewAllCollections() {
  console.log('🔍 Firebase Database Viewer');
  console.log('=' .repeat(50));
  console.log('Project: campusbite-fc843');
  console.log('Database: Firestore');
  
  const collections = ['menu', 'users', 'orders'];
  
  for (const collectionName of collections) {
    await viewCollection(collectionName);
  }
  
  console.log('\n✅ Database viewing complete!');
  console.log('\n🌐 You can also view your database at:');
  console.log('   https://console.firebase.google.com/project/campusbite-fc843/firestore');
}

// Run the viewer
viewAllCollections().catch(console.error);
