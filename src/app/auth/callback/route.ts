import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // 1. Extract the target parameter we appended from the login screen (defaults to /dashboard)
  const nextTarget = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 2. Exchange the one-time secure email token code for an active user login session
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // 3. Provision their profile setup row if they are a brand new registrant
    if (data?.user) {
      const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
      const metadataEmail = data.user.email || '';
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: metadataUsername.toLowerCase().trim(),
        email: metadataEmail.toLowerCase().trim(),
        onboarded: false // Keeps them flagged for the profile completion setup card
      });
    }
  }

  // 4. DYNAMIC REDIRECT: Maps them directly to whatever domain or branch URL they are visiting from!
  return NextResponse.redirect(`${requestUrl.origin}${nextTarget}`);
}
