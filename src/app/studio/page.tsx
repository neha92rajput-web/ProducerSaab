'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);

      const { data: profile } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id);
      
      setProfile(profile || { display_name: 'Studio User' });
      setMySounds(sounds || []);
      setLoading(false);
    }
    loadData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center font-bold text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2D2621] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black italic font-serif">PRODUCER SAAB</h1>
          <div className="space-x-4">
            <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">Return Home</button>
            <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="px-6 py-2 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-widest">Disconnect</button>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* PROFILE CARD */}
          <div className="col-span-12 md:col-span-8 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-4 border-gray-100">
                {profile.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h2 className="text-3xl font-black">{profile.display_name}</h2>
                <p className="text-sm text-gray-500 font-medium">Independent Studio • Chandigarh, India</p>
              </div>
            </div>

            {/* TRACKS INDEX - USING THE CLEAN LIGHT STYLE */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Latest Catalog Tracks</h3>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase">+ Bounce Track</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySounds.map((track) => (
                  <div key={track.id} className="bg-[#FAF8F5] border border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:border-gray-300 transition">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">▶</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{track.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase">{track.genre} • {track.bpm} BPM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h4 className="font-bold mb-3">About Producer</h4>
              <p className="text-sm text-gray-600">{profile.headline || 'Try me at your own risk'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h4 className="font-bold mb-4">🔥 Trending Producers</h4>
              {/* Producer list here */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
