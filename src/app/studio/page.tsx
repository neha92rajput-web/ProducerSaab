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

  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');
  const [activeSubTab, setActiveSubTab] = useState<'tracks' | 'posts' | 'about'>('tracks');
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');

  const [trackTitle, setTrackTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Audio Player
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      setUser(user);

      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(record || { display_name: 'Studio User', username: 'producer', headline: 'Professional Audio Designer.' });
      
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      setMySounds(sounds || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading || !profile) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center font-bold text-gray-400">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#2D2621] font-sans antialiased">
      
      {/* HEADER */}
      <header className="w-full bg-[#FAF7F2] border-b border-[#E3DEC1] sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="text-[10px] font-black uppercase tracking-wider border px-4 py-2 rounded-full hover:bg-red-50">Disconnect</button>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR ACTIONS */}
        <aside className="col-span-12 md:col-span-3 space-y-6">
          <div className="bg-[#2C251E] text-white p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-[#C9BFB2]">Studio Actions</h3>
            <div className="space-y-3">
              <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className="w-full bg-[#EFECE3] text-[#4B3B2F] font-black text-[10px] uppercase py-3 rounded-xl">🎵 Bounce Track</button>
              <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className="w-full border border-white/20 text-white font-black text-[10px] uppercase py-3 rounded-xl">✍️ Log Thought</button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="col-span-12 md:col-span-9 space-y-8">
          
          {/* ROUNDED HEADER CARD (Replaces Banner Picture) */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#191919] rounded-full flex items-center justify-center text-white italic font-serif text-2xl">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black">{profile.display_name}</h2>
                <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest">{profile.company || 'Verified Creator'}</p>
              </div>
            </div>
          </div>

          {/* TRACKS GRID */}
          <h3 className="text-lg font-black font-serif italic">Latest Catalog Tracks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mySounds.map(track => (
              <div key={track.id} className="bg-white border border-[#E3DEC1] p-4 rounded-2xl flex items-center gap-4 hover:border-gray-300 transition">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">▶</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{track.title}</h4>
                  <p className="text-[10px] text-gray-400 uppercase">{track.genre} • {track.bpm} BPM</p>
                </div>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
