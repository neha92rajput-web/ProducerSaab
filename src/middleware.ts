import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Check for an active login session session
  const { data: { session } } = await supabase.auth.getSession();

  // 2. If trying to hit dashboard pages WITHOUT being logged in...
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // CHANGE THIS LINE: Change the redirect from '/' to '/signin'
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
