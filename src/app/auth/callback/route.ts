import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Track our target directory location (defaults directly to your studio wizard)
  const nextTarget = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    
    // Create the modern official client that handles cookies seamlessly on custom domains
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

    try {
      // 1. Exchange token code for a rock-solid active session cookie
      const { data } = await supabase.auth.exchangeCodeForSession(code);
      
      // 2. Initialize their new database row safely
      if (data?.user) {
        const metadataUsername = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 5)}`;
        const metadataEmail = data.user.email || '';
        
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: metadataUsername.toLowerCase().trim(),
          email: metadataEmail.toLowerCase().trim(),
          onboarded: false // Flags them for your profile completion setup view
        });
      }
    } catch (err) {
      console.error('Session handshake failure:', err);
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=handshake_failed`);
    }
  }

  // 3. Dynamic Forwarding: Takes them directly to /dashboard beautifully!
  return NextResponse.redirect(`${requestUrl.origin}${nextTarget}`);
}
