'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');
  const [activeSubTab, setActiveSubTab] = useState<'tracks' | 'posts' | 'about'>('tracks');
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]); 
  const [communityFeed, setCommunityFeed] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');
  
  const [verifiedProducers, setVerifiedProducers] = useState<any[]>([]);
  const [followedProducers, setFollowedProducers] = useState<Record<string, boolean>>({});

  const [trackTitle, setTrackTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      setUser(user);
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      const { data: psts } = await database.from('posts').select('*').eq('profile_id', user.id);
      
      setProfile(p || { display_name: 'Studio User', username: 'producer' });
      setMySounds(s || []);
      setMyPosts(psts || []);
      setLoading(false);
    }
    loadData();
  }, [router]);

  if (loading || !profile) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      {/* HEADER */}
      <header className="w-full bg-[#FDFBF7] border-b border-[#E3DEC1] sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
        <h1 className="font-serif italic font-black text-lg tracking-tight text-[#4B3B2F]">PRODUCER SAAB</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode(viewMode === 'personal' ? 'community' : 'personal')} className="text-[10px] font-black uppercase tracking-widest bg-[#2C251E] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-black transition">
            {viewMode === 'personal' ? 'Switch to Feed 👥' : 'My Virtual Studio 👤'}
          </button>
          <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="text-[10px] font-black uppercase tracking-widest border border-[#D1C9B7] px-4 py-2.5 rounded-full hover:bg-red-50 transition">Disconnect</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* DASHBOARD STYLE HERO CARD */}
        <div className="bg-white border border-[#E3DEC1] rounded-3xl overflow-hidden shadow-sm mb-8">
            <div className="h-40 bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98] w-full" />
            <div className="p-8 relative">
                <div className="w-24 h-24 bg-[#191919] rounded-full absolute -top-12 left-8 border-4 border-white flex items-center justify-center text-white font-serif italic text-2xl">
                    {profile.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-black font-serif">@{profile.username}</h2>
                    <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-1">Music Producer • Verified Creator</p>
                    <p className="text-sm text-[#54493D] mt-3 max-w-2xl">{profile.headline || 'Welcome to my verified audio drops portfolio space.'}</p>
                    
                    <div className="flex gap-2 mt-4">
                        <span className="bg-[#FAF5EE] border border-[#E3DEC1] text-[#706456] text-[10px] font-bold px-3 py-1.5 rounded-full">🎵 Coke Studio</span>
                        <span className="bg-[#FAF5EE] border border-[#E3DEC1] text-[#706456] text-[10px] font-bold px-3 py-1.5 rounded-full">🎵 Hip Hop</span>
                    </div>
                </div>
            </div>
        </div>

        {/* FEED LAYOUT */}
        <div className="grid grid-cols-12 gap-8">
            <main className="col-span-12 lg:col-span-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Featured Tracks & Audio Drops</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mySounds.map(track => (
                        <div key={track.id} className="bg-white border border-[#E3DEC1] p-4 rounded-2xl flex items-center gap-4 hover:border-gray-300 transition">
                            <div className="w-12 h-12 bg-black rounded-lg text-white flex items-center justify-center text-xs">▶</div>
                            <div>
                                <h4 className="font-bold text-sm">{track.title}</h4>
                                <p className="text-[10px] text-gray-500 uppercase">{track.genre} • {track.bpm} BPM</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            <aside className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white border border-[#E3DEC1] p-6 rounded-3xl shadow-sm">
                    <h4 className="font-black text-[10px] uppercase tracking-widest mb-4">Connect with Creator</h4>
                    <button className="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest">+ Follow Artist</button>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
