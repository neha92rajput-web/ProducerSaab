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

  const [formData, setFormData] = useState({
    account_type: '🎹 Producer',
    software: '',
    primary_genre: '🎵 Trap',
    country: '',
    bio: ''
  });

  const completeOnboarding = async () => {
    const { data: { user } } = await database.auth.getUser();
    if (!user) return router.push('/signin');

    const { error } = await database
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    if (error) return alert("Update failed: " + error.message);
    router.push('/studio');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-black">
      <div className="bg-white border border-[#E3DEC1] rounded-[2rem] p-8 w-full max-w-md shadow-xl text-left">
        <h2 className="text-2xl font-black mb-1">Set Your Profile</h2>
        <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-wider">Configure your studio identity</p>

        <div className="space-y-4">
          <select onChange={(e) => setFormData({...formData, account_type: e.target.value})} className="w-full p-3 border rounded-xl font-bold text-sm">
            <option>🎹 Producer</option><option>🎤 Artist / Singer</option>
            <option>✍️ Songwriter</option><option>🎚️ Engineer</option>
          </select>
          
          <input placeholder="DAW (e.g. Logic, FL, Ableton)" onChange={(e) => setFormData({...formData, software: e.target.value})} className="w-full p-3 border rounded-xl text-sm font-semibold" />
          
          <select onChange={(e) => setFormData({...formData, primary_genre: e.target.value})} className="w-full p-3 border rounded-xl font-bold text-sm">
            <option>🎵 Trap</option><option>🎹 Hip Hop</option><option>✨ Lo-Fi</option><option>R&B</option>
          </select>

          <input placeholder="Location (e.g. India)" onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full p-3 border rounded-xl text-sm font-semibold" />
          
          <textarea placeholder="Tell the community about your style..." onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-3 border rounded-xl text-sm font-semibold resize-none" rows={3} />

          <button onClick={completeOnboarding} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#4B3B2F] transition">
            Finalize Community Sync →
          </button>
        </div>
      </div>
    </div>
  );
}
