'use client';

import Link from 'next/link';
import { Music, SlidersHorizontal, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] font-sans">
      
      {/* GLOBAL PLATFORM NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE6DA] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-[#1E1E1E] rounded-xl text-white group-hover:bg-[#D4AF37] transition-colors">
              <Music className="w-5 h-5" />
            </div>
            <span className="font-serif font-black text-xl tracking-tight text-neutral-900">
              ProducerSaab
            </span>
          </Link>

          {/* Quick Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link href="/library" className="hover:text-black transition">Explore Sounds</Link>
            <Link href="/feed" className="hover:text-black transition">Community Feed</Link>
          </nav>

          {/* Authentication Navigation Options */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-black flex items-center gap-1.5 transition"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-semibold bg-[#1E1E1E] hover:bg-neutral-800 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              Join Community
            </Link>
          </div>

        </div>
      </header>

      {/* HERO BILLBOARD SECTION */}
      <main className="max-w-7xl mx-auto pt-20 pb-16 px-4 sm:px-8 text-center space-y-8">
        <div className="space-y-4 max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            A Curated Space for Sound Designers
          </p>
          <h1 className="text-5xl sm:text-6xl font-serif font-black tracking-tight text-neutral-900 leading-[1.1]">
            The Ultimate Hub <br />for Music Producers
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Share premium beats, find custom project assets, and network with elite creators across the globe.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link 
            href="/library" 
            className="px-6 py-3.5 bg-[#1E1E1E] hover:bg-neutral-800 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2 group"
          >
            Explore Sounds
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/dashboard" 
            className="px-6 py-3.5 bg-white border border-[#EAE6DA] hover:bg-neutral-50 text-neutral-800 font-semibold rounded-xl text-sm transition shadow-sm"
          >
            Upload Assets
          </Link>
        </div>

        {/* TEASER GRID HIGHLIGHTS */}
        <div className="pt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm space-y-2">
            <h3 className="font-serif font-bold text-lg text-neutral-900">🎯 Verified Portfolios</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Every producer gets a beautiful custom handle profile to list their best marketplace assets cleanly.</p>
          </div>
          <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm space-y-2">
            <h3 className="font-serif font-bold text-lg text-neutral-900">⚡ Instant Filters</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Sort sounds directly by genre, targeted track BPM ranges, or precise musical root keys instantly.</p>
          </div>
          <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm space-y-2">
            <h3 className="font-serif font-bold text-lg text-neutral-900">🤝 Peer Collaboration</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Connect straight with session loop makers, loop kit designers, and electronic mixing engineering artists.</p>
          </div>
        </div>
      </main>

    </div>
  );
}
