'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  // Dynamic Metrics Counters
  const [producersCount, setProducersCount] = useState(0);
  const [soundsCount, setSoundsCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  
  // Dynamic Lists from Database
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        // 1. Fetch real producer count
        const { count: pCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (pCount) setProducersCount(pCount);

        // 2. Fetch real sound count
        const { count: sCount } = await supabase
          .from('sounds')
          .select('*', { count: 'exact', head: true });
        if (sCount) setSoundsCount(sCount);

        // 3. Fetch distinct countries count
        const { data: countryData } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        
        if (countryData) {
          const distinct = new Set(countryData.map(item => String(item.country || '').toLowerCase().trim()));
          setCountriesCount(distinct.size);
        }

        // 4. Fetch actual trending sounds
        const { data: soundRecords } = await supabase
          .from('sounds')
          .select('id, title, genre, audio_url, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(6);
        if (soundRecords) setRecentUploads(soundRecords);

        // 5. Fetch actual producer profiles
        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .limit(4);
        if (profileRecords) setNetworkProfiles(profileRecords);

      } catch (err) {
        console.error('Ecosystem layout sync failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans antialiased">
      
      {/* 1. HEADER BRAND PLACEMENT */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-sm border-b border-[#EAE6DA] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-neutral-900 uppercase">
            <span className="text-xl font-light tracking-tighter text-neutral-800 mr-0.5">川</span>
            Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-neutral-600 hover:text-black transition">
              Log in
            </Link>
            <Link 
              href="/signin?view=signup" 
              className="px-5 py-2.5 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO TEXT AND LAYOUT ENTRY */}
      <main className="max-w-5xl mx-auto pt-16 pb-12 px-6 space-y-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">WELCOME TO PRODUCER SAAB</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-neutral-900 leading-[1.1]">
            The Home for <br />Music Producers<span className="text-[#C5A880]">.</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500 leading-relaxed pt-1">
            Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
          </p>
        </div>

        {/* HERO CALL TO ACTION INTERACTIVE BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link href="/signin?view=signup" className="px-8 py-3.5 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm text-center">
            Join the Community →
          </Link>
          <Link href="/library" className="px-8 py-3.5 bg-transparent border border-[#EAE6DA] hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition text-center">
            Explore Sounds
          </Link>
        </div>

        {/* 3. DYNAMIC LIVE COUNTERS ROW */}
        <div className="pt-4 flex items-center gap-10 text-left border-b border-[#EAE6DA]/60 pb-10">
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400 text-base">👥</span>
            <div>
              <p className="text-base font-serif font-black text-neutral-900 leading-none">
                {producersCount === 0 ? "12K+" : `${producersCount}+`}
              </p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-wider">Producers</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400 text-base">🎵</span>
            <div>
              <p className="text-base font-serif font-black text-neutral-900 leading-none">
                {soundsCount === 0 ? "120K+" : `${soundsCount}+`}
              </p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-wider">Sounds</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400 text-base">🌐</span>
            <div>
              <p className="text-base font-serif font-black text-neutral-900 leading-none">
                {countriesCount === 0 ? "50+" : `${countriesCount}+`}
              </p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-wider">Countries</p>
            </div>
          </div>
        </div>

        {/* 4. THE SUNLIT PIANO DESK PICTURE CONTAINER */}
        <div className="pt-4">
          <div className="rounded-[2.5rem] overflow-hidden border border-[#EAE6DA] shadow-sm bg-neutral-100 aspect-[16/10] sm:aspect-[21/10]">
            <img 
              src="https://images.unsplash.com/photo-1552422535-c45813c61732?w=1600&auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover select-none" 
              alt="Producer Studio Layout Desk" 
            />
          </div>
        </div>
      </main>

      {/* 5. FEATURES LIST LAYER */}
      <section className="max-w-4xl mx-auto py-16 px-6 text-center space-y-16">
        <h2 className="text-3xl font-sans font-black text-neutral-900 tracking-tight">
          Why Join Produc<span className="text-[#C5A880]">er</span> Saab?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-16 max-w-2xl mx-auto">
          {/* Feature 1 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#F2EDE2] rounded-2xl flex items-center justify-center shadow-sm text-neutral-700 font-bold">🎧</div>
            <h3 className="font-sans font-black text-sm text-neutral-900">Showcase Your Sound</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-xs">Upload your loops, melodies, MIDI, and samples.</p>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#F2EDE2] rounded-2xl flex items-center justify-center shadow-sm text-neutral-700 font-bold">👤</div>
            <h3 className="font-sans font-black text-sm text-neutral-900">Build Your Audience</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-xs">Gain followers and grow your producer profile.</p>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#F2EDE2] rounded-2xl flex items-center justify-center shadow-sm text-neutral-700 font-bold">✨</div>
            <h3 className="font-sans font-black text-sm text-neutral-900">Discover Talent</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-xs">Find and connect with producers worldwide.</p>
          </div>
          {/* Feature 4 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-[#F2EDE2] rounded-2xl flex items-center justify-center shadow-sm text-neutral-700 font-bold">⚒️</div>
            <h3 className="font-sans font-black text-sm text-neutral-900">Collaborate & Grow</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-xs">Find collaborators, learn, and create opportunities.</p>
          </div>
        </div>
      </section>

      {/* 6. TRENDING SOUNDS MODULE DECK */}
      <section className="max-w-5xl mx-auto py-12 px-6 space-y-6 border-t border-[#EAE6DA]/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-black text-neutral-900 flex items-center gap-2">🔥 Trending Sounds</h2>
          <Link href="/library" className="text-xs font-bold text-neutral-500 hover:text-black transition flex items-center gap-1">
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading audio engine rack...</p>
        ) : recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentUploads.map((track) => (
              <div key={track.id} className="bg-white border border-[#EAE6DA] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-4 space-y-4">
                <div className="aspect-square w-full rounded-xl bg-neutral-900 flex flex-col justify-end p-4 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=60')`, backgroundSize: 'cover' }}>
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black rounded uppercase tracking-wide">0:24</span>
                  <div>
                    <span className="px-1.5 py-0.5 bg-white text-black text-[8px] font-black rounded uppercase tracking-wide block w-max mb-1.5">{track.genre || 'Loop'}</span>
                    <h4 className="font-bold text-sm text-white truncate">{track.title}</h4>
                    <p className="text-[10px] text-neutral-300">Creator Asset</p>
                  </div>
                </div>
                <audio controls src={track.audio_url} className="w-full h-8 accent-[#1E1E1E]" />
              </div>
            ))}
          </div>
        ) : (
          /* High-End Empty State Fallback Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#EAE6DA] rounded-3xl p-4 space-y-4 shadow-sm">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60')", backgroundSize: 'cover' }} />
              <div>
                <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[8px] font-black rounded uppercase">TRAP</span>
                <h4 className="font-bold text-xs text-neutral-900 mt-2">Dark Trap Melody</h4>
                <p className="text-[10px] text-neutral-400 font-medium">Waiting for your first upload</p>
              </div>
            </div>
            <div className="bg-white border border-[#EAE6DA] rounded-3xl p-4 space-y-4 shadow-sm">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60')", backgroundSize: 'cover' }} />
              <div>
                <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[8px] font-black rounded uppercase">DRILL</span>
                <h4 className="font-bold text-xs text-neutral-900 mt-2">UK Drill Loop</h4>
                <p className="text-[10px] text-neutral-400 font-medium">Waiting for your first upload</p>
              </div>
            </div>
            <div className="bg-white border border-[#EAE6DA] rounded-3xl p-4 space-y-4 shadow-sm">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60')", backgroundSize: 'cover' }} />
              <div>
                <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[8px] font-black rounded uppercase">R&B</span>
                <h4 className="font-bold text-xs text-neutral-900 mt-2">R&B Piano Chords</h4>
                <p className="text-[10px] text-neutral-400 font-medium">Waiting for your first upload</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 7. FEATURED PRODUCERS CREATOR DIRECTORY */}
      <section className="max-w-5xl mx-auto py-12 px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-black text-neutral-900 flex items-center gap-2">⭐ Featured Producers</h2>
          <Link href="/signin" className="text-xs font-bold text-neutral-500 hover:text-black transition flex items-center gap-1">
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading handles map...</p>
        ) : networkProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkProfiles.map((userCard) => (
              <div key={userCard.id} className="bg-white border border-[#EAE6DA] rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-900 text-white font-serif font-black rounded-full flex items-center justify-center uppercase shadow-inner">
                    {String(userCard.display_name || userCard.username || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">@{userCard.username || 'producer'}</h3>
                    <p className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wide">{userCard.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link 
                  href={`/${userCard.username || ''}`}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Follow
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* High-End Fallback Profiles if database has zero entries */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#EAE6DA] rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-900 text-white font-serif font-black rounded-full flex items-center justify-center">P</div>
                <div>
                  <h3 className="font-black text-sm text-neutral-900">ProdJay</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold">Trap Producer</p>
                </div>
              </div>
              <button className="px-5 py-2 bg-[#FAF9F5] border border-[#EAE6DA] text-neutral-800 text-xs font-bold rounded-xl shadow-sm">Follow</button>
            </div>
            <div className="bg-white border border-[#EAE6DA] rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-800 text-white font-serif font-black rounded-full flex items-center justify-center">L</div>
                <div>
                  <h3 className="font-black text-sm text-neutral-900">LunaBeats</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold">Drill Producer</p>
                </div>
              </div>
              <button className="px-5 py-2 bg-[#FAF9F5] border border-[#EAE6DA] text-neutral-800 text-xs font-bold rounded-xl shadow-sm">Follow</button>
            </div>
          </div>
        )}
      </section>

      {/* 8. CALL TO ACTION PRE-FOOTER BANNER BLOCK */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="bg-[#1E1E1E] rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-serif font-black text-white tracking-tight">Ready to share your sound?</h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <Link href="/signin?view=signup" className="inline-block px-8 py-3.5 bg-white hover:bg-neutral-100 text-black text-xs font-black rounded-full transition shadow-md">
              Get Started — It's Free →
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* 9. COMPLETE ALIGNED FOOTER MAP */}
      <footer className="max-w-5xl mx-auto py-12 px-6 space-y-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
            <Link href="/" className="hover:text-black transition">About</Link>
            <Link href="/" className="hover:text-black transition">Terms</Link>
            <Link href="/" className="hover:text-black transition">Privacy</Link>
            <Link href="/" className="hover:text-black transition">Contact</Link>
          </div>
          <div className="text-[10px] text-neutral-400 font-medium tracking-wide">
            <p>© 2026 Producer Saab. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
