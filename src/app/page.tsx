'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // Pure dynamic state tracking
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        const { data: soundRecords } = await supabase
          .from('sounds')
          .select(`
            id, 
            title, 
            genre, 
            audio_url,
            profiles!inner (
              username,
              display_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3);
        if (soundRecords) setRecentUploads(soundRecords);

        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .order('created_at', { ascending: false })
          .limit(2);
        if (profileRecords) setNetworkProfiles(profileRecords);

      } catch (err) {
        console.error('Data loading failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkData();
  }, []);

  // Isolate the very first actual track for the signature "LATEST UPLOAD" player card
  const latestTrack = recentUploads[0];

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#191919] font-sans antialiased">
      
      {/* 1. COMPREHENSIVE HEADER NAV (Matching image_129579.jpg perfectly) */}
      <header className="sticky top-0 z-50 bg-[#F8F5EE]/95 backdrop-blur-sm border-b border-[#E8E1D7] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-[#191919] uppercase">
            <span className="text-xl font-light tracking-tighter text-[#C79A6D] mr-0.5">川</span>
            Producer Saab
          </Link>

          {/* Centered Hub Sub-links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6F6F6F]">
            <Link href="/library" className="hover:text-[#191919] transition">Discover</Link>
            <Link href="/library" className="hover:text-[#191919] transition">Sounds</Link>
            <Link href="/signin" className="hover:text-[#191919] transition">Community</Link>
          </nav>

          {/* Right actions split by a premium divider line */}
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-[#191919] hover:text-black transition">
              Sign In
            </Link>
            <div className="h-4 w-[1px] bg-[#E8E1D7] hidden sm:block" />
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2.5 bg-[#191919] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>

        </div>
      </header>

      {/* 2. CINEMATIC BACKGROUND HERO BLOCK */}
      <section 
        className="relative bg-neutral-900 bg-cover bg-center bg-no-repeat min-h-[580px] flex items-center overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(25, 25, 25, 0.92) 25%, rgba(25, 25, 25, 0.4) 60%, rgba(25, 25, 25, 0.1) 100%), url('https://images.unsplash.com/photo-1552422535-c45813c61732?w=1800&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-8 pt-16 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[#C79A6D] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-[1.1]">
                The Home for <br />Music Producers<span className="text-[#C79A6D]">.</span>
              </h1>
              <p className="text-sm font-medium text-neutral-300 max-w-xl leading-relaxed">
                Join a community of music creators sharing tracks, loops, melodies, samples, and beats. Upload your audio, connect with collaborators, build your <span className="text-[#C79A6D] underline decoration-wavy underline-offset-4">Studio</span>, get discovered, and grow your audience.
              </p>
            </div>

            {/* Premium Interactive Button Row */}
            <div className="flex items-center gap-3.5">
              <Link href="/signin?view=signup" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center gap-2">
                Join the Community →
              </Link>
              <Link href="/library" className="px-6 py-3.5 bg-[#F8F5EE] hover:bg-white text-[#191919] text-xs font-bold rounded-full transition text-center shadow-md">
                Discover Sounds
              </Link>
            </div>

            {/* Updated Feature Layout Indicators (Replacing the old metrics numbers) */}
            <div className="pt-8 grid grid-cols-3 gap-6 max-w-lg text-left border-t border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xs">👥</span>
                  <h4 className="text-xs font-bold tracking-tight">Upload Your Audio</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Share your best work</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xs">🎵</span>
                  <h4 className="text-xs font-bold tracking-tight">Connect & Collaborate</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Work with creators</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-xs">🌐</span>
                  <h4 className="text-xs font-bold tracking-tight">Build Your Studio</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Grow your audience</p>
              </div>
            </div>
          </div>

          {/* Right Floating Media Player Component Box */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end self-end pt-8 lg:pt-0">
            <div className="w-full max-w-sm bg-[#FAF8F5]/90 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 truncate">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 flex flex-col justify-center items-center font-bold text-[10px] text-[#C79A6D] shadow-inner relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100')" }} />
                  <span className="relative z-10">WAV</span>
                </div>
                <div className="truncate">
                  <p className="text-[9px] font-bold text-[#C79A6D] uppercase tracking-wider mb-0.5">LATEST UPLOAD</p>
                  <h4 className="font-sans font-black text-xs text-[#191919] truncate">
                    {latestTrack ? latestTrack.title : 'Late Night Bounce'}
                  </h4>
                  <p className="text-[10px] text-[#6F6F6F] font-semibold truncate">
                    by {latestTrack ? `@${latestTrack.profiles?.username}` : 'Ocean Run'}
                  </p>
                </div>
              </div>
              
              {latestTrack?.audio_url ? (
                <audio controls src={latestTrack.audio_url} className="h-7 w-28 accent-[#191919]" />
              ) : (
                <div className="flex items-center justify-center w-9 h-9 bg-[#191919] hover:bg-neutral-800 text-white rounded-full transition shadow shrink-0 cursor-pointer">
                  ▶
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. SUB-HERO SECTION INVITATION GATEWAY */}
      <section className="max-w-6xl mx-auto py-24 px-8 text-center space-y-4">
        <p className="text-[11px] font-bold text-[#C79A6D] uppercase tracking-widest font-sans">WHY JOIN PRODUCER SAAB?</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#191919]">
          Everything you need to grow as a creator<span className="text-[#C79A6D]">.</span>
        </h2>
      </section>

      {/* 4. REAL-TIME ECOSYSTEM SOUND TRACK RACKS */}
      <section className="max-w-6xl mx-auto pb-16 px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
          <h3 className="text-lg font-serif font-black text-[#191919]">🔥 Trending Sounds</h3>
          <Link href="/library" className="text-xs font-bold text-[#6F6F6F] hover:text-[#191919] transition">Discover all →</Link>
        </div>

        {loading ? (
          <p className="text-xs text-[#6F6F6F]">Streaming network dashboard entries...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-[#EDE9DE]/50 border border-[#E8E1D7] rounded-2xl p-4 space-y-4 shadow-sm transition hover:bg-[#EDE9DE]/80">
                <div>
                  <span className="px-1.5 py-0.5 bg-[#191919] text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                  <h4 className="font-bold text-xs text-[#191919] truncate inline-block">{track.title}</h4>
                  <p className="text-[10px] text-[#6F6F6F] mt-1">By @{(track.profiles as any)?.username || 'creator'}</p>
                </div>
                <audio controls src={track.audio_url} className="w-full h-7 accent-[#191919]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#E8E1D7] rounded-2xl bg-[#EDE9DE]/20">
            <p className="text-xs text-[#6F6F6F] font-bold tracking-wide">
              🎵 No sound assets found in the network stack yet.
            </p>
          </div>
        )}
      </section>

      {/* 5. GENTLE CREATOR PROFILES DIRECTORY */}
      <section className="max-w-6xl mx-auto pb-24 px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
          <h3 className="text-lg font-serif font-black text-[#191919]">⭐ Featured Producers</h3>
        </div>

        {loading ? (
          <p className="text-xs text-[#6F6F6F]">Scanning database records...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-[#EDE9DE]/50 border border-[#E8E1D7] rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#191919] text-white font-serif font-black text-sm rounded-full flex items-center justify-center uppercase shadow-sm">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#191919]">@{userCard.username || 'producer'}</h3>
                    <p className="text-[10px] text-[#6F6F6F] uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link 
                  href={`/${userCard.username || ''}`}
                  className="px-4 py-1.5 bg-[#F8F5EE] hover:bg-neutral-100 text-[#191919] border border-[#E8E1D7] rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Follow
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#E8E1D7] rounded-2xl bg-[#EDE9DE]/20">
            <p className="text-xs text-[#6F6F6F] font-bold tracking-wide">
              🌱 No creators have launched profiles yet.
            </p>
          </div>
        )}
      </section>

      {/* GLOBAL FOOTER */}
      <footer className="max-w-6xl mx-auto pb-12 px-8 text-[10px] text-[#6F6F6F] border-t border-[#E8E1D7]/40 pt-6 text-center">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
