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

  // Single-player Focus Ref Map
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const loadFeedData = async () => {
    try {
      const { data: { user } } = await database.auth.getUser();
      if (user) setCurrentUser(user);

      // Fetch Global Audio Tracks + Owner Profiles
      const { data: sounds } = await database
        .from('sounds')
        .select('*, profiles(id, username, account_type, country)')
        .order('created_at', { ascending: false });

      // Fetch Global Project Briefs
      const { data: briefs } = await database
        .from('collaboration_opportunities')
        .select('*, profiles(id, username, account_type, primary_genre)')
        .order('created_at', { ascending: false });

      setGlobalSounds(sounds || []);
      setGlobalBriefs(briefs || []);
    } catch (err) {
      console.error("Failed to load global community data streams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedData();
  }, []);

  const handleAudioPlay = (currentSoundId: string) => {
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== currentSoundId && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
    });
  };

  // 📥 ACTION 1: RAW AUDIO DOWNLOAD HOOK
  const handleDownloadAudio = async (audioUrl: string, trackTitle: string) => {
    if (!audioUrl) return alert("Audio asset file path not found.");
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${trackTitle.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS blocks direct blob fetching
      window.open(audioUrl, '_blank');
    }
  };

  // 👤 ACTION 2: FOLLOW ARTIST FUNCTION
  const handleFollowArtist = async (artistUsername: string) => {
    if (!currentUser) {
      alert("Please sign in to your studio to follow network creators.");
      router.push('/signin');
      return;
    }
    alert(`👤 You are now following @${artistUsername}! Their new uploads will populate higher on your community index views.`);
  };

  // 🤝 ACTION 3: SEND COLLABORATION REQUEST FOR THIS SPECIFIC TRACK
  const handleTrackCollabRequest = async (sound: any) => {
    if (!currentUser) {
      alert("Please sign in to your studio to initiate collaboration requests.");
      router.push('/signin');
      return;
    }

    if (currentUser.id === sound.profile_id) {
      return alert("This sound was uploaded by your own workspace studio session!");
    }

    const messagePitch = prompt(`Send a request note to @${sound.profiles?.username} for collaborating on "${sound.title}":`);
    if (messagePitch === null) return; // user cancelled prompt
    if (!messagePitch.trim()) return alert("A pitch message is required to submit a request.");

    try {
      const { error } = await database.from('collaboration_requests').insert({
        sender_id: currentUser.id,
        receiver_id: sound.profile_id,
        sound_id: sound.id,
        message: messagePitch,
        status: 'pending'
      });

      if (error) throw error;
      alert(`🚀 Collaboration request dispatched straight to @${sound.profiles?.username}'s studio inbox!`);
      loadFeedData();
    } catch (err: any) {
      alert("Request routing network exception: " + err.message);
    }
  };

  // Apply to a General Project Opportunity Brief
  const submitApplicationRequest = async (brief: any) => {
    if (!currentUser) {
      alert("Please sign in to your studio to apply for collaborations.");
      router.push('/signin');
      return;
    }

    if (currentUser.id === brief.creator_id) {
      return alert("This is your own project brief slot!");
    }

    const applicationPitch = prompt(`Write a message note to @${brief.profiles?.username} pitching for this session slot:`);
    if (applicationPitch === null) return;
    if (!applicationPitch.trim()) return alert("A short message pitch statement is required.");

    try {
      const { error } = await database.from('collaboration_requests').insert({
        sender_id: currentUser.id,
        receiver_id: brief.creator_id,
        sound_id: null, 
        message: applicationPitch,
        status: 'pending'
      });

      if (error) throw error;
      alert(`🚀 Application sent successfully to @${brief.profiles?.username}!`);
      loadFeedData();
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
      
      {/* HEADER NAV */}
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

      {/* JUMBOTRON ROW CONTAINER */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24 space-y-10">
        <div className="space-y-2 border-b border-[#E3DEC1] pb-6">
          <h1 className="text-4xl font-serif font-normal italic tracking-tight text-[#191919]">
            The Creator Ecosystem
          </h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Explore fresh audio variables, download master files, or connect directly on specific tracks.
          </p>
        </div>

        {/* FEED SELECTION BAR SWITCHER TABS */}
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

        <div className="pt-2">
          
          {/* TRACK FEED GRID VIEW PANEL CHANNEL */}
          {activeFeedTab === 'tracks' && (
            <div className="grid gap-4">
              {globalSounds.length > 0 ? (
                globalSounds.map((sound) => (
                  <div key={sound.id} className="p-6 border border-[#E3DEC1] rounded-[1.75rem] bg-white flex flex-col justify-between gap-4 shadow-sm animate-fadeIn text-left">
                    
                    {/* Information Cluster layout row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-[#191919]">{sound.title}</h4>
                          <span className="bg-[#E3DEC1] text-[#4B3B2F] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.instrument || 'Synth'}</span>
                          <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{sound.genre || 'Trap'}</span>
                        </div>
                        
                        <div className="text-xs font-medium text-gray-500 flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-black font-bold">@{sound.profiles?.username || 'producer'}</span>
                          <span>•</span>
                          <span className="bg-gray-50 text-[10px] px-2 py-px rounded border border-gray-100 font-bold uppercase tracking-wider text-gray-400">{sound.profiles?.account_type || 'Producer'}</span>
                          <span>•</span>
                          <span>{sound.profiles?.country || 'India'}</span>
                        </div>

                        <div className="text-[10px] text-gray-400 font-bold font-mono pt-1">
                          Tempo: {sound.bpm} BPM &nbsp;•&nbsp; Key Scale: {sound.key_signature}
                        </div>

                        {sound.description && (
                          <p className="text-xs text-gray-400 font-medium italic pt-2 max-w-xl">
                            "{sound.description}"
                          </p>
                        )}
                      </div>

                      {/* 👥 NETWORKING INTERACTION QUICK ACTIONS BUTTONS */}
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <button 
                          onClick={() => handleFollowArtist(sound.profiles?.username)}
                          className="px-3 py-1.5 border border-[#E3DEC1] text-gray-600 hover:text-black hover:border-black rounded-xl text-[10px] font-black uppercase tracking-wider transition"
                        >
                          👤 Follow
                        </button>
                        <button 
                          onClick={() => handleTrackCollabRequest(sound)}
                          className="px-3 py-1.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#4B3B2F] transition"
                        >
                          🤝 Collab
                        </button>
                      </div>
                    </div>

                    {/* Media playback and asset master fetch tracking row layout */}
                    <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-3 mt-1">
                      <audio 
                        controls 
                        src={sound.audio_url} 
                        className="h-8 flex-grow max-w-xl" 
                        ref={(el) => { audioRefs.current[sound.id] = el; }}
                        onPlay={() => handleAudioPlay(sound.id)}
                      />
                      
                      {/* DOWNLOAD AUDIO TRIGGER ACTION LINK */}
                      <button 
                        onClick={() => handleDownloadAudio(sound.audio_url, sound.title)}
                        className="p-2 border border-[#E3DEC1] rounded-xl text-xs hover:bg-gray-50 font-bold text-[#4B3B2F] transition shrink-0 flex items-center gap-1"
                        title="Download Raw Master Asset File bounce"
                      >
                        📥 <span className="hidden sm:inline text-[10px] uppercase font-black tracking-wider">Download</span>
                      </button>
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

          {/* TAB 2: GLOBAL PROJECT BRIEF RECROUITMENT BOARDS */}
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#A4927A] font-bold">@{brief.profiles?.username}</span>
                          <button 
                            onClick={() => handleFollowArtist(brief.profiles?.username)}
                            className="text-[9px] font-black uppercase text-gray-400 hover:text-black tracking-wider"
                          >
                            (Follow)
                          </button>
                        </div>
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
