import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  // 1. DYNAMIC STATS CALCULATIONS (REAL NUMBERS ONLY)
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

  // 2. FETCH REAL RECENT UPLOADS
  const { data: trendingSounds } = await supabase
    .from('sounds')
    .select(`
      id,
      title,
      genre,
      audio_url,
      created_at,
      profiles (
        username,
        display_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  // 3. FETCH REAL REGISTERED PRODUCERS
  const { data: featuredProducers } = await supabase
    .from('profiles')
    .select('id, username, display_name, account_type')
    .limit(3);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans antialiased">
      
      {/* EXACT VIDEO NAVBAR BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5] border-b border-[#EAE6DA] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Logo Icon and Text String */}
          <Link href="/" className="flex items-center gap-1.5 font-sans font-black tracking-widest text-lg text-neutral-900">
            <span className="text-xl font-light tracking-tighter text-neutral-800 mr-0.5">川</span>
            SAAB
          </Link>

          {/* Centered Routing Interface Element */}
          <div className="text-xs font-semibold text-neutral-500 hover:text-black transition">
            <Link href="/signin">Sign in</Link>
          </div>

          {/* Action Trigger Navigation */}
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

      {/* HERO HERO TITLE BLOCK */}
      <main className="max-w-4xl mx-auto pt-14 pb-12 px-4 text-left space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">
            WELCOME TO PRODUCER SAAB
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-neutral-900 leading-[1.15]">
            The Home for <br />Music Producers<span className="text-[#C5A880]">.</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500 max-w-xl leading-relaxed">
            Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
          </p>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full sm:w-auto">
          <Link 
            href="/signin?view=signup" 
            className="px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center justify-center gap-2"
          >
            Join the Community →
          </Link>
          <Link 
            href="/library" 
            className="px-6 py-3 bg-transparent border border-[#EAE6DA] hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition text-center"
          >
            Explore Sounds
          </Link>
        </div>

        {/* METRICS COUNT PANEL OPERATING ON REAL NUMBERS */}
        <div className="pt-6 grid grid-cols-3 gap-2 max-w-md text-left">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">👥</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">
                {producersCount || 0}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">Producers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">🎵</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">
                {soundsCount || 0}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">Sounds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">🌐</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">
                {uniqueCountriesCount || 0}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">Countries</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE PREVIEW MODULE */}
        <div className="pt-4">
          <div className="rounded-2xl overflow-hidden border border-[#EAE6DA] shadow-sm bg-neutral-100 aspect-[16/10]">
            <img 
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover" 
              alt="Producer Gear Studio Setup Layout" 
            />
          </div>
        </div>

        {/* VALUES EXPLANATION PARAGRAPH BLOCK */}
        <div className="pt-10 text-center space-y-8 border-t border-[#EAE6DA]/40">
          <h2 className="text-2xl font-serif font-black text-neutral-900">Why Join Producer Saab?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center max-w-xl mx-auto">
            <div className="space-y-1.5">
              <span className="text-xl">🎧</span>
              <h4 className="font-bold text-sm text-neutral-900">Showcase Your Sound</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">Upload your loops, melodies, MIDI, and samples.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xl">👥</span>
              <h4 className="font-bold text-sm text-neutral-900">Build Your Audience</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">Gain followers and grow your producer profile.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xl">✨</span>
              <h4 className="font-bold text-sm text-neutral-900">Discover Talent</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">Find and connect with producers worldwide.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xl">📈</span>
              <h4 className="font-bold text-sm text-neutral-900">Collaborate & Grow</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">Find collaborators, learn, and create opportunities.</p>
            </div>
          </div>
        </div>

        {/* REAL UPLOADED AUDIO RACK GENERATION */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900 flex items-center gap-1.5">🔥 Recent Uploads</h2>
            <Link href="/library" className="text-[11px] font-bold text-neutral-400 hover:text-black flex items-center gap-0.5 transition">View all →</Link>
          </div>

          {trendingSounds && trendingSounds.length > 0 ? (
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

        {/* PRODUCERS HIGHLIGHT CARDS CONTAINER FROM DB */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900 flex items-center gap-1.5">⭐ Featured Producers</h2>
            <Link href="/feed" className="text-[11px] font-bold text-neutral-400 hover:text-black flex items-center gap-0.5 transition">View all →</Link>
          </div>

          {featuredProducers && featuredProducers.length > 0 ? (
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

        {/* FOOT HOOK BANNER BLOCK */}
        <div className="bg-[#1E1E1E] text-white text-center py-12 px-4 rounded-2xl space-y-4 mt-8 border border-neutral-800">
          <h2 className="text-2xl font-serif font-black tracking-tight">Ready to share your sound<span className="text-[#C5A880]">?</span></h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">Join thousands of producers uploading loops, building audiences, and collaborating across the globe.</p>
          <Link href="/signin?view=signup" className="inline-block px-5 py-2.5 bg-white text-neutral-900 font-bold rounded-full text-xs hover:bg-neutral-100 transition shadow-md">
            Get Started — It's Free →
          </Link>
        </div>

        {/* TAIL END META COMPONENT FOOTER */}
        <footer className="pt-10 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-medium text-neutral-400 border-t border-[#EAE6DA]/40">
          <div className="flex items-center gap-1 font-black text-neutral-800 tracking-wider uppercase text-xs">
            <span className="font-light text-sm tracking-tighter text-neutral-500">川</span> PRODUCER SAAB
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black transition">About</a>
            <a href="#" className="hover:text-black transition">Terms</a>
            <a href="#" className="hover:text-black transition">Privacy</a>
            <a href="#" className="hover:text-black transition">Contact</a>
          </div>
          <p>© 2026 Producer Saab. All rights reserved.</p>
        </footer>

      </main>

    </div>
  );
}
