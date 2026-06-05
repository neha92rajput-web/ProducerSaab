'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('Loops'); // NEW: Active tab state

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p || {});
      setLoading(false);
    }
    init();
  }, [router]);

  const handleSignOut = async () => {
    await database.auth.signOut();
    router.push('/');
  };

  const fields = [
    { key: 'networks', label: 'Add networks...', icon: '🔗' },
    { key: 'instruments', label: 'Add instruments...', icon: '🎹' },
    { key: 'software', label: 'Add software...', icon: '💻' },
    { key: 'country', label: 'Add country...', icon: '🌍' },
    { key: 'city', label: 'Add city...', icon: '📍' },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Row */}
        <div className="flex justify-end gap-6 mb-4 text-[13px] font-bold text-[#191919]">
          <button onClick={() => router.push('/studio')} className="hover:opacity-70">My Studio</button>
          <button onClick={() => router.push('/')} className="hover:opacity-70">Community</button>
          <button onClick={handleSignOut} className="text-[#A4927A] hover:text-[#191919]">Leave Studio</button>
        </div>

        {/* Banner Section */}
        <div className="bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          <div className="w-28 h-28 bg-[#191919] rounded-full flex items-center justify-center text-white text-4xl italic font-serif flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow space-y-4">
             <h1 className="text-3xl font-black italic">{profile.username}</h1>
             <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-2 text-sm text-[#4B3B2F]">
                  <span>{f.icon}</span>
                  <span>{profile[f.key] || f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="mt-6 px-6 py-2 border border-[#191919] rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-[#191919] hover:text-white transition"
        >
          {isEditing ? 'Finish Editing' : 'Edit Profile Options'}
        </button>

        {/* SUB-LIBRARY TABS */}
        <div className="mt-12 border-b border-[#E3DEC1] flex gap-8">
          {['Loops', 'Tracks', 'Collaboration'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'text-[#191919] border-b-2 border-[#191919]' : 'text-[#A4927A] hover:text-[#191919]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="mt-8">
          <p className="text-[10px] uppercase font-bold text-[#A4927A]">Viewing {activeTab} Library</p>
          {/* Add your conditional data fetching/mapping logic for each tab here */}
        </div>

      </div>
    </div>
  );
}
