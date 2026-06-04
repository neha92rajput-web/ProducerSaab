'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function UpdatePasswordContent() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  // Security Check: Make sure the browser holds a valid recovery session from the email token
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsError(true);
        setMsg('❌ Reset link has expired or is invalid. Please request a new link from the sign-in page.');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMsg('❌ Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMsg('❌ Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setMsg('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setMsg('✅ Password updated successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setIsError(true);
      setMsg(`❌ Error: ${err.message || 'Could not update password.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>Set New Password</h1>
          <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Choose a secure new password for your studio suite.</p>
        </header>

        {msg && (
          <div style={{ backgroundColor: isError ? '#FDF2F2' : '#FAF6F0', border: '1px solid', borderColor: isError ? '#F8B4B4' : '#C5A880', color: isError ? '#9B1C1C' : '#A3855C', padding: '14px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontWeight: '600' }}>
            {msg}
          </div>
        )}

        {!isError && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Type New Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Reconfirm Password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Updating Credentials...' : 'Save Password & Log In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading Update Protocol...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
