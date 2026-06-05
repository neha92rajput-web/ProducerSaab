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
  const [loading, setLoading] = useState<boolean>(true);
  const [bannerOffset, setBannerOffset] = useState({ x: 50, y: 50 });
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      setUser(user);
      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(record || { username: 'producer', display_name: 'Producer' });
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center">Opening Streaming Desk...</div>;

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#2D2621] pb-28 font-sans">
      <header className="w-full bg-[#FAF7F2] border-b border-[#E3DEC1] sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-xs font-black uppercase border border-[#D1C9B7] px-4 py-2 rounded-full">Disconnect</button>
      </header>

      {/* Main Content Area - Sidebar Removed */}
      <main className="max-w-5xl mx-auto pt-6 px-4">
        {viewMode === 'personal' && (
          <>
            {/* Banner with non-stretching fix */}
            <div 
              className="w-full h-[280px] bg-[#C9BFB2] bg-no-repeat bg-center bg-cover relative shadow-inner border-b border-[#E3DEC1]"
              style={{ 
                backgroundImage: profile.cover_url ? `url('${profile.cover_url}')` : 'none',
                backgroundPosition: `${bannerOffset.x}% ${bannerOffset.y}%` 
              }}
            />
            
            <div className="relative px-8">
              <div className="w-28 h-28 bg-[#211913] border-4 border-[#FAF7F2] rounded-full absolute -top-14 left-8 flex items-center justify-center text-white font-serif text-3xl">
                {String(profile.display_name).charAt(0)}
              </div>
              <div className="pt-16">
                <h2 className="text-2xl font-black font-serif">{profile.display_name}</h2>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
