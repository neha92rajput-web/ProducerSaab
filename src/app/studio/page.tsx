'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

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
  const [activeTab, setActiveTab] = useState('Loops');
  const [sounds, setSounds] = useState<any[]>([]);

  // Form Modal Management States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTrack, setIsEditingTrack] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  // Form Field Input States
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Loops');
  const [formInstrument, setFormInstrument] = useState('Drums');
  const [formBpm, setFormBpm] = useState('');
  const [formKey, setFormKey] = useState('C Min');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Open modal for a fresh upload
  const openUploadModal = () => {
    setIsEditingTrack(false);
    setSelectedTrackId(null);
    setFormTitle('');
    setFormCategory(activeTab);
    setFormInstrument('Drums');
    setFormBpm('');
    setFormKey('C Min');
    setFormDescription('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Open modal to edit an existing track entry
  const openEditModal = (track: any) => {
    setIsEditingTrack(true);
    setSelectedTrackId(track.id);
    setFormTitle(track.title || '');
    setFormCategory(track.category || 'Loops');
    setFormInstrument(track.instrument || 'Drums');
    setFormBpm(track.bpm || '');
    setFormKey(track.key_signature || 'C Min');
    setFormDescription(track.description || '');
    setSelectedFile(null); // No file change needed unless re-uploading
    setIsModalOpen(true);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, "")); // Set default name without extension
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert("Please enter a track name.");
    
    setIsSubmitting(true);

    try {
      let finalAudioUrl = '';

      // If we are uploading a new file or changing an existing file
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
        // 1. Process Database Update Logic
        const updateData: any = {
          title: formTitle,
          category: formCategory,
          instrument: formInstrument,
          bpm: formBpm ? Number(formBpm) : null,
          key_signature: formKey,
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
        // 2. Process Brand New Insertion Logic
        if (!selectedFile) {
          setIsSubmitting(false);
          return alert("Please select an audio file to upload.");
        }

        const { error: insertError } = await database.from('sounds').insert({
          profile_id: profile.id,
          title: formTitle,
          category: formCategory,
          instrument: formInstrument,
          bpm: formBpm ? Number(formBpm) : null,
          key_signature: formKey,
          description: formDescription,
          audio_url: finalAudioUrl
        });

        if (insertError) throw insertError;
        alert("🚀 Fresh sound entry published distributed successfully!");
      }

      // Close modal and refresh listings layout array
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = async (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-sm text-gray-500">Loading Studio Workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 text-black relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Top bar navigation */}
        <div className="flex justify-end gap-6 mb-4 text-[13px] font-bold text-[#191919]">
          <button onClick={() => router.push('/studio')} className="hover:opacity-70">My Studio</button>
          <button onClick={() => router.push('/')} className="hover:opacity-70">Community Feed</button>
          <button onClick={() => { database.auth.signOut(); router.push('/'); }} className="text-[#A4927A] hover:text-[#191919]">Leave Studio</button>
        </div>

        {/* Profile Details Header Section */}
        <div className="bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          <div className="w-28 h-28 bg-[#191919] rounded-full flex items-center justify-center text-white text-4xl italic font-serif flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow space-y-4">
            {isEditingProfile ? (
              <input defaultValue={profile.username} onBlur={(e) => saveProfile('username', e.target.value)} className="text-3xl font-black italic bg-white/50 p-2 rounded w-full focus:outline-none" />
            ) : (
              <h1 className="text-3xl font-black italic">{profile.username || 'Anonymous Producer'}</h1>
            )}
            <div className="space-y-1 text-sm text-[#4B3B2F]">
              <div>🎹 DAW/Style: {profile.software || 'Add production setup...'}</div>
              <div>🌍 Location: {profile.country || 'Add global tracking coordinates...'}</div>
            </div>
          </div>
        </div>

        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="mt-6 px-6 py-2 border border-[#191919] rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-[#191919] hover:text-white transition">
          {isEditingProfile ? 'Finish Profile Sync' : 'Edit Profile Options'}
        </button>

        {/* Catalog Control row */}
        <div className="mt-12">
          <div className="flex justify-between items-center border-b border-[#E3DEC1] mb-8 pb-1">
            <div className="flex gap-8">
              {['Loops', 'Tracks', 'Collaboration'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 ${activeTab === tab ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={openUploadModal} className="bg-[#191919] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#4B3B2F] transition-all">
              + Upload Audio
            </button>
          </div>

          {/* Sound Card Library Layout Grid */}
          <div className="grid gap-4">
            {sounds.length > 0 ? (
              sounds.map((sound) => (
                <div key={sound.id} className="p-5 border border-[#E3DEC1] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 shadow-sm relative group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#191919]">{sound.title}</span>
                      <span className="bg-[#E3DEC1] text-[#4B3B2F] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.instrument || 'Synth'}</span>
                    </div>
                    {sound.bpm && <div className="text-[10px] text-gray-500 font-medium font-mono">BPM: {sound.bpm}  •  Key: {sound.key_signature || 'N/A'}</div>}
                    {sound.description && <p className="text-xs text-gray-400 font-medium italic max-w-md">{sound.description}</p>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <audio controls src={sound.audio_url} className="h-8" />
                    <button onClick={() => openEditModal(sound)} className="p-2 border border-[#E3DEC1] rounded-xl hover:bg-[#191919] hover:text-white text-gray-500 transition text-xs font-bold" title="Edit Track Metadata">
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

      {/* 📥 DYNAMIC METADATA FORM MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3DEC1] rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-black font-bold">✕</button>
            
            <h3 className="text-lg font-black tracking-tight mb-4 text-[#191919]">
              {isEditingTrack ? "📝 Edit Sound Asset Details" : "📤 Setup Sound Publication Details"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-gray-600">
              
              {/* File Selector Input Slot */}
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
                <label className="block uppercase tracking-wider text-[10px]">Track / Phrase Name</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Logic_Synth_Pluck" className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-semibold text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Type */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Asset Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full border border-[#E3DEC1] p-3 rounded-xl bg-white focus:outline-none text-black font-semibold">
                    <option value="Loops">Loops</option>
                    <option value="Tracks">Tracks</option>
                    <option value="Collaboration">Collaboration</option>
                  </select>
                </div>

                {/* Instrument Categorization */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Core Instrument Source</label>
                  <select value={formInstrument} onChange={(e) => setFormInstrument(e.target.value)} className="w-full border border-[#E3DEC1] p-3 rounded-xl bg-white focus:outline-none text-black font-semibold">
                    <option value="Drums">Drums / Perc</option>
                    <option value="Guitar">Guitar / Plucked</option>
                    <option value="Piano">Piano / Keys</option>
                    <option value="Synth">Synth / FX</option>
                    <option value="Bass">Sub / Bassline</option>
                    <option value="Vocal">Vocals / Chops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tempo (BPM) */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Tempo (BPM)</label>
                  <input type="number" value={formBpm} onChange={(e) => setFormBpm(e.target.value)} placeholder="e.g., 128" className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-semibold" />
                </div>

                {/* Key Signature */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Scale Key</label>
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

              {/* Bio / Description */}
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider text-[10px]">Track Summary / Bio</label>
                <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Cleared transient melody layer. Great for trap or alternative lo-fi bounces..." className="w-full border border-[#E3DEC1] p-3 rounded-xl focus:outline-none text-black font-medium resize-none" />
              </div>

              {/* Submission Button Trigger */}
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#111111] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#4B3B2F] transition-all disabled:opacity-50 mt-2 cursor-pointer">
                {isSubmitting ? "Processing Transaction Check..." : isEditingTrack ? "💾 Save Configuration Changes" : "🚀 Distribute Sound Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
