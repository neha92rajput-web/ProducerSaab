'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AudioDashboard } from '@/components/AudioDashboard';

// --- Trending Sound Data ---
const trendingSounds = [
  {
    id: 1,
    genre: 'TRAP',
    duration: '0:28',
    title: 'Dark Trap Melody',
    producer: 'Prod. Jay',
    image: '/images/trending_trap.png',
    likes: '1.2K',
    downloads: '213',
    color: 'from-purple-600 to-indigo-800',
  },
  {
    id: 2,
    genre: 'DRILL',
    duration: '0:20',
    title: 'UK Drill Loop',
    producer: 'LunaBeats',
    image: '/images/trending_drill.png',
    likes: '856',
    downloads: '112',
    color: 'from-slate-600 to-slate-900',
  },
  {
    id: 3,
    genre: 'R&B',
    duration: '0:24',
    title: 'R&B Piano Chords',
    producer: 'Nova',
    image: '/images/trending_rnb.png',
    likes: '654',
    downloads: '87',
    color: 'from-amber-700 to-amber-900',
  },
  {
    id: 4,
    genre: 'LOFI',
    duration: '0:21',
    title: 'Guitar Sample',
    producer: 'Soulfy',
    image: '/images/trending_lofi.png',
    likes: '542',
    downloads: '64',
    color: 'from-amber-600 to-stone-700',
  },
  {
    id: 5,
    genre: 'AMBIENT',
    duration: '0:22',
    title: 'Ambient Texture',
    producer: 'Aureus',
    image: '/images/trending_ambient.png',
    likes: '432',
    downloads: '51',
    color: 'from-sky-400 to-orange-300',
  },
];

// --- Featured Producers Data ---
const featuredProducers = [
  {
    name: 'ProdJay',
    role: 'Trap Producer',
    followers: '12.4K',
    uploads: '324',
    initial: 'P',
    gradient: 'from-amber-700 to-amber-900',
  },
  {
    name: 'LunaBeats',
    role: 'Drill Producer',
    followers: '8.1K',
    uploads: '182',
    initial: 'L',
    gradient: 'from-stone-600 to-stone-800',
  },
  {
    name: 'MetroVibes',
    role: 'Melody Maker',
    followers: '6.7K',
    uploads: '241',
    initial: 'M',
    gradient: 'from-[#C8956C] to-[#B07D56]',
  },
  {
    name: 'Soulfy',
    role: 'R&B Producer',
    followers: '5.2K',
    uploads: '152',
    initial: 'S',
    gradient: 'from-amber-600 to-amber-800',
  },
];

// --- SVG Icon Components ---
function WaveformIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="8" x2="4" y2="16" />
      <line x1="8" y1="5" x2="8" y2="19" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  );
}

function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function UsersIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MusicIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function GlobeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
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

function UploadCloudIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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
      <path d="M20 8l-2 2-4-4-5 5-3-3-3 3" />
      <path d="M15 6l5 0 0 5" />
      <path d="M4 20l4-4" />
      <path d="M15 15l5 5" />
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
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PlayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}


