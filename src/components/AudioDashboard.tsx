'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Upload, Globe, Sliders, User, Download, Lock, X } from 'lucide-react';

interface SampleTrack {
  id: string;
  filename: string;
  url: string;
  audioUrl?: string;
  genre: string;
  artworkColor: string;
  creator: string;
  bpm: number;
  key: string;
  duration: string;
}

export function AudioDashboard() {
  const [tracks, setTracks] = useState<SampleTrack[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element once on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('timeupdate', () => {
      if (audioRef.current?.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    });
    audioRef.current.addEventListener('ended', () => {
      setActivePlayingId(null);
      setProgress(0);
    });
  }, []);

  // UNIFIED PLAYBACK ENGINE
  const handleTogglePlay = (track: SampleTrack) => {
    const urlToPlay = track.audioUrl || track.url;
    if (!urlToPlay || urlToPlay === '#') return alert("Invalid audio source.");

    if (activePlayingId === track.id) {
      audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = urlToPlay;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error(e));
    }
    setActivePlayingId(track.id);
  };

  return (
    <div className="p-8">
      {/* Track List */}
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
    </div>
  );
}
