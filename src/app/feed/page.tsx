'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OnboardingModal } from '@/components/OnboardingModal';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Empty Data Arrays (will be populated from real database) ─────────────────

const trendingTracks: Track[] = [];
const discoverProducers: Producer[] = [];
const leaderboard: LeaderboardEntry[] = [];
const newUploads: Track[] = [];

const genres = ['All', 'Trap', 'Drill', 'R&B', 'Lofi', 'Ambient', 'Afrobeats', 'Hip Hop', 'Melodic', 'Pop', 'EDM', 'Phonk', 'Drill & Bass', 'Soul'];

// ─── Static waveform heights (avoids hydration mismatch) ─────────────────────
const waveBarHeights = [30, 55, 75, 40, 90, 50, 20, 65, 80, 30, 15, 60, 85, 35, 25, 70, 80, 22, 12, 45, 90, 28, 18, 58, 82];

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UpArrowIcon() {
  return <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="8" x2="5" y2="2" /><polyline points="2 5 5 2 8 5" /></svg>;
}

function DownArrowIcon() {
  return <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="2" x2="5" y2="8" /><polyline points="2 5 5 8 8 5" /></svg>;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Waveform Progress Bar (static, no random) ───────────────────────────────

function WaveformBar({ progress }: { progress: number }) {
  return (
    <div className="relative w-full h-8 bg-[#F0EBE3] rounded-lg overflow-hidden flex items-center px-2 border border-[#E8E2D9]">
      {/* progress fill */}
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

// ─── Track Card ──────────────────────────────────────────────────────────────

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
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={track.image}
          alt={track.title}
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Genre pill */}
        <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md uppercase">
          {track.genre}
        </span>
        {/* BPM + Key */}
        <div className="absolute top-3 right-3 flex gap-1">
          <span className="bg-black/65 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">{track.bpm} BPM</span>
          <span className="bg-black/65 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">{track.key}</span>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onTogglePlay(track.id)}
            className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 text-[#111111] hover:bg-[#C5A880] hover:text-white cursor-pointer"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      {/* Info */}
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

        {/* Waveform */}
        <WaveformBar progress={isPlaying ? progress : 0} />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#999999] text-[11px]">
            <span className="flex items-center gap-1">
              <HeartIcon /> {(track.likes + (liked ? 1 : 0)).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[#C5A880]">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              {track.plays.toLocaleString()}
            </span>
          </div>
          <button className="flex items-center gap-1 text-[#999999] hover:text-[#C5A880] text-[11px] font-semibold transition-colors cursor-pointer">
            <DownloadIcon /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder Track Card ──────────────────────────────────────────────────

function PlaceholderTrackCard() {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden group">
      {/* Artwork Placeholder */}
      <div className="relative aspect-square overflow-hidden bg-[#F0EBE3]">
        {/* Genre pill */}
        <span className="absolute top-3 left-3 bg-black/20 text-white/50 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md uppercase">
          ---
        </span>
        {/* BPM + Key */}
        <div className="absolute top-3 right-3 flex gap-1">
          <span className="bg-black/20 text-white/50 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">0 BPM</span>
          <span className="bg-black/20 text-white/50 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">---</span>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center shadow-xl text-[#CCCCCC]">
            <PlayIcon />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-[#CCCCCC] text-sm truncate">No track yet</h3>
            <p className="text-[#DDDDDD] text-xs mt-0.5">--- · 0:00</p>
          </div>
          <div className="shrink-0 p-1.5">
            <HeartIcon />
          </div>
        </div>

        {/* Waveform */}
        <WaveformBar progress={0} />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#DDDDDD] text-[11px]">
            <span className="flex items-center gap-1">
              <HeartIcon /> 0
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              0
            </span>
          </div>
          <span className="flex items-center gap-1 text-[#DDDDDD] text-[11px] font-semibold">
            <DownloadIcon /> Download
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Producer Card ────────────────────────────────────────────────────────────

function ProducerCard({ producer }: { producer: Producer }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 text-center hover:shadow-md hover:shadow-[#C5A880]/10 transition-all duration-300 group">
      {/* Avatar */}
      <div className="relative mx-auto mb-3 w-fit">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${producer.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
          <span className="text-xl font-black text-white">{producer.initial}</span>
        </div>
        {producer.verified && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#C5A880] rounded-full flex items-center justify-center text-[9px] text-white font-black border-2 border-white">✓</span>
        )}
      </div>
      <h3 className="font-bold text-[#111111] text-sm">{producer.name}</h3>
      <p className="text-[#999999] text-[11px] mt-0.5 mb-3">{producer.role}</p>
      <div className="flex justify-center gap-5 mb-4 text-center">
        <div>
          <p className="font-bold text-[#111111] text-sm">{producer.followers}</p>
          <p className="text-[#AAAAAA] text-[10px]">Followers</p>
        </div>
        <div>
          <p className="font-bold text-[#111111] text-sm">{producer.uploads}</p>
          <p className="text-[#AAAAAA] text-[10px]">Sounds</p>
        </div>
      </div>
      <button
        onClick={() => setFollowing(f => !f)}
        className={`w-full py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
          following
            ? 'bg-[#F0EBE3] text-[#C5A880] border border-[#C5A880]'
            : 'bg-[#C5A880] text-white hover:bg-[#B8986E]'
        }`}
      >
        {following ? '✓ Following' : 'Follow'}
      </button>
    </div>
  );
}

// ─── Placeholder Producer Card ────────────────────────────────────────────────

function PlaceholderProducerCard() {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 text-center group">
      {/* Avatar */}
      <div className="relative mx-auto mb-3 w-fit">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E2D9] to-[#D4CFC6] flex items-center justify-center shadow-md">
          <span className="text-xl font-black text-white/60">?</span>
        </div>
      </div>
      <h3 className="font-bold text-[#CCCCCC] text-sm">No Producer</h3>
      <p className="text-[#DDDDDD] text-[11px] mt-0.5 mb-3">---</p>
      <div className="flex justify-center gap-5 mb-4 text-center">
        <div>
          <p className="font-bold text-[#CCCCCC] text-sm">0</p>
          <p className="text-[#AAAAAA] text-[10px]">Followers</p>
        </div>
        <div>
          <p className="font-bold text-[#CCCCCC] text-sm">0</p>
          <p className="text-[#AAAAAA] text-[10px]">Sounds</p>
        </div>
      </div>
      <button className="w-full py-2 rounded-full text-xs font-bold tracking-wide bg-[#E8E2D9] text-[#AAAAAA] cursor-default">
        ---
      </button>
    </div>
  );
}

// ─── Placeholder Leaderboard Entry ────────────────────────────────────────────

function PlaceholderLeaderboardEntry({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E2D9] last:border-b-0">
      {/* Rank */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
        rank === 1 ? 'bg-yellow-400/30 text-yellow-600' :
        rank === 2 ? 'bg-slate-300/30 text-slate-500' :
        rank === 3 ? 'bg-amber-600/30 text-amber-700' :
        'bg-[#F0EBE3] text-[#AAAAAA]'
      }`}>
        {rank}
      </div>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8E2D9] to-[#D4CFC6] flex items-center justify-center shrink-0">
        <span className="text-xs font-black text-white/60">?</span>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#CCCCCC] truncate">---</p>
        <p className="text-[10px] text-[#DDDDDD]">---</p>
      </div>
      {/* Plays + trend */}
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-[#DDDDDD]">0</p>
        <div className="flex justify-end mt-0.5">
          <span className="text-[10px] text-[#DDDDDD]">—</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Feed Page ───────────────────────────────────────────────────────────

export default function FeedPage() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  function togglePlay(id: number) {
    setPlayingId(prev => prev === id ? null : id);
  }

  const filteredTracks = trendingTracks.filter(t => {
    const matchGenre = activeGenre === 'All' || t.genre.toLowerCase() === activeGenre.toLowerCase();
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.producer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans">

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#C5A880] to-[#B8986E] flex items-center justify-center">
              <WaveformIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-[0.15em] text-[#111111] group-hover:text-[#C5A880] transition-colors uppercase">
              Producer Saab
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-[#F0EBE3] rounded-full px-4 py-2 border border-[#E8E2D9]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search sounds, producers, genres…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#111111] placeholder:text-[#AAAAAA] outline-none w-full"
            />
          </div>

          {/* Nav */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-medium text-[#777777] hover:text-[#111111] transition-colors hidden md:block">
              ← Home
            </Link>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#111111] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Upload Sound
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* ══════════════ 🔥 TRENDING THIS WEEK ══════════════ */}
        <section>
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Most Played</p>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
                🔥 Trending This Week
              </h2>
            </div>
            {/* Genre Pills */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-end">
              {genres.slice(0, 6).map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                    activeGenre === g
                      ? 'bg-[#C5A880] text-white border-[#C5A880]'
                      : 'bg-white text-[#777777] border-[#E8E2D9] hover:border-[#C5A880] hover:text-[#C5A880]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredTracks.length > 0 ? filteredTracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={playingId === track.id}
                onTogglePlay={togglePlay}
              />
            )) : (
              /* Placeholder cards when no data */
              [1, 2, 3, 4, 5, 6].map(i => (
                <PlaceholderTrackCard key={i} />
              ))
            )}
          </div>
        </section>

        {/* ══════════════ 🌍 DISCOVER PRODUCERS + 📈 LEADERBOARD ══════════════ */}
        <section className="grid lg:grid-cols-3 gap-8">

          {/* Left: Discover Producers */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <p className="text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Community</p>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">🌍 Discover Producers</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {discoverProducers.length > 0 ? discoverProducers.map(p => (
                <ProducerCard key={p.id} producer={p} />
              )) : (
                /* Placeholder cards when no data */
                [1, 2, 3, 4, 5, 6].map(i => (
                  <PlaceholderProducerCard key={i} />
                ))
              )}
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div>
            <div className="mb-6">
              <p className="text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Rankings</p>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">📈 Leaderboard</h2>
            </div>
            <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden">
              {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 px-5 py-4 ${i < leaderboard.length - 1 ? 'border-b border-[#E8E2D9]' : ''} hover:bg-[#FAF6F0] transition-colors group`}
                >
                  {/* Rank */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    entry.rank === 2 ? 'bg-slate-300 text-slate-700' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-[#F0EBE3] text-[#777777]'
                  }`}>
                    {entry.rank}
                  </div>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${entry.gradient} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-black text-white">{entry.initial}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111111] truncate">{entry.name}</p>
                    <p className="text-[10px] text-[#999999]">{entry.genre}</p>
                  </div>
                  {/* Plays + trend */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#C5A880]">{entry.plays}</p>
                    <div className="flex justify-end mt-0.5">
                      {entry.change === 'up' ? <UpArrowIcon /> : entry.change === 'down' ? <DownArrowIcon /> : <span className="text-[10px] text-[#AAAAAA]">—</span>}
                    </div>
                  </div>
                </div>
              )) : (
                /* Placeholder entries when no data */
                [1, 2, 3, 4, 5].map(i => (
                  <PlaceholderLeaderboardEntry key={i} rank={i} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ══════════════ 🎵 BROWSE BY GENRE ══════════════ */}
        <section>
          <div className="mb-6">
            <p className="text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Categories</p>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">🎵 Browse by Genre</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => {
                  setActiveGenre(g);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                  activeGenre === g
                    ? 'bg-[#C5A880] text-white border-[#C5A880] shadow-md shadow-[#C5A880]/20'
                    : 'bg-white text-[#555555] border-[#E8E2D9] hover:border-[#C5A880] hover:text-[#C5A880]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════ 🆕 NEW UPLOADS ══════════════ */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Fresh Drops</p>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">🆕 New Uploads</h2>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] hover:text-[#B8986E] transition-colors cursor-pointer"
            >
              Upload yours →
            </button>
          </div>

          <div className="space-y-3">
            {newUploads.length > 0 ? newUploads.map((track, i) => (
              <div
                key={track.id}
                className="bg-white border border-[#E8E2D9] rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:shadow-[#C5A880]/8 transition-all duration-300 group"
              >
                {/* Index */}
                <span className="text-[#CCCCCC] text-xs font-bold w-5 text-center shrink-0">{String(i + 1).padStart(2, '0')}</span>

                {/* Art */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${track.artColor} flex items-center justify-center shrink-0`}>
                  <WaveformIcon className="w-4 h-4 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111111] truncate">{track.title}</p>
                  <p className="text-[11px] text-[#999999]">{track.producer} · {track.genre} · {track.bpm} BPM · {track.key}</p>
                </div>

                {/* Waveform */}
                <div className="hidden sm:block w-32">
                  <WaveformBar progress={playingId === track.id ? 35 : 0} />
                </div>

                {/* Duration */}
                <span className="text-[11px] text-[#AAAAAA] font-medium shrink-0 hidden md:block">{track.duration}</span>

                {/* Play */}
                <button
                  onClick={() => togglePlay(track.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 transition-all duration-200 cursor-pointer ${
                    playingId === track.id
                      ? 'bg-[#C5A880] text-white border-[#C5A880]'
                      : 'bg-white text-[#777777] border-[#E8E2D9] hover:border-[#C5A880] hover:text-[#C5A880] group-hover:scale-110'
                  }`}
                >
                  {playingId === track.id ? <PauseIcon /> : <PlayIcon />}
                </button>

                {/* Download */}
                <button className="text-[#CCCCCC] hover:text-[#C5A880] transition-colors cursor-pointer shrink-0">
                  <DownloadIcon />
                </button>
              </div>
            )) : (
              /* Placeholder rows when no data */
              [1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="bg-white border border-[#E8E2D9] rounded-2xl p-4 flex items-center gap-4 group"
                >
                  {/* Index */}
                  <span className="text-[#DDDDDD] text-xs font-bold w-5 text-center shrink-0">{String(i).padStart(2, '0')}</span>

                  {/* Art */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E8E2D9] to-[#D4CFC6] flex items-center justify-center shrink-0">
                    <WaveformIcon className="w-4 h-4 text-white/60" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#CCCCCC] truncate">No track yet</p>
                    <p className="text-[11px] text-[#DDDDDD]">--- · --- · 0 BPM · ---</p>
                  </div>

                  {/* Waveform */}
                  <div className="hidden sm:block w-32">
                    <WaveformBar progress={0} />
                  </div>

                  {/* Duration */}
                  <span className="text-[11px] text-[#DDDDDD] font-medium shrink-0 hidden md:block">0:00</span>

                  {/* Play */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E8E2D9] shrink-0 bg-white text-[#CCCCCC]">
                    <PlayIcon />
                  </div>

                  {/* Download */}
                  <span className="text-[#DDDDDD] shrink-0">
                    <DownloadIcon />
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-[#E8E2D9] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <WaveformIcon className="w-4 h-4 text-[#C5A880]" />
            <span className="font-extrabold text-xs tracking-[0.15em] text-[#111111] uppercase">Producer Saab</span>
          </div>
          <div className="flex gap-6 text-[#999999] text-xs">
            <a href="#" className="hover:text-[#111111] transition-colors">About</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Privacy</a>
          </div>
          <p className="text-[#CCCCCC] text-xs">© 2025 Producer Saab</p>
        </div>
      </footer>

      {/* ══════════════ JOIN / UPLOAD MODAL ══════════════ */}
      <OnboardingModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />

    </div>
  );
}
