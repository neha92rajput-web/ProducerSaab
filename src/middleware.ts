import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create an initial response object to carry headers forward
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Instantiate the Supabase client specifically for Server Middleware cookie tracking
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh the session cookie automatically if it is expired
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // ROUTING PROTECTION RULE: 
  // If a logged-out user tries to access /dashboard, instantly bounce them to /signin
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  // OPTIONAL BONUS RULE: 
  // If a user is ALREADY logged in and goes to /signin, carry them straight into the dashboard
  if (user && url.pathname.startsWith('/signin')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

// Ensure the middleware runs on all paths EXCEPT static files, images, and the auth callback line
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.).*)',
  ],
};
