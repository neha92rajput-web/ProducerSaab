'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // Dynamic real-time database lookups
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

  const latestTrack = recentUploads[0];

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#5A5550] font-sans antialiased">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#F6F1EA]/95 backdrop-blur-sm border-b border-[#E7DED3] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-[#1C1B1A] uppercase">
            <span className="text-xl font-light tracking-tighter text-[#C89B6D] mr-0.5">川</span>
            Producer Saab
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#5A5550]">
            <Link href="/library" className="hover:text-[#1C1B1A] transition">Discover</Link>
            <Link href="/library" className="hover:text-[#1C1B1A] transition">Sounds</Link>
            <Link href="/signin" className="hover:text-[#1C1B1A] transition">Community</Link>
          </nav>

          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-[#1C1B1A] hover:text-black transition">
              Sign In
            </Link>
            <div className="h-4 w-[1px] bg-[#E7DED3] hidden sm:block" />
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#2B2A27] text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* 🎹 PIANO REMOVED: Swapped background url for a clean, rich, solid studio brown canvas (#2B2A27) */}
      <main className="relative min-h-[500px] flex items-center overflow-hidden bg-[#2B2A27]">
        {/* Subtle decorative atmosphere layer matching your palette theme */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2B2A27] via-[#3A352F]/70 to-transparent opacity-60" />
        
        <div className="max-w-7xl mx-auto w-full px-8 pt-16 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Hero Left Content Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[#C89B6D] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-[1.1]">
                The Home for <br />Music Producers<span className="text-[#C89B6D]">.</span>
              </h1>
              
              <div className="max-w-2xl text-neutral-300 space-y-4 font-medium">
                <p className="text-sm leading-relaxed text-neutral-300/90">
                  Join a community of music creators sharing tracks, loops, melodies, samples, and beats. Upload your audio, connect with collaborators, get discovered.
                </p>
                <p className="text-lg text-white font-normal tracking-tight">
                  Build your Studio and grow your audience.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3.5">
              <Link href="/signin?view=signup" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center gap-2">
                Join the Community →
              </Link>
              <Link href="/library" className="px-6 py-3.5 bg-[#FFFFFF] hover:bg-neutral-50 text-[#111111] text-xs font-bold rounded-full transition text-center shadow-md">
                Discover Sounds
              </Link>
            </div>

            {/* Inline Sub-Features indicators */}
            <div className="pt-8 grid grid-cols-3 gap-6 max-w-xl text-left border-t border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-neutral-400 text-xs">👥</span>
                  <h4 className="text-xs font-bold tracking-tight">Upload Your Audio</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Share your best work</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-neutral-400 text-xs">🎵</span>
                  <h4 className="text-xs font-bold tracking-tight">Connect & Collaborate</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Work with creators</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-neutral-400 text-xs">🌐</span>
                  <h4 className="text-xs font-bold tracking-tight">Build Your Studio</h4>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Grow your audience</p>
              </div>
            </div>
          </div>

          {/* Floating Media Player Card on the Right Column */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end self-end pt-8 lg:pt-0">
            <div className="w-full max-w-sm bg-[#F6F1EA]/95 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 truncate">
                <div className="w-12 h-12 rounded-xl bg-[#111111] flex flex-col justify-center items-center font-bold text-[10px] text-[#C89B6D] shadow-inner relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100')" }} />
                  <span className="relative z-10">WAV</span>
                </div>
                <div className="truncate">
                  <p className="text-[9px] font-bold text-[#C89B6D] uppercase tracking-wider mb-0.5">LATEST UPLOAD</p>
                  <h4 className="font-sans font-black text-xs text-[#1C1B1A] truncate">
                    {latestTrack ? latestTrack.title : 'Late Night Bounce'}
                  </h4>
                  <p className="text-[10px] text-[#5A5550] font-semibold truncate">
                    by {latestTrack ? `@${latestTrack.profiles?.username}` : 'Ocean Run'}
                  </p>
                </div>
              </div>
              {latestTrack?.audio_url ? (
                <audio controls src={latestTrack.audio_url} className="h-7 w-28 accent-[#111111]" />
              ) : (
                <div className="flex items-center justify-center w-9 h-9 bg-[#111111] hover:bg-[#2B2A27] text-white rounded-full transition shadow shrink-0">
                  ▶
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* WHY JOIN SECTION TITLE HEADER */}
      <section className="max-w-6xl mx-auto pt-24 pb-12 px-8 text-center space-y-3">
        <p className="text-[10px] font-bold text-[#C89B6D] uppercase tracking-widest font-sans">WHY JOIN PRODUCER SAAB?</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#1C1B1A]">
          Everything you need to grow as a creator<span className="text-[#C89B6D]">.</span>
        </h2>
      </section>

      {/* 4-GRID VALUE PROP LAYER */}
      <section className="max-w-4xl mx-auto pb-20 px-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2.5">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-sm text-[#3F5A3A]">🎧</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Showcase Your Sound</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Upload your loops, melodies, MIDI, and samples.</p>
          </div>
          <div className="flex flex-col items-center space-y-2.5">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-sm text-[#3F5A3A]">👤</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Build Your Audience</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Gain followers and grow your producer profile.</p>
          </div>
          <div className="flex flex-col items-center space-y-2.5">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-sm text-[#3F5A3A]">✨</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Discover Talent</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Find and connect with producers worldwide.</p>
          </div>
          <div className="flex flex-col items-center space-y-2.5">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-sm text-[#3F5A3A]">⏱️</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Collaborate & Grow</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Find collaborators, learn, and create opportunities.</p>
          </div>
        </div>
      </section>

      {/* TRENDING AUDIO DATA SHELF */}
      <section className="max-w-4xl mx-auto py-10 px-8 space-y-4 border-t border-[#E7DED3]">
        <h3 className="text-xs font-bold text-[#1C1B1A] flex items-center gap-1">🔥 Trending Sounds</h3>
        {loading ? (
          <p className="text-[11px] text-[#5A5550]">Loading tracks...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-[#E7DED3] border border-[#D8CBBE] rounded-2xl p-4 space-y-4 shadow-sm">
                <div>
                  <span className="px-1.5 py-0.5 bg-[#111111] text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                  <h4 className="font-bold text-xs text-[#1C1B1A] truncate inline-block">{track.title}</h4>
                  <p className="text-[10px] text-[#5A5550] mt-1">By @{track.profiles?.username}</p>
                </div>
                <audio controls src={track.audio_url} className="w-full h-7 accent-[#111111]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-[#E7DED3] rounded-2xl bg-[#E7DED3]/30">
            <p className="text-[11px] text-[#5A5550] font-semibold flex items-center justify-center gap-1.5">
              🎵 No audio files uploaded yet. Be the first to publish a sound!
            </p>
          </div>
        )}
      </section>

      {/* PRODUCERS DATA RACK */}
      <section className="max-w-4xl mx-auto py-10 px-8 space-y-4">
        <h3 className="text-xs font-bold text-[#1C1B1A] flex items-center gap-1">⭐ Featured Producers</h3>
        {loading ? (
          <p className="text-[11px] text-[#5A5550]">Scanning creators...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-[#E7DED3] border border-[#D8CBBE] rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#111111] text-white font-serif font-black text-sm rounded-full flex items-center justify-center uppercase shadow-sm">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1B1A]">@{userCard.username}</h3>
                    <p className="text-[10px] text-[#5A5550] uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link href={`/${userCard.username || ''}`} className="px-4 py-1.5 bg-[#F6F1EA] hover:bg-[#E7DED3] text-[#111111] border border-[#D8CBBE] rounded-xl text-xs font-bold transition shadow-sm">
                  Follow
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-[#E7DED3] rounded-2xl bg-[#E7DED3]/30">
            <p className="text-[11px] text-[#5A5550] font-semibold flex items-center justify-center gap-1.5">
              🌱 The community is warming up. Be the first to establish a handle!
            </p>
          </div>
        )}
      </section>

      {/* SOFT PRE-FOOTER CTA BLOCK */}
      <section className="max-w-4xl mx-auto px-8 pb-16 pt-6">
        <div className="bg-[#E7DED3] rounded-3xl p-12 text-center space-y-6 border border-[#D8CBBE]/80">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-serif font-black text-[#1C1B1A] tracking-tight">Ready to share your sound?</h2>
            <p className="text-[11px] text-[#5A5550] leading-relaxed font-semibold">
              Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
            </p>
          </div>
          <div>
            <Link 
              href="/signin?view=signup" 
              className="inline-block px-7 py-3 bg-[#111111] hover:bg-[#2B2A27] text-white text-xs font-bold rounded-full transition shadow-md"
            >
              Get Started — It's Free →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto pb-8 px-8 text-[10px] text-[#5A5550] border-t border-[#E7DED3]/40 pt-6 text-center">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
