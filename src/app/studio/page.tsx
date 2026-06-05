'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [viewMode, setViewMode] = useState<'tracks' | 'posts' | 'about'>('tracks');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  
  // Audio Form States
  const [trackTitle, setTrackTitle] = useState('');
  const [trackGenre, setTrackGenre] = useState('Punjabi');
  const [trackBpm, setTrackBpm] = useState('140');
  const [trackMood, setTrackMood] = useState('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      const { data: psts } = await database.from('posts').select('*').eq('profile_id', user.id);
      
      setProfile(p || { display_name: 'Studio User' });
      setMySounds(s || []);
      setMyPosts(psts || []);
    }
    init();
  }, []);

  const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setPublishing(true);
    const fileName = `${user.id}-${Date.now()}`;
    await database.storage.from('audio-tracks').upload(fileName, selectedFile);
    const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
    await database.from('sounds').insert([{ title: trackTitle, genre: trackGenre, bpm: trackBpm, mood: trackMood, audio_url: publicUrl, profile_id: user.id }]);
    setPublishing(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3126] font-sans p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR: ACTIONS & LOGS */}
        <aside className="col-span-12 md:col-span-3 space-y-6">
          <div className="bg-[#2C251E] text-white p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4 uppercase text-[10px] tracking-widest">Studio Workspace Node</h3>
            <div className="space-y-3">
              <button onClick={() => setViewMode('tracks')} className="w-full bg-[#EFECE3] text-[#4B3B2F] font-black text-[10px] uppercase py-3 rounded-xl">Bounce Track</button>
              <button onClick={() => setViewMode('posts')} className="w-full border border-white/20 text-white font-black text-[10px] uppercase py-3 rounded-xl">Log Thought</button>
            </div>
          </div>
          
          {/* UPLOAD FORMS APPEAR HERE BASED ON SELECTION */}
          {viewMode === 'tracks' && (
             <form onSubmit={handlePublishTrack} className="bg-white border border-[#E3DEC1] p-5 rounded-2xl shadow-sm text-xs space-y-3">
               <input className="w-full p-2 border rounded-lg" placeholder="Title" onChange={e => setTrackTitle(e.target.value)} />
               <select className="w-full p-2 border rounded-lg" onChange={e => setTrackGenre(e.target.value)}>
                 <option>Punjabi</option><option>Trap</option><option>Lo-fi</option>
               </select>
               <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
               <button type="submit" disabled={publishing} className="w-full bg-[#4B3B2F] text-white py-2 rounded-lg font-bold">Publish</button>
             </form>
          )}
        </aside>

        {/* CENTER CONTENT */}
        <main className="col-span-12 md:col-span-9">
          {/* BANNER AREA */}
          <div className="w-full h-64 bg-[#C9BFB2] rounded-3xl mb-8 shadow-inner" />
          
          {/* PROFILE INFO */}
          <div className="flex items-end gap-6 mb-8">
            <div className="w-24 h-24 bg-black rounded-full border-4 border-[#FDFBF7]" />
            <div>
              <h1 className="text-2xl font-black">{profile.display_name}</h1>
              <p className="text-xs text-gray-500 font-medium">Independent Studio • Chandigarh</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button onClick={() => setActiveSubTab('tracks')} className="pb-2 font-bold text-xs uppercase">Tracks Index</button>
            <button onClick={() => setActiveSubTab('posts')} className="pb-2 font-bold text-xs uppercase">Thoughts Feed</button>
          </div>

          {/* CATALOG GRID */}
          <div className="grid grid-cols-2 gap-4">
            {mySounds.map(track => (
              <div key={track.id} className="bg-white border border-[#E3DEC1] p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-lg" />
                <div>
                  <h4 className="font-bold text-sm">{track.title}</h4>
                  <p className="text-[10px] text-gray-400">{track.genre} • {track.bpm} BPM</p>
                </div>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
