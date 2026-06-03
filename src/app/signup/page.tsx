'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = username.trim().toLowerCase().replace(/\s+/g, '');

    if (password !== confirmPassword) {
      setLoading(false);
      setIsError(true);
      setStatusMessage('❌ Passwords do not match!');
      return;
    }

    try {
      // Check profiles to reject duplicate username right away
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

      // Register into auth metadata
      const { error } = await database.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username: cleanHandle }
        },
      });

      if (error) throw error;

      setIsError(false);
      setStatusMessage('✉️ Verification link sent! Check your email inbox to activate your account.');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`❌ Error: ${err.message || 'Registration failed.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Producer Saab</h1>
          <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Join Producer Saab now — it's free!</p>
        </header>

        {statusMessage && (
          <div style={{ backgroundColor: isError ? '#FDF2F2' : '#FAF6F0', border: '1px solid', borderColor: isError ? '#F8B4B4' : '#C5A880', color: isError ? '#9B1C1C' : '#A3855C', padding: '14px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontWeight: '600' }}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Create Unique Handle Username</label>
            <input type="text" placeholder="e.g., n_thakur" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Email Address</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Reconfirm Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '14px 60px 14px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#C5A880', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Agree & Join'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#777777', fontSize: '13px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
          <span style={{ padding: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E2D9' }} />
        </div>

        <button type="button" style={{ width: '100%', padding: '12px 16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', color: '#444444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>Continue with Google</button>

        <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
          Already a member? <button type="button" onClick={() => router.push('/signin')} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Sign in to Studio</button>
        </footer>
      </div>
    </div>
  );
}
