'use client';
import React from 'react';

export default function StudioUpload({ profileId, activeTab, onUploadComplete }: any) {
  return (
    <div style={{ padding: '50px', background: 'red', border: '5px solid black' }}>
      <input 
        type="file" 
        onChange={(e) => {
          alert("Input is working! File: " + e.target.files?.[0]?.name);
        }} 
      />
    </div>
  );
}
