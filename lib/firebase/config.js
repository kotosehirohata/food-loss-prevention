// lib/firebase/config.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if configuration is provided
let app;
let db;
let auth;

try {
  // Initialize Firebase
  if (!getApps().length) {
    // Check if required config values are present
    const isConfigValid = Object.values(firebaseConfig).every(value => 
      value !== undefined && value !== '' && value !== null
    );
    
    if (isConfigValid) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      console.warn(
        'Firebase configuration is incomplete. Using mock implementation for development.'
      );
      // Create a mock app object
      app = {};
    }
  } else {
    app = getApp();
  }
  
  // Initialize Firestore and Auth if app is initialized
  if (app.name) {
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Use Firebase emulators for local development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      if (typeof window !== 'undefined') {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Using Firebase emulators for local development');
      }
    }
  } else {
    // Create mock objects for development
    db = {};
    auth = {};
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create fallback empty objects for development
  app = {};
  db = {};
  auth = {};
}

export { app, db, auth };