'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize the real-data production database client securely
// Next.js automatically pulls these parameters straight from your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthPage() {
  const router = useRouter();
  
  // UI View States: 'signup' (Join the Community) or 'signin' (Sign in to Studio)
  const [view, setView] = useState('signup');
  
  // Form Inputs State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status Handling
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    // 1. Password Confirmation Check
    if (view === 'signup' && password !== confirmPassword) {
      setLoading(false);
      setIsError(true);
      setStatusMessage('❌ Passwords do not match! Please re-verify.');
      return;
    }

    try {
      if (view === 'signup') {
        // 2. Real-Data Signup: Instructs database to register user & fire the confirmation email
        const { data, error } = await database.auth.signUp({
          email: email,
          password: password,
          options: {
            // Tells database where to redirect the user after they click the verification link in their email
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        // Success state: Real account created, awaiting user link validation
        setIsError(false);
        setStatusMessage('✉️ A one-time confirmation link has been sent to your email! Please check your inbox to verify your new account.');
        
        // Reset input fields cleanly
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // 3. Real-Data Sign In
        const { data, error } = await database.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Signed in cleanly with real credentials -> Enter Studio Workspace
        router.push('/dashboard');
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`❌ Authentication Error: ${err.message || 'Action failed'}`);
    } finally {
      setLoading(false);
    }
  }

  // Handle OAuth provider flows (Google & Apple) securely with live accounts
  async function handleSocialLogin(providerName: 'google' | 'apple') {
    setLoading(true);
    setStatusMessage(`Connecting to ${providerName}...`);
    try {
      const { error } = await database.auth.signInWithOAuth({
        provider: providerName,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`❌ Social connection failed: ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Producer Saab</h1>
          <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>
            {view === 'signup' ? "Join Producer Saab now — it's free!" : 'Access your workstation suite'}
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
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Email Address</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={function(e) { setEmail(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={function(e) { setPassword(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
          </div>

          {view === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Reconfirm Password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={function(e) { setConfirmPassword(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {loading ? 'Connecting Node...' : view === 'signup' ? 'Agree & Join' : 'Sign In to Studio'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#777777', fontSize: '13px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
          <span style={{ padding: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button type="button" disabled={loading} onClick={function() { handleSocialLogin('google'); }} style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', color: '#444444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.292 1.694 15.486 1 12.24 1M24 12.25c0-.825-.075-1.636-.214-2.429H12.24v4.607h6.6c-.286 1.532-1.147 2.825-2.44 3.693L20.01 21.2C22.34 19.05 24 15.943 24 12.25" />
            </svg>
            Continue with Google
          </button>

          <button type="button" disabled={loading} onClick={function() { handleSocialLogin('apple'); }} style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', color: '#444444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxSizing: 'border-box' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
          {view === 'signup' ? (
            <span>
              New on Producer Saab?{' '}
              <button type="button" onClick={function() { setView('signin'); setStatusMessage(''); }} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Sign in to Studio</button>
            </span>
          ) : (
            <span>
              Ready to claim your handle?{' '}
              <button type="button" onClick={function() { setView('signup'); setStatusMessage(''); }} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Join now</button>
            </span>
          )}
        </footer>

      </div>
    </div>
  );
}
