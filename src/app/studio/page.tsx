'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      setProfile(p || {});
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return <div className="p-10 font-black uppercase text-xs">Opening Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans pb-20">
      {/* HEADER */}
      <nav className="px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center bg-[#FDFBF7]">
        <span className="font-serif italic font-black text-lg">PRODUCER SAAB</span>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
          <button onClick={() => router.push('/studio')}>My Studio</button>
          <button onClick={() => router.push('/community')}>Community</button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        
        {/* 1. PROFILE SECTION */}
        <div className="space-y-4">
          <div className="bg-[#D7C9B7] h-40 rounded-2xl" />
          <div className="px-4 -mt-12 flex items-end gap-4">
            <div className="w-24 h-24 bg-[#191919] rounded-full border-4 border-[#FDFBF7] flex items-center justify-center text-white text-3xl italic font-serif">
              {String(profile.display_name || 'N').charAt(0).toUpperCase()}
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-black italic font-serif">{profile.display_name}</h1>
              <p className="text-xs text-[#54493D]">{profile.headline}</p>
            </div>
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-[#A4927A] px-4">
            <span>{profile.followers_count || 0} Followers</span>
            <span>{profile.following_count || 0} Following</span>
          </div>
        </div>

        {/* 2. CREATE POST */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DEC1]">
          <textarea 
            placeholder="What's happening in the studio?"
            className="w-full bg-[#FDFBF7] p-4 rounded-xl border border-[#E3DEC1] text-sm mb-3"
            rows={3}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <button className="bg-[#4B3B2F] text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Create Post</button>
        </div>

        {/* 3. MY FEED & TRACKS */}
        <section>
          <h3 className="font-black text-xs uppercase mb-4">My Feed</h3>
          <div className="bg-white p-6 rounded-2xl border border-[#E3DEC1] text-sm italic text-gray-500">No posts yet...</div>
        </section>

        <section>
          <h3 className="font-black text-xs uppercase mb-4">My Tracks</h3>
          {mySounds.map(track => (
            <div key={track.id} className="bg-white p-4 rounded-xl border border-[#E3DEC1] mb-3 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F6F3EC] flex items-center justify-center font-bold">▶</div>
              <p className="font-bold text-sm">{track.title}</p>
            </div>
          ))}
        </section>

        {/* 4. COLLABORATIONS & ANALYTICS */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E3DEC1]">
            <h3 className="font-black text-xs uppercase mb-2">Collaborations</h3>
            <p className="text-[10px] text-[#A4927A]">Coming soon</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E3DEC1]">
            <h3 className="font-black text-xs uppercase mb-2">Studio Analytics</h3>
            <p className="text-[10px] text-[#A4927A]">Live insights</p>
          </div>
        </section>

      </div>
    </div>
  );
}
