'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Clean up the handle formatting (removes '@' if they typed it)
    const cleanHandle = handle.replace('@', '').trim().toLowerCase();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // This saves their custom music handle directly into their user account metadata
          data: { 
            username: cleanHandle 
          },
          // This tells Supabase to send the user to our hidden bridge file when they click the email link
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setStatus({ type: 'error', message: error.message });
      } else {
        setStatus({ 
          type: 'success', 
          message: '✨ Access Link Sent! Please check your email inbox to verify your account.' 
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected connection error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '40px', borderRadius: '24px', border: '1px solid #eaeaea', width: '100%', maxWidth: '420px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Producer Saab</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Establish your music handle</p>
        </div>

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#111', letterSpacing: '0.5px' }}>
              Unique Handle (@username)
            </label>
            <input 
              type="text" 
              placeholder="nthakur" 
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: '#111', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="neha92rajput@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          {status && (
            <div style={{ 
              padding: '14px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', textAlign: 'center', fontWeight: '500',
              backgroundColor: status.type === 'error' ? '#fff1f2' : '#f0fdf4',
              color: status.type === 'error' ? '#e11d48' : '#16a34a',
              border: `1px solid ${status.type === 'error' ? '#fecdd3' : '#bbf7d0'}`
            }}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : 'Send Access Handle Link'}
          </button>
        </form>

      </div>
    </div>
  );
}