export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  // If user enters the dashboard, render it full-screen
  if (showDashboard) {
    return (
      <div className="flex flex-col min-h-screen bg-[#05050a] text-slate-100 select-none">
        {/* Dashboard Header */}
        <header className="h-16 bg-[#09090f] border-b border-slate-900 px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => setShowDashboard(false)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#C8956C] to-[#B07D56] flex items-center justify-center p-1">
              <WaveformIcon className="h-full w-full text-white stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white group-hover:text-[#C8956C] transition-colors">
              PRODUCER SAAB<span className="text-[#C8956C]">.</span>
            </span>
          </button>
          <button
            onClick={() => setShowDashboard(false)}
            className="text-xs font-medium text-slate-400 hover:text-white border border-slate-700 rounded-full px-4 py-1.5 transition-colors"
          >
            ← Back to Home
          </button>
        </header>
        <main className="flex-1 flex flex-col">
          <AudioDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream text-text-primary select-none font-[var(--font-inter)]">

      {/* ============ NAVIGATION ============ */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <WaveformIcon className="w-6 h-6 text-gold" />
              <span className="font-extrabold text-base tracking-[0.15em] text-charcoal uppercase">
                Producer Saab
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {['Explore', 'Sounds', 'Producers', 'Community', 'Leaderboard'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[13px] font-medium text-text-secondary hover:text-charcoal transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
                onClick={(e) => {
                  e.preventDefault();
                  if (link === 'Sounds' || link === 'Explore') setShowDashboard(true);
                }}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-cream-dark rounded-full px-3 py-1.5 border border-border-soft">
              <SearchIcon className="w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search sounds, producers..."
                className="bg-transparent text-xs text-charcoal placeholder:text-text-muted outline-none w-36 lg:w-44"
              />
            </div>
            <button className="text-[13px] font-medium text-text-secondary hover:text-charcoal transition-colors">
              Log in
            </button>
            <button
              onClick={() => setShowDashboard(true)}
              className="bg-charcoal text-cream text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-charcoal-light transition-colors"
            >
              Join the Community
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <p className="text-gold font-semibold text-xs tracking-[0.2em] uppercase mb-5">
                Welcome to Producer Saab
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.08] tracking-tight text-charcoal mb-6">
                The Home for<br />Music Producers<span className="text-gold">.</span>
              </h1>
              <p className="text-text-secondary text-base leading-relaxed max-w-md mb-8">
                Join a community of producers sharing loops, melodies, samples, and ideas. Upload your sounds. Get discovered. Build your audience.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="group flex items-center gap-2 bg-charcoal text-cream font-semibold text-sm px-6 py-3 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:shadow-lg hover:shadow-charcoal/20"
                >
                  Join the Community
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center gap-2 bg-transparent text-charcoal font-semibold text-sm px-6 py-3 rounded-full border-2 border-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300"
                >
                  Explore Sounds
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex gap-8">
                {[
                  { icon: UsersIcon, value: '12K+', label: 'Producers' },
                  { icon: MusicIcon, value: '120K+', label: 'Sounds' },
                  { icon: GlobeIcon, value: '50+', label: 'Countries' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <stat.icon className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="font-bold text-charcoal text-lg leading-none">{stat.value}</p>
                      <p className="text-text-muted text-[11px] mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative animate-slide-in-right delay-200 opacity-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gold/10">
                <Image
                  src="/images/hero_studio.png"
                  alt="Music production studio with headphones and MIDI keyboard"
                  width={640}
                  height={640}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority
                />
              </div>
              {/* Decorative waveform overlay */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 opacity-20">
                <svg viewBox="0 0 100 100" className="text-gold">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x, i) => (
                    <line
                      key={i}
                      x1={x}
                      y1={50 - [15, 25, 35, 20, 40, 18, 30, 22, 12][i]}
                      x2={x}
                      y2={50 + [15, 25, 35, 20, 40, 18, 30, 22, 12][i]}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY JOIN SECTION ============ */}
      <section className="bg-white border-y border-border-soft">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-charcoal mb-14 tracking-tight">
            Why Join Produc<span className="text-gold">er</span> Saab?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: HeadphonesIcon,
                title: 'Showcase Your Sound',
                desc: 'Upload your loops, melodies, MIDI, and samples.',
              },
              {
                icon: UsersIcon,
                title: 'Build Your Audience',
                desc: 'Gain followers and grow your producer profile.',
              },
              {
                icon: SparklesIcon,
                title: 'Discover Talent',
                desc: 'Find and connect with producers worldwide.',
              },
              {
                icon: HandshakeIcon,
                title: 'Collaborate & Grow',
                desc: 'Find collaborators, learn, and create opportunities.',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`text-center group animate-fade-in-up opacity-0 delay-${(i + 1) * 100}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cream-dark border border-border-soft mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-bold text-charcoal text-base mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRENDING SOUNDS ============ */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight flex items-center gap-2">
              <span className="text-xl">🔥</span> Trending Sounds
            </h2>
            <button
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-1 text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {trendingSounds.map((sound, i) => (
              <div
                key={sound.id}
                className={`group cursor-pointer animate-fade-in-up opacity-0 delay-${(i + 1) * 100}`}
                onClick={() => setShowDashboard(true)}
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
                  {/* Genre Badge */}
                  <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
                    {sound.genre}
                  </span>
                  {/* Duration Badge */}
                  <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                    {sound.duration}
                  </span>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                      <PlayIcon className="w-4 h-4 text-charcoal ml-0.5" />
                    </div>
                  </div>
                  {/* Waveform Strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center gap-[2px] pb-1.5 px-3">
                    {Array.from({ length: 20 }, (_, j) => (
                      <div
                        key={j}
                        className="w-[3px] bg-gold/80 rounded-full"
                        style={{ height: `${Math.random() * 14 + 4}px` }}
                      />
                    ))}
                  </div>
                </div>
                {/* Card Info */}
                <h3 className="font-semibold text-sm text-charcoal truncate">{sound.title}</h3>
                <p className="text-text-muted text-xs mt-0.5 flex items-center gap-1">
                  {sound.producer}
                  <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                </p>
                <div className="flex items-center gap-3 mt-2 text-text-muted text-[11px]">
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-3 h-3" /> {sound.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <DownloadIcon className="w-3 h-3" /> {sound.downloads}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCERS ============ */}
      <section className="bg-white border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight flex items-center gap-2">
              <span className="text-xl">⭐</span> Featured Producers
            </h2>
            <button className="flex items-center gap-1 text-sm font-semibold text-gold hover:text-gold-dark transition-colors">
              View all <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducers.map((producer, i) => (
              <div
                key={producer.name}
                className={`bg-cream rounded-2xl border border-border-soft p-6 text-center group hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 animate-fade-in-up opacity-0 delay-${(i + 1) * 100}`}
              >
                {/* Avatar */}
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${producer.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{producer.initial}</span>
                </div>
                <h3 className="font-bold text-charcoal text-base">{producer.name}</h3>
                <p className="text-text-muted text-xs mt-0.5 mb-4">{producer.role}</p>

                {/* Stats */}
                <div className="flex justify-center gap-6 mb-5">
                  <div>
                    <p className="font-bold text-charcoal text-sm">{producer.followers}</p>
                    <p className="text-text-muted text-[10px]">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold text-charcoal text-sm">{producer.uploads}</p>
                    <p className="text-text-muted text-[10px]">Uploads</p>
                  </div>
                </div>

                {/* Follow Button */}
                <button className="w-full bg-gold text-white font-semibold text-sm py-2.5 rounded-full hover:bg-gold-dark transition-colors duration-300">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="bg-charcoal text-cream">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to share your sound<span className="text-gold">?</span>
          </h2>
          <p className="text-cream/60 text-base max-w-lg mx-auto mb-8">
            Join thousands of producers uploading loops, building audiences, and collaborating across the globe.
          </p>
          <button
            onClick={() => setShowDashboard(true)}
            className="group inline-flex items-center gap-2 bg-gold text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/30"
          >
            Get Started — It&apos;s Free
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-cream border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WaveformIcon className="w-5 h-5 text-gold" />
              <span className="font-extrabold text-sm tracking-[0.15em] text-charcoal uppercase">
                Producer Saab
              </span>
            </div>
            <div className="flex items-center gap-6 text-text-muted text-xs">
              <a href="#" className="hover:text-charcoal transition-colors">About</a>
              <a href="#" className="hover:text-charcoal transition-colors">Terms</a>
              <a href="#" className="hover:text-charcoal transition-colors">Privacy</a>
              <a href="#" className="hover:text-charcoal transition-colors">Contact</a>
            </div>
            <p className="text-text-muted text-xs">
              © 2025 Producer Saab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
