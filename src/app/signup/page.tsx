'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthPage() {
  const router = useRouter();
  
  // State to track if we should show 'signup' (Join the Community) or 'signin' (Sign in to Studio)
  const [view, setView] = useState('signup'); 
  
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Hook to watch the URL and switch layouts cleanly if it detects ?view=signup or ?view=signin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView === 'signin') {
        setView('signin');
      } else if (urlView === 'signup') {
        setView('signup');
      }
    }
  }, []);

  // Update the URL parameters visually without refreshing the browser page
  const handleViewSwitch = (newView: 'signup' | 'signin') => {
    setView(newView);
    setStatusMessage('');
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?view=${newView}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = username.trim().toLowerCase().replace(/\s+/g, '');

    if (view === 'signup') {
      if (!cleanHandle) {
        setLoading(false);
        setIsError(true);
        setStatusMessage('❌ Please create a username handle identity to join.');
        return;
      }

      if (password !== confirmPassword) {
        setLoading(false);
        setIsError(true);
        setStatusMessage('❌ Passwords do not match! Please re-verify.');
        return;
      }

      try {
        // 1. Check for duplicate username handle right away
        const { data: existingUserByHandle } = await database
          .from('profiles') 
          .select('username')
          .eq('username', cleanHandle)
          .maybeSingle();

        if (existingUserByHandle) {
          setLoading(false);
          setIsError(true);
          setStatusMessage(`❌ The handle @${cleanHandle} is already taken!`);
          return;
        }

        // 2. Register user purely into Auth system with username data attached
        const { error } = await database.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: cleanHandle,
            }
          },
        });

        if (error) throw error;

        setIsError(false);
        setStatusMessage('✉️ A validation link has been sent to your email address! Please confirm it to initialize your studio profile.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Registration Error: ${err.message || 'Action failed'}`);
      } finally {
        setLoading(false);
      }

    } else {
      // Sign In Flow Processing
      try {
        const { error } = await database.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) throw error;
        router.push('/dashboard');
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Login Failed: ${err.message || 'Invalid email or password parameters'}`);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* PERFECT CONSTRAINED CENTERED AUTH CARD */}
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Producer Saab</h1>
          <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>
            {view === 'signup' ? "Join Producer Saab now — it's free!" : 'Access your workstation studio suite'}
          </p>
        </header>

        {statusMessage && (
          <div style={{ 
            backgroundColor: isError ? '#FDF2F2' : '#FAF6F0', 
            border: '1px solid', 
            borderColor: isError ? '#F8B4B4' : '#C5A880', 
            color: isError ? '#9B1C1C' : '#A3855C', 
            padding: '14px', 
            borderRadius: '12px', 
            fontSize: '13px', 
            textAlign: 'center', 
            marginBottom: '24px', 
            fontWeight: '600',
            lineHeight: '1.5'
          }}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* USERNAME IDENTITY INPUT - Shows up strictly when view is 'signup' */}
          {view === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Create Unique Handle Username</label>
              <input 
                type="text" 
                placeholder="e.g., n_thakur" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} 
                required 
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Email Address</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* RECONFIRM PASSWORD INPUT - Shows up strictly when view is 'signup' */}
          {view === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Reconfirm Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Processing...' : view === 'signup' ? 'Agree & Join' : 'Sign In to Studio'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#777777', fontSize: '13px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
          <span style={{ padding: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button type="button" style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', color: '#444444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
            Continue with Google
          </button>
        </div>

        {/* FOOTER VIEW TOGGLE */}
        <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
          {view === 'signup' ? (
            <span>
              Already a member?{' '}
              <button type="button" onClick={() => handleViewSwitch('signin')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Sign in to Studio</button>
            </span>
          ) : (
            <span>
              New to the community?{' '}
              <button type="button" onClick={() => handleViewSwitch('signup')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Join now</button>
            </span>
          )}
        </footer>

      </div>
    </div>
  );
}
