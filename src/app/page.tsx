'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OnboardingModal } from '@/components/OnboardingModal';

// ─── Trending Sound Data ──────────────────────────────────────────────────────
const trendingSounds = [
  { id: 1, genre: 'TRAP', duration: '0:28', title: 'Dark Trap Melody', producer: 'Prod. Jay', image: '/images/trending_trap.png', likes: '1.2K', downloads: '213' },
  { id: 2, genre: 'DRILL', duration: '0:20', title: 'UK Drill Loop', producer: 'LunaBeats', image: '/images/trending_drill.png', likes: '856', downloads: '112' },
  { id: 3, genre: 'R&B', duration: '0:24', title: 'R&B Piano Chords', producer: 'Nova', image: '/images/trending_rnb.png', likes: '654', downloads: '87' },
  { id: 4, genre: 'LOFI', duration: '0:21', title: 'Guitar Sample', producer: 'Soulfy', image: '/images/trending_lofi.png', likes: '542', downloads: '64' },
  { id: 5, genre: 'AMBIENT', duration: '0:22', title: 'Ambient Texture', producer: 'Aureus', image: '/images/trending_ambient.png', likes: '432', downloads: '51' },
];

// ─── Featured Producers Data ──────────────────────────────────────────────────
const featuredProducers = [
  { name: 'ProdJay', role: 'Trap Producer', followers: '12.4K', uploads: '324', initial: 'P', gradient: 'from-amber-700 to-amber-900' },
  { name: 'LunaBeats', role: 'Drill Producer', followers: '8.1K', uploads: '182', initial: 'L', gradient: 'from-stone-600 to-stone-800' },
  { name: 'MetroVibes', role: 'Melody Maker', followers: '6.7K', uploads: '241', initial: 'M', gradient: 'from-[#C5A880] to-[#B8986E]' },
  { name: 'Soulfy', role: 'R&B Producer', followers: '5.2K', uploads: '152', initial: 'S', gradient: 'from-amber-600 to-amber-800' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function WaveformIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="8" x2="4" y2="16" /><line x1="8" y1="5" x2="8" y2="19" />
      <line x1="12" y1="3" x2="12" y2="21" /><line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  );
}
function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function UsersIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function MusicIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function GlobeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function HeadphonesIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
function SparklesIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}
function HandshakeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8l-2 2-4-4-5 5-3-3-3 3" /><path d="M15 6l5 0 0 5" />
      <path d="M4 20l4-4" /><path d="M15 15l5 5" />
    </svg>
  );
}
function HeartIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function DownloadIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function PlayIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#111111] select-none font-sans">

      {/* ════════════ NAVIGATION ════════════ */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo — not clickable, just branding */}
          <div className="flex items-center gap-2 select-none">
            <WaveformIcon className="w-6 h-6 text-[#C5A880]" />
            <span className="font-extrabold text-base tracking-[0.15em] text-[#111111] uppercase">Producer Saab</span>
          </div>

          {/* Nav Links — all inert (scroll anchors, no state triggers) */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Explore', href: '/feed' },
              { label: 'Sounds', href: '/feed' },
              { label: 'Producers', href: '#producers' },
              { label: 'Community', href: '#community' },
              { label: 'Leaderboard', href: '#leaderboard' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium text-[#777777] hover:text-[#111111] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[#C5A880] after:transition-all after:duration-300 hover:after:w-full"
                onClick={e => { if (href.startsWith('#')) e.preventDefault(); }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search bar — purely UI, no navigation */}
            <div className="hidden sm:flex items-center gap-2 bg-[#F0EBE3] rounded-full px-3 py-1.5 border border-[#E8E2D9]">
              <SearchIcon className="w-3.5 h-3.5 text-[#AAAAAA]" />
              <input
                type="text"
                placeholder="Search sounds, producers..."
                className="bg-transparent text-xs text-[#111111] placeholder:text-[#AAAAAA] outline-none w-36 lg:w-44"
                onClick={e => e.stopPropagation()}
              />
            </div>
            {/* Log in — inert for now */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="text-[13px] font-medium text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
            >
              Log in
            </button>
            {/* Join CTA — opens modal only */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#111111] text-[#FAF8F5] text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Join the Community
            </button>
          </div>
        </div>
      </header>

      {/* ════════════ HERO SECTION ════════════ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — no wrapper click handler */}
            <div>
              <p className="text-[#C5A880] font-semibold text-xs tracking-[0.2em] uppercase mb-5">
                Welcome to Producer Saab
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.08] tracking-tight text-[#111111] mb-6">
                The Home for<br />Music Producers<span className="text-[#C5A880]">.</span>
              </h1>
              <p className="text-[#777777] text-base leading-relaxed max-w-md mb-8">
                Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
              </p>

              {/* CTA Buttons — explicit, isolated click handlers */}
              <div className="flex flex-wrap gap-3 mb-10">
                {/* Explore Sounds → navigates to /feed */}
                <Link
                  href="/feed"
                  className="group inline-flex items-center gap-2 bg-[#111111] text-[#FAF8F5] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#333333] transition-all duration-300 hover:shadow-lg hover:shadow-[#111111]/20"
                >
                  Explore Sounds
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {/* Join the Community → opens modal */}
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 bg-transparent text-[#111111] font-semibold text-sm px-6 py-3 rounded-full border-2 border-[#111111] hover:bg-[#111111] hover:text-[#FAF8F5] transition-all duration-300 cursor-pointer"
                >
                  Join the Community
                </button>
              </div>

              {/* Stats Row — non-interactive, no click handler */}
              <div className="flex gap-8">
                {[
                  { icon: UsersIcon, value: '12K+', label: 'Producers' },
                  { icon: MusicIcon, value: '120K+', label: 'Sounds' },
                  { icon: GlobeIcon, value: '50+', label: 'Countries' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <stat.icon className="w-5 h-5 text-[#AAAAAA]" />
                    <div>
                      <p className="font-bold text-[#111111] text-lg leading-none">{stat.value}</p>
                      <p className="text-[#AAAAAA] text-[11px] mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Image — no click handler */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#C5A880]/10">
                <Image
                  src="/images/hero_studio.png"
                  alt="Music production studio"
                  width={640}
                  height={640}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ WHY JOIN ════════════ */}
      <section id="community" className="bg-white border-y border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#111111] mb-14 tracking-tight">
            Why Join Producer Saab?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: HeadphonesIcon, title: 'Showcase Your Sound', desc: 'Upload your loops, melodies, MIDI, and samples.' },
              { icon: UsersIcon, title: 'Build Your Audience', desc: 'Gain followers and grow your producer profile.' },
              { icon: SparklesIcon, title: 'Discover Talent', desc: 'Find and connect with producers worldwide.' },
              { icon: HandshakeIcon, title: 'Collaborate & Grow', desc: 'Find collaborators, learn, and create opportunities.' },
            ].map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] mb-4 group-hover:bg-[#C5A880]/10 group-hover:border-[#C5A880]/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-[#C5A880]" />
                </div>
                <h3 className="font-bold text-[#111111] text-base mb-2">{feature.title}</h3>
                <p className="text-[#777777] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TRENDING SOUNDS ════════════ */}
      <section className="bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
              <span className="text-xl">🔥</span> Trending Sounds
            </h2>
            {/* "View all" → link to /feed, NOT a state toggle */}
            <Link
              href="/feed"
              className="flex items-center gap-1 text-sm font-semibold text-[#C5A880] hover:text-[#B8986E] transition-colors"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {trendingSounds.map((sound) => (
              /* Each card links to /feed — no state, just a real link */
              <Link
                key={sound.id}
                href="/feed"
                className="group block"
              >
                {/* Card Image */}
                <div className="relative rounded-xl overflow-hidden aspect-square mb-3 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={sound.image}
                    alt={sound.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
                    {sound.genre}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                    {sound.duration}
                  </span>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                      <PlayIcon className="w-4 h-4 text-[#111111] ml-0.5" />
                    </div>
                  </div>
                  {/* Waveform strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center gap-[2px] pb-1.5 px-3">
                    {[25,45,65,30,85,40,15,60,80,25,10,55,90,30,20,75,80,20,10,40].map((h, j) => (
                      <div key={j} className="w-[3px] bg-[#C5A880]/80 rounded-full" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* Card Info */}
                <h3 className="font-semibold text-sm text-[#111111] truncate">{sound.title}</h3>
                <p className="text-[#AAAAAA] text-xs mt-0.5">{sound.producer}</p>
                <div className="flex items-center gap-3 mt-2 text-[#AAAAAA] text-[11px]">
                  <span className="flex items-center gap-1"><HeartIcon className="w-3 h-3" /> {sound.likes}</span>
                  <span className="flex items-center gap-1"><DownloadIcon className="w-3 h-3" /> {sound.downloads}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED PRODUCERS ════════════ */}
      <section id="producers" className="bg-white border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
              <span className="text-xl">⭐</span> Featured Producers
            </h2>
            <Link href="/feed" className="flex items-center gap-1 text-sm font-semibold text-[#C5A880] hover:text-[#B8986E] transition-colors">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducers.map((producer) => (
              <div
                key={producer.name}
                className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] p-6 text-center group hover:shadow-lg hover:shadow-[#C5A880]/5 transition-all duration-300"
              >
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${producer.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{producer.initial}</span>
                </div>
                <h3 className="font-bold text-[#111111] text-base">{producer.name}</h3>
                <p className="text-[#AAAAAA] text-xs mt-0.5 mb-4">{producer.role}</p>
                <div className="flex justify-center gap-6 mb-5">
                  <div>
                    <p className="font-bold text-[#111111] text-sm">{producer.followers}</p>
                    <p className="text-[#AAAAAA] text-[10px]">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#111111] text-sm">{producer.uploads}</p>
                    <p className="text-[#AAAAAA] text-[10px]">Uploads</p>
                  </div>
                </div>
                <button className="w-full bg-[#C5A880] text-white font-semibold text-sm py-2.5 rounded-full hover:bg-[#B8986E] transition-colors duration-300 cursor-pointer">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA SECTION ════════════ */}
      <section className="bg-[#111111] text-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to share your sound<span className="text-[#C5A880]">?</span>
          </h2>
          <p className="text-[#FAF8F5]/60 text-base max-w-lg mx-auto mb-8">
            Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            {/* Primary: Explore the feed */}
            <Link
              href="/feed"
              className="group inline-flex items-center gap-2 bg-[#C5A880] text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-[#B8986E] transition-all duration-300 hover:shadow-lg hover:shadow-[#C5A880]/30"
            >
              Explore the Sound Library
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* Secondary: Join */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 bg-transparent text-[#FAF8F5]/70 font-semibold text-sm px-8 py-3.5 rounded-full border border-[#FAF8F5]/20 hover:bg-[#FAF8F5]/10 transition-all duration-300 cursor-pointer"
            >
              Create Account — Free
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="bg-[#FAF8F5] border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WaveformIcon className="w-5 h-5 text-[#C5A880]" />
              <span className="font-extrabold text-sm tracking-[0.15em] text-[#111111] uppercase">Producer Saab</span>
            </div>
            <div className="flex items-center gap-6 text-[#AAAAAA] text-xs">
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-[#111111] transition-colors">About</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-[#111111] transition-colors">Terms</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-[#111111] transition-colors">Privacy</a>
              <a href="#" onClick={e => e.preventDefault()} className="hover:text-[#111111] transition-colors">Contact</a>
            </div>
            <p className="text-[#CCCCCC] text-xs">© 2025 Producer Saab. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ════════════ JOIN MODAL ════════════ */}
      <OnboardingModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />

    </div>
  );
}
