'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  const [producersCount, setProducersCount] = useState(0);
  const [soundsCount, setSoundsCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        const { count: pCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (pCount) setProducersCount(pCount);

        const { count: sCount } = await supabase
          .from('sounds')
          .select('*', { count: 'exact', head: true });
        if (sCount) setSoundsCount(sCount);

        const { data: countryData } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        
        if (countryData) {
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
    <div className="min-h-screen bg-[#F4F7F4] text-[#1E291E] font-sans antialiased">
      
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#F4F7F4]/90 backdrop-blur-sm border-b border-[#D8E2D8] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-emerald-900 uppercase">
            <span className="text-xl font-light tracking-tighter text-[#7DA07D] mr-0.5">川</span>
            Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition">
              Sign in to your Studio
            </Link>
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2 bg-[#2D4A2D] hover:bg-[#223822] text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH SOOTHING GREEN PIANO BACKGROUND */}
      <main 
        className="relative bg-[#F4F7F4] bg-cover bg-center bg-no-repeat border-b border-[#D8E2D8]/60"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(244, 247, 244, 0.88) 0%, rgba(244, 247, 244, 0.96) 100%), url('https://images.unsplash.com/photo-1552422535-c45813c61732?w=1800&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="max-w-6xl mx-auto pt-28 pb-32 px-6 space-y-8 relative z-10 text-center sm:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#7DA07D] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
            
            {/* HEADLINE PRESERVED VERBATIM IN 1 LINE */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-emerald-950 leading-none truncate block">
              The Home for Music Producers<span className="text-[#7DA07D]">.</span>
            </h1>
            
            <p className="text-sm font-medium text-emerald-800/70 max-w-xl leading-relaxed mx-auto sm:mx-0 pt-2">
              Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <Link href="/signin?view=signup" className="px-6 py-3 bg-[#2D4A2D] hover:bg-[#223822] text-white text-xs font-bold rounded-full transition shadow-sm flex items-center justify-center gap-2">
              Join the Community →
            </Link>
            <Link href="/library" className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-[#D8E2D8] hover:bg-white text-emerald-900 text-xs font-bold rounded-full transition text-center shadow-sm">
              Explore Sounds
            </Link>
          </div>

          {/* METRICS */}
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-sm mx-auto sm:mx-0 text-left border-t border-[#D8E2D8]">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 text-sm">👥</span>
              <div>
                <p className="text-sm font-serif font-black text-emerald-950 leading-none">{producersCount}</p>
                <p className="text-[10px] text-emerald-700/60 font-medium mt-0.5">Producers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 text-sm">🎵</span>
              <div>
                <p className="text-sm font-serif font-black text-emerald-950 leading-none">{soundsCount}</p>
                <p className="text-[10px] text-emerald-700/60 font-medium mt-0.5">Sounds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 text-sm">🌐</span>
              <div>
                <p className="text-sm font-serif font-black text-emerald-950 leading-none">{countriesCount}</p>
                <p className="text-[10px] text-emerald-700/60 font-medium mt-0.5">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RECENT UPLOADS CONTAINER */}
      <section className="max-w-6xl mx-auto py-16 px-6 space-y-6">
        <h2 className="text-base font-serif font-black text-emerald-950">🔥 Recent Studio Assets</h2>

        {loading ? (
          <p className="text-xs text-emerald-700/60">Loading tracks...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-white border border-[#D8E2D8] rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
                <div className="truncate">
                  <span className="px-1.5 py-0.5 bg-[#2D4A2D] text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                  <h4 className="font-bold text-xs text-emerald-950 truncate inline-block">{track.title}</h4>
                </div>
                <audio controls src={track.audio_url} className="h-7 w-40 accent-[#2D4A2D]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-[#D8E2D8] rounded-xl bg-white">
            <p className="text-xs text-emerald-700/60 font-medium">The deck is clear. Be the first to upload an audio asset!</p>
          </div>
        )}
      </section>

      {/* FEATURED CREATORS SECTION */}
      <section className="max-w-6xl mx-auto pb-20 px-6 space-y-6">
        <h2 className="text-base font-serif font-black text-emerald-950">⭐ Featured Producers</h2>

        {loading ? (
          <p className="text-xs text-emerald-700/60">Scanning network profiles...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-white border border-[#D8E2D8] rounded-xl p-4 text-center space-y-2 shadow-sm">
                <div className="w-10 h-10 bg-[#2D4A2D] text-white font-serif font-black text-sm rounded-full flex items-center justify-center mx-auto shadow-sm uppercase">
                  {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950">@{userCard.username || 'producer'}</h3>
                  <p className="text-[9px] text-[#7DA07D] uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                </div>
                <Link 
                  href={`/${userCard.username || ''}`}
                  className="block w-full py-1.5 text-center bg-[#F4F7F4] hover:bg-emerald-50 text-emerald-900 border border-[#D8E2D8] rounded-lg text-[10px] font-bold transition"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-700/60">No creator profile handles registered yet.</p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto pb-8 px-6 text-[10px] text-emerald-700/50 border-t border-[#D8E2D8]/40 pt-6">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
