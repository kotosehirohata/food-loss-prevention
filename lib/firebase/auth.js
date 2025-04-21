// lib/firebase/auth.js

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

// Create mock response for development
const createMockResponse = (operationType) => {
  if (operationType === 'auth') {
    return {
      user: {
        uid: 'mock-user-id',
        email: 'mock@example.com',
      },
      error: null,
    };
  }
  
  return {
    success: true,
    error: null,
  };
};

// Handle auth errors
const handleAuthError = (error) => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    default:
      return error?.message || 'An unexpected authentication error occurred.';
  }
};

export const signIn = async (email, password) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock authentication.');
      return createMockResponse('auth');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    const errorMessage = handleAuthError(error);
    return { user: null, error: { message: errorMessage } };
  }
};

export const signUp = async (email, password) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock authentication.');
      return createMockResponse('auth');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    const errorMessage = handleAuthError(error);
    return { user: null, error: { message: errorMessage } };
  }
};

export const signOut = async () => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock authentication.');
      return { error: null };
    }

    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    const errorMessage = handleAuthError(error);
    return { error: { message: errorMessage } };
  }
};

export const onAuth = (callback) => {
  // Check if Firebase is properly configured
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Using mock authentication.');
    // Simulate logged in user for development
    setTimeout(() => callback({ uid: 'mock-uid', email: 'mock@example.com' }), 100);
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(auth, callback);
};