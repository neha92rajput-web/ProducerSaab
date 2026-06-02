'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileAudio, Disc } from 'lucide-react';

export default function UploadSound() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ title: '', genre: 'Punjabi', bpm: '', key: '', description: '' });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return setError('Audio track file is mandatory');
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication expired');

      // Upload file directly to Supabase storage bucket
      const fileExt = audioFile.name.split('.').pop();
      const pathName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('audio-tracks')
        .upload(pathName, audioFile);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage.from('audio-tracks').getPublicUrl(pathName);

      // Save database layout entity metadata 
      const { error: dbError } = await supabase.from('sounds').insert({
        user_id: user.id,
        title: formData.title,
        audio_url: publicUrlData.publicUrl,
        genre: formData.genre,
        bpm: formData.bpm ? parseInt(formData.bpm) : null,
        musical_key: formData.key,
        description: formData.description
      });

      if (dbError) throw dbError;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-[#EAE6DA] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-6">Publish New Audio Master</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="p-6 border-2 border-dashed border-[#EAE6DA] hover:border-[#D4AF37] rounded-xl flex flex-col items-center justify-center bg-[#FAF9F5] transition cursor-pointer relative">
            <FileAudio className="w-10 h-10 text-neutral-400 mb-2" />
            <span className="text-sm font-medium text-neutral-600">{audioFile ? audioFile.name : 'Select or drop MP3/WAV file'}</span>
            <input required type="file" accept="audio/*" onChange={e => e.target.files?.[0] && setAudioFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Track Title</label>
            <input required type="text" className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl focus:outline-none focus:border-[#D4AF37]" placeholder="Atmospheric Synth Loop" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Genre</label>
              <select className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl focus:outline-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                {['Punjabi', 'Hip Hop', 'Drill', 'Bollywood', 'Trap', 'LoFi', 'EDM', 'Pop', 'R&B', 'Other'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">BPM</label>
              <input type="number" className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl focus:outline-none" placeholder="140" value={formData.bpm} onChange={e => setFormData({...formData, bpm: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Scale / Key</label>
              <input type="text" className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl focus:outline-none" placeholder="C# Minor" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Asset Description</label>
            <textarea rows={3} className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl focus:outline-none resize-none" placeholder="Details about hardware routing, synthesis setups, or license terms..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white font-medium rounded-xl transition shadow-sm">
            {loading ? 'Publishing Track to Cloud...' : 'Publish Audio Asset'}
          </button>
        </form>
      </div>
    </div>
  );
}
