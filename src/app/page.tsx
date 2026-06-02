'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // State holding our network graph data
  const [stats, setStats] = useState({ producers: 0, sounds: 0, countries: 0 });
  const [trendingSounds, setTrendingSounds] = useState<any[]>([]);
  const [featuredProducers, setFeaturedProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetworkData() {
      try {
        // 1. Fetch dynamic counts
        const { count: producersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: soundsCount } = await supabase
          .from('sounds')
          .select('*', { count: 'exact', head: true });

        const { data: countryData } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        
        const uniqueCountriesCount = countryData 
          ? new Set(countryData.map(p => p.country?.toLowerCase().trim())).size 
          : 0;

        setStats({
          producers: producersCount || 0,
          sounds: soundsCount || 0,
          countries: uniqueCountriesCount || 0
        });

        // 2. Fetch audio uploads
        const { data: sounds } = await supabase
          .from('sounds')
          .select(`
            id,
            title,
            genre,
            audio_url,
            profiles (
              username
            )
          `)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (sounds) setTrendingSounds(sounds);

        // 3. Fetch registered profiles
        const { data: prods } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .limit(3);
        
        if (prods) setFeaturedProducers(prods);

      } catch (err) {
        console.error('Network graph fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNetworkData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans antialiased">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5] border-b border-[#EAE6DA] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-neutral-900">
            <span className="text-xl font-light tracking-tighter text-neutral-800 mr-0.5">川</span>
            SAAB
          </Link>
          <div className="text-xs font-semibold text-neutral-500 hover:text-black transition">
            <Link href="/signin">Sign in to your Dashboard</Link>
          </div>
          <div>
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
      <main className="max-w-4xl mx-auto pt-14 pb-12 px-4 text-left space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-neutral-900 leading-[1.15]">
            The Home for <br />Music Producers<span className="text-[#C5A880]">.</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500 max-w-xl leading-relaxed">
            Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full sm:w-auto">
          <Link href="/signin?view=signup" className="px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center justify-center gap-2">
            Join the Community →
          </Link>
          <Link href="/library" className="px-6 py-3 bg-transparent border border-[#EAE6DA] hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition text-center">
            Explore Sounds
          </Link>
        </div>

        {/* METRICS PANEL */}
        <div className="pt-6 grid grid-cols-3 gap-2 max-w-md text-left">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">👥</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">{stats.producers}</p>
              <p className="text-[10px] text-neutral-400 font-medium">Producers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">🎵</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">{stats.sounds}</p>
              <p className="text-[10px] text-neutral-400 font-medium">Sounds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">🌐</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">{stats.countries}</p>
              <p className="text-[10px] text-neutral-400 font-medium">Countries</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE PREVIEW IMAGE */}
        <div className="pt-4">
          <div className="rounded-2xl overflow-hidden border border-[#EAE6DA] shadow-sm bg-neutral-100 aspect-[16/10]">
            <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Studio Setup Workspace Layout" />
          </div>
        </div>

        {/* AUDIO RACK DISPLAY */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900">🔥 Recent Uploads</h2>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-400 font-medium">Polling studio assets...</p>
          ) : trendingSounds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trendingSounds.map((sound: any) => (
                <div key={sound.id} className="bg-white border border-[#EAE6DA] rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div className="truncate">
                    <span className="px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded tracking-wide uppercase mr-2">{sound.genre || 'Loop'}</span>
                    <h4 className="font-bold text-xs text-neutral-900 truncate inline-block">{sound.title}</h4>
                    <p className="text-[10px] text-neutral-400 truncate">by @{sound.profiles?.username || 'producer'}</p>
                  </div>
                  <audio controls src={sound.audio_url} className="h-7 w-40 accent-[#1E1E1E]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-[#EAE6DA] rounded-xl bg-white">
              <p className="text-xs text-neutral-400 font-medium">The deck is clear. Be the first to upload an audio asset!</p>
            </div>
          )}
        </div>

        {/* PRODUCERS HIGHLIGHT CARDS CONTAINER */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900">⭐ Featured Producers</h2>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-400 font-medium">Scanning network handles...</p>
          ) : featuredProducers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredProducers.map((prod: any) => (
                <div key={prod.id} className="bg-white border border-[#EAE6DA] rounded-xl p-4 text-center space-y-2 shadow-sm">
                  <div className="w-10 h-10 bg-neutral-900 text-white font-serif font-black text-sm rounded-full flex items-center justify-center mx-auto shadow-sm uppercase">
                    {prod.display_name?.charAt(0) || prod.username?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900">@{prod.username}</h3>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">{prod.account_type || 'Producer'}</p>
                  </div>
                  <Link 
                    href={`/${prod.username}`}
                    className="block w-full py-1.5 text-center bg-[#FAF9F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-lg text-[10px] font-bold transition"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">No creator profile handles registered yet.</p>
          )}
        </div>

        <footer className="pt-10 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-medium text-neutral-400 border-t border-[#EAE6DA]/40">
          <p>© 2026 Producer Saab. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
