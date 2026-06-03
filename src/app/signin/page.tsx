'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  // Explicitly listen to URL query changes to force view switches dynamically
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
    // Clear out residual alerts on toggle
    setErrorMsg('');
    setMessage('');
  }, [searchParams]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: isSignUp ? {
            username: username.toLowerCase().trim(),
            display_name: username,
          } : undefined
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage('✨ Verification link dispatched! Check your email inbox to verify your profile handle.');
      }
    } catch (err) {
      setErrorMsg('Network bridge failed. Ensure your connection configuration is live.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="font-sans font-black tracking-widest text-xl inline-block text-neutral-900">
          <span className="text-2xl font-light tracking-tighter text-neutral-500 mr-1">川</span> Producer Saab
        </Link>
        <h2 className="text-2xl font-serif font-black tracking-tight text-neutral-900">
          {isSignUp ? 'Establish your music handle' : 'Sign in to your Studio'}
        </h2>
        <p className="text-xs font-medium text-neutral-400">
          Passwordless Verification • Direct via Email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#EAE6DA] rounded-3xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleMagicLink} className="space-y-4">
            
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Unique Handle (@username)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. metroboomin" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="producer@studio.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl text-center">
                ⚠️ {errorMsg}
              </p>
            )}

            {message && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl text-center">
                {message}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#1E1E1E] hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'Dispatched Notification...' : isSignUp ? 'Send Access Handle Link' : 'Sign in to your Studio'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setMessage('');
              }}
              className="text-xs font-bold text-neutral-500 hover:text-black transition"
            >
              {isSignUp ? 'Already registered? Sign in here' : 'New to Producer Saab? Join the community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInGate() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-xs font-bold text-neutral-400 tracking-widest uppercase">
        Loading Portal...
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
