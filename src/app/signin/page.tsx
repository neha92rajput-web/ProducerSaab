'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params safely inside the suspense window
  useEffect(() => {
    if (searchParams.get('view') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username.toLowerCase().trim(),
            display_name: username,
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        alert('Check your email inbox to verify your network handle profile!');
        router.push('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="font-sans font-black tracking-widest text-xl uppercase inline-block">
          <span className="text-2xl font-light tracking-tighter text-neutral-500 mr-0.5">川</span> SAAB
        </Link>
        <h2 className="text-2xl font-serif font-black tracking-tight text-neutral-900">
          {isSignUp ? 'Establish your music handle' : 'Sign in to your Dashboard'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#EAE6DA] rounded-3xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            
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

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition"
              />
            </div>

            {errorMsg && <p className="text-xs font-semibold text-red-500">{errorMsg}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#1E1E1E] hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'Connecting...' : isSignUp ? 'Create Profile Handle' : 'Sign in to Studio'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-neutral-500 hover:text-black transition"
            >
              {isSignUp ? 'Already registered? Sign in here' : 'New to SAAB? Join the community network'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap inside a Suspense boundary to cleanly pass NextJS static analysis builds
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
