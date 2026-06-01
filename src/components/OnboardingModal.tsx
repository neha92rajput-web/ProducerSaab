'use client';

import React, { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAW_OPTIONS = [
  'FL Studio',
  'Ableton Live',
  'Logic Pro',
  'Pro Tools',
  'Cubase',
  'Studio One',
  'GarageBand',
  'Other',
];

const PRODUCER_TYPES = [
  { id: 'beatmaker', label: 'Beatmaker', emoji: '🎹', desc: 'Trap, drill, hip-hop instrumentals' },
  { id: 'mixing', label: 'Mixing / Mastering', emoji: '🎚️', desc: 'Audio engineering & finishing' },
  { id: 'sounddesigner', label: 'Sound Designer', emoji: '🔊', desc: 'Samples, loops & sound packs' },
  { id: 'fullsong', label: 'Full Song Producer', emoji: '🎵', desc: 'Arrangements, composition & more' },
];

const GENRE_OPTIONS = [
  { id: 'hiphop', label: 'Hip Hop / Trap', emoji: '🔥' },
  { id: 'rnb', label: 'R&B', emoji: '🎷' },
  { id: 'edm', label: 'EDM', emoji: '⚡' },
  { id: 'pop', label: 'Pop', emoji: '🎵' },
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { id: 'lofi', label: 'Lo-Fi', emoji: '🎧' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      {/* Step 1 */}
      <div className="flex items-center gap-1.5">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
          current >= 1 ? 'bg-[#C5A880] text-white' : 'bg-[#F0EBE3] text-[#AAAAAA]'
        }`}>
          {current > 1 ? <CheckIcon className="w-3.5 h-3.5" /> : '1'}
        </div>
        <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${current === 1 ? 'text-[#C5A880]' : 'text-[#AAAAAA]'}`}>
          Account
        </span>
      </div>

      {/* Connector */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-colors duration-500 ${current === 2 ? 'bg-[#C5A880]' : 'bg-[#E8E2D9]'}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Step 2 */}
      <div className="flex items-center gap-1.5">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
          current === 2 ? 'bg-[#C5A880] text-white' : 'bg-[#F0EBE3] text-[#AAAAAA]'
        }`}>
          2
        </div>
        <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${current === 2 ? 'text-[#C5A880]' : 'text-[#AAAAAA]'}`}>
          Verify
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  React.useEffect(() => {
    if (isOpen) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.textContent?.toLowerCase().includes('log in')) {
        setIsLoginMode(true);
      } else {
        setIsLoginMode(false);
      }
    }
  }, [isOpen]);

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2 fields
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [daw, setDaw] = useState('');
  const [producerType, setProducerType] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [antiPiracy, setAntiPiracy] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your producer name (min 2 chars)';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters';
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    const urlPattern = /^https?:\/\/.+\..+/i;
    if (!portfolioUrl.trim() || !urlPattern.test(portfolioUrl.trim())) {
      errs.portfolio = 'Enter a valid SoundCloud, Spotify, or Beatstars link';
    }
    if (!daw) errs.daw = 'Please select your primary DAW';
    if (!producerType) errs.producerType = 'Select your producer type';
    if (selectedGenres.size === 0) errs.genres = 'Select at least one genre';
    if (!antiPiracy) errs.antiPiracy = 'You must agree to the anti-piracy terms';
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep2()) setSubmitted(true);
  }

  function toggleGenre(id: string) {
    setSelectedGenres(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleClose() {
    setStep(1);
    setName(''); setEmail(''); setPassword('');
    setPortfolioUrl(''); setDaw(''); setProducerType(''); setSocialHandle('');
    setSelectedGenres(new Set()); setAntiPiracy(false);
    setStep1Errors({}); setStep2Errors({}); setSubmitted(false);
    onClose();
  }

  if (!isOpen) return null;

  // ── Shared input style ───────────────────────────────────────────────────────
  const inputClass = (hasError: boolean) =>
    `w-full bg-[#FAF8F5] border rounded-xl px-4 py-2.5 text-sm text-[#111111] placeholder:text-[#AAAAAA] outline-none transition-all duration-200 ${
      hasError ? 'border-red-400 focus:border-red-400' : 'border-[#E8E2D9] focus:border-[#C5A880]'
    }`;

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl relative w-full overflow-hidden"
        style={{ maxWidth: step === 2 ? '480px' : '400px', transition: 'max-width 0.35s cubic-bezier(0.4,0,0.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F0EBE3] flex items-center justify-center text-[#777777] hover:bg-[#E8E2D9] hover:text-[#111111] transition-colors cursor-pointer text-xs font-bold"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* ════ SUCCESS STATE ════ */}
        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#C5A880] to-[#B8986E] flex items-center justify-center shadow-lg shadow-[#C5A880]/20">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-2">You&rsquo;re in!</h3>
            <p className="text-[#777777] text-sm leading-relaxed mb-6">
              Welcome to <span className="text-[#C5A880] font-bold">Producer Saab</span>. Your profile is under review — we&rsquo;ll email <span className="font-semibold text-[#111111]">{email}</span> once approved.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-[#111111] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Browse the Sound Library →
            </button>
          </div>
        ) : (
          <div className="p-7">
            {/* Logo + Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-tr from-[#C5A880] to-[#B8986E] flex items-center justify-center shadow-md shadow-[#C5A880]/20">
                <WaveformIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-[#111111] tracking-tight">
                {isLoginMode ? 'Welcome Back' : step === 1 ? 'Join Producer Saab' : 'Producer Verification'}
              </h3>
<p className="text-[#999999] text-xs mt-1">
            {step === 1
              ? isLoginMode ? "Sign in to access your profile." : "Create your free account in 2 steps."
              : "We only admit working producers. Prove your craft."}
          </p>
            </div>

            {/* Step Indicator */}
            {!isLoginMode && <StepIndicator current={step} />}

            {/* ════ STEP 1: Account Credentials ════ */}
           {step === 1 && (
              <form onSubmit={handleStep1Submit} noValidate className="space-y-3">
                {/* Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Producer name / alias"
                    value={name}
                    onChange={e => { setName(e.target.value); setStep1Errors(prev => ({ ...prev, name: '' })); }}
                    className={inputClass(!!step1Errors.name)}
                    autoComplete="name"
                  />
                  {step1Errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{step1Errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setStep1Errors(prev => ({ ...prev, email: '' })); }}
                    className={inputClass(!!step1Errors.email)}
                    autoComplete="email"
                  />
                  {step1Errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{step1Errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 8 characters)"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setStep1Errors(prev => ({ ...prev, password: '' })); }}
                      className={`${inputClass(!!step1Errors.password)} pr-10`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#777777] transition-colors cursor-pointer"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {step1Errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{step1Errors.password}</p>}
                  {/* Password strength mini bar */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map(lvl => {
                        const strength = password.length < 8 ? 1 : password.length < 12 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
                        return (
                          <div
                            key={lvl}
                            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                              lvl <= strength
                                ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-yellow-400' : strength <= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                                : 'bg-[#E8E2D9]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  className="w-full bg-[#111111] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#333333] active:scale-[0.98] transition-all duration-200 cursor-pointer mt-1"
                >
                  Continue — Verify Your Profile →
                </button>

                <p className="text-center text-[10px] text-[#AAAAAA] pt-1">
                  By continuing you agree to our{' '}
                  <a href="#" onClick={e => e.preventDefault()} className="text-[#C5A880] hover:underline">Terms</a>
                  {' & '}
                  <a href="#" onClick={e => e.preventDefault()} className="text-[#C5A880] hover:underline">Privacy Policy</a>.
                </p>
                <p className="text-center text-xs text-[#777777] pt-3">
  Already have an account?{' '}
                  {/* ════ LOGIN MODE VIEW ════ */}
            {isLoginMode && (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClass(false)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputClass(false)} pr-10`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#777777] transition-colors cursor-pointer"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#111111] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#333333] transition-all duration-200 cursor-pointer mt-1"
                >
                  Sign In →
                </button>

                <p className="text-center text-xs text-[#777777] pt-2">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsLoginMode(false)} className="text-[#C5A880] font-bold hover:underline cursor-pointer">
                    Sign Up
                  </button>
                </p>
              </form>
            )}
  <button type="button" onClick={() => setIsLoginMode(true)} className="text-[#C5A880] font-bold hover:underline cursor-pointer">
    Log in
  </button>
</p>
              </form>
            )}

            {/* ════ STEP 2: Producer Verification ════ */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} noValidate className="space-y-4">

                {/* Portfolio / Audio Proof */}
                <div>
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Portfolio / Audio Proof <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="SoundCloud, Spotify, or Beatstars link"
                    value={portfolioUrl}
                    onChange={e => { setPortfolioUrl(e.target.value); setStep2Errors(prev => ({ ...prev, portfolio: '' })); }}
                    className={inputClass(!!step2Errors.portfolio)}
                  />
                  {step2Errors.portfolio
                    ? <p className="text-red-500 text-[10px] mt-1 ml-1">{step2Errors.portfolio}</p>
                    : <p className="text-[#AAAAAA] text-[10px] mt-1 ml-1">e.g. soundcloud.com/yourname or open.spotify.com/artist/…</p>
                  }
                </div>

                {/* Primary DAW */}
                <div>
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Primary DAW <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={daw}
                    onChange={e => { setDaw(e.target.value); setStep2Errors(prev => ({ ...prev, daw: '' })); }}
                    className={`${inputClass(!!step2Errors.daw)} cursor-pointer appearance-none`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23AAAAAA' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
                  >
                    <option value="">Select your DAW…</option>
                    {DAW_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {step2Errors.daw && <p className="text-red-500 text-[10px] mt-1 ml-1">{step2Errors.daw}</p>}
                </div>

                {/* Producer Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-2">
                    Producer Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCER_TYPES.map(pt => {
                      const selected = producerType === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => { setProducerType(pt.id); setStep2Errors(prev => ({ ...prev, producerType: '' })); }}
                          className={`relative flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'bg-[#C5A880]/10 border-[#C5A880]'
                              : 'bg-[#FAF8F5] border-[#E8E2D9] hover:border-[#C5A880]/50'
                          }`}
                        >
                          {/* Selected indicator */}
                          {selected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C5A880] flex items-center justify-center">
                              <CheckIcon className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                          <span className="text-base leading-none mb-0.5">{pt.emoji}</span>
                          <span className={`text-xs font-bold leading-tight ${selected ? 'text-[#C5A880]' : 'text-[#111111]'}`}>
                            {pt.label}
                          </span>
                          <span className="text-[10px] text-[#AAAAAA] leading-tight">{pt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {step2Errors.producerType && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{step2Errors.producerType}</p>}
                </div>

                {/* Instagram / TikTok Handle */}
                <div>
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Instagram / TikTok Handle
                    <span className="ml-2 text-[#AAAAAA] normal-case font-medium tracking-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] text-sm font-semibold select-none">@</span>
                    <input
                      type="text"
                      placeholder="yourhandle"
                      value={socialHandle}
                      onChange={e => setSocialHandle(e.target.value.replace(/^@/, '').replace(/\s/g, ''))}
                      className={`${inputClass(false)} pl-8`}
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-[#AAAAAA] text-[10px] mt-1 ml-1">Helps producers showcase their studio setups &amp; cookup videos.</p>
                </div>

                {/* Primary Genres */}
                <div>
                  <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-2">
                    Primary Genres <span className="text-red-400">*</span>
                    <span className="ml-2 text-[#AAAAAA] normal-case font-medium tracking-normal">(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GENRE_OPTIONS.map(g => {
                      const selected = selectedGenres.has(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => { toggleGenre(g.id); setStep2Errors(prev => ({ ...prev, genres: '' })); }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                            selected
                              ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]'
                              : 'bg-[#FAF8F5] border-[#E8E2D9] text-[#555555] hover:border-[#C5A880]/60 hover:text-[#C5A880]'
                          }`}
                        >
                          <span className="shrink-0">{g.emoji}</span>
                          <span className="truncate">{g.label}</span>
                          {selected && (
                            <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-[#C5A880] flex items-center justify-center">
                              <CheckIcon className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {step2Errors.genres && <p className="text-red-500 text-[10px] mt-1.5 ml-1">{step2Errors.genres}</p>}
                </div>

                {/* Anti-Piracy Checkbox */}
                <div className={`rounded-xl border p-4 transition-colors duration-200 ${
                  step2Errors.antiPiracy ? 'border-red-400 bg-red-50/50' : antiPiracy ? 'border-[#C5A880]/40 bg-[#C5A880]/5' : 'border-[#E8E2D9] bg-[#FAF8F5]'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    {/* Custom checkbox */}
                    <div className="shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={antiPiracy}
                        onChange={e => { setAntiPiracy(e.target.checked); setStep2Errors(prev => ({ ...prev, antiPiracy: '' })); }}
                        className="sr-only"
                        id="antiPiracy"
                      />
                      <div
                        onClick={() => { setAntiPiracy(p => !p); setStep2Errors(prev => ({ ...prev, antiPiracy: '' })); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          antiPiracy ? 'bg-[#C5A880] border-[#C5A880]' : 'bg-white border-[#D4CFC6] group-hover:border-[#C5A880]'
                        }`}
                      >
                        {antiPiracy && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      <span className="font-bold text-[#111111]">Anti-Piracy Agreement</span> — I certify that all loops, samples, and audio ideas I upload are{' '}
                      <span className="font-semibold">100% original, created by me</span>, and do not infringe on any copyrights.{' '}
                      <span className="text-red-400 font-bold">*</span>
                    </p>
                  </label>
                  {step2Errors.antiPiracy && <p className="text-red-500 text-[10px] mt-2 ml-8">{step2Errors.antiPiracy}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-[#C5A880] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#B8986E] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#C5A880]/20"
                >
                  ✓ Complete Verification & Join
                </button>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[11px] text-[#AAAAAA] hover:text-[#777777] transition-colors cursor-pointer py-1 text-center"
                >
                  ← Back to account details
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
