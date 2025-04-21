// lib/firebase/errorHandling.js

/**
 * Handles Firebase authentication errors and returns user-friendly messages
 * @param {Error} error - Firebase auth error
 * @returns {string} User-friendly error message
 */
export const handleAuthError = (error) => {
    const errorCode = error?.code || '';
    
    // Authentication error messages
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
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      case 'auth/internal-error':
        return 'Internal error. Please try again later.';
      // Add other auth error codes as needed
      default:
        return error?.message || 'An unexpected authentication error occurred.';
    }
  };
  
  /**
   * Handles Firebase Firestore errors and returns user-friendly messages
   * @param {Error} error - Firebase Firestore error
   * @returns {string} User-friendly error message 
   */
  export const handleFirestoreError = (error) => {
    const errorCode = error?.code || '';
    
    // Firestore error messages
    switch (errorCode) {
      case 'permission-denied':
        return 'You do not have permission to perform this operation.';
      case 'not-found':
        return 'The requested document was not found.';
      case 'already-exists':
        return 'The document already exists.';
      case 'resource-exhausted':
        return 'Quota exceeded or rate limit reached. Please try again later.';
      case 'failed-precondition':
        return 'Operation failed due to the current state of the system.';
      case 'aborted':
        return 'The operation was aborted.';
      case 'unavailable':
        return 'The service is currently unavailable. Please try again later.';
      // Add other Firestore error codes as needed
      default:
        return error?.message || 'An unexpected database error occurred.';
    }
  };
  
  /**
   * Checks if Firebase environment variables are properly configured
   * @returns {boolean} Whether Firebase is properly configured
   */
  export const isFirebaseConfigured = () => {
    return (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    );
  };
  
  /**
   * Creates a mock Firebase response for development when Firebase is not configured
   * @param {string} operationType - Type of operation (auth, firestore, etc.)
   * @returns {Object} Mock response object
   */
  export const createMockResponse = (operationType) => {
    // For authentication operations
    if (operationType === 'auth') {
      return {
        user: {
          id: 'mock-user-id',
          email: 'mock@example.com',
        },
        error: null,
      };
    }
    
    // For Firestore operations
    if (operationType === 'firestore') {
      return {
        data: [],
        error: null,
      };
    }
    
    return {
      success: true,
      error: null,
      message: 'Mock operation completed. Firebase not configured.',
    };
  };