'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Initialize the modern SSR browser client
const database = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // View states: 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState('signin'); 
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Synchronize state based on URL search query parameters (?view=signup)
  useEffect(() => {
    const urlView = searchParams.get('view');
    if (urlView === 'signup') {
      setView('signup');
    } else if (urlView === 'forgot') {
      setView('forgot');
    } else {
      setView('signin');
    }
  }, [searchParams]);

  const handleViewSwitch = (newView: 'signup' | 'signin' | 'forgot') => {
    setStatusMessage('');
    setEmailSent(false);
    router.push(`${window.location.pathname}?view=${newView}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();

    // 1. FORGOT PASSWORD VIEW HANDLING
    if (view === 'forgot') {
      try {
        const { error } = await database.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        });

        if (error) throw error;
        setEmailSent(true);
        setStatusMessage('✉️ Reset link sent! Check your inbox.');
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Error: ${err.message || 'Could not send reset link.'}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. SIGN UP VIEW HANDLING
    if (view === 'signup') {
      const cleanHandle = username.trim().toLowerCase().replace(/\s+/g, '');
      
      if (password !== confirmPassword) {
        setLoading(false);
        setIsError(true);
        setStatusMessage('❌ Passwords do not match!');
        return;
      }

      try {
        const { data: existingUser } = await database
          .from('profiles')
          .select('username')
          .eq('username', cleanHandle)
          .maybeSingle();

        if (existingUser) {
          setLoading(false);
          setIsError(true);
          setStatusMessage(`❌ The handle @${cleanHandle} is already taken!`);
          return;
        }

        const { error } = await database.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: { username: cleanHandle }
          },
        });

        if (error) throw error;
        setEmailSent(true);
        
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Registration Error: ${err.message || 'Could not create account.'}`);
      } finally {
        setLoading(false);
      }
    } else {
      // 3. SIGN IN VIEW HANDLING
      try {
        const { data, error } = await database.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) throw error;

        const { data: profile } = await database
          .from('profiles')
          .select('onboarded')
          .eq('id', data.user?.id)
          .maybeSingle();

        if (profile?.onboarded) {
          router.push('/feed');
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Login Failed: ${err.message || 'Invalid credentials.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}>
        
        {emailSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '54px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 12px 0' }}>Check Your Email</h2>
            <p style={{ color: '#555555', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              We sent a validation link to <strong>{email}</strong>. Follow the link to access your profile settings.
            </p>
            <button type="button" onClick={() => handleViewSwitch('signin')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Back to Sign In</button>
          </div>
        ) : (
          <>
            <header style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Producer Saab</h1>
              <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>
                {view === 'signup' && "Join Producer Saab now — it's free!"}
                {view === 'signin' && "Access your workstation studio suite"}
                {view === 'forgot' && "Recover your password credentials"}
              </p>
            </header>

            {statusMessage && (
              <div style={{ backgroundColor: isError ? '#FDF2F2' : '#FAF6F0', border: '1px solid', borderColor: isError ? '#F8B4B4' : '#C5A880', color: isError ? '#9B1C1C' : '#A3855C', padding: '14px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontWeight: '600' }}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* USERNAME INPUT (Only on Sign Up) */}
              {view === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Create Unique Handle Username</label>
                  <input type="text" placeholder="e.g., n_thakur" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
                </div>
              )}

              {/* EMAIL INPUT (Always required) */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Email Address</label>
                <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
              </div>

              {/* PASSWORD INPUT (Only on Sign In / Sign Up) */}
              {view !== 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555' }}>Password</label>
                    
                    {/* NEW FORGOT PASSWORD ACTION BRIDGE */}
                    {view === 'signin' && (
                      <button type="button" onClick={() => handleViewSwitch('forgot')} style={{ background: 'none', border: 'none', color: '#C5A880', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold' }}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              )}

              {/* CONFIRM PASSWORD INPUT (Only on Sign Up) */}
              {view === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Confirm Password</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold' }}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                {loading ? 'Processing...' : view === 'signup' ? 'Agree & Join' : view === 'signin' ? 'Sign In to Studio' : 'Send Recovery Link'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#777777', fontSize: '13px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
              <span style={{ padding: '0 16px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
            </div>

            <button type="button" style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', color: '#444444', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Continue with Google</button>

            <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
              {view === 'signin' ? (
                <span>New to the community? <button type="button" onClick={() => handleViewSwitch('signup')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>Join now</button></span>
              ) : (
                <span>Already a member? <button type="button" onClick={() => handleViewSwitch('signin')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>Sign in to Studio</button></span>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading Studio Suite...</div>}>
      <AuthFormContent />
    </Suspense>
  );
}
