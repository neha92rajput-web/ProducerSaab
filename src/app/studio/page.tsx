'use client';

import React, { useState } from 'react';

export default function StudioWorkspace() {
  // Use your existing state management here
  const [profile] = useState({ 
    display_name: 'neha92rajput', 
    headline: 'Independent producer from Chandigarh. Specializing in Trap, Lo-fi and Ambient vibes.' 
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      {/* Centered Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT/CENTER: PRIMARY CONTENT (70% width) */}
        <main className="lg:col-span-8 space-y-8">
          {/* Hero Profile Block */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white font-serif text-3xl italic">NR</div>
            <div className="flex-1">
              <h1 className="text-3xl font-black italic">{profile.display_name} <span className="text-blue-500 text-sm">✓</span></h1>
              <p className="text-sm text-gray-500 mt-1">Music Producer • Verified Creator</p>
              <p className="text-sm mt-4 text-[#54493D]">{profile.headline}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 rounded-full border border-[#E3DEC1] text-xs font-bold uppercase">Follow</button>
              <button className="px-6 py-2 rounded-full border border-[#E3DEC1] text-xs font-bold uppercase">Message</button>
            </div>
          </div>

          {/* Featured Tracks Row */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Featured Tracks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-[#E3DEC1] rounded-xl" />
              ))}
            </div>
          </div>

          {/* Recent Tracks List */}
          <div className="space-y-2">
             <h3 className="font-black text-sm uppercase tracking-widest mb-4">Recent Tracks</h3>
             {/* List of track components */}
             <div className="p-4 border-b border-[#E3DEC1] flex justify-between">
                <span>Midnight Thoughts</span>
                <span>02:48</span>
             </div>
          </div>
        </main>

        {/* RIGHT: METADATA SIDEBAR (30% width) */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-[#E3DEC1] p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-sm mb-4">About</h4>
            <p className="text-xs text-gray-500">{profile.headline}</p>
            <button className="text-xs font-bold underline mt-4">View full bio</button>
          </div>

          <div className="bg-white border border-[#E3DEC1] p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-sm mb-4">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {['Trap', 'Lo-fi', 'Ambient', 'Drill'].map(g => (
                <span key={g} className="px-3 py-1 border border-[#E3DEC1] rounded-full text-[10px] font-bold uppercase">{g}</span>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
