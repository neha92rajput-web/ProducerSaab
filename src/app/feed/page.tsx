'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import NotificationCenter from '@/components/NotificationCenter';

export default function CommunityFeedPage() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [activeFeedTab, setActiveFeedTab] = useState<'tracks' | 'briefs'>('tracks');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myProfileId, setMyProfileId] = useState<string>('');
  
  const [followedArtists, setFollowedArtists] = useState<{ [key: string]: boolean }>({});
  const [globalSounds, setGlobalSounds] = useState<any[]>([]);
  const [globalBriefs, setGlobalBriefs] = useState<any[]>([]);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const loadFeedData = async () => {
    try {
      const { data: { user } } = await database.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setMyProfileId(user.id);
      }

      // Query standard track rows
      const { data: sounds } = await database
        .from('sounds')
        .select('*, profiles(id, username, account_type, country)')
        .in('category', ['Loops / Tracks', 'Collaboration'])
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false });

      // Query live open collaboration posts globally from table database 
      const { data: briefs } = await database
        .from('collaboration_opportunities')
        .select('*, profiles(id, username, account_type, primary_genre)')
        .eq('status', 'open')
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

  const handleDownloadAudio = async (audioUrl: string, trackTitle: string) => {
    if (!audioUrl) return alert("Audio path missing.");
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
    } catch (err) {
      window.open(audioUrl, '_blank');
    }
  };

  const handleFollowArtist = async (artistId: string, artistUsername: string) => {
    if (!myProfileId) {
      alert("Please sign in to follow creators.");
      router.push('/signin');
      return;
    }
    if (myProfileId === artistId) return alert("This is your own profile!");

    if (followedArtists[artistId]) {
      setFollowedArtists(prev => ({ ...prev, [artistId]: false }));
      return;
    }

    try {
      await database.from('notifications').insert({
        receiver_id: artistId,
        sender_id: myProfileId,
        type: 'follow',
        message: 'started following your studio profile portfolio.',
        is_read: false
      });
      setFollowedArtists(prev => ({ ...prev, [artistId]: true }));
      alert(`👤 Following @${artistUsername}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackCollabRequest = async (sound: any) => {
    if (!myProfileId) {
      alert("Please sign in to send requests.");
      router.push('/signin');
      return;
    }
    if (myProfileId === sound.profile_id) return alert("This track belongs to your profile workspace!");

    const messagePitch = prompt(`Send a request note to @${sound.profiles?.username} for collaborating on "${sound.title}":`);
    if (messagePitch === null) return;
    if (!messagePitch.trim()) return alert("A pitch message is required.");

    try {
      const { error } = await database.from('collaboration_requests').insert({
        sender_id: myProfileId,
        receiver_id: sound.profile_id,
        sound_id: sound.id,
        message: messagePitch,
        status: 'pending'
      });

      if (error) throw error;

      await database.from('notifications').insert({
        receiver_id: sound.profile_id,
        sender_id: myProfileId,
        type: 'collaboration',
        message: `requested a session connection on your track: "${sound.title}"`,
        is_read: false
      });

      alert(`🚀 Request dispatched straight to @${sound.profiles?.username}'s mailbox!`);
      loadFeedData();
    } catch (err: any) {
      alert("Routing network exception: " + err.message);
    }
  };

  const submitApplicationRequest = async (brief: any) => {
    if (!myProfileId) {
      alert("Please sign in to apply.");
      router.push('/signin');
      return;
    }
    if (myProfileId === brief.creator_id) return alert("This is your own project brief!");

    const applicationPitch = prompt(`Write a message note pitching to @${brief.profiles?.username}:`);
    if (applicationPitch === null) return;
    if (!applicationPitch.trim()) return alert("A short message pitch is required.");

    try {
      await database.from('collaboration_requests').insert({
        sender_id: myProfileId,
        receiver_id: brief.creator_id,
        sound_id: null, 
        message: applicationPitch,
        status: 'pending'
      });

      await database.from('notifications').insert({
        receiver_id: brief.creator_id,
        sender_id: myProfileId,
        type: 'collaboration',
        message: `applied to your active brief looking for: "${brief.role_needed}"`,
        is_read: false
      });

      alert(`🚀 Application sent successfully!`);
      loadFeedData();
    } catch (err: any) {
      alert("Application pipeline fault: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans antialiased">
      
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#E3DEC1] px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-sans font-black tracking-[0.2em] text-sm uppercase">🎵 PRODUCER SAAB</Link>
          <div className="flex items-center gap-6 text-[13px] font-bold text-[#191919]">
            <Link href="/studio" className="hover:opacity-70">My Studio</Link>
            <Link href="/feed" className="opacity-40 pointer-events-none">Community Feed</Link>
            {myProfileId && <NotificationCenter profileId={myProfileId} />}
          </div>
        </div>
      </header>

      {/* JUMBOTRON LAYOUT BLOCK */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24 space-y-10">
        <div className="space-y-2 border-b border-[#E3DEC1] pb-6 text-left">
          <h1 className="text-4xl font-serif font-normal italic tracking-tight text-[#191919]">The Creator Ecosystem</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Explore variables, download master audio structures, or connect directly on specific tracks.</p>
        </div>

        {/* 🎯 FIXED TAB SELECTORS: Fully re-named to Collaboration Post */}
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
            🎯 Collaboration Post ({globalBriefs.length})
          </button>
        </div>

        <div className="pt-2">
          {/* TRACKS LIST TAB */}
          {activeFeedTab === 'tracks' && (
            <div className="grid gap-4">
              {globalSounds.length > 0 ? (
                globalSounds.map((sound) => (
                  <div key={sound.id} className="p-6 border border-[#E3DEC1] rounded-[1.75rem] bg-white flex flex-col justify-between gap-4 shadow-sm text-left animate-fadeIn">
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
                          <span className="bg-gray-50 text-[10px] px-2 py-px rounded border border-gray-100 font-bold uppercase text-gray-400">{sound.profiles?.account_type || 'Producer'}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold font-mono pt-0.5">Tempo: {sound.bpm} BPM &nbsp;•&nbsp; Key: {sound.key_signature}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleFollowArtist(sound.profiles?.id, sound.profiles?.username)}
                          className={`px-3 py-1.5 border border-[#E3DEC1] rounded-xl text-[10px] font-black uppercase tracking-wider transition ${followedArtists[sound.profiles?.id] ? 'bg-black text-white border-black' : 'text-gray-600 hover:text-black hover:border-black'}`}
                        >
                          {followedArtists[sound.profiles?.id] ? '✓ Following' : '👤 Follow'}
                        </button>
                        <button onClick={() => handleTrackCollabRequest(sound)} className="px-3 py-1.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#4B3B2F] transition">🤝 Collab</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-3 mt-1">
                      <audio controls src={sound.audio_url} className="h-8 flex-grow max-w-xl" ref={(el) => { audioRefs.current[sound.id] = el; }} onPlay={() => handleAudioPlay(sound.id)} />
                      <button onClick={() => handleDownloadAudio(sound.audio_url, sound.title)} className="p-2 border border-[#E3DEC1] rounded-xl text-xs hover:bg-gray-50 font-bold text-[#4B3B2F] transition shrink-0">📥 Download</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-semibold bg-white/40">No public tracks found.</div>
              )}
            </div>
          )}

          {/* COLLABORATION POSTS TAB */}
          {activeFeedTab === 'briefs' && (
            <div className="grid md:grid-cols-2 gap-4">
              {globalBriefs.length > 0 ? (
                globalBriefs.map((brief) => {
                  const formattedDate = brief.created_at ? new Date(brief.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  
                  return (
                    <div key={brief.id} className="p-5 border border-[#E3DEC1] rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-4 text-left animate-fadeIn">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="text-[9px] bg-[#191919] text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Looking For: {brief.role_needed}</span>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">{formattedDate}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-black tracking-tight leading-tight">{brief.title}</h3>
                          <div className="text-[10px] text-[#A4927A] font-bold">Posted by @{brief.profiles?.username}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-gray-400 font-bold uppercase pt-1">
                            <div>Genre: {brief.genre}</div>
                            <div>Tempo: {brief.bpm} BPM</div>
                            <div>Key: {brief.musical_key}</div>
                          </div>
                        </div>

                        {brief.message && <p className="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 italic">"{brief.message}"</p>}
                      </div>
                      <button onClick={() => submitApplicationRequest(brief)} className="w-full py-2.5 bg-[#191919] hover:bg-[#4B3B2F] text-white transition rounded-xl text-[10px] font-black uppercase tracking-widest">Apply for Session Room →</button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-12 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-semibold bg-white/40 col-span-2">No active collaboration posts distributed yet.</div>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
