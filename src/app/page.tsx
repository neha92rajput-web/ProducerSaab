'use client';

import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Forcefully remove any global loading screens appended to the body
    const loaders = document.querySelectorAll('[id*="loading"], [class*="loading"]');
    loaders.forEach(el => {
      if (el.textContent?.includes('Producer Saab')) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1E1C] font-sans selection:bg-[#D4AF37]/30 relative z-50 antialiased">
      {/* HEADER EMBELLISHMENT */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#C5A059] via-[#E6C687] to-[#C5A059]" />

      {/* 1. ELEGANT HERO SECTION */}
      <header className="relative flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 border-b border-[#EFECE6] bg-[#FAF6EE]">
        {/* Soft atmospheric gradient mimicking natural studio sunlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9]/10 via-[#F7F2E8]/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A3906B] font-semibold mb-4 block">
            A Curated Space for Sound Designers
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1E1E1C] mb-6 leading-[1.1]">
            The Ultimate Hub <br />for Music Producers
          </h1>
          <p className="text-base md:text-lg text-[#6E6A61] max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Share premium beats, find custom project assets, and network with elite creators across the globe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
            <button className="px-8 py-3.5 bg-[#1E1E1C] hover:bg-[#33312C] text-[#FFFDF9] font-medium rounded-lg shadow-xl shadow-zinc-900/10 transition-all duration-200 transform hover:-translate-y-0.5 tracking-wide">
              Explore Sounds
            </button>
            <button className="px-8 py-3.5 bg-[#FFFDF9] border border-[#D1C9BC] hover:border-[#A3906B] text-[#545045] font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 tracking-wide">
              Upload Assets
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT & CENTER: MAIN AUDIO FEED */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* SECTION 1: PUBLIC SOUND LIBRARY */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1E1E1C] flex items-center gap-2.5">
                  <span className="text-[#A3906B] text-xl">🎵</span> Public Sound Library
                </h2>
                <p className="text-xs text-[#8A8477] mt-1">Discover studio-grade assets</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A3906B] hover:text-[#1E1E1C] cursor-pointer transition">
                View all collections →
              </span>
            </div>
            
            {/* Minimalist Filter Bar */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['Filter by Genre', 'Filter by BPM', 'Filter by Key'].map((filter) => (
                <button key={filter} className="text-xs bg-[#F2EDE2] text-[#545045] hover:bg-[#EAE2D3] px-4 py-2 rounded-md transition font-medium">
                  {filter}
                </button>
              ))}
            </div>

            <div className="bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl p-8 text-center text-[#8A8477] text-sm shadow-sm font-light">
              No audio resources match your active search filters. Get started by uploading your first loop!
            </div>
          </section>

          {/* SECTION 2: CURATED UPLOADS */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1E1E1C]">Recent Additions</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFDF9] border border-[#EFECE6] rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
                <div>
                  <p className="font-semibold text-[#33312C] text-sm">Analog Warmth Satin Loop</p>
                  <p className="text-xs text-[#A3906B] mt-0.5">by @saab_beats</p>
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-[#FAF6EE] border border-[#EBE5D8] rounded text-[#6E6A61]">
                  140 BPM
                </span>
              </div>
              <div className="bg-[#FFFDF9] border border-[#EFECE6] rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
                <div>
                  <p className="font-semibold text-[#33312C] text-sm">Vintage Rhodes Chord Progressions</p>
                  <p className="text-xs text-[#A3906B] mt-0.5">by @studio_m32</p>
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-[#FAF6EE] border border-[#EBE5D8] rounded text-[#6E6A61]">
                  88 BPM
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR: COMMUNITY & LEADERS */}
        <div className="space-y-12">
          
          {/* SECTION 3: TOP RANKED CREATORS */}
          <section className="bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#A3906B] font-bold mb-6">
              Top Sound Designers
            </h3>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Producer Saab', followers: '12.4k', genre: 'Hip Hop' },
                { rank: 2, name: 'Komplete_M32', followers: '8.9k', genre: 'Neo-Soul' },
                { rank: 3, name: 'Audio_Technica', followers: '6.2k', genre: 'Cinematic' },
              ].map((producer) => (
                <div key={producer.rank} className="flex items-center justify-between bg-[#FFFDF9] p-3.5 rounded-xl border border-[#EFECE6] shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif italic text-[#A3906B] w-4">#{producer.rank}</span>
                    {/* Minimalist Profile Initials Container */}
                    <div className="w-9 h-9 rounded-md bg-[#F2EDE2] border border-[#E2D9C8] flex items-center justify-center text-xs font-bold text-[#545045]">
                      {producer.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E1E1C] flex items-center gap-1">
                        {producer.name}
                        {producer.rank === 1 && <span className="text-[#C5A059] text-[10px]">✦</span>}
                      </h4>
                      <p className="text-[11px] text-[#8A8477] mt-0.5">{producer.genre} • {producer.followers}</p>
                    </div>
                  </div>
                  <button className="text-[11px] bg-[#1E1E1C] hover:bg-[#A3906B] text-[#FFFDF9] font-medium px-3 py-1.5 rounded-md transition duration-150">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: GENRES */}
          <section className="bg-[#FAF6EE] border border-[#EBE5D8] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#A3906B] font-bold mb-4">
              Browse Genres
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['Trap', 'Lo-Fi Jazz', 'Neo-Soul', 'Ambient', 'R&B', 'Electronic', 'Boom Bap'].map((genre) => (
                <span key={genre} className="text-xs bg-[#FFFDF9] hover:bg-[#1E1E1C] hover:text-[#FFFDF9] text-[#545045] border border-[#EFECE6] px-3 py-1.5 rounded-md cursor-pointer transition-all duration-150">
                  {genre}
                </span>
              ))}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
