'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has admin role
    const checkAuth = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
        return;
      }
      
      try {
        // Check if user has admin role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          // Not admin, redirect to user home
          router.push('/user/home');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
      <button 
        onClick={() => auth.signOut().then(() => router.push('/login'))}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}