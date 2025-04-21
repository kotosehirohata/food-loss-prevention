'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/home');
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to My App</h1>
      <p className="mb-8">Please log in or sign up to continue</p>
      
      <div className="space-x-4">
        <Link href="/login">
          <span className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Log In
          </span>
        </Link>
        <Link href="/signup">
          <span className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600">
            Sign Up
          </span>
        </Link>
      </div>
    </div>
  );
}