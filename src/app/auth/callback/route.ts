import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // Supabase sends either a raw 'code' or a secure 'token_hash'
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type'); // 'signup' or 'recovery'
  const next = searchParams.get('next') || '/dashboard';

  const cookieStore = cookies();

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

  // 1. HANDLE STANDARD CODE EXCHANGE (Like Google OAuth or standard Signups)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 2. HANDLE EMAIL LINKS (Signups, Magic Links, and PASSWORD RECOVERY)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash: tokenHash,
    });

    if (!error) {
      // IF THIS IS A PASSWORD RESET: Route them to a page where they can type a new password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/dashboard?action=reset-password`);
      }
      
      // Otherwise, carry on to the dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // IF SYSTEM FAILS: Emergency bounce back to signin with an error flag
  return NextResponse.redirect(`${origin}/signin?error=auth-callback-failed`);
}
