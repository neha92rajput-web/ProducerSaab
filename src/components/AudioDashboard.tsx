'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Music, 
  Volume2,
  VolumeX,
  Upload,
  Globe,
  Sliders,
  User,
  Activity,
  TrendingUp,
  X,
  Download,
  Lock
} from 'lucide-react';

// --- Interfaces ---
interface SampleTrack {
  id: string;
  filename: string;
  description: string;
  duration: string;
  key: string;
  bpm: number;
  url: string;
  audioUrl?: string;
  genre: string; 
  artworkColor: string;
  creator: string;
  isUserUploaded?: boolean;
}

// --- Component ---
export function AudioDashboard() {
  const [tracks, setTracks] = useState<SampleTrack[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize the audio element once on mount
    audioRef.current = new Audio();
    
    const handleTimeUpdate = () => {
      if (audioRef.current?.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    const handleEnded = () => {
      setActivePlayingId(null);
      setProgress(0);
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current?.removeEventListener('ended', handleEnded);
      audioRef.current?.pause();
    };
  }, []);

  // --- 🔥 UNIFIED PLAYBACK ENGINE WITH URL ENCODING ---
  const handleTogglePlay = (track: SampleTrack) => {
    const rawUrl = track.audioUrl || track.url;
    
    if (!rawUrl || rawUrl === '#') {
      alert("Invalid audio source.");
      return;
    }

    // THIS FIXES THE 0:00 STALL: Encodes URL fragments so characters like #, (, ) don't break the link
    const safeUrl = encodeURI(rawUrl).replace(/#/g, '%23');

    if (activePlayingId === track.id) {
      if (audioRef.current) {
        audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = safeUrl;
      audioRef.current.load(); // Forces re-fetch of the new source
      audioRef.current.muted = !isAudioActive;
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    setActivePlayingId(track.id);
  };

  // --- RENDER ---
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Sample Library</h2>
      <div className="grid gap-4">
        {tracks.map((track) => {
          const isActive = activePlayingId === track.id;
          return (
            <div key={track.id} className="border p-4 flex justify-between items-center rounded-lg">
              <div>
                <span className="font-semibold">{track.filename}</span>
                <p className="text-xs text-slate-500">{track.bpm} BPM | {track.key}</p>
              </div>
              <button 
                onClick={() => handleTogglePlay(track)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Audio Controller */}
      <audio ref={audioRef} />
    </div>
  );
}
