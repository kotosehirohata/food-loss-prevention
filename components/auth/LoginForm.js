'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getUserRole } from '@/lib/firebase/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { user, error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Get user role and redirect accordingly
    const { role, error: roleError } = await getUserRole(user.uid);
    
    if (roleError) {
      setError('Error getting user role. Please try again.');
      setLoading(false);
      return;
    }

    // Redirect based on role
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/home');
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Log In</h2>
      
      {error && (
        <div className="bg-red-100 p-3 mb-4 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}