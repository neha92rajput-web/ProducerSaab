import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // Grab the single-use token sent by Supabase to the email inbox
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a permanent browser login session cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect the newly logged-in user straight to your dashboard layout
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
