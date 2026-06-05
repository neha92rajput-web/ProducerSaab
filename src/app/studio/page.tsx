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
    {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    }
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(p || { display_name: 'Artist Name', username: 'producer', headline: 'Professional Audio Designer.' });
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading || !profile) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-[#A4927A] tracking-widest uppercase">Loading Portfolio...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="text-[10px] font-black uppercase tracking-widest border border-[#D1C9B7] px-5 py-2 rounded-full hover:bg-black hover:text-white transition">Disconnect</button>
      </header>

      {/* CENTERED COLUMN */}
      <div className="max-w-3xl mx-auto px-6">
        
        {/* CINEMATIC HERO */}
        <div className="relative w-full h-[320px] bg-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm mb-12">
           <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent z-10" />
           <div className="absolute bottom-8 left-8 z-20 flex items-center gap-6">
             <div className="w-28 h-28 rounded-full border-4 border-[#FDFBF7] bg-[#191919] flex items-center justify-center text-white text-4xl italic font-serif shadow-xl">
               {profile.display_name.charAt(0)}
             </div>
             <div>
               <h1 className="text-4xl font-black italic font-serif">{profile.display_name} <span className="text-xl align-top">✓</span></h1>
               <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">{profile.company || 'Music Producer'}</p>
             </div>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mb-12">
          <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className="bg-[#4B3B2F] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#3D2F24] transition">➕ Bounce Track</button>
        </div>

        {/* TRACKS GRID */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#4B3B2F] mb-6 border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
          {mySounds.map((track) => (
            <div key={track.id} className="group flex items-center gap-6 py-4 border-b border-[#E3DEC1] hover:bg-[#F9F6F0] transition-colors">
              <div className="w-16 h-16 bg-[#D7C9B7] rounded-lg shadow-sm flex items-center justify-center font-bold">▶</div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-xl">{track.title}</h4>
                <p className="text-[10px] text-[#8C7E6B] font-mono uppercase tracking-widest">{track.bpm || '140'} BPM • {track.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
