'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  redirectTo = '/login' 
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requiredRole && role !== requiredRole) {
        // Redirect to appropriate page based on actual role
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/home');
        }
      }
    }
  }, [user, role, loading, requiredRole, redirectTo, router]);

  // Show loading state
  if (loading || !user || (requiredRole && role !== requiredRole)) {
    return <div>Loading...</div>;
  }

  // If we reach here, the user is authenticated and has the required role
  return children;
}