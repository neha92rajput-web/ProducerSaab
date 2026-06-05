'use client';
import React from 'react';

export default function StudioUpload({ profileId, activeTab, onUploadComplete }: any) {
  return (
    <input 
      type="file" 
      onChange={(e) => {
        alert("File selected! File name: " + e.target.files?.[0]?.name);
        console.log("File object:", e.target.files?.[0]);
      }} 
    />
  );
}
