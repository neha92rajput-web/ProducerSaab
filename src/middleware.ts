import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();
  const isAuthPage = url.pathname === '/' || url.pathname.startsWith('/signin') || url.pathname.startsWith('/signup');
  const isOnboardingPage = url.pathname.startsWith('/onboarding');
  const isDashboardPage = url.pathname.startsWith('/dashboard');

  // Case 1: Unauthenticated user trying to access secure pages
  if (!session) {
    if (isDashboardPage || isOnboardingPage) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Fetch user profile status from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single();

  // Case 2: Authenticated user but no profile created yet
  if (session && !profile) {
    if (!isOnboardingPage) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Case 3: Authenticated user with a complete profile
  if (session && profile) {
    if (isAuthPage || isOnboardingPage) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/signin', '/signup', '/onboarding/:path*', '/dashboard/:path*'],
};
