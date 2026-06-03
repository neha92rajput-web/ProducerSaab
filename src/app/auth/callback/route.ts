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
    
    // 1. Exchange code for a live authentication session
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (data?.user) {
      // 2. Fetch the user's current profile onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', data.user.id)
        .maybeSingle(); // Prevents throwing errors if the profile row is still provisioning

      // 3. INTELLIGENT ROUTING: 
      // If they haven't finished setting up their profile data, send them to the dashboard wizard
      if (!profile || profile.onboarded === false) {
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
      
      // If they are an existing, fully set-up user, send them directly to your main activity feed!
      return NextResponse.redirect(`${requestUrl.origin}/feed`);
    }
  }

  // Fallback safe redirect if something goes wrong with the code processing token loop
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
