'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuth } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuth((user) => {
      setUser(user);
      setLoading(false);

      // Handle redirects based on auth state
      if (user) {
        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        // If not on login page and no user, redirect to login
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};