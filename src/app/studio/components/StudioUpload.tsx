'use client';
import React from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioUpload({ profileId, activeTab, onUploadComplete }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Upload file to 'audio' bucket
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data } = supabase.storage.from('audio').getPublicUrl(fileName);

      // 3. Save reference to 'sounds' table
      const { error: dbError } = await supabase.from('sounds').insert({
        profile_id: profileId,
        title: file.name,
        category: activeTab,
        audio_url: data.publicUrl
      });

      if (dbError) throw dbError;

      alert("Upload successful!");
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        id="fileInput" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <button 
        onClick={() => document.getElementById('fileInput')?.click()}
        className="bg-[#191919] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase hover:bg-[#4B3B2F]"
      >
        + Upload Audio
      </button>
    </div>
  );
}
