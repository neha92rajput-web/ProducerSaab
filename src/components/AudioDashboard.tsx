'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
// ... (keep all your existing imports)

// ... (keep your interfaces and helpers: IDB, defaultPills, etc.)

export function AudioDashboard() {
  // ... (keep all your existing state declarations)
  
  // 🔥 UNIFIED PLAYBACK ENGINE: Both the Dashboard and ArtistProfile will call this
  const playTrackGlobal = useCallback((track: SampleTrack) => {
    if (!audioRef.current) return;

    if (currentPlayingId === track.id) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
      return;
    }

    // Force load the new source into the single global element
    audioRef.current.src = track.audioUrl || track.url || '';
    audioRef.current.play().catch(e => console.error("Playback stalled:", e));
    setCurrentPlayingId(track.id);
  }, [currentPlayingId]);

  // Pass this function down as a prop to ArtistProfile
  // handleTogglePlay={playTrackGlobal}
  
  // ... (rest of your component)
}
