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
      
      setProfile(p.data || { 
        display_name: 'Studio User', 
        about_me: '', 
        networks: '', 
        instruments: '', 
        software: '' 
      });
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
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/studio')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">My Studio</button>
          <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black">
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-20">
        
        {/* BANNER & AVATAR */}
        <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm mb-10">
           <div className="h-48 bg-[#D7C9B7]" />
           <div className="p-8 relative">
             <div className="w-24 h-24 bg-[#191919] border-4 border-[#FDFBF7] rounded-full absolute -top-12 left-8 flex items-center justify-center text-white text-3xl italic font-serif">
               {String(profile.display_name || 'N').charAt(0).toUpperCase()}
             </div>
             <div className="mt-10">
               <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
             </div>
           </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* LEFT: About & Tracks */}
          <div className="space-y-8">
            <section>
              <h4 className="font-black text-xs uppercase mb-3 text-[#A4927A]">About Me</h4>
              {isEditing ? (
                  <textarea defaultValue={profile.about_me} onBlur={(e) => saveProfile('about_me', e.target.value)} className="w-full p-2 border border-[#E3DEC1] rounded-lg text-sm bg-white" />
              ) : (
                  <p className="text-sm text-[#54493D]">{profile.about_me || 'Tell us about your studio...'}</p>
              )}
            </section>
          </div>

          {/* RIGHT: Networks, Instruments, Software */}
          <div className="space-y-8">
            {[ { key: 'networks', label: 'My Networks' }, { key: 'instruments', label: 'Instruments I Play' }, { key: 'software', label: 'Software I Use' } ].map((field) => (
              <section key={field.key}>
                <h4 className="font-black text-xs uppercase mb-3 text-[#A4927A]">{field.label}</h4>
                {isEditing ? (
                  <textarea defaultValue={profile[field.key]} onBlur={(e) => saveProfile(field.key, e.target.value)} className="w-full p-2 border border-[#E3DEC1] rounded-lg text-sm bg-white" />
                ) : (
                  <p className="text-sm text-[#54493D] whitespace-pre-line">{profile[field.key] || 'Not specified'}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
