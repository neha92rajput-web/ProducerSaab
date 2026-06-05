'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function ArtistPortfolio() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      
      setProfile(p || { display_name: 'Artist Name', headline: 'Crafting sonic landscapes.' });
      setMySounds(s || []);
    }
    fetchData();
  }, [router]);

  if (!profile) return <div className="min-h-screen bg-[#FDFBF7]" />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased selection:bg-[#D7C9B7]">
      
      {/* CINEMATIC HERO */}
      <div className="relative h-[70vh] w-full bg-[#E3DEC1] overflow-hidden">
        {/* Placeholder for Cinematic Studio Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/studio-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        
        {/* CENTERED PROFILE IDENTITY */}
        <div className="absolute bottom-0 w-full flex flex-col items-center pb-20 px-6">
          <div className="w-32 h-32 rounded-full border-4 border-[#FDFBF7] shadow-2xl bg-[#191919] flex items-center justify-center text-white text-4xl italic font-serif mb-6">
            {profile.display_name.charAt(0)}
          </div>
          <h1 className="text-5xl font-serif font-black italic tracking-tight">{profile.display_name} <span className="text-xl align-top text-[#D7C9B7]">✓</span></h1>
          <p className="text-xs uppercase tracking-[0.3em] text-[#A4927A] mt-4 font-bold">Music Producer • Chandigarh</p>
          <p className="max-w-md text-center mt-6 text-sm font-medium leading-relaxed opacity-90">{profile.headline}</p>
        </div>
      </div>

      {/* SINGLE COLUMN CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h3 className="text-xs font-black uppercase tracking-widest mb-12 text-[#4B3B2F] border-b border-[#E3DEC1] pb-4">
          Featured Audio Drops
        </h3>
        
        <div className="space-y-8">
          {mySounds.map((track) => (
            <div key={track.id} className="group flex items-center gap-6 py-6 border-b border-[#E3DEC1] hover:bg-[#F9F6F0] transition-colors duration-500">
              {/* Artwork */}
              <div className="w-20 h-20 bg-[#D7C9B7] rounded-lg shadow-sm" />
              
              {/* Metadata */}
              <div className="flex-1">
                <h4 className="font-serif font-bold text-xl">{track.title}</h4>
                <p className="text-xs text-[#8C7E6B] mt-1 font-mono tracking-wide">
                  {track.bpm || '140'} BPM • {track.genre || 'Ambient'}
                </p>
              </div>

              {/* Play Control */}
              <button className="w-12 h-12 rounded-full border border-[#D7C9B7] flex items-center justify-center hover:bg-[#4B3B2F] hover:text-white transition-all">
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
