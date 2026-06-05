'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true } }
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      
      setProfile(p || { display_name: 'Studio User', username: 'producer', headline: 'Professional Audio Designer.' });
      setMySounds(s || []);
      setLoading(false);
    }
    loadData();
  }, [router]);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans">
      <div className="max-w-[1440px] mx-auto flex">
        
        {/* LEFT NAV SIDEBAR */}
        <aside className="w-64 border-r border-[#E3DEC1] p-8 hidden md:block space-y-10">
          <h1 className="font-serif italic font-black text-lg text-[#211913]">PRODUCER SAAB</h1>
          <nav className="space-y-4">
            <button className="w-full text-left text-xs font-black uppercase text-[#211913]">🏠 Home</button>
            <button className="w-full text-left text-xs font-bold text-gray-400 hover:text-[#211913]">🔍 Explore</button>
          </nav>
          <div className="bg-[#2C251E] text-white p-6 rounded-3xl">
            <h3 className="text-[10px] font-black uppercase mb-4">Studio Actions</h3>
            <button className="w-full bg-[#EFECE3] text-[#2C251E] font-bold text-xs py-3 rounded-xl mb-3">🎵 Bounce Track</button>
            <button className="w-full border border-white/20 text-white font-bold text-xs py-3 rounded-xl">✍️ Log Thought</button>
          </div>
        </aside>

        {/* MAIN HUB */}
        <main className="flex-1">
          {/* FIXED HEIGHT BANNER */}
          <div className="w-full h-[280px] bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98]" />
          
          <div className="px-10 pb-10">
            <div className="relative -top-16 flex items-end gap-6">
              <div className="w-32 h-32 bg-[#191919] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl italic font-serif">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="mb-4">
                <h2 className="text-2xl font-black font-serif">@{profile.username}</h2>
                <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest">Music Producer • Verified</p>
              </div>
            </div>

            {/* TRACKS GRID */}
            <h3 className="font-bold text-sm mb-6">Latest Catalog Tracks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySounds.map(track => (
                <div key={track.id} className="bg-white border border-[#E3DEC1] p-4 rounded-2xl flex items-center gap-4 hover:border-gray-300 transition">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xs font-black">▶</div>
                  <div>
                    <h4 className="font-bold text-sm">{track.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase">{track.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
