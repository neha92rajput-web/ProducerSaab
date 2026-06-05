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
      
      setProfile(p.data || { display_name: 'Studio User', location: '', networks: '', instruments: '', software: '' });
      setMySounds(s.data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const saveProfile = async (field: string, value: string) => {
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
    setProfile({ ...profile, [field]: value });
  };

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#A4927A]">Opening Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased pb-20">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black">
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-6">
        
        {/* BANNER WITH EMBEDDED METADATA */}
        <div className="relative mt-0 mb-16 bg-[#D7C9B7] rounded-[2rem] p-8 pb-12 shadow-sm">
          {/* Avatar */}
          <div className="absolute -top-16 left-8 w-28 h-28 bg-[#191919] border-4 border-[#FDFBF7] rounded-full flex items-center justify-center text-white text-4xl italic font-serif shadow-lg z-10">
            {String(profile.display_name || 'N').charAt(0).toUpperCase()}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Name & Location */}
            <div>
              <h1 className="text-4xl font-black italic font-serif text-[#191919]">{profile.display_name}</h1>
              {isEditing ? (
                 <input defaultValue={profile.location} onBlur={(e) => saveProfile('location', e.target.value)} placeholder="Location" className="mt-2 bg-white/50 p-1 px-2 rounded text-xs font-bold uppercase tracking-widest w-full" />
              ) : (
                 <p className="text-xs font-bold text-[#4B3B2F] uppercase tracking-widest mt-2">{profile.location || 'Add Location'}</p>
              )}
            </div>

            {/* Right side: Networks, Instruments, Software */}
            <div className="space-y-3 text-sm text-[#4B3B2F]">
              {[ { key: 'networks', label: '🔗' }, { key: 'instruments', label: '🎹' }, { key: 'software', label: '💻' } ].map((item) => (
                <div key={item.key} className="flex gap-2">
                  <span>{item.label}</span>
                  {isEditing ? (
                    <input defaultValue={profile[item.key]} onBlur={(e) => saveProfile(item.key, e.target.value)} placeholder={item.key} className="bg-white/50 p-1 px-2 rounded w-full text-sm" />
                  ) : (
                    <span>{profile[item.key] || `Add ${item.key}...`}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRACKS */}
        <div className="px-6">
            <h3 className="text-xs font-black uppercase tracking-widest border-b border-[#E3DEC1] pb-4 mb-4">Featured Audio Drops</h3>
            {mySounds.map(track => (
              <div key={track.id} className="flex items-center gap-6 py-4 border-b border-[#E3DEC1]">
                <div className="w-12 h-12 bg-[#F6F3EC] rounded-lg flex items-center justify-center font-bold">▶</div>
                <h4 className="font-bold text-sm">{track.title}</h4>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
