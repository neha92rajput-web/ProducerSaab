'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // Dynamic state arrays synced to real database entries
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
            category,
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
        console.error('Studio network data stream failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#5A5550] font-sans antialiased selection:bg-[#E7DED3] selection:text-[#1C1B1A]">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#F6F1EA]/80 backdrop-blur-md border-b border-[#E7DED3] px-8 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-sans font-black tracking-[0.2em] text-sm text-[#1C1B1A] uppercase transition hover:opacity-80">
            <span className="text-xl font-light tracking-tighter text-[#C89B6D]">川</span>
            Producer Saab
          </Link>

          {/* Navigation Center Links */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest text-[#5A5550]">
            <Link href="/library" className="hover:text-[#1C1B1A] transition-colors duration-200">Sound Library</Link>
            <Link href="/signin" className="hover:text-[#1C1B1A] transition-colors duration-200">Producer Community</Link>
          </nav>

          {/* Right Authentication Hub Splitters */}
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-[#1C1B1A] hover:text-[#5A5550] transition-colors duration-200">
              Sign in to you Studio
            </Link>
            <div className="h-3 w-[1px] bg-[#D8CBBE] hidden sm:block" />
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2 bg-[#111111] hover:bg-[#2B2A27] text-[#FFFFFF] text-xs font-semibold rounded-full transition-all duration-300 transform active:scale-95 shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO CONTAINER */}
      <main 
        className="relative min-h-[580px] flex items-center bg-[#E7DED3] bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(246, 241, 234, 0.96) 35%, rgba(246, 241, 234, 0.82) 65%, rgba(246, 241, 234, 0.4) 100%), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1C1B1A_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-6xl mx-auto w-full px-8 pt-20 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Block Column */}
          <div className="lg:col-span-9 xl:col-span-8 space-y-8 text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[#1C1B1A] uppercase tracking-[0.25em] bg-[#1C1B1A]/5 px-2.5 py-1 rounded w-max backdrop-blur-sm">WELCOME TO PRODUCER SAAB</p>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#1C1B1A] whitespace-nowrap">
                The Home for Music Producers
              </h1>
              
              <div className="max-w-xl space-y-4">
                <p className="text-sm leading-relaxed text-[#1C1B1A]/80 font-medium">
                  Join a community of music creators sharing tracks, loops, melodies, samples, and beats. Upload your audio, connect with collaborators, get discovered.
                </p>
                <p className="text-base sm:text-lg text-[#1C1B1A] font-medium tracking-wide border-l-2 border-[#3F5A3A] pl-4">
                  Build your Studio and grow your audience.
                </p>
              </div>
            </div>

            {/* Feature row border line and columns with the test exclamation mark added below */}
            <div className="pt-16 mt-4 grid grid-cols-3 gap-6 max-w-xl text-left border-t border-[#1C1B1A]/10">
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wide text-[#1C1B1A] flex items-center gap-1.5">
                  <span className="text-[#3F5A3A]">●</span> Upload Your Audio
                </h4>
                <p className="text-[11px] text-[#5A5550] font-medium">Share your best work!</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wide text-[#1C1B1A] flex items-center gap-1.5">
                  <span className="text-[#3F5A3A]">●</span> Connect & Collaborate
                </h4>
                <p className="text-[11px] text-[#5A5550] font-medium">Work with creators</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wide text-[#1C1B1A] flex items-center gap-1.5">
                  <span className="text-[#3F5A3A]">●</span> Build Your Studio
                </h4>
                <p className="text-[11px] text-[#5A5550] font-medium">Grow your audience</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-3 xl:col-span-4" />

        </div>
      </main>

      {/* 3. BRAND MANIFESTO HEADER */}
      <section className="max-w-6xl mx-auto pt-24 pb-12 px-8 text-center space-y-3">
        <p className="text-xs sm:text-sm font-bold text-[#C89B6D] uppercase tracking-[0.25em] font-sans">WHY JOIN PRODUCER SAAB?</p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-normal tracking-tight text-[#1C1B1A]">
          Everything you need to grow as a Music creator
        </h2>
      </section>

      {/* 4. FOUR-COLUMN VALUE PROPOSPOSITIONS */}
      <section className="max-w-4xl mx-auto pb-20 px-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-base text-[#C89B6D]">🎧</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Showcase Your Sound</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Upload your loops, melodies, MIDI, and samples.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-base text-[#C89B6D]">👤</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Build Your Audience</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Gain followers and grow your producer profile.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-base text-[#C89B6D]">✨</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Discover Talent</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Find and connect with producers worldwide.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#E7DED3] rounded-2xl flex items-center justify-center shadow-sm text-base text-[#C89B6D]">⏱️</div>
            <h3 className="font-sans font-bold text-xs text-[#1C1B1A]">Collaborate & Grow</h3>
            <p className="text-[11px] text-[#5A5550] font-medium leading-relaxed max-w-xs">Find collaborators, learn, and create opportunities.</p>
          </div>
        </div>
      </section>

      {/* 5. TRENDING SOUNDS MODULE */}
      <section className="max-w-4xl mx-auto py-10 px-8 space-y-4 border-t border-[#E7DED3]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C1B1A] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F5A3A]" /> Trending Sounds
        </h3>
        {loading ? (
          <p className="text-[11px] text-[#5A5550]">Loading tracks...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUploads.map((track) => (
              <div key={track.id} className="border border-[#E7DED3] rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-[#D8CBBE] transition-all duration-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-[#1C1B1A] truncate">{track.title}</h4>
                    <p className="text-[10px] text-[#5A5550] mt-0.5">By @{track.profiles?.username}</p>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#E7DED3] text-[#1C1B1A] text-[8px] font-bold uppercase rounded tracking-wider shrink-0">{track.category || 'Sound'}</span>
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

      {/* 6. FEATURED CREATORS MODULE */}
      <section className="max-w-4xl mx-auto py-10 px-8 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C1B1A] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F5A3A]" /> Featured Producers
        </h3>
        {loading ? (
          <p className="text-[11px] text-[#5A5550]">Scanning creators...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="border border-[#E7DED3] rounded-xl p-5 flex items-center justify-between hover:border-[#D8CBBE] transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#111111] text-[#FFFFFF] font-serif text-xs font-normal rounded-full flex items-center justify-center uppercase shadow-sm">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#1C1B1A]">@{userCard.username}</h3>
                    <p className="text-[10px] text-[#5A5550] uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link href={`/${userCard.username || ''}`} className="px-4 py-1.5 bg-[#FFFFFF] hover:bg-[#E7DED3] text-[#111111] border border-[#E7DED3] rounded-xl text-[11px] font-bold transition-all shadow-sm">
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
      </section> clergyman

      {/* 7. PRE-FOOTER INVITATION BANNER */}
      <section className="max-w-4xl mx-auto px-8 pb-16 pt-6">
        <div className="bg-[#E7DED3]/40 border border-[#E7DED3] rounded-[2rem] p-12 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#1C1B1A] tracking-tight">Ready to share your sound?</h2>
            <p className="text-xs text-[#5A5550] leading-relaxed max-sm mx-auto">
              Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
            </p>
          </div>
          <div>
            <Link 
              href="/signin?view=signup" 
              className="inline-block px-8 py-3 bg-[#111111] hover:bg-[#2B2A27] text-[#FFFFFF] text-xs font-bold rounded-full transition-all duration-300 transform active:scale-95 shadow-md"
            >
              Get Started — It's Free →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto pb-8 px-8 text-[10px] uppercase tracking-widest text-[#5A5550] border-t border-[#E7DED3]/40 pt-8 text-center font-semibold">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
