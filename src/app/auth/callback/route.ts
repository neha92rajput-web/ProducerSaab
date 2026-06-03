import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Extract the verification token code sent from the email link click
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    // Initialize server-side database client to verify token exchange natively
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the one-time code for an authentic user session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Once securely verified, seamlessly route the user right into the dashboard profile workspace!
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
