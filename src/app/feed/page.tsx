'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CommunityFeedPage() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [activeFeedTab, setActiveFeedTab] = useState<'tracks' | 'briefs'>('tracks');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Data States
  const [globalSounds, setGlobalSounds] = useState<any[]>([]);
  const [globalBriefs, setGlobalBriefs] = useState<any[]>([]);

  // Single-player Focus Ref
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    async function loadFeedData() {
      try {
        // Check if user is logged in
        const { data: { user } } = await database.auth.getUser();
        if (user) setCurrentUser(user);

        // 1. Fetch Global Audio Tracks
        const { data: sounds } = await database
          .from('sounds')
          .select('*, profiles(username, account_type, country)')
          .order('created_at', { ascending: false });

        // 2. Fetch Global Project Briefs
        const { data: briefs } = await database
          .from('collaboration_opportunities')
          .select('*, profiles(username, account_type, primary_genre)')
          .order('created_at', { ascending: false });

        setGlobalSounds(sounds || []);
        setGlobalBriefs(briefs || []);
      } catch (err) {
        console.error("Failed to load global community data streams:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeedData();
  }, []);

  const handleAudioPlay = (currentSoundId: string) => {
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== currentSoundId && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
    });
  };

  const submitApplicationRequest = async (brief: any) => {
    if (!currentUser) {
      alert("Please sign in to your studio to apply for collaborations.");
      router.push('/signin');
      return;
    }

    if (currentUser.id === brief.creator_id) {
      return alert("This is your own project brief slot!");
    }

    const applicationPitch = prompt(`Write a message note to @${brief.profiles?.username} explaining your style or setup pitching for this session:`);
    if (applicationPitch === null) return; // cancelled
    if (!applicationPitch.trim()) return alert("A short message pitch statement is required to apply.");

    try {
      const { error } = await database.from('collaboration_requests').insert({
        sender_id: currentUser.id,
        receiver_id: brief.creator_id,
        sound_id: null, 
        message: applicationPitch,
        status: 'pending'
      });

      if (error) throw error;
      alert(`🚀 Application sent successfully to @${brief.profiles?.username}! Check your Studio's Sent Requests panel for updates.`);
    } catch (err: any) {
      alert("Application pipeline fault: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-gray-400 font-mono tracking-widest uppercase">
        Syncing Global Community Ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans antialiased selection:bg-[#E7DED3]">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#E3DEC1] px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-sans font-black tracking-[0.2em] text-sm uppercase">
            🎵 Producer Saab
          </Link>
          <div className="flex items-center gap-6 text-[13px] font-bold text-[#191919]">
            <Link href="/studio" className="hover:opacity-70">My Studio</Link>
            <Link href="/feed" className="opacity-40 pointer-events-none">Community Feed</Link>
          </div>
        </div>
      </header>

      {/* 2. COMMUNITY JUMBOTRON HEADER */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24 space-y-10">
        <div className="space-y-2 border-b border-[#E3DEC1] pb-6">
          <h1 className="text-4xl font-serif font-normal italic tracking-tight text-[#191919]">
            The Creator Ecosystem
          </h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Explore fresh audio variables or apply to active co-creation project briefs.
          </p>
        </div>

        {/* 🧭 NAVIGATION TABS SWITCHER */}
        <div className="flex gap-8 border-b border-[#E3DEC1] pb-px text-[11px] font-black uppercase tracking-widest">
          <button 
            onClick={() => setActiveFeedTab('tracks')} 
            className={`pb-3 border-b-2 transition-all ${activeFeedTab === 'tracks' ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}
          >
            🎵 Fresh Sounds Library ({globalSounds.length})
          </button>
          <button 
            onClick={() => setActiveFeedTab('briefs')} 
            className={`pb-3 border-b-2 transition-all ${activeFeedTab === 'briefs' ? 'text-[#191919] border-[#191919]' : 'text-[#A4927A] border-transparent'}`}
          >
            🎯 Open Project Briefs ({globalBriefs.length})
          </button>
        </div>

        {/* 📋 VIEW RENDER SWITCHER */}
        <div className="pt-2">
          
          {/* TAB 1: GLOBAL FRESH SOUNDS */}
          {activeFeedTab === 'tracks' && (
            <div className="grid gap-4">
              {globalSounds.length > 0 ? (
                globalSounds.map((sound) => (
                  <div key={sound.id} className="p-5 border border-[#E3DEC1] rounded-2xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                    <div className="space-y-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-[#191919]">{sound.title}</h4>
                        <span className="bg-[#E3DEC1] text-[#4B3B2F] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.instrument || 'Synth'}</span>
                        <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.genre || 'Trap'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                        By <span className="text-[#A4927A]">@{sound.profiles?.username || 'producer'}</span> • {sound.profiles?.country || 'Global'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium font-mono">BPM: {sound.bpm}  •  Key: {sound.key_signature}</div>
                      {sound.description && <p className="text-xs text-gray-400 font-medium italic max-w-xl pt-0.5">"{sound.description}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <audio 
                        controls 
                        src={sound.audio_url} 
                        className="h-8" 
                        ref={(el) => { audioRefs.current[sound.id] = el; }}
                        onPlay={() => handleAudioPlay(sound.id)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-semibold bg-white/40">
                  No public tracks or loops have been broadcasted to the feed channel yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE RECRUITING PROJECT BRIEFS */}
          {activeFeedTab === 'briefs' && (
            <div className="grid md:grid-cols-2 gap-4">
              {globalBriefs.length > 0 ? (
                globalBriefs.map((brief) => (
                  <div key={brief.id} className="p-5 border border-[#E3DEC1] rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-4 animate-fadeIn">
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[9px] bg-[#191919] text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Looking For: {brief.role_needed}
                        </span>
                        <span className="text-[10px] text-[#A4927A] font-bold">
                          @{brief.profiles?.username}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-black tracking-tight leading-tight">{brief.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-gray-400 font-bold uppercase">
                          <div>Genre: {brief.genre}</div>
                          <div>Tempo: {brief.bpm} BPM</div>
                          <div>Key: {brief.musical_key}</div>
                        </div>
                      </div>

                      {brief.message && (
                        <p className="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                          "{brief.message}"
                        </p>
                      )}
                    </div>

                    {/* INTERACTIVE PIPELINE ACTION BUTTON */}
                    <button 
                      onClick={() => submitApplicationRequest(brief)}
                      className="w-full py-2.5 bg-[#191919] hover:bg-[#4B3B2F] text-white transition rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Apply for Session Room →
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-semibold bg-white/40 col-span-2">
                  No active production role requests posted on the network yet.
                </div>
              )}
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
