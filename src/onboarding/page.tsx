'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function OnboardingPage() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', username: '', 
    account_type: '🎹 Producer', software: '', primary_genre: '🎵 Trap', country: '', bio: ''
  });

  const handleCreateAccount = async () => {
    setLoading(true);
    const { data, error } = await database.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { username: formData.username } }
    });

    if (error) { setLoading(false); return alert(error.message); }
    if (data.user) {
      await database.from('profiles').insert({ id: data.user.id, username: formData.username });
      setStep(2);
    }
    setLoading(false);
  };

  const completeOnboarding = async () => {
    setLoading(true);
    const { data: { user } } = await database.auth.getUser();
    if (user) {
      await database.from('profiles').update({
        account_type: formData.account_type,
        software: formData.software,
        primary_genre: formData.primary_genre,
        country: formData.country,
        bio: formData.bio
      }).eq('id', user.id);
      router.push('/studio');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-black">
      <div className="bg-white border border-[#E3DEC1] rounded-[2rem] p-8 w-full max-w-sm shadow-xl">
        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest mb-4">Create Account</h2>
            <input placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
            <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
            <input type="password" placeholder="Pass Key" onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
            <button onClick={handleCreateAccount} disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-black uppercase text-xs">
              {loading ? "Syncing..." : "Continue to Profile"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest mb-4">Studio Setup</h2>
            <select onChange={(e) => setFormData({...formData, account_type: e.target.value})} className="w-full p-3 border rounded-xl text-sm font-bold">
              <option>🎹 Producer</option><option>🎤 Artist</option><option>🎚️ Engineer</option>
            </select>
            <input placeholder="DAW (e.g. FL Studio)" onChange={(e) => setFormData({...formData, software: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
            <button onClick={completeOnboarding} className="w-full bg-black text-white py-3 rounded-xl font-black uppercase text-xs">Finalize Studio Sync</button>
          </div>
        )}
      </div>
    </div>
  );
}
