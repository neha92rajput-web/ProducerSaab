'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import CollaborationHub from '@/components/CollaborationHub';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Core Session States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('Loops / Tracks');
  const [sounds, setSounds] = useState<any[]>([]);

  // Form Modal Management States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTrack, setIsEditingTrack] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  // Form Field Input States
  const [formTitle, setFormTitle] = useState('');
  const [formInstrument, setFormInstrument] = useState('Drums');
  const [formBpm, setFormBpm] = useState('');
  const [formKey, setFormKey] = useState('C Min');
  const [formGenre, setFormGenre] = useState('Trap');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

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
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
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
        .eq('category', activeTab)
        .order('created_at', { ascending: false });
      setSounds(data || []);
    }
    fetchSounds();
  }, [activeTab, profile.id]);

  const handleAudioPlay = (currentSoundId: string) => {
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== currentSoundId && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
    });
  };

  const openUploadModal = () => {
    setIsEditingTrack(false);
    setSelectedTrackId(null);
    setFormTitle('');
    setFormInstrument('Drums');
    setFormBpm('');
    setFormKey('C Min');
    setFormGenre('Trap');
    setFormDescription('');
    setSelectedFile(null);
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
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim()) return alert("Track Name is required.");
    if (!formInstrument) return alert("Please specify a Core Instrument Source.");
    if (!formBpm.trim() || isNaN(Number(formBpm)) || Number(formBpm) <= 0) {
      return alert("Please enter a valid mandatory BPM/Tempo number.");
    }
    if (!formKey) return alert("Please specify a mandatory Musical Key.");
    if (!formGenre) return alert("Please specify a mandatory Track Genre.");
    
    setIsSubmitting(true);

    try {
      let finalAudioUrl = '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await database.storage
          .from('audio') 
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = database.storage.from('audio').getPublicUrl(fileName);
        finalAudioUrl = urlData.publicUrl;
      }

      if (isEditingTrack && selectedTrackId) {
        const updateData: any = {
          title: formTitle,
          category: activeTab,
          instrument: formInstrument,
          bpm: Number(formBpm),
          key_signature: formKey,
          genre: formGenre,
          description: formDescription,
        };

        if (finalAudioUrl) {
          updateData.audio_url = finalAudioUrl;
        }

        const { error: updateError } = await database
          .from('sounds')
          .update(updateData)
          .eq('id', selectedTrackId);

        if (updateError) throw updateError;
        alert("🎉 Track updates successfully saved!");
      } else {
        if (!selectedFile) {
          setIsSubmitting(false);
          return alert("Please select an audio file to upload.");
        }

        const { error: insertError } = await database.from('sounds').insert({
          profile_id: profile.id,
          title: formTitle,
          category: activeTab,
          instrument: formInstrument,
          bpm: Number(formBpm),
          key_signature: formKey,
          genre: formGenre,
          description: formDescription,
          audio_url: finalAudioUrl
        });

        if (insertError) throw insertError;
        alert("🚀 Fresh sound entry published successfully!");
      }

      setIsModalOpen(false);
      const { data: refreshedSounds } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('category', activeTab)
        .order('created_at', { ascending: false });
      setSounds(refreshedSounds || []);

    } catch (err: any) {
      console.error("Submission failed:", err);
      alert("Error: " + err.message);
    } filter {
      setIsSubmitting(false);
    }
  };

  const saveProfileField = async (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-sm text-gray-500">Loading Studio Workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 text-black relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Actions */}
        <div className="flex justify-end gap-6 mb-4 text-[13px] font-bold text-[#191919]">
          <button onClick={() => router.push('/studio')} className="hover:opacity-70">My Studio</button>
          <button onClick={() => router.push('/')} className="hover:opacity-70">Community Feed</button>
          <button onClick={() => { database.auth.signOut(); router.push('/'); }} className="text-[#A4927A] hover:text-[#191919]">Leave Studio</button>
        </div>

        {/* Dynamic Studio Profile Card Banner */}
        <div className="bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 min-h-[250px]">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#191919] rounded-full flex items-center justify-center text-white text-4xl italic font-serif flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-grow space-y-3 w-full">
            {isEditingProfile ? (
              <div className="space-y-3 max-w-xl">
                <input 
                  type="text"
                  defaultValue={profile.username} 
                  onBlur={(e) => saveProfileField('username', e.target.value)} 
                  className="text-2xl sm:text-3xl font-serif font-normal italic tracking-tight bg-white/60 px-3 py-1 rounded-xl w-full focus:outline-none text-black" 
                  placeholder="Username"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <select 
                    value={profile.account_type || '🎹 Producer'} 
                    onChange={(e) => saveProfileField('account_type', e.target.value)}
                    className="text-xs font-bold bg-white/60 p-2.5 rounded-xl focus:outline-none text-black border-none"
                  >
                    <option value="🎹 Producer">🎹 Producer</option>
                    <option value="🎤 Artist / Singer">🎤 Artist / Singer</option>
                    <option value="✍️ Songwriter">✍️ Songwriter</option>
                    <option value="🎚️ Engineer">🎚️ Engineer</option>
                    <option value="🎸 Musician">🎸 Musician</option>
                    <option value="🎧 DJ">🎧 DJ</option>
                    <option value="🎬 Fan / Listener">🎬 Fan / Listener</option>
                  </select>

                  <input 
                    type="text"
                    defaultValue={profile.software || 'logic, fl'} 
                    onBlur={(e) => saveProfileField('software', e.target.value)} 
                    className="text-xs font-semibold bg-white/60 p-2.5 rounded-xl focus:outline-none text-black placeholder-gray-500"
                    placeholder="DAW (logic, fl)"
                  />

                  <select
                    value={profile.primary_genre || '🎵 Trap'}
                    onChange={(e) => saveProfileField('primary_genre', e.target.value)}
                    className="text-xs font-bold bg-white/60 p-2.5 rounded-xl focus:outline-none text-black border-none"
                  >
                    <option value="🎵 Trap">🎵 Trap</option>
                    <option value="🎹 Hip Hop">🎹 Hip Hop</option>
                    <option value="✨ Lo-Fi">✨ Lo-Fi</option>
                    <option value="🎸 Rock / Alternative">🎸 Rock / Alternative</option>
                    <option value="⚡ EDM / Electronic">⚡ EDM / Electronic</option>
                    <option value="🎤 Pop / R&B">🎤 Pop / R&B</option>
                    <option value="🎻 Cinematic / Classical">🎻 Cinematic</option>
                  </select>

                  <input 
                    type="text"
                    defaultValue={profile.country || 'India'} 
                    onBlur={(e) => saveProfileField('country', e.target.value)} 
                    className="text-xs font-semibold bg-white/60 p-2.5 rounded-xl focus:outline-none text-black placeholder-gray-500"
                    placeholder="Location"
                  />
                </div>

                <textarea 
                  defaultValue={profile.bio || ''} 
                  onBlur={(e) => saveProfileField('bio', e.target.value)} 
                  placeholder="Tell the community about your style..."
                  className="w-full text-xs font-medium p-3 rounded-xl bg-white/60 border-none focus:outline-none text-black resize-none"
                  rows={2}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl font-serif font-normal italic tracking-tight text-[#191919]">
                    {profile.username || 'nthakur'}
                  </h1>
                  <div className="pt-0.5">
                    <span className="bg-[#191919] text-white text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      {profile.account_type || '🎹 Producer'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-[#4B3B2F] font-bold pt-0.5">
                  <div>🎹 DAW/Style: {profile.software || 'logic, fl'}</div>
                  <div>🎵 Primary Genre: {profile.primary_genre || 'Trap'}</div>
                  <div>🌍 Location: {profile.country || 'India'}</div>
                </div>

                {profile.bio && (
                  <p className="text-xs text-[#3E3227] font-medium leading-relaxed bg-white/20 p-3 rounded-xl max-w-xl italic mt-1">
                    {profile.bio}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sync Controls */}
        <button 
          onClick={() => setIsEditingProfile(!isEditingProfile)} 
          className="mt-6 px-6 py-2 border border-[#191919] rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-[#191919] hover:text-white transition"
        >
          {isEditingProfile ? 'Finish Profile Sync' : 'Edit Profile Options'}
        </button>

        {/* Dynamic Nav Tabs Row */}
        <div className="mt-12">
          <div className="flex justify-between items-center border-b border-[#E3DEC1] pb-1">
            <div className="flex gap-8">
              {['Loops / Tracks', 'Collaboration'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 ${activeTab === tab ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Subtle Upload Button Link */}
          <div className="flex justify-end h-9 items-center px-2 mt-2 mb-1">
            {activeTab === 'Loops / Tracks' && (
              <button 
                onClick={openUploadModal} 
                className="text-[10px] font-black uppercase tracking-widest text-[#A4927A] hover:text-black transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer"
              >
                + Upload Audio
              </button>
            )}
          </div>

          {/* Sound Card Items Render Loop List */}
          <div className="grid gap-4">
            {activeTab === 'Collaboration' ? (
              <CollaborationHub profileId={profile.id} />
            ) : sounds.length > 0 ? (
              sounds.map((sound) => (
                <div key={sound.id} className="p-5 border border-[#E3DEC1] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 shadow-sm relative group animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#191919]">{sound.title}</span>
                      <span className="bg-[#E3DEC1] text-[#4B3B2F] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.instrument || 'Synth'}</span>
                      <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.genre || 'Trap'}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium font-mono">BPM: {sound.bpm}  •  Key: {sound.key_signature || 'N/A'}</div>
                    {sound.description && <p className="text-xs text-gray-400 font-medium italic max-w-md">{sound.description}</p>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <audio 
                      controls 
                      src={sound.audio_url} 
                      className="h-8" 
                      ref={(el) => { audioRefs.current[sound.id] = el; }}
                      onPlay={() => handleAudioPlay(sound.id)}
                    />
                    <button onClick={() => openEditModal(sound)} className="p-2 border border-[#E3DEC1] rounded-xl hover:bg-[#191919] hover:text-white text-gray-500 transition text-xs font-bold">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-12 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-medium">
                No audio files published inside your '{activeTab}' category panel yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📥 DYNAMIC INPUT METADATA DIALOG OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3DEC1] rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto text-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-black font-bold">✕</button>
            
            <h3 className="text-lg font-black tracking-tight mb-4 text-[#191919]">
              {isEditingTrack ? "📝 Edit Audio Details" : "📤 Setup Publication Details"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-gray-600">
              
              {!isEditingTrack && (
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Select Audio File (*)</label>
                  <div onClick={() => fileInputRef.current?.click()} className="p-4 border-2 border-dashed border-[#E3DEC1] rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <input type="file" ref={fileInputRef} accept="audio/*" onChange={handleFileSelection} className="hidden" />
                    <span className="text-gray-400 font-medium">{selectedFile ? `🎵 ${selectedFile.name}` : "Click to select local audio file bounce"}</span>
                  </div>
                </div>
              )}

              {/* Track Name */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-[10px]">Track / Loop Name (*)</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Logic_Synth_Pluck" className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-semibold text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Core Instrument (*)</label>
                  <select value={formInstrument} onChange={(e) => setFormInstrument(e.target.value)} className="w-full border border-[#E3DEC1] p-3 rounded-xl bg-white focus:outline-none text-black font-semibold">
                    <option value="Drums">Drums / Percussion</option>
                    <option value="Guitar">Guitar / String Layers</option>
                    <option value="Piano">Piano / Rhyp Keys</option>
                    <option value="Synth">Synth / Lead FX</option>
                    <option value="Bass">Sub / 808 Basslines</option>
                    <option value="Vocal">Vocals / Chop Hooks</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Track Genre (*)</label>
                  <select value={formGenre} onChange={(e) => setFormGenre(e.target.value)} className="w-full border border-[#E3DEC1] p-3 rounded-xl bg-white focus:outline-none text-black font-semibold">
                    <option value="Trap">Trap</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Lo-Fi">Lo-Fi</option>
                    <option value="R&B">R&B</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Pop">Pop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Tempo (BPM) (*)</label>
                  <input type="number" value={formBpm} onChange={(e) => setFormBpm(e.target.value)} placeholder="e.g., 140" className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-semibold" />
                </div>

                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Musical Key (*)</label>
                  <select value={formKey} onChange={(e) => setFormKey(e.target.value)} className="w-full border border-[#E3DEC1] p-3 rounded-xl bg-white focus:outline-none text-black font-semibold">
                    <option value="C Maj">C Maj</option><option value="C Min">C Min</option>
                    <option value="D Maj">D Maj</option><option value="D Min">D Min</option>
                    <option value="E Maj">E Maj</option><option value="E Min">E Min</option>
                    <option value="F Maj">F Maj</option><option value="F Min">F Min</option>
                    <option value="G Maj">G Maj</option><option value="G Min">G Min</option>
                    <option value="A Maj">A Maj</option><option value="A Min">A Min</option>
                    <option value="B Maj">B Maj</option><option value="B Min">B Min</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-[10px]">Track Summary / Vibe</label>
                <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe the sample style layers used..." className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-medium resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#111111] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#4B3B2F] transition-all disabled:opacity-50 mt-2 cursor-pointer">
                {isSubmitting ? "Uploading asset variables..." : isEditingTrack ? "💾 Save Asset Metadata" : "🚀 Publish to Studio Library"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
