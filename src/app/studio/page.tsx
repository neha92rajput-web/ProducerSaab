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
      
      setProfile(p.data || { display_name: 'Studio User', about_me: '', instruments: '', software: '' });
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/studio')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">My Studio</button>
          <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black">
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-20 space-y-8">
        
        {/* Banner */}
        <div className="bg-[#D7C9B7] h-48 w-full rounded-[2rem]" />
        
        {/* Left-Aligned Profile Section */}
        <div className="flex flex-col items-start px-2">
            <div className="w-28 h-28 bg-[#191919] border-4 border-[#FDFBF7] rounded-full flex items-center justify-center text-white text-4xl italic font-serif -mt-16 mb-4">
              {String(profile.display_name || 'N').charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
            <p className="text-sm font-bold text-[#A4927A] uppercase tracking-widest mt-1">{profile.headline || 'MUSIC PRODUCER'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
            {mySounds.map(track => (
              <div key={track.id} className="flex items-center gap-6 py-4 border-b border-[#E3DEC1] hover:bg-[#F9F6F0] transition">
                <div className="w-12 h-12 bg-[#F6F3EC] rounded-lg flex items-center justify-center font-bold">▶</div>
                <div>
                  <h4 className="font-bold text-sm">{track.title}</h4>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">{track.genre} • {track.bpm} BPM</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {[ { key: 'about_me', label: 'About Me' }, { key: 'instruments', label: 'Instruments' }, { key: 'software', label: 'Software' } ].map((field) => (
              <section key={field.key}>
                <h4 className="font-black text-xs uppercase mb-3 text-[#A4927A]">{field.label}</h4>
                {isEditing ? (
                  <textarea 
                    defaultValue={profile[field.key]}
                    onBlur={(e) => saveProfile(field.key, e.target.value)}
                    className="w-full p-2 border border-[#E3DEC1] rounded-lg text-sm bg-white"
                  />
                ) : (
                  <p className="text-sm text-[#54493D] leading-relaxed">{profile[field.key] || `Add your ${field.label.toLowerCase()}...`}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
