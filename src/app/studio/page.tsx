'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileAudio } from 'lucide-react';

export default function UploadSound() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    genre: 'Punjabi', 
    bpm: '', 
    key: 'F# Minor', 
    mood: 'Dark' 
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return setError('Audio track file is mandatory');
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication expired');

      // 1. Upload file directly to Supabase storage bucket
      const fileExt = audioFile.name.split('.').pop();
      const pathName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('audio-tracks')
        .upload(pathName, audioFile);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage.from('audio-tracks').getPublicUrl(pathName);

      // 2. Save database layout entity metadata correctly aligned to schema variables
      const { error: dbError } = await supabase.from('sounds').insert({
        profile_id: user.id, // Fixed from user_id to correctly align with profiles table relations
        title: formData.title.trim(),
        audio_url: publicUrlData.publicUrl,
        genre: formData.genre,
        bpm: formData.bpm ? formData.bpm : '140',
        key: formData.key,
        mood: formData.mood
      });

      if (dbError) throw dbError;
      
      // 3. Smart redirect control back to clean studio workspace
      router.push('/studio');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] py-12 px-4 font-sans antialiased">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Header Back Button Array Row */}
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h1 className="text-base font-bold text-gray-900">Publish New Audio Master</h1>
          <button 
            type="button" 
            onClick={() => router.push('/studio')} 
            className="text-xs font-bold text-gray-400 hover:text-black transition"
          >
            ← Cancel
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

        <form onSubmit={handleUpload} className="space-y-5">
          
          {/* Audio Drop Drag Box Container */}
          <div className="p-6 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center bg-gray-50 transition cursor-pointer relative">
            <FileAudio className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs font-bold text-gray-600 text-center max-w-xs truncate">
              {audioFile ? audioFile.name : 'Select or drop your master MP3/WAV file'}
            </span>
            <input required type="file" accept="audio/*" onChange={e => e.target.files?.[0] && setAudioFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Track Title</label>
            <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-xs font-medium" placeholder="Atmospheric Synth Loop" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Genre Class</label>
              <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none cursor-pointer text-xs font-medium" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                {['Punjabi', 'Trap Loop', 'LoFi Sample', 'Full Track Beat', 'Stem Track Layer', 'Hip Hop', 'Drill', 'Bollywood'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tempo (BPM)</label>
              <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none cursor-pointer text-xs font-medium" value={formData.bpm} onChange={e => setFormData({...formData, bpm: e.target.value})}>
                {['80', '90', '100', '120', '140', '150'].map(b => (
                  <option key={b} value={b}>{b} BPM</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Key Signature</label>
              <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none cursor-pointer text-xs font-medium" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})}>
                {['F# Minor', 'A Minor', 'C Major', 'E Minor', 'G# Major'].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Sonic Mood Vibe</label>
              <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none cursor-pointer text-xs font-medium" value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
                {['Dark', 'Chill', 'Energetic', 'Emotional', 'Hypnotic'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm mt-2 disabled:opacity-50">
            {loading ? 'Publishing Track to Cloud Storage...' : 'Publish Audio Master Asset'}
          </button>
        </form>
      </div>
    </div>
  );
}
