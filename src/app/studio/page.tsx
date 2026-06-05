'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>({});
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      
      const [p, s] = await Promise.all([
        database.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false })
      ]);
      
      setProfile(p.data || { username: 'NewUser', networks: '', instruments: '', software: '' });
      setMySounds(s.data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const saveProfile = async (field: string, value: string) => {
    // Optimistically update local state for a smoother UI feel
    setProfile(prev => ({ ...prev, [field]: value }));
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
  };

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#A4927A]">Opening Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-20">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black border border-[#A4927A] px-4 py-2 rounded-full"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* BANNER */}
        <div className="relative mt-0 mb-16 bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          
          <div className="w-28 h-28 bg-[#191919] border-4 border-[#FDFBF7] rounded-full flex items-center justify-center text-white text-4xl italic font-serif shadow-lg flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>

          <div className="flex-grow space-y-4">
            {isEditing ? (
              <input 
                defaultValue={profile.username} 
                onBlur={(e) => saveProfile('username', e.target.value)} 
                className="text-3xl font-black italic font-serif bg-white/50 p-2 rounded w-full" 
              />
            ) : (
              <h1 className="text-3xl font-black italic font-serif">{profile.username}</h1>
            )}

            <div className="space-y-3 text-sm text-[#4B3B2F]">
              {[ { key: 'networks', label: '🔗' }, { key: 'instruments', label: '🎹' }, { key: 'software', label: '💻' } ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="text-lg">{item.label}</span>
                  {isEditing ? (
                    <input 
                      defaultValue={profile[item.key]} 
                      onBlur={(e) => saveProfile(item.key, e.target.value)} 
                      placeholder={`Add ${item.key}...`} 
                      className="bg-white p-2 rounded w-full border border-black/10 focus:outline-none focus:border-black" 
                    />
                  ) : (
                    <span className="cursor-default">{profile[item.key] || `Add ${item.key}...`}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* ... rest of your track list ... */}
      </div>
    </div>
  );
}
