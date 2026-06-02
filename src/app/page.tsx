'use client';

import Link from 'next/link';
import { Music, MapPin, SlidersHorizontal, ArrowRight, Heart, Download } from 'lucide-react';

export default function Home() {
  // Sample Data matching your video's Trending Sounds
  const trendingSounds = [
    { id: 1, title: 'Dark Trap Melody', prod: 'Prod. Jay', tag: 'TRAP', duration: '0:28', likes: '1.2K', downloads: '213', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60' },
    { id: 2, title: 'UK Drill Loop', prod: 'LunaBeats', tag: 'DRILL', duration: '0:20', likes: '856', downloads: '112', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=60' },
    { id: 3, title: 'R&B Piano Chords', prod: 'Nova', tag: 'R&B', duration: '0:24', likes: '654', downloads: '87', img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Guitar Sample', prod: 'Soulfy', tag: 'LOFI', duration: '0:21', likes: '542', downloads: '64', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=60' },
  ];

  // Sample Data matching your Featured Producers
  const featuredProducers = [
    { name: 'ProdJay', role: 'Trap Producer', initial: 'P', followers: '12.4K', uploads: '324' },
    { name: 'LunaBeats', role: 'Drill Producer', initial: 'L', followers: '8.1K', uploads: '182' },
    { name: 'MetroVibes', role: 'Melody Maker', initial: 'M', followers: '6.7K', uploads: '241' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans selection:bg-[#D4AF37]/20">
      
      {/* BRAND HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE6DA] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#1E1E1E]" />
            <span className="font-serif font-black text-xl tracking-tight uppercase">SAAB</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-neutral-600 hover:text-black transition">Sign In</Link>
            <Link href="/dashboard" className="px-4 py-2 bg-[#1E1E1E] text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition">Community</Link>
          </div>
        </div>
      </header>

      {/* HERO BILLBOARD SECTION */}
      <section className="max-w-4xl mx-auto pt-16 pb-12 px-6 text-center space-y-6">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Welcome to Producer Saab</p>
        <h1 className="text-5xl sm:text-6xl font-serif font-black tracking-tight text-neutral-900 leading-[1.15]">
          The Home for <br />Music Producers<span className="text-[#D4AF37]">.</span>
        </h1>
        <p className="text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="px-6 py-3.5 bg-[#1E1E1E] text-white font-bold rounded-full text-sm hover:bg-neutral-800 transition shadow-sm flex items-center gap-2">
            Join the Community <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/library" className="px-6 py-3.5 bg-transparent border border-[#EAE6DA] text-neutral-800 font-bold rounded-full text-sm hover:bg-neutral-50 transition">
            Explore Sounds
          </Link>
        </div>

        {/* METRICS DISPLAY BAR */}
        <div className="pt-8 max-w-lg mx-auto grid grid-cols-3 gap-4 border-t border-[#EAE6DA]/60">
          <div>
            <p className="text-xl font-serif font-black text-neutral-900">12K+</p>
            <p className="text-xs text-neutral-400">Producers</p>
          </div>
          <div>
            <p className="text-xl font-serif font-black text-neutral-900">120K+</p>
            <p className="text-xs text-neutral-400">Sounds</p>
          </div>
          <div>
            <p className="text-xl font-serif font-black text-neutral-900">50+</p>
            <p className="text-xs text-neutral-400">Countries</p>
          </div>
        </div>
      </section>

      {/* STUDIO BANNER IMAGE FRAME */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-3xl overflow-hidden border border-[#EAE6DA] shadow-sm aspect-[16/10] bg-neutral-200">
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover" 
            alt="Music Studio Setup" 
          />
        </div>
      </div>

      {/* VALUES SEGMENT */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center space-y-12 border-t border-[#EAE6DA]/60">
        <h2 className="text-3xl font-serif font-black text-neutral-900">Why Join Producer Saab?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-neutral-900">🎧 Showcase Your Sound</h4>
            <p className="text-sm text-neutral-500 leading-relaxed">Upload your loops, melodies, MIDI, and samples directly to the library cloud mapping catalog.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-neutral-900">👥 Build Your Audience</h4>
            <p className="text-sm text-neutral-500 leading-relaxed">Gain followers and grow your producer profile to reach dynamic market buyers instantly.</p>
          </div>
        </div>
      </section>

      {/* TRENDING SOUNDS AUDIO RACKS */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-black text-neutral-900 flex items-center gap-2">🔥 Trending Sounds</h2>
          <Link href="/library" className="text-xs font-bold text-neutral-500 hover:text-black flex items-center gap-1 transition">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trendingSounds.map(sound => (
            <div key={sound.id} className="bg-white border border-[#EAE6DA] rounded-2xl overflow-hidden p-3 space-y-3 group shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="aspect-square w-full rounded-xl bg-neutral-100 overflow-hidden relative border border-[#EAE6DA]/60">
                  <img src={sound.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-black rounded tracking-wide">{sound.tag}</span>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-neutral-800 text-[9px] font-bold rounded">{sound.duration}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 truncate">{sound.title}</h4>
                  <p className="text-xs text-neutral-400 truncate">{sound.prod}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#FAF9F5] pt-2 text-[11px] font-semibold text-neutral-400">
                <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-neutral-400" /> {sound.likes}</span>
                <span className="flex items-center gap-0.5"><Download className="w-3 h-3 text-neutral-400" /> {sound.downloads}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCERS INTERFACES */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-black text-neutral-900 flex items-center gap-2">⭐ Featured Producers</h2>
          <Link href="/feed" className="text-xs font-bold text-neutral-500 hover:text-black flex items-center gap-1 transition">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredProducers.map(prod => (
            <div key={prod.name} className="bg-white border border-[#EAE6DA] rounded-2xl p-5 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-neutral-900 text-white font-serif font-black text-lg rounded-full flex items-center justify-center mx-auto shadow-sm">
                {prod.initial}
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">@{prod.name}</h3>
                <p className="text-xs text-neutral-400">{prod.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-[#FAF9F5] text-xs">
                <div>
                  <p className="font-bold text-neutral-800">{prod.followers}</p>
                  <p className="text-[10px] text-neutral-400">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-800">{prod.uploads}</p>
                  <p className="text-[10px] text-neutral-400">Uploads</p>
                </div>
              </div>
              <button className="w-full py-2 bg-[#FAF9F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE6DA] rounded-xl text-xs font-bold transition">
                Follow Creator
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CALL-TO-ACTION SECTION */}
      <section className="bg-[#1E1E1E] text-white text-center py-16 px-6 space-y-6 border-t border-neutral-800 mt-12">
        <h2 className="text-3xl font-serif font-black tracking-tight">Ready to share your sound?</h2>
        <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">Join thousands of producers uploading loops, building audiences, and collaborating across the globe.</p>
        <Link href="/dashboard" className="inline-block px-6 py-3.5 bg-white text-neutral-900 font-bold rounded-full text-xs hover:bg-neutral-100 transition shadow-md">
          Get Started — It's Free
        </Link>
      </section>

      {/* PLATFORM FOOTER SECTION */}
      <footer className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 border-t border-[#EAE6DA]/60">
        <div className="flex items-center gap-1.5 font-bold text-neutral-800 tracking-wider uppercase">
          <Music className="w-3.5 h-3.5 text-[#D4AF37]" /> Producer Saab
        </div>
        <div className="flex gap-4 font-medium">
          <a href="#" className="hover:text-black transition">About</a>
          <a href="#" className="hover:text-black transition">Terms</a>
          <a href="#" className="hover:text-black transition">Privacy</a>
          <a href="#" className="hover:text-black transition">Contact</a>
        </div>
        <p>© 2026 Producer Saab. All rights reserved.</p>
      </footer>

    </div>
  );
}
