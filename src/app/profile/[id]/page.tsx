'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PublicProfile() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // URL dynamic parameter handle matching folder [id] name string
  const profileId = params?.id;

  // Data Loading States
  const [profile, setProfile] = useState<any>(null);
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Stream Playback Logic State parameters
  const [currentlyPlayingUrl, setCurrentlyPlayingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    async function fetchPublicPortfolioData() {
      setLoading(true);
      try {
        // 1. Fetch target creator details cleanly using user ID or handle matching parameter string
        const { data: targetProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (profileError) throw profileError;

        // Fallback catch if profile query is empty, try locating via alphanumeric handle string reference
        if (!targetProfile) {
          const { data: handleProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', profileId)
            .maybeSingle();
          if (handleProfile) setProfile(handleProfile);
        } else {
          setProfile(targetProfile);
        }

        // 2. Fetch all public tracks associated to this creator account identifier
        const { data: trackCatalog } = await supabase
          .from('sounds')
          .select('*')
          .eq('profile_id', targetProfile?.id || profileId)
          .order('created_at', { ascending: false });

        if (trackCatalog) setSounds(trackCatalog);

      } catch (err) {
        console.error('Error fetching public asset catalog streams:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicPortfolioData();
  }, [profileId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0E0D] text-[#A49B91] flex items-center justify-center font-sans">
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Streaming Audio Assets...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0E0D] text-white flex flex-col items-center justify-center font-sans gap-4">
        <div className="text-xs font-bold uppercase tracking-widest text-[#C89B6D]">Studio Portfolio Node Offline</div>
        <button onClick={() => router.push('/')} className="text-[11px] font-bold uppercase tracking-wider bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">Return to Main Deck</button>
      </div>
    );
  }

  const artistInitials = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#E5E1DB] font-sans antialiased pb-24 selection:bg-[#C89B6D] selection:text-black">
      
      {/* IMMERSIVE HEADER DECK BACKGROUND COVER BAR */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#1E1C1A]">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Artist backdrop" 
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B2724] to-[#0F0E0D]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/60 to-transparent" />
        
        {/* UPPER NAVIGATION BAR LINK OVERLAYS */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-6xl mx-auto z-20">
          <button 
            onClick={() => router.push('/')}
            className="text-[10px] font-bold tracking-widest uppercase text-[#A49B91] hover:text-white transition flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5"
          >
            ← Explore Mode
          </button>
          <h1 className="text-[10px] font-black tracking-[0.3em] uppercase text-white hidden sm:block">
            <span className="text-[#C89B6D] mr-1">川</span>Producer Saab Showcase
          </h1>
        </div>
      </div>

      {/* METADATA WRAPPER LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 sm:-mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN COMPARTMENT: MINIMALIST EPK BIO CARD */}
        <div className="lg:col-span-4 bg-[#141312] border border-white/[0.04] rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            
            {/* High-Contrast Dynamic Avatar Frame */}
            <div className="w-24 h-24 rounded-2xl bg-[#C89B6D] border border-white/10 overflow-hidden shadow-xl flex items-center justify-center text-black font-black text-3xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.display_name} />
              ) : (
                <span>{artistInitials}</span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-white">{profile.display_name || `@${profile.username}`}</h2>
              {profile.pronouns && <p className="text-[10px] uppercase font-bold text-[#A49B91] tracking-wider">{profile.pronouns}</p>}
            </div>

            {profile.headline && (
              <p className="text-xs text-[#A49B91] leading-relaxed max-w-xs font-medium">
                {profile.headline}
              </p>
            )}

            {profile.location && (
              <div className="text-[10px] font-bold tracking-widest text-[#C89B6D] uppercase flex items-center gap-1.5 bg-[#C89B6D]/5 border border-[#C89B6D]/10 px-3 py-1 rounded-full">
                📍 {profile.location}
              </div>
            )}
          </div>

          {/* Core Analytics Showcase Loop Numbers */}
          <div className="border-t border-white/[0.04] pt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-[#1E1D1B] rounded-xl p-3 border border-white/5">
              <div className="text-sm font-black text-white">{sounds.length}</div>
              <div className="text-[9px] font-bold uppercase text-[#A49B91] tracking-wider mt-0.5">Audio Drops</div>
            </div>
            <div className="bg-[#1E1D1B] rounded-xl p-3 border border-white/5">
              <div className="text-sm font-black text-[#C89B6D]">Verified</div>
              <div className="text-[9px] font-bold uppercase text-[#A49B91] tracking-wider mt-0.5">Creator Node</div>
            </div>
          </div>
        </div>

        {/* MAIN COLUMN AREA: PURE STYLIZED MUSIC TRACK GRID DECK */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Featured Audio Catalog</h3>
            <span className="text-[10px] text-[#A49B91] font-bold tracking-wide">{sounds.length} Tracks available</span>
          </div>

          {sounds.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {sounds.map((track) => {
                const isThisPlaying = currentlyPlayingUrl === track.audio_url;

                return (
                  <div 
                    key={track.id} 
                    className={`group border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                      isThisPlaying 
                        ? 'bg-[#1E1A17] border-[#C89B6D]/30 shadow-lg shadow-[#C89B6D]/5' 
                        : 'bg-[#141312] border-white/[0.03] hover:border-white/[0.08] hover:bg-[#1A1917]'
                    }`}
                  >
                    {/* Track Info Side Layout */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => setCurrentlyPlayingUrl(isThisPlaying ? null : track.audio_url)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition shrink-0 transform active:scale-95 shadow-md ${
                          isThisPlaying 
                            ? 'bg-[#C89B6D] text-black shadow-[#C89B6D]/10' 
                            : 'bg-white/5 group-hover:bg-[#C89B6D] group-hover:text-black text-white'
                        }`}
                      >
                        {isThisPlaying ? '⏸' : '▶'}
                      </button>

                      <div className="truncate space-y-1">
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-[#C89B6D] transition duration-200">
                          {track.title}
                        </h4>
                        
                        {/* Dynamic Metadata Filter Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {track.bpm && (
                            <span className="text-[9px] font-black tracking-wider uppercase bg-white/5 border border-white/5 text-[#A49B91] px-2 py-0.5 rounded">
                              {track.bpm} BPM
                            </span>
                          )}
                          <span className="text-[9px] font-black tracking-wider uppercase bg-white/5 border border-white/5 text-[#C89B6D] px-2 py-0.5 rounded">
                            {track.genre || 'Loop'}
                          </span>
                          {track.key && (
                            <span className="text-[9px] font-bold text-[#A49B91] bg-black/40 px-1.5 py-0.5 rounded">
                              {track.key}
                            </span>
                          )}
                          {track.mood && (
                            <span className="text-[9px] font-bold text-[#A49B91] bg-black/40 px-1.5 py-0.5 rounded">
                              {track.mood}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unified Minimal Audio Component Wrapper Side */}
                    <div className="w-full md:w-auto shrink-0 flex items-center">
                      <audio 
                        controls 
                        src={track.audio_url} 
                        className="w-full md:w-64 h-7 accent-[#C89B6D] opacity-80 hover:opacity-100 transition" 
                        onPlay={() => setCurrentlyPlayingUrl(track.audio_url)}
                        onPause={() => { if (isThisPlaying) setCurrentlyPlayingUrl(null); }}
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Graceful Empty Slate Fallback display block */
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <p className="text-xs text-[#A49B91] font-medium tracking-wide">
                💿 This creator hasn't published any track assets to their public showcase deck yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
