import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth?view=signin`);
  }

  const cookieStore = cookies();

  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user) {
      console.error('Session exchange failed:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?view=signin`);
    }

    const user = data.user;

    const username =
      user.user_metadata?.username ||
      `user_${user.id.slice(0, 6)}`;

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email?.toLowerCase() || '',
        username: username.toLowerCase(),
        onboarded: false,
      });

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single();

    if (!profile?.onboarded) {
      return NextResponse.redirect(
        `${requestUrl.origin}/dashboard`
      );
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/feed`
    );
  } catch (err) {
    console.error(err);

    return NextResponse.redirect(
      `${requestUrl.origin}/auth?view=signin`
    );
  }
}
