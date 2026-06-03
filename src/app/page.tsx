'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // Resetting metrics strictly to 0 initially
  const [producersCount, setProducersCount] = useState<number>(0);
  const [soundsCount, setSoundsCount] = useState<number>(0);
  const [countriesCount, setCountriesCount] = useState<number>(0);
  
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        // 1. Fetch real producer count from database
        const { count: pCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (pCount) setProducersCount(pCount);

        // 2. Fetch real sound count from database
        const { count: sCount } = await supabase
          .from('sounds')
          .select('*', { count: 'exact', head: true });
        if (sCount) setSoundsCount(sCount);

        // 3. Fetch real distinct countries count from database
        const { data: countryData } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        
        if (countryData && countryData.length > 0) {
          const distinct = new Set(countryData.map(item => String(item.country || '').toLowerCase().trim()));
          setCountriesCount(distinct.size);
        }

        // 4. Fetch sounds dynamically linked to a real profile
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

        // 5. Fetch genuine registered creators
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

  return (
    <div className="min-h-screen bg-[#EFECE2] text-[#1E1E1E] font-sans antialiased">
      
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#EFECE2]/95 backdrop-blur-sm border-b border-[#DCD8CD] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-neutral-900 uppercase">
            <span className="text-xl font-light tracking-tighter text-neutral-500 mr-0.5">川</span>
            Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-neutral-600 hover:text-black transition">
              Log in
            </Link>
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main 
        className="relative bg-[#EFECE2] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(239, 236, 226, 0.85) 0%, rgba(239, 236, 226, 0.98) 100%), url('https://images.unsplash.com/photo-1552422535-c45813c61732?w=1800&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="max-w-6xl mx-auto pt-24 pb-24 px-6 space-y-8 relative z-10 text-center sm:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-900 leading-none truncate block">
              The Home for Music Producers<span className="text-[#C5A880]">.</span>
            </h1>
            
            <p className="text-sm font-medium text-neutral-600 max-w-xl leading-relaxed mx-auto sm:mx-0 pt-2">
              Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <Link href="/signin?view=signup" className="px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center justify-center gap-2">
              Join the Community →
            </Link>
            <Link href="/library" className="px-6 py-3 bg-white/30 border border-[#DCD8CD] hover:bg-white/70 text-neutral-800 text-xs font-bold rounded-full transition text-center shadow-sm">
              Explore Sounds
            </Link>
          </div>

          {/* METRICS (Now displaying purely 0 if database is empty) */}
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-sm mx-auto sm:mx-0 text-left border-t border-[#DCD8CD]">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">👥</span>
              <div>
                <p className="text-sm font-serif font-black text-neutral-900 leading-none">{producersCount}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Producers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">🎵</span>
              <div>
                <p className="text-sm font-serif font-black text-neutral-900 leading-none">{soundsCount}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Sounds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">🌐</span>
              <div>
                <p className="text-sm font-serif font-black text-neutral-900 leading-none">{countriesCount}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* WHY JOIN PRODUCER SAAB FEATURE GRID */}
      <section className="max-w-4xl mx-auto py-20 px-6 text-center space-y-16 border-t border-[#DCD8CD]/60">
        <div>
          <h2 className="text-3xl font-sans font-black text-neutral-900 tracking-tight">
            Why Join Produc<span className="text-[#C5A880]">er</span> Saab?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-[#E5E1D4] rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#C5A880]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M4 18h16a1 1 0 001-1v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-neutral-900">Showcase Your Sound</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs">Upload your loops, melodies, MIDI, and samples.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-[#E5E1D4] rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#C5A880]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-neutral-900">Build Your Audience</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs">Gain followers and grow your producer profile.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-[#E5E1D4] rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#C5A880]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-neutral-900">Discover Talent</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs">Find and connect with producers worldwide.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-[#E5E1D4] rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-[#C5A880]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-neutral-900">Collaborate & Grow</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs">Find collaborators, learn, and create opportunities.</p>
          </div>
        </div>
      </section>

      {/* TRENDING SOUNDS MODULE DECK */}
      <section className="max-w-6xl mx-auto py-12 px-6 space-y-6 border-t border-[#DCD8CD]/60">
        <h2 className="text-xl font-serif font-black text-neutral-900">🔥 Trending Sounds</h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading tracks...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-[#E5E1D4] border border-[#DCD8CD] rounded-2xl p-4 space-y-4 shadow-sm">
                <div>
                  <span className="px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                  <h4 className="font-bold text-xs text-neutral-900 truncate inline-block">{track.title}</h4>
                  <p className="text-[10px] text-neutral-500 mt-1">By @{(track.profiles as any)?.username || 'artist'}</p>
                </div>
                <audio controls src={track.audio_url} className="w-full h-7 accent-[#1E1E1E]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#DCD8CD] rounded-2xl bg-[#E5E1D4]/40">
            <p className="text-xs text-neutral-400 font-bold tracking-wide">
              🎵 No audio files uploaded yet. Be the first to publish a sound!
            </p>
          </div>
        )}
      </section>

      {/* FEATURED CREATORS SECTION */}
      <section className="max-w-6xl mx-auto pb-16 px-6 space-y-6">
        <h2 className="text-xl font-serif font-black text-neutral-900">⭐ Featured Producers</h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Scanning network profiles...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-[#E5E1D4] border border-[#DCD8CD] rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-neutral-900 text-white font-serif font-black text-sm rounded-full flex items-center justify-center uppercase shadow-sm">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">@{userCard.username || 'producer'}</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link 
                  href={`/${userCard.username || ''}`}
                  className="px-4 py-1.5 bg-[#EFECE2] hover:bg-neutral-100 text-neutral-800 border border-[#DCD8CD] rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Follow
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[#DCD8CD] rounded-2xl bg-[#E5E1D4]/40">
            <p className="text-xs text-neutral-400 font-bold tracking-wide">
              🌱 The community is warming up. Be the first to establish a handle!
            </p>
          </div>
        )}
      </section>

      {/* SUMMER LIGHT PRE-FOOTER CARD */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-[#E2DDD0] rounded-[2.5rem] p-10 sm:p-14 text-center space-y-5 border border-[#D0C9BA]">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 tracking-tight">Ready to share your sound?</h2>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
            </p>
          </div>
          <div className="grid pt-2">
            <div>
              <Link href="/signin?view=signup" className="inline-block px-7 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm">
                Get Started — It's Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <footer className="max-w-6xl mx-auto pb-8 px-6 text-[10px] text-neutral-400 border-t border-[#DCD8CD]/40 pt-6 text-center">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
