import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Look for the '?next=' parameter we sent from the sign-up page, default to /dashboard
  const nextTarget = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    
    // Create the modern official Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 1. Safely exchange the code token for a live browser session cookie
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // 2. Provision or check their profile database row status
    if (data?.user) {
      const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
      const metadataEmail = data.user.email || '';
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: metadataUsername.toLowerCase().trim(),
        email: metadataEmail.toLowerCase().trim(),
        onboarded: false // Keeps them flagged for your dashboard setup card wizard
      });
    }
  }

  // 3. DYNAMIC REDIRECT: Confidently takes them straight into your dashboard layout!
  return NextResponse.redirect(`${requestUrl.origin}${nextTarget}`);
}
