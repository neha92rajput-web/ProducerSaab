import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // FIX: Look for the '?next=' parameter we sent from the sign-up page, default to /dashboard if empty
  const nextTarget = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 1. Exchange the one-time email token for an active user session login
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // 2. Generate their profile workspace row if they are brand new
    if (data?.user) {
      const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
      const metadataEmail = data.user.email || '';
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: metadataUsername.toLowerCase().trim(),
        email: metadataEmail.toLowerCase().trim(),
        onboarded: false // Keeps them flagged for the profile setup wizard card
      });
    }
  }

  // 3. DYNAMIC REDIRECT: Safely routes them to the exact nextTarget path requested!
  return NextResponse.redirect(`${requestUrl.origin}${nextTarget}`);
}
