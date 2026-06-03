'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  
  // UI Toggle: 'signin' or 'signup'
  const [view, setView] = useState('signin');
  
  // Form Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Status Handling
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    // Simulated Authentication Loop (Bypassing heavy email loops for instant access)
    setTimeout(function() {
      setLoading(false);
      if (view === 'signup') {
        setMessage('🎉 Account created successfully! Switching to Sign In...');
        setTimeout(function() {
          setView('signin');
          setMessage('');
        }, 1500);
      } else {
        // Sign In Success -> Push directly to the LinkedIn-style Studio Hub!
        router.push('/dashboard');
      }
    }, 1200);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Producer Saab</h1>
          <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>
            {view === 'signup' ? 'Create your custom studio credentials' : 'Access your workstation suite'}
          </p>
        </header>

        {message && (
          <div style={{ backgroundColor: '#FAF6F0', border: '1px solid #C5A880', color: '#A3855C', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {view === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Unique Handle (@username)</label>
              <input type="text" placeholder="e.g., chaotic_stone" value={username} onChange={function(e) { setUsername(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Email Address</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={function(e) { setEmail(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px', letterSpacing: '0.05em' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={function(e) { setPassword(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {loading ? 'Securing Connection...' : view === 'signup' ? 'Establish Studio Profile' : 'Sign In to Workstation'}
          </button>
        </form>

        <footer style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
          {view === 'signup' ? (
            <span>
              Already a member?{' '}
              <button onClick={function() { setView('signin'); }} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Sign In</button>
            </span>
          ) : (
            <span>
              New to the community?{' '}
              <button onClick={function() { setView('signup'); }} style={{ background: 'none', border: 'none', color: '#C5A880', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Join Now</button>
            </span>
          )}
        </footer>

      </div>
    </div>
  );
}
