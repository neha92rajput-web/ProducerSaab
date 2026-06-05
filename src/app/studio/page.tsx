'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      
      const [p, s] = await Promise.all([
        database.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false })
      ]);
      
      setProfile(p.data || { display_name: 'Studio User', username: 'producer', headline: 'Music Producer' });
      setMySounds(s.data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading || !profile) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#A4927A]">Opening Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-5 border-b border-[#E3DEC1] flex justify-between items-center">
        <span className="font-serif italic font-black text-lg text-[#4B3B2F]">PRODUCER SAAB</span>
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/studio')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">My Studio</button>
          <button onClick={() => router.push('/community')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">Community</button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </nav>

      {/* CENTERED EDITORIAL COLUMN */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-20 space-y-8">
        
        {/* BANNER CARD (Moved up with pt-6) */}
        <div className="bg-white border border-[#E3DEC1] rounded-[2rem] overflow-hidden shadow-sm">
           <div className="h-48 bg-[#D7C9B7]" /> {/* Matches image_8afebe.jpg colors */}
           <div className="p-8 relative">
             <div className="w-24 h-24 bg-[#191919] border-4 border-[#FDFBF7] rounded-full absolute -top-12 left-8 flex items-center justify-center text-white text-3xl italic font-serif">
               {String(profile.display_name).charAt(0).toUpperCase()}
             </div>
             <div className="mt-10">
               <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
               <p className="text-xs font-bold text-[#A4927A] uppercase tracking-widest mt-2">{profile.headline}</p>
             </div>
           </div>
        </div>

        {/* CONTENT SECTIONS (Based on image_8afa8a.jpg) */}
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

          {/* SIDEBAR METADATA */}
          <div className="space-y-8">
            <section>
              <h4 className="font-black text-xs uppercase mb-3">About Me</h4>
              <p className="text-sm text-[#54493D] leading-relaxed">Music producer, mixing engineer, and beatmaker specializing in experimental soundscapes.</p>
            </section>
            <section>
              <h4 className="font-black text-xs uppercase mb-3">Instruments</h4>
              <p className="text-sm text-[#54493D]">Piano, MPC, Synthesizers</p>
            </section>
            <section>
              <h4 className="font-black text-xs uppercase mb-3">Software</h4>
              <p className="text-sm text-[#54493D]">FL Studio, Logic Pro</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
