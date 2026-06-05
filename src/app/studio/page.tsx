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

  // States (Maintained your existing state definitions)
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      
      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(record || { display_name: 'Studio User', username: 'producer', headline: 'Independent Producer' });
      setMySounds(sounds || []);
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  // MANDATORY LOADING GUARD (Prevents Build Errors)
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-[#A4927A] tracking-widest uppercase">
        Initializing Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-24">
      {currentPlayingTrack && <audio ref={globalAudioPlayerRef} src={currentPlayingTrack.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />}

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#E3DEC1]">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <div className="flex gap-6">
          <button onClick={() => router.push('/community')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">Community</button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </header>

      {/* CENTERED EDITORIAL COLUMN */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        
        {/* HERO CARD */}
        <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="h-56 bg-gradient-to-br from-[#D7C9B7] to-[#BCAD98]" />
          <div className="p-8 relative">
            <div className="w-28 h-28 rounded-full border-4 border-[#FDFBF7] bg-[#191919] absolute -top-14 left-8 flex items-center justify-center text-white text-3xl italic font-serif">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-12">
              <h1 className="text-3xl font-black italic font-serif">{profile.display_name} <span className="text-blue-500 text-xl align-top">✓</span></h1>
              <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">{profile.company || 'Music Producer'}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#54493D] max-w-xl">{profile.headline}</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className="bg-[#4B3B2F] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#3D2F24] transition">➕ Bounce Track</button>
          <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className="bg-[#EFECE3] text-[#4B3B2F] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#E3DEC1] transition">✍️ Log Thought</button>
        </div>

        {/* CATALOG */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
          <div className="space-y-4">
            {mySounds.map(track => (
              <div key={track.id} className="group flex items-center gap-6 py-4 border-b border-[#E3DEC1] hover:bg-[#F9F6F0] transition-colors">
                <button onClick={() => { setCurrentPlayingTrack(track); setIsPlaying(!isPlaying); }} className="w-12 h-12 bg-[#4B3B2F] text-white rounded-lg flex items-center justify-center font-bold">▶</button>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-lg">{track.title}</h4>
                  <p className="text-[10px] text-[#8C7E6B] font-mono uppercase tracking-widest">{track.bpm || '140'} BPM • {track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
