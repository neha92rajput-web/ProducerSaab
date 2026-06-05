'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await database.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // THIS IS THE FIX: Redirecting to /studio instead of /dashboard
      router.replace('/studio');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-[#E3DEC1] shadow-sm">
        <h1 className="font-serif italic font-black text-xl mb-6">PRODUCER SAAB</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-[#FDFBF7] border border-[#E3DEC1] rounded-xl text-sm"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-[#FDFBF7] border border-[#E3DEC1] rounded-xl text-sm"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-[10px] font-bold">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4B3B2F] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition"
          >
            {loading ? 'Authenticating...' : 'Enter Studio'}
          </button>
        </form>
      </div>
    </div>
  );
}
