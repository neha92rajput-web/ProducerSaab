'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the Auth User
      const { data: authData, error: authError } = await database.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });

      if (authError) throw authError;

      // 2. Create the initial Profile record
      if (authData.user) {
        const { error: profileError } = await database
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username.toLowerCase(),
          });

        if (profileError) throw profileError;

        // 3. Redirect to the Onboarding sequence
        router.push('/onboarding');
      }
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-black">
      <form onSubmit={handleSignup} className="bg-white border border-[#E3DEC1] rounded-[2rem] p-8 w-full max-w-sm shadow-xl space-y-4">
        <h2 className="text-xl font-black uppercase tracking-widest mb-6">Join The Community</h2>
        
        <input 
          type="text" placeholder="Username" required 
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm font-semibold" 
        />
        <input 
          type="email" placeholder="Email Address" required 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm font-semibold" 
        />
        <input 
          type="password" placeholder="Secure Pass Key" required 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm font-semibold" 
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#4B3B2F] transition"
        >
          {loading ? "Syncing..." : "Authorize & Join"}
        </button>

        <div className="text-center pt-4">
          <Link href="/signin" className="text-[10px] font-bold text-[#A4927A] uppercase tracking-widest">
            Already have a studio? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
