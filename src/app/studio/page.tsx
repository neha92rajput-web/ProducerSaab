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
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(p || { display_name: 'Studio User', username: 'producer' });
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const toggleMasterPlayback = (track: any) => {
    if (currentPlayingTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingTrack(track);
      setIsPlaying(true);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#A4927A]">
        Opening Studio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-20">
      {currentPlayingTrack && <audio ref={globalAudioPlayerRef} src={currentPlayingTrack.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />}

      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/studio')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">My Studio</button>
          <button onClick={() => router.push('/community')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">Community</button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </nav>

      {/* CENTERED EDITORIAL COLUMN */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-10 space-y-8">
        
        {/* HERO CARD */}
        <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="h-56 bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98]" />
          <div className="p-8 relative">
            <div className="w-28 h-28 border-4 border-[#FDFBF7] rounded-full bg-[#191919] absolute -top-14 left-8 flex items-center justify-center text-white text-3xl italic font-serif">
               {String(profile.display_name).charAt(0).toUpperCase()}
            </div>
            <div className="mt-12">
              <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
              <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">Music Producer</p>
            </div>
          </div>
        </div>

        {/* CATALOG */}
        <h3 className="text-xs font-black uppercase tracking-widest border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
        <div className="space-y-4">
          {mySounds.map(track => (
            <div key={track.id} className="flex items-center gap-6 py-4 border-b border-[#E3DEC1] hover:bg-[#F9F6F0] transition">
              <button onClick={() => toggleMasterPlayback(track)} className="w-12 h-12 bg-[#F6F3EC] rounded-xl flex items-center justify-center font-bold">▶</button>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{track.title}</h4>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{track.genre} • {track.bpm} BPM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
