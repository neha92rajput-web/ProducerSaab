'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const roles = ['Producer', 'Artist', 'Songwriter', 'Engineer', 'Musician', 'DJ', 'Fan/Listener'];
  const countries = ['India', 'USA', 'UK', 'Canada', 'Italy', 'Other']; // Add your list here

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType || !country) {
      alert("Please choose both your role and country.");
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await database.auth.signUp({
      email, password, options: { data: { username } }
    });

    if (authError) { alert(authError.message); setLoading(false); return; }

    if (authData.user) {
      await database.from('profiles').insert([
        { id: authData.user.id, username, account_type: accountType, country }
      ]);
      router.push('/studio');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-6">
        <h1 className="font-serif italic font-black text-2xl text-[#191919]">JOIN THE COMMUNITY</h1>
        
        <input required placeholder="Username" onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm" />
        <input required type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm" />
        <input required type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm" />

        {/* Country Select */}
        <select required onChange={(e) => setCountry(e.target.value)} className="w-full p-3 border border-[#E3DEC1] rounded-full text-sm text-gray-500 bg-white">
          <option value="">Select Country</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Role Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#A4927A]">Choose your role (Mandatory)</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setAccountType(role)}
                className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest border rounded-full transition ${
                  accountType === role ? 'bg-[#191919] text-white' : 'bg-transparent border-[#E3DEC1]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <button disabled={loading} className="w-full bg-[#191919] text-white py-3 rounded-full font-black text-xs uppercase tracking-widest">
          {loading ? 'Joining...' : 'Join the Community'}
        </button>
      </form>
    </div>
  );
}
