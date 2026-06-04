import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // Capturing the codes and state flags sent by Supabase
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type'); // Will be 'signup' or 'recovery'
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

  // 1. HANDLE STANDARD AUTH CODE EXCHANGES (OAuth / Google Login)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 2. HANDLE SECURE HASH VERIFICATION (Email Confirmations & Password Resets)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash: tokenHash,
    });

    if (!error) {
      // If a user is resetting their password, route them straight to the new update form
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }
      
      // If a user is signing up for the first time, route them directly to build their LinkedIn-style profile card
      if (type === 'signup') {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      // Fallback redirection safety net
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 3. EMERGENCY ERROR CATCH
  return NextResponse.redirect(`${origin}/signin?error=auth-callback-failed`);
}
