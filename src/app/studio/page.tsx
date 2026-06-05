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

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      setUser(user);
      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(record || { display_name: 'Studio User', username: 'studio', headline: 'Welcome to my verified audio drops portfolio space.' });
      setMySounds(sounds || []);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setPublishing(true);
    const fileName = `${user.id}-${Date.now()}`;
    await database.storage.from('audio-tracks').upload(fileName, selectedFile);
    const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
    await database.from('sounds').insert([{ title: trackTitle, audio_url: publicUrl, profile_id: user.id }]);
    setPublishing(false);
    window.location.reload();
  };

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-20">
      <div className="max-w-[1100px] mx-auto p-6 grid grid-cols-12 gap-8 mt-10">
        
        {/* MAIN PROFILE AREA */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E3DEC1] rounded-3xl overflow-hidden shadow-sm">
            <div className="h-40 bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98] w-full" />
            <div className="p-8 relative">
              <div className="w-24 h-24 bg-[#191919] border-4 border-white rounded-full absolute -top-12 left-8 flex items-center justify-center text-white text-3xl italic">🎧</div>
              <div className="mt-8 space-y-4">
                <div>
                  <h1 className="text-2xl font-black">{profile.display_name}</h1>
                  <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-1">Music Producer • Verified Creator</p>
                </div>
                <p className="text-sm text-[#54493D] leading-relaxed max-w-xl font-medium">{profile.headline}</p>
                <div className="flex gap-2">
                  <span className="bg-[#FAF5EE] border border-[#E3DEC1] text-[#706456] text-[10px] font-bold px-3 py-1.5 rounded-full">🎵 Coke Studio</span>
                  <span className="bg-[#FAF5EE] border border-[#E3DEC1] text-[#706456] text-[10px] font-bold px-3 py-1.5 rounded-full">🎵 Hip Hop</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRACKS CATALOG */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl p-8 shadow-sm">
            <h3 className="font-black text-sm mb-6">Featured Tracks & Audio Drops</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySounds.map(track => (
                <div key={track.id} className="bg-[#FAF9F5] border border-[#E3DEC1] p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-lg text-white flex items-center justify-center text-xs">▶</div>
                  <h4 className="font-bold text-sm truncate">{track.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E3DEC1] p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-black text-sm">Connect with Creator</h4>
            <p className="text-xs text-gray-500">Follow for network feed alerts when new loops or stems launch.</p>
            <button onClick={() => setShareType('audio')} className="w-full bg-black text-white py-3 rounded-full font-bold text-xs">+ Drop Track</button>
          </div>

          <div className="bg-white border border-[#E3DEC1] p-6 rounded-3xl shadow-sm space-y-2">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-[#A4927A] mb-2">Studio Credentials</h4>
            <p className="text-xs font-bold">Handle: <span className="font-normal">@{profile.username}</span></p>
            <p className="text-xs font-bold">Trade Spec: <span className="font-normal">{profile.company || 'Music Producer'}</span></p>
          </div>
        </aside>

      </div>
    </div>
  );
}
