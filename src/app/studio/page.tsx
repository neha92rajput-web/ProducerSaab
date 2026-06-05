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
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      setProfile(p || {});
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const updateProfile = async (key: string, value: string) => {
    await database.from('profiles').update({ [key]: value }).eq('id', profile.id);
    setProfile({ ...profile, [key]: value });
  };

  if (loading) return <div className="p-10 font-black uppercase text-xs">Loading Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans">
      <nav className="px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center bg-[#FDFBF7]">
        <span className="font-serif italic font-black text-lg">PRODUCER SAAB</span>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
          <button onClick={() => router.push('/studio')}>My Studio</button>
          <button onClick={() => router.push('/community')}>Community</button>
          <button onClick={() => setIsEditing(!isEditing)} className="text-[#A4927A]">{isEditing ? 'Save Profile' : 'Edit Profile'}</button>
        </div>
      </nav>

      {/* Banner pulled up to start right below nav */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#D7C9B7] h-56 rounded-b-[2rem]" />
        
        <div className="px-8 -mt-16 mb-12">
           <div className="w-28 h-28 bg-[#191919] rounded-full border-4 border-[#FDFBF7] flex items-center justify-center text-white text-4xl italic font-serif">
             {String(profile.display_name || 'N').charAt(0).toUpperCase()}
           </div>
           <div className="mt-4">
             <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
             <p className="text-xs font-bold text-[#A4927A] uppercase mt-1">{profile.headline}</p>
           </div>
        </div>

        {/* Content Grid from image_8aefda.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-8">
          <div className="md:col-span-2 space-y-8">
            <h3 className="font-black text-xs uppercase tracking-widest border-b border-[#E3DEC1] pb-4">Featured Audio Drops</h3>
            {mySounds.map(track => (
              <div key={track.id} className="flex items-center gap-4 py-4 border-b border-[#E3DEC1]">
                <div className="w-10 h-10 bg-[#F6F3EC] flex items-center justify-center font-bold">▶</div>
                <div>
                   <h4 className="font-bold text-sm">{track.title}</h4>
                   <p className="text-[10px] text-gray-500 uppercase">{track.genre} • {track.bpm} BPM</p>
                </div>
              </div>
            ))}
          </div>

          {/* Editable Metadata Columns */}
          <div className="space-y-8">
            {['about_me', 'instruments', 'software'].map((field) => (
              <div key={field}>
                <h4 className="font-black text-[10px] uppercase mb-2 text-[#A4927A]">{field.replace('_', ' ')}</h4>
                {isEditing ? (
                  <textarea 
                    defaultValue={profile[field]} 
                    className="w-full bg-white border border-[#E3DEC1] p-2 text-sm rounded-lg"
                    onBlur={(e) => updateProfile(field, e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{profile[field] || 'Click Edit to add details'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
