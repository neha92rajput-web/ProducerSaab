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

  const [formData, setFormData] = useState({ account_type: 'Producer', software: '', primary_genre: 'Trap', country: '' });

  const completeOnboarding = async () => {
    const { data: { user } } = await database.auth.getUser();
    if (!user) return;

    await database.from('profiles').update(formData).eq('id', user.id);
    router.push('/studio');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="p-8 bg-white border border-[#E3DEC1] rounded-3xl w-full max-w-sm">
        <h2 className="text-xl font-black mb-6">Welcome to the Community</h2>
        <select onChange={(e) => setFormData({...formData, account_type: e.target.value})} className="w-full p-3 mb-4 border rounded-xl">
          <option>Producer</option><option>Artist</option><option>Engineer</option>
        </select>
        <input placeholder="DAW (e.g. Logic, FL)" onChange={(e) => setFormData({...formData, software: e.target.value})} className="w-full p-3 mb-4 border rounded-xl" />
        <button onClick={completeOnboarding} className="w-full bg-black text-white p-3 rounded-xl font-black">Complete Profile</button>
      </div>
    </div>
  );
}
