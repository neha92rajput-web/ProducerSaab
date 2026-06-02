'use client';

import Link from 'next/link';

export default function Home() {
  // Exact trending sounds data from your video
  const trendingSounds = [
    { id: 1, title: 'Dark Trap Melody', prod: 'Prod. Jay', tag: 'TRAP', duration: '0:28', likes: '1.2K', downloads: '213', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60' },
    { id: 2, title: 'UK Drill Loop', prod: 'LunaBeats', tag: 'DRILL', duration: '0:20', likes: '856', downloads: '112', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=60' },
    { id: 3, title: 'R&B Piano Chords', prod: 'Nova', tag: 'R&B', duration: '0:24', likes: '654', downloads: '87', img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Guitar Sample', prod: 'Soulfy', tag: 'LOFI', duration: '0:21', likes: '542', downloads: '64', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=60' },
    { id: 5, title: 'Ambient Texture', prod: 'Aureus', tag: 'AMBIENT', duration: '0:22', likes: '432', downloads: '51', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=60' }
  ];

  // Exact featured producers data from your video
  const featuredProducers = [
    { name: 'ProdJay', role: 'Trap Producer', initial: 'P', followers: '12.4K', uploads: '324' },
    { name: 'LunaBeats', role: 'Drill Producer', initial: 'L', followers: '8.1K', uploads: '182' },
    { name: 'MetroVibes', role: 'Melody Maker', initial: 'M', followers: '6.7K', uploads: '241' }
  ];

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
            <Link href="/dashboard">Log in</Link>
          </div>

          {/* Action Trigger Navigation */}
          <div>
            <Link 
              href="/dashboard" 
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
            href="/dashboard" 
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

        {/* METRICS COUNT PANEL */}
        <div className="pt-6 grid grid-cols-3 gap-2 max-w-md text-left">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">👥</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">12K+</p>
              <p className="text-[10px] text-neutral-400 font-medium">Producers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">?.</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">120K+</p>
              <p className="text-[10px] text-neutral-400 font-medium">Sounds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">🌐</span>
            <div>
              <p className="text-sm font-serif font-black text-neutral-900 leading-none">50+</p>
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

        {/* TRENDING AUDIO RACK GENERATION */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900 flex items-center gap-1.5">🔥 Trending Sounds</h2>
            <Link href="/library" className="text-[11px] font-bold text-neutral-400 hover:text-black flex items-center gap-0.5 transition">View all →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {trendingSounds.map(sound => (
              <div key={sound.id} className="bg-white border border-[#EAE6DA] rounded-xl overflow-hidden p-2.5 space-y-2 group shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="aspect-square w-full rounded-lg bg-neutral-100 overflow-hidden relative border border-[#EAE6DA]/40">
                    <img src={sound.img} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" alt="" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black rounded tracking-wide uppercase">{sound.tag}</span>
                    <span className="absolute bottom-1.5 right-1.5 px-1 py-0.5 bg-white/90 backdrop-blur-sm text-neutral-800 text-[8px] font-bold rounded">{sound.duration}</span>
                  </div>
                  <div className="px-0.5">
                    <h4 className="font-bold text-xs text-neutral-900 truncate">{sound.title}</h4>
                    <p className="text-[10px] text-neutral-400 truncate">{sound.prod}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-[#FAF9F5] pt-1.5 text-[10px] font-bold text-neutral-400 px-0.5">
                  <span className="flex items-center gap-0.5">❤️ {sound.likes}</span>
                  <span className="flex items-center gap-0.5">📥 {sound.downloads}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCERS HIGHLIGHT CARDS CONTAINER */}
        <div className="pt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-black text-neutral-900 flex items-center gap-1.5">⭐ Featured Producers</h2>
            <Link href="/feed" className="text-[11px] font-bold text-neutral-400 hover:text-black flex items-center gap-0.5 transition">View all →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredProducers.map(prod => (
              <div key={prod.name} className="bg-white border border-[#EAE6DA] rounded-xl p-4 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-neutral-900 text-white font-serif font-black text-base rounded-full flex items-center justify-center mx-auto shadow-sm">
                  {prod.initial}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">@{prod.name}</h3>
                  <p className="text-[10px] text-neutral-400">{prod.role}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-center py-1.5 border-y border-[#FAF9F5] text-[11px]">
                  <div>
                    <p className="font-black text-neutral-800">{prod.followers}</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Followers</p>
                  </div>
                  <div>
                    <p className="font-black text-neutral-800">{prod.uploads}</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Uploads</p>
                  </div>
                </div>
                <button className="w-full py-1.5 bg-[#FAF9F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-lg text-[11px] font-bold transition">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FOOT HOOK BANNER BLOCK */}
        <div className="bg-[#1E1E1E] text-white text-center py-12 px-4 rounded-2xl space-y-4 mt-8 border border-neutral-800">
          <h2 className="text-2xl font-serif font-black tracking-tight">Ready to share your sound<span className="text-[#C5A880]">?</span></h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">Join thousands of producers uploading loops, building audiences, and collaborating across the globe.</p>
          <Link href="/dashboard" className="inline-block px-5 py-2.5 bg-white text-neutral-900 font-bold rounded-full text-xs hover:bg-neutral-100 transition shadow-md">
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
