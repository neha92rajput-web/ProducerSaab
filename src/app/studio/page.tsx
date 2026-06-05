'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function ArtistPortfolio() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      setProfile(p || { display_name: 'Studio User', headline: 'Professional Audio Designer.' });
      setMySounds(s || []);
    }
    fetchData();
  }, [router]);

  if (!profile) return <div className="min-h-screen bg-[#FDFBF7]" />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      {/* CINEMATIC HERO */}
      <div className="relative h-[60vh] w-full bg-[#D7C9B7] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent z-10" />
        
        {/* ACTION BUTTONS: INTEGRATED ELEGANTLY */}
        <div className="absolute top-8 right-8 z-20 flex gap-3">
          <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/20 transition">
            {isActionsOpen ? 'Close Console' : 'Studio Console'}
          </button>
        </div>

        {isActionsOpen && (
          <div className="absolute top-20 right-8 z-30 bg-[#FDFBF7] p-4 rounded-2xl shadow-2xl border border-[#E3DEC1] flex flex-col gap-2">
            <button className="px-6 py-2 text-xs font-bold uppercase text-[#4B3B2F] hover:bg-[#F6F3EC] rounded-lg">🎵 Bounce Track</button>
            <button className="px-6 py-2 text-xs font-bold uppercase text-[#4B3B2F] hover:bg-[#F6F3EC] rounded-lg">✍️ Log Thought</button>
          </div>
        )}
        
        {/* CENTERED IDENTITY */}
        <div className="absolute bottom-20 w-full flex flex-col items-center px-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#FDFBF7] shadow-xl bg-[#191919] flex items-center justify-center text-white text-3xl italic font-serif mb-6">
            {profile.display_name.charAt(0)}
          </div>
          <h1 className="text-4xl font-serif font-black italic">{profile.display_name}</h1>
          <p className="max-w-md text-center mt-4 text-sm opacity-70 font-medium">{profile.headline}</p>
        </div>
      </div>

      {/* CONTENT COLUMN */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-6">
          {mySounds.map((track) => (
            <div key={track.id} className="group flex items-center gap-6 py-6 border-b border-[#E3DEC1]">
              <div className="w-16 h-16 bg-[#D7C9B7] rounded-md shadow-sm" />
              <div className="flex-1">
                <h4 className="font-serif font-bold text-lg">{track.title}</h4>
                <p className="text-[10px] text-[#A4927A] mt-1 font-mono uppercase tracking-widest">{track.bpm} BPM • {track.genre}</p>
              </div>
              <button className="w-10 h-10 rounded-full border border-[#D7C9B7] flex items-center justify-center hover:border-[#191919] transition">▶</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
