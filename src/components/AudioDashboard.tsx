'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Upload, Globe, Sliders, User, Download, Lock, X } from 'lucide-react';

// ... (All your existing imports, interfaces, and helper functions like openAudioDB remain exactly the same as in your provided code)

export function AudioDashboard() {
  // ... (All your existing state variables)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- THE UPDATED PLAYBACK LOGIC ---
  const handleTogglePlay = (track: any) => {
    const rawUrl = track.audioUrl || track.url;
    
    if (!rawUrl || rawUrl === '#') {
      alert("Invalid audio source.");
      return;
    }

    // This handles your existing files without needing to rename them or change the DB
    const safeUrl = encodeURI(rawUrl).replace(/#/g, '%23');

    if (activePlayingId === track.id) {
      if (audioRef.current) {
        audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = safeUrl;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    setActivePlayingId(track.id);
  };

  // ... (Rest of your component UI: mapping the tracks, buttons, etc.)
  
  return (
    <div className="p-8">
      {/* Your existing UI structure */}
      <div className="grid gap-4 mt-6">
        {tracks.map((track) => (
          <div key={track.id} className="border p-4 flex justify-between items-center">
            <span>{track.filename}</span>
            <button onClick={() => handleTogglePlay(track)}>
              {activePlayingId === track.id ? <Pause /> : <Play />}
            </button>
          </div>
        ))}
      </div>
      
      {/* The global audio element that streams the file */}
      <audio ref={audioRef} />
    </div>
  );
}
