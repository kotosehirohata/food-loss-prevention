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
  
  // Generic function to add a document to a collection
  export const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      console.error('Error adding document:', error);
      return { id: null, error };
    }
  };
  
  // Generic function to update a document
  export const updateDocument = async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error };
    }
  };
  
  // Generic function to delete a document
  export const deleteDocument = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error };
    }
  };
  
  // Generic function to get a single document
  export const getDocument = async (collectionName, id) => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        return { data, error: null };
      } else {
        return { data: null, error: new Error('Document does not exist') };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return { data: null, error };
    }
  };
  
  // Generic function to query documents with various constraints
  export const queryDocuments = async (collectionName, constraints = []) => {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      return { data: results, error: null };
    } catch (error) {
      console.error('Error querying documents:', error);
      return { data: [], error };
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