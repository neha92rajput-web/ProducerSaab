import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // 1. Grab the single-use verification code Supabase attached to the email link
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 2. Exchange that code for a secure, permanent login session cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 3. Automatically redirect the user into your main dashboard portal!
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
