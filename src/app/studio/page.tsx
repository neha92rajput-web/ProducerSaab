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
  const [editForm, setEditForm] = useState<any>({});
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
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bannerOffset, setBannerOffset] = useState({ x: 50, y: 50 });
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ... [Keep all helper functions: toggleMasterPlayback, toggleLocalLike, toggleFollowProducer, formatExactDateTime, resizeAndConvertToBase64, handleBannerMouseDown, handleBannerMouseMove, handleBannerMouseUpOrLeave, loadVerifiedProducersIndex, loadFeedAndProfiles, loadUserPersonalContent, handleDirectImageUpload, handleDeleteImageMedia, handleDeleteTrack, handleDeletePost, handleUpdateTrackMetadata, handleCreatePost, handlePublishTrack, handleProfileSave] ...

  if (loading || !profile) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-xs font-bold text-[#A4927A] tracking-widest uppercase">Opening Streaming Desk...</div>;

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#2D2621] pb-28 font-sans antialiased relative">
      {currentPlayingTrack && (
        <audio ref={globalAudioPlayerRef} src={currentPlayingTrack.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />
      )}

      <input type="file" id="avatarFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'avatar_url'); }} />
      <input type="file" id="coverFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'cover_url'); }} />

      <header className="w-full bg-[#FAF7F2] border-b border-[#E3DEC1] sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <span className="font-serif italic font-black text-lg tracking-tight text-[#4B3B2F] mr-4">PRODUCER SAAB</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode(viewMode === 'personal' ? 'community' : 'personal')} className="text-xs font-black uppercase tracking-wider bg-[#4B3B2F] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-[#3D2F24] transition">
            {viewMode === 'personal' ? 'Switch to Feed 👥' : 'My Virtual Studio 👤'}
          </button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-xs font-black uppercase tracking-wider border border-[#D1C9B7] px-4 py-2.5 rounded-full hover:bg-red-50 hover:text-red-700 transition">Disconnect</button>
        </div>
      </header>

      {/* Main HUD - Sidebar removed, container centered */}
      <main className="max-w-5xl mx-auto pb-16 pt-6 overflow-x-hidden">
        {viewMode === 'personal' ? (
          <>
            {/* Banner with corrected classes for non-stretching */}
            <div 
              onMouseDown={handleBannerMouseDown} onMouseMove={handleBannerMouseMove} onMouseUp={handleBannerMouseUpOrLeave} onMouseLeave={handleBannerMouseUpOrLeave}
              className="w-full h-[280px] bg-[#C9BFB2] bg-no-repeat bg-center bg-cover relative group cursor-move select-none shadow-inner border-b border-[#E3DEC1]"
              style={{ backgroundImage: profile.cover_url ? `url('${profile.cover_url}')` : 'none', backgroundPosition: `${bannerOffset.x}% ${bannerOffset.y}%` }}
            >
              <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition duration-200 flex gap-2">
                <label htmlFor="coverFileSelector" className="bg-[#211913]/90 hover:bg-[#211913] text-white font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow border border-white/10">📷 Change Banner</label>
              </div>
            </div>

            <div className="px-8 relative max-w-5xl mx-auto">
              <label htmlFor="avatarFileSelector" className="w-28 h-28 bg-[#211913] border-4 border-[#FAF7F2] rounded-full absolute -top-14 left-8 overflow-hidden flex items-center justify-center shadow-xl cursor-pointer group z-20">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-white font-serif font-bold text-3xl italic">{userInitial}</span>}
              </label>

              <div className="pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E3DEC1] pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-[#211913] font-serif">{profile.display_name || profile.username}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9C8F7A]">{profile.company || 'Verified Platform Creator'}</p>
                </div>
              </div>
              
              {/* ... [Keep remaining content for tracks/posts/about tabs] ... */}
            </div>
          </>
        ) : (
          /* ... [Community Feed implementation] ... */
          <div className="p-8 space-y-4 max-w-4xl mx-auto animate-fadeIn">...</div>
        )}
      </main>
    </div>
  );
}
