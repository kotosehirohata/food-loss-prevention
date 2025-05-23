// lib/firebase/auth.ts - Updated version

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';
import { isFirebaseConfigured, createMockResponse, handleAuthError } from './errorHandling';

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