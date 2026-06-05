'use client';

import React, { useState } from 'react';

export default function StudioSaabProfile() {
  const [activeTab, setActiveTab] = useState('Tracks');
  
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] p-4 md:p-8">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: USER PROFILE */}
        <div className="space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl overflow-hidden shadow-sm">
            <div className="h-48 bg-black relative" /> {/* Cinematic Cover Placeholder */}
            <div className="px-6 pb-6">
              <div className="w-28 h-28 rounded-full border-4 border-[#FDFBF7] -mt-14 bg-gray-300 mb-4" />
              <h1 className="text-2xl font-black flex items-center gap-2">neha92rajput <span className="text-blue-500">✓</span></h1>
              <p className="text-sm text-gray-500">Music Producer • Chandigarh, India</p>
              <p className="mt-2 text-sm">Crafting dark trap, lo-fi and cinematic soundscapes.</p>
              
              <div className="flex gap-2 mt-4">
                {['Trap', 'Lo-fi', 'Experimental'].map(tag => (
                  <span key={tag} className="bg-[#FAF5EE] text-[#706456] text-[10px] font-bold px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              
              <div className="flex gap-2 mt-6">
                <button className="bg-black text-white px-8 py-2 rounded-full text-xs font-bold">Follow</button>
                <button className="border border-[#E3DEC1] px-8 py-2 rounded-full text-xs font-bold">Message</button>
              </div>
            </div>
          </div>

          {/* TABBED TRACKS/POSTS */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl p-6 shadow-sm">
            <div className="flex gap-6 border-b border-[#E3DEC1] mb-6">
              {['Tracks', 'Posts', 'About', 'Collaborations'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs font-black uppercase ${activeTab === tab ? 'border-b-2 border-black' : 'text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400">
                <span>Latest Tracks</span>
                <span>View all</span>
              </div>
              {/* Track Row */}
              <div className="flex items-center gap-4 py-2 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm flex items-center gap-2">Midnight Drive <span className="text-[9px] bg-orange-100 px-1 rounded">Pinned</span></h4>
                  <p className="text-[10px] text-gray-400">140 BPM • F# Minor • Trap</p>
                </div>
                <div className="text-xs text-gray-400 font-bold">02:48</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FEED */}
        <div className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-widest">Feed</h2>
          
          {/* COMPOSER */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl p-6 shadow-sm">
            <div className="text-sm text-gray-400 mb-4">Create a post...</div>
            <div className="flex gap-6 border-t pt-4 text-xs font-bold text-gray-500">
              <span>Photo</span> <span>Track</span> <span>Poll</span>
            </div>
          </div>

          {/* POST EXAMPLE */}
          <div className="bg-white border border-[#E3DEC1] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div>
                <p className="text-sm font-bold">neha92rajput</p>
                <p className="text-[10px] text-gray-400">2h ago</p>
              </div>
            </div>
            <p className="text-sm mb-4">Just dropped a new loop pack! Dark Trap Essentials Vol.2</p>
            <div className="bg-[#FDFBF7] border rounded-2xl p-4 flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-300 rounded-lg" />
              <div>
                <p className="text-xs font-bold">Dark Trap Essentials Vol.2</p>
                <p className="text-[10px] text-gray-400">8 Loops • 24 One Shots</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
