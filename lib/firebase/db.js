// lib/firebase/db.js

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

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

// Handle Firestore errors
const handleFirestoreError = (error) => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'permission-denied':
      return 'You do not have permission to perform this operation.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'The document already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded or rate limit reached. Please try again later.';
    default:
      return error?.message || 'An unexpected database error occurred.';
  }
};

// Mock data for development when Firebase is not configured
const mockInventoryData = [
  {
    id: 'mock-item-1',
    name: 'Milk',
    quantity: 2,
    unit: 'liters',
    category: 'dairy',
    purchaseDate: { toDate: () => new Date(Date.now() - 86400000) }, // yesterday
    expiryDate: { toDate: () => new Date(Date.now() + 86400000 * 5) }, // 5 days from now
    notes: 'Organic whole milk',
    sharingAvailable: false,
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
    updatedAt: { toDate: () => new Date(Date.now() - 86400000) }
  },
  {
    id: 'mock-item-2',
    name: 'Tomatoes',
    quantity: 1.5,
    unit: 'kg',
    category: 'produce',
    purchaseDate: { toDate: () => new Date(Date.now() - 86400000 * 2) }, // 2 days ago
    expiryDate: { toDate: () => new Date(Date.now() + 86400000 * 3) }, // 3 days from now
    notes: 'Roma tomatoes',
    sharingAvailable: true,
    createdAt: { toDate: () => new Date(Date.now() - 86400000 * 2) },
    updatedAt: { toDate: () => new Date(Date.now() - 86400000 * 2) }
  }
];

const mockWasteData = [
  {
    id: 'mock-waste-1',
    itemId: 'mock-item-1',
    itemName: 'Expired Lettuce',
    quantity: 0.5,
    unit: 'kg',
    reason: 'expired',
    notes: 'Found in back of fridge',
    disposalDate: { toDate: () => new Date(Date.now() - 86400000) }, // yesterday
    createdAt: { toDate: () => new Date(Date.now() - 86400000) }
  }
];

// Generic function to add a document to a collection
export const addDocument = async (collectionName, data) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock database.');
      const mockId = `mock-${collectionName}-${Date.now()}`;
      console.log(`Mock document created with ID: ${mockId}`);
      return { id: mockId, error: null };
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error adding document:', error);
    const errorMessage = handleFirestoreError(error);
    return { id: null, error: { message: errorMessage } };
  }
};

// Generic function to update a document
export const updateDocument = async (collectionName, id, data) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock database.');
      console.log(`Mock document updated: ${collectionName}/${id}`);
      return { success: true, error: null };
    }

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating document:', error);
    const errorMessage = handleFirestoreError(error);
    return { success: false, error: { message: errorMessage } };
  }
};

// Generic function to delete a document
export const deleteDocument = async (collectionName, id) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock database.');
      console.log(`Mock document deleted: ${collectionName}/${id}`);
      return { success: true, error: null };
    }

    await deleteDoc(doc(db, collectionName, id));
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    const errorMessage = handleFirestoreError(error);
    return { success: false, error: { message: errorMessage } };
  }
};

// Generic function to get a single document
export const getDocument = async (collectionName, id) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock database.');
      let mockData = null;
      
      // Return mock data based on collection
      if (collectionName === 'inventory') {
        mockData = mockInventoryData.find(item => item.id === id);
      } else if (collectionName === 'waste') {
        mockData = mockWasteData.find(item => item.id === id);
      }
      
      return { data: mockData, error: null };
    }

    const docSnap = await getDoc(doc(db, collectionName, id));
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return { data, error: null };
    } else {
      return { data: null, error: { message: 'Document does not exist' } };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    const errorMessage = handleFirestoreError(error);
    return { data: null, error: { message: errorMessage } };
  }
};

// Generic function to query documents with various constraints
export const queryDocuments = async (collectionName, constraints = []) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Using mock database.');
      
      // Return mock data based on collection
      if (collectionName === 'inventory') {
        // Very simple filtering for development
        let filteredData = [...mockInventoryData];
        
        for (const constraint of constraints) {
          if (constraint?.type === 'where' && constraint.field === 'sharingAvailable') {
            filteredData = filteredData.filter(item => item.sharingAvailable === constraint.opStr);
          }
        }
        
        return { data: filteredData, error: null };
      } else if (collectionName === 'waste') {
        return { data: mockWasteData, error: null };
      }
      
      return { data: [], error: null };
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
    
    return { data: results, error: null };
  } catch (error) {
    console.error('Error querying documents:', error);
    const errorMessage = handleFirestoreError(error);
    return { data: [], error: { message: errorMessage } };
  }
};

// Helper function to convert JS Date to Firestore Timestamp
export const dateToTimestamp = (date) => {
  return Timestamp.fromDate(date);
};

// Helper function to convert Firestore Timestamp to JS Date
export const timestampToDate = (timestamp) => {
  return timestamp.toDate();
};

// Export Firestore query methods for use in components
export { where, orderBy, limit };