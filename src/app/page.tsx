import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-600">
      {/* 1. HERO SECTION */}
      <header className="relative flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-black">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-6">
          The Home for Music Producers
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Upload sounds. Discover creators. Build your audience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-lg shadow-blue-600/20 transition-all duration-200 transform hover:-translate-y-0.5">
            Explore Sounds
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-zinc-700 hover:border-white text-white font-semibold rounded-full transition-all duration-200 transform hover:-translate-y-0.5">
            Upload Sound
          </button>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT & CENTER: DISCOVERY COLUMNS */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* SECTION 1: TRENDING SOUNDS */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Trending Sounds</h2>
              <span className="text-sm text-blue-500 hover:underline cursor-pointer">View all</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500">
              🎵 Player Component Feed — Sounds uploaded by creators will appear here.
            </div>
          </section>

          {/* SECTION 2: NEW UPLOADS */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">New Uploads</h2>
              <span className="text-sm text-blue-500 hover:underline cursor-pointer">View all</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-200">Hyperpop Melody Loop</p>
                  <p className="text-xs text-zinc-500">by @saab_beats</p>
                </div>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">140 BPM</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-200">Dark Trap Drum Kit</p>
                  <p className="text-xs text-zinc-500">by @producer_x</p>
                </div>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">125 BPM</span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR: COMMUNITY & SOCIAL LEADERBOARDS */}
        <div className="space-y-12">
          
          {/* SECTION 3: PRODUCER LEADERBOARD */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 tracking-tight">Producer Leaderboard</h2>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Producer Saab', followers: '12.4k', genre: 'Hip Hop' },
                { rank: 2, name: 'Metro_Vibes', followers: '8.9k', genre: 'Trap' },
                { rank: 3, name: 'Lofi_Samurai', followers: '6.2k', genre: 'Lo-Fi' },
              ].map((producer) => (
                <div key={producer.rank} className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-500 w-4">#{producer.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {producer.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1">
                        {producer.name}
                        {producer.rank === 1 && <span className="text-blue-400 text-xs">✓</span>}
                      </h4>
                      <p className="text-xs text-zinc-500">{producer.genre} • {producer.followers} followers</p>
                    </div>
                  </div>
                  <button className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-full hover:bg-zinc-200 transition">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: GENRES */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 tracking-tight">Explore Genres</h2>
            <div className="flex flex-wrap gap-2">
              {['Trap', 'Hip Hop', 'R&B', 'Lo-Fi', 'Pop', 'Electronic', 'Drill'].map((genre) => (
                <span key={genre} className="text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 px-3 py-1.5 rounded-full cursor-pointer transition">
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
