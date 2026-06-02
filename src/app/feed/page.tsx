'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OnboardingModal from '@/components/OnboardingModal';

interface Track {
  id: number;
  title: string;
  producer: string;
  genre: string;
  bpm: number;
  key: string;
  duration: string;
  likes: number;
  plays: number;
  image: string;
  artColor: string;
}

interface Producer {
  id: number;
  name: string;
  role: string;
  followers: string;
  uploads: number;
  initial: string;
  gradient: string;
  verified: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  genre: string;
  plays: string;
  initial: string;
  gradient: string;
  change: 'up' | 'down' | 'same';
}

const trendingTracks: Track[] = [];
const discoverProducers: Producer[] = [];
const leaderboard: LeaderboardEntry[] = [];
const newUploads: Track[] = [];

const genres = ['All', 'Trap', 'Drill', 'R&B', 'Lofi', 'Ambient', 'Afrobeats', 'Hip Hop', 'Melodic', 'Pop', 'EDM', 'Phonk', 'Drill & Bass', 'Soul'];
const waveBarHeights = [30, 55, 75, 40, 90, 50, 20, 65, 80, 30, 15, 60, 85, 35, 25, 70, 80, 22, 12, 45, 90, 28, 18, 58, 82];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function WaveformIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="8" x2="4" y2="16" /><line x1="8" y1="5" x2="8" y2="19" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="16" y1="7" x2="16" y2="17" /><line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={filled ? '#C5A880' : 'none'} stroke="#C5A880" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function WaveformBar({ progress }: { progress: number }) {
  return (
    <div className="relative w-full h-8 bg-[#F0EBE3] rounded-lg overflow-hidden flex items-center px-2 border border-[#E8E2D9]">
      <div
        className="absolute left-0 top-0 h-full bg-[#C5A880]/10 pointer-events-none transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div className="w-full h-4 flex items-center gap-[2px] pointer-events-none relative z-10">
        {waveBarHeights.map((h, i) => {
          const filled = progress > (i / waveBarHeights.length) * 100;
          return (
            <div
              key={i}
              className="w-[3px] rounded-full flex-shrink-0 transition-colors duration-100"
              style={{
                height: `${h}%`,
                backgroundColor: filled ? '#C5A880' : '#D4CFC6',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function TrackCard({ track, isPlaying, onTogglePlay }: {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: (id: number) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => p >= 100 ? 0 : p + 1.5);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[#C5A880]/8 transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={track.image}
          alt={track.title}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md uppercase">
          {track.genre}
        </span>
        <div className="absolute top-3 right-3 flex gap-1">
          <span className="bg-black/65 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">{track.bpm} BPM</span>
          <span className="bg-black/65 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">{track.key}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onTogglePlay(track.id)}
            className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 text-[#111111] hover:bg-[#C5A880] hover:text-white cursor-pointer"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-[#111111] text-sm truncate">{track.title}</h3>
            <p className="text-[#999999] text-xs mt-0.5">{track.producer} · {track.duration}</p>
          </div>
          <button
            onClick={() => setLiked(l => !l)}
            className="shrink-0 p-1.5 rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <HeartIcon filled={liked} />
          </button>
        </div>
        <WaveformBar progress={isPlaying ? progress : 0} />
      </div>
    </div>
  );
}

export default function ProducerFeedView() {
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);

  const handleTogglePlay = (id: number) => {
    setCurrentPlaying(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <WaveformIcon className="w-7 h-7 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Trending Music Feed</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-500 text-sm">Your discovery music feed is initialized and ready to sync tracks.</p>
        </div>
      </div>
    </div>
  );
}
