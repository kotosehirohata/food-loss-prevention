// app/layout.js - Updated version

import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/lib/context/AuthContext';
import { NotificationProvider } from '@/components/context/NotificationContext';

export const metadata = {
  title: 'Food Loss Prevention System',
  description: 'AI-driven food loss prevention system for restaurants',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}