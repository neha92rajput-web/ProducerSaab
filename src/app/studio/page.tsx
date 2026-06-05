'use client';

import React, { useState, useEffect } from 'react';
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

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [mySounds, setMySounds] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      
      setProfile(p || { display_name: '@dashboard Studio', headline: 'Welcome to my verified audio drops portfolio space.' });
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading || !profile) return <div className="min-h-screen bg-[#FDFBF7]" />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] font-sans antialiased">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="w-full bg-[#FDFBF7] border-b border-[#E3DEC1] px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <span className="font-serif font-black italic text-lg">PRODUCER SAAB</span>
        <div className="flex gap-4">
          <button onClick={() => router.push('/community')} className="text-xs font-bold uppercase tracking-widest hover:text-[#A4927A]">Producer Community</button>
          <button onClick={() => database.auth.signOut().then(() => router.push('/'))} className="text-xs font-bold uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto p-6 grid grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR (As seen in image_9adc24.jpg) */}
        <aside className="col-span-2 space-y-8">
           <div className="space-y-4">
             <p className="text-[10px] font-black uppercase text-[#A4927A] tracking-widest">Browsing Profile</p>
             <button className="flex items-center gap-2 text-sm font-medium">🏠 Return Home</button>
             <button className="flex items-center gap-2 text-sm font-medium">🌐 Global Library</button>
           </div>
        </aside>

        {/* MAIN PROFILE AREA */}
        <main className="col-span-7 space-y-8">
          <div className="bg-white border border-[#E3DEC1] rounded-2xl shadow-sm overflow-hidden">
             <div className="h-40 bg-gradient-to-r from-[#D7C9B7] to-[#BCAD98]" />
             <div className="p-8">
               <div className="w-24 h-24 bg-black rounded-full border-4 border-white -mt-20 mb-4" />
               <h1 className="text-2xl font-black">{profile.display_name}</h1>
               <p className="text-xs font-bold text-[#A4927A] uppercase mt-1">Music Producer • Verified Creator</p>
               <p className="text-sm mt-4 text-[#54493D]">{profile.headline}</p>
             </div>
          </div>
          
          {/* TRACKS LIST */}
          <div className="bg-white border border-[#E3DEC1] rounded-2xl p-8 shadow-sm">
             <h3 className="font-black text-sm mb-4">Featured Tracks & Audio Drops</h3>
             {mySounds.map(track => (
               <div key={track.id} className="py-4 border-b border-[#E3DEC1]">
                 <h4 className="font-bold text-sm">{track.title}</h4>
                 <p className="text-[10px] text-gray-500 uppercase">{track.genre} • {track.bpm} BPM</p>
               </div>
             ))}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-3 space-y-6">
           <div className="bg-white border border-[#E3DEC1] p-6 rounded-2xl shadow-sm">
             <h4 className="font-bold text-sm mb-2">Connect with Creator</h4>
             <button className="w-full bg-black text-white py-2 rounded-full text-xs font-bold">+ Follow Artist</button>
           </div>
           <div className="bg-white border border-[#E3DEC1] p-6 rounded-2xl shadow-sm">
             <h4 className="font-black text-[10px] uppercase text-[#A4927A] mb-2">Studio Credentials</h4>
             <p className="text-xs">Handle: {profile.username}</p>
           </div>
        </aside>

      </div>
    </div>
  );
}
