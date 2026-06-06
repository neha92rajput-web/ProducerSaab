'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SignInStudio() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // If a user with an active cookie navigates here manually, bounce them to studio
  useEffect(() => {
    async function verifyUser() {
      const { data: { user } } = await database.auth.getUser();
      if (user) {
        router.replace('/studio');
      }
    }
    verifyUser();
  }, [router]);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert("Please supply login string values.");

    setAuthLoading(true);

    try {
      if (isRegistering) {
        // Handle User Signup
        const { data: signUpData, error: signUpError } = await database.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/studio` }
        });

        if (signUpError) throw signUpError;

        // Auto-initialize profile record matching the user account
        if (signUpData?.user) {
          await database.from('profiles').insert({
            id: signUpData.user.id,
            username: email.split('@')[0],
            software: 'Logic Pro',
            country: 'India'
          });
        }
        
        alert("🎉 Production profile initialized! Logging you in...");
        
        // Handle automatic login transition path mapping
        const { error: signInError } = await database.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        router.replace('/studio');
      } else {
        // Handle Traditional Sign-in Check
        const { error: loginError } = await database.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        // PERMANENT FIX: Guarantees routing directly onto your new edit workspace layout
        router.replace('/studio');
      }
    } catch (error: any) {
      console.error("Studio Auth Pipeline Fault:", error);
      alert("❌ Identity Error:\n" + (error.message || "Credential matching processing timeout."));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-sm bg-white border border-[#E3DEC1] rounded-[2rem] p-8 shadow-xl relative">
        <div 
          onClick={() => router.push('/')} 
          className="absolute top-6 left-6 cursor-pointer text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest"
        >
          ← Home
        </div>

        <div className="text-center space-y-2 mb-8 pt-4">
          <div className="text-xl font-serif italic font-black">🎵 Producer Saab</div>
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-600">
            {isRegistering ? 'Initialize Workspace' : 'Sync Creator Core'}
          </h2>
        </div>

        <form onSubmit={handleAuthentication} className="space-y-4 text-xs font-bold text-gray-500">
          <div className="space-y-1.5">
            <label className="uppercase tracking-wider text-[10px] block">Studio Email Slot</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="producer@studio.com" 
              className="w-full p-3 border border-[#E3DEC1] rounded-xl text-black focus:outline-none font-semibold text-sm bg-gray-50/50" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase tracking-wider text-[10px] block">Secure Pass Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full p-3 border border-[#E3DEC1] rounded-xl text-black focus:outline-none font-mono text-sm bg-gray-50/50" 
            />
          </div>

          <button 
            type="submit" 
            disabled={authLoading} 
            className="w-full bg-[#111111] text-white py-3.5 rounded-xl uppercase font-black text-[9px] tracking-widest hover:bg-[#4B3B2F] transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {authLoading ? 'Validating Token Handshake...' : isRegistering ? 'Create New Workspace' : 'Authorize Sync Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-[10px] text-[#A4927A] hover:text-[#191919] font-black uppercase tracking-widest transition"
          >
            {isRegistering ? 'Already have a session? Log In' : "Don't have a studio workspace? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
