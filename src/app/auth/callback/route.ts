// Inside your tokenHash && type check block in route.ts:
if (tokenHash && type) {
  const { error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash: tokenHash,
  });

  if (!error) {
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/signin?type=recovery`);
    }
    
    // CRITICAL UPDATE: For new signups, send them directly to the Studio Setup Profile page
    if (type === 'signup') {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }
}
