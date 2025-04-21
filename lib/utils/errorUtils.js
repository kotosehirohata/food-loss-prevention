// lib/utils/errorUtils.js
export const handleFirebaseError = (error) => {
    const errorMap = {
      'auth/user-not-found': 'Email not found. Please check your email or create an account.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'Email already in use. Please use a different email or sign in.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'permission-denied': 'You don\'t have permission to perform this action.',
      'not-found': 'The requested resource was not found.',
    };
    
    // Get error code
    const errorCode = error.code || 'unknown';
    
    // Return user-friendly message
    return {
      code: errorCode,
      message: errorMap[errorCode] || error.message || 'An unexpected error occurred. Please try again.',
      original: error
    };
  };