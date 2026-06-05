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
  const [activeTab, setActiveTab] = useState('Loops');
  const [sounds, setSounds] = useState<any[]>([]);

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

  useEffect(() => {
    async function fetchSounds() {
      if (!profile.id) return;
      const { data } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('category', activeTab);
      setSounds(data || []);
    }
    fetchSounds();
  }, [activeTab, profile.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    // FIX: Changed 'audio' to 'audio-tracks' to match your dashboard
    const { error: uploadError } = await database.storage
      .from('audio-tracks') 
      .upload(fileName, file);

    if (uploadError) { 
      alert("Upload failed: " + uploadError.message); 
      return; 
    }

    const { data: urlData } = database.storage.from('audio-tracks').getPublicUrl(fileName);
    
    await database.from('sounds').insert({
      profile_id: profile.id,
      title: file.name,
      category: activeTab,
      audio_url: urlData.publicUrl
    });

    const { data: newSounds } = await database.from('sounds').select('*').eq('profile_id', profile.id).eq('category', activeTab);
    setSounds(newSounds || []);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-6 mb-4 text-[13px] font-bold text-[#191919]">
          <button onClick={() => router.push('/studio')} className="hover:opacity-70">My Studio</button>
          <button onClick={() => router.push('/')} className="hover:opacity-70">Community</button>
          <button onClick={() => { database.auth.signOut(); router.push('/'); }} className="text-[#A4927A] hover:text-[#191919]">Leave Studio</button>
        </div>

        <div className="bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          <div className="w-28 h-28 bg-[#191919] rounded-full flex items-center justify-center text-white text-4xl italic font-serif flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-black italic">{profile.username}</h1>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center border-b border-[#E3DEC1] mb-8 pb-1">
            <div className="flex gap-8">
              {['Loops', 'Tracks', 'Collaboration'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 ${activeTab === tab ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}>
                  {tab}
                </button>
              ))}
            </div>
            {(activeTab === 'Loops' || activeTab === 'Tracks') && (
              <label className="cursor-pointer bg-[#191919] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#4B3B2F] transition-all">
                + Upload Audio
                <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="grid gap-3">
            {sounds.map((sound) => (
              <div key={sound.id} className="p-4 border border-[#E3DEC1] rounded-2xl flex justify-between items-center bg-white/50">
                <span className="text-xs font-bold text-[#191919]">{sound.title}</span>
                <audio controls src={sound.audio_url} className="h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
