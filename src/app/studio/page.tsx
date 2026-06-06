'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import CollaborationHub from '@/components/CollaborationHub';
import NotificationCenter from '@/components/NotificationCenter';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('Loops / Tracks');
  const [sounds, setSounds] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTrack, setIsEditingTrack] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formInstrument, setFormInstrument] = useState('Drums');
  const [formBpm, setFormBpm] = useState('');
  const [formKey, setFormKey] = useState('C Min');
  const [formGenre, setFormGenre] = useState('Trap');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const fetchSounds = async (userId: string) => {
    try {
      const { data, error } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', userId)
        .eq('category', activeTab)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSounds(data || []);
    } catch (err) {
      console.error("Error refreshing sounds array ledger:", err);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await database.auth.getUser();
        if (!user) { 
          router.replace('/signin'); 
          return; 
        }
        const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p || {});
        if (p?.id) await fetchSounds(p.id);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, activeTab]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('audio')) return;
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleAudioPlay = (currentSoundId: string) => {
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== currentSoundId && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
    });
  };

  const handleDeleteTrack = async (soundId: string, audioUrl: string) => {
    const confirmDestruction = window.confirm("⚠️ Are you sure you want to permanently delete this track from your studio and the public feed?");
    if (!confirmDestruction) return;

    try {
      if (audioUrl) {
        const urlParts = audioUrl.split('/storage/v1/object/public/audio/');
        if (urlParts.length === 2) {
          const storageFileName = urlParts[1];
          await database.storage.from('audio').remove([storageFileName]);
        }
      }

      await database.from('collaboration_requests').delete().eq('sound_id', soundId);
      const { error } = await database.from('sounds').delete().eq('id', soundId);
      if (error) throw error;

      setActiveMenuId(null);
      if (profile.id) await fetchSounds(profile.id);
    } catch (err: any) {
      alert("Asset destruction failed: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleCheck = window.confirm("🛑 CRITICAL ACTION! Are you sure you want to wipe out your profile?");
    if (!doubleCheck) return;

    const finalPassphrase = prompt("Type 'DELETE MY STUDIO' to finalize:");
    if (finalPassphrase !== 'DELETE MY STUDIO') return;

    try {
      setLoading(true);
      await database.from('profiles').delete().eq('id', profile.id);
      await database.auth.signOut();
      router.replace('/');
    } catch (err: any) {
      setLoading(false);
      alert("Account deletion failed: " + err.message);
    }
  };

  const openUploadModal = () => {
    setIsEditingTrack(false);
    setSelectedTrackId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (track: any) => {
    setIsEditingTrack(true);
    setSelectedTrackId(track.id);
    setFormTitle(track.title || '');
    setFormInstrument(track.instrument || 'Drums');
    setFormBpm(track.bpm || '');
    setFormKey(track.key_signature || 'C Min');
    setFormGenre(track.genre || 'Trap');
    setFormDescription(track.description || '');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formTitle) setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert("Track Name is required.");
    setIsSubmitting(true);

    try {
      let finalAudioUrl = '';
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await database.storage
          .from('audio')
          .upload(fileName, selectedFile, { contentType: 'audio/mpeg', cacheControl: '3600' });
        if (uploadError) throw uploadError;
        const { data: urlData } = database.storage.from('audio').getPublicUrl(fileName);
        finalAudioUrl = urlData.publicUrl;
      }

      if (isEditingTrack && selectedTrackId) {
        const updateData: any = { title: formTitle, instrument: formInstrument, bpm: Number(formBpm), key_signature: formKey, genre: formGenre, description: formDescription };
        if (finalAudioUrl) updateData.audio_url = finalAudioUrl;
        await database.from('sounds').update(updateData).eq('id', selectedTrackId);
      } else {
        await database.from('sounds').insert({
          profile_id: profile.id, title: formTitle, category: activeTab, instrument: formInstrument, bpm: Number(formBpm), key_signature: formKey, genre: formGenre, description: formDescription, audio_url: finalAudioUrl
        });
      }
      setIsModalOpen(false);
      if (profile.id) await fetchSounds(profile.id);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfileField = async (field: string, value: any) => {
    const finalValue = value === 'none' ? null : value;
    setProfile((prev: any) => ({ ...prev, [field]: finalValue }));
    await database.from('profiles').update({ [field]: finalValue }).eq('id', profile.id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Studio...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-6 mb-4 text-[13px] font-bold">
          <button onClick={() => router.push('/studio')}>My Studio</button>
          <button onClick={() => router.push('/feed')}>Community Feed</button>
          <button onClick={() => { database.auth.signOut(); router.push('/'); }}>Leave Studio</button>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center border-b border-[#E3DEC1] pb-1">
            <div className="flex gap-8">
              {['Loops / Tracks', 'Collaboration'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 ${activeTab === tab ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}>
                  {tab === 'Loops / Tracks' ? `🎵 Fresh Sounds Library (${sounds.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end h-9 items-center px-2 mt-2 mb-1">
            {activeTab === 'Loops / Tracks' && (
              <button onClick={openUploadModal} className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black">
                + Upload Audio
              </button>
            )}
          </div>

          {/* ... [Rest of the rendering code remains the same] ... */}
          <div className="grid gap-4">
             {sounds.map((sound) => (
                <div key={sound.id} className="p-6 border border-[#E3DEC1] rounded-2xl flex justify-between items-center bg-white/70">
                    <div>
                        <div className="text-sm font-black">{sound.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">BPM: {sound.bpm} • Key: {sound.key_signature}</div>
                    </div>
                    <audio controls src={sound.audio_url} className="h-8" />
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
