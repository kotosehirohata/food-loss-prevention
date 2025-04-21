import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  // You can only check for cookies/session in middleware
  // For Firebase auth, we'll need to implement client-side redirects
  // This middleware is mainly a placeholder for routes that need protection
  
  return NextResponse.next();
}

// Define which routes to run the middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*'
  ],
};