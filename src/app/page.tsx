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
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans antialiased">
      
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-sm border-b border-[#EAE6DA] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-neutral-900 uppercase">
            <span className="text-xl font-light tracking-tighter text-neutral-800 mr-0.5">川</span>
            Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-neutral-500 hover:text-black transition">
              Sign in to your Studio
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

      {/* HERO SECTION WITH PIANO BACKGROUND AND BEIGE OVERLAY */}
      <main 
        className="relative bg-[#FAF9F5] bg-cover bg-center bg-no-repeat border-b border-[#EAE6DA]/50"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(250, 249, 245, 0.85) 0%, rgba(250, 249, 245, 0.95) 100%), url('https://images.unsplash.com/photo-1552422535-c45813c61732?w=1800&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="max-w-6xl mx-auto pt-28 pb-32 px-6 space-y-8 relative z-10 text-center sm:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
            
            {/* ONE-LINE REFINED HEADLINE */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-900 leading-none truncate block">
              The Collective Canvas for Music Producers<span className="text-[#C5A880]">.</span>
            </h1>
            
            <p className="text-sm font-medium text-neutral-500 max-w-xl leading-relaxed mx-auto sm:mx-0 pt-2">
              Join a dedicated network of music creators sharing premium loops, melodies, samples, and architectural ideas. Upload your sounds. Get discovered.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <Link href="/signin?view=signup" className="px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center justify-center gap-2">
              Join the Community →
            </Link>
            <Link href="/library" className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-[#EAE6DA] hover:bg-white text-neutral-800 text-xs font-bold rounded-full transition text-center shadow-sm">
              Explore Sounds
            </Link>
          </div>

          {/* METRICS */}
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-sm mx-auto sm:mx-0 text-left border-t border-[#EAE6DA]/40">
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

      {/* RECENT UPLOADS CONTAINER */}
      <section className="max-w-6xl mx-auto py-16 px-6 space-y-6">
        <h2 className="text-base font-serif font-black text-neutral-900">🔥 Recent Studio Assets</h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading tracks...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-white border border-[#EAE6DA] rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
                <div className="truncate">
                  <span className="px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{track.genre || 'Loop'}</span>
                  <h4 className="font-bold text-xs text-neutral-900 truncate inline-block">{track.title}</h4>
                </div>
                <audio controls src={track.audio_url} className="h-7 w-40 accent-[#1E1E1E]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-[#EAE6DA] rounded-xl bg-white">
            <p className="text-xs text-neutral-400 font-medium">The deck is clear. Be the first to upload an audio asset!</p>
          </div>
        )}
      </section>

      {/* FEATURED CREATORS SECTION */}
      <section className="max-w-6xl mx-auto pb-20 px-6 space-y-6">
        <h2 className="text-base font-serif font-black text-neutral-900">⭐ Featured Producers</h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Scanning network profiles...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-white border border-[#EAE6DA] rounded-xl p-4 text-center space-y-2 shadow-sm">
                <div className="w-10 h-10 bg-neutral-900 text-white font-serif font-black text-sm rounded-full flex items-center justify-center mx-auto shadow-sm uppercase">
                  {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-neutral-900">@{userCard.username || 'producer'}</h3>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">{userCard.account_type || 'Producer'}</p>
                </div>
                <Link 
                  href={`/${userCard.username || ''}`}
                  className="block w-full py-1.5 text-center bg-[#FAF9F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-lg text-[10px] font-bold transition"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No creator profile handles registered yet.</p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto pb-8 px-6 text-[10px] text-neutral-400 border-t border-[#EAE6DA]/40 pt-6">
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
