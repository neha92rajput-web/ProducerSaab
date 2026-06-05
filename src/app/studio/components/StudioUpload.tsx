'use client';
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioUpload({ profileId, activeTab, onUploadComplete }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: '', bpm: '', musical_key: '', signature: '' });
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    if (!file) return;
    const fileName = `${Date.now()}_${file.name}`;
    
    // Upload file
    await database.storage.from('audio').upload(fileName, file);
    const { data: { publicUrl } } = database.storage.from('audio').getPublicUrl(fileName);

    // Save metadata
    await database.from('sounds').insert({
      profile_id: profileId,
      category: activeTab,
      audio_url: publicUrl,
      title: meta.title || file.name,
      bpm: meta.bpm,
      musical_key: meta.musical_key,
      signature: meta.signature
    });

    setIsOpen(false);
    onUploadComplete();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-[#191919] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase hover:bg-[#4B3B2F]">
        + Upload Audio
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] p-8 rounded-[2rem] w-full max-w-sm space-y-4">
            <h2 className="font-black italic">Upload to {activeTab}</h2>
            <input type="file" accept=".mp3,.wav" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <input placeholder="Track Name" className="w-full p-2 border" onChange={(e) => setMeta({...meta, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="BPM" className="p-2 border" onChange={(e) => setMeta({...meta, bpm: e.target.value})} />
              <input placeholder="Key" className="p-2 border" onChange={(e) => setMeta({...meta, musical_key: e.target.value})} />
            </div>
            <button onClick={handleSubmit} className="w-full bg-[#191919] text-white py-2 rounded">Save & Upload</button>
          </div>
        </div>
      )}
    </>
  );
}
