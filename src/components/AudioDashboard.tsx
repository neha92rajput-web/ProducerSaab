'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Upload, Globe, Sliders, User, Download, Lock, X, TrendingUp } from 'lucide-react';

// --- Helper: Universal URL Cleaner ---
// This ensures spaces, #, (, and ) are always safe for browser navigation and audio streaming
const getSafeUrl = (url: string) => {
  if (!url) return '';
  return encodeURI(url).replace(/#/g, '%23').replace(/\(/g, '%28').replace(/\)/g, '%29');
};

export function AudioDashboard() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const updateProgress = () => {
      if (audioRef.current?.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current?.removeEventListener('timeupdate', updateProgress);
  }, []);

  // --- FIXED PLAYBACK ENGINE ---
  const handleTogglePlay = (track: any) => {
    const rawUrl = track.audioUrl || track.url;
    if (!rawUrl || rawUrl === '#') return alert("Invalid audio source.");

    // Apply the universal cleaner here
    const safeUrl = getSafeUrl(rawUrl);

    if (activePlayingId === track.id) {
      audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = safeUrl;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    setActivePlayingId(track.id);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-6">Sample Library</h2>
      <div className="grid gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="border p-4 flex justify-between items-center rounded-lg">
            <div>
              <span className="font-semibold">{track.filename}</span>
              <p className="text-xs text-slate-500">
                {track.bpm} BPM • {track.key}
              </p>
            </div>
            
            {/* Play Button */}
            <button 
              onClick={() => handleTogglePlay(track)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white"
            >
              {activePlayingId === track.id ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* Profile Links using getSafeUrl */}
      {/* Example: <a href={getSafeUrl(`/profile/${username}`)}>View Profile</a> */}
      
      <audio ref={audioRef} />
    </div>
  );
}
