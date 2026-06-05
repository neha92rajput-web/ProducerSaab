'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await database.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); setLoading(false); return; }
    router.push('/studio');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <form onSubmit={handleSignin} className="w-full max-w-sm bg-white p-8 rounded-3xl border border-[#E3DEC1] shadow-sm space-y-6">
        <h1 className="font-serif italic font-black text-xl text-[#191919]">PRODUCER SAAB</h1>
        
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm focus:outline-none focus:border-[#191919]" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm focus:outline-none focus:border-[#191919]" 
        />
        
        <button 
          disabled={loading} 
          className="w-full bg-[#4B3B2F] text-white py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#191919] transition"
        >
          {loading ? 'Entering...' : 'Enter Studio'}
        </button>

        {/* Link to Join the Community */}
        <div className="text-center pt-2">
          <span className="text-[10px] uppercase text-[#A4927A]">
            New here? 
            <a href="/signup" className="font-black text-[#191919] ml-1 hover:underline">
              Join the Community
            </a>
          </span>
        </div>
      </form>
    </div>
  );
}
