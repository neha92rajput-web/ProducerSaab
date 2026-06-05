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

  // --- ALL YOUR EXISTING LOGIC STATES ---
  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');
  const [activeSubTab, setActiveSubTab] = useState<'tracks' | 'posts' | 'about'>('tracks');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [communityFeed, setCommunityFeed] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [verifiedProducers, setVerifiedProducers] = useState<any[]>([]);
  const [followedProducers, setFollowedProducers] = useState<Record<string, boolean>>({});
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Punjabi');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bannerOffset, setBannerOffset] = useState({ x: 50, y: 50 });
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // --- ALL YOUR EXISTING FUNCTIONS (loadData, handlers, etc.) ---
  // (Assuming your existing functions are here)
  // [Paste your full logic block here from your original file]

  if (loading || !profile) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-xs font-bold text-[#A4927A] uppercase">Opening Studio...</div>;

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased selection:bg-[#E3DEC1]">
      
      {/* 1. TOP NAV - FUNCTIONAL & CLEAN */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg tracking-tight">PRODUCER SAAB</span>
        <div className="flex items-center gap-8">
          <button onClick={() => setViewMode('personal')} className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'personal' ? 'text-black underline' : 'text-[#A4927A]'}`}>My Studio</button>
          <button onClick={() => setViewMode('community')} className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'community' ? 'text-black underline' : 'text-[#A4927A]'}`}>Community</button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </header>

      {/* 2. CENTERED EDITORIAL COLUMN (The Empty Sides Layout) */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {viewMode === 'personal' ? (
          <div className="space-y-12">
            {/* HERO PROFILE CARD */}
            <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm relative">
              <div className="h-56 bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98]" />
              <div className="p-8">
                <div className="w-28 h-28 bg-[#191919] border-4 border-[#FDFBF7] rounded-full -mt-20 mb-6 flex items-center justify-center text-white text-4xl italic font-serif">
                   {userInitial}
                </div>
                <h1 className="text-3xl font-black italic font-serif">{profile.display_name} <span className="text-blue-500 text-lg">✓</span></h1>
                <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">{profile.company || 'Music Producer'}</p>
                <p className="mt-6 text-sm leading-relaxed text-[#54493D] max-w-2xl">{profile.headline}</p>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="flex gap-4">
              <button onClick={() => setShareType('audio')} className="bg-[#4B3B2F] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#3D2F24] transition">➕ Bounce Track</button>
              <button onClick={() => setShareType('post')} className="bg-[#EFECE3] text-[#4B3B2F] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#E3DEC1] transition">✍️ Log Thought</button>
            </div>

            {/* CATALOG */}
            <h3 className="text-xs font-black uppercase tracking-widest border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mySounds.map(track => (
                <div key={track.id} className="bg-white p-6 rounded-2xl border border-[#E3DEC1] flex items-center gap-4 hover:border-[#D7C9B7] transition">
                  <button onClick={() => { setCurrentPlayingTrack(track); setIsPlaying(!isPlaying); }} className="w-12 h-12 bg-[#F6F3EC] rounded-xl flex items-center justify-center font-bold">▶</button>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm truncate">{track.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{track.genre} • {track.bpm} BPM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* COMMUNITY FEED (Matches editorial layout) */
          <div className="space-y-8">
            <h2 className="text-2xl font-black italic font-serif border-b border-[#E3DEC1] pb-6">Community Feed</h2>
            {communityFeed.map((item, idx) => (
               <div key={idx} className="bg-white border border-[#E3DEC1] p-8 rounded-3xl shadow-sm">
                  <p className="text-sm">{item.itemType === 'post' ? item.content : `New Drop: ${item.title}`}</p>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
