import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 1. Authenticate and confirm token validation code on the server side
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // 2. Profile Generation happens ONLY now after successful validation verification
    if (data?.user) {
      const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
      const metadataEmail = data.user.email || '';
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: metadataUsername.toLowerCase().trim(),
        email: metadataEmail.toLowerCase().trim(),
        onboarded: false // Flags them to fill out their trade options on the dashboard card
      });
    }
  }

  // Redirect to their studio space
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
