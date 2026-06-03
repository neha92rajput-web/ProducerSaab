'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  const [producersCount, setProducersCount] = useState(12000); // 12K+ template placeholder
  const [soundsCount, setSoundsCount] = useState(120000); // 120K+ template placeholder
  const [countriesCount, setCountriesCount] = useState(50); // 50+ template placeholder
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        const { count: pCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (pCount && pCount > 0) setProducersCount(pCount);

        const { count: sCount } = await supabase
          .from('sounds')
          .select('*', { count: 'exact', head: true });
        if (sCount && sCount > 0) setSoundsCount(sCount);

        const { data: countryData } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        
        if (countryData && countryData.length > 0) {
          const distinct = new Set(countryData.map(item => String(item.country || '').toLowerCase().trim()));
          setCountriesCount(distinct.size);
        }

        const { data: soundRecords } = await supabase
          .from('sounds')
          .select('id, title, genre, audio_url')
          .order('created_at', { ascending: false })
          .limit(4);
        if (soundRecords) setRecentUploads(soundRecords);

        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .limit(3);
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1E1E] font-sans antialiased selection:bg-[#C5A880]/20">
      
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE6DA]/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-sans font-black tracking-widest text-lg text-neutral-900 uppercase">
            <span className="text-xl font-light tracking-tighter text-[#C5A880]">川</span>
            Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-neutral-600 hover:text-black transition">
              Log in
            </Link>
            <Link 
              href="/signin?view=signup" 
              className="px-6 py-2.5 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH WARM TROPICAL GRADIENT BACKGROUND */}
      <section className="bg-gradient-to-b from-[#FDFBF7] via-[#F7F2E8] to-[#FDFBF7] pt-10 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* METRICS ROW (MATCHING THE TOP BADGES IN IMAGE_12) */}
          <div className="flex items-center gap-8 border-b border-[#EAE6DA]/40 pb-6 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 text-base">👥</span>
              <div>
                <p className="text-sm font-black text-neutral-900 leading-none">{producersCount >= 1000 ? `${(producersCount/1000).toFixed(0)}K+` : `${producersCount}+`} </p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Producers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 text-base">🎵</span>
              <div>
                <p className="text-sm font-black text-neutral-900 leading-none">{soundsCount >= 1000 ? `${(soundsCount/1000).toFixed(0)}K+` : `${soundsCount}+`}</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Sounds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 text-base">🌐</span>
              <div>
                <p className="text-sm font-black text-neutral-900 leading-none">{countriesCount}+</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Countries</p>
              </div>
            </div>
          </div>

          {/* MAIN HERO CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-6">
              <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
              <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-neutral-900 leading-[1.15]">
                The Home for <br />Music Producers<span className="text-[#C5A880]">.</span>
              </h1>
              <p className="text-sm font-medium text-neutral-500 max-w-md leading-relaxed">
                Join a selective community of producers sharing premium loops, melodies, samples, and architectural audio assets.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link href="/signin?view=signup" className="px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm">
                  Join the Community →
                </Link>
                <Link href="/library" className="px-6 py-3 bg-white border border-[#EAE6DA] hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition text-center shadow-sm">
                  Explore Sounds
                </Link>
              </div>
            </div>

            {/* THE TROPICAL SUNLIT COMPOSITION IMAGE CONTAINER */}
            <div className="md:col-span-7 relative">
              <div className="rounded-[2.5rem] overflow-hidden border border-[#EAE6DA]/60 shadow-lg bg-neutral-100 aspect-[5/4] relative z-10">
                {/* Clean, sunlit desk image mirroring the aesthetic tone of headphones, keys, and warm succulent look */}
                <img 
                  src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover select-none" 
                  alt="Sunlit Creative Studio Setup" 
                />
              </div>
              {/* Subtle background abstract gradient glowing behind the picture frame */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#C5A880]/10 via-transparent to-[#EAE6DA]/30 blur-2xl rounded-[3rem] z-0 pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* BLOCK SUB SECTION: WHY JOIN PRODUCER SAAB? */}
      <section className="max-w-5xl mx-auto py-16 px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-black tracking-tight text-neutral-900">
            Why Join Produc<span className="text-[#C5A880]">er</span> Saab?
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4 rounded-full" />
        </div>

        {/* AUDIO TRACK RACK MODULE */}
        <div className="space-y-4 max-w-4xl mx-auto pt-4">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">🔥 Recent Ecosystem Releases</h3>
          {loading ? (
            <p className="text-xs text-neutral-400">Loading tracks...</p>
          ) : recentUploads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentUploads.map((track) => (
                <div key={track.id} className="bg-white border border-[#EAE6DA] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-[#C5A880]/50 transition">
                  <div className="truncate">
                    <span className="px-2 py-0.5 bg-neutral-900 text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                    <h4 className="font-bold text-xs text-neutral-900 truncate inline-block">{track.title}</h4>
                  </div>
                  <audio controls src={track.audio_url} className="h-7 w-40 accent-[#1E1E1E]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-[#EAE6DA] rounded-2xl bg-white">
              <p className="text-xs text-neutral-400 font-medium">No files uploaded yet. Be the first to start the wavelength!</p>
            </div>
          )}
        </div>

        {/* FEATURED CREATORS ROW */}
        <div className="space-y-4 max-w-4xl mx-auto pt-6">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">⭐ Verified Studio Leads</h3>
          {loading ? (
            <p className="text-xs text-neutral-400">Scanning network profiles...</p>
          ) : networkProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {networkProfiles.map((userCard) => (
                <div key={userCard.id} className="bg-white border border-[#EAE6DA] rounded-2xl p-5 text-center space-y-3 shadow-sm hover:border-[#C5A880]/50 transition">
                  <div className="w-12 h-12 bg-neutral-900 text-[#FAF9F5] font-serif font-black text-base rounded-full flex items-center justify-center mx-auto shadow-sm uppercase">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900">@{userCard.username || 'producer'}</h3>
                    <p className="text-[9px] text-[#C5A880] uppercase tracking-wider font-bold mt-0.5">{userCard.account_type || 'Producer'}</p>
                  </div>
                  <Link 
                    href={`/${userCard.username || ''}`}
                    className="block w-full py-2 text-center bg-[#FDFBF7] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-xl text-[10px] font-bold transition"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">Waiting for incoming creators to verify handles.</p>
          )}
        </div>
      </section>

      {/* GLOBAL FOOTER METADATA */}
      <footer className="max-w-5xl mx-auto mt-12 py-8 px-6 text-center border-t border-[#EAE6DA]/40 text-[10px] text-neutral-400 font-medium tracking-wide">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
