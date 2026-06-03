import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // 1. Grab the one-time secure 'code' parameter that Supabase sent in the link
  const code = requestUrl.searchParams.get('code');

  console.log('AUTH CALLBACK HIT - Processing Code Token...');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // 2. Exchange the temporary code for an active browser login session cookie
      const { data } = await supabase.auth.exchangeCodeForSession(code);
      
      // 3. If they are a new user, quickly provision their base profiles table row
      if (data?.user) {
        const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
        const metadataEmail = data.user.email || '';
        
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: metadataUsername.toLowerCase().trim(),
          email: metadataEmail.toLowerCase().trim(),
          onboarded: false // Keeps them flagged for Stage 2 (The Setup Wizard)
        });
        
        console.log('Session cookie saved & profile row initialized for user:', data.user.id);
      }
    } catch (error) {
      console.error('Database configuration error during session handshake:', error);
      // Fallback fallback: if database connection breaks, drop them to root to avoid an infinite loop
      return NextResponse.redirect(`${requestUrl.origin}`);
    }
  }

  // 4. Drop the curtain and confidently route them straight into the profile setup page!
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
