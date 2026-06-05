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
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );

  // States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(p || { display_name: 'Studio User', username: 'producer', headline: 'Crafting dark trap, lo-fi and cinematic soundscapes.' });
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setPublishing(true);
    const fileName = `${user.id}-${Date.now()}`;
    await database.storage.from('audio-tracks').upload(fileName, selectedFile);
    const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
    await database.from('sounds').insert([{ title: trackTitle, audio_url: publicUrl, profile_id: user.id, genre: 'Punjabi', bpm: '140' }]);
    setPublishing(false);
    window.location.reload();
  };

  if (loading || !profile) return <div className="min-h-screen bg-[#FDFBF7]" />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-20">
      {currentPlayingTrack && <audio ref={globalAudioPlayerRef} src={currentPlayingTrack.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />}

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <span className="font-serif italic font-black text-lg">PRODUCER SAAB</span>
        <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="text-[10px] font-black uppercase tracking-widest border border-[#D1C9B7] px-4 py-2 rounded-full hover:bg-red-50 transition">Disconnect</button>
      </header>

      {/* CENTERED EDITORIAL COLUMN */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        
        {/* CINEMATIC HERO CARD */}
        <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="h-56 bg-gradient-to-br from-[#D7C9B7] to-[#BCAD98]" />
          <div className="p-8 relative">
            <div className="w-28 h-28 rounded-full border-4 border-[#FDFBF7] bg-[#191919] absolute -top-14 left-8 flex items-center justify-center text-white text-3xl italic font-serif">
              {profile.display_name.charAt(0)}
            </div>
            <div className="mt-12">
              <h1 className="text-3xl font-black italic font-serif">{profile.display_name} <span className="text-blue-500 text-xl">✓</span></h1>
              <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">Music Producer • Chandigarh</p>
              <p className="mt-4 text-sm leading-relaxed max-w-xl text-[#54493D]">{profile.headline}</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className="bg-[#4B3B2F] text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">➕ Bounce Track</button>
          <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className="bg-[#EFECE3] text-[#4B3B2F] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">✍️ Log Thought</button>
        </div>

        {shareType === 'audio' && (
          <form onSubmit={handlePublishTrack} className="bg-white p-6 rounded-2xl border border-[#E3DEC1] space-y-4">
             <input className="w-full p-3 border rounded-lg text-sm" placeholder="Track Title" onChange={e => setTrackTitle(e.target.value)} />
             <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
             <button disabled={publishing} className="bg-[#4B3B2F] text-white px-6 py-2 rounded-lg text-xs font-bold">Publish</button>
          </form>
        )}

        {/* CATALOG */}
        <h3 className="text-xs font-black uppercase tracking-widest pt-6 border-t border-[#E3DEC1]">Featured Tracks</h3>
        <div className="space-y-4">
          {mySounds.map(track => (
            <div key={track.id} className="group flex items-center gap-6 py-4 border-b border-[#E3DEC1]">
              <div className="w-16 h-16 bg-[#D7C9B7] rounded-lg shadow-sm" />
              <div className="flex-1">
                <h4 className="font-serif font-bold text-lg">{track.title}</h4>
                <p className="text-[10px] text-[#8C7E6B] font-mono uppercase tracking-widest">140 BPM • Trap</p>
              </div>
              <button onClick={() => { setCurrentPlayingTrack(track); setIsPlaying(!isPlaying); }} className="w-10 h-10 rounded-full border border-[#D7C9B7] flex items-center justify-center hover:bg-[#4B3B2F] hover:text-white transition">▶</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
