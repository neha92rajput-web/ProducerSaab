'use client';
import React from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioUpload({ profileId, activeTab, onUploadComplete }: any) {
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("Uploading file:", file.name); // Debug: Check if this appears in F12 Console

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await database.storage
      .from('audio')
      .upload(fileName, file);

    if (uploadError) { 
      console.error("Upload error:", uploadError);
      alert("Upload failed: " + uploadError.message); 
      return; 
    }

    const { data } = database.storage.from('audio').getPublicUrl(fileName);
    
    await database.from('sounds').insert({
      profile_id: profileId,
      title: file.name,
      category: activeTab,
      audio_url: data.publicUrl
    });

    console.log("Upload successful!");
    onUploadComplete();
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleUpload} 
        className="absolute inset-0 opacity-0 cursor-pointer" 
      />
      <button className="bg-[#191919] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase hover:bg-[#4B3B2F]">
        + Upload Audio
      </button>
    </div>
  );
}
